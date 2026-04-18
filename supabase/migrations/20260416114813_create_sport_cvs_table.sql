/*
  # Create sport_cvs table

  ## Summary
  Creates the main table for storing sports CVs (athlete profiles).

  ## New Tables
  - `sport_cvs`
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK to auth.users)
    - `full_name` (text) - athlete's full name
    - `sport` (text) - sport discipline
    - `position` (text) - playing position/role
    - `nationality` (text) - country
    - `date_of_birth` (date) - for age calculation
    - `photo_url` (text) - profile photo URL
    - `height` (integer) - height in cm
    - `weight` (integer) - weight in kg
    - `dominant_side` (text) - left/right/both
    - `email` (text) - contact email
    - `phone` (text) - contact phone
    - `instagram` (text) - instagram handle
    - `twitter` (text) - twitter handle
    - `current_club` (text) - current club/team
    - `bio` (text) - athlete biography
    - `career` (jsonb) - array of career entries {club, role, start_year, end_year, description}
    - `achievements` (jsonb) - array of achievements {title, year, description}
    - `skills` (jsonb) - array of skills {name, level (0-100)}
    - `is_public` (boolean) - whether CV is publicly accessible
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - Users can only read/write their own CVs
  - Public CVs are readable by anyone (for sharing)
*/

CREATE TABLE IF NOT EXISTS sport_cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  sport text NOT NULL DEFAULT '',
  position text NOT NULL DEFAULT '',
  nationality text NOT NULL DEFAULT '',
  date_of_birth date,
  photo_url text,
  height integer,
  weight integer,
  dominant_side text DEFAULT 'right',
  email text DEFAULT '',
  phone text DEFAULT '',
  instagram text DEFAULT '',
  twitter text DEFAULT '',
  current_club text DEFAULT '',
  bio text DEFAULT '',
  career jsonb DEFAULT '[]'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  skills jsonb DEFAULT '[]'::jsonb,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sport_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own CVs"
  ON sport_cvs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public CVs"
  ON sport_cvs FOR SELECT
  TO anon
  USING (is_public = true);

CREATE POLICY "Authenticated users can view public CVs"
  ON sport_cvs FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs"
  ON sport_cvs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CVs"
  ON sport_cvs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own CVs"
  ON sport_cvs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sport_cvs_updated_at
  BEFORE UPDATE ON sport_cvs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
