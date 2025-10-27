# 🔌 API Examples - Digital ROSCA

Примеры использования RESTful Table API для работы с данными Digital ROSCA.

---

## 📚 Содержание
1. [Базовые операции](#базовые-операции)
2. [Работа с пользователями](#работа-с-пользователями)
3. [Работа с группами](#работа-с-группами)
4. [Работа с транзакциями](#работа-с-транзакциями)
5. [Сложные запросы](#сложные-запросы)
6. [Обработка ошибок](#обработка-ошибок)

---

## Базовые операции

### GET - Получить все записи

```javascript
// Получить всех пользователей
const response = await fetch('tables/users');
const data = await response.json();

console.log(data);
// {
//   data: [...users],
//   total: 6,
//   page: 1,
//   limit: 100,
//   table: "users",
//   schema: {...}
// }
```

### GET - Получить с пагинацией

```javascript
// Получить первую страницу (10 записей)
const response = await fetch('tables/groups?page=1&limit=10');
const data = await response.json();

console.log(`Показано ${data.data.length} из ${data.total}`);
```

### GET - Получить конкретную запись

```javascript
// Получить пользователя по ID
const userId = 'user-001';
const response = await fetch(`tables/users/${userId}`);
const user = await response.json();

console.log(user.name); // "Иван Петров"
```

### POST - Создать новую запись

```javascript
// Создать нового пользователя
const newUser = {
  id: 'user-' + Date.now(),
  name: 'Мария Иванова',
  email: 'maria@example.com',
  passwordHash: 'pass123',
  balance: 10000,
  role: 'user',
  joinedGroups: []
};

const response = await fetch('tables/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newUser)
});

const created = await response.json();
console.log('Создан пользователь:', created.id);
```

### PUT - Полное обновление

```javascript
// Полностью обновить пользователя
const updatedUser = {
  id: 'user-001',
  name: 'Иван Петрович Петров',
  email: 'ivan.new@example.com',
  passwordHash: 'newpass123',
  balance: 20000,
  role: 'user',
  joinedGroups: ['group-001', 'group-002']
};

const response = await fetch(`tables/users/${updatedUser.id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedUser)
});
```

### PATCH - Частичное обновление

```javascript
// Обновить только баланс
const response = await fetch('tables/users/user-001', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ balance: 25000 })
});

console.log('Баланс обновлён');
```

### DELETE - Удалить запись

```javascript
// Удалить пользователя (мягкое удаление)
const response = await fetch('tables/users/user-001', {
  method: 'DELETE'
});

if (response.status === 204) {
  console.log('Пользователь удалён');
}
```

---

## Работа с пользователями

### Регистрация нового пользователя

```javascript
async function registerUser(name, email, password) {
  // 1. Проверить, не существует ли email
  const checkResponse = await fetch('tables/users');
  const { data: users } = await checkResponse.json();
  
  const exists = users.some(u => u.email === email);
  if (exists) {
    throw new Error('Email уже зарегистрирован');
  }
  
  // 2. Создать пользователя
  const newUser = {
    id: 'user-' + crypto.randomUUID(),
    name,
    email,
    passwordHash: password, // В production использовать bcrypt!
    balance: 0,
    role: 'user',
    joinedGroups: []
  };
  
  const response = await fetch('tables/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  });
  
  return await response.json();
}

// Использование
const user = await registerUser('Петр Сидоров', 'petr@example.com', 'pass123');
console.log('Зарегистрирован:', user.id);
```

### Аутентификация

```javascript
async function login(email, password) {
  const response = await fetch('tables/users');
  const { data: users } = await response.json();
  
  const user = users.find(u => 
    u.email === email && u.passwordHash === password
  );
  
  if (!user) {
    throw new Error('Неверный email или пароль');
  }
  
  // Сохранить ID в localStorage
  localStorage.setItem('currentUserId', user.id);
  
  return user;
}

// Использование
try {
  const user = await login('ivan@example.com', 'pass123');
  console.log('Вход выполнен:', user.name);
} catch (error) {
  console.error(error.message);
}
```

### Обновление баланса

```javascript
async function updateBalance(userId, amount) {
  // Получить текущий баланс
  const response = await fetch(`tables/users/${userId}`);
  const user = await response.json();
  
  // Обновить
  const newBalance = user.balance + amount;
  await fetch(`tables/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ balance: newBalance })
  });
  
  return newBalance;
}

// Пополнение счёта
await updateBalance('user-001', 5000);

// Списание
await updateBalance('user-001', -3000);
```

### Добавление группы в список пользователя

```javascript
async function addGroupToUser(userId, groupId) {
  const response = await fetch(`tables/users/${userId}`);
  const user = await response.json();
  
  if (!user.joinedGroups) {
    user.joinedGroups = [];
  }
  
  if (!user.joinedGroups.includes(groupId)) {
    user.joinedGroups.push(groupId);
    
    await fetch(`tables/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ joinedGroups: user.joinedGroups })
    });
  }
}
```

---

## Работа с группами

### Создание группы

```javascript
async function createGroup(creatorId, groupData) {
  const newGroup = {
    id: 'group-' + crypto.randomUUID(),
    name: groupData.name,
    creatorId: creatorId,
    participants: [creatorId], // Создатель автоматически участник
    contributionAmount: groupData.contributionAmount,
    maxParticipants: groupData.maxParticipants,
    payoutOrder: [], // Заполнится при активации
    frequency: groupData.frequency,
    currentRound: 1,
    status: 'waiting',
    startDate: groupData.startDate,
    nextPayoutDate: groupData.startDate
  };
  
  const response = await fetch('tables/groups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newGroup)
  });
  
  const created = await response.json();
  
  // Добавить группу в список пользователя
  await addGroupToUser(creatorId, created.id);
  
  return created;
}

// Использование
const group = await createGroup('user-001', {
  name: 'Семейный круг',
  contributionAmount: 10000,
  maxParticipants: 6,
  frequency: 'monthly',
  startDate: '2024-12-01T00:00:00Z'
});
```

### Присоединение к группе

```javascript
async function joinGroup(userId, groupId) {
  // 1. Получить группу
  const groupRes = await fetch(`tables/groups/${groupId}`);
  const group = await groupRes.json();
  
  // 2. Проверки
  if (group.participants.includes(userId)) {
    throw new Error('Вы уже участник группы');
  }
  
  if (group.participants.length >= group.maxParticipants) {
    throw new Error('Группа заполнена');
  }
  
  if (group.status !== 'waiting') {
    throw new Error('Группа уже запущена');
  }
  
  // 3. Добавить участника
  const updatedParticipants = [...group.participants, userId];
  
  await fetch(`tables/groups/${groupId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participants: updatedParticipants })
  });
  
  // 4. Если группа заполнена - активировать
  if (updatedParticipants.length === group.maxParticipants) {
    await activateGroup(groupId, updatedParticipants);
  }
  
  // 5. Добавить группу пользователю
  await addGroupToUser(userId, groupId);
}

async function activateGroup(groupId, participants) {
  // Случайный порядок выплат
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  
  await fetch(`tables/groups/${groupId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'active',
      payoutOrder: shuffled
    })
  });
  
  console.log('Группа активирована! Порядок выплат:', shuffled);
}
```

### Получить группы пользователя

```javascript
async function getUserGroups(userId) {
  const response = await fetch('tables/groups');
  const { data: allGroups } = await response.json();
  
  return allGroups.filter(g => g.participants.includes(userId));
}

// Использование
const myGroups = await getUserGroups('user-001');
console.log(`Вы участник ${myGroups.length} групп`);
```

### Получить доступные группы

```javascript
async function getAvailableGroups(userId) {
  const response = await fetch('tables/groups');
  const { data: allGroups } = await response.json();
  
  return allGroups.filter(g => 
    g.status === 'waiting' &&
    !g.participants.includes(userId) &&
    g.participants.length < g.maxParticipants
  );
}
```

---

## Работа с транзакциями

### Внести взнос

```javascript
async function makeContribution(userId, groupId) {
  // 1. Получить группу
  const groupRes = await fetch(`tables/groups/${groupId}`);
  const group = await groupRes.json();
  
  // 2. Получить пользователя
  const userRes = await fetch(`tables/users/${userId}`);
  const user = await userRes.json();
  
  // 3. Проверки
  if (!group.participants.includes(userId)) {
    throw new Error('Вы не участник группы');
  }
  
  if (group.status !== 'active') {
    throw new Error('Группа неактивна');
  }
  
  if (user.balance < group.contributionAmount) {
    throw new Error('Недостаточно средств');
  }
  
  // Проверить, не внёс ли уже в этом раунде
  const txRes = await fetch('tables/transactions');
  const { data: transactions } = await txRes.json();
  
  const alreadyContributed = transactions.some(tx =>
    tx.groupId === groupId &&
    tx.fromUserId === userId &&
    tx.round === group.currentRound &&
    tx.type === 'contribution'
  );
  
  if (alreadyContributed) {
    throw new Error('Вы уже внесли взнос в этом раунде');
  }
  
  // 4. Создать транзакцию
  const transaction = {
    id: 'txn-' + crypto.randomUUID(),
    groupId: groupId,
    fromUserId: userId,
    toUserId: 'system',
    amount: group.contributionAmount,
    round: group.currentRound,
    type: 'contribution',
    status: 'completed'
  };
  
  await fetch('tables/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });
  
  // 5. Обновить баланс
  await updateBalance(userId, -group.contributionAmount);
  
  console.log('Взнос внесён:', transaction.id);
  return transaction;
}
```

### Сделать выплату (администратор)

```javascript
async function makePayout(groupId) {
  // 1. Получить группу
  const groupRes = await fetch(`tables/groups/${groupId}`);
  const group = await groupRes.json();
  
  if (group.status !== 'active') {
    throw new Error('Группа неактивна');
  }
  
  // 2. Проверить, все ли внесли взносы
  const txRes = await fetch('tables/transactions');
  const { data: transactions } = await txRes.json();
  
  const currentRoundContributions = transactions.filter(tx =>
    tx.groupId === groupId &&
    tx.round === group.currentRound &&
    tx.type === 'contribution' &&
    tx.status === 'completed'
  );
  
  if (currentRoundContributions.length < group.participants.length) {
    console.warn('Не все участники внесли взносы');
  }
  
  // 3. Определить получателя
  const recipientId = group.payoutOrder[group.currentRound - 1];
  const payoutAmount = group.contributionAmount * group.maxParticipants;
  
  // 4. Создать транзакцию выплаты
  const payoutTx = {
    id: 'txn-' + crypto.randomUUID(),
    groupId: groupId,
    fromUserId: 'system',
    toUserId: recipientId,
    amount: payoutAmount,
    round: group.currentRound,
    type: 'payout',
    status: 'completed'
  };
  
  await fetch('tables/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payoutTx)
  });
  
  // 5. Начислить получателю
  await updateBalance(recipientId, payoutAmount);
  
  // 6. Переход к следующему раунду
  const nextRound = group.currentRound + 1;
  const isCompleted = nextRound > group.maxParticipants;
  
  // Расчёт следующей даты
  const currentDate = new Date(group.nextPayoutDate);
  const nextDate = new Date(currentDate);
  if (group.frequency === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else {
    nextDate.setDate(nextDate.getDate() + 7);
  }
  
  await fetch(`tables/groups/${groupId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentRound: isCompleted ? group.currentRound : nextRound,
      status: isCompleted ? 'completed' : 'active',
      nextPayoutDate: nextDate.toISOString()
    })
  });
  
  console.log(`Выплата ${payoutAmount} рублей сделана получателю ${recipientId}`);
  return payoutTx;
}
```

### Получить историю транзакций пользователя

```javascript
async function getUserTransactions(userId, filters = {}) {
  const response = await fetch('tables/transactions');
  const { data: transactions } = await response.json();
  
  let filtered = transactions.filter(tx =>
    tx.fromUserId === userId || tx.toUserId === userId
  );
  
  if (filters.type) {
    filtered = filtered.filter(tx => tx.type === filters.type);
  }
  
  if (filters.groupId) {
    filtered = filtered.filter(tx => tx.groupId === filters.groupId);
  }
  
  if (filters.status) {
    filtered = filtered.filter(tx => tx.status === filters.status);
  }
  
  // Сортировка по дате (новые сверху)
  filtered.sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );
  
  return filtered;
}

// Использование
const allTx = await getUserTransactions('user-001');
const contributions = await getUserTransactions('user-001', { type: 'contribution' });
const payouts = await getUserTransactions('user-001', { type: 'payout' });
```

---

## Сложные запросы

### Статистика пользователя

```javascript
async function getUserStats(userId) {
  // Получить все данные
  const [groupsRes, txRes] = await Promise.all([
    fetch('tables/groups'),
    fetch('tables/transactions')
  ]);
  
  const { data: groups } = await groupsRes.json();
  const { data: transactions } = await txRes.json();
  
  // Группы пользователя
  const userGroups = groups.filter(g => g.participants.includes(userId));
  const activeGroups = userGroups.filter(g => g.status === 'active');
  
  // Транзакции пользователя
  const userTx = transactions.filter(tx =>
    tx.fromUserId === userId || tx.toUserId === userId
  );
  
  const contributions = userTx
    .filter(tx => tx.type === 'contribution' && tx.fromUserId === userId)
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const payouts = userTx
    .filter(tx => tx.type === 'payout' && tx.toUserId === userId)
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  // Следующая выплата
  let nextPayout = null;
  for (const group of activeGroups) {
    const myIndex = group.payoutOrder.indexOf(userId);
    if (myIndex >= group.currentRound - 1) {
      nextPayout = {
        groupName: group.name,
        amount: group.contributionAmount * group.maxParticipants,
        date: group.nextPayoutDate,
        roundsLeft: myIndex - (group.currentRound - 1)
      };
      break;
    }
  }
  
  return {
    totalGroups: userGroups.length,
    activeGroups: activeGroups.length,
    totalContributions: contributions,
    totalPayouts: payouts,
    netPosition: payouts - contributions,
    nextPayout: nextPayout
  };
}

// Использование
const stats = await getUserStats('user-001');
console.log('Статистика:', stats);
```

### Статистика группы

```javascript
async function getGroupStats(groupId) {
  const [groupRes, txRes] = await Promise.all([
    fetch(`tables/groups/${groupId}`),
    fetch('tables/transactions')
  ]);
  
  const group = await groupRes.json();
  const { data: transactions } = await txRes.json();
  
  const groupTx = transactions.filter(tx => tx.groupId === groupId);
  
  const contributionsByRound = {};
  for (let round = 1; round <= group.currentRound; round++) {
    contributionsByRound[round] = groupTx.filter(tx =>
      tx.round === round && tx.type === 'contribution'
    ).length;
  }
  
  const totalCollected = groupTx
    .filter(tx => tx.type === 'contribution')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const totalPaidOut = groupTx
    .filter(tx => tx.type === 'payout')
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  return {
    groupName: group.name,
    status: group.status,
    currentRound: group.currentRound,
    totalRounds: group.maxParticipants,
    progress: (group.currentRound / group.maxParticipants * 100).toFixed(1) + '%',
    participants: group.participants.length,
    contributionsByRound,
    totalCollected,
    totalPaidOut,
    nextPayoutDate: group.nextPayoutDate
  };
}
```

### Поиск групп с фильтрами

```javascript
async function searchGroups(filters = {}) {
  const response = await fetch('tables/groups');
  const { data: groups } = await response.json();
  
  let results = groups;
  
  // Фильтр по статусу
  if (filters.status) {
    results = results.filter(g => g.status === filters.status);
  }
  
  // Фильтр по периодичности
  if (filters.frequency) {
    results = results.filter(g => g.frequency === filters.frequency);
  }
  
  // Фильтр по диапазону взноса
  if (filters.minAmount) {
    results = results.filter(g => g.contributionAmount >= filters.minAmount);
  }
  if (filters.maxAmount) {
    results = results.filter(g => g.contributionAmount <= filters.maxAmount);
  }
  
  // Фильтр по количеству участников
  if (filters.minParticipants) {
    results = results.filter(g => g.maxParticipants >= filters.minParticipants);
  }
  
  // Поиск по названию
  if (filters.search) {
    const query = filters.search.toLowerCase();
    results = results.filter(g => 
      g.name.toLowerCase().includes(query)
    );
  }
  
  // Сортировка
  if (filters.sortBy === 'amount') {
    results.sort((a, b) => a.contributionAmount - b.contributionAmount);
  } else if (filters.sortBy === 'participants') {
    results.sort((a, b) => b.participants.length - a.participants.length);
  } else {
    // По умолчанию - по дате создания
    results.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }
  
  return results;
}

// Примеры использования
const activeMonthly = await searchGroups({
  status: 'active',
  frequency: 'monthly'
});

const affordableGroups = await searchGroups({
  maxAmount: 5000,
  status: 'waiting'
});

const searchResults = await searchGroups({
  search: 'семейн'
});
```

---

## Обработка ошибок

### Обёртка для безопасных запросов

```javascript
async function safeApiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Для DELETE может не быть тела
    if (response.status === 204) {
      return { success: true };
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    
    // Показать пользователю
    alert(`Ошибка: ${error.message}`);
    
    throw error;
  }
}

// Использование
try {
  const user = await safeApiRequest('tables/users/user-001');
  console.log(user);
} catch (error) {
  // Обработка ошибки
}
```

### Повторные попытки при сбое

```javascript
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json();
      }
      
      // Не повторять для клиентских ошибок (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Экспоненциальная задержка
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Валидация перед запросом

```javascript
function validateGroup(groupData) {
  const errors = [];
  
  if (!groupData.name || groupData.name.trim().length < 3) {
    errors.push('Название должно быть минимум 3 символа');
  }
  
  if (groupData.maxParticipants < 3 || groupData.maxParticipants > 20) {
    errors.push('Количество участников: от 3 до 20');
  }
  
  if (groupData.contributionAmount < 100) {
    errors.push('Минимальный взнос: 100 рублей');
  }
  
  if (!['weekly', 'monthly'].includes(groupData.frequency)) {
    errors.push('Неверная периодичность');
  }
  
  const startDate = new Date(groupData.startDate);
  if (startDate < new Date()) {
    errors.push('Дата старта не может быть в прошлом');
  }
  
  if (errors.length > 0) {
    throw new Error('Ошибки валидации:\n' + errors.join('\n'));
  }
  
  return true;
}

// Использование
try {
  validateGroup(formData);
  await createGroup(userId, formData);
} catch (error) {
  alert(error.message);
}
```

---

## 💡 Полезные утилиты

### Форматирование данных

```javascript
// Форматирование валюты
function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
}

// Форматирование даты
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// Относительное время
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    год: 31536000,
    месяц: 2592000,
    день: 86400,
    час: 3600,
    минута: 60
  };
  
  for (const [name, seconds_count] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / seconds_count);
    if (interval >= 1) {
      return `${interval} ${name} назад`;
    }
  }
  
  return 'только что';
}
```

### Кеширование запросов

```javascript
const cache = new Map();

async function cachedFetch(url, ttl = 60000) {
  const cached = cache.get(url);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log('Возврат из кеша:', url);
    return cached.data;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  cache.set(url, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}

// Использование (кеш на 1 минуту)
const groups = await cachedFetch('tables/groups', 60000);
```

---

**Версия**: 1.0  
**Последнее обновление**: 2024-10-27
