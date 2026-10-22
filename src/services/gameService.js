import { attachGameRatings } from './gameRatingService';
import { supabase } from '../lib/supabaseClient';
import { toGamePayload } from '../utils/gameValidation';
import { isValidGameId } from '../utils/gamePresentation';

export async function createGame(values) {
    const { data, error } = await supabase
        .from('games')
        .insert(toGamePayload(values))
        .select('id, title')
        .single();

    if (error) throw error;
    if (!data) throw new Error('The game could not be saved. Please try again.');

    return data;
}

export async function getGames({ signal } = {}) {
    const { data, error } = await supabase
        .from('games')
        .select('id, title, image_url, genre, platforms, release_date')
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .abortSignal(signal);

    if (error) throw error;
    return attachGameRatings(data ?? [], { signal });
}

export async function getGame(gameId, { signal } = {}) {
    if (!isValidGameId(gameId)) return null;

    const { data, error } = await supabase
        .from('games')
        .select('id, title, description, image_url, genre, platforms, release_date, owner_id, created_at')
        .eq('id', gameId)
        .abortSignal(signal)
        .maybeSingle();

    if (error) throw error;
    return data;
}

export async function updateGame(gameId, values, ownerId) {
    if (!isValidGameId(gameId) || !isValidGameId(ownerId)) {
        throw new Error('The game could not be updated. Check the game address and your session.');
    }

    const { data, error } = await supabase
        .from('games')
        .update(toGamePayload(values))
        .eq('id', gameId)
        .eq('owner_id', ownerId)
        .select('id, title')
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('The game was not updated. It may have been removed, or you no longer have permission to edit it.');
    return data;
}

export async function deleteGame(gameId, ownerId) {
    if (!isValidGameId(gameId) || !isValidGameId(ownerId)) {
        throw new Error('The game could not be deleted. Check the game address and your session.');
    }

    const { data, error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)
        .eq('owner_id', ownerId)
        .select('id')
        .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('No game was deleted. It may have been removed, or you no longer have permission to delete it.');
    return data;
}
