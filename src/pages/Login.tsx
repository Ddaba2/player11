import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff, Link2 } from 'lucide-react';
import Player11Logo from '../components/Logo';

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPublicLink, setHasPublicLink] = useState(false);

  // Détecter si un lien public est présent
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cv = params.get('cv');
    const slug = params.get('slug');
    if (cv || slug) {
      setHasPublicLink(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(username, password);
    if (error) {
      setError("Nom d'utilisateur ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-transparent rounded-2xl mb-4 shadow-lg shadow-red-600/30">
            <Player11Logo width={48} height={48} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">PLAYER11</h1>
          <p className="text-slate-400 mt-1">Ton profil d'athlète professionnel</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Connexion</h2>

          {/* Message si lien public détecté */}
          {hasPublicLink && (
            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-300 rounded-xl px-4 py-3 mb-5 text-sm">
              <div className="flex items-start gap-3">
                <Link2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">CV partagé détecté</p>
                  <p className="opacity-90">
                    Connectez-vous pour consulter ce CV sportif. Si vous n'avez pas de compte, 
                    <button
                      onClick={() => onNavigate('register')}
                      className="text-blue-200 underline hover:text-blue-100 ml-1"
                    >
                      créez-en un gratuitement
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom d'utilisateur</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="ex: dabadiallo"
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition"
                />
              </div>
              <p className="text-slate-500 text-xs mt-1.5">Connexion avec nom d’utilisateur + mot de passe</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:-translate-y-0.5 mt-2"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Pas encore de compte ?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-red-400 hover:text-red-300 font-semibold transition"
            >
              S'inscrire
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
