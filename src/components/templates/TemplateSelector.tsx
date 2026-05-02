import { useState } from 'react';
import { Palette, Eye, Check } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

const templates: Template[] = [
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Design épuré avec accents rouges',
    preview: 'bg-slate-950 border-red-600',
    colors: {
      primary: '#0f172a',
      secondary: '#1e293b',
      accent: '#dc2626',
      background: '#f1f5f9',
      text: '#ffffff'
    }
  },
  {
    id: 'professional',
    name: 'Professionnel',
    description: 'Style classique et élégant',
    preview: 'bg-slate-900 border-blue-600',
    colors: {
      primary: '#1e293b',
      secondary: '#334155',
      accent: '#2563eb',
      background: '#f8fafc',
      text: '#ffffff'
    }
  },
  {
    id: 'minimal',
    name: 'Minimaliste',
    description: 'Design simple et épuré',
    preview: 'bg-white border-gray-400',
    colors: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      accent: '#6b7280',
      background: '#ffffff',
      text: '#111827'
    }
  },
  {
    id: 'sport',
    name: 'Sport',
    description: 'Style dynamique et énergique',
    preview: 'bg-green-900 border-green-600',
    colors: {
      primary: '#14532d',
      secondary: '#166534',
      accent: '#16a34a',
      background: '#f0fdf4',
      text: '#ffffff'
    }
  },
  {
    id: 'elegant',
    name: 'Élégant',
    description: 'Design sophistiqué premium',
    preview: 'bg-purple-900 border-purple-600',
    colors: {
      primary: '#581c87',
      secondary: '#6b21a8',
      accent: '#9333ea',
      background: '#faf5ff',
      text: '#ffffff'
    }
  }
];

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
}

export default function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-bold text-white">Template du CV</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
              selectedTemplate === template.id
                ? 'border-red-500 shadow-lg shadow-red-500/20'
                : 'border-slate-700 hover:border-slate-600'
            }`}
            onClick={() => onTemplateChange(template.id)}
            onMouseEnter={() => setPreviewTemplate(template.id)}
            onMouseLeave={() => setPreviewTemplate(null)}
          >
            {/* Preview miniature */}
            <div className={`h-32 ${template.preview} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
              <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full" />
              <div className="absolute bottom-2 left-2 right-2">
                <div className="h-1 bg-white/30 rounded" />
                <div className="h-1 bg-white/20 rounded mt-1" />
                <div className="h-1 bg-white/10 rounded mt-1" />
              </div>
              
              {/* Badge de sélection */}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Informations */}
            <div className="p-3 bg-slate-800">
              <h4 className="font-bold text-white text-sm">{template.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{template.description}</p>
              
              {/* Palette de couleurs */}
              <div className="flex gap-1 mt-2">
                <div 
                  className="w-4 h-4 rounded-full border border-slate-600"
                  style={{ backgroundColor: template.colors.primary }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-slate-600"
                  style={{ backgroundColor: template.colors.accent }}
                />
                <div 
                  className="w-4 h-4 rounded-full border border-slate-600"
                  style={{ backgroundColor: template.colors.background }}
                />
              </div>
            </div>

            {/* Overlay de preview */}
            {previewTemplate === template.id && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex items-center gap-2 text-white">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-medium">Aperçu</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Description du template sélectionné */}
      <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-sm text-slate-300">
          Template actuel : <span className="font-bold text-white">
            {templates.find(t => t.id === selectedTemplate)?.name}
          </span>
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {templates.find(t => t.id === selectedTemplate)?.description}
        </p>
      </div>
    </div>
  );
}
