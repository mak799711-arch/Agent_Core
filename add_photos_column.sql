-- Добавление колонки photos (массив строк) в таблицу profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}'::text[];
