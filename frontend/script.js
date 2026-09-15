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
    financeExpenseCount: document.getElementById("financeExpenseCount")
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

let tasks = loadTasks();
let transactions = loadTransactions();
let budgets = loadBudgets();
let currentFilter = "today";
let currentView = "tasks";
let editingTaskId = null;
let toastTimer;

initializeTheme();
initializeDate();
initializeEvents();
render();
renderFinance();

function loadTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem("tarefas")) || [];
        return savedTasks.map(normalizeTask);
    } catch {
        return [];
    }
}

function loadTransactions() {
    try {
        const saved = JSON.parse(localStorage.getItem("financas-pessoais")) || [];
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
        return JSON.parse(localStorage.getItem("orcamentos-pessoais")) || {};
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
    localStorage.setItem("tarefas", JSON.stringify(tasks));
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
    localStorage.setItem("financas-pessoais", JSON.stringify(transactions));
    closeFinanceModal();
    renderFinance();
    showToast("Lançamento salvo.");
}

function deleteTransaction(id) {
    const transaction = transactions.find((item) => String(item.id) === String(id));
    if (!transaction || !confirm(`Excluir “${transaction.description}”?`)) return;
    transactions = transactions.filter((item) => String(item.id) !== String(id));
    localStorage.setItem("financas-pessoais", JSON.stringify(transactions));
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
    localStorage.setItem("orcamentos-pessoais", JSON.stringify(budgets));
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
