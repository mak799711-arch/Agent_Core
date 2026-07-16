-- Создание таблицы для одноразовых ссылок
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    business_id UUID NOT NULL,
    is_single_use BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    ttl_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска ссылок при чекауте
CREATE INDEX IF NOT EXISTS idx_payment_links_agent ON payment_links(agent_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_business ON payment_links(business_id);

-- Добавление флага уведомления терминала в туристические платежи
ALTER TABLE tourist_payments
ADD COLUMN IF NOT EXISTS terminal_notified BOOLEAN DEFAULT false;
