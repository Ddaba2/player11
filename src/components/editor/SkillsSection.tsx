import React from 'react';
import { Zap } from 'lucide-react';

interface SkillsSectionProps {
  skills: { name: string }[];
  options: string[];
  onToggle: (name: string, checked: boolean) => void;
}

export default function SkillsSection({ skills, options, onToggle }: SkillsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-red-500" /> Style de jeu & Qualités
        </h2>
        <p className="text-slate-400 text-sm">
          Sélectionnez les points forts qui définissent le mieux votre profil de joueur.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(option => {
          const checked = skills.some(skill => skill.name === option);
          return (
            <label
              key={option}
              className={`flex items-center gap-3 rounded-2xl border px-5 py-4 cursor-pointer transition-all duration-300 group ${
                checked
                  ? 'border-red-500 bg-red-600/10 text-red-100 shadow-lg shadow-red-600/10'
                  : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600 hover:bg-slate-800/60'
              }`}
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                checked ? 'bg-red-600 border-red-600' : 'border-slate-600 group-hover:border-slate-500'
              }`}>
                {checked && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                checked={checked}
                onChange={e => onToggle(option, e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm font-bold tracking-wide uppercase">{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
