-- Physical mailing address for CV contact block
ALTER TABLE sport_cvs ADD COLUMN IF NOT EXISTS address text DEFAULT '';
