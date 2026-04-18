import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { SportCV, CareerEntry, Achievement, Skill, VideoLink, ActionPhoto } from '../types/cv';
import { SPORTS } from '../types/cv';
import {
  ArrowLeft, Save, Plus, Trash2, ChevronDown, Trophy,
  User, Activity, Briefcase, Star, Zap, Phone, Image, Film, BarChart2, Link2,
} from 'lucide-react';
import Player11Logo from '../components/Logo';

const MAX_IMAGE_MB = 2.5;

async function fileToDataUrl(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`Image trop lourde (maximum ${MAX_IMAGE_MB} Mo).`);
  }
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error('Lecture du fichier impossible'));
    r.readAsDataURL(file);
  });
}

interface CVEditorProps {
  cvId?: string;
  onNavigate: (page: string, cvId?: string) => void;
}

const emptyCV: Omit<SportCV, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  full_name: '',
  sport: '',
  position: '',
  nationality: '',
  date_of_birth: null,
  photo_url: null,
  height: null,
  weight: null,
  dominant_side: 'Droit',
  email: '',
  phone: '',
  address: '',
  instagram: '',
  twitter: '',
  current_club: '',
  bio: '',
  career: [],
  achievements: [],
  skills: [],
  matches_played: 0,
  goals: 0,
  assists: 0,
  avg_rating: null,
  video_links: [],
  action_photos: [],
  logo_url: null,
  is_public: true,
};

const genId = () => Math.random().toString(36).slice(2);

type SectionId = 'personal' | 'physical' | 'bio' | 'career' | 'achievements' | 'skills' | 'contact' | 'performance';
type PositionProfile = 'defender' | 'midfielder' | 'attacker';

const PLAY_STYLE_OPTIONS = [
  'Rapide',
  'Physique',
  'Technique',
  'Bon jeu aérien',
  'Leader',
  'Bon relanceur',
];

const getPositionProfile = (position: string): PositionProfile => {
  const p = position.toLowerCase();
  if (/def|arriere|lat[ée]ral|stoppeur|central/.test(p)) return 'defender';
  if (/milieu|relayeur|sentinelle|moc|mdc/.test(p)) return 'midfielder';
  return 'attacker';
};

const getAgeFromDob = (dob: string | null): string => {
  if (!dob) return '';
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return '';
  const diff = Date.now() - birthDate.getTime();
  return String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
};

const ageToDob = (ageValue: string): string | null => {
  const age = parseInt(ageValue, 10);
  if (!Number.isFinite(age) || age <= 0) return null;
  const year = new Date().getFullYear() - age;
  return `${year}-01-01`;
};

export default function CVEditor({ cvId, onNavigate }: CVEditorProps) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyCV);
  const [loading, setLoading] = useState(!!cvId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('personal');

  useEffect(() => {
    if (cvId) {
      supabase.from('sport_cvs').select('*').eq('id', cvId).maybeSingle().then(({ data }) => {
        if (data) {
          const { id: _id, user_id: _uid, created_at: _ca, updated_at: _ua, ...rest } = data;
          const r = rest as Record<string, unknown>;
          setForm({
            ...emptyCV,
            ...(rest as typeof emptyCV),
            address: String(r.address ?? ''),
            video_links: Array.isArray(r.video_links) ? (r.video_links as VideoLink[]) : [],
            action_photos: Array.isArray(r.action_photos) ? (r.action_photos as ActionPhoto[]) : [],
            career: Array.isArray(r.career) ? (r.career as CareerEntry[]) : [],
            achievements: Array.isArray(r.achievements) ? (r.achievements as Achievement[]) : [],
            skills: Array.isArray(r.skills) ? (r.skills as Skill[]) : [],
          });
        }
        setLoading(false);
      });
    }
  }, [cvId]);

  const update = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
    setSaveError(null);
    setSaveWarning(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveWarning(null);

    const raw = { ...form, user_id: user!.id };
    const payload = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;

    const runUpdate = async (body: Record<string, unknown>): Promise<{ error: any; data: any }> => {
      if (cvId) {
        return supabase.from('sport_cvs').update(body).eq('id', cvId) as any;
      }
      return supabase.from('sport_cvs').insert(body).select('id').single() as any;
    };

    let error: any = null;
    let data: unknown = null;
    {
      const res = await runUpdate(payload);
      error = res.error;
      data = res.data;
    }
    const msg = error?.message ?? '';

    if (
      error &&
      (/address|column/i.test(msg) && (/does not exist|not found|unknown/i.test(msg) || /schema cache/i.test(msg)))
    ) {
      const retryBody = { ...payload };
      delete retryBody.address;
      const second = await runUpdate(retryBody);
      error = second.error;
      data = second.data as unknown;
      if (!error) {
        setSaveWarning(
          'La colonne « address » est absente de la base : l’adresse n’a pas été enregistrée. Exécute la migration SQL du projet (fichier supabase/migrations/…add_address…) ou ajoute la colonne dans Supabase, puis sauvegarde à nouveau.',
        );
      }
    }

    setSaving(false);

    if (error) {
      setSaved(false);
      const finalMsg = error.message ?? '';
      const isMissingTable = /Could not find the table|PGRST205|does not exist in the schema cache/i.test(finalMsg);
      setSaveError(
        isMissingTable
          ? 'La table Supabase requise est introuvable (profiles ou sport_cvs). Vérifie que les migrations SQL ont été appliquées sur ton projet Supabase, puis réessaie.'
          : /value too long|payload|request body/i.test(finalMsg)
          ? 'Données trop volumineuses (souvent des images en base64). Réduis la taille des photos ou utilise des liens URL.'
          : `${finalMsg}${error.code ? ` (${error.code})` : ''}`,
      );
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    setTimeout(() => setSaveWarning(null), 12000);

    let id = cvId;
    if (!cvId && data && typeof data === 'object' && data !== null && 'id' in (data as Record<string, unknown>)) {
      id = String((data as Record<string, unknown>).id);
    }
    if (!cvId && id) {
      onNavigate('editor', id);
    }
  };

  const addCareer = () => {
    update('career', [
      ...form.career,
      {
        id: genId(),
        club: '',
        league: '',
        country: '',
        role: '',
        start_year: '',
        end_year: '',
        matches_played: 0,
        matches_started: 0,
        minutes_played: 0,
        yellow_cards: 0,
        red_cards: 0,
        description: '',
      },
    ]);
  };

  const updateCareer = (i: number, field: keyof CareerEntry, val: string) => {
    const updated = [...form.career];
    updated[i] = { ...updated[i], [field]: val };
    update('career', updated);
  };

  const updateCareerNumber = (i: number, field: keyof CareerEntry, val: string) => {
    const updated = [...form.career];
    updated[i] = { ...updated[i], [field]: val === '' ? undefined : parseFloat(val) } as CareerEntry;
    update('career', updated);
  };

  const removeCareer = (i: number) => {
    update('career', form.career.filter((_, idx) => idx !== i));
  };

  const addAchievement = () => {
    update('achievements', [...form.achievements, { id: genId(), title: '', year: '', description: '' }]);
  };

  const updateAchievement = (i: number, field: keyof Achievement, val: string) => {
    const updated = [...form.achievements];
    updated[i] = { ...updated[i], [field]: val };
    update('achievements', updated);
  };

  const removeAchievement = (i: number) => {
    update('achievements', form.achievements.filter((_, idx) => idx !== i));
  };

  const togglePlayStyle = (name: string, checked: boolean) => {
    if (checked) {
      if (form.skills.some(skill => skill.name === name)) return;
      update('skills', [...form.skills, { id: genId(), name, level: 100 }]);
      return;
    }
    update('skills', form.skills.filter(skill => skill.name !== name));
  };

  const addVideoLink = () => {
    update('video_links', [...form.video_links, { id: genId(), title: '', url: '' }]);
  };

  const updateVideoLink = (i: number, field: keyof VideoLink, val: string) => {
    const next = [...form.video_links];
    next[i] = { ...next[i], [field]: val };
    update('video_links', next);
  };

  const removeVideoLink = (i: number) => {
    update('video_links', form.video_links.filter((_, idx) => idx !== i));
  };

  const addActionPhoto = async (file: File) => {
    try {
      const url = await fileToDataUrl(file);
      update('action_photos', [...form.action_photos, { id: genId(), url, caption: '' }]);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Import impossible');
    }
  };

  const updateActionPhoto = (i: number, field: keyof ActionPhoto, val: string) => {
    const next = [...form.action_photos];
    next[i] = { ...next[i], [field]: val };
    update('action_photos', next);
  };

  const removeActionPhoto = (i: number) => {
    update('action_photos', form.action_photos.filter((_, idx) => idx !== i));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const sections: { id: SectionId; label: string; icon: ReactNode }[] = [
    { id: 'personal', label: 'Identité', icon: <User className="w-4 h-4" /> },
    { id: 'physical', label: 'Physique', icon: <Activity className="w-4 h-4" /> },
    { id: 'bio', label: 'Biographie', icon: <Star className="w-4 h-4" /> },
    { id: 'career', label: 'Carrière', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'achievements', label: 'Palmarès', icon: <Trophy className="w-4 h-4" /> },
    { id: 'skills', label: 'Qualités', icon: <Zap className="w-4 h-4" /> },
    { id: 'performance', label: 'Stats & médias', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
  ];

  const input = (label: string, field: string, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        type={type}
        value={(form as Record<string, unknown>)[field] as string ?? ''}
        onChange={e => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition text-sm"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 space-y-2">
          {saveError ? (
            <div className="rounded-xl border border-red-500/60 bg-red-950/80 text-red-200 text-sm px-4 py-3">
              <p className="font-bold text-red-100">Sauvegarde refusée par le serveur</p>
              <p className="mt-1 opacity-95">{saveError}</p>
              <p className="mt-2 text-xs text-red-300/90">
                Tant que la sauvegarde échoue, l’aperçu du CV affichera les anciennes données. Corrige l’erreur ci-dessus puis clique de nouveau sur Sauvegarder.
              </p>
            </div>
          ) : null}
          {saveWarning ? (
            <div className="rounded-xl border border-amber-500/50 bg-amber-950/50 text-amber-100 text-xs px-4 py-2">
              {saveWarning}
            </div>
          ) : null}
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Tableau de bord</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Player11Logo width={36} height={36} />
            </div>
            <span className="text-white font-black tracking-tight hidden sm:inline">PLAYER11</span>
          </div>
          <div className="flex items-center gap-2">
            {cvId && (
              <button
                onClick={() => onNavigate('view', cvId)}
                className="text-slate-400 hover:text-white text-sm transition px-3 py-2 rounded-lg hover:bg-slate-700/50"
              >
                Aperçu
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-lg shadow-red-600/30"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeSection === s.id
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 border border-slate-700/50'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">

          {activeSection === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-red-500" /> Identité sportive
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {input('Nom complet *', 'full_name', 'text', 'Prénom Nom')}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Âge</label>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={getAgeFromDob(form.date_of_birth)}
                    onChange={e => update('date_of_birth', ageToDob(e.target.value))}
                    placeholder="24"
                    className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Sport *</label>
                  <div className="relative">
                    <select
                      value={form.sport}
                      onChange={e => update('sport', e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition text-sm appearance-none pr-10"
                    >
                      <option value="">Choisir un sport</option>
                      {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                {input('Poste principal', 'position', 'text', 'Ex: Défenseur central, Milieu, Attaquant')}
                {input('Club actuel', 'current_club', 'text', 'Ex: Paris Saint-Germain')}
                {input('Nationalité', 'nationality', 'text', 'Ex: Française')}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  <div className="flex items-center gap-2"><Image className="w-4 h-4" /> Photo de profil</div>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  {form.photo_url ? (
                    <img src={form.photo_url} alt="" className="w-28 h-32 object-cover rounded-xl border border-slate-600" />
                  ) : null}
                  <div className="flex-1 space-y-2 w-full">
                    <label className="block">
                      <span className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600/20 border border-red-600/40 text-red-300 text-sm font-semibold cursor-pointer hover:bg-red-600/30 transition">
                        Importer une image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (!f) return;
                          try {
                            const url = await fileToDataUrl(f);
                            update('photo_url', url);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : 'Erreur');
                          }
                        }}
                      />
                    </label>
                    <input
                      type="url"
                      value={form.photo_url?.startsWith('data:') ? '' : (form.photo_url ?? '')}
                      onChange={ev => update('photo_url', ev.target.value || null)}
                      placeholder="Ou URL d’image (https://…)"
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition text-sm"
                    />
                    {form.photo_url ? (
                      <button
                        type="button"
                        onClick={() => update('photo_url', null)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Retirer la photo
                      </button>
                    ) : null}
                    <p className="text-slate-500 text-xs">JPG, PNG — max. {MAX_IMAGE_MB} Mo (import ou lien)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'physical' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" /> Caractéristiques physiques
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Taille (cm)</label>
                  <input
                    type="number"
                    value={form.height ?? ''}
                    onChange={e => update('height', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="180"
                    min={100} max={250}
                    className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Poids (kg)</label>
                  <input
                    type="number"
                    value={form.weight ?? ''}
                    onChange={e => update('weight', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="75"
                    min={30} max={200}
                    className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Pied fort</label>
                  <div className="relative">
                    <select
                      value={form.dominant_side}
                      onChange={e => update('dominant_side', e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm appearance-none pr-10"
                    >
                      <option>Droit</option>
                      <option>Gauche</option>
                      <option>Les deux</option>
                      <option>Pied droit</option>
                      <option>Pied gauche</option>
                      <option>Main droite</option>
                      <option>Main gauche</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'bio' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-red-500" /> Biographie
              </h2>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Présentation</label>
                <textarea
                  value={form.bio}
                  onChange={e => update('bio', e.target.value)}
                  rows={6}
                  placeholder="Décris ton parcours, tes qualités, ta philosophie sportive..."
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition text-sm resize-none"
                />
              </div>
            </div>
          )}

          {activeSection === 'career' && (
            <div className="space-y-4">
              <p className="text-slate-500 text-sm mb-4">
                Sur le CV, les expériences s’affichent du <span className="text-slate-300 font-medium">plus récent au plus ancien</span> (année de fin ou « Présent »).
              </p>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-red-500" /> Parcours
                </h2>
                <button
                  onClick={addCareer}
                  className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium px-3 py-2 rounded-xl transition border border-red-600/30"
                >
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              </div>
              {form.career.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Ajoute tes clubs et équipes</p>
                </div>
              )}
              {form.career.map((entry, i) => (
                <div key={entry.id} className="bg-slate-700/30 border border-slate-600/40 rounded-xl p-4 space-y-3">
                  {(() => {
                    const positionProfile = getPositionProfile(form.position || entry.role || '');
                    return (
                      <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Expérience {i + 1}</span>
                    <button onClick={() => removeCareer(i)} className="text-red-400 hover:text-red-300 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      value={entry.club}
                      onChange={e => updateCareer(i, 'club', e.target.value)}
                      placeholder="Club actuel / ancien club"
                      className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                    <input
                      value={entry.league ?? ''}
                      onChange={e => updateCareer(i, 'league', e.target.value)}
                      placeholder="Ligue / division"
                      className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                    <input
                      value={entry.country ?? ''}
                      onChange={e => updateCareer(i, 'country', e.target.value)}
                      placeholder="Pays"
                      className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                    <input
                      value={entry.role}
                      onChange={e => updateCareer(i, 'role', e.target.value)}
                      placeholder="Poste principal"
                      className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                    <input
                      value={entry.start_year}
                      onChange={e => updateCareer(i, 'start_year', e.target.value)}
                      placeholder="Année début (ex: 2020)"
                      className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                    <input
                      value={entry.end_year}
                      onChange={e => updateCareer(i, 'end_year', e.target.value)}
                      placeholder="Année fin (ex: Présent)"
                      className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">Temps de jeu</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="number"
                        min={0}
                        value={entry.matches_played ?? ''}
                        onChange={e => updateCareerNumber(i, 'matches_played', e.target.value)}
                        placeholder="Matchs joués"
                        className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        value={entry.matches_started ?? ''}
                        onChange={e => updateCareerNumber(i, 'matches_started', e.target.value)}
                        placeholder="Matchs titulaires"
                        className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                      />
                      <input
                        type="number"
                        min={0}
                        value={entry.minutes_played ?? ''}
                        onChange={e => updateCareerNumber(i, 'minutes_played', e.target.value)}
                        placeholder="Minutes jouées"
                        className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">Stats réelles</h4>
                    {positionProfile === 'defender' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="number" step="0.1" min={0} value={entry.interceptions_per_match ?? ''} onChange={e => updateCareerNumber(i, 'interceptions_per_match', e.target.value)} placeholder="Interceptions / match" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                        <input type="number" min={0} value={entry.successful_tackles ?? ''} onChange={e => updateCareerNumber(i, 'successful_tackles', e.target.value)} placeholder="Tacles réussis" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                        <input type="number" step="0.1" min={0} max={100} value={entry.duels_won_pct ?? ''} onChange={e => updateCareerNumber(i, 'duels_won_pct', e.target.value)} placeholder="Duels gagnés (%)" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                        <input type="number" min={0} value={entry.clearances ?? ''} onChange={e => updateCareerNumber(i, 'clearances', e.target.value)} placeholder="Dégagements" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                      </div>
                    )}
                    {positionProfile === 'midfielder' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="number" step="0.1" min={0} max={100} value={entry.pass_success_pct ?? ''} onChange={e => updateCareerNumber(i, 'pass_success_pct', e.target.value)} placeholder="Passes réussies (%)" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                        <input type="number" min={0} value={entry.key_passes ?? ''} onChange={e => updateCareerNumber(i, 'key_passes', e.target.value)} placeholder="Passes clés" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                        <input type="number" min={0} value={entry.balls_recovered ?? ''} onChange={e => updateCareerNumber(i, 'balls_recovered', e.target.value)} placeholder="Ballons récupérés" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                      </div>
                    )}
                    {positionProfile === 'attacker' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="number" min={0} value={entry.goals ?? ''} onChange={e => updateCareerNumber(i, 'goals', e.target.value)} placeholder="Buts" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                        <input type="number" min={0} value={entry.shots_on_target ?? ''} onChange={e => updateCareerNumber(i, 'shots_on_target', e.target.value)} placeholder="Tirs cadrés" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">Discipline</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="number" min={0} value={entry.yellow_cards ?? ''} onChange={e => updateCareerNumber(i, 'yellow_cards', e.target.value)} placeholder="Cartons jaunes" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                      <input type="number" min={0} value={entry.red_cards ?? ''} onChange={e => updateCareerNumber(i, 'red_cards', e.target.value)} placeholder="Cartons rouges" className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm" />
                    </div>
                  </div>
                  <textarea
                    value={entry.description}
                    onChange={e => updateCareer(i, 'description', e.target.value)}
                    placeholder="Description (optionnel)"
                    rows={2}
                    className="w-full bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm resize-none"
                  />
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'achievements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-red-500" /> Palmarès & Distinctions
                </h2>
                <button
                  onClick={addAchievement}
                  className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium px-3 py-2 rounded-xl transition border border-red-600/30"
                >
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              </div>
              {form.achievements.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Ajoute tes titres et distinctions</p>
                </div>
              )}
              {form.achievements.map((ach, i) => (
                <div key={ach.id} className="bg-slate-700/30 border border-slate-600/40 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm font-medium">Distinction {i + 1}</span>
                    <button onClick={() => removeAchievement(i)} className="text-red-400 hover:text-red-300 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        value={ach.title}
                        onChange={e => updateAchievement(i, 'title', e.target.value)}
                        placeholder="Titre (ex: Champion de France)"
                        className="w-full bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                      />
                    </div>
                    <input
                      value={ach.year}
                      onChange={e => updateAchievement(i, 'year', e.target.value)}
                      placeholder="Année"
                      className="bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                  </div>
                  <input
                    value={ach.description}
                    onChange={e => updateAchievement(i, 'description', e.target.value)}
                    placeholder="Description (optionnel)"
                    className="w-full bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-red-500" /> Style de jeu (guidé)
              </h2>
              <p className="text-slate-400 text-sm">
                Sélectionne les caractéristiques principales du joueur.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PLAY_STYLE_OPTIONS.map(option => {
                  const checked = form.skills.some(skill => skill.name === option);
                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                        checked
                          ? 'border-red-500/70 bg-red-600/15 text-red-100'
                          : 'border-slate-600/40 bg-slate-700/30 text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={e => togglePlayStyle(option, e.target.checked)}
                        className="accent-red-500 w-4 h-4"
                      />
                      <span className="text-sm font-medium">{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'performance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-red-500" /> Statistiques & médias
              </h2>
              <p className="text-slate-500 text-sm">
                Les chiffres apparaissent en haut à droite du CV avec des icônes. Ajoute les liens de tes vidéos ; les photos d’action s’importent ici et deviennent des liens cliquables sur le CV.
              </p>
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Statistiques de performance</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Matchs joués</label>
                    <input
                      type="number"
                      min={0}
                      value={form.matches_played ?? 0}
                      onChange={e => update('matches_played', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Buts</label>
                    <input
                      type="number"
                      min={0}
                      value={form.goals ?? 0}
                      onChange={e => update('goals', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Passes décisives</label>
                    <input
                      type="number"
                      min={0}
                      value={form.assists ?? 0}
                      onChange={e => update('assists', parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Film className="w-4 h-4 text-red-400" /> Liens vidéo
                  </h3>
                  <button
                    type="button"
                    onClick={addVideoLink}
                    className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium px-3 py-2 rounded-xl transition border border-red-600/30"
                  >
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
                {form.video_links.length === 0 ? (
                  <p className="text-slate-500 text-sm py-4 text-center border border-dashed border-slate-600 rounded-xl">Aucune vidéo — ajoute un lien YouTube, Vimeo, etc.</p>
                ) : (
                  <div className="space-y-3">
                    {form.video_links.map((v, i) => (
                      <div key={v.id} className="bg-slate-700/30 border border-slate-600/40 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">Vidéo {i + 1}</span>
                          <button type="button" onClick={() => removeVideoLink(i)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          value={v.title}
                          onChange={e => updateVideoLink(i, 'title', e.target.value)}
                          placeholder="Titre affiché sur le CV"
                          className="w-full bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <Link2 className="w-4 h-4 text-slate-500 shrink-0" />
                          <input
                            value={v.url}
                            onChange={e => updateVideoLink(i, 'url', e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Image className="w-4 h-4 text-red-400" /> Photos d’action
                </h3>
                <label className="block mb-3">
                  <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-red-600/20 border border-red-600/40 text-red-300 text-sm font-semibold cursor-pointer hover:bg-red-600/30 transition">
                    Importer des photos
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      e.target.value = '';
                      for (const f of files) {
                        await addActionPhoto(f);
                      }
                    }}
                  />
                </label>
                {form.action_photos.length === 0 ? (
                  <p className="text-slate-500 text-sm">Chaque photo aura un bouton cliquable sur le CV (ouvre l’image).</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {form.action_photos.map((ph, i) => (
                      <div key={ph.id} className="bg-slate-700/30 border border-slate-600/40 rounded-xl p-3 flex gap-3">
                        <img src={ph.url} alt="" className="w-20 h-20 object-cover rounded-lg border border-slate-600 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <input
                            value={ph.caption ?? ''}
                            onChange={e => updateActionPhoto(i, 'caption', e.target.value)}
                            placeholder="Légende (optionnel)"
                            className="w-full bg-slate-600/50 border border-slate-500/50 text-white placeholder-slate-500 rounded-lg px-2 py-2 text-xs"
                          />
                          <button type="button" onClick={() => removeActionPhoto(i)} className="text-xs text-red-400 hover:text-red-300">
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-500" /> Coordonnées
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {input('Email de contact', 'email', 'email', 'contact@email.com')}
                {input('Téléphone', 'phone', 'tel', '+33 6 00 00 00 00')}
                {input('Instagram', 'instagram', 'text', '@toninstagram')}
                {input('Twitter / X', 'twitter', 'text', '@tontwitter')}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Adresse postale</label>
                <textarea
                  value={form.address ?? ''}
                  onChange={e => update('address', e.target.value)}
                  rows={3}
                  placeholder="Rue, code postal, ville, pays…"
                  className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition text-sm resize-none"
                />
                <p className="text-slate-500 text-xs mt-1.5">Affichée dans l’encadré Contact en haut à gauche du CV</p>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.is_public}
                      onChange={e => update('is_public', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-11 h-6 rounded-full transition ${form.is_public ? 'bg-red-600' : 'bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_public ? 'translate-x-5' : ''}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">CV public</p>
                    <p className="text-slate-400 text-xs">Permet le partage via un lien</p>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              const idx = sections.findIndex(s => s.id === activeSection);
              if (idx > 0) setActiveSection(sections[idx - 1].id);
            }}
            className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Précédent
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-600/30"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
