-- Добавление поддержки нескольких фото для оффера
ALTER TABLE offers ADD COLUMN IF NOT EXISTS image_urls text[];
