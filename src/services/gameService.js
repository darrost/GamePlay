import { supabase } from '../lib/supabaseClient';
import { toGamePayload } from '../utils/gameValidation';

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
