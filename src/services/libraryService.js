import { attachGameRatings } from './gameRatingService';
import { supabase } from '../lib/supabaseClient';
import { isValidGameId } from '../utils/gamePresentation';

function requireLibraryIds(userId, gameId) {
    if (!isValidGameId(userId) || (gameId !== undefined && !isValidGameId(gameId))) {
        throw new Error('Check your session and the game address, then try again.');
    }
}

export async function getLibrary(userId, { signal } = {}) {
    requireLibraryIds(userId);
    const { data, error } = await supabase
        .from('library_entries')
        .select('game_id, saved_at, game:games(id, title, image_url, genre, platforms, release_date)')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false })
        .order('game_id', { ascending: true })
        .abortSignal(signal);

    if (error) throw error;
    const entries = (data ?? []).filter((entry) => entry.game !== null);
    const games = await attachGameRatings(entries.map((entry) => entry.game), { signal });
    return entries.map((entry, index) => ({ ...entry, game: games[index] }));
}

export async function isGameSaved(gameId, userId, { signal } = {}) {
    requireLibraryIds(userId, gameId);
    const { data, error } = await supabase
        .from('library_entries')
        .select('game_id')
        .eq('user_id', userId)
        .eq('game_id', gameId)
        .abortSignal(signal)
        .maybeSingle();

    if (error) throw error;
    return Boolean(data);
}

export async function saveToLibrary(gameId, userId) {
    requireLibraryIds(userId, gameId);
    const { data, error } = await supabase
        .from('library_entries')
        .insert({ game_id: gameId })
        .select('game_id')
        .single();

    if (error?.code === '23505') return;
    if (error) throw error;
    if (!data) throw new Error('The game could not be saved to your library.');
}

export async function removeFromLibrary(gameId, userId) {
    requireLibraryIds(userId, gameId);
    const { error } = await supabase
        .from('library_entries')
        .delete()
        .eq('user_id', userId)
        .eq('game_id', gameId);

    if (error) throw error;
}
