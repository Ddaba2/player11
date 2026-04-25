export interface CareerEntry {
  id: string;
  club: string;
  league?: string;
  country?: string;
  role: string;
  start_year: string;
  end_year: string;
  matches_played?: number;
  matches_started?: number;
  minutes_played?: number;
  yellow_cards?: number;
  red_cards?: number;
  interceptions_per_match?: number;
  successful_tackles?: number;
  duels_won_pct?: number;
  clearances?: number;
  pass_success_pct?: number;
  key_passes?: number;
  balls_recovered?: number;
  goals?: number;
  shots_on_target?: number;
  description: string;
}

export interface Achievement {
  id: string;
  title: string;
  year: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
}

export interface VideoLink {
  id: string;
  title: string;
  url: string;
}

export interface ActionPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface SportCV {
  id: string;
  user_id: string;
  full_name: string;
  sport: string;
  position: string;
  nationality: string;
  date_of_birth: string | null;
  photo_url: string | null;
  height: number | null;
  weight: number | null;
  dominant_side: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  twitter: string;
  current_club: string;
  bio: string;
  career: CareerEntry[];
  achievements: Achievement[];
  skills: Skill[];
  matches_played: number;
  goals: number;
  assists: number;
  avg_rating: number | null;
  video_links: VideoLink[];
  action_photos: ActionPhoto[];
  logo_url: string | null;
  is_public: boolean;
  public_slug: string | null;
  theme: 'classic' | 'modern' | 'scout';
  created_at: string;
  updated_at: string;
}

export const SPORTS = [
  'Football', 'Basketball', 'Tennis', 'Rugby', 'Natation', 'Athlétisme',
  'Handball', 'Volleyball', 'Cyclisme', 'Boxe', 'Judo', 'Karaté',
  'Ski', 'Gymnastique', 'Triathlon', 'MMA', 'Autre'
];

export const DOMINANT_SIDES: Record<string, string[]> = {
  Football: ['Pied droit', 'Pied gauche', 'Les deux'],
  Basketball: ['Main droite', 'Main gauche', 'Les deux'],
  Tennis: ['Droitier', 'Gaucher'],
  Rugby: ['Droit', 'Gauche', 'Les deux'],
  default: ['Droit', 'Gauche', 'Les deux'],
};
