/*
  # Add viewer identity and CV feedback comments

  ## Summary
  - Enriches `cv_view_events` with visitor identity fields.
  - Adds a new table `cv_feedback_comments` for public feedback on shared CVs.
*/

ALTER TABLE cv_view_events
  ADD COLUMN IF NOT EXISTS viewer_name text,
  ADD COLUMN IF NOT EXISTS viewer_email text;

CREATE TABLE IF NOT EXISTS cv_feedback_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cv_id uuid NOT NULL REFERENCES sport_cvs(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cv_feedback_comments_cv_created
  ON cv_feedback_comments(cv_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cv_feedback_comments_owner_created
  ON cv_feedback_comments(owner_user_id, created_at DESC);

ALTER TABLE cv_feedback_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view feedback comments" ON cv_feedback_comments;
CREATE POLICY "Owners can view feedback comments"
  ON cv_feedback_comments FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_user_id);

DROP POLICY IF EXISTS "Public can view comments for public CVs" ON cv_feedback_comments;
CREATE POLICY "Public can view comments for public CVs"
  ON cv_feedback_comments FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM sport_cvs
      WHERE sport_cvs.id = cv_feedback_comments.cv_id
      AND sport_cvs.is_public = true
    )
  );

DROP POLICY IF EXISTS "Public can insert comments for public CVs" ON cv_feedback_comments;
CREATE POLICY "Public can insert comments for public CVs"
  ON cv_feedback_comments FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM sport_cvs
      WHERE sport_cvs.id = cv_feedback_comments.cv_id
      AND sport_cvs.is_public = true
    )
    AND length(trim(author_name)) > 0
    AND length(trim(content)) > 0
  );
