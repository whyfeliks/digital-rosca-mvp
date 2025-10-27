# 🔧 Исправление для GitHub Pages

## Проблема
GitHub Pages — статический хостинг без backend API. Запросы к `tables/*` возвращают 404.

## ✅ Быстрое решение

### Шаг 1: Замените `js/app.js`

В начале файла `js/app.js` замените функцию `apiRequest`:

```javascript
// ========================================
// MOCK DATA для GitHub Pages
// ========================================
const MOCK_DATA = {
    users: [
        { id: "user-admin-001", name: "Администратор", email: "admin@rosca.app", passwordHash: "admin123", balance: 50000, role: "admin", joinedGroups: [] },
        { id: "user-001", name: "Иван Петров", email: "ivan@example.com", passwordHash: "pass123", balance: 15000, role: "user", joinedGroups: ["group-001"] },
        { id: "user-002", name: "Анна Сидорова", email: "anna@example.com", passwordHash: "pass123", balance: 8000, role: "user", joinedGroups: ["group-001"] },
        { id: "user-003", name: "Алиса Кузнецова", email: "alisa@example.com", passwordHash: "pass123", balance: 5000, role: "user", joinedGroups: ["group-001"] },
        { id: "user-004", name: "Дмитрий Новиков", email: "dmitry@example.com", passwordHash: "pass123", balance: 5000, role: "user", joinedGroups: ["group-001"] },
        { id: "user-005", name: "Елена Волкова", email: "elena@example.com", passwordHash: "pass123", balance: 5000, role: "user", joinedGroups: ["group-001"] }
    ],
    groups: [
        {
            id: "group-001",
            name: "Первый круг накоплений",
            creatorId: "user-001",
            participants: ["user-001", "user-002", "user-003", "user-004", "user-005"],
            contributionAmount: 5000,
            maxParticipants: 5,
            payoutOrder: ["user-001", "user-002", "user-003", "user-004", "user-005"],
            frequency: "monthly",
            currentRound: 1,
            status: "active",
            startDate: "2024-11-01T00:00:00Z",
            nextPayoutDate: "2024-12-01T00:00:00Z",
            created_at: new Date().toISOString()
        }
    ],
    transactions: [
        { id: "txn-001", groupId: "group-001", fromUserId: "system", toUserId: "user-001", amount: 25000, round: 1, type: "payout", status: "completed", created_at: new Date().toISOString() },
        { id: "txn-002", groupId: "group-001", fromUserId: "user-001", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date().toISOString() },
        { id: "txn-003", groupId: "group-001", fromUserId: "user-002", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date().toISOString() },
        { id: "txn-004", groupId: "group-001", fromUserId: "user-003", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date().toISOString() },
        { id: "txn-005", groupId: "group-001", fromUserId: "user-004", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date().toISOString() },
        { id: "txn-006", groupId: "group-001", fromUserId: "user-005", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date().toISOString() }
    ]
};

// Сохранение в localStorage
function saveMockData() {
    localStorage.setItem('rosca_data', JSON.stringify(MOCK_DATA));
}

// Загрузка из localStorage
function loadMockData() {
    const saved = localStorage.getItem('rosca_data');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(MOCK_DATA, data);
    }
}

loadMockData();

// API Helper - MOCK VERSION
async function apiRequest(endpoint, options = {}) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const [table, id] = endpoint.split('/');
    const method = options.method || 'GET';
    
    try {
        if (method === 'GET') {
            if (id) {
                const record = MOCK_DATA[table].find(r => r.id === id);
                if (!record) throw new Error('Not found');
                return record;
            } else {
                return {
                    data: MOCK_DATA[table],
                    total: MOCK_DATA[table].length,
                    page: 1,
                    limit: 100
                };
            }
        } else if (method === 'POST') {
            const newRecord = JSON.parse(options.body);
            newRecord.created_at = new Date().toISOString();
            MOCK_DATA[table].push(newRecord);
            saveMockData();
            return newRecord;
        } else if (method === 'PATCH' || method === 'PUT') {
            const updates = JSON.parse(options.body);
            const index = MOCK_DATA[table].findIndex(r => r.id === id);
            if (index === -1) throw new Error('Not found');
            
            Object.assign(MOCK_DATA[table][index], updates);
            MOCK_DATA[table][index].updated_at = new Date().toISOString();
            saveMockData();
            return MOCK_DATA[table][index];
        } else if (method === 'DELETE') {
            const index = MOCK_DATA[table].findIndex(r => r.id === id);
            if (index > -1) {
                MOCK_DATA[table].splice(index, 1);
                saveMockData();
            }
            return { success: true };
        }
    } catch (error) {
        console.error('Mock API Error:', error);
        throw error;
    }
}
```

### Шаг 2: Удалите старую функцию apiRequest

Найдите и удалите старый блок:
```javascript
// API Helper
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`tables/${endpoint}`, options);  // ❌ УДАЛИТЬ
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

### Шаг 3: Добавьте обновление текущего пользователя

В функции `updateUserInfo()` добавьте:

```javascript
function updateUserInfo() {
    if (!APP.currentUser) return;
    
    // Обновить данные пользователя из MOCK_DATA
    const updatedUser = MOCK_DATA.users.find(u => u.id === APP.currentUser.id);
    if (updatedUser) {
        APP.currentUser = updatedUser;
    }
    
    document.getElementById('userName').textContent = APP.currentUser.name;
    document.getElementById('userBalance').textContent = formatCurrency(APP.currentUser.balance || 0).replace(' ₽', '');
}
```

---

## 🚀 Готово!

Теперь приложение:
✅ Работает на GitHub Pages без backend  
✅ Хранит данные в `localStorage`  
✅ Имитирует API-запросы с задержкой  
✅ Сохраняет изменения между сессиями  

---

## 📝 Что изменилось:

1. **MOCK_DATA** — данные хранятся в JavaScript-объекте
2. **localStorage** — данные сохраняются локально в браузере
3. **apiRequest()** — имитирует API без реальных HTTP-запросов

---

## ⚠️ Ограничения:

- Данные хранятся только в вашем браузере
- Очистка кеша = потеря данных
- Нет синхронизации между устройствами
- Для production нужен реальный backend

---

## 🔄 Альтернатива: Использовать Backend-as-a-Service

Для полноценной работы рекомендую подключить:

### Вариант A: Firebase (Google)
```javascript
// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "digital-rosca"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
```

### Вариант B: Supabase (PostgreSQL)
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);
```

### Вариант C: JSONBin.io (простое REST API)
```javascript
const API_URL = 'https://api.jsonbin.io/v3/b/YOUR_BIN_ID';
const API_KEY = 'YOUR_API_KEY';

fetch(API_URL, {
  headers: { 'X-Master-Key': API_KEY }
});
```

---

## 📞 Нужна помощь?

Если нужно подключить реальный backend, дайте знать — помогу настроить Firebase или Supabase!
