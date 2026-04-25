import React from 'react';
import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { CareerEntry } from '../../types/cv';
import { getPositionProfile } from '../../lib/cv';

interface CareerSectionProps {
  career: CareerEntry[];
  playerPosition: string;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof CareerEntry, value: any) => void;
  onRemove: (index: number) => void;
}

export default function CareerSection({ 
  career, 
  playerPosition, 
  onAdd, 
  onUpdate, 
  onRemove 
}: CareerSectionProps) {
  
  const handleNumberChange = (index: number, field: keyof CareerEntry, value: string) => {
    const val = value === '' ? undefined : parseFloat(value);
    onUpdate(index, field, val);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-red-500" /> Parcours professionnel
        </h2>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <p className="text-slate-500 text-sm">
        Les expériences s’affichent du <span className="text-slate-300 font-medium">plus récent au plus ancien</span>.
      </p>

      {career.length === 0 && (
        <div className="text-center py-12 bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-700">
          <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-600 opacity-40" />
          <p className="text-slate-400 text-sm">Aucune expérience enregistrée. Cliquez sur Ajouter pour commencer.</p>
        </div>
      )}

      <div className="space-y-4">
        {career.map((entry, i) => {
          const profile = getPositionProfile(playerPosition || entry.role || '');
          return (
            <div key={entry.id} className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-600 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-center">
                <span className="bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">Expérience {i + 1}</span>
                <button 
                  onClick={() => onRemove(i)} 
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Club</label>
                  <input
                    value={entry.club}
                    onChange={e => onUpdate(i, 'club', e.target.value)}
                    placeholder="Ex: PSG, Real Madrid..."
                    className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Ligue / Division</label>
                  <input
                    value={entry.league ?? ''}
                    onChange={e => onUpdate(i, 'league', e.target.value)}
                    placeholder="Ex: Ligue 1, National..."
                    className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Pays</label>
                  <input
                    value={entry.country ?? ''}
                    onChange={e => onUpdate(i, 'country', e.target.value)}
                    placeholder="Ex: France, Espagne..."
                    className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Poste</label>
                  <input
                    value={entry.role}
                    onChange={e => onUpdate(i, 'role', e.target.value)}
                    placeholder="Ex: Défenseur central..."
                    className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Début</label>
                  <input
                    value={entry.start_year}
                    onChange={e => onUpdate(i, 'start_year', e.target.value)}
                    placeholder="Année"
                    className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Fin</label>
                  <input
                    value={entry.end_year}
                    onChange={e => onUpdate(i, 'end_year', e.target.value)}
                    placeholder="Année ou 'Présent'"
                    className="w-full bg-slate-700/30 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500/50 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-700/50">
                <h4 className="text-xs font-bold uppercase tracking-widest text-red-500/80">Statistiques de saison</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Matchs</label>
                    <input
                      type="number"
                      min={0}
                      value={entry.matches_played ?? ''}
                      onChange={e => handleNumberChange(i, 'matches_played', e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Titulaires</label>
                    <input
                      type="number"
                      min={0}
                      value={entry.matches_started ?? ''}
                      onChange={e => handleNumberChange(i, 'matches_started', e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Minutes</label>
                    <input
                      type="number"
                      min={0}
                      value={entry.minutes_played ?? ''}
                      onChange={e => handleNumberChange(i, 'minutes_played', e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500/50 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {profile === 'defender' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Interceptions</label>
                        <input type="number" step="0.1" value={entry.interceptions_per_match ?? ''} onChange={e => handleNumberChange(i, 'interceptions_per_match', e.target.value)} className="w-full bg-slate-900/40 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tacles (%)</label>
                        <input type="number" step="0.1" value={entry.successful_tackles ?? ''} onChange={e => handleNumberChange(i, 'successful_tackles', e.target.value)} className="w-full bg-slate-900/40 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </>
                  )}
                  {profile === 'midfielder' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Passes (%)</label>
                        <input type="number" step="0.1" value={entry.pass_success_pct ?? ''} onChange={e => handleNumberChange(i, 'pass_success_pct', e.target.value)} className="w-full bg-slate-900/40 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Passes clés</label>
                        <input type="number" value={entry.key_passes ?? ''} onChange={e => handleNumberChange(i, 'key_passes', e.target.value)} className="w-full bg-slate-900/40 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </>
                  )}
                  {profile === 'attacker' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Buts</label>
                        <input type="number" value={entry.goals ?? ''} onChange={e => handleNumberChange(i, 'goals', e.target.value)} className="w-full bg-slate-900/40 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Tirs cadrés</label>
                        <input type="number" value={entry.shots_on_target ?? ''} onChange={e => handleNumberChange(i, 'shots_on_target', e.target.value)} className="w-full bg-slate-900/40 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
