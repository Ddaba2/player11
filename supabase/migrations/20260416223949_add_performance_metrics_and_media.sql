/*
  # Ajouter colonnes pour métriques de performance et médias

  ## Summary
  Ajoute les champs pour les statistiques de performance et les URLs de vidéos/galerie photos.

  ## New Columns
  - `matches_played` (integer) - nombre de matchs joués
  - `goals` (integer) - nombre de buts marqués
  - `assists` (integer) - nombre de passes décisives
  - `avg_rating` (numeric) - note moyenne des performances
  - `video_links` (jsonb) - tableau d'URLs de vidéos et highlights
  - `action_photos` (jsonb) - tableau d'URLs de photos d'action
  - `logo_url` (text) - URL du logo de l'équipe
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sport_cvs' AND column_name = 'matches_played'
  ) THEN
    ALTER TABLE sport_cvs ADD COLUMN matches_played integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sport_cvs' AND column_name = 'goals'
  ) THEN
    ALTER TABLE sport_cvs ADD COLUMN goals integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sport_cvs' AND column_name = 'assists'
  ) THEN
    ALTER TABLE sport_cvs ADD COLUMN assists integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sport_cvs' AND column_name = 'avg_rating'
  ) THEN
    ALTER TABLE sport_cvs ADD COLUMN avg_rating numeric(3,1) DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sport_cvs' AND column_name = 'video_links'
  ) THEN
    ALTER TABLE sport_cvs ADD COLUMN video_links jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sport_cvs' AND column_name = 'action_photos'
  ) THEN
    ALTER TABLE sport_cvs ADD COLUMN action_photos jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sport_cvs' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE sport_cvs ADD COLUMN logo_url text;
  END IF;
END $$;
