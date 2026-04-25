import React, { useState } from 'react';
import { BarChart2, Film, Image as ImageIcon, Plus, Trash2, Link2, Loader2 } from 'lucide-react';
import { VideoLink, ActionPhoto } from '../../types/cv';
import { uploadImage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';

interface StatsSectionProps {
  form: any;
  update: (field: string, value: any) => void;
  onAddVideo: () => void;
  onUpdateVideo: (index: number, field: keyof VideoLink, value: string) => void;
  onRemoveVideo: (index: number) => void;
  onUpdateActionPhoto: (index: number, field: keyof ActionPhoto, value: string) => void;
  onRemoveActionPhoto: (index: number) => void;
}

export default function StatsSection({
  form,
  update,
  onAddVideo,
  onUpdateVideo,
  onRemoveVideo,
  onUpdateActionPhoto,
  onRemoveActionPhoto
}: StatsSectionProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleActionPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !user) return;

    try {
      setUploading(true);
      const newPhotos = [...form.action_photos];
      
      for (const file of files) {
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const path = `action-photos/${user.id}/${timestamp}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        
        const publicUrl = await uploadImage(file, path);
        newPhotos.push({
          id: Math.random().toString(36).slice(2),
          url: publicUrl,
          caption: ''
        });
      }
      
      update('action_photos', newPhotos);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Erreur lors de l\'upload des photos.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-red-500" /> Statistiques globales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Matchs joués</label>
            <input
              type="number"
              min={0}
              value={form.matches_played ?? 0}
              onChange={e => update('matches_played', parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Buts</label>
            <input
              type="number"
              min={0}
              value={form.goals ?? 0}
              onChange={e => update('goals', parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-700/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Passes décisives</label>
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

      <div className="space-y-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" /> Liens vidéo
          </h2>
          <button
            type="button"
            onClick={onAddVideo}
            className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium px-3 py-2 rounded-xl transition border border-red-600/30"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </div>
        
        {form.video_links.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-700">
            <Film className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
            <p className="text-slate-400 text-sm">Aucun lien vidéo. Ajoutez vos highlights YouTube/Vimeo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.video_links.map((v: VideoLink, i: number) => (
              <div key={v.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 space-y-3 relative group">
                <button 
                  type="button" 
                  onClick={() => onRemoveVideo(i)} 
                  className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <input
                  value={v.title}
                  onChange={e => onUpdateVideo(i, 'title', e.target.value)}
                  placeholder="Titre de la vidéo"
                  className="w-full bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm"
                />
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <input
                    value={v.url}
                    onChange={e => onUpdateVideo(i, 'url', e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="flex-1 bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-500" /> Photos d'action
          </h2>
          <label className="cursor-pointer">
            <span className="flex items-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium px-3 py-2 rounded-xl transition border border-red-600/30">
              <Plus className="w-4 h-4" /> Importer
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleActionPhotoUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {uploading && (
          <div className="flex items-center gap-3 text-red-400 text-sm animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Upload des photos en cours...
          </div>
        )}

        {form.action_photos.length === 0 ? (
          <div className="text-center py-8 bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-700">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-40" />
            <p className="text-slate-400 text-sm">Ajoutez des photos de vous en plein match.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {form.action_photos.map((ph: ActionPhoto, i: number) => (
              <div key={ph.id} className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 group">
                <img src={ph.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                  <input
                    value={ph.caption ?? ''}
                    onChange={e => onUpdateActionPhoto(i, 'caption', e.target.value)}
                    placeholder="Légende..."
                    className="w-full bg-slate-800/80 border border-slate-600 text-white rounded px-2 py-1 text-[10px] mb-2"
                  />
                  <button 
                    type="button" 
                    onClick={() => onRemoveActionPhoto(i)} 
                    className="w-full py-1 bg-red-600/80 text-white text-[10px] font-bold rounded"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
