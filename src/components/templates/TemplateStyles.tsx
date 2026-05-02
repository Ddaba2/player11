export interface TemplateColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export const templateStyles: Record<string, TemplateColors> = {
  modern: {
    primary: '#0f172a',
    secondary: '#1e293b',
    accent: '#dc2626',
    background: '#f1f5f9',
    text: '#ffffff'
  },
  professional: {
    primary: '#1e293b',
    secondary: '#334155',
    accent: '#2563eb',
    background: '#f8fafc',
    text: '#ffffff'
  },
  minimal: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    accent: '#6b7280',
    background: '#ffffff',
    text: '#111827'
  },
  sport: {
    primary: '#14532d',
    secondary: '#166534',
    accent: '#16a34a',
    background: '#f0fdf4',
    text: '#ffffff'
  },
  elegant: {
    primary: '#581c87',
    secondary: '#6b21a8',
    accent: '#9333ea',
    background: '#faf5ff',
    text: '#ffffff'
  }
};

export const getTemplateStyles = (templateId: string) => {
  const colors = templateStyles[templateId] || templateStyles.modern;
  
  return {
    container: {
      backgroundColor: colors.primary,
      color: colors.text
    },
    header: {
      background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
      borderColor: colors.accent
    },
    sidebar: {
      backgroundColor: colors.secondary,
      color: colors.text
    },
    content: {
      backgroundColor: colors.background,
      color: '#111827'
    },
    accent: {
      color: colors.accent,
      borderColor: colors.accent
    },
    metrics: {
      backgroundColor: colors.accent + '20',
      borderColor: colors.accent,
      color: colors.accent
    },
    footer: {
      backgroundColor: colors.primary,
      color: colors.text,
      borderTopColor: colors.accent
    }
  };
};
