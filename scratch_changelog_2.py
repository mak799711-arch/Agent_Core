import datetime

today = datetime.datetime.now().strftime('%d.%m.%Y')

changelog_entry = f"""
### {today} - AgentCore V4 UI & Link Fixes (Part 2)
- [FIX] Исправлено отображение офферов в карточках заведений на карте Агента (SupabaseOfferRepository переключен на запрос к таблице businesses вместо profiles).
- [FEATURE] Добавлена кнопка "Удалить" для офферов в личном кабинете бизнеса с привязкой к защищенному API-маршруту.
- [FIX] Исправлена ошибка генерации платежных ссылок агентами (добавлена передача токена во фронтенд и обход RLS через Service Role на бэкенде).
- [SYSTEM] Финальное завершение сессии (/save_context).
"""

with open('g:/Мой диск/MAXIM_BRAIN_v1/CHANGELOG.md', 'a', encoding='utf-8') as f:
    f.write(changelog_entry)
