-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_id TEXT UNIQUE NOT NULL,
  handle TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_twitter_id ON users(twitter_id);
CREATE INDEX idx_users_points ON users(points DESC);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('follow', 'post', 'reply', 'repost', 'quote')),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User quest completions
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Posts tracking
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tweet_id TEXT UNIQUE NOT NULL,
  content TEXT,
  points INTEGER NOT NULL,
  bonus_type TEXT CHECK (bonus_type IN ('reply', 'repost', 'quote', 'viral')),
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_tweet_id ON posts(tweet_id);

-- Insert default quests
INSERT INTO quests (type, title, description, points) VALUES
  ('follow', 'Follow @grindcoin', 'Follow the official GRIND account', 100),
  ('post', 'Post about $GRIND', 'Create a post mentioning $GRIND', 200),
  ('reply', 'Reply to a $GRIND post', 'Reply to any post about $GRIND', 50),
  ('repost', 'Repost $GRIND content', 'Repost content about $GRIND', 75)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all users
CREATE POLICY "Users are viewable by everyone" 
ON users FOR SELECT 
USING (true);

-- Users can update their own record
CREATE POLICY "Users can update their own record" 
ON users FOR UPDATE 
USING (auth.uid()::text = twitter_id);

-- Quests are viewable by everyone
CREATE POLICY "Quests are viewable by everyone" 
ON quests FOR SELECT 
USING (true);

-- Users can view their own quest completions
CREATE POLICY "Users can view their own quest completions" 
ON user_quests FOR SELECT 
USING (auth.uid()::text = (SELECT twitter_id FROM users WHERE id = user_id));

-- Users can view their own posts
CREATE POLICY "Users can view their own posts" 
ON posts FOR SELECT 
USING (auth.uid()::text = (SELECT twitter_id FROM users WHERE id = user_id)); 