const elements = {
    body: document.body,
    taskList: document.getElementById("taskList"),
    emptyState: document.getElementById("emptyState"),
    emptyTitle: document.getElementById("emptyTitle"),
    emptyMessage: document.getElementById("emptyMessage"),
    taskModal: document.getElementById("taskModal"),
    taskForm: document.getElementById("taskForm"),
    taskTitle: document.getElementById("taskTitle"),
    taskDescription: document.getElementById("taskDescription"),
    taskDueDate: document.getElementById("taskDueDate"),
    taskPriority: document.getElementById("taskPriority"),
    taskTags: document.getElementById("taskTags"),
    modalTitle: document.getElementById("modalTitle"),
    quickTaskInput: document.getElementById("quickTaskInput"),
    notification: document.getElementById("notification"),
    pageTitle: document.getElementById("pageTitle"),
    pageSubtitle: document.getElementById("pageSubtitle"),
    listTitle: document.getElementById("listTitle"),
    listHint: document.getElementById("listHint"),
    currentDate: document.getElementById("currentDate"),
    progressText: document.getElementById("progressText"),
    progressBar: document.getElementById("progressBar"),
    progressMessage: document.getElementById("progressMessage"),
    financeView: document.getElementById("financeView"),
    financeModal: document.getElementById("financeModal"),
    financeForm: document.getElementById("financeForm"),
    financeMonth: document.getElementById("financeMonth"),
    transactionList: document.getElementById("transactionList"),
    financeEmptyState: document.getElementById("financeEmptyState"),
    transactionTypeFilter: document.getElementById("transactionTypeFilter"),
    budgetInput: document.getElementById("budgetInput"),
    budgetSpent: document.getElementById("budgetSpent"),
    budgetLimit: document.getElementById("budgetLimit"),
    budgetBar: document.getElementById("budgetBar"),
    budgetMessage: document.getElementById("budgetMessage"),
    categoryChart: document.getElementById("categoryChart"),
    financeBalance: document.getElementById("financeBalance"),
    financeIncome: document.getElementById("financeIncome"),
    financeExpenses: document.getElementById("financeExpenses"),
    financeIncomeCount: document.getElementById("financeIncomeCount"),
    financeExpenseCount: document.getElementById("financeExpenseCount"),
    dashboardPeriod: document.getElementById("dashboardPeriod"),
    dailyAverage: document.getElementById("dailyAverage"),
    dailyAverageNote: document.getElementById("dailyAverageNote"),
    topCategory: document.getElementById("topCategory"),
    topCategoryAmount: document.getElementById("topCategoryAmount"),
    topExpense: document.getElementById("topExpense"),
    topExpenseAmount: document.getElementById("topExpenseAmount"),
    trendChart: document.getElementById("trendChart"),
    trendLabels: document.getElementById("trendLabels"),
    comparisonLabel: document.getElementById("comparisonLabel"),
    comparisonValue: document.getElementById("comparisonValue"),
    comparisonDirection: document.getElementById("comparisonDirection"),
    comparisonBar: document.getElementById("comparisonBar"),
    currentMonthSpent: document.getElementById("currentMonthSpent"),
    previousMonthSpent: document.getElementById("previousMonthSpent")
};

const counts = {
    today: document.getElementById("todayCount"),
    upcoming: document.getElementById("upcomingCount"),
    completed: document.getElementById("completedCount"),
    all: document.getElementById("allCount"),
    open: document.getElementById("openTotal"),
    todayTotal: document.getElementById("todayTotal"),
    done: document.getElementById("doneTotal")
};

const authElements = {
    screen: document.getElementById("authScreen"),
    form: document.getElementById("authForm"),
    title: document.getElementById("authTitle"),
    subtitle: document.getElementById("authSubtitle"),
    email: document.getElementById("authEmail"),
    password: document.getElementById("authPassword"),
    submit: document.getElementById("authSubmit"),
    message: document.getElementById("authMessage"),
    toggle: document.getElementById("toggleAuthMode"),
    forgot: document.getElementById("forgotPassword"),
    setup: document.getElementById("authSetup"),
    logout: document.getElementById("logoutButton"),
    google: document.getElementById("googleAuth")
};

const supabaseConfig = window.SUPABASE_CONFIG || {};
const hasSupabaseConfig = Boolean(window.supabase && supabaseConfig.url && supabaseConfig.anonKey && !supabaseConfig.url.startsWith("COLE_"));
const supabaseClient = hasSupabaseConfig ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey) : null;
const authRedirectUrl = supabaseConfig.siteUrl || `${window.location.origin}${window.location.pathname}`;

let tasks = loadTasks();
let transactions = loadTransactions();
let budgets = loadBudgets();
let activeUserId = null;
let currentFilter = "today";
let currentView = "tasks";
let editingTaskId = null;
let toastTimer;

initializeTheme();
initializeDate();
initializeEvents();
render();
renderFinance();
initializeAuth();

function loadTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem(storageKey("tarefas"))) || [];
        return savedTasks.map(normalizeTask);
    } catch {
        return [];
    }
}

function loadTransactions() {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey("financas-pessoais"))) || [];
        return saved.map((item) => ({
            id: item.id || Date.now() + Math.random(),
            description: item.description || "Sem descrição",
            amount: Number(item.amount) || 0,
            type: item.type === "income" ? "income" : "expense",
            date: item.date || todayKey(),
            category: item.category || "Outros",
            payment: item.payment || ""
        }));
    } catch {
        return [];
    }
}

function loadBudgets() {
    try {
        return JSON.parse(localStorage.getItem(storageKey("orcamentos-pessoais"))) || {};
    } catch {
        return {};
    }
}

function normalizeTask(task) {
    return {
        id: task.id || Date.now() + Math.random(),
        title: task.title || task.descricao || "Sem título",
        description: task.description || "",
        dueDate: task.dueDate || todayKey(),
        priority: task.priority || "normal",
        tags: Array.isArray(task.tags) ? task.tags : [],
        completed: task.completed ?? task.concluida ?? false,
        createdAt: task.createdAt || new Date().toISOString()
    };
}

function initializeEvents() {
    document.querySelectorAll(".app-nav").forEach((button) => {
        button.addEventListener("click", () => switchView(button.dataset.view));
    });

    document.querySelectorAll(".nav-item").forEach((button) => {
        if (!button.dataset.filter) return;
        button.addEventListener("click", () => {
            currentFilter = button.dataset.filter;
            document.querySelectorAll(".task-filters .nav-item").forEach((item) => item.classList.remove("active"));
            button.classList.add("active");
            document.querySelector('.app-nav[data-view="tasks"]').classList.add("active");
            render();
        });
    });

    document.getElementById("openTaskModal").addEventListener("click", () => openModal());
    document.getElementById("emptyAddButton").addEventListener("click", () => openModal());
    document.getElementById("closeTaskModal").addEventListener("click", closeModal);
    document.getElementById("cancelTask").addEventListener("click", closeModal);
    document.getElementById("taskModal").addEventListener("click", (event) => {
        if (event.target === elements.taskModal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !elements.taskModal.hidden) closeModal();
        if (event.key === "Escape" && !elements.financeModal.hidden) closeFinanceModal();
    });

    elements.taskForm.addEventListener("submit", saveTaskFromForm);
    document.getElementById("quickAddButton").addEventListener("click", addQuickTask);
    elements.quickTaskInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") addQuickTask();
    });
    document.getElementById("clearCompleted").addEventListener("click", clearCompleted);
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);
    document.getElementById("openFinanceModal").addEventListener("click", () => openFinanceModal());
    document.getElementById("emptyFinanceAdd").addEventListener("click", () => openFinanceModal());
    document.getElementById("closeFinanceModal").addEventListener("click", closeFinanceModal);
    document.getElementById("cancelFinance").addEventListener("click", closeFinanceModal);
    elements.financeModal.addEventListener("click", (event) => {
        if (event.target === elements.financeModal) closeFinanceModal();
    });
    elements.financeForm.addEventListener("submit", saveTransaction);
    elements.financeMonth.addEventListener("change", renderFinance);
    elements.transactionTypeFilter.addEventListener("change", renderFinance);
    document.getElementById("saveBudget").addEventListener("click", saveBudget);
    document.getElementById("exportFinance").addEventListener("click", exportFinance);
    authElements.form.addEventListener("submit", handleAuthSubmit);
    authElements.toggle.addEventListener("click", toggleAuthMode);
    authElements.forgot.addEventListener("click", sendPasswordReset);
    authElements.google.addEventListener("click", signInWithGoogle);
    authElements.logout.addEventListener("click", logout);
}

async function initializeAuth() {
    if (!supabaseClient) return;
    authElements.screen.hidden = false;
    document.querySelector(".app-shell").hidden = true;
    authElements.setup.hidden = true;
    const { data } = await supabaseClient.auth.getSession();
    updateAuthState(data.session);
    supabaseClient.auth.onAuthStateChange((_event, session) => updateAuthState(session));
}

function updateAuthState(session) {
    const isAuthenticated = Boolean(session);
    const nextUserId = session?.user?.id || null;
    const userChanged = activeUserId !== nextUserId;
    activeUserId = nextUserId;
    authElements.screen.hidden = isAuthenticated;
    document.querySelector(".app-shell").hidden = !isAuthenticated;
    authElements.logout.hidden = !isAuthenticated;
    if (isAuthenticated) {
        authElements.email.value = "";
        authElements.password.value = "";
    }
    if (userChanged) {
        tasks = loadTasks();
        transactions = loadTransactions();
        budgets = loadBudgets();
        render();
        renderFinance();
    }
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    if (!supabaseClient) {
        showAuthMessage("Configure o Supabase em supabase-config.js antes de entrar.");
        authElements.setup.hidden = false;
        return;
    }
    setAuthBusy(true);
    const email = authElements.email.value.trim();
    const password = authElements.password.value;
    const result = authMode === "login"
        ? await supabaseClient.auth.signInWithPassword({ email, password })
        : await supabaseClient.auth.signUp({ email, password, options: { emailRedirectTo: authRedirectUrl } });
    setAuthBusy(false);
    if (result.error) {
        showAuthMessage(formatAuthError(result.error));
        return;
    }
    if (authMode === "signup" && !result.data.session) {
        showAuthMessage("Conta criada. Confirme seu e-mail pelo link enviado pelo Supabase e depois entre.", "success");
        return;
    }
    showAuthMessage("Login realizado.", "success");
}

let authMode = "login";

function toggleAuthMode() {
    authMode = authMode === "login" ? "signup" : "login";
    const isSignup = authMode === "signup";
    authElements.title.textContent = isSignup ? "Criar sua conta" : "Entrar na sua conta";
    authElements.subtitle.textContent = isSignup ? "Crie seu espaço pessoal para sincronizar seus dados." : "Acesse suas tarefas e finanças de qualquer dispositivo.";
    authElements.submit.textContent = isSignup ? "Criar conta" : "Entrar";
    authElements.toggle.textContent = isSignup ? "Já tenho uma conta" : "Criar uma conta";
    authElements.forgot.hidden = isSignup;
    showAuthMessage("");
}

async function sendPasswordReset() {
    if (!supabaseClient) {
        showAuthMessage("Configure o Supabase antes de recuperar sua senha.");
        return;
    }
    const email = authElements.email.value.trim();
    if (!email) {
        showAuthMessage("Informe seu e-mail para receber o link de recuperação.");
        authElements.email.focus();
        return;
    }
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl });
    showAuthMessage(error ? formatAuthError(error) : "Confira seu e-mail para redefinir a senha.", error ? "" : "success");
}

function formatAuthError(error) {
    const message = `${error?.message || ""} ${error?.code || ""}`.toLowerCase();
    if (message.includes("email not confirmed")) {
        return "Seu e-mail ainda não foi confirmado. Abra a mensagem do Supabase e clique no link antes de entrar.";
    }
    if (message.includes("invalid login credentials")) {
        return "E-mail ou senha incorretos. Confira os dados ou use 'Esqueci minha senha'.";
    }
    if (message.includes("user already registered")) {
        return "Este e-mail já possui uma conta. Volte para Entrar ou use 'Esqueci minha senha'.";
    }
    if (message.includes("rate limit")) {
        return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    }
    if (message.includes("redirect") || message.includes("origin")) {
        return "A URL deste site ainda não está autorizada no Supabase. Confira Authentication > URL Configuration.";
    }
    return error?.message || "Não foi possível concluir a autenticação.";
}

async function signInWithGoogle() {
    if (!supabaseClient) {
        showAuthMessage("Configure o Supabase antes de entrar com o Google.");
        authElements.setup.hidden = false;
        return;
    }
    authElements.google.disabled = true;
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: authRedirectUrl }
    });
    if (error) {
        authElements.google.disabled = false;
        showAuthMessage(formatAuthError(error));
    }
}

async function logout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
}

function setAuthBusy(isBusy) {
    authElements.submit.disabled = isBusy;
    authElements.submit.textContent = isBusy ? "Aguarde..." : authMode === "login" ? "Entrar" : "Criar conta";
}

function showAuthMessage(message, type = "") {
    authElements.message.textContent = message;
    authElements.message.dataset.type = type;
}

function switchView(view) {
    currentView = view;
    document.querySelectorAll(".app-nav").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
    document.querySelectorAll(".tasks-view, .overview, .quick-add, .tasks-section, .task-filters").forEach((item) => {
        item.hidden = view !== "tasks";
    });
    elements.financeView.hidden = view !== "finance";
    if (view === "finance") renderFinance();
}

function initializeTheme() {
    const savedTheme = localStorage.getItem("tema") || "light";
    setTheme(savedTheme);
}

function setTheme(theme) {
    const isDark = theme === "dark";
    elements.body.dataset.theme = isDark ? "dark" : "light";
    localStorage.setItem("tema", elements.body.dataset.theme);
    document.querySelector(".theme-icon").textContent = isDark ? "☼" : "◐";
    document.getElementById("themeToggle").setAttribute(
        "aria-label",
        isDark ? "Ativar modo claro" : "Ativar modo escuro"
    );
}

function toggleTheme() {
    setTheme(elements.body.dataset.theme === "dark" ? "light" : "dark");
}

function initializeDate() {
    elements.currentDate.textContent = new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long"
    });
}

function render() {
    const visibleTasks = getVisibleTasks();
    elements.taskList.innerHTML = visibleTasks.map(createTaskMarkup).join("");
    elements.emptyState.hidden = visibleTasks.length > 0;

    updateEmptyState(visibleTasks.length);
    updatePageCopy();
    updateCounts();
    updateProgress();
    bindTaskActions();
}

function getVisibleTasks() {
    const today = todayKey();

    if (currentFilter === "today") {
        return tasks.filter((task) => !task.completed && task.dueDate === today);
    }

    if (currentFilter === "upcoming") {
        return tasks.filter((task) => !task.completed && task.dueDate > today);
    }

    if (currentFilter === "completed") {
        return tasks.filter((task) => task.completed);
    }

    return tasks.filter((task) => !task.completed);
}

function createTaskMarkup(task) {
    const tags = task.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
    const dueLabel = task.dueDate ? formatDueDate(task.dueDate) : "Sem vencimento";
    const priorityLabel = task.priority === "high" ? "Alta" : task.priority === "low" ? "Baixa" : "Normal";

    return `
        <article class="task-card priority-${task.priority} ${task.completed ? "completed" : ""}" data-task-id="${task.id}">
            <button class="check-button" type="button" data-action="toggle" aria-label="${task.completed ? "Marcar como pendente" : "Concluir tarefa"}">
                ${task.completed ? "✓" : ""}
            </button>
            <div class="task-content">
                <h3 class="task-title">${escapeHtml(task.title)}</h3>
                ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ""}
                <div class="task-meta">
                    <span>${dueLabel}</span>
                    <span class="priority-label">${priorityLabel}</span>
                    ${tags}
                </div>
            </div>
            <div class="task-actions">
                <button class="icon-button" type="button" data-action="edit" aria-label="Editar tarefa">Editar</button>
                <button class="icon-button delete" type="button" data-action="delete" aria-label="Excluir tarefa">Excluir</button>
            </div>
        </article>
    `;
}

function bindTaskActions() {
    elements.taskList.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest("[data-task-id]");
            const task = tasks.find((item) => String(item.id) === card.dataset.taskId);
            const action = button.dataset.action;

            if (action === "toggle") toggleTask(task);
            if (action === "edit") openModal(task);
            if (action === "delete") deleteTask(task);
        });
    });
}

function updateCounts() {
    const today = todayKey();
    const openTasks = tasks.filter((task) => !task.completed);

    counts.today.textContent = openTasks.filter((task) => task.dueDate === today).length;
    counts.upcoming.textContent = openTasks.filter((task) => task.dueDate > today).length;
    counts.completed.textContent = tasks.filter((task) => task.completed).length;
    counts.all.textContent = openTasks.length;
    counts.open.textContent = openTasks.length;
    counts.todayTotal.textContent = tasks.filter((task) => task.dueDate === today && !task.completed).length;
    counts.done.textContent = tasks.filter((task) => task.completed).length;
}

function updateProgress() {
    const completed = tasks.filter((task) => task.completed).length;
    const percentage = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

    elements.progressText.textContent = `${percentage}%`;
    elements.progressBar.style.width = `${percentage}%`;
    elements.progressMessage.textContent = tasks.length
        ? `${completed} de ${tasks.length} concluída(s).`
        : "Nenhuma tarefa concluída ainda.";
}

function updatePageCopy() {
    const copy = {
        today: ["Hoje", "O que precisa da sua atenção.", "Tarefas de hoje", "Uma coisa de cada vez."],
        upcoming: ["Próximas", "O que vem depois de hoje.", "Próximas tarefas", "Planeje sem ocupar a cabeça."],
        completed: ["Concluídas", "Um registro do que já foi feito.", "Tarefas concluídas", "Bom trabalho. Todo passo conta."],
        all: ["Todas", "Tudo o que está na sua lista.", "Todas as tarefas", "Uma coisa de cada vez."]
    }[currentFilter];

    elements.pageTitle.textContent = copy[0];
    elements.pageSubtitle.textContent = copy[1];
    elements.listTitle.textContent = copy[2];
    elements.listHint.textContent = copy[3];
}

function updateEmptyState(taskCount) {
    if (taskCount > 0) return;

    const isCompleted = currentFilter === "completed";
    elements.emptyTitle.textContent = isCompleted ? "Nada concluído ainda." : "Nada por aqui.";
    elements.emptyMessage.textContent = isCompleted
        ? "As tarefas que você concluir vão aparecer neste espaço."
        : "Adicione uma tarefa para começar a organizar o seu dia.";
}

function openModal(task = null) {
    editingTaskId = task?.id || null;
    elements.modalTitle.textContent = task ? "Editar tarefa" : "O que precisa ser feito?";
    elements.taskForm.reset();

    if (task) {
        elements.taskTitle.value = task.title;
        elements.taskDescription.value = task.description;
        elements.taskDueDate.value = task.dueDate;
        elements.taskPriority.value = task.priority;
        elements.taskTags.value = task.tags.join(", ");
    } else {
        elements.taskDueDate.value = todayKey();
    }

    elements.taskModal.hidden = false;
    document.body.style.overflow = "hidden";
    elements.taskTitle.focus();
}

function closeModal() {
    elements.taskModal.hidden = true;
    document.body.style.overflow = "";
    editingTaskId = null;
}

function saveTaskFromForm(event) {
    event.preventDefault();
    const formData = new FormData(elements.taskForm);
    const data = {
        title: formData.get("title").trim(),
        description: formData.get("description").trim(),
        dueDate: formData.get("dueDate") || todayKey(),
        priority: formData.get("priority"),
        tags: parseTags(formData.get("tags"))
    };

    if (!data.title) return;

    if (editingTaskId) {
        const task = tasks.find((item) => item.id === editingTaskId);
        Object.assign(task, data);
        showToast("Tarefa atualizada.");
    } else {
        tasks.push({ id: Date.now(), ...data, completed: false, createdAt: new Date().toISOString() });
        showToast("Tarefa adicionada.");
    }

    persistTasks();
    closeModal();
    render();
}

function addQuickTask() {
    const title = elements.quickTaskInput.value.trim();
    if (!title) {
        elements.quickTaskInput.focus();
        return;
    }

    tasks.push({
        id: Date.now(),
        title,
        description: "",
        dueDate: todayKey(),
        priority: "normal",
        tags: [],
        completed: false,
        createdAt: new Date().toISOString()
    });

    elements.quickTaskInput.value = "";
    persistTasks();
    render();
    showToast("Tarefa adicionada.");
}

function toggleTask(task) {
    task.completed = !task.completed;
    persistTasks();
    render();
    showToast(task.completed ? "Tarefa concluída." : "Tarefa reaberta.");
}

function deleteTask(task) {
    if (!confirm(`Excluir “${task.title}”?`)) return;
    tasks = tasks.filter((item) => item.id !== task.id);
    persistTasks();
    render();
    showToast("Tarefa excluída.");
}

function clearCompleted() {
    const completedCount = tasks.filter((task) => task.completed).length;
    if (!completedCount) {
        showToast("Não há tarefas concluídas.");
        return;
    }

    if (!confirm(`Excluir ${completedCount} tarefa(s) concluída(s)?`)) return;
    tasks = tasks.filter((task) => !task.completed);
    persistTasks();
    render();
    showToast("Tarefas concluídas removidas.");
}

function persistTasks() {
    localStorage.setItem(storageKey("tarefas"), JSON.stringify(tasks));
}

function storageKey(name) {
    return activeUserId ? `${name}:${activeUserId}` : name;
}

function parseTags(value) {
    return value.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 5);
}

function todayKey() {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function formatDueDate(dateKey) {
    if (dateKey === todayKey()) return "Hoje";
    const [year, month, day] = dateKey.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function renderFinance() {
    const month = elements.financeMonth.value || currentMonthKey();
    elements.financeMonth.value = month;
    const monthTransactions = transactions.filter((item) => item.date.startsWith(month));
    const income = sumTransactions(monthTransactions, "income");
    const expenses = sumTransactions(monthTransactions, "expense");
    const budget = Number(budgets[month]) || 0;

    elements.financeBalance.textContent = formatMoney(income - expenses);
    elements.financeBalance.classList.toggle("negative-value", income - expenses < 0);
    elements.financeIncome.textContent = formatMoney(income);
    elements.financeExpenses.textContent = formatMoney(expenses);
    elements.financeIncomeCount.textContent = `${monthTransactions.filter((item) => item.type === "income").length} lançamento(s)`;
    elements.financeExpenseCount.textContent = `${monthTransactions.filter((item) => item.type === "expense").length} lançamento(s)`;
    elements.budgetInput.value = budget || "";
    elements.budgetSpent.textContent = formatMoney(expenses);
    elements.budgetLimit.textContent = `de ${formatMoney(budget)}`;
    elements.budgetBar.style.width = budget ? `${Math.min((expenses / budget) * 100, 100)}%` : "0%";
    elements.budgetBar.classList.toggle("over-budget", budget > 0 && expenses > budget);
    elements.budgetMessage.textContent = budget
        ? expenses > budget ? `Você passou ${formatMoney(expenses - budget)} do limite.` : `Restam ${formatMoney(budget - expenses)} para este mês.`
        : "Defina seu orçamento para acompanhar seu limite.";

    renderCategoryChart(monthTransactions);
    renderTransactionList(monthTransactions);
    renderDashboard(month, monthTransactions);
}

function renderDashboard(month, monthTransactions) {
    const monthDate = parseMonthKey(month);
    const monthName = monthDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    elements.dashboardPeriod.textContent = capitalize(monthName);

    const expenses = monthTransactions.filter((item) => item.type === "expense");
    const expenseTotal = sumTransactions(monthTransactions, "expense");
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const categoryTotals = expenses.reduce((result, item) => {
        result[item.category] = (result[item.category] || 0) + item.amount;
        return result;
    }, {});
    const topCategory = Object.entries(categoryTotals).sort((first, second) => second[1] - first[1])[0];
    const topExpense = expenses.slice().sort((first, second) => second.amount - first.amount)[0];

    elements.dailyAverage.textContent = formatMoney(expenseTotal / daysInMonth);
    elements.dailyAverageNote.textContent = `Em ${daysInMonth} dias do mês`;
    elements.topCategory.textContent = topCategory?.[0] || "Nenhuma";
    elements.topCategoryAmount.textContent = formatMoney(topCategory?.[1] || 0);
    elements.topExpense.textContent = topExpense?.description || "Nenhuma";
    elements.topExpenseAmount.textContent = formatMoney(topExpense?.amount || 0);

    renderTrendChart(month);
    renderMonthComparison(month, expenseTotal);
}

function renderTrendChart(selectedMonth) {
    const months = [];
    const selectedDate = parseMonthKey(selectedMonth);
    for (let offset = 5; offset >= 0; offset -= 1) {
        const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - offset, 1);
        const key = monthKey(date);
        months.push({
            key,
            label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
            total: sumTransactions(transactions.filter((item) => item.date.startsWith(key)), "expense")
        });
    }
    const highest = Math.max(...months.map((item) => item.total), 1);
    elements.trendChart.innerHTML = months.map((item) => `<div class="trend-column" title="${item.label}: ${formatMoney(item.total)}"><span class="trend-value">${item.total ? formatMoney(item.total) : ""}</span><div class="trend-bar ${item.key === selectedMonth ? "selected" : ""}"><span style="height: ${item.total ? Math.max((item.total / highest) * 100, 5) : 3}%"></span></div></div>`).join("");
    elements.trendLabels.innerHTML = months.map((item) => `<span>${item.label}</span>`).join("");
}

function renderMonthComparison(month, currentTotal) {
    const selectedDate = parseMonthKey(month);
    const previousMonth = monthKey(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    const previousTotal = sumTransactions(transactions.filter((item) => item.date.startsWith(previousMonth)), "expense");
    const variation = previousTotal ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
    const roundedVariation = Math.round(Math.abs(variation));
    const hasComparison = previousTotal > 0 || currentTotal > 0;

    elements.comparisonLabel.textContent = previousTotal ? `Em relação a ${formatMonthLabel(previousMonth)}.` : "Ainda não há despesas no mês anterior.";
    elements.comparisonValue.textContent = previousTotal ? `${variation > 0 ? "+" : "-"}${roundedVariation}%` : "Novo";
    elements.comparisonValue.classList.toggle("comparison-up", variation > 0);
    elements.comparisonValue.classList.toggle("comparison-down", variation < 0);
    elements.comparisonDirection.textContent = previousTotal ? variation > 0 ? "Você gastou mais" : variation < 0 ? "Você gastou menos" : "Mesmo valor" : "Sem comparação disponível";
    elements.comparisonBar.style.width = `${hasComparison ? Math.min(previousTotal ? (currentTotal / Math.max(currentTotal, previousTotal)) * 100 : 100, 100) : 0}%`;
    elements.comparisonBar.classList.toggle("comparison-warning", variation > 0);
    elements.currentMonthSpent.textContent = `Este mês: ${formatMoney(currentTotal)}`;
    elements.previousMonthSpent.textContent = `Anterior: ${formatMoney(previousTotal)}`;
}

function renderTransactionList(monthTransactions) {
    const selectedType = elements.transactionTypeFilter.value;
    const visibleTransactions = monthTransactions
        .filter((item) => selectedType === "all" || item.type === selectedType)
        .sort((first, second) => second.date.localeCompare(first.date));

    elements.transactionList.innerHTML = visibleTransactions.map(createTransactionMarkup).join("");
    elements.financeEmptyState.hidden = visibleTransactions.length > 0;
    elements.transactionList.querySelectorAll("[data-transaction-id]").forEach((item) => {
        item.addEventListener("click", () => deleteTransaction(item.dataset.transactionId));
    });
}

function createTransactionMarkup(transaction) {
    const sign = transaction.type === "income" ? "+" : "-";
    return `<article class="transaction-row" data-transaction-id="${transaction.id}">
        <span class="transaction-symbol ${transaction.type}">${transaction.type === "income" ? "↑" : "↓"}</span>
        <div class="transaction-details"><strong>${escapeHtml(transaction.description)}</strong><small>${formatDate(transaction.date)} · ${escapeHtml(transaction.category)}${transaction.payment ? ` · ${escapeHtml(transaction.payment)}` : ""}</small></div>
        <strong class="transaction-amount ${transaction.type}">${sign} ${formatMoney(transaction.amount)}</strong>
        <button class="icon-button delete" type="button" aria-label="Excluir lançamento">×</button>
    </article>`;
}

function renderCategoryChart(monthTransactions) {
    const categories = monthTransactions.filter((item) => item.type === "expense").reduce((result, item) => {
        result[item.category] = (result[item.category] || 0) + item.amount;
        return result;
    }, {});
    const sorted = Object.entries(categories).sort((first, second) => second[1] - first[1]);
    const largest = sorted[0]?.[1] || 1;
    elements.categoryChart.innerHTML = sorted.length ? sorted.slice(0, 6).map(([category, amount]) => `<div class="category-row"><div><span>${escapeHtml(category)}</span><strong>${formatMoney(amount)}</strong></div><div class="category-track"><span style="width: ${Math.max((amount / largest) * 100, 4)}%"></span></div></div>`).join("") : `<p class="finance-muted">Nenhuma despesa registrada.</p>`;
}

function openFinanceModal() {
    elements.financeForm.reset();
    document.getElementById("financeDate").value = todayKey();
    elements.financeModal.hidden = false;
    document.body.style.overflow = "hidden";
    document.getElementById("financeDescription").focus();
}

function closeFinanceModal() {
    elements.financeModal.hidden = true;
    document.body.style.overflow = "";
}

function saveTransaction(event) {
    event.preventDefault();
    const formData = new FormData(elements.financeForm);
    const transaction = {
        id: Date.now(),
        description: formData.get("description").trim(),
        amount: Number(formData.get("amount")),
        type: formData.get("type"),
        date: formData.get("date"),
        category: formData.get("category"),
        payment: formData.get("payment").trim()
    };
    if (!transaction.description || !transaction.amount || transaction.amount < 0) return;
    transactions.push(transaction);
    localStorage.setItem(storageKey("financas-pessoais"), JSON.stringify(transactions));
    closeFinanceModal();
    renderFinance();
    showToast("Lançamento salvo.");
}

function deleteTransaction(id) {
    const transaction = transactions.find((item) => String(item.id) === String(id));
    if (!transaction || !confirm(`Excluir “${transaction.description}”?`)) return;
    transactions = transactions.filter((item) => String(item.id) !== String(id));
    localStorage.setItem(storageKey("financas-pessoais"), JSON.stringify(transactions));
    renderFinance();
    showToast("Lançamento excluído.");
}

function saveBudget() {
    const month = elements.financeMonth.value || currentMonthKey();
    const value = Number(elements.budgetInput.value);
    if (!value || value < 0) {
        delete budgets[month];
    } else {
        budgets[month] = value;
    }
    localStorage.setItem(storageKey("orcamentos-pessoais"), JSON.stringify(budgets));
    renderFinance();
    showToast("Orçamento atualizado.");
}

function exportFinance() {
    const month = elements.financeMonth.value || currentMonthKey();
    const rows = transactions.filter((item) => item.date.startsWith(month));
    const csv = [["Data", "Descrição", "Tipo", "Categoria", "Forma de pagamento", "Valor"], ...rows.map((item) => [item.date, item.description, item.type === "income" ? "Entrada" : "Despesa", item.category, item.payment, item.amount.toFixed(2)])]
        .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";"))
        .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    link.download = `financas-${month}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function sumTransactions(items, type) {
    return items.filter((item) => item.type === type).reduce((total, item) => total + item.amount, 0);
}

function currentMonthKey() {
    return todayKey().slice(0, 7);
}

function monthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonthKey(value) {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
}

function formatMonthLabel(value) {
    return capitalize(parseMonthKey(value).toLocaleDateString("pt-BR", { month: "long" }));
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatMoney(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(dateKey) {
    const [year, month, day] = dateKey.split("-");
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function showToast(message) {
    elements.notification.textContent = message;
    elements.notification.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elements.notification.classList.remove("show"), 2400);
}

function escapeHtml(value) {
    const container = document.createElement("div");
    container.textContent = value;
    return container.innerHTML;
}
