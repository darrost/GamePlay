import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from './AuthContext';

export default function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        let authChanged = false;
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, nextSession) => {
                if (!isMounted) return;

                if (event !== 'INITIAL_SESSION') authChanged = true;
                setSession(nextSession);
                setError(null);
                setIsLoading(false);
            },
        );
        async function loadSession() {
            try {
                const { data, error: sessionError } = await supabase.auth.getSession();
                if (!isMounted || authChanged) return;
                if (sessionError) throw sessionError;

                setSession(data.session);
                setError(null);
            } catch {
                if (!isMounted || authChanged) return;
                setSession(null);
                setError('We could not restore your session. Please reload to try again.');
            } finally {
                if (isMounted && !authChanged) setIsLoading(false);
            }
        }

        loadSession();
        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const value = useMemo(() => ({
        session,
        user: session?.user ?? null,
        isLoading,
        error,
    }), [session, isLoading, error]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
