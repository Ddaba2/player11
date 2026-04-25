import React from 'react';
import { Star } from 'lucide-react';

interface BioSectionProps {
  form: any;
  update: (field: string, value: any) => void;
}

export default function BioSection({ form, update }: BioSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-red-500" /> Biographie & Profil
      </h2>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Présentation professionnelle</label>
        <textarea
          value={form.bio}
          onChange={e => update('bio', e.target.value)}
          rows={10}
          placeholder="Décrivez votre parcours, vos forces, votre mentalité et vos objectifs de carrière..."
          className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm resize-none leading-relaxed"
        />
        <p className="text-slate-500 text-xs mt-2 italic">
          Astuce : Mentionnez vos qualités humaines et votre capacité d'adaptation.
        </p>
      </div>
    </div>
  );
}
