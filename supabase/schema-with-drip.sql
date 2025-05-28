-- Enhanced schema with DRIP integration points

-- Users table (enhanced for DRIP)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_id TEXT UNIQUE NOT NULL,
  handle TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  points INTEGER DEFAULT 0,
  drip_account_id TEXT, -- DRIP account reference
  drip_realm_member_id TEXT, -- DRIP realm member reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_users_twitter_id ON users(twitter_id);
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_drip_account ON users(drip_account_id);

-- Quests table (enhanced for DRIP)
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('follow', 'post', 'reply', 'repost', 'quote', 'drip_action')),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  drip_currency_id TEXT, -- DRIP currency reference
  drip_activation_id TEXT, -- DRIP activation reference
  metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User quest completions
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  drip_transaction_id TEXT, -- DRIP transaction reference
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Posts tracking (enhanced for DRIP)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tweet_id TEXT UNIQUE NOT NULL,
  content TEXT,
  points INTEGER NOT NULL,
  bonus_type TEXT CHECK (bonus_type IN ('reply', 'repost', 'quote', 'viral')),
  drip_transaction_id TEXT, -- DRIP transaction reference
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for posts
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_tweet_id ON posts(tweet_id);

-- DRIP sync log (for tracking DRIP API interactions)
CREATE TABLE IF NOT EXISTS drip_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'points_award', 'quest_complete', 'balance_sync'
  drip_response JSONB,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert enhanced quests with DRIP integration points
INSERT INTO quests (type, title, description, points, metadata) VALUES
  ('follow', 'Follow @grindcoin', 'Follow the official GRIND account on X', 100, '{"twitter_action": "follow", "target": "grindcoin"}'),
  ('post', 'Post about $GRIND', 'Create a post mentioning $GRIND token', 200, '{"twitter_action": "post", "required_text": "$GRIND"}'),
  ('reply', 'Reply to a $GRIND post', 'Reply to any post about $GRIND', 50, '{"twitter_action": "reply", "target_hashtag": "$GRIND"}'),
  ('repost', 'Repost $GRIND content', 'Repost content about $GRIND', 75, '{"twitter_action": "repost", "target_hashtag": "$GRIND"}'),
  ('drip_action', 'Connect DRIP Account', 'Link your account to DRIP for enhanced rewards', 500, '{"drip_action": "account_link"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert mock users for testing
INSERT INTO users (twitter_id, handle, name, avatar, points) VALUES
  ('mock_user_1', 'grindmaster', 'Grind Master', 'https://api.dicebear.com/7.x/avataaars/svg?seed=grindmaster', 2500),
  ('mock_user_2', 'cryptoqueen', 'Crypto Queen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cryptoqueen', 2200),
  ('mock_user_3', 'tokenking', 'Token King', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tokenking', 1800),
  ('mock_user_4', 'dripfan', 'DRIP Fan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dripfan', 1500),
  ('mock_user_5', 'grindninja', 'Grind Ninja', 'https://api.dicebear.com/7.x/avataaars/svg?seed=grindninja', 1200),
  ('mock_user_6', 'socialape', 'Social Ape', 'https://api.dicebear.com/7.x/avataaars/svg?seed=socialape', 1000),
  ('mock_user_7', 'questlord', 'Quest Lord', 'https://api.dicebear.com/7.x/avataaars/svg?seed=questlord', 800),
  ('mock_user_8', 'pointshunter', 'Points Hunter', 'https://api.dicebear.com/7.x/avataaars/svg?seed=pointshunter', 600),
  ('mock_user_9', 'grindbot', 'Grind Bot', 'https://api.dicebear.com/7.x/avataaars/svg?seed=grindbot', 400),
  ('mock_user_10', 'newbie', 'Grind Newbie', 'https://api.dicebear.com/7.x/avataaars/svg?seed=newbie', 200)
ON CONFLICT (twitter_id) DO NOTHING;

-- Insert mock quest completions
INSERT INTO user_quests (user_id, quest_id) 
SELECT u.id, q.id 
FROM users u, quests q 
WHERE u.handle IN ('grindmaster', 'cryptoqueen', 'tokenking') 
  AND q.type IN ('follow', 'post')
ON CONFLICT (user_id, quest_id) DO NOTHING;

-- Insert mock posts
INSERT INTO posts (user_id, tweet_id, content, points, bonus_type) VALUES
  ((SELECT id FROM users WHERE handle = 'grindmaster'), 'tweet_1', 'Just earned 200 points on $GRIND! 🚀', 200, 'viral'),
  ((SELECT id FROM users WHERE handle = 'cryptoqueen'), 'tweet_2', 'Loving the $GRIND community! Great vibes 💎', 200, 'quote'),
  ((SELECT id FROM users WHERE handle = 'tokenking'), 'tweet_3', '$GRIND to the moon! 🌙', 200, 'repost'),
  ((SELECT id FROM users WHERE handle = 'dripfan'), 'tweet_4', 'DRIP + GRIND = Perfect combo! 🔥', 200, 'reply')
ON CONFLICT (tweet_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read all users (for leaderboard)
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

-- Users can view all quest completions (for leaderboard context)
CREATE POLICY "Quest completions are viewable by everyone" 
ON user_quests FOR SELECT 
USING (true);

-- Users can view all posts (for social features)
CREATE POLICY "Posts are viewable by everyone" 
ON posts FOR SELECT 
USING (true);

-- Users can view their own DRIP sync logs
CREATE POLICY "Users can view their own DRIP sync logs" 
ON drip_sync_log FOR SELECT 
USING (auth.uid()::text = (SELECT twitter_id FROM users WHERE id = user_id)); 