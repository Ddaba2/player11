export interface ValidationErrors {
  [field: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export function generatePublicSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-\u00C0-\u024F]/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50);
  
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return `${base}-${uniqueId}`;
}

export function validateCVField(field: string, value: unknown): string | null {
  switch (field) {
    case 'full_name':
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return 'Le nom complet est requis';
      }
      if (typeof value === 'string' && value.trim().length < 2) {
        return 'Le nom doit contenir au moins 2 caractères';
      }
      return null;

    case 'sport':
      if (!value || (typeof value === 'string' && value.trim().length === 0)) {
        return 'Le sport est requis';
      }
      return null;

    case 'position':
      if (typeof value === 'string' && value.trim().length > 0 && value.trim().length < 2) {
        return 'Le poste doit contenir au moins 2 caractères';
      }
      return null;

    case 'email':
      if (typeof value === 'string' && value.trim().length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          return 'Email invalide';
        }
      }
      return null;

    case 'phone':
      if (typeof value === 'string' && value.trim().length > 0) {
        const phoneRegex = /^[\d\s\+\-\(\)]{6,20}$/;
        if (!phoneRegex.test(value.trim())) {
          return 'Numéro de téléphone invalide';
        }
      }
      return null;

    case 'height':
      if (value !== null && value !== undefined && value !== '') {
        const height = typeof value === 'string' ? parseInt(value, 10) : value as number;
        if (Number.isFinite(height) && (height < 100 || height > 250)) {
          return 'La taille doit être entre 100 et 250 cm';
        }
      }
      return null;

    case 'weight':
      if (value !== null && value !== undefined && value !== '') {
        const weight = typeof value === 'string' ? parseInt(value, 10) : value as number;
        if (Number.isFinite(weight) && (weight < 30 || weight > 200)) {
          return 'Le poids doit être entre 30 et 200 kg';
        }
      }
      return null;

    case 'instagram':
      if (typeof value === 'string' && value.trim().length > 0) {
        if (value.trim().length < 2) {
          return 'Nom d\'utilisateur Instagram trop court';
        }
      }
      return null;

    case 'twitter':
      if (typeof value === 'string' && value.trim().length > 0) {
        if (value.trim().length < 2) {
          return 'Nom d\'utilisateur Twitter trop court';
        }
      }
      return null;

    default:
      return null;
  }
}

export function validateCVForm(form: Record<string, unknown>): ValidationResult {
  const errors: ValidationErrors = {};
  
  // Validate all fields
  const fieldsToValidate = [
    'full_name', 'sport', 'position', 'email', 'phone',
    'height', 'weight', 'instagram', 'twitter'
  ];

  fieldsToValidate.forEach(field => {
    const error = validateCVField(field, form[field]);
    if (error) {
      errors[field] = error;
    }
  });

  // Validate career entries
  if (Array.isArray(form.career)) {
    form.career.forEach((entry: any, index: number) => {
      if (!entry.club || entry.club.trim().length === 0) {
        errors[`career.${index}.club`] = 'Le nom du club est requis';
      }
      if (!entry.role || entry.role.trim().length === 0) {
        errors[`career.${index}.role`] = 'Le poste est requis';
      }
    });
  }

  // Validate video links
  if (Array.isArray(form.video_links)) {
    form.video_links.forEach((video: any, index: number) => {
      if (video.url && video.url.trim().length > 0) {
        try {
          new URL(video.url);
        } catch {
          errors[`video_links.${index}.url`] = 'URL invalide';
        }
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
