/*
  # Harden input validation for public inserts

  ## Summary
  Adds DB-level constraints to reduce abuse and malformed payloads.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cv_feedback_comments_author_name_len'
  ) THEN
    ALTER TABLE cv_feedback_comments
      ADD CONSTRAINT cv_feedback_comments_author_name_len
      CHECK (char_length(author_name) BETWEEN 1 AND 120);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cv_feedback_comments_content_len'
  ) THEN
    ALTER TABLE cv_feedback_comments
      ADD CONSTRAINT cv_feedback_comments_content_len
      CHECK (char_length(content) BETWEEN 1 AND 2000);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cv_feedback_comments_author_email_len'
  ) THEN
    ALTER TABLE cv_feedback_comments
      ADD CONSTRAINT cv_feedback_comments_author_email_len
      CHECK (author_email IS NULL OR char_length(author_email) <= 160);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cv_view_events_viewer_name_len'
  ) THEN
    ALTER TABLE cv_view_events
      ADD CONSTRAINT cv_view_events_viewer_name_len
      CHECK (viewer_name IS NULL OR char_length(viewer_name) <= 120);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cv_view_events_viewer_email_len'
  ) THEN
    ALTER TABLE cv_view_events
      ADD CONSTRAINT cv_view_events_viewer_email_len
      CHECK (viewer_email IS NULL OR char_length(viewer_email) <= 160);
  END IF;
END $$;
