import React from 'react';
import { Trophy, Plus, Trash2 } from 'lucide-react';
import { Achievement } from '../../types/cv';

interface AchievementsSectionProps {
  achievements: Achievement[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Achievement, value: string) => void;
  onRemove: (index: number) => void;
}

export default function AchievementsSection({ achievements, onAdd, onUpdate, onRemove }: AchievementsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-red-500" /> Palmarès & Distinctions
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12 bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-700">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-slate-600 opacity-40" />
          <p className="text-slate-400 text-sm">Championnats, coupes, titres individuels...</p>
        </div>
      )}

      <div className="space-y-4">
        {achievements.map((ach, i) => (
          <div key={ach.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 space-y-4 relative group">
            <button 
              onClick={() => onRemove(i)} 
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Titre</label>
                <input
                  value={ach.title}
                  onChange={e => onUpdate(i, 'title', e.target.value)}
                  placeholder="Ex: Champion régional, Meilleur buteur..."
                  className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Année</label>
                <input
                  value={ach.year}
                  onChange={e => onUpdate(i, 'year', e.target.value)}
                  placeholder="Ex: 2023"
                  className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Description (optionnelle)</label>
              <input
                value={ach.description}
                onChange={e => onUpdate(i, 'description', e.target.value)}
                placeholder="Précisions sur la performance..."
                className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
