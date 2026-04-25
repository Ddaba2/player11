import React from 'react';
import { Phone, Link2, Copy, Check, MapPin, Mail, Instagram, Twitter } from 'lucide-react';

interface ContactSectionProps {
  form: any;
  update: (field: string, value: any) => void;
  cvId?: string;
  onCopyLink: () => void;
  copiedLink: boolean;
}

export default function ContactSection({ form, update, cvId, onCopyLink, copiedLink }: ContactSectionProps) {
  const renderInput = (label: string, field: string, type = 'text', placeholder = '', icon: React.ReactNode) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        type={type}
        value={form[field] || ''}
        onChange={e => update(field, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Phone className="w-5 h-5 text-red-500" /> Coordonnées & Visibilité
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderInput('Email de contact', 'email', 'email', 'contact@email.com', <Mail className="w-4 h-4 text-slate-400" />)}
        {renderInput('Téléphone', 'phone', 'tel', '+33 6 00 00 00 00', <Phone className="w-4 h-4 text-slate-400" />)}
        {renderInput('Instagram', 'instagram', 'text', '@toninstagram', <Instagram className="w-4 h-4 text-slate-400" />)}
        {renderInput('Twitter / X', 'twitter', 'text', '@tontwitter', <Twitter className="w-4 h-4 text-slate-400" />)}
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" /> Adresse postale
        </label>
        <textarea
          value={form.address ?? ''}
          onChange={e => update('address', e.target.value)}
          rows={3}
          placeholder="Rue, code postal, ville, pays…"
          className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition text-sm resize-none"
        />
      </div>

      <div className="pt-6 border-t border-slate-700/50">
        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-white font-bold">Confidentialité du CV</p>
              <p className="text-slate-400 text-xs">Si activé, votre CV sera accessible via un lien public.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.is_public} 
                onChange={e => update('is_public', e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {cvId && form.is_public && form.public_slug && (
            <div className="space-y-3 pt-4 border-t border-slate-700/30">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Lien de partage unique</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono truncate flex items-center">
                  {`${window.location.origin}/view/${form.public_slug}`}
                </div>
                <button
                  type="button"
                  onClick={onCopyLink}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-red-600/20"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
