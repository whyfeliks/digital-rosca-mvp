// ========================================
// GLOBAL STATE & UTILITIES
// ========================================
const APP = {
    currentUser: null,
    users: [],
    groups: [],
    transactions: [],
    notifications: []
};

// ========================================
// MOCK DATA для GitHub Pages
// ========================================
const MOCK_DATA = {
    users: [
        { id: "user-admin-001", name: "Администратор", email: "admin@rosca.app", passwordHash: "admin123", balance: 50000, role: "admin", joinedGroups: [], created_at: new Date().toISOString() },
        { id: "user-001", name: "Иван Петров", email: "ivan@example.com", passwordHash: "pass123", balance: 15000, role: "user", joinedGroups: ["group-001"], created_at: new Date().toISOString() },
        { id: "user-002", name: "Анна Сидорова", email: "anna@example.com", passwordHash: "pass123", balance: 8000, role: "user", joinedGroups: ["group-001"], created_at: new Date().toISOString() },
        { id: "user-003", name: "Алиса Кузнецова", email: "alisa@example.com", passwordHash: "pass123", balance: 5000, role: "user", joinedGroups: ["group-001"], created_at: new Date().toISOString() },
        { id: "user-004", name: "Дмитрий Новиков", email: "dmitry@example.com", passwordHash: "pass123", balance: 5000, role: "user", joinedGroups: ["group-001"], created_at: new Date().toISOString() },
        { id: "user-005", name: "Елена Волкова", email: "elena@example.com", passwordHash: "pass123", balance: 5000, role: "user", joinedGroups: ["group-001"], created_at: new Date().toISOString() }
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
        { id: "txn-001", groupId: "group-001", fromUserId: "system", toUserId: "user-001", amount: 25000, round: 1, type: "payout", status: "completed", created_at: new Date('2024-11-01').toISOString() },
        { id: "txn-002", groupId: "group-001", fromUserId: "user-001", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date('2024-11-01').toISOString() },
        { id: "txn-003", groupId: "group-001", fromUserId: "user-002", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date('2024-11-01').toISOString() },
        { id: "txn-004", groupId: "group-001", fromUserId: "user-003", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date('2024-11-01').toISOString() },
        { id: "txn-005", groupId: "group-001", fromUserId: "user-004", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date('2024-11-01').toISOString() },
        { id: "txn-006", groupId: "group-001", fromUserId: "user-005", toUserId: "system", amount: 5000, round: 1, type: "contribution", status: "completed", created_at: new Date('2024-11-01').toISOString() }
    ],
    notifications: []
};

// Сохранение в localStorage
function saveMockData() {
    localStorage.setItem('rosca_data', JSON.stringify(MOCK_DATA));
}

// Загрузка из localStorage
function loadMockData() {
    const saved = localStorage.getItem('rosca_data');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            MOCK_DATA.users = data.users || MOCK_DATA.users;
            MOCK_DATA.groups = data.groups || MOCK_DATA.groups;
            MOCK_DATA.transactions = data.transactions || MOCK_DATA.transactions;
            MOCK_DATA.notifications = data.notifications || MOCK_DATA.notifications;
        } catch (e) {
            console.warn('Failed to load saved data:', e);
        }
    }
}

// Инициализация mock data
loadMockData();

// API Helper - MOCK VERSION для GitHub Pages
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
                    data: MOCK_DATA[table] || [],
                    total: (MOCK_DATA[table] || []).length,
                    page: 1,
                    limit: 100,
                    table: table
                };
            }
        } else if (method === 'POST') {
            const newRecord = JSON.parse(options.body);
            newRecord.created_at = new Date().toISOString();
            newRecord.updated_at = new Date().toISOString();
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

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Show/Hide Screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Show/Hide Views
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.view === viewId.replace('View', '')) {
            link.classList.add('active');
        }
    });
}

// Show/Hide Modal
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ========================================
// AUTHENTICATION
// ========================================
async function login(email, password) {
    try {
        const response = await apiRequest('users');
        APP.users = response.data;
        
        const user = APP.users.find(u => u.email === email && u.passwordHash === password);
        
        if (user) {
            APP.currentUser = user;
            localStorage.setItem('currentUserId', user.id);
            
            showScreen('appScreen');
            await loadDashboard();
            
            // Show admin menu if admin
            if (user.role === 'admin') {
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = '';
                });
            }
        } else {
            alert('Неверный email или пароль');
        }
    } catch (error) {
        alert('Ошибка входа: ' + error.message);
    }
}

function logout() {
    APP.currentUser = null;
    localStorage.removeItem('currentUserId');
    showScreen('loginScreen');
    document.getElementById('loginForm').reset();
}

// ========================================
// DATA LOADING
// ========================================
async function loadAllData() {
    try {
        const [usersRes, groupsRes, txRes] = await Promise.all([
            apiRequest('users'),
            apiRequest('groups'),
            apiRequest('transactions')
        ]);
        
        APP.users = usersRes.data;
        APP.groups = groupsRes.data;
        APP.transactions = txRes.data;
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function loadDashboard() {
    await loadAllData();
    updateUserInfo();
    renderDashboard();
    renderMyGroups();
    renderNotifications();
}

function updateUserInfo() {
    if (!APP.currentUser) return;
    
    // Обновить данные из MOCK_DATA
    const updatedUser = MOCK_DATA.users.find(u => u.id === APP.currentUser.id);
    if (updatedUser) {
        APP.currentUser = updatedUser;
    }
    
    document.getElementById('userName').textContent = APP.currentUser.name;
    document.getElementById('userBalance').textContent = formatCurrency(APP.currentUser.balance || 0).replace(' ₽', '');
}

// ========================================
// DASHBOARD
// ========================================
function renderDashboard() {
    const myGroups = APP.groups.filter(g => 
        g.participants.includes(APP.currentUser.id)
    );
    
    const myTransactions = APP.transactions.filter(tx =>
        tx.fromUserId === APP.currentUser.id || tx.toUserId === APP.currentUser.id
    );
    
    const contributions = myTransactions
        .filter(tx => tx.type === 'contribution' && tx.fromUserId === APP.currentUser.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    const payouts = myTransactions
        .filter(tx => tx.type === 'payout' && tx.toUserId === APP.currentUser.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Find next payout
    let nextPayoutDate = '—';
    for (const group of myGroups) {
        if (group.status === 'active' && group.payoutOrder) {
            const myIndex = group.payoutOrder.indexOf(APP.currentUser.id);
            if (myIndex > group.currentRound - 1) {
                nextPayoutDate = formatDate(group.nextPayoutDate);
                break;
            }
        }
    }
    
    document.getElementById('totalGroups').textContent = myGroups.length;
    document.getElementById('totalContributions').textContent = formatCurrency(contributions);
    document.getElementById('totalPayouts').textContent = formatCurrency(payouts);
    document.getElementById('nextPayout').textContent = nextPayoutDate;
}

function renderMyGroups() {
    const container = document.getElementById('myGroupsList');
    const myGroups = APP.groups.filter(g => 
        g.participants.includes(APP.currentUser.id)
    );
    
    if (myGroups.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>Вы пока не участвуете в группах</p></div>';
        return;
    }
    
    container.innerHTML = myGroups.map(group => `
        <div class="group-item" onclick="showGroupDetails('${group.id}')">
            <div class="group-header">
                <div>
                    <div class="group-title">${group.name}</div>
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        Раунд ${group.currentRound} из ${group.maxParticipants}
                    </div>
                </div>
                <span class="group-status status-${group.status}">${getStatusText(group.status)}</span>
            </div>
            <div class="group-info">
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    ${group.participants.length}/${group.maxParticipants}
                </div>
                <div class="info-item">
                    <i class="fas fa-coins"></i>
                    ${formatCurrency(group.contributionAmount)}
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    ${group.frequency === 'monthly' ? 'Ежемесячно' : 'Еженедельно'}
                </div>
            </div>
        </div>
    `).join('');
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    
    // Create mock notifications based on user's groups and transactions
    const notifications = [];
    
    APP.groups.forEach(group => {
        if (group.participants.includes(APP.currentUser.id) && group.status === 'active') {
            notifications.push({
                title: 'Напоминание о взносе',
                message: `Не забудьте внести ${formatCurrency(group.contributionAmount)} в группу "${group.name}"`,
                time: new Date().toISOString(),
                isRead: false
            });
        }
    });
    
    if (notifications.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><p>Нет уведомлений</p></div>';
        return;
    }
    
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.isRead ? '' : 'unread'}">
            <div class="notification-title">${notif.title}</div>
            <div class="notification-message">${notif.message}</div>
            <div class="notification-time">${formatDate(notif.time)}</div>
        </div>
    `).join('');
}

// ========================================
// GROUPS VIEW
// ========================================
async function loadGroupsView() {
    await loadAllData();
    renderAllGroups();
    renderMyGroupsTab();
    renderAvailableGroups();
}

function renderAllGroups() {
    const container = document.getElementById('allGroupsList');
    
    if (APP.groups.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>Пока нет групп</p><button class="btn btn-primary" onclick="showModal(\'createGroupModal\')">Создать первую группу</button></div>';
        return;
    }
    
    container.innerHTML = APP.groups.map(group => renderGroupCard(group)).join('');
}

function renderMyGroupsTab() {
    const container = document.getElementById('myGroupsTab');
    const myGroups = APP.groups.filter(g => 
        g.participants.includes(APP.currentUser.id)
    );
    
    if (myGroups.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>Вы пока не участвуете в группах</p></div>';
        return;
    }
    
    container.innerHTML = myGroups.map(group => renderGroupCard(group)).join('');
}

function renderAvailableGroups() {
    const container = document.getElementById('availableGroupsTab');
    const availableGroups = APP.groups.filter(g => 
        g.status === 'waiting' && 
        !g.participants.includes(APP.currentUser.id) &&
        g.participants.length < g.maxParticipants
    );
    
    if (availableGroups.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>Нет доступных групп для присоединения</p></div>';
        return;
    }
    
    container.innerHTML = availableGroups.map(group => renderGroupCard(group, true)).join('');
}

function renderGroupCard(group, showJoinBtn = false) {
    const isMember = group.participants.includes(APP.currentUser.id);
    const isCreator = group.creatorId === APP.currentUser.id;
    
    return `
        <div class="group-item">
            <div class="group-header">
                <div>
                    <div class="group-title">${group.name}</div>
                    <div class="info-item">
                        <i class="fas fa-user"></i>
                        Создатель: ${getUserName(group.creatorId)}
                    </div>
                </div>
                <span class="group-status status-${group.status}">${getStatusText(group.status)}</span>
            </div>
            <div class="group-info">
                <div class="info-item">
                    <i class="fas fa-users"></i>
                    ${group.participants.length}/${group.maxParticipants} участников
                </div>
                <div class="info-item">
                    <i class="fas fa-coins"></i>
                    Взнос: ${formatCurrency(group.contributionAmount)}
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    Раунд ${group.currentRound}
                </div>
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    ${group.frequency === 'monthly' ? 'Ежемесячно' : 'Еженедельно'}
                </div>
            </div>
            <div class="group-actions">
                <button class="btn btn-primary" onclick="showGroupDetails('${group.id}')">
                    <i class="fas fa-eye"></i> Подробнее
                </button>
                ${showJoinBtn ? `
                    <button class="btn btn-success" onclick="joinGroup('${group.id}')">
                        <i class="fas fa-user-plus"></i> Присоединиться
                    </button>
                ` : ''}
                ${isMember && group.status === 'active' ? `
                    <button class="btn btn-warning" onclick="makeContribution('${group.id}')">
                        <i class="fas fa-hand-holding-usd"></i> Внести взнос
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// ========================================
// GROUP DETAILS MODAL
// ========================================
async function showGroupDetails(groupId) {
    const group = APP.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const content = document.getElementById('groupDetailsContent');
    document.getElementById('groupDetailsTitle').textContent = group.name;
    
    // Get payout schedule
    let scheduleHTML = '';
    if (group.payoutOrder && group.payoutOrder.length > 0) {
        scheduleHTML = group.payoutOrder.map((userId, index) => {
            const roundNum = index + 1;
            const isCompleted = roundNum < group.currentRound;
            const isCurrent = roundNum === group.currentRound;
            const userName = getUserName(userId);
            
            return `
                <div class="round-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}">
                    <div>
                        <span class="round-number">Раунд ${roundNum}</span>
                        <span> → ${userName}</span>
                    </div>
                    <div>
                        <strong>${formatCurrency(group.contributionAmount * group.maxParticipants)}</strong>
                        ${isCompleted ? '<i class="fas fa-check-circle" style="color: var(--secondary); margin-left: 0.5rem;"></i>' : ''}
                        ${isCurrent ? '<span style="color: var(--primary); margin-left: 0.5rem;">Текущий</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    content.innerHTML = `
        <div class="group-details">
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Информация о группе</h3>
                <div class="group-info">
                    <div class="info-item">
                        <i class="fas fa-coins"></i>
                        Взнос за раунд: ${formatCurrency(group.contributionAmount)}
                    </div>
                    <div class="info-item">
                        <i class="fas fa-trophy"></i>
                        Выплата за раунд: ${formatCurrency(group.contributionAmount * group.maxParticipants)}
                    </div>
                    <div class="info-item">
                        <i class="fas fa-users"></i>
                        Участников: ${group.participants.length}/${group.maxParticipants}
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        Дата старта: ${formatDate(group.startDate)}
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        Периодичность: ${group.frequency === 'monthly' ? 'Ежемесячно' : 'Еженедельно'}
                    </div>
                    <div class="info-item">
                        <i class="fas fa-flag"></i>
                        Статус: ${getStatusText(group.status)}
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-users"></i> Участники</h3>
                <div class="participants-list">
                    ${group.participants.map((userId, index) => `
                        <div class="participant-item">
                            <span>
                                <i class="fas fa-user"></i>
                                ${getUserName(userId)}
                                ${userId === group.creatorId ? '<span style="color: var(--primary);"> (Создатель)</span>' : ''}
                            </span>
                            <span>Позиция: ${index + 1}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-calendar-alt"></i> График выплат</h3>
                <div class="payout-schedule">
                    ${scheduleHTML || '<p style="color: var(--gray);">График будет сформирован после заполнения группы</p>'}
                </div>
            </div>
        </div>
    `;
    
    showModal('groupDetailsModal');
}

// ========================================
// GROUP ACTIONS
// ========================================
async function createGroup(formData) {
    try {
        const newGroup = {
            id: 'group-' + generateUUID(),
            name: formData.name,
            creatorId: APP.currentUser.id,
            participants: [APP.currentUser.id],
            contributionAmount: parseInt(formData.contributionAmount),
            maxParticipants: parseInt(formData.maxParticipants),
            payoutOrder: [],
            frequency: formData.frequency,
            currentRound: 1,
            status: 'waiting',
            startDate: new Date(formData.startDate).toISOString(),
            nextPayoutDate: new Date(formData.startDate).toISOString()
        };
        
        await apiRequest('groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGroup)
        });
        
        // Update user's joined groups
        const updatedUser = {...APP.currentUser};
        if (!updatedUser.joinedGroups) updatedUser.joinedGroups = [];
        updatedUser.joinedGroups.push(newGroup.id);
        
        await apiRequest(`groups/${APP.currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ joinedGroups: updatedUser.joinedGroups })
        });
        
        alert('Группа успешно создана!');
        hideModal('createGroupModal');
        loadGroupsView();
        loadDashboard();
    } catch (error) {
        alert('Ошибка создания группы: ' + error.message);
    }
}

async function joinGroup(groupId) {
    try {
        const group = APP.groups.find(g => g.id === groupId);
        if (!group) throw new Error('Группа не найдена');
        
        if (group.participants.includes(APP.currentUser.id)) {
            alert('Вы уже участвуете в этой группе');
            return;
        }
        
        if (group.participants.length >= group.maxParticipants) {
            alert('Группа уже заполнена');
            return;
        }
        
        // Add user to group
        const updatedParticipants = [...group.participants, APP.currentUser.id];
        
        await apiRequest(`groups/${groupId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participants: updatedParticipants })
        });
        
        // If group is full, activate it and generate payout order
        if (updatedParticipants.length === group.maxParticipants) {
            const shuffledOrder = [...updatedParticipants].sort(() => Math.random() - 0.5);
            
            await apiRequest(`groups/${groupId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: 'active',
                    payoutOrder: shuffledOrder
                })
            });
        }
        
        alert('Вы успешно присоединились к группе!');
        await loadGroupsView();
        await loadDashboard();
    } catch (error) {
        alert('Ошибка присоединения: ' + error.message);
    }
}

async function makeContribution(groupId) {
    try {
        const group = APP.groups.find(g => g.id === groupId);
        if (!group) throw new Error('Группа не найдена');
        
        // Check if user already contributed this round
        const existingContribution = APP.transactions.find(tx =>
            tx.groupId === groupId &&
            tx.fromUserId === APP.currentUser.id &&
            tx.round === group.currentRound &&
            tx.type === 'contribution'
        );
        
        if (existingContribution) {
            alert('Вы уже внесли взнос в этом раунде');
            return;
        }
        
        // Check balance
        if (APP.currentUser.balance < group.contributionAmount) {
            alert('Недостаточно средств на балансе');
            return;
        }
        
        // Create contribution transaction
        const txn = {
            id: 'txn-' + generateUUID(),
            groupId: groupId,
            fromUserId: APP.currentUser.id,
            toUserId: 'system',
            amount: group.contributionAmount,
            round: group.currentRound,
            type: 'contribution',
            status: 'completed'
        };
        
        await apiRequest('transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(txn)
        });
        
        // Update user balance
        const newBalance = APP.currentUser.balance - group.contributionAmount;
        await apiRequest(`users/${APP.currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ balance: newBalance })
        });
        
        APP.currentUser.balance = newBalance;
        
        alert('Взнос успешно внесён!');
        await loadDashboard();
        await loadTransactionsView();
    } catch (error) {
        alert('Ошибка внесения взноса: ' + error.message);
    }
}

// ========================================
// TRANSACTIONS VIEW
// ========================================
async function loadTransactionsView() {
    await loadAllData();
    renderTransactions();
}

function renderTransactions(typeFilter = '', statusFilter = '') {
    const container = document.getElementById('transactionsList');
    
    let filtered = APP.transactions.filter(tx =>
        tx.fromUserId === APP.currentUser.id || tx.toUserId === APP.currentUser.id
    );
    
    if (typeFilter) {
        filtered = filtered.filter(tx => tx.type === typeFilter);
    }
    
    if (statusFilter) {
        filtered = filtered.filter(tx => tx.status === statusFilter);
    }
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-receipt"></i><p>Нет транзакций</p></div>';
        return;
    }
    
    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    container.innerHTML = filtered.map(tx => {
        const isIncoming = tx.toUserId === APP.currentUser.id;
        const group = APP.groups.find(g => g.id === tx.groupId);
        
        return `
            <div class="tx-item">
                <div class="tx-info">
                    <span class="tx-type ${tx.type}">${tx.type === 'contribution' ? 'Взнос' : 'Выплата'}</span>
                    <div class="tx-details">
                        ${group ? group.name : 'Неизвестная группа'} • Раунд ${tx.round}
                    </div>
                    <div class="tx-details" style="font-size: 0.8rem; color: var(--gray);">
                        ${new Date(tx.created_at).toLocaleString('ru-RU')}
                    </div>
                </div>
                <div class="tx-amount ${isIncoming ? 'positive' : 'negative'}">
                    ${isIncoming ? '+' : '-'}${formatCurrency(tx.amount)}
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// ADMIN PANEL
// ========================================
async function loadAdminView() {
    if (APP.currentUser.role !== 'admin') {
        alert('Доступ запрещён');
        return;
    }
    
    await loadAllData();
    renderAdminStats();
    renderAdminUsers();
    renderAdminGroups();
    renderAdminActions();
}

function renderAdminStats() {
    document.getElementById('adminTotalUsers').textContent = APP.users.length;
    document.getElementById('adminTotalGroups').textContent = APP.groups.length;
    document.getElementById('adminTotalTransactions').textContent = APP.transactions.length;
}

function renderAdminUsers() {
    const container = document.getElementById('adminUsersList');
    
    container.innerHTML = `
        <table class="user-table">
            <thead>
                <tr>
                    <th>Имя</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Баланс</th>
                    <th>Групп</th>
                </tr>
            </thead>
            <tbody>
                ${APP.users.map(user => `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.role === 'admin' ? 'Администратор' : 'Пользователь'}</td>
                        <td>${formatCurrency(user.balance || 0)}</td>
                        <td>${(user.joinedGroups || []).length}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderAdminGroups() {
    const container = document.getElementById('adminGroupsList');
    
    container.innerHTML = `
        <table class="group-table">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Создатель</th>
                    <th>Участники</th>
                    <th>Взнос</th>
                    <th>Раунд</th>
                    <th>Статус</th>
                </tr>
            </thead>
            <tbody>
                ${APP.groups.map(group => `
                    <tr>
                        <td>${group.name}</td>
                        <td>${getUserName(group.creatorId)}</td>
                        <td>${group.participants.length}/${group.maxParticipants}</td>
                        <td>${formatCurrency(group.contributionAmount)}</td>
                        <td>${group.currentRound}</td>
                        <td><span class="group-status status-${group.status}">${getStatusText(group.status)}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderAdminActions() {
    const select = document.getElementById('groupSelectForce');
    const activeGroups = APP.groups.filter(g => g.status === 'active');
    
    select.innerHTML = '<option value="">Выберите группу...</option>' +
        activeGroups.map(g => `<option value="${g.id}">${g.name} (Раунд ${g.currentRound})</option>`).join('');
}

async function forceNextRound() {
    const groupId = document.getElementById('groupSelectForce').value;
    if (!groupId) {
        alert('Выберите группу');
        return;
    }
    
    try {
        const group = APP.groups.find(g => g.id === groupId);
        if (!group) throw new Error('Группа не найдена');
        
        // Check if all contributions are made
        const currentRoundContributions = APP.transactions.filter(tx =>
            tx.groupId === groupId &&
            tx.round === group.currentRound &&
            tx.type === 'contribution' &&
            tx.status === 'completed'
        );
        
        if (currentRoundContributions.length < group.participants.length) {
            if (!confirm('Не все участники внесли взносы. Продолжить?')) {
                return;
            }
        }
        
        // Create payout for current round
        const payoutUserId = group.payoutOrder[group.currentRound - 1];
        const payoutAmount = group.contributionAmount * group.maxParticipants;
        
        const payoutTxn = {
            id: 'txn-' + generateUUID(),
            groupId: groupId,
            fromUserId: 'system',
            toUserId: payoutUserId,
            amount: payoutAmount,
            round: group.currentRound,
            type: 'payout',
            status: 'completed'
        };
        
        await apiRequest('transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payoutTxn)
        });
        
        // Update recipient balance
        const recipient = APP.users.find(u => u.id === payoutUserId);
        if (recipient) {
            await apiRequest(`users/${payoutUserId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ balance: (recipient.balance || 0) + payoutAmount })
            });
        }
        
        // Move to next round or complete group
        const nextRound = group.currentRound + 1;
        const isCompleted = nextRound > group.maxParticipants;
        
        // Calculate next payout date
        const currentDate = new Date(group.nextPayoutDate);
        const nextDate = new Date(currentDate);
        if (group.frequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else {
            nextDate.setDate(nextDate.getDate() + 7);
        }
        
        await apiRequest(`groups/${groupId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentRound: isCompleted ? group.currentRound : nextRound,
                status: isCompleted ? 'completed' : 'active',
                nextPayoutDate: nextDate.toISOString()
            })
        });
        
        alert(`Раунд ${group.currentRound} завершён! Выплата ${formatCurrency(payoutAmount)} начислена ${getUserName(payoutUserId)}.`);
        await loadAdminView();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

// ========================================
// HELPER FUNCTIONS
// ========================================
function getUserName(userId) {
    if (userId === 'system') return 'Система';
    const user = APP.users.find(u => u.id === userId);
    return user ? user.name : 'Неизвестный';
}

function getStatusText(status) {
    const statuses = {
        'waiting': 'Ожидание',
        'active': 'Активна',
        'completed': 'Завершена'
    };
    return statuses[status] || status;
}

// ========================================
// EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const view = link.dataset.view;
            showView(view + 'View');
            
            // Load data for specific views
            if (view === 'groups') await loadGroupsView();
            if (view === 'transactions') await loadTransactionsView();
            if (view === 'admin') await loadAdminView();
            if (view === 'dashboard') await loadDashboard();
        });
    });
    
    // Create Group Button
    document.getElementById('createGroupBtn').addEventListener('click', () => {
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').min = today;
        document.getElementById('startDate').value = today;
        showModal('createGroupModal');
    });
    
    // Create Group Form
    document.getElementById('createGroupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('groupName').value,
            maxParticipants: document.getElementById('maxParticipants').value,
            contributionAmount: document.getElementById('contributionAmount').value,
            frequency: document.getElementById('frequency').value,
            startDate: document.getElementById('startDate').value
        };
        createGroup(formData);
    });
    
    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.remove('active');
        });
    });
    
    // Close modal on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Tabs
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            const tabName = e.target.dataset.tab;
            const container = e.target.parentElement.nextElementSibling;
            
            // Update buttons
            e.target.parentElement.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');
            
            // Update content
            container.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            container.querySelector('#' + tabName + (tabName.includes('Tab') ? '' : 'Tab')).classList.add('active');
        }
    });
    
    // Transaction Filters
    document.getElementById('txTypeFilter').addEventListener('change', (e) => {
        const typeFilter = e.target.value;
        const statusFilter = document.getElementById('txStatusFilter').value;
        renderTransactions(typeFilter, statusFilter);
    });
    
    document.getElementById('txStatusFilter').addEventListener('change', (e) => {
        const statusFilter = e.target.value;
        const typeFilter = document.getElementById('txTypeFilter').value;
        renderTransactions(typeFilter, statusFilter);
    });
    
    // Admin: Force Next Round
    document.getElementById('forceNextRoundBtn').addEventListener('click', forceNextRound);
    
    // Auto-login if user was logged in
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
        apiRequest('users').then(response => {
            const user = response.data.find(u => u.id === savedUserId);
            if (user) {
                APP.currentUser = user;
                showScreen('appScreen');
                loadDashboard();
                
                if (user.role === 'admin') {
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = '';
                    });
                }
            }
        });
    }
});

// Make functions globally accessible
window.showGroupDetails = showGroupDetails;
window.joinGroup = joinGroup;
window.makeContribution = makeContribution;
