# Усадьба на Кедровской, 36А — сайт-визитка

Одностраничный сайт для продажи дома (156.6 м², участок 36 соток) в п. Ульба, г. Риддер.

## Структура

- `index.html` — разметка страницы
- `css/style.css` — стили
- `js/script.js` — бургер-меню и обработка формы заявки
- `images/` — папка для фотографий (пока пусто, вместо фото — заглушки в галерее)

## Как добавить фото

1. Положите файлы в `images/` (например `images/facade.jpg`, `images/pond.jpg`).
2. В `index.html` в секции `#gallery` замените `<div class="gallery-placeholder">...</div>` на:
   ```html
   <img class="gallery-photo" src="images/facade.jpg" alt="Фасад дома">
   ```
   и добавьте в `css/style.css` класс `.gallery-photo { width:100%; height:100%; object-fit:cover; }`.

## Форма обратной связи → Telegram

Форма (имя + телефон) отправляет заявку через Cloudflare Worker-прокси, который прячет
токен Telegram-бота (его нельзя хранить в коде публичного репозитория — это скомпрометирует бота).

Код прокси: `telegram-relay/worker.js`.

### Как развернуть прокси

1. Зарегистрируйтесь на [dash.cloudflare.com](https://dash.cloudflare.com/) (бесплатно, без карты).
2. **Workers & Pages** → **Create** → **Create Worker** → задайте имя (например `kedrovskaya-relay`) → **Deploy**.
3. Откройте **Edit code**, вставьте содержимое `telegram-relay/worker.js`, **Save and Deploy**.
4. **Settings** → **Variables** → добавьте два **secret**-переменных (не обычных, а зашифрованных):
   - `TELEGRAM_BOT_TOKEN` — токен бота от @BotFather
   - `TELEGRAM_CHAT_ID` — ваш chat_id (узнать через @userinfobot)
   - **Save and Deploy** ещё раз, чтобы секреты применились.
5. Скопируйте URL воркера (вида `https://kedrovskaya-relay.<ваш-логин>.workers.dev`).
6. Вставьте этот URL в `js/script.js` в константу `TELEGRAM_RELAY_URL`.

Токен бота нигде не появляется в коде сайта и в git-репозитории — он хранится только
в зашифрованных переменных Cloudflare.

## Деплой

### GitHub Pages
1. Создайте репозиторий на GitHub, запушьте туда содержимое этой папки.
2. В настройках репозитория Settings → Pages укажите ветку `main` и папку `/root`.

### Netlify / Vercel
1. Зарегистрируйтесь на netlify.com или vercel.com.
2. Перетащите папку сайта в интерфейс (Netlify Drop) либо подключите GitHub-репозиторий — деплой произойдёт автоматически.

## Локальный просмотр

```bash
python3 -m http.server 8000
```
и откройте http://localhost:8000
