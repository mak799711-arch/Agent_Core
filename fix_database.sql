-- =========================================================================
-- FIX DATABASE MIGRATION SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX ALL MISSING TABLES
-- =========================================================================

-- 1. Создаем ENUM типы (безопасно, игнорируем ошибку если уже есть)
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE split_status AS ENUM ('pending', 'applied', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('commission_credit', 'withdrawal_debit', 'refund_debit', 'adjustment');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;


-- 2. ТАБЛИЦА: tourist_payments (Gross платежи от туристов)
CREATE TABLE IF NOT EXISTS tourist_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'IDR',
    status payment_status DEFAULT 'pending',
    terminal_notified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. ТАБЛИЦА: payment_links (Одноразовые ссылки для обхода кассира)
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    business_id UUID NOT NULL,
    is_single_use BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    ttl_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_links_agent ON payment_links(agent_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_business ON payment_links(business_id);


-- 4. ТАБЛИЦА: payment_splits (Расщепление)
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
    CONSTRAINT check_split_sum CHECK (business_share + agent_commission + platform_commission = gross_amount)
);


-- 5. ТАБЛИЦА: agent_wallets (Балансы агентов)
CREATE TABLE IF NOT EXISTS agent_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL UNIQUE,
    balance NUMERIC(15, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'IDR',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 6. ТАБЛИЦА: wallet_transactions (Журнал кошелька)
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES agent_wallets(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 7. ТАБЛИЦА: withdrawals (Заявки на вывод)
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL, 
    wallet_id UUID NOT NULL REFERENCES agent_wallets(id),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    status withdrawal_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 8. ТРИГГЕР: авто-обновление баланса кошелька
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

-- УРА! Все таблицы успешно созданы!
