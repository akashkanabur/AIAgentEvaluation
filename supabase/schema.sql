-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluation_configs table
CREATE TABLE IF NOT EXISTS evaluation_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  run_policy TEXT DEFAULT 'always',
  sample_rate_pct INTEGER DEFAULT 100,
  obfuscate_pii BOOLEAN DEFAULT false,
  max_eval_per_day INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  interaction_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  score DECIMAL(3,2),
  latency_ms INTEGER,
  flags TEXT[],
  pii_tokens_redacted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_evaluations_user_created ON evaluations(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_evaluation_configs_user_id ON evaluation_configs(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Own data only" ON profiles;
DROP POLICY IF EXISTS "Own data only" ON evaluation_configs;
DROP POLICY IF EXISTS "Own data only" ON evaluations;

-- Create RLS policies
CREATE POLICY "profiles_policy" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "configs_policy" ON evaluation_configs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "evaluations_policy" ON evaluations FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.evaluation_configs (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();