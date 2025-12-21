// GoalTracker JavaScript

// Данные
let goals = JSON.parse(localStorage.getItem('goals')) || [];
let achievements = JSON.parse(localStorage.getItem('achievements')) || [];
let currentGoalId = null;

// Элементы DOM
const mainContent = document.getElementById('main-content');
const homeBtn = document.getElementById('home-btn');
const goalsBtn = document.getElementById('goals-btn');
const themeToggle = document.getElementById('theme-toggle');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    showHome();
    setupEventListeners();
});

// Настройка слушателей событий
function setupEventListeners() {
    homeBtn.addEventListener('click', showHome);
    goalsBtn.addEventListener('click', showGoals);
    themeToggle.addEventListener('click', toggleTheme);
    const footerFaq = document.getElementById('footer-faq');
    if (footerFaq) {
        footerFaq.addEventListener('click', (e) => {
            e.preventDefault();
            showFAQ();
        });
    }
}

// Переключение темы
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}

function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark');
        themeToggle.textContent = '☀️';
    } else {
        themeToggle.textContent = '🌙';
    }
}

// Показать главную страницу
function showHome() {
    mainContent.innerHTML = `
        <div class="card fade-in">
            <h2>Добро пожаловать в GoalTracker!</h2>
            <p>Отслеживайте свои личные цели, разбивайте их на шаги и наблюдайте за прогрессом.</p>
            <button class="btn" onclick="showGoals()">Начать</button>
        </div>
        <div class="card fade-in">
            <h3>График прогресса</h3>
            <div class="chart" id="progress-chart">${renderChart()}</div>
        </div>
    `;
}

// Показать FAQ (информацию о сайте)
function showFAQ() {
    mainContent.innerHTML = `
        <div class="card fade-in">
            <h2>FAQ — О сайте</h2>
            <p><strong>GoalTracker</strong> — это простой и удобный инструмент для постановки, разбивки и отслеживания личных целей.</p>
            <h3>Для чего он нужен</h3>
            <ul>
                <li>Создавать цели и разбивать их на шаги.</li>
                <li>Отслеживать прогресс выполнения с помощью прогресс-бара и графика.</li>
                <li>Отмечать шаги как выполненные и видеть достижения.</li>
                <li>Хранить данные локально в браузере (localStorage).</li>
            </ul>
            <h3>Как начать</h3>
            <p>Нажмите «Мои цели» → «Добавить цель», заполните поля и добавьте шаги. Прогресс будет автоматически считаться по выполненным шагам.</p>
            <button class="btn" onclick="showGoals()">Перейти к целям</button>
        </div>
    `;
}

// Показать список целей
function showGoals() {
    mainContent.innerHTML = `
        <div class="card fade-in">
            <h2>Мои цели</h2>
            <button class="btn" onclick="showAddGoalForm()">Добавить цель</button>
            <div class="categories">
                <button class="category category-all" onclick="filterGoals('all')">Все</button>
                <button class="category category-study" onclick="filterGoals('учёба')">📚 Учёба</button>
                <button class="category category-sport" onclick="filterGoals('спорт')">⚽ Спорт</button>
                <button class="category category-finance" onclick="filterGoals('финансы')">💰 Финансы</button>
                <button class="category category-other" onclick="filterGoals('другое')">🎯 Другое</button>
            </div>
        </div>
        <div id="goals-list">${renderGoals()}</div>
    `;
}

// Рендеринг целей
function renderGoals(filter = 'all') {
    let filteredGoals = goals;
    if (filter !== 'all') {
        filteredGoals = goals.filter(goal => goal.category === filter);
    }
    return filteredGoals.map(goal => `
        <div class="card fade-in">
            <h3>${goal.title}</h3>
            <p>${goal.description}</p>
            <p>Категория: ${goal.category}</p>
            <p>Статус: ${goal.status === 'active' ? 'Активна' : 'Завершена'}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${calculateProgress(goal)}%"></div>
            </div>
            <p>Прогресс: ${calculateProgress(goal)}%</p>
            <button class="btn btn-secondary" onclick="viewGoal(${goal.id})">Просмотр</button>
        </div>
    `).join('');
}

// Фильтр целей
function filterGoals(category) {
    document.getElementById('goals-list').innerHTML = renderGoals(category);
}

// Показать цель
function viewGoal(id) {
    const goal = goals.find(g => g.id === id);
    currentGoalId = id;
    mainContent.innerHTML = `
        <div class="card fade-in">
            <h2>${goal.title}</h2>
            <p>${goal.description}</p>
            <p>Категория: ${goal.category}</p>
            <p>Дата начала: ${goal.startDate}</p>
            <p>Дедлайн: ${goal.deadline}</p>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${calculateProgress(goal)}%"></div>
            </div>
            <p>Прогресс: ${calculateProgress(goal)}%</p>
            <h3>Шаги</h3>
            <div id="steps-list">${renderSteps(goal.steps)}</div>
            <button class="btn" onclick="addStepForm()">Добавить шаг</button>
            <button class="btn btn-secondary" onclick="deleteGoal(${goal.id})">Удалить цель</button>
            <button class="btn btn-secondary" onclick="showGoals()">Назад</button>
        </div>
    `;
}

// Рендеринг шагов
function renderSteps(steps) {
    return steps.map(step => `
        <div class="step ${step.completed ? 'completed' : ''}">
            <input type="checkbox" class="checkbox" ${step.completed ? 'checked' : ''} onchange="toggleStep(${step.id})">
            <span>${step.text}</span>
        </div>
    `).join('');
}

// Переключить шаг
function toggleStep(stepId) {
    const goal = goals.find(g => g.id === currentGoalId);
    const step = goal.steps.find(s => s.id === stepId);
    step.completed = !step.completed;
    if (calculateProgress(goal) === 100) {
        goal.status = 'completed';
    }
    saveGoals();
    viewGoal(currentGoalId);
    checkAchievements();
}

// Добавить шаг
function addStepForm() {
    const stepText = prompt('Введите текст шага:');
    if (stepText) {
        const goal = goals.find(g => g.id === currentGoalId);
        const newStep = {
            id: Date.now(),
            text: stepText,
            completed: false
        };
        goal.steps.push(newStep);
        saveGoals();
        viewGoal(currentGoalId);
    }
}

// Показать форму добавления цели
function showAddGoalForm() {
    mainContent.innerHTML = `
        <div class="card fade-in">
            <h2>Добавить цель</h2>
            <form id="add-goal-form">
                <input type="text" id="goal-title" placeholder="Название цели" required>
                <textarea id="goal-description" placeholder="Описание" required></textarea>
                <select id="goal-category" required>
                    <option value="">Выберите категорию</option>
                    <option value="учёба">Учёба</option>
                    <option value="спорт">Спорт</option>
                    <option value="финансы">Финансы</option>
                    <option value="другое">Другое</option>
                </select>
                <input type="date" id="goal-start" required>
                <input type="date" id="goal-deadline" required>
                <button type="submit" class="btn">Добавить</button>
            </form>
        </div>
    `;
    document.getElementById('add-goal-form').addEventListener('submit', addGoal);
}

// Добавить цель
function addGoal(e) {
    e.preventDefault();
    const newGoal = {
        id: Date.now(),
        title: document.getElementById('goal-title').value,
        description: document.getElementById('goal-description').value,
        category: document.getElementById('goal-category').value,
        startDate: document.getElementById('goal-start').value,
        deadline: document.getElementById('goal-deadline').value,
        status: 'active',
        steps: []
    };
    goals.push(newGoal);
    saveGoals();
    showGoals();
}

// Рассчитать прогресс
function calculateProgress(goal) {
    if (goal.steps.length === 0) return 0;
    const completed = goal.steps.filter(step => step.completed).length;
    return Math.round((completed / goal.steps.length) * 100);
}

// Проверить достижения
function checkAchievements() {
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const totalSteps = goals.reduce((sum, g) => sum + g.steps.length, 0);
    const completedSteps = goals.reduce((sum, g) => sum + g.steps.filter(s => s.completed).length, 0);
    
    if (completedGoals >= 1 && !achievements.includes('Первая цель выполнена!')) {
        achievements.push('Первая цель выполнена!');
    }
    if (completedGoals >= 5 && !achievements.includes('5 целей выполнено!')) {
        achievements.push('5 целей выполнено!');
    }
    if (completedSteps >= 10 && !achievements.includes('10 шагов выполнено!')) {
        achievements.push('10 шагов выполнено!');
    }
    if (totalSteps >= 50 && !achievements.includes('50 шагов создано!')) {
        achievements.push('50 шагов создано!');
    }
    saveAchievements();
}

// Рендеринг достижений
function renderAchievements() {
    return achievements.map(ach => `<p>🏆 ${ach}</p>`).join('');
}

// Сохранить цели
function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
}

// Рендеринг графика
function renderChart() {
    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length === 0) return '<p>Нет активных целей</p>';
    return activeGoals.map(goal => `
        <div class="chart-bar" style="height: ${calculateProgress(goal)}%; background: linear-gradient(to top, #ff6b6b, #feca57);">
            <span>${goal.title}: ${calculateProgress(goal)}%</span>
        </div>
    `).join('');
}

// Удалить цель
function deleteGoal(id) {
    if (confirm('Вы уверены, что хотите удалить эту цель?')) {
        goals = goals.filter(g => g.id !== id);
        saveGoals();
        showGoals();
    }
}