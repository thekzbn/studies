/*
  # Create studies table and storage

  1. New Tables
    - `studies`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `tag` (text, required - AI classification)
      - `pdf_url` (text, required - PDF file URL)
      - `md_url` (text, required - Markdown file URL)
      - `docx_url` (text, required - Word document URL)
      - `date` (timestamptz, required - study date)
      - `created_at` (timestamptz, auto-generated)
      - `updated_at` (timestamptz, auto-generated)

  2. Security
    - Enable RLS on `studies` table
    - Add policy for public read access (since this is a public studies portal)
    - Add policy for authenticated users to manage studies (for admin dashboard)

  3. Storage
    - Create storage bucket for study files
    - Set up policies for file access
*/

-- Create studies table
CREATE TABLE IF NOT EXISTS studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  tag text NOT NULL CHECK (tag IN ('Completely AI', 'AI enhanced', 'AI grammared', 'AI cited', 'Completely me')),
  pdf_url text NOT NULL,
  md_url text NOT NULL,
  docx_url text NOT NULL,
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to studies"
  ON studies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert studies"
  ON studies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update studies"
  ON studies
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete studies"
  ON studies
  FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for study files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('studies', 'studies', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public read access to study files"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'studies');

CREATE POLICY "Allow authenticated users to upload study files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'studies');

CREATE POLICY "Allow authenticated users to update study files"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'studies');

CREATE POLICY "Allow authenticated users to delete study files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'studies');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_studies_updated_at
  BEFORE UPDATE ON studies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();