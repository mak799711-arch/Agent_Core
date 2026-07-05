-- User Profiles (Расширение Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role VARCHAR(50) NOT NULL CHECK (role IN ('partner', 'business', 'admin')),
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  card_bound BOOLEAN DEFAULT FALSE,
  card_number VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'USD',
  language VARCHAR(10) DEFAULT 'en',
  theme VARCHAR(20) DEFAULT 'dark',
  status VARCHAR(50) DEFAULT 'unverified',
  phone VARCHAR(50),
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses (Информация о заведении)
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  reserve_balance DECIMAL(12,2) DEFAULT 0.00, -- Reserve Protection Layer
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers (Предложения бизнеса)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  reward_amount DECIMAL(10,2) NOT NULL, -- Сколько получает партнер
  reward_type VARCHAR(50) DEFAULT 'fixed', -- 'fixed' или 'percentage'
  reward_percent DECIMAL(5,2), -- % если reward_type = 'percentage'
  average_bill DECIMAL(10,2), -- Средний чек для просчета
  category VARCHAR(50) DEFAULT 'activity',
  conditions TEXT,
  is_active BOOLEAN DEFAULT TRUE, -- Отключается, если reserve_balance < reward_amount
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral Sessions (Passive Referral System)
CREATE TABLE referral_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES profiles(id) NOT NULL,
  offer_id UUID REFERENCES offers(id) NOT NULL,
  business_id UUID REFERENCES businesses(id) NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL, -- Для ручного ввода
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Wallets & Transactions (Система выплат)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('reward', 'withdrawal', 'deposit', 'fee')),
  session_id UUID REFERENCES referral_sessions(id), -- Nullable, только для type = 'reward'
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
