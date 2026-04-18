/*
  # CV view events

  Tracks public-link opens so CV owners can be notified.
*/

CREATE TABLE IF NOT EXISTS cv_view_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES sport_cvs(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'public_link',
  viewer_user_agent text,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cv_view_events_owner_viewed_at
  ON cv_view_events(owner_user_id, viewed_at DESC);

ALTER TABLE cv_view_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their CV view events"
  ON cv_view_events FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

CREATE POLICY "Public can insert CV view events"
  ON cv_view_events FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

