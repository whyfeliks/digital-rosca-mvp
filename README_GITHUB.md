# 🔄 Digital ROSCA - MVP

<div align="center">

![Digital ROSCA](https://img.shields.io/badge/Status-MVP%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-Proprietary-blue)
![Platform](https://img.shields.io/badge/Platform-Web-orange)

**Платформа цифровых денежных кругов (Rotating Savings and Credit Association)**

[🚀 Live Demo](#) | [📚 Документация](README.md) | [🐛 Issues](#)

</div>

---

## 🎯 О проекте

**Digital ROSCA** — это веб-приложение для организации цифровых "денежных кругов", где группа пользователей объединяется для регулярных взносов и поочерёдных выплат.

### Как это работает?

1. **5 человек** создают группу
2. Каждый вносит **5,000₽** ежемесячно
3. В каждом раунде один получает **25,000₽**
4. Цикл завершается за **5 месяцев**

**Результат**: Доступ к крупной сумме без процентов и банков!

---

## ✨ Основные возможности

### 👤 Для пользователей
- ✅ Создание групп с настройками
- ✅ Присоединение к существующим группам
- ✅ Внесение взносов
- ✅ Получение выплат
- ✅ История транзакций
- ✅ Личная статистика

### 👨‍💼 Для администратора
- ✅ Управление всеми пользователями
- ✅ Просмотр всех групп
- ✅ Завершение раундов
- ✅ Статистика платформы

### 🎨 UI/UX
- ✅ Современный gradient-дизайн
- ✅ Адаптивность для всех устройств
- ✅ Интуитивная навигация
- ✅ Цветовая индикация статусов

---

## 🚀 Быстрый старт

### Демо-доступы:

**Пользователь:**
```
Email: ivan@example.com
Пароль: pass123
```

**Администратор:**
```
Email: admin@rosca.app
Пароль: admin123
```

### Локальный запуск:

```bash
# Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/digital-rosca.git

# Откройте в браузере
open index.html

# Или запустите локальный сервер
python -m http.server 8000
# затем откройте http://localhost:8000
```

---

## 📦 Технологии

- **Frontend**: Vanilla JavaScript (ES6+)
- **Стили**: Custom CSS3 с CSS Variables
- **Иконки**: FontAwesome 6.4.0
- **Шрифты**: Google Fonts (Inter)
- **Хранилище**: localStorage (для GitHub Pages)

---

## 📊 Структура проекта

```
digital-rosca/
├── index.html              # Главная страница SPA
├── css/
│   └── style.css          # Все стили (16 KB)
├── js/
│   └── app.js             # Вся логика (37 KB)
└── docs/
    ├── README.md          # Полная документация
    ├── TECHNICAL_SPEC.md  # Техническое задание
    ├── API_EXAMPLES.md    # Примеры API
    ├── QUICK_START.md     # Руководство пользователя
    └── DEPLOY_TO_GITHUB_PAGES.md  # Инструкция по деплою
```

---

## 🎓 Документация

| Документ | Описание | Для кого |
|----------|----------|----------|
| [README.md](README.md) | Полная документация проекта | Все |
| [QUICK_START.md](QUICK_START.md) | Быстрый старт за 5 минут | Тестировщики |
| [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md) | Техническое задание | Backend Dev |
| [API_EXAMPLES.md](API_EXAMPLES.md) | Примеры кода | Frontend Dev |
| [DEPLOY_TO_GITHUB_PAGES.md](DEPLOY_TO_GITHUB_PAGES.md) | Деплой на GH Pages | DevOps |

---

## 💡 Примеры использования

### Создание группы

```javascript
const group = {
  name: "Семейный круг",
  maxParticipants: 6,
  contributionAmount: 10000,
  frequency: "monthly",
  startDate: "2024-12-01"
};
```

### Внесение взноса

```javascript
await makeContribution(userId, groupId);
// Автоматически спишет сумму с баланса
```

### Завершение раунда (Админ)

```javascript
await forceNextRound(groupId);
// Создаст выплату и переключит раунд
```

---

## 🔮 Roadmap

### Версия 1.0 - MVP (Текущая) ✅
- Базовый функционал ROSCA
- Виртуальные балансы
- Ручное управление раундами
- Демо-данные

### Версия 1.1 - Enhanced MVP
- [ ] Email-уведомления
- [ ] Автоматические раунды
- [ ] Улучшенная безопасность
- [ ] PWA поддержка

### Версия 2.0 - Production
- [ ] Реальные платежи (YooKassa/Stripe)
- [ ] JWT аутентификация
- [ ] Node.js backend
- [ ] PostgreSQL база

### Версия 3.0 - Social
- [ ] Групповой чат
- [ ] Рейтинговая система
- [ ] Мобильное приложение
- [ ] Продвинутая аналитика

---

## 🤝 Вклад в проект

Мы приветствуем вклад в проект! Вот как вы можете помочь:

1. 🐛 **Сообщайте о багах** через Issues
2. 💡 **Предлагайте идеи** для новых функций
3. 📖 **Улучшайте документацию**
4. 🔧 **Присылайте Pull Requests**

### Как создать Pull Request:

```bash
# Fork репозитория
# Клонируйте свой fork
git clone https://github.com/YOUR_USERNAME/digital-rosca.git

# Создайте ветку для фичи
git checkout -b feature/amazing-feature

# Сделайте изменения и коммит
git commit -m "Add amazing feature"

# Push в ваш fork
git push origin feature/amazing-feature

# Откройте Pull Request на GitHub
```

---

## 📝 Лицензия

Этот проект является проприетарным. Все права защищены.

Для коммерческого использования свяжитесь с нами.

---

## 🐛 Известные ограничения

### MVP версия:
- ⚠️ Виртуальные деньги (нет реальных платежей)
- ⚠️ Данные в localStorage (не синхронизируются)
- ⚠️ Простая аутентификация (пароли в plain text)
- ⚠️ Ручное завершение раундов
- ⚠️ Нет email-уведомлений

**Не используйте для реальных денег!**

---

## 📞 Контакты

- **Email**: support@digitalrosca.app
- **Telegram**: @digitalrosca
- **GitHub Issues**: [Создать issue](#)

---

## 🙏 Благодарности

- FontAwesome за иконки
- Google Fonts за шрифт Inter
- GitHub за бесплатный хостинг
- Сообществу Open Source

---

## 📈 Статистика

![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/digital-rosca?style=social)
![GitHub forks](https://img.shields.io/github/forks/YOUR_USERNAME/digital-rosca?style=social)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/digital-rosca)
![GitHub last commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/digital-rosca)

---

<div align="center">

**Сделано с ❤️ для сообщества**

[⬆ Наверх](#-digital-rosca---mvp)

</div>
