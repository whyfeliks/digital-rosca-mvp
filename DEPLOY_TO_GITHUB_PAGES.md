# 🚀 Деплой Digital ROSCA на GitHub Pages

## ✅ Исправление применено!

Файл `js/app.js` обновлён для работы на GitHub Pages:
- ✅ Добавлены mock-данные вместо API
- ✅ Данные хранятся в localStorage
- ✅ Работает без backend сервера

---

## 📋 Инструкция по деплою

### Шаг 1: Подготовка репозитория

```bash
# Перейдите в папку проекта
cd digital-rosca

# Инициализируйте git (если ещё не сделано)
git init

# Добавьте все файлы
git add .

# Сделайте коммит
git commit -m "Initial commit: Digital ROSCA MVP"
```

### Шаг 2: Создайте репозиторий на GitHub

1. Зайдите на https://github.com
2. Нажмите "New repository"
3. Название: `digital-rosca`
4. Выберите "Public"
5. НЕ добавляйте README (у вас уже есть)
6. Нажмите "Create repository"

### Шаг 3: Загрузите код

```bash
# Добавьте remote
git remote add origin https://github.com/ВАШ_USERNAME/digital-rosca.git

# Переименуйте ветку в main (если нужно)
git branch -M main

# Загрузите код
git push -u origin main
```

### Шаг 4: Активируйте GitHub Pages

1. Зайдите в репозиторий на GitHub
2. Перейдите в **Settings** (⚙️)
3. В левом меню выберите **Pages**
4. В разделе "Source":
   - Branch: **main**
   - Folder: **/ (root)**
5. Нажмите **Save**

### Шаг 5: Подождите 2-3 минуты

GitHub автоматически соберёт и опубликует сайт.

### Шаг 6: Откройте сайт

Ваш сайт будет доступен по адресу:
```
https://ВАШ_USERNAME.github.io/digital-rosca/
```

Например:
```
https://whyfeliks.github.io/digital-rosca/
```

---

## 🎉 Готово!

Теперь можете:
- ✅ Войти как `admin@rosca.app / admin123`
- ✅ Войти как `ivan@example.com / pass123`
- ✅ Создавать группы
- ✅ Вносить взносы
- ✅ Управлять раундами

---

## 💾 Как работают данные

### Хранение:
- Все данные хранятся в **localStorage браузера**
- При первом запуске используются демо-данные
- Изменения сохраняются автоматически

### Сброс данных:
Чтобы вернуть демо-данные, откройте Console (F12) и выполните:
```javascript
localStorage.removeItem('rosca_data');
location.reload();
```

### Создание резервной копии:
```javascript
// Экспорт данных
const backup = localStorage.getItem('rosca_data');
console.log(backup); // Скопируйте это

// Импорт данных
localStorage.setItem('rosca_data', 'ВСТАВЬТЕ_СЮДА');
location.reload();
```

---

## 🔧 Обновление сайта

После изменений в коде:

```bash
git add .
git commit -m "Update: описание изменений"
git push origin main
```

GitHub Pages автоматически обновится через 1-2 минуты.

---

## 🌐 Кастомный домен (опционально)

### Если у вас есть свой домен:

1. В корне репозитория создайте файл `CNAME`:
   ```
   rosca.yourdomain.com
   ```

2. В настройках домена добавьте CNAME-запись:
   ```
   CNAME record:
   Name: rosca
   Value: ВАШ_USERNAME.github.io
   ```

3. В Settings → Pages укажите ваш домен

---

## 📱 Тестирование на мобильных

После деплоя протестируйте на:
- ✅ iPhone Safari
- ✅ Android Chrome
- ✅ Планшетах
- ✅ Разных разрешениях

---

## ⚠️ Известные ограничения GitHub Pages

### Что работает:
- ✅ Статические HTML/CSS/JS файлы
- ✅ localStorage для данных
- ✅ HTTPS автоматически
- ✅ Быстрая загрузка через CDN

### Что НЕ работает:
- ❌ Backend API (Node.js, Python, PHP)
- ❌ Базы данных (PostgreSQL, MySQL)
- ❌ Server-side рендеринг
- ❌ Реальные платежи

---

## 🚀 Следующие шаги для Production

Когда будете готовы к реальным платежам:

### 1. Backend
Разверните на:
- **Heroku** (бесплатный tier)
- **Railway** (современная альтернатива)
- **Vercel** (отлично для Next.js)
- **AWS/Google Cloud** (для масштабирования)

### 2. База данных
Используйте:
- **PostgreSQL** (Supabase, Neon)
- **MongoDB** (MongoDB Atlas)
- **Firebase** (Firestore)

### 3. Платежи
Интегрируйте:
- **YooKassa** (для РФ)
- **Stripe** (международные)
- **Tinkoff API** (для РФ)

---

## 🐛 Решение проблем

### Сайт не открывается (404)
- Проверьте, что Pages активирован
- Подождите 5 минут после первого деплоя
- Проверьте правильность URL

### Изменения не применяются
- Очистите кеш браузера (Ctrl+Shift+R)
- Подождите 2-3 минуты
- Проверьте, что push прошёл успешно

### Данные не сохраняются
- Проверьте Console (F12) на ошибки
- Убедитесь, что localStorage не отключён
- Попробуйте в режиме инкогнито

### Ошибка при создании группы
- Убедитесь, что все поля заполнены
- Проверьте дату (не в прошлом)
- Откройте Console для деталей

---

## 📞 Поддержка

Если возникли проблемы:

1. **Проверьте Console** (F12 → Console)
2. **Проверьте Network** (F12 → Network)
3. **Создайте issue** в репозитории
4. **Напишите мне** с описанием проблемы

---

## 🎓 Полезные ссылки

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Markdown Guide](https://guides.github.com/features/mastering-markdown/)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)

---

## 📊 Проверка работы

После деплоя проверьте:

### ✅ Чек-лист:
- [ ] Сайт открывается по URL
- [ ] Страница логина загружается
- [ ] Можно войти как admin
- [ ] Можно войти как user
- [ ] Dashboard отображается
- [ ] Группы загружаются
- [ ] Можно создать группу
- [ ] Транзакции отображаются
- [ ] Админ-панель доступна (admin)
- [ ] Баланс обновляется
- [ ] Данные сохраняются после перезагрузки

---

## 🎉 Поздравляю!

Ваше приложение **Digital ROSCA** теперь доступно онлайн!

**Live Demo**: https://ВАШ_USERNAME.github.io/digital-rosca/

Делитесь ссылкой, собирайте обратную связь и развивайте проект! 🚀

---

**Дата обновления**: 2024-10-27  
**Версия**: 1.0 (GitHub Pages Ready)
