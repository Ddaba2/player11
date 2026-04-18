import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Eye, EyeOff, CheckCircle, BadgeCheck } from 'lucide-react';
import Player11Logo from '../components/Logo';

interface RegisterProps {
  onNavigate: (page: string) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const { signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(fullName, username, password);
    if (error) {
      setError(error.message || 'Erreur lors de l\'inscription.');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Compte créé !</h2>
            <p className="text-slate-400 mb-6">Tu peux maintenant te connecter et créer ton CV Player11.</p>
            <button
              onClick={() => onNavigate('login')}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-transparent rounded-2xl mb-4 shadow-lg shadow-red-600/30">
            <Player11Logo width={48} height={48} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">PLAYER11</h1>
          <p className="text-slate-400 mt-1">Crée ton profil d'athlète</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Créer un compte</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 rounded-xl px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom d'utilisateur *</label>
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
              <p className="text-slate-500 text-xs mt-1.5">3–20 caractères, lettres/chiffres et . _ -</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nom complet *</label>
              <div className="relative">
                <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  placeholder="Ex: Daba Diallo"
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition"
                />
              </div>
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
                  placeholder="Min. 6 caractères"
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:-translate-y-0.5 mt-2"
            >
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-slate-400 mt-6 text-sm">
            Déjà un compte ?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-red-400 hover:text-red-300 font-semibold transition"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
