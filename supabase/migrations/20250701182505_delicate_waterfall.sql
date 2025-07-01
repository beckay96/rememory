/*
  # Create user preferences table and fix signup issues

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users table)
      - `animations_enabled` (boolean, default true)
      - `theme_mode` (text, default 'light')
      - `reminder_frequency` (text, default 'daily')
      - `sound_enabled` (boolean, default true)
      - `high_contrast` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_preferences` table
    - Add policies for authenticated users to manage their own preferences

  3. Triggers
    - Add updated_at trigger for user_preferences table
    - Ensure handle_new_user trigger creates default preferences
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  animations_enabled boolean DEFAULT true,
  theme_mode text DEFAULT 'light',
  reminder_frequency text DEFAULT 'daily',
  sound_enabled boolean DEFAULT true,
  high_contrast boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user_preferences
CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_preferences.user_id));

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_preferences.user_id));

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_preferences.user_id));

CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT auth_id FROM users WHERE id = user_preferences.user_id));

-- Add updated_at trigger for user_preferences
CREATE OR REPLACE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Update the handle_new_user function to create default preferences
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert new user profile
  INSERT INTO users (auth_id, name, nickname, neurotype_tags)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.raw_user_meta_data->>'nickname', COALESCE(ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'neurotype_tags')), ARRAY[]::text[]))
  RETURNING id INTO new_user_id;
  
  -- Insert default preferences
  INSERT INTO user_preferences (user_id)
  VALUES (new_user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add updated_at trigger for users table if it doesn't exist
CREATE OR REPLACE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger for memory_entries table if it doesn't exist
CREATE OR REPLACE TRIGGER update_memory_entries_updated_at
  BEFORE UPDATE ON memory_entries
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger for tasks table if it doesn't exist
CREATE OR REPLACE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Add updated_at trigger for brain_buck_rewards table if it doesn't exist
CREATE OR REPLACE TRIGGER update_brain_buck_rewards_updated_at
  BEFORE UPDATE ON brain_buck_rewards
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();