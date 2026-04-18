import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { SportCV } from '../types/cv';
import { Plus, Trophy, LogOut, Eye, CreditCard as Edit3, Trash2, User, Bell } from 'lucide-react';
import Player11Logo from '../components/Logo';

interface DashboardProps {
  onNavigate: (page: string, cvId?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [cvs, setCvs] = useState<SportCV[]>([]);
  const [viewEvents, setViewEvents] = useState<Array<{ id: string; cv_id: string; viewed_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchCVs();
    fetchViewEvents();
  }, []);

  const fetchCVs = async () => {
    const { data } = await supabase
      .from('sport_cvs')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setCvs(data ?? []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce CV ?')) return;
    setDeleting(id);
    await supabase.from('sport_cvs').delete().eq('id', id);
    setCvs(prev => prev.filter(cv => cv.id !== id));
    setDeleting(null);
  };

  const fetchViewEvents = async () => {
    const { data } = await supabase
      .from('cv_view_events')
      .select('id,cv_id,viewed_at')
      .eq('owner_user_id', user!.id)
      .order('viewed_at', { ascending: false })
      .limit(10);
    setViewEvents(data ?? []);
  };

  const getSportEmoji = (sport: string) => {
    const map: Record<string, string> = {
      Football: '⚽', Basketball: '🏀', Tennis: '🎾', Rugby: '🏉',
      Natation: '🏊', Athlétisme: '🏃', Handball: '🤾', Volleyball: '🏐',
      Cyclisme: '🚴', Boxe: '🥊', Judo: '🥋', Karaté: '🥋',
      Ski: '⛷️', Gymnastique: '🤸', Triathlon: '🏊', MMA: '🥊',
    };
    return map[sport] || '🏆';
  };

  const calcAge = (dob: string | null) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const displayUsername = user?.email?.endsWith('@cvfoot.local') || user?.email?.endsWith('@cvfoot.app')
    ? user.email.split('@')[0]
    : user?.email;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Player11Logo width={34} height={34} />
            </div>
            <span className="text-white font-black text-xl tracking-tight">PLAYER11</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm">
              <User className="w-4 h-4" />
              <span>{displayUsername}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm bg-slate-800/70 border border-slate-700/60 px-3 py-2 rounded-lg">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>{viewEvents.length} vue{viewEvents.length > 1 ? 's' : ''} récente{viewEvents.length > 1 ? 's' : ''}</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition px-3 py-2 rounded-lg hover:bg-slate-700/50 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Mes CV Player11</h1>
            <p className="text-slate-400 mt-1">{cvs.length} profil{cvs.length !== 1 ? 's' : ''} créé{cvs.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => onNavigate('editor')}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Nouveau CV</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800/60 rounded-2xl mb-4 border border-slate-700/50">
              <Trophy className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Aucun CV pour l'instant</h2>
            <p className="text-slate-400 mb-6">Crée ton premier profil d'athlète professionnel</p>
            <button
              onClick={() => onNavigate('editor')}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-red-600/30"
            >
              <Plus className="w-5 h-5" />
              Créer mon CV
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cvs.map(cv => (
              <div
                key={cv.id}
                className="group bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-slate-600/80 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/50"
              >
                <div className="relative h-24 bg-gradient-to-br from-red-700 via-red-600 to-rose-800 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCwxMDAgTDEwMCwwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTAsMCA1MCwxMDAgMTAwLDUwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] opacity-60" />
                  <div className="absolute bottom-3 left-4 text-4xl">{getSportEmoji(cv.sport)}</div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/30 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                      {cv.sport || 'Sport'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-bold text-lg leading-tight truncate">
                    {cv.full_name || 'Nom complet'}
                  </h3>
                  <p className="text-slate-400 text-sm mt-0.5">{cv.position || 'Poste'}{cv.current_club ? ` · ${cv.current_club}` : ''}</p>

                  <div className="flex gap-2 mt-3 text-xs">
                    {cv.nationality && (
                      <span className="bg-slate-700/60 text-slate-300 px-2 py-1 rounded-lg">{cv.nationality}</span>
                    )}
                    {cv.date_of_birth && (
                      <span className="bg-slate-700/60 text-slate-300 px-2 py-1 rounded-lg">{calcAge(cv.date_of_birth)} ans</span>
                    )}
                    {cv.height && (
                      <span className="bg-slate-700/60 text-slate-300 px-2 py-1 rounded-lg">{cv.height}cm</span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                    <button
                      onClick={() => onNavigate('view', cv.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700/60 hover:bg-slate-700 text-white text-sm font-medium py-2 rounded-lg transition"
                    >
                      <Eye className="w-4 h-4" />
                      Voir
                    </button>
                    <button
                      onClick={() => onNavigate('editor', cv.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700/60 hover:bg-slate-700 text-white text-sm font-medium py-2 rounded-lg transition"
                    >
                      <Edit3 className="w-4 h-4" />
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete(cv.id)}
                      disabled={deleting === cv.id}
                      className="flex items-center justify-center w-9 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewEvents.length > 0 && (
          <div className="mt-8 bg-slate-800/50 border border-slate-700/60 rounded-2xl p-5">
            <h2 className="text-white font-bold flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-amber-400" /> Notifications de vues
            </h2>
            <div className="space-y-2">
              {viewEvents.slice(0, 5).map(event => (
                <div key={event.id} className="text-sm text-slate-300 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/50">
                  Quelqu'un a ouvert ton lien CV le {new Date(event.viewed_at).toLocaleString('fr-FR')}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
