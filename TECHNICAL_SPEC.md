# 📐 Техническое задание: Digital ROSCA MVP

## 🎯 Обзор проекта

**Название**: Digital ROSCA (Rotating Savings and Credit Association)  
**Тип**: Веб-приложение (SPA)  
**Цель**: MVP для проверки гипотезы о готовности пользователей использовать цифровые денежные круги

---

## 🧠 Бизнес-логика

### Концепция ROSCA

ROSCA — это система взаимного кредитования, где:
1. Группа из N участников вносит фиксированную сумму S каждый период (неделя/месяц)
2. Каждый период один участник получает всю накопленную сумму (N × S)
3. Порядок получения определяется случайно при старте или голосованием
4. Цикл завершается, когда все N участников получат выплату

**Пример**:
- 5 участников × 5,000 ₽ = 25,000 ₽ выплата за раунд
- Длительность: 5 месяцев
- Каждый вносит 25,000 ₽ и получает 25,000 ₽
- Первый получатель имеет доступ к деньгам сразу (беспроцентный заем)
- Последний получатель накапливает через платформу (дисциплина)

---

## 📊 Функциональные требования

### 1. Аутентификация и авторизация

#### 1.1 Регистрация
- **Input**: Email, Password, Full Name
- **Validation**:
  - Email: формат RFC 5322
  - Password: минимум 8 символов
  - Name: минимум 2 символа
- **Output**: User ID, JWT Token
- **Error handling**:
  - Email уже существует → 409 Conflict
  - Невалидные данные → 400 Bad Request

#### 1.2 Вход
- **Input**: Email, Password
- **Process**:
  - Проверка email в БД
  - Сравнение хеша пароля (bcrypt)
  - Генерация JWT токена
- **Output**: User object, JWT Token
- **Session**: 7 дней

#### 1.3 Роли
| Роль | Доступ |
|------|--------|
| `user` | Создание групп, присоединение, взносы, просмотр своих данных |
| `admin` | Всё + управление раундами, просмотр всех данных, статистика |

---

### 2. Управление группами (CRUD)

#### 2.1 Создание группы
```javascript
POST /api/groups
Headers: { Authorization: Bearer <token> }
Body: {
  name: string,              // Название группы
  maxParticipants: number,   // 3-20
  contributionAmount: number, // >= 100
  frequency: "weekly" | "monthly",
  startDate: ISO8601         // >= today
}

Response: {
  id: string,
  creatorId: string,
  participants: [creatorId],
  payoutOrder: [],
  currentRound: 1,
  status: "waiting",
  ...остальные поля
}
```

**Бизнес-правила**:
- Создатель автоматически становится участником
- Статус = "waiting" до заполнения
- payoutOrder формируется при достижении maxParticipants

#### 2.2 Присоединение к группе
```javascript
POST /api/groups/{groupId}/join
Headers: { Authorization: Bearer <token> }

Response: { success: true, group: {...} }
```

**Бизнес-правила**:
- Проверка: пользователь ещё не участник
- Проверка: группа не заполнена
- Проверка: статус = "waiting"
- При заполнении:
  - Генерация payoutOrder (случайный порядок)
  - Статус → "active"
  - Уведомления всем участникам

#### 2.3 Просмотр групп
```javascript
GET /api/groups?filter=all|my|available&page=1&limit=20
Headers: { Authorization: Bearer <token> }

Response: {
  data: [...groups],
  total: number,
  page: number,
  limit: number
}
```

**Фильтры**:
- `all` — все группы
- `my` — где я участник
- `available` — status="waiting" И я не участник И не заполнена

---

### 3. Транзакции

#### 3.1 Внесение взноса
```javascript
POST /api/groups/{groupId}/contribute
Headers: { Authorization: Bearer <token> }

Response: {
  transactionId: string,
  newBalance: number
}
```

**Процесс**:
1. Проверки:
   - Пользователь — участник группы
   - Группа активна (status="active")
   - Взнос ещё не внесён в текущем раунде
   - Баланс >= contributionAmount
2. Создание транзакции (type="contribution")
3. Списание с баланса пользователя
4. Проверка: все участники внесли → готов к выплате
5. Уведомление пользователю

#### 3.2 Выплата (автоматическая/админ)
```javascript
POST /api/groups/{groupId}/payout
Headers: { Authorization: Bearer <admin-token> }

Response: {
  payoutTransaction: {...},
  nextRound: number,
  status: "active" | "completed"
}
```

**Процесс**:
1. Проверки:
   - Все взносы текущего раунда внесены
   - Определение получателя из payoutOrder[currentRound - 1]
2. Создание транзакции (type="payout")
3. Начисление на баланс получателя
4. Переход к следующему раунду:
   - currentRound++
   - Если currentRound > maxParticipants → status="completed"
   - Расчёт nextPayoutDate (+ frequency)
5. Уведомления всем участникам

#### 3.3 История транзакций
```javascript
GET /api/transactions?userId={id}&groupId={id}&type={type}
Headers: { Authorization: Bearer <token> }

Response: {
  data: [...transactions],
  total: number
}
```

---

### 4. Уведомления

#### Типы уведомлений:
| Тип | Триггер | Получатели |
|-----|---------|------------|
| `contribution_reminder` | 3 дня до nextPayoutDate | Участники без взноса |
| `payout_received` | Выплата совершена | Получатель |
| `round_completed` | Раунд завершён | Все участники |
| `group_started` | Группа заполнена | Все участники |
| `group_filled` | Новый участник | Создатель |

#### API:
```javascript
GET /api/notifications?isRead=false
Headers: { Authorization: Bearer <token> }

Response: { data: [...notifications] }

PATCH /api/notifications/{id}
Body: { isRead: true }
```

---

### 5. Админ-панель

#### 5.1 Статистика
```javascript
GET /api/admin/stats
Headers: { Authorization: Bearer <admin-token> }

Response: {
  totalUsers: number,
  totalGroups: number,
  activeGroups: number,
  completedGroups: number,
  totalTransactions: number,
  totalVolume: number  // Сумма всех транзакций
}
```

#### 5.2 Управление пользователями
```javascript
GET /api/admin/users?page=1&limit=50&search=email
Response: { data: [...users], total }

PATCH /api/admin/users/{id}
Body: { balance: number, role: "user"|"admin" }
```

#### 5.3 Принудительный переход раунда
```javascript
POST /api/admin/groups/{groupId}/force-next-round
Body: { skipValidation: boolean }  // Пропустить проверку взносов

Response: { success: true, nextRound: number }
```

---

## 🗄️ Модель данных

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌────────────────┐
│   Users     │         │    Groups    │         │  Transactions  │
├─────────────┤         ├──────────────┤         ├────────────────┤
│ id          │◄───────┐│ id           │◄───────┐│ id             │
│ name        │        ││ name         │        ││ groupId (FK)   │
│ email       │        ││ creatorId(FK)│        ││ fromUserId(FK) │
│ passwordHash│        ││ participants │        ││ toUserId (FK)  │
│ balance     │        │└──────────────┘        ││ amount         │
│ role        │        │                        ││ round          │
│ joinedGroups│────────┘                        ││ type           │
└─────────────┘                                 ││ status         │
                                                 ││ createdAt      │
                                                 └────────────────┘
```

### Схемы таблиц

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(12,2) DEFAULT 0.00,
  role VARCHAR(20) DEFAULT 'user',
  joined_groups JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### `groups`
```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  creator_id UUID REFERENCES users(id),
  participants JSONB DEFAULT '[]',
  contribution_amount DECIMAL(12,2) NOT NULL,
  max_participants INT NOT NULL CHECK (max_participants BETWEEN 3 AND 20),
  payout_order JSONB DEFAULT '[]',
  frequency VARCHAR(20) CHECK (frequency IN ('weekly', 'monthly')),
  current_round INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'waiting',
  start_date TIMESTAMP NOT NULL,
  next_payout_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_groups_status ON groups(status);
CREATE INDEX idx_groups_creator ON groups(creator_id);
CREATE INDEX idx_groups_participants ON groups USING GIN (participants);
```

#### `transactions`
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  round INT NOT NULL,
  type VARCHAR(20) CHECK (type IN ('contribution', 'payout')),
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_group ON transactions(group_id);
CREATE INDEX idx_transactions_from_user ON transactions(from_user_id);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
```

#### `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT false,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
```

---

## 🔒 Безопасность

### Аутентификация
- **JWT Tokens**: HS256 алгоритм
- **Payload**:
  ```json
  {
    "userId": "uuid",
    "email": "user@example.com",
    "role": "user",
    "iat": 1234567890,
    "exp": 1234567890
  }
  ```
- **Refresh Tokens**: Хранить в httpOnly cookies
- **Token lifetime**: 7 дней (access), 30 дней (refresh)

### Пароли
- **Hashing**: bcrypt с cost factor = 10
- **Validation**: минимум 8 символов, 1 буква, 1 цифра
- **Reset**: Email с одноразовой ссылкой (TTL 1 час)

### API Security
- **Rate Limiting**: 100 req/min на IP
- **CORS**: Разрешить только production домен
- **HTTPS**: Обязательно в production
- **SQL Injection**: Использовать параметризованные запросы
- **XSS**: Санитизация всех input'ов

---

## ⚡ Производительность

### Целевые метрики
- **Time to First Byte (TTFB)**: < 200ms
- **First Contentful Paint (FCP)**: < 1.5s
- **Time to Interactive (TTI)**: < 3s
- **API Response Time**: < 300ms (p95)

### Оптимизации

#### Frontend
- Минификация CSS/JS (webpack/rollup)
- Code splitting по роутам
- Lazy loading изображений
- Service Worker для offline
- Кеширование статики (1 год)

#### Backend
- Индексы на всех FK и часто запрашиваемых полях
- Connection pooling (PostgreSQL)
- Redis для кеша:
  - User sessions (JWT blacklist)
  - Group lists (TTL 5 min)
  - Statistics (TTL 15 min)
- CDN для статики (CloudFlare/AWS CloudFront)

#### База данных
- Партиционирование `transactions` по created_at (ежемесячно)
- Архивация завершённых групп (status='completed', >6 месяцев)
- Read replicas для аналитики

---

## 🧪 Тестирование

### Unit Tests
```javascript
// Пример: проверка расчёта выплаты
describe('Group.calculatePayout', () => {
  it('should calculate correct payout amount', () => {
    const group = {
      contributionAmount: 5000,
      maxParticipants: 5
    };
    expect(calculatePayout(group)).toBe(25000);
  });
});
```

### Integration Tests
```javascript
describe('POST /api/groups/:id/contribute', () => {
  it('should create contribution and update balance', async () => {
    const user = await createTestUser({ balance: 10000 });
    const group = await createTestGroup();
    
    const res = await request(app)
      .post(`/api/groups/${group.id}/contribute`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    
    expect(res.body.newBalance).toBe(5000);
  });
});
```

### E2E Tests (Playwright)
```javascript
test('complete ROSCA cycle', async ({ page }) => {
  // 1. Создание группы
  await page.goto('/groups');
  await page.click('#createGroupBtn');
  await page.fill('#groupName', 'Test Group');
  await page.click('button[type=submit]');
  
  // 2. Присоединение участников
  for (let i = 0; i < 4; i++) {
    await loginAs(`user${i}@test.com`);
    await page.click('.btn-join');
  }
  
  // 3. Внесение взносов
  // ...
  
  // 4. Проверка выплаты
  await expect(page.locator('.balance')).toContainText('25,000');
});
```

---

## 📦 Деплой и DevOps

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: docker build -t rosca-app .
      - run: docker push rosca-app:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: kubectl apply -f k8s/
      - run: kubectl rollout status deployment/rosca-app
```

### Docker Setup

#### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

#### docker-compose.yml (Development)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: rosca_dev
      POSTGRES_PASSWORD: dev_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:dev_pass@postgres:5432/rosca_dev
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

### Мониторинг

#### Метрики (Prometheus)
- Количество активных пользователей
- Количество групп по статусам
- Средняя сумма взноса
- Rate успешных транзакций
- API latency (p50, p95, p99)
- Error rate по эндпоинтам

#### Логирование (ELK Stack)
```javascript
// Winston logger
const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Использование
logger.info('User joined group', {
  userId: user.id,
  groupId: group.id,
  timestamp: Date.now()
});
```

#### Алерты (PagerDuty/Slack)
- Error rate > 1% → P1 alert
- API latency p95 > 1s → P2 alert
- Disk usage > 80% → P3 alert
- Suspicious transaction patterns → Security alert

---

## 🌐 API Endpoints Summary

### Public
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Authenticated
```
GET    /api/user/profile
PATCH  /api/user/profile
GET    /api/user/balance
GET    /api/user/transactions

GET    /api/groups
POST   /api/groups
GET    /api/groups/:id
PATCH  /api/groups/:id
DELETE /api/groups/:id
POST   /api/groups/:id/join
POST   /api/groups/:id/contribute

GET    /api/transactions
GET    /api/transactions/:id

GET    /api/notifications
PATCH  /api/notifications/:id
DELETE /api/notifications/:id
```

### Admin Only
```
GET    /api/admin/stats
GET    /api/admin/users
PATCH  /api/admin/users/:id
GET    /api/admin/groups
POST   /api/admin/groups/:id/force-next-round
GET    /api/admin/transactions
```

---

## 📱 Будущие фичи (Post-MVP)

### Фаза 2: Платежи
- [ ] Интеграция YooKassa/Stripe
- [ ] Автоматическое списание по расписанию
- [ ] Webhook обработка платежей
- [ ] Возвраты и споры

### Фаза 3: Социальные функции
- [ ] Групповой чат (Socket.io)
- [ ] Профили пользователей с рейтингом
- [ ] Отзывы после завершения цикла
- [ ] Приглашения по email/SMS

### Фаза 4: Аналитика
- [ ] Dashboard для аналитики группы
- [ ] Экспорт данных (CSV, PDF)
- [ ] Прогнозирование завершения
- [ ] Графики взносов/выплат

### Фаза 5: Мобильное приложение
- [ ] React Native iOS/Android
- [ ] Push-уведомления (FCM)
- [ ] Биометрическая аутентификация
- [ ] Offline mode

---

## 📞 Контакты команды

**Product Manager**: Определить бизнес-требования  
**Backend Developer**: Node.js/Express + PostgreSQL  
**Frontend Developer**: React + TailwindCSS  
**DevOps Engineer**: AWS/Docker/Kubernetes  
**QA Engineer**: Тестирование и автоматизация  

---

**Версия документа**: 1.0  
**Последнее обновление**: 2024-10-27  
**Статус**: MVP Ready
