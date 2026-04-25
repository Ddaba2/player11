import React, { useState } from 'react';
import { User, ChevronDown, Image as ImageIcon, Loader2 } from 'lucide-react';
import { SPORTS } from '../../types/cv';
import { getAgeFromDob, ageToDob } from '../../lib/cv';
import { uploadImage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';

interface PersonalInfoSectionProps {
  form: any;
  update: (field: string, value: any) => void;
  validationErrors: Record<string, string>;
}

export default function PersonalInfoSection({ form, update, validationErrors }: PersonalInfoSectionProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const path = `avatars/${user.id}/${timestamp}.${fileExt}`;
      
      const publicUrl = await uploadImage(file, path);
      update('photo_url', publicUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload de l\'image.');
    } finally {
      setUploading(false);
    }
  };

  const renderInput = (label: string, field: string, type = 'text', placeholder = '') => {
    const error = validationErrors[field];
    return (
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
        <input
          type={type}
          value={form[field] || ''}
          onChange={e => update(field, e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-slate-700/50 border text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition text-sm ${
            error
              ? 'border-red-500/70 focus:ring-red-500/50 focus:border-red-500/50'
              : 'border-slate-600/50 focus:ring-red-500/50 focus:border-red-500/50'
          }`}
        />
        {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-red-500" /> Identité sportive
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderInput('Nom complet *', 'full_name', 'text', 'Prénom Nom')}
        
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

        {renderInput('Poste principal', 'position', 'text', 'Ex: Défenseur central, Milieu, Attaquant')}
        {renderInput('Club actuel', 'current_club', 'text', 'Ex: Paris Saint-Germain')}
        {renderInput('Nationalité', 'nationality', 'text', 'Ex: Française')}
      </div>

      <div className="pt-4 border-t border-slate-700/50">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-red-500" /> Photo de profil</div>
        </label>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative group">
            {form.photo_url ? (
              <img 
                src={form.photo_url} 
                alt="Profile" 
                className="w-32 h-40 object-cover rounded-2xl border-2 border-slate-700 shadow-xl group-hover:border-red-500/50 transition-colors" 
              />
            ) : (
              <div className="w-32 h-40 bg-slate-800 rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center">
                <User className="w-12 h-12 text-slate-600" />
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-wrap gap-3">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-lg shadow-red-600/20">
                  <ImageIcon className="w-4 h-4" />
                  {uploading ? 'Upload...' : 'Changer la photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
              
              {form.photo_url && (
                <button
                  type="button"
                  onClick={() => update('photo_url', null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-700/50 hover:bg-red-900/20 text-slate-300 hover:text-red-400 border border-slate-600/50 text-sm font-medium transition-all"
                >
                  Supprimer
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ou via une URL directe</label>
              <input
                type="url"
                value={form.photo_url || ''}
                onChange={ev => update('photo_url', ev.target.value || null)}
                placeholder="https://images.com/ma-photo.jpg"
                className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm"
              />
            </div>
            
            <p className="text-slate-500 text-xs flex items-center gap-2">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              JPG, PNG — Max 5MB. Recommandé : format portrait (3:4).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
