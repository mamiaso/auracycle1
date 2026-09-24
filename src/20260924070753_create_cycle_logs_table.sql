/*
# Create cycle_logs table for period tracking

1. New Tables
- `cycle_logs`
  - `id` (uuid, primary key)
  - `date` (date, not null) — the calendar day the entry refers to
  - `flow` (text) — flow level: 'none', 'spotting', 'light', 'medium', 'heavy'
  - `mood` (text) — mood label: 'great', 'good', 'okay', 'low', 'anxious', 'irritable'
  - `symptoms` (text[]) — array of symptom tags: cramps, headache, bloating, fatigue, acne, breast_tenderness, backache, nausea, cravings, insomnia
  - `temperature` (numeric, nullable) — basal body temperature in °C
  - `notes` (text, nullable) — free-form journal note
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- `cycle_settings` (single row table for app preferences)
  - `id` (int, primary key, default 1)
  - `avg_cycle_length` (int, default 28)
  - `avg_period_length` (int, default 5)
  - `last_period_start` (date, nullable) — seed date for predictions
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- Single-tenant no-auth app: allow anon + authenticated full CRUD (data is intentionally shared).
*/

CREATE TABLE IF NOT EXISTS cycle_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  flow text NOT NULL DEFAULT 'none',
  mood text,
  symptoms text[] DEFAULT '{}',
  temperature numeric,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cycle_settings (
  id int PRIMARY KEY DEFAULT 1,
  avg_cycle_length int NOT NULL DEFAULT 28,
  avg_period_length int NOT NULL DEFAULT 5,
  last_period_start date,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cycle_logs" ON cycle_logs;
CREATE POLICY "anon_select_cycle_logs" ON cycle_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cycle_logs" ON cycle_logs;
CREATE POLICY "anon_insert_cycle_logs" ON cycle_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cycle_logs" ON cycle_logs;
CREATE POLICY "anon_update_cycle_logs" ON cycle_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cycle_logs" ON cycle_logs;
CREATE POLICY "anon_delete_cycle_logs" ON cycle_logs FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_cycle_settings" ON cycle_settings;
CREATE POLICY "anon_select_cycle_settings" ON cycle_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cycle_settings" ON cycle_settings;
CREATE POLICY "anon_insert_cycle_settings" ON cycle_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cycle_settings" ON cycle_settings;
CREATE POLICY "anon_update_cycle_settings" ON cycle_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cycle_settings" ON cycle_settings;
CREATE POLICY "anon_delete_cycle_settings" ON cycle_settings FOR DELETE
  TO anon, authenticated USING (true);

-- Seed default settings row
INSERT INTO cycle_settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_cycle_logs_date ON cycle_logs(date DESC);
