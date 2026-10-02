# Розгортання серверної частини
1. Створіть Google-таблицю → Розширення → Apps Script.
2. Вставте `Code.gs`; у Налаштуваннях проєкту увімкніть «Показувати appsscript.json» і вставте вміст `appsscript.json` (часовий пояс Europe/Kyiv).
3. Властивості скрипта (Project Settings → Script Properties): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
4. Запустіть функцію `setup` один раз (надайте дозволи). Логін і пароль адміна — у журналі виконання.
5. Deploy → New deployment → Web app: Execute as — Me, Who has access — Anyone. Скопіюйте URL у `js/api.js` → `CONFIG.API_URL`.
6. Після змін у коді — нова версія розгортання (Manage deployments → Edit → New version).
