-- V5 Finance Core Migration (Xendit Split Payments & Wallets)

-- 1. Создаем ENUM типы для статусов
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE split_status AS ENUM ('pending', 'applied', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('commission_credit', 'withdrawal_debit', 'refund_debit', 'adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Таблица платежей от туристов (Gross)
CREATE TABLE IF NOT EXISTS tourist_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID,
    booking_id UUID, -- Опционально пока нет бронирований
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'IDR',
    status payment_status DEFAULT 'pending',
    external_id TEXT UNIQUE, -- ID из Xendit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Разбитие суммы (Global Margin)
CREATE TABLE IF NOT EXISTS payment_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES tourist_payments(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL,
    gross_amount NUMERIC(15, 2) NOT NULL,
    business_share NUMERIC(15, 2) NOT NULL,
    agent_commission NUMERIC(15, 2) NOT NULL,
    platform_commission NUMERIC(15, 2) NOT NULL,
    status split_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Важное правило: проверяем, что сумма частей бьется с Gross
    CONSTRAINT check_split_sum CHECK (business_share + agent_commission + platform_commission = gross_amount)
);

-- 4. Балансы агентов (Wallet)
CREATE TABLE IF NOT EXISTS agent_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL UNIQUE,
    balance NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Журнал транзакций кошелька (Ledger)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES agent_wallets(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Заявки на вывод средств
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL, 
    wallet_id UUID NOT NULL REFERENCES agent_wallets(id),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    status withdrawal_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Триггер для автоматического обновления баланса кошелька
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE agent_wallets
    SET balance = balance + NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.wallet_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_wallet_balance ON wallet_transactions;
CREATE TRIGGER trg_update_wallet_balance
AFTER INSERT ON wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION update_wallet_balance();

-- Добавление RLS (Row Level Security) политик
ALTER TABLE agent_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourist_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Политики (примеры, чтобы не блокировать админов и систему)
DROP POLICY IF EXISTS "Агенты видят только свои кошельки" ON agent_wallets;
CREATE POLICY "Агенты видят только свои кошельки"
ON agent_wallets FOR SELECT
USING (auth.uid() = agent_id);

-- Таблица для идемпотентности вебхуков
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT,
  type TEXT,
  payload JSONB,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
