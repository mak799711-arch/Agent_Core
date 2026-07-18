import datetime

today = datetime.datetime.now().strftime('%d.%m.%Y')

changelog_entry = f"""
### {today} - AgentCore V4 DB Fixes & Global Margin
- [FIX] Исправлено создание офферов в V4: добавлены заглушки для устаревших NOT NULL полей (reward_amount).
- [FIX] Исправлена ошибка RLS 'Forbidden' при создании оффера: добавлен серверный маршрут, обходящий RLS и правильно сверяющий owner_id.
- [FIX] Исправлено скрытие офферов: выдана SQL-команда для включения SELECT-доступа к таблице offers.
- [UI/UX] Очищен интерфейс создания оффера, убран лишний текст про глобальную маржу, убраны непонятные 'e.g.' из плейсхолдеров, добавлен тысячный разделитель для рупий.
- [SYSTEM] Сессия завершена (/save_context).
"""

with open('g:/Мой диск/MAXIM_BRAIN_v1/CHANGELOG.md', 'a', encoding='utf-8') as f:
    f.write(changelog_entry)
