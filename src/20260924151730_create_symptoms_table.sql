/*
# Create symptoms table for AuraCycle (multi-user, owner-scoped)

1. New Tables
- `symptoms`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user)
  - `symptoms` (text[], default empty array) — list of symptom labels
  - `pain_level` (int, default 0) — pain level 0-5
  - `cycle_day` (int) — which day of the cycle this entry is for
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `symptoms`.
- Owner-scoped CRUD: each authenticated user can only access their own rows.
- user_id defaults to auth.uid() so inserts work without the client passing it.
*/

CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms text[] NOT NULL DEFAULT '{}',
  pain_level int NOT NULL DEFAULT 0,
  cycle_day int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_symptoms" ON symptoms;
CREATE POLICY "select_own_symptoms" ON symptoms FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_symptoms" ON symptoms;
CREATE POLICY "insert_own_symptoms" ON symptoms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_symptoms" ON symptoms;
CREATE POLICY "update_own_symptoms" ON symptoms FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_symptoms" ON symptoms;
CREATE POLICY "delete_own_symptoms" ON symptoms FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_symptoms_user_id ON symptoms(user_id, created_at DESC);
