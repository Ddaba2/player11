import React from 'react';
import { Activity, ChevronDown } from 'lucide-react';

interface PhysicalSectionProps {
  form: any;
  update: (field: string, value: any) => void;
}

export default function PhysicalSection({ form, update }: PhysicalSectionProps) {
  return (
    <div className="space-y-6">
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
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Pied/Main fort</label>
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
  );
}
