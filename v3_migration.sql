-- Миграция базы данных AgentCore к архитектуре V3 (B2B2C Cashback)

-- 1. Обновляем допустимые роли пользователей (добавляем 'tourist')
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('partner', 'business', 'admin', 'tourist'));

-- Добавляем agent_id для привязки туриста к промоутеру
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES profiles(id);

-- 2. Создаем таблицу кошельков (wallets) для хранения виртуального баланса
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  balance DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'IDR',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Триггер для автоматического обновления updated_at в wallets
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_wallet_timestamp ON wallets;
CREATE TRIGGER trg_update_wallet_timestamp
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

-- Автоматически создаем кошельки для всех существующих профилей (если нужно)
INSERT INTO wallets (profile_id)
SELECT id FROM profiles
ON CONFLICT (profile_id) DO NOTHING;

-- 3. Создаем таблицу для чеков (receipts)
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tourist_id UUID REFERENCES profiles(id) NOT NULL,
  venue_id UUID REFERENCES businesses(id) NOT NULL,
  image_url TEXT NOT NULL,
  amount DECIMAL(12,2), -- Сумма чека (может быть null до проверки)
  cashback_amount DECIMAL(12,2), -- Рассчитанный кэшбек (пойдет на баланс туриста)
  commission_amount DECIMAL(12,2), -- Рассчитанная комиссия (пойдет агенту)
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES profiles(id) -- ID админа, проверившего чек
);

-- 4. Настраиваем Storage для чеков
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Политики для receipts bucket
CREATE POLICY "Public Access for receipts" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can upload receipts" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'receipts' AND 
    auth.role() = 'authenticated'
);

-- (Опционально) Удаляем таблицы, связанные с Cashier PWA, если они больше не нужны.
-- DROP TABLE IF EXISTS referral_sessions CASCADE;
