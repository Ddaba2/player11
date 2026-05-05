import { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (fullName: string, username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Erreur critique lors de l\'initialisation de l\'auth:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Changement d\'état d\'authentification:', event, session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Si l'utilisateur est déconnecté, nettoyer les données
      if (!session) {
        console.log('Utilisateur déconnecté');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const normalizeUsername = (v: string) => v.trim().toLowerCase();

  // We use a deterministic email to keep Supabase Auth happy (email/password),
  // while allowing the UI to login with username/password.
  // Use a real top-level domain so Supabase accepts the generated address.
  const usernameToEmail = (username: string) => `${normalizeUsername(username)}@cvfoot.app`;

  const signIn = async (username: string, password: string) => {
    const email = usernameToEmail(username);
    console.log('🔐 Tentative de connexion:', email);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
      return { error };
    }
    
    // L'état sera mis à jour automatiquement par onAuthStateChange
    // Pas besoin de forcer la mise à jour ici pour éviter les conflits
    console.log('✅ Connexion en cours, attente de la confirmation...');
    
    return { error: null };
  };

  const signUp = async (fullName: string, username: string, password: string) => {
    const n = fullName.trim();
    if (!n) return { error: new Error('Nom complet requis.') };
    const u = normalizeUsername(username);
    if (!u) return { error: new Error("Nom d'utilisateur requis.") };
    if (!/^[a-z0-9._-]{3,20}$/.test(u)) {
      return { error: new Error("Nom d'utilisateur invalide (3–20, lettres/chiffres/._-).") };
    }
    const email = usernameToEmail(u);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };

    // Create profile row (username uniqueness is enforced by DB constraint)
    const userId = data.user?.id;
    if (userId) {
      const { error: profileErr } = await supabase.from('profiles').insert({
        user_id: userId,
        username: u,
        display_name: n,
      });
      if (profileErr) {
        // surface helpful message for common case: username already taken
        if ((profileErr.message ?? '').toLowerCase().includes('duplicate') || profileErr.code === '23505') {
          return { error: new Error("Ce nom d'utilisateur est déjà utilisé.") };
        }
        return { error: new Error(profileErr.message) };
      }
    }

    // Force login after signup: user must authenticate manually with username+password.
    await supabase.auth.signOut();

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
