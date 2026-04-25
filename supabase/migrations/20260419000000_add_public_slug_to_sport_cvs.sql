-- Add public_slug column for shareable public links
ALTER TABLE sport_cvs ADD COLUMN IF NOT EXISTS public_slug TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sport_cvs_public_slug ON sport_cvs(public_slug);

-- Add comment
COMMENT ON COLUMN sport_cvs.public_slug IS 'Unique slug for public CV sharing URLs';
