-- Миграция базы данных AgentCore к архитектуре V4 (Direct Checkout Gateway)

-- 1. Удаляем устаревшую таблицу чеков (V3)
DROP TABLE IF EXISTS receipts CASCADE;

-- 2. Создаем таблицу для платежных ссылок (Payment Links)
CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES profiles(id) NOT NULL,
  business_id UUID REFERENCES businesses(id) NOT NULL,
  is_single_use BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  ttl_expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- Ссылка живет 24 часа
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Создаем таблицу для транзакций/платежей (Payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID REFERENCES payment_links(id) NOT NULL,
  amount DECIMAL(12,2) NOT NULL, -- Полная сумма чека
  currency VARCHAR(10) DEFAULT 'IDR',
  discount_amount DECIMAL(12,2) NOT NULL, -- Скидка туристу
  agent_commission DECIMAL(12,2) NOT NULL, -- Доход агента
  platform_fee DECIMAL(12,2) NOT NULL, -- Доход AgentCore
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  terminal_notified BOOLEAN DEFAULT false, -- Для будущей аппаратной пищалки
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем таблицу терминалов (для будущей Hardware интеграции, пока просто задел)
CREATE TABLE IF NOT EXISTS terminals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  mac_address VARCHAR(17) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'online')),
  last_ping_at TIMESTAMP WITH TIME ZONE
);

-- (Опционально) Очистка старых бакетов
-- DROP POLICY IF EXISTS "Public Access for receipts" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
