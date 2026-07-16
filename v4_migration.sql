-- Миграция базы данных AgentCore к архитектуре V4 (Payment Terminal & Global Margin)

-- 1. Очистка старых таблиц (уже не нужны в V4)
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS referral_sessions CASCADE;

-- 2. Обновление таблицы offers (переход на Global Margin)
ALTER TABLE offers DROP COLUMN IF EXISTS reward_amount;
ALTER TABLE offers DROP COLUMN IF EXISTS reward_type;
ALTER TABLE offers DROP COLUMN IF EXISTS reward_percent;
ALTER TABLE offers DROP COLUMN IF EXISTS customer_discount_percent;
ALTER TABLE offers DROP COLUMN IF EXISTS platform_fee_percent;
ALTER TABLE offers DROP COLUMN IF EXISTS global_margin_percent;
ALTER TABLE offers ADD COLUMN global_margin_percent DECIMAL(5,2) DEFAULT 10.00;

-- Обновление существующих офферов до дефолтного 10%
UPDATE offers SET global_margin_percent = 10.00 WHERE global_margin_percent IS NULL;
