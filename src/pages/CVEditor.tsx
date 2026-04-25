import { useEffect, useState, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { SportCV, CareerEntry, Achievement, Skill, VideoLink, ActionPhoto } from '../types/cv';
import {
  ArrowLeft, Save, Plus, Trash2, ChevronDown, Trophy,
  User, Activity, Briefcase, Star, Zap, Phone, Image as ImageIcon, Film, BarChart2, Link2, Copy, Check, Eye
} from 'lucide-react';
import Player11Logo from '../components/Logo';
import { validateCVField, validateCVForm, generatePublicSlug } from '../lib/validation';

// New sub-components
import PersonalInfoSection from '../components/editor/PersonalInfoSection';
import PhysicalSection from '../components/editor/PhysicalSection';
import BioSection from '../components/editor/BioSection';
import CareerSection from '../components/editor/CareerSection';
import AchievementsSection from '../components/editor/AchievementsSection';
import SkillsSection from '../components/editor/SkillsSection';
import StatsSection from '../components/editor/StatsSection';
import ContactSection from '../components/editor/ContactSection';
import ThemeSection from '../components/editor/ThemeSection';

type SectionId = 'personal' | 'physical' | 'bio' | 'career' | 'achievements' | 'skills' | 'performance' | 'contact';

const emptyCV: Omit<SportCV, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  full_name: '',
  sport: 'Football',
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
  public_slug: null,
  theme: 'modern',
};

const genId = () => Math.random().toString(36).slice(2);

const PLAY_STYLE_OPTIONS = [
  'Rapide', 'Physique', 'Technique', 'Bon jeu aérien', 'Leader', 'Bon relanceur',
];

interface CVEditorProps {
  cvId?: string;
  onNavigate: (page: string, cvId?: string) => void;
}

export default function CVEditor({ cvId, onNavigate }: CVEditorProps) {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyCV);
  const [loading, setLoading] = useState(!!cvId);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('personal');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    if (cvId) {
      supabase.from('sport_cvs').select('*').eq('id', cvId).maybeSingle().then(({ data }) => {
        if (data) {
          const { id: _id, user_id: _uid, created_at: _ca, updated_at: _ua, ...rest } = data;
          const r = rest as Record<string, unknown>;
          setForm({
            ...emptyCV,
            ...(rest as any),
            address: String(r.address ?? ''),
            video_links: Array.isArray(r.video_links) ? (r.video_links as VideoLink[]) : [],
            action_photos: Array.isArray(r.action_photos) ? (r.action_photos as ActionPhoto[]) : [],
            career: Array.isArray(r.career) ? (r.career as CareerEntry[]) : [],
            achievements: Array.isArray(r.achievements) ? (r.achievements as Achievement[]) : [],
            skills: Array.isArray(r.skills) ? (r.skills as Skill[]) : [],
            theme: (r.theme as any) || 'modern',
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
    setHasUnsavedChanges(true);
    
    const error = validateCVField(field, value);
    setValidationErrors(prev => {
      const next = { ...prev };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const handleSave = useCallback(async () => {
    const validationResult = validateCVForm(form as any);
    if (!validationResult.isValid) {
      setValidationErrors(validationResult.errors);
      setSaveError('Veuillez corriger les erreurs avant de sauvegarder.');
      return;
    }

    setSaving(true);
    setSaveError(null);

    const raw = { ...form, user_id: user!.id };
    if (form.is_public && !form.public_slug && form.full_name) {
      raw.public_slug = generatePublicSlug(form.full_name);
    }
    
    const payload = JSON.parse(JSON.stringify(raw));

    const runUpdate = async (body: any) => {
      if (cvId) return supabase.from('sport_cvs').update(body).eq('id', cvId);
      return supabase.from('sport_cvs').insert(body).select('id').single();
    };

    let res = await runUpdate(payload);
    let { error, data } = res as any;

    // Retry logic if some columns are missing in the DB schema
    if (error && (error.message.includes('column') || error.message.includes('public_slug') || error.message.includes('address') || error.message.includes('theme'))) {
      console.warn('⚠️ Colonne manquante détectée, tentative de sauvegarde sans les colonnes optionnelles...');
      const retryBody = { ...payload };
      
      // Liste des colonnes potentiellement manquantes (ajouts récents)
      const optionalColumns = ['public_slug', 'address', 'theme', 'dominant_side', 'current_club'];
      
      // On retire récursivement les colonnes qui causent l'erreur
      optionalColumns.forEach(col => {
        if (error.message.includes(col)) {
          delete retryBody[col];
        }
      });
      
      const second = await runUpdate(retryBody);
      error = second.error;
      data = second.data;
      
      if (!error) {
        setSaveWarning('Le CV a été sauvegardé, mais certaines informations optionnelles ont été ignorées car la base de données Supabase n\'est pas à jour. Contactez l\'administrateur pour ajouter les colonnes manquantes.');
      }
    }

    setSaving(false);
    if (error) {
      setSaveError(error.message);
      return;
    }

    setSaved(true);
    setHasUnsavedChanges(false);
    setTimeout(() => setSaved(false), 2500);

    const id = cvId || data?.id;
    if (!cvId && id) onNavigate('editor', id);
  }, [cvId, user, form, onNavigate]);

  useEffect(() => {
    if (!autoSaveEnabled || !cvId) return;
    autoSaveTimerRef.current = setInterval(() => {
      if (hasUnsavedChanges && !saving) handleSave();
    }, 30000);
    return () => { if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
  }, [autoSaveEnabled, cvId, hasUnsavedChanges, saving, handleSave]);

  const handleCopyLink = async () => {
    if (!cvId || !form.public_slug) return;
    const url = `${window.location.origin}/view/${form.public_slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const sections: { id: SectionId; label: string; icon: ReactNode }[] = [
    { id: 'personal', label: 'Identité', icon: <User className="w-4 h-4" /> },
    { id: 'physical', label: 'Physique', icon: <Activity className="w-4 h-4" /> },
    { id: 'bio', label: 'Bio', icon: <Star className="w-4 h-4" /> },
    { id: 'career', label: 'Carrière', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'achievements', label: 'Palmarès', icon: <Trophy className="w-4 h-4" /> },
    { id: 'skills', label: 'Qualités', icon: <Zap className="w-4 h-4" /> },
    { id: 'performance', label: 'Stats/Médias', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header compact */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('dashboard')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex items-center gap-2">
            <Player11Logo width={28} height={28} />
            <span className="font-black tracking-tighter text-white hidden sm:block">PLAYER11</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 mr-4 px-4 border-r border-slate-800">
            {hasUnsavedChanges ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Modifications en cours
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Sauvegardé
              </span>
            )}
            <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold uppercase text-slate-500">
              <input type="checkbox" checked={autoSaveEnabled} onChange={e => setAutoSaveEnabled(e.target.checked)} className="accent-red-600" />
              Auto-save
            </label>
          </div>


          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm transition-all shadow-lg shadow-red-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? '...' : saved ? 'OK' : 'Enregistrer'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] h-[calc(100-4rem)]">
        
        {/* Colonne 1: Navigation par sections */}
        <aside className="hidden md:block border-r border-slate-800 p-6 overflow-y-auto bg-slate-900/20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 px-2">Éditeur de profil</p>
          <nav className="space-y-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeSection === s.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20 translate-x-1'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Colonne 2: Formulaire (Scrollable) */}
        <section className="p-4 sm:p-8 overflow-y-auto border-r border-slate-800 custom-scrollbar">
          <div className="max-w-2xl mx-auto">
            {saveError && (
              <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-2xl text-red-200 text-sm">
                {saveError}
              </div>
            )}
            
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {activeSection === 'personal' && <PersonalInfoSection form={form} update={update} validationErrors={validationErrors} />}
              {activeSection === 'physical' && <PhysicalSection form={form} update={update} />}
              {activeSection === 'bio' && <BioSection form={form} update={update} />}
              {activeSection === 'career' && (
                <CareerSection 
                  career={form.career} 
                  playerPosition={form.position}
                  onAdd={() => update('career', [...form.career, { id: genId(), club: '', role: '', start_year: '', end_year: '', description: '' }])}
                  onUpdate={(i, f, v) => {
                    const c = [...form.career];
                    c[i] = { ...c[i], [f]: v };
                    update('career', c);
                  }}
                  onRemove={(i) => update('career', form.career.filter((_, idx) => idx !== i))}
                />
              )}
              {activeSection === 'achievements' && (
                <AchievementsSection 
                  achievements={form.achievements}
                  onAdd={() => update('achievements', [...form.achievements, { id: genId(), title: '', year: '', description: '' }])}
                  onUpdate={(i, f, v) => {
                    const a = [...form.achievements];
                    a[i] = { ...a[i], [f]: v };
                    update('achievements', a);
                  }}
                  onRemove={(i) => update('achievements', form.achievements.filter((_, idx) => idx !== i))}
                />
              )}
              {activeSection === 'skills' && (
                <SkillsSection 
                  skills={form.skills} 
                  options={PLAY_STYLE_OPTIONS}
                  onToggle={(name, checked) => {
                    if (checked) update('skills', [...form.skills, { id: genId(), name, level: 100 }]);
                    else update('skills', form.skills.filter(s => s.name !== name));
                  }}
                />
              )}
              {activeSection === 'performance' && (
                <StatsSection 
                  form={form} 
                  update={update}
                  onAddVideo={() => update('video_links', [...form.video_links, { id: genId(), title: '', url: '' }])}
                  onUpdateVideo={(i, f, v) => {
                    const nl = [...form.video_links];
                    nl[i] = { ...nl[i], [f]: v };
                    update('video_links', nl);
                  }}
                  onRemoveVideo={(i) => update('video_links', form.video_links.filter((_, idx) => idx !== i))}
                  onUpdateActionPhoto={(i, f, v) => {
                    const np = [...form.action_photos];
                    np[i] = { ...np[i], [f]: v };
                    update('action_photos', np);
                  }}
                  onRemoveActionPhoto={(i) => update('action_photos', form.action_photos.filter((_, idx) => idx !== i))}
                />
              )}
              {activeSection === 'contact' && <ContactSection form={form} update={update} cvId={cvId} onCopyLink={handleCopyLink} copiedLink={copiedLink} />}
              
              {/* Boutons de navigation bas de page */}
              <div className="mt-12 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                {activeSection !== 'personal' ? (
                  <button
                    onClick={() => {
                      const idx = sections.findIndex(s => s.id === activeSection);
                      setActiveSection(sections[idx - 1].id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" /> 
                    Section précédente
                  </button>
                ) : <div />}

                {activeSection !== 'contact' ? (
                  <button
                    onClick={() => {
                      const idx = sections.findIndex(s => s.id === activeSection);
                      setActiveSection(sections[idx + 1].id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-black/20"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-red-600/30 active:scale-95"
                  >
                    Terminer et Sauvegarder
                  </button>
                )}
              </div>
            </div>

            {/* Pagination mobile (Ancienne - masquée car redondante avec les nouveaux boutons) */}
            <div className="hidden mt-12 flex justify-between md:hidden">
              <button
                disabled={activeSection === 'personal'}
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === activeSection);
                  setActiveSection(sections[idx - 1].id);
                }}
                className="flex items-center gap-2 text-slate-500 disabled:opacity-20"
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>
              <button
                disabled={activeSection === 'contact'}
                onClick={() => {
                  const idx = sections.findIndex(s => s.id === activeSection);
                  setActiveSection(sections[idx + 1].id);
                }}
                className="flex items-center gap-2 text-red-500 font-bold"
              >
                Suivant
              </button>
            </div>
          </div>
        </section>


      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}} />
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
