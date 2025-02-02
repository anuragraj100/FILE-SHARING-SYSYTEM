/*
  # File Sharing System Schema

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `name` (text) - Original filename
      - `size` (bigint) - File size in bytes
      - `type` (text) - MIME type
      - `path` (text) - Storage path
      - `created_at` (timestamptz) - Upload timestamp

  2. Security
    - Enable RLS on `files` table
    - Add policies for authenticated users to manage their files
*/

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  size bigint NOT NULL,
  type text NOT NULL,
  path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own files
CREATE POLICY "Users can view their own files"
  ON files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to upload files
CREATE POLICY "Users can upload files"
  ON files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
  ON files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);