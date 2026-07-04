-- SQL-скрипт для настройки Storage в Supabase
-- Выполни этот скрипт в разделе "SQL Editor" в панели управления Supabase

-- 1. Добавляем колонку bio в таблицу profiles (если её еще нет)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Создаем корзину (bucket) 'avatars' для хранения фотографий профиля
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Настраиваем политику безопасности (RLS) для корзины avatars

-- Разрешаем всем читать картинки (они публичные)
CREATE POLICY "Public Access for avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- Разрешаем загружать картинки только авторизованным юзерам
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid() = owner
);

-- Разрешаем пользователям обновлять/удалять только свои собственные аватары
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid() = owner);

CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid() = owner);
