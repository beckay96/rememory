/*
  # Rememory Database Schema

  1. New Tables
    - `users` - User profiles with neurotype preferences
    - `user_preferences` - Accessibility and UI settings
    - `memory_entries` - Memory Map entries
    - `tasks` - Critical Compass tasks and priorities
    - `anchors` - Life anchor reminders and mantras
    - `events` - Upcoming appointments and events
    - `regroup_tools` - Calming and recovery tools
    - `brain_bucks_ledger` - Transaction log for gamification
    - `brain_buck_rewards` - Custom user-defined rewards
    - `subscriptions` - Stripe subscription tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  nickname text,
  neurotype_tags text[] DEFAULT '{}',
  brain_bucks_balance integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  subscription_status text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User preferences for accessibility
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  animations_enabled boolean DEFAULT true,
  theme_mode text DEFAULT 'light',
  reminder_frequency text DEFAULT 'daily',
  sound_enabled boolean DEFAULT true,
  high_contrast boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Memory Map entries
CREATE TABLE IF NOT EXISTS memory_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  entry_date date NOT NULL,
  tags text[] DEFAULT '{}',
  emotional_tone text,
  memory_type text DEFAULT 'moment',
  voice_note_url text,
  image_url text,
  has_reminder boolean DEFAULT false,
  reminder_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Critical Compass tasks
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority_level integer DEFAULT 1,
  is_completed boolean DEFAULT false,
  due_date date,
  completed_at timestamptz,
  minutes_late integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Life anchors
CREATE TABLE IF NOT EXISTS anchors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  anchor_type text DEFAULT 'mantra',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events and appointments
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  location text,
  reminder_minutes integer DEFAULT 60,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Regroup tools
CREATE TABLE IF NOT EXISTS regroup_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  tool_type text DEFAULT 'breathing',
  instructions text,
  duration_minutes integer DEFAULT 5,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Brain Bucks transaction ledger
CREATE TABLE IF NOT EXISTS brain_bucks_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  amount integer NOT NULL,
  description text,
  reference_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Custom rewards
CREATE TABLE IF NOT EXISTS brain_buck_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cost integer NOT NULL,
  category text DEFAULT 'treat',
  is_redeemed boolean DEFAULT false,
  redeemed_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_name text DEFAULT 'brain_boost_monthly',
  status text DEFAULT 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE regroup_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_bucks_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE brain_buck_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- Policies for user_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Policies for memory_entries
CREATE POLICY "Users can manage own memories"
  ON memory_entries FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Policies for tasks
CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Policies for anchors
CREATE POLICY "Users can manage own anchors"
  ON anchors FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Policies for events
CREATE POLICY "Users can manage own events"
  ON events FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Policies for regroup_tools
CREATE POLICY "Users can manage own regroup tools"
  ON regroup_tools FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Policies for brain_bucks_ledger
CREATE POLICY "Users can view own brain bucks"
  ON brain_bucks_ledger FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can add brain bucks transactions"
  ON brain_bucks_ledger FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Policies for brain_buck_rewards
CREATE POLICY "Users can manage own rewards"
  ON brain_buck_rewards FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own subscription"
  ON subscriptions FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Insert default regroup tools
INSERT INTO regroup_tools (user_id, title, description, tool_type, instructions, duration_minutes) VALUES
  ('00000000-0000-0000-0000-000000000000', '4-7-8 Breathing', 'Calming breath technique', 'breathing', 'Inhale for 4, hold for 7, exhale for 8. Repeat 4 times.', 3),
  ('00000000-0000-0000-0000-000000000000', 'Grounding 5-4-3-2-1', 'Sensory grounding technique', 'grounding', 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.', 5),
  ('00000000-0000-0000-0000-000000000000', 'Progressive Muscle Relaxation', 'Release physical tension', 'relaxation', 'Tense and release each muscle group, starting from toes to head.', 10);