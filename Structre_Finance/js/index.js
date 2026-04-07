const loginPath = window.location.pathname.includes("/pages/")
    ? "./login.html"
    : "./pages/login.html";

const monthInput = document.getElementById("date");
const budgetInput = document.getElementById("budget");
const saveBudgetBtn = document.getElementById("save-btn");
const budgetError = document.getElementById("errbutget");

const amountEl = document.getElementById("amoutEl");
const spentEl = document.querySelector(".amout-left");

const categoryInput = document.getElementById("category-name");
const limitInput = document.getElementById("limit-money");
const saveCategoryBtn = document.getElementById("save-btn2");
const categoryList = document.getElementById("card-list");
const categoryNameError = document.getElementById("err-input_one");
const categoryLimitError = document.getElementById("err-input-two");
const categoryFormError = document.getElementById("category-form-error");

const categoryDeleteModal = document.getElementById("delete-modal");
const cancelCategoryDeleteBtn = document.getElementById("cancel-delete");
const confirmCategoryDeleteBtn = document.getElementById("confirm-delete");

const editModal = document.getElementById("edit-modal");
const editCategoryInput = document.getElementById("edit-category-name");
const editLimitInput = document.getElementById("edit-limit-money");
const editCategoryError = document.getElementById("edit-err-name");
const editLimitError = document.getElementById("edit-err-limit");
const cancelEditBtn = document.getElementById("cancel-edit");
const confirmEditBtn = document.getElementById("confirm-edit");

const expenseAmountInput = document.getElementById("expense-amount");
const expenseCategorySelect = document.getElementById("expense-category");
const expenseNoteInput = document.getElementById("expense-note");
const addExpenseBtn = document.getElementById("add-expense-btn");
const expenseFormError = document.getElementById("expense-form-error");
const historyBody = document.getElementById("history-body");
const historyPagination = document.getElementById("history-pagination");
const sortTransactionBtn = document.getElementById("sort-transaction-btn");
const searchTransactionInput = document.getElementById("search-transaction");
const searchTransactionBtn = document.getElementById("search-transaction-btn");
const expenseAlert = document.getElementById("expense-alert");
const expenseAlertTitle = document.getElementById("expense-alert-title");
const expenseAlertText = document.getElementById("expense-alert-text");
const expenseAlertDefaultTitle = expenseAlertTitle ? expenseAlertTitle.textContent : "Canh bao chi tieu";
const expenseDeleteModal = document.getElementById("expense-delete-modal");
const cancelExpenseDeleteBtn = document.getElementById("cancel-expense-delete");
const confirmExpenseDeleteBtn = document.getElementById("confirm-expense-delete");
const openMonthReportBtn = document.getElementById("open-month-report-btn");
const monthReportModal = document.getElementById("month-report-modal");
const closeMonthReportBtn = document.getElementById("close-month-report-btn");
const monthReportSummary = document.getElementById("month-report-summary");
const monthReportList = document.getElementById("month-report-list");

const profileNameInput = document.getElementById("name");
const profileEmailInput = document.getElementById("email");
const profilePhoneInput = document.getElementById("phone");
const profileGenderInput = document.getElementById("gender");
const accountEmailInput = document.getElementById("account-email");
const accountPasswordInput = document.getElementById("password-mask");
const accountStatusInput = document.getElementById("account-status");
const profileFeedback = document.getElementById("profile-feedback");
const passwordFeedback = document.getElementById("password-feedback");
const openChangeInfoBtn = document.getElementById("open-change-info");
const openChangePasswordBtn = document.getElementById("open-change-password");

const changeInfoModal = document.getElementById("change-info-modal");
const modalNameInput = document.getElementById("modal-name");
const modalEmailInput = document.getElementById("modal-email");
const modalPhoneInput = document.getElementById("modal-phone");
const modalGenderInput = document.getElementById("modal-gender");
const saveChangeInfoBtn = document.getElementById("save-change-info");
const changeInfoError = document.getElementById("change-info-error");

const changePasswordModal = document.getElementById("change-password-modal");
const oldPasswordInput = document.getElementById("old-password");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const saveChangePasswordBtn = document.getElementById("save-change-password");
const changePasswordError = document.getElementById("change-password-error");

let categoryDeleteId = null;
let editingCategoryId = null;
let expenseDeleteId = null;
let currentHistoryPage = 1;
let historySortDirection = "desc";
let historyKeyword = "";
let expenseAlertTimeoutId = null;
let expenseAlertCountdownIntervalId = null;

const HISTORY_PAGE_SIZE = 5;
const EXPENSE_ALERT_DURATION = 5000;

function readStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function normalizeId(value) {
    if (value === undefined || value === null || value === "") {
        return null;
    }
    return String(value);
}

function normalizeMonth(value) {
    if (!value) {
        return "";
    }

    return String(value).slice(0, 7);
}

function formatMonthLabel(month) {
    const normalizedMonth = normalizeMonth(month);

    if (!normalizedMonth || !normalizedMonth.includes("-")) {
        return "Khong xac dinh";
    }

    const monthParts = normalizedMonth.split("-");
    return `${monthParts[1]}/${monthParts[0]}`;
}

function normalizeCategoryName(value) {
    return String(value || "").trim().toLowerCase();
}

function normalizeSearchText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .trim()
        .toLowerCase();
}

function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
}

function isValidEmail(value) {
    const email = String(value || "").trim();
    return email.includes("@") && email.includes(".");
}

function parseAmount(value) {
    const sanitized = String(value || "").replace(/[^\d.-]/g, "");
    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
    const amount = Number(value) || 0;
    return `${amount.toLocaleString("vi-VN")} VND`;
}

function getCurrentUser() {
    const rawUser = localStorage.getItem("currentUser");

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch (error) {
        return rawUser;
    }
}

function getCurrentUserId() {
    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    if (typeof user === "object") {
        return normalizeId(user.id ?? user.userId ?? user.userid);
    }

    return normalizeId(user);
}

function getCurrentUserRecord() {
    const currentUserId = getCurrentUserId();
    const sessionUser = getCurrentUser();
    const matchedUser = getAllUsers().find(function (item) {
        return normalizeId(item.id) === currentUserId;
    });

    if (matchedUser) {
        return matchedUser;
    }

    if (sessionUser && typeof sessionUser === "object") {
        return sessionUser;
    }

    return null;
}

function syncCurrentUserSession(user) {
    if (!user) {
        return;
    }

    localStorage.setItem("currentUser", JSON.stringify({
        id: user.id,
        fullName: user.fullName || "",
        email: user.email || "",
    }));
}

function belongsToCurrentUser(item) {
    const currentUserId = getCurrentUserId();
    return !!currentUserId && normalizeId(item.userid) === currentUserId;
}

function getDefaultMonth() {
    return new Date().toISOString().slice(0, 7);
}

function getMonthStorageKey() {
    const userId = getCurrentUserId();
    return userId ? `selectedMonth_${userId}` : "selectedMonth";
}

function getSelectedMonth() {
    return normalizeMonth(
        localStorage.getItem(getMonthStorageKey()) || localStorage.getItem("selectedMonth") || getDefaultMonth()
    );
}

function setSelectedMonth(month) {
    const normalizedMonth = normalizeMonth(month);

    if (!normalizedMonth) {
        return;
    }

    localStorage.setItem(getMonthStorageKey(), normalizedMonth);
    localStorage.setItem("selectedMonth", normalizedMonth);
}

function getActiveMonth() {
    return normalizeMonth(monthInput?.value || getSelectedMonth());
}

function getAllMonthlyCategories() {
    return readStorage("monthlyCategories", []);
}

function saveAllMonthlyCategories(data) {
    writeStorage("monthlyCategories", data);
}

function getAllCategories() {
    return readStorage("transactions", []);
}

function saveAllCategories(data) {
    writeStorage("transactions", data);
}

function getAllExpenseTransactions() {
    return readStorage("expenseTransactions", []);
}

function saveAllExpenseTransactions(data) {
    writeStorage("expenseTransactions", data);
}

function getAllUsers() {
    return readStorage("users", []);
}

function saveAllUsers(data) {
    writeStorage("users", data);
}

function getBudgetRecord(month) {
    const normalizedMonth = normalizeMonth(month);

    return getAllMonthlyCategories().find(function (item) {
        return normalizeMonth(item.month) === normalizedMonth && belongsToCurrentUser(item);
    });
}

function getMonthBudgetValue(month) {
    const record = getBudgetRecord(month);
    if (!record || !Array.isArray(record.categories) || record.categories.length === 0) {
        return 0;
    }

    return Number(record.categories[0].budget) || 0;
}

function saveMonthBudget(month, budget) {
    const currentUserId = getCurrentUserId();
    const normalizedMonth = normalizeMonth(month);

    if (!currentUserId) {
        return;
    }

    const allBudgets = getAllMonthlyCategories();
    const existingRecord = allBudgets.find(function (item) {
        return normalizeMonth(item.month) === normalizedMonth && belongsToCurrentUser(item);
    });

    if (existingRecord) {
        existingRecord.categories = [
            {
                id: existingRecord.categories?.[0]?.id || Date.now(),
                categoryId: existingRecord.categories?.[0]?.categoryId || Date.now() + 1,
                budget: Number(budget) || 0,
            },
        ];
    } else {
        allBudgets.push({
            id: Date.now(),
            month: normalizedMonth,
            userid: currentUserId,
            categories: [
                {
                    id: Date.now() + 1,
                    categoryId: Date.now() + 2,
                    budget: Number(budget) || 0,
                },
            ],
        });
    }

    saveAllMonthlyCategories(allBudgets);
}

function getCategoryMonth(item) {
    return normalizeMonth(item.createdDate || item.month || "");
}

function getUserCategories(month) {
    const normalizedMonth = normalizeMonth(month);

    return getAllCategories()
        .filter(function (item) {
            return belongsToCurrentUser(item);
        })
        .filter(function (item) {
            return !normalizedMonth || getCategoryMonth(item) === normalizedMonth;
        })
        .sort(function (a, b) {
            return Number(a.id) - Number(b.id);
        });
}

function remapExpenseCategory(expenses, userId, month, sourceCategoryId, targetCategoryId, targetCategoryName) {
    return expenses.map(function (item) {
        if (
            normalizeId(item.userid) !== normalizeId(userId) ||
            getExpenseMonth(item) !== normalizeMonth(month) ||
            String(item.categoryId) !== String(sourceCategoryId)
        ) {
            return item;
        }

        return {
            ...item,
            categoryId: targetCategoryId,
            categoryName: targetCategoryName,
        };
    });
}

function consolidateDuplicateCategoriesForCurrentUser() {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
        return;
    }

    const allCategories = getAllCategories();
    const nextCategories = [];
    const categoryGroupMap = new Map();
    let nextExpenses = getAllExpenseTransactions();
    let hasChanges = false;

    allCategories.forEach(function (item) {
        if (normalizeId(item.userid) !== currentUserId) {
            nextCategories.push(item);
            return;
        }

        const key = `${currentUserId}__${getCategoryMonth(item)}__${normalizeCategoryName(item.description)}`;
        const existingIndex = categoryGroupMap.get(key);

        if (existingIndex === undefined) {
            categoryGroupMap.set(key, nextCategories.length);
            nextCategories.push({ ...item });
            return;
        }

        const primaryCategory = nextCategories[existingIndex];
        primaryCategory.total = (Number(primaryCategory.total) || 0) + (Number(item.total) || 0);
        nextExpenses = remapExpenseCategory(
            nextExpenses,
            currentUserId,
            getCategoryMonth(item),
            item.id,
            primaryCategory.id,
            primaryCategory.description
        );
        hasChanges = true;
    });

    if (!hasChanges) {
        return;
    }

    saveAllCategories(nextCategories);
    saveAllExpenseTransactions(nextExpenses);
}

function findCategoryById(id) {
    return getAllCategories().find(function (item) {
        return String(item.id) === String(id) && belongsToCurrentUser(item);
    });
}

function getExpenseMonth(item) {
    return normalizeMonth(item.createdDate || item.month || "");
}

function getUserExpenseTransactions(month) {
    const normalizedMonth = normalizeMonth(month);

    return getAllExpenseTransactions()
        .filter(function (item) {
            return belongsToCurrentUser(item);
        })
        .filter(function (item) {
            return !normalizedMonth || getExpenseMonth(item) === normalizedMonth;
        });
}

function getMonthSpentValue(month) {
    return getUserExpenseTransactions(month).reduce(function (total, item) {
        return total + (Number(item.total) || 0);
    }, 0);
}

function getCategorySpentValue(month, categoryId) {
    return getUserExpenseTransactions(month).reduce(function (total, item) {
        if (String(item.categoryId) !== String(categoryId)) {
            return total;
        }

        return total + (Number(item.total) || 0);
    }, 0);
}

function hasCategoryTransactions(categoryId) {
    return getAllExpenseTransactions().some(function (item) {
        return belongsToCurrentUser(item) && String(item.categoryId) === String(categoryId);
    });
}

function getAvailableMonthsForCurrentUser() {
    const months = new Set();

    getAllMonthlyCategories().forEach(function (item) {
        if (!belongsToCurrentUser(item)) {
            return;
        }

        const month = normalizeMonth(item.month);
        if (month) {
            months.add(month);
        }
    });

    getAllCategories().forEach(function (item) {
        if (!belongsToCurrentUser(item)) {
            return;
        }

        const month = getCategoryMonth(item);
        if (month) {
            months.add(month);
        }
    });

    getAllExpenseTransactions().forEach(function (item) {
        if (!belongsToCurrentUser(item)) {
            return;
        }

        const month = getExpenseMonth(item);
        if (month) {
            months.add(month);
        }
    });

    return Array.from(months).sort(function (a, b) {
        return b.localeCompare(a);
    });
}

function getMonthTopCategoryData(month) {
    const categoryMap = new Map();

    getUserExpenseTransactions(month).forEach(function (item) {
        const key = String(item.categoryId || item.categoryName || "");
        const current = categoryMap.get(key) || {
            categoryName: item.categoryName || "Khac",
            total: 0,
        };

        current.total += Number(item.total) || 0;
        categoryMap.set(key, current);
    });

    let topCategory = null;
    categoryMap.forEach(function (value) {
        if (!topCategory || value.total > topCategory.total) {
            topCategory = value;
        }
    });

    return topCategory;
}

function getMonthStatistics(month) {
    const budget = getMonthBudgetValue(month);
    const spent = getMonthSpentValue(month);
    const categories = getUserCategories(month);
    const transactions = getUserExpenseTransactions(month);
    const topCategory = getMonthTopCategoryData(month);

    return {
        month: normalizeMonth(month),
        budget: budget,
        spent: spent,
        remaining: budget - spent,
        transactionCount: transactions.length,
        categoryCount: categories.length,
        topCategoryName: topCategory ? topCategory.categoryName : "Chua co",
        topCategorySpent: topCategory ? topCategory.total : 0,
    };
}

function renderMonthReportModal() {
    if (!monthReportSummary || !monthReportList) {
        return;
    }

    const months = getAvailableMonthsForCurrentUser();
    const statistics = months.map(function (month) {
        return getMonthStatistics(month);
    });

    if (statistics.length === 0) {
        monthReportSummary.innerHTML = `
            <div class="month-report-empty">
                Chua co du lieu thong ke cho cac thang.
            </div>
        `;
        monthReportList.innerHTML = "";
        return;
    }

    const totalBudget = statistics.reduce(function (sum, item) {
        return sum + item.budget;
    }, 0);
    const totalSpent = statistics.reduce(function (sum, item) {
        return sum + item.spent;
    }, 0);
    const totalTransactions = statistics.reduce(function (sum, item) {
        return sum + item.transactionCount;
    }, 0);
    const activeMonth = normalizeMonth(getActiveMonth());

    monthReportSummary.innerHTML = `
        <div class="month-report-summary-card">
            <span>Tong so thang</span>
            <strong>${statistics.length}</strong>
        </div>
        <div class="month-report-summary-card">
            <span>Tong ngan sach</span>
            <strong>${formatCurrency(totalBudget)}</strong>
        </div>
        <div class="month-report-summary-card">
            <span>Tong da chi</span>
            <strong>${formatCurrency(totalSpent)}</strong>
        </div>
        <div class="month-report-summary-card">
            <span>Tong giao dich</span>
            <strong>${totalTransactions}</strong>
        </div>
    `;

    monthReportList.innerHTML = statistics.map(function (item) {
        const isActive = item.month === activeMonth;

        return `
            <article class="month-report-item${isActive ? " active" : ""}">
                <div class="month-report-item__head">
                    <div>
                        <p class="month-report-item__label">${isActive ? "Thang dang xem" : "Bao cao thang"}</p>
                        <h4>${formatMonthLabel(item.month)}</h4>
                    </div>
                    <span class="month-report-item__status ${item.remaining < 0 ? "danger" : "safe"}">
                        ${item.remaining < 0 ? "Vuot ngan sach" : "On dinh"}
                    </span>
                </div>

                <div class="month-report-metrics">
                    <div class="month-report-metric">
                        <span>Ngan sach</span>
                        <strong>${formatCurrency(item.budget)}</strong>
                    </div>
                    <div class="month-report-metric">
                        <span>Da chi</span>
                        <strong>${formatCurrency(item.spent)}</strong>
                    </div>
                    <div class="month-report-metric">
                        <span>Con lai</span>
                        <strong>${formatCurrency(item.remaining)}</strong>
                    </div>
                    <div class="month-report-metric">
                        <span>Giao dich</span>
                        <strong>${item.transactionCount}</strong>
                    </div>
                    <div class="month-report-metric">
                        <span>Danh muc</span>
                        <strong>${item.categoryCount}</strong>
                    </div>
                    <div class="month-report-metric">
                        <span>Chi nhieu nhat</span>
                        <strong>${item.topCategoryName}</strong>
                        <small>${formatCurrency(item.topCategorySpent)}</small>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function openModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.add("show");
    modal.style.display = "flex";
}

function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.classList.remove("show");
    modal.style.display = "";
}

function showInlineError(element, message) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.add("show");
}

function hideInlineError(element) {
    if (!element) {
        return;
    }

    element.classList.remove("show");
}

function showExpenseFormError(message) {
    if (!expenseFormError) {
        return;
    }

    expenseFormError.textContent = message;
    expenseFormError.classList.add("show");
}

function hideExpenseFormError() {
    if (!expenseFormError) {
        return;
    }

    expenseFormError.textContent = "";
    expenseFormError.classList.remove("show");
}

function showCategoryFormError(message) {
    if (!categoryFormError) {
        return;
    }

    categoryFormError.textContent = message;
    categoryFormError.classList.add("show");
}

function hideCategoryFormError() {
    if (!categoryFormError) {
        return;
    }

    categoryFormError.textContent = "";
    categoryFormError.classList.remove("show");
}

function createCategoryWarningToastContent(message) {
    const content = document.createElement("div");
    content.className = "budget-warning-card";
    content.innerHTML = `
        <div class="budget-warning-card__icon">!</div>
        <p class="budget-warning-card__message"></p>
    `;

    const messageElement = content.querySelector(".budget-warning-card__message");
    if (messageElement) {
        messageElement.textContent = message;
    }

    return content;
}

function showCategoryWarningToast(message) {
    if (typeof window.Toastify === "function") {
        const toastContent = createCategoryWarningToastContent(message);

        window.Toastify({
            node: toastContent,
            duration: 2600,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            close: true,
            className: "budget-warning-toast",
        }).showToast();
        return;
    }

    showCategoryFormError(message);
}

function getTotalCategoryLimit(month, excludedCategoryId) {
    return getUserCategories(month).reduce(function (total, item) {
        if (
            excludedCategoryId !== undefined &&
            excludedCategoryId !== null &&
            String(item.id) === String(excludedCategoryId)
        ) {
            return total;
        }

        return total + (Number(item.total) || 0);
    }, 0);
}

function validateCategoryBudgetLimit(month, limit, excludedCategoryId) {
    const monthBudget = getMonthBudgetValue(month);

    if (limit > monthBudget) {
        showCategoryWarningToast("Giới hạn danh mục không được lớn hơn ngân sách tháng.");
        return false;
    }

    const usedLimit = getTotalCategoryLimit(month, excludedCategoryId);

    if (usedLimit + limit > monthBudget) {
        showCategoryWarningToast("Tổng hạn mức danh mục đang vượt ngân sách tháng.");
        return false;
    }

    return true;
}

function clearCategoryForm() {
    if (categoryInput) {
        categoryInput.value = "";
        categoryInput.classList.remove("error");
    }

    if (limitInput) {
        limitInput.value = "";
        limitInput.classList.remove("error");
    }

    hideInlineError(categoryNameError);
    hideInlineError(categoryLimitError);
    hideCategoryFormError();
}

function clearEditForm() {
    if (editCategoryInput) {
        editCategoryInput.value = "";
        editCategoryInput.classList.remove("error");
    }

    if (editLimitInput) {
        editLimitInput.value = "";
        editLimitInput.classList.remove("error");
    }

    hideInlineError(editCategoryError);
    hideInlineError(editLimitError);
}

function clearExpenseForm() {
    if (expenseAmountInput) {
        expenseAmountInput.value = "";
    }

    if (expenseCategorySelect) {
        expenseCategorySelect.value = "";
    }

    if (expenseNoteInput) {
        expenseNoteInput.value = "";
    }

    hideExpenseFormError();
}

function setReadonlyInputValue(element, value, fallback) {
    if (!element) {
        return;
    }

    const nextValue = String(value || "").trim();
    element.value = nextValue || fallback;
}

function clearMessageState(element) {
    if (!element) {
        return;
    }

    element.textContent = "";
    element.classList.remove("show", "success");
}

function setMessageState(element, message, type) {
    if (!element) {
        return;
    }

    element.textContent = message;
    element.classList.add("show");

    if (type === "success") {
        element.classList.add("success");
        return;
    }

    element.classList.remove("success");
}

function populateChangeInfoForm() {
    const user = getCurrentUserRecord();

    if (!user) {
        return;
    }

    if (modalNameInput) {
        modalNameInput.value = user.fullName || "";
    }

    if (modalEmailInput) {
        modalEmailInput.value = user.email || "";
    }

    if (modalPhoneInput) {
        modalPhoneInput.value = user.phone || "";
    }

    if (modalGenderInput) {
        modalGenderInput.value = user.gender || "";
    }
}

function clearPasswordForm() {
    if (oldPasswordInput) {
        oldPasswordInput.value = "";
    }

    if (newPasswordInput) {
        newPasswordInput.value = "";
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.value = "";
    }
}

function renderProfileSection() {
    const user = getCurrentUserRecord();
    const userMenu = document.getElementById("user-menu");

    if (userMenu && userMenu.options.length > 0) {
        const title = user && String(user.fullName || "").trim()
            ? user.fullName.trim()
            : (user?.email || "Account");
        userMenu.options[0].textContent = title;
    }

    if (!user) {
        return;
    }

    setReadonlyInputValue(profileNameInput, user.fullName, "Not updated");
    setReadonlyInputValue(profileEmailInput, user.email, "Not updated");
    setReadonlyInputValue(profilePhoneInput, user.phone, "Not updated");
    setReadonlyInputValue(profileGenderInput, user.gender, "Not updated");
    setReadonlyInputValue(accountEmailInput, user.email, "Not updated");
    setReadonlyInputValue(accountStatusInput, user.status === false ? "Inactive" : "Active", "Active");

    if (accountPasswordInput) {
        accountPasswordInput.value = user.password ? "********" : "";
    }
}

function checkAuth() {
    if (!getCurrentUserId()) {
        window.location.replace(loginPath);
        return false;
    }

    return true;
}

function renderBalance(month) {
    if (!amountEl) {
        return;
    }

    const budget = getMonthBudgetValue(month);
    const spent = getMonthSpentValue(month);
    const remaining = budget - spent;

    amountEl.textContent = formatCurrency(remaining);

    if (spentEl) {
        spentEl.textContent = formatCurrency(spent);
    }
}

function renderCategory() {
    if (!categoryList) {
        return;
    }

    const month = getActiveMonth();
    const categories = getUserCategories(month);

    if (categories.length === 0) {
        categoryList.innerHTML = '<div class="table-empty">Chưa có danh mục trong tháng này.</div>';
        return;
    }

    categoryList.innerHTML = categories
        .map(function (item) {
            return `
                <div class="card-category">
                    <img src="./asset/Frame 5.png" alt="">
                    <div class="info">
                        <p class="title">${item.description}</p>
                        <span>${formatCurrency(item.total)}</span>
                    </div>
                    <div class="actions">
                        <span data-action="delete-category" data-id="${item.id}">&#10006;</span>
                        <span data-action="edit-category" data-id="${item.id}">&#9998;</span>
                    </div>
                </div>
            `;
        })
        .join("");
}

function renderExpenseCategoryOptions() {
    if (!expenseCategorySelect) {
        return;
    }

    const month = getActiveMonth();
    const categories = getUserCategories(month);
    const selectedValue = expenseCategorySelect.value;

    expenseCategorySelect.innerHTML = '<option value="">Chọn danh mục chi tiêu</option>';

    categories.forEach(function (item) {
        const option = document.createElement("option");
        option.value = String(item.id);
        option.textContent = item.description;
        expenseCategorySelect.appendChild(option);
    });

    if (categories.some(function (item) {
        return String(item.id) === selectedValue;
    })) {
        expenseCategorySelect.value = selectedValue;
    }
}

function getFilteredExpenseTransactions(month) {
    const keyword = normalizeSearchText(historyKeyword);

    return getUserExpenseTransactions(month)
        .filter(function (item) {
            if (!keyword) {
                return true;
            }

            const categoryName = normalizeSearchText(item.categoryName);
            return categoryName.includes(keyword);
        })
        .sort(function (a, b) {
            return historySortDirection === "desc"
                ? Number(b.total) - Number(a.total)
                : Number(a.total) - Number(b.total);
        });
}

function clearExpenseAlertTimers() {
    clearTimeout(expenseAlertTimeoutId);
    clearInterval(expenseAlertCountdownIntervalId);
}

function updateExpenseAlertCountdown(remainingMilliseconds) {
    if (!expenseAlertTitle) {
        return;
    }

    const secondsLeft = Math.max(1, Math.ceil(remainingMilliseconds / 1000));
    expenseAlertTitle.textContent = `${expenseAlertDefaultTitle} (${secondsLeft}s)`;
}

function resetHistoryPagination() {
    currentHistoryPage = 1;
}

function renderHistoryPagination(totalItems) {
    if (!historyPagination) {
        return;
    }

    const totalPages = Math.ceil(totalItems / HISTORY_PAGE_SIZE);
    historyPagination.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    const previousBtn = document.createElement("button");
    previousBtn.type = "button";
    previousBtn.textContent = "\u2190";
    previousBtn.disabled = currentHistoryPage === 1;
    previousBtn.addEventListener("click", function () {
        if (currentHistoryPage > 1) {
            currentHistoryPage -= 1;
            renderExpenseHistory();
        }
    });
    historyPagination.appendChild(previousBtn);

    for (let page = 1; page <= totalPages; page += 1) {
        const pageBtn = document.createElement("button");
        pageBtn.type = "button";
        pageBtn.textContent = String(page);
        if (page === currentHistoryPage) {
            pageBtn.classList.add("active");
        }
        pageBtn.addEventListener("click", function () {
            currentHistoryPage = page;
            renderExpenseHistory();
        });
        historyPagination.appendChild(pageBtn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.textContent = "\u2192";
    nextBtn.disabled = currentHistoryPage === totalPages;
    nextBtn.addEventListener("click", function () {
        if (currentHistoryPage < totalPages) {
            currentHistoryPage += 1;
            renderExpenseHistory();
        }
    });
    historyPagination.appendChild(nextBtn);
}

function renderExpenseHistory() {
    if (!historyBody) {
        return;
    }

    const month = getActiveMonth();
    const transactions = getFilteredExpenseTransactions(month);
    const totalPages = Math.max(1, Math.ceil(transactions.length / HISTORY_PAGE_SIZE));

    if (currentHistoryPage > totalPages) {
        currentHistoryPage = totalPages;
    }

    const startIndex = (currentHistoryPage - 1) * HISTORY_PAGE_SIZE;
    const visibleTransactions = transactions.slice(startIndex, startIndex + HISTORY_PAGE_SIZE);

    if (visibleTransactions.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="5" class="table-empty">Chưa có giao dịch nào.</td></tr>';
        renderHistoryPagination(0);
        return;
    }

    historyBody.innerHTML = visibleTransactions
        .map(function (item, index) {
            return `
                <tr>
                    <td>${startIndex + index + 1}</td>
                    <td>${item.categoryName || ""}</td>
                    <td>${formatCurrency(item.total)}</td>
                    <td>${item.note || "-"}</td>
                    <td>
                        <button type="button" class="table-icon-btn" data-expense-delete="${item.id}">&#128465;</button>
                    </td>
                </tr>
            `;
        })
        .join("");

    renderHistoryPagination(transactions.length);
}

function renderExpenseAlert(month) {
    if (!expenseAlert || !expenseAlertTitle || !expenseAlertText) {
        return;
    }

    const warnings = [];
    const budget = getMonthBudgetValue(month);
    const monthSpent = getMonthSpentValue(month);

    if (budget > 0 && monthSpent > budget) {
        warnings.push(`Tổng chi tháng đã vượt ngân sách ${formatCurrency(monthSpent - budget)}.`);
    }

    getUserCategories(month).forEach(function (item) {
        const categoryLimit = Number(item.total) || 0;
        const categorySpent = getCategorySpentValue(month, item.id);

        if (categoryLimit > 0 && categorySpent > categoryLimit) {
            warnings.push(`${item.description} đã vượt hạn mức ${formatCurrency(categorySpent - categoryLimit)}.`);
        }
    });

    if (warnings.length === 0) {
        clearExpenseAlertTimers();
        expenseAlert.classList.remove("show");
        expenseAlertTitle.textContent = expenseAlertDefaultTitle;
        expenseAlertText.innerHTML = "";
        return;
    }

    expenseAlertTitle.textContent = "Cảnh báo chi tiêu";
    expenseAlertText.innerHTML = warnings.join("<br>");
    updateExpenseAlertCountdown(EXPENSE_ALERT_DURATION);
    clearExpenseAlertTimers();
    expenseAlert.classList.remove("show");
    void expenseAlert.offsetWidth;
    expenseAlert.classList.add("show");

    const startedAt = Date.now();
    expenseAlertCountdownIntervalId = setInterval(function () {
        const remaining = Math.max(0, EXPENSE_ALERT_DURATION - (Date.now() - startedAt));

        if (remaining <= 0) {
            clearInterval(expenseAlertCountdownIntervalId);
            expenseAlertTitle.textContent = expenseAlertDefaultTitle;
            return;
        }

        updateExpenseAlertCountdown(remaining);
    }, 120);

    expenseAlertTimeoutId = setTimeout(function () {
        clearExpenseAlertTimers();
        expenseAlert.classList.remove("show");
        expenseAlertTitle.textContent = expenseAlertDefaultTitle;
    }, EXPENSE_ALERT_DURATION);
}


function renderPageData() {
    const month = getActiveMonth();
    renderProfileSection();
    renderBalance(month);
    renderCategory();
    renderExpenseCategoryOptions();
    renderExpenseHistory();
    renderExpenseAlert(month);

    if (monthReportModal && monthReportModal.classList.contains("show")) {
        renderMonthReportModal();
    }
}

function handleBudgetSave(event) {
    event.preventDefault();

    const month = getActiveMonth();
    const budget = parseAmount(budgetInput?.value);

    if (budgetError) {
        budgetError.style.visibility = "hidden";
    }

    if (budgetInput) {
        budgetInput.classList.remove("errinput");
    }

    hideCategoryFormError();

    if (!budgetInput || budgetInput.value.trim() === "") {
        if (budgetError) {
            budgetError.style.visibility = "visible";
        }

        budgetInput?.classList.add("errinput");
        return;
    }

    saveMonthBudget(month, budget);
    renderPageData();
    budgetInput.value = "";
}

function handleCategoryCreate() {
    if (!categoryInput || !limitInput) {
        return;
    }

    const name = categoryInput.value.trim();
    const limitRaw = limitInput.value.trim();
    const limit = parseAmount(limitRaw);
    const month = getActiveMonth();
    const currentUserId = getCurrentUserId();
    let isValid = true;

    hideInlineError(categoryNameError);
    hideInlineError(categoryLimitError);
    hideCategoryFormError();
    categoryInput.classList.remove("error");
    limitInput.classList.remove("error");

    if (!name) {
        showInlineError(categoryNameError, "Please select a category.");
        categoryInput.classList.add("error");
        isValid = false;
    }

    if (!limitRaw || limit <= 0) {
        showInlineError(categoryLimitError, "Please enter the amount of the limit.");
        limitInput.classList.add("error");
        isValid = false;
    }

    if (!isValid || !currentUserId) {
        return;
    }

    if (getMonthBudgetValue(month) <= 0) {
        showCategoryFormError("Bạn cần nhập ngân sách tháng trước khi tạo danh mục chi tiêu.");
        return;
    }

    if (!validateCategoryBudgetLimit(month, limit)) {
        return;
    }

    const categories = getAllCategories();
    const existingCategory = categories.find(function (item) {
        return (
            normalizeId(item.userid) === currentUserId &&
            getCategoryMonth(item) === month &&
            normalizeCategoryName(item.description) === normalizeCategoryName(name)
        );
    });

    if (existingCategory) {
        const nextCategories = categories.map(function (item) {
            if (String(item.id) !== String(existingCategory.id)) {
                return item;
            }

            return {
                ...item,
                total: (Number(item.total) || 0) + limit,
            };
        });

        saveAllCategories(nextCategories);
        clearCategoryForm();
        renderPageData();
        return;
    }

    categories.push({
        id: Date.now(),
        createdDate: month,
        total: limit,
        description: name,
        userid: currentUserId,
        categoryId: Date.now() + 1,
        monthlyCategoryId: Date.now() + 2,
    });

    saveAllCategories(categories);
    clearCategoryForm();
    renderPageData();
}

function handleCategoryDeleteConfirm() {
    if (categoryDeleteId === null) {
        closeModal(categoryDeleteModal);
        return;
    }

    if (hasCategoryTransactions(categoryDeleteId)) {
        categoryDeleteId = null;
        closeModal(categoryDeleteModal);
        showCategoryWarningToast("Khong the xoa danh muc da co giao dich.");
        return;
    }

    const nextCategories = getAllCategories().filter(function (item) {
        return String(item.id) !== String(categoryDeleteId);
    });

    saveAllCategories(nextCategories);
    categoryDeleteId = null;
    closeModal(categoryDeleteModal);
    renderPageData();
}

function handleCategoryEditOpen(id) {
    const item = findCategoryById(id);

    if (!item || !editCategoryInput || !editLimitInput) {
        return;
    }

    editingCategoryId = item.id;
    editCategoryInput.value = item.description;
    editLimitInput.value = item.total;
    clearEditForm();
    editCategoryInput.value = item.description;
    editLimitInput.value = item.total;
    openModal(editModal);
}

function handleCategoryEditConfirm() {
    if (editingCategoryId === null || !editCategoryInput || !editLimitInput) {
        return;
    }

    const name = editCategoryInput.value.trim();
    const limitRaw = editLimitInput.value.trim();
    const limit = parseAmount(limitRaw);
    const currentCategory = findCategoryById(editingCategoryId);
    const month = currentCategory ? getCategoryMonth(currentCategory) : getActiveMonth();
    let isValid = true;

    hideInlineError(editCategoryError);
    hideInlineError(editLimitError);
    hideCategoryFormError();
    editCategoryInput.classList.remove("error");
    editLimitInput.classList.remove("error");

    if (!name) {
        showInlineError(editCategoryError, "Please select a category.");
        editCategoryInput.classList.add("error");
        isValid = false;
    }

    if (!limitRaw || limit <= 0) {
        showInlineError(editLimitError, "Please enter the amount of the limit.");
        editLimitInput.classList.add("error");
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    if (!validateCategoryBudgetLimit(month, limit, editingCategoryId)) {
        return;
    }

    const targetCategory = getAllCategories().find(function (item) {
        return (
            String(item.id) !== String(editingCategoryId) &&
            normalizeId(item.userid) === getCurrentUserId() &&
            getCategoryMonth(item) === month &&
            normalizeCategoryName(item.description) === normalizeCategoryName(name)
        );
    });

    if (targetCategory) {
        const nextCategories = getAllCategories()
            .filter(function (item) {
                return String(item.id) !== String(editingCategoryId);
            })
            .map(function (item) {
                if (String(item.id) !== String(targetCategory.id)) {
                    return item;
                }

                return {
                    ...item,
                    description: name,
                    total: (Number(item.total) || 0) + limit,
                };
            });

        const nextExpenses = remapExpenseCategory(
            getAllExpenseTransactions(),
            getCurrentUserId(),
            month,
            editingCategoryId,
            targetCategory.id,
            name
        );

        saveAllCategories(nextCategories);
        saveAllExpenseTransactions(nextExpenses);
        editingCategoryId = null;
        closeModal(editModal);
        clearEditForm();
        renderPageData();
        return;
    }

    const categories = getAllCategories().map(function (item) {
        if (String(item.id) !== String(editingCategoryId)) {
            return item;
        }

        return {
            ...item,
            description: name,
            total: limit,
        };
    });

    saveAllCategories(categories);
    editingCategoryId = null;
    closeModal(editModal);
    clearEditForm();
    renderPageData();
}

function handleExpenseCreate() {
    if (!expenseAmountInput || !expenseCategorySelect) {
        return;
    }

    hideExpenseFormError();

    const month = getActiveMonth();
    const amountRaw = expenseAmountInput.value.trim();
    const amount = parseAmount(amountRaw);
    const categoryId = expenseCategorySelect.value;
    const note = expenseNoteInput?.value.trim() || "";

    if (!amountRaw || amount <= 0) {
        showExpenseFormError("Vui lòng nhập số tiền chi tiêu hợp lệ.");
        return;
    }

    if (!categoryId) {
        showExpenseFormError("Vui lòng chọn danh mục chi tiêu.");
        return;
    }

    const category = getUserCategories(month).find(function (item) {
        return String(item.id) === String(categoryId);
    });

    if (!category) {
        showExpenseFormError("Danh mục này không còn tồn tại trong tháng đang chọn.");
        renderExpenseCategoryOptions();
        return;
    }

    const currentUserId = getCurrentUserId();
    const expenses = getAllExpenseTransactions();

    expenses.push({
        id: Date.now(),
        userid: currentUserId,
        createdDate: month,
        month: month,
        total: amount,
        categoryId: category.id,
        categoryName: category.description,
        note: note,
    });

    saveAllExpenseTransactions(expenses);

    resetHistoryPagination();
    clearExpenseForm();
    renderPageData();
}

function handleExpenseDeleteConfirm() {
    if (expenseDeleteId === null) {
        closeModal(expenseDeleteModal);
        return;
    }

    const nextExpenses = getAllExpenseTransactions().filter(function (item) {
        return String(item.id) !== String(expenseDeleteId);
    });

    saveAllExpenseTransactions(nextExpenses);
    expenseDeleteId = null;
    closeModal(expenseDeleteModal);
    renderPageData();
}
function handleChangeInfoSave() {
    const currentUser = getCurrentUserRecord();
    const fullName = modalNameInput?.value.trim() || "";
    const email = modalEmailInput?.value.trim() || "";
    const phone = modalPhoneInput?.value.trim() || "";
    const gender = modalGenderInput?.value || "";

    clearMessageState(changeInfoError);
    clearMessageState(profileFeedback);

    if (!currentUser) {
        setMessageState(changeInfoError, "Account not found.");
        return;
    }

    if (!fullName) {
        setMessageState(changeInfoError, "Name is required.");
        return;
    }

    if (!email) {
        setMessageState(changeInfoError, "Email is required.");
        return;
    }

    if (!isValidEmail(email)) {
        setMessageState(changeInfoError, "Email format is invalid.");
        return;
    }

    if (phone && !/^[0-9+\s-]{8,15}$/.test(phone)) {
        setMessageState(changeInfoError, "Phone number is invalid.");
        return;
    }

    const users = getAllUsers();
    const duplicatedUser = users.find(function (item) {
        return normalizeId(item.id) !== normalizeId(currentUser.id) && normalizeEmail(item.email) === normalizeEmail(email);
    });

    if (duplicatedUser) {
        setMessageState(changeInfoError, "Email already exists.");
        return;
    }

    let updatedUser = null;
    const nextUsers = users.map(function (item) {
        if (normalizeId(item.id) !== normalizeId(currentUser.id)) {
            return item;
        }

        updatedUser = {
            ...item,
            fullName: fullName,
            email: email,
            phone: phone,
            gender: gender,
        };
        return updatedUser;
    });

    if (!updatedUser) {
        updatedUser = {
            ...currentUser,
            fullName: fullName,
            email: email,
            phone: phone,
            gender: gender,
        };
        nextUsers.push(updatedUser);
    }

    saveAllUsers(nextUsers);
    syncCurrentUserSession(updatedUser);
    closeModal(changeInfoModal);
    renderPageData();
    setMessageState(profileFeedback, "Information updated successfully.", "success");
}

function handleChangePasswordSave() {
    const currentUser = getCurrentUserRecord();
    const oldPassword = oldPasswordInput?.value.trim() || "";
    const newPassword = newPasswordInput?.value.trim() || "";
    const confirmPassword = confirmPasswordInput?.value.trim() || "";

    clearMessageState(changePasswordError);
    clearMessageState(passwordFeedback);

    if (!currentUser) {
        setMessageState(changePasswordError, "Account not found.");
        return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
        setMessageState(changePasswordError, "Please fill in all password fields.");
        return;
    }

    if (oldPassword !== String(currentUser.password || "")) {
        setMessageState(changePasswordError, "Old password is incorrect.");
        return;
    }

    if (newPassword.length < 6) {
        setMessageState(changePasswordError, "New password must be at least 6 characters.");
        return;
    }

    if (newPassword !== confirmPassword) {
        setMessageState(changePasswordError, "Confirm password does not match.");
        return;
    }

    if (oldPassword === newPassword) {
        setMessageState(changePasswordError, "New password must be different from old password.");
        return;
    }

    let updatedUser = null;
    const nextUsers = getAllUsers().map(function (item) {
        if (normalizeId(item.id) !== normalizeId(currentUser.id)) {
            return item;
        }

        updatedUser = {
            ...item,
            password: newPassword,
        };
        return updatedUser;
    });

    if (!updatedUser) {
        setMessageState(changePasswordError, "Account data is missing.");
        return;
    }

    saveAllUsers(nextUsers);
    syncCurrentUserSession(updatedUser);
    closeModal(changePasswordModal);
    clearPasswordForm();
    renderPageData();
    setMessageState(passwordFeedback, "Password updated successfully.", "success");
}

function bindProfileEvents() {
    if (openChangeInfoBtn && changeInfoModal) {
        openChangeInfoBtn.addEventListener("click", function () {
            clearMessageState(changeInfoError);
            clearMessageState(profileFeedback);
            populateChangeInfoForm();
            openModal(changeInfoModal);
        });
    }

    if (openChangePasswordBtn && changePasswordModal) {
        openChangePasswordBtn.addEventListener("click", function () {
            clearMessageState(changePasswordError);
            clearMessageState(passwordFeedback);
            clearPasswordForm();
            openModal(changePasswordModal);
        });
    }

    document.querySelectorAll("[data-close-modal]").forEach(function (button) {
        button.addEventListener("click", function () {
            const modalId = button.dataset.closeModal;
            const modal = document.getElementById(modalId);

            closeModal(modal);

            if (modalId === "change-password-modal") {
                clearPasswordForm();
                clearMessageState(changePasswordError);
            }

            if (modalId === "change-info-modal") {
                clearMessageState(changeInfoError);
            }
        });
    });

    [changeInfoModal, changePasswordModal].forEach(function (modal) {
        if (!modal) {
            return;
        }

        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    [modalNameInput, modalEmailInput, modalPhoneInput].forEach(function (input) {
        if (!input) {
            return;
        }

        input.addEventListener("input", function () {
            clearMessageState(changeInfoError);
        });
    });

    if (modalGenderInput) {
        modalGenderInput.addEventListener("change", function () {
            clearMessageState(changeInfoError);
        });
    }

    [oldPasswordInput, newPasswordInput, confirmPasswordInput].forEach(function (input) {
        if (!input) {
            return;
        }

        input.addEventListener("input", function () {
            clearMessageState(changePasswordError);
        });
    });

    if (saveChangeInfoBtn) {
        saveChangeInfoBtn.addEventListener("click", handleChangeInfoSave);
    }

    if (saveChangePasswordBtn) {
        saveChangePasswordBtn.addEventListener("click", handleChangePasswordSave);
    }
}
function bindAuthModal() {
    const userMenu = document.getElementById("user-menu");
    const logoutModal = document.getElementById("logout-modal");
    const cancelLogoutBtn = document.getElementById("cancel-logout");
    const confirmLogoutBtn = document.getElementById("confirm-logout");

    if (userMenu && logoutModal) {
        userMenu.addEventListener("change", function (event) {
            if (event.target.value === "logout") {
                openModal(logoutModal);
            }
        });
    }

    if (cancelLogoutBtn && logoutModal && userMenu) {
        cancelLogoutBtn.addEventListener("click", function () {
            closeModal(logoutModal);
            userMenu.value = "";
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener("click", function () {
            localStorage.removeItem("currentUser");
            window.location.href = loginPath;
        });
    }
}

function bindMonthInput() {
    if (!monthInput) {
        return;
    }

    monthInput.value = getSelectedMonth();

    monthInput.addEventListener("change", function () {
        setSelectedMonth(monthInput.value);
        historyKeyword = "";
        if (searchTransactionInput) {
            searchTransactionInput.value = "";
        }
        hideCategoryFormError();
        hideExpenseFormError();
        resetHistoryPagination();
        renderPageData();
    });
}

function bindBudgetEvents() {
    if (saveBudgetBtn) {
        saveBudgetBtn.addEventListener("click", handleBudgetSave);
    }
}

function bindCategoryEvents() {
    if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener("click", handleCategoryCreate);
    }

    if (categoryInput) {
        categoryInput.addEventListener("change", function () {
            hideInlineError(categoryNameError);
            hideCategoryFormError();
            categoryInput.classList.remove("error");
        });
    }

    if (limitInput) {
        limitInput.addEventListener("input", function () {
            hideInlineError(categoryLimitError);
            hideCategoryFormError();
            limitInput.classList.remove("error");
        });
    }

    if (categoryList) {
        categoryList.addEventListener("click", function (event) {
            const actionButton = event.target.closest("[data-action]");

            if (!actionButton) {
                return;
            }

            const action = actionButton.dataset.action;
            const id = actionButton.dataset.id;

            if (action === "delete-category") {
                if (hasCategoryTransactions(id)) {
                    showCategoryWarningToast("Khong the xoa danh muc da co giao dich.");
                    return;
                }

                categoryDeleteId = id;
                openModal(categoryDeleteModal);
            }

            if (action === "edit-category") {
                handleCategoryEditOpen(id);
            }
        });
    }

    if (cancelCategoryDeleteBtn) {
        cancelCategoryDeleteBtn.addEventListener("click", function () {
            categoryDeleteId = null;
            closeModal(categoryDeleteModal);
        });
    }

    if (confirmCategoryDeleteBtn) {
        confirmCategoryDeleteBtn.addEventListener("click", handleCategoryDeleteConfirm);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener("click", function () {
            editingCategoryId = null;
            closeModal(editModal);
            clearEditForm();
        });
    }

    if (confirmEditBtn) {
        confirmEditBtn.addEventListener("click", handleCategoryEditConfirm);
    }

    if (editCategoryInput) {
        editCategoryInput.addEventListener("change", function () {
            hideInlineError(editCategoryError);
            editCategoryInput.classList.remove("error");
        });
    }

    if (editLimitInput) {
        editLimitInput.addEventListener("input", function () {
            hideInlineError(editLimitError);
            editLimitInput.classList.remove("error");
        });
    }
}

function bindExpenseEvents() {
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener("click", handleExpenseCreate);
    }

    if (expenseAmountInput) {
        expenseAmountInput.addEventListener("input", hideExpenseFormError);
    }

    if (expenseCategorySelect) {
        expenseCategorySelect.addEventListener("change", hideExpenseFormError);
    }

    if (expenseNoteInput) {
        expenseNoteInput.addEventListener("input", hideExpenseFormError);
    }

    if (sortTransactionBtn) {
        sortTransactionBtn.addEventListener("click", function () {
            historySortDirection = historySortDirection === "desc" ? "asc" : "desc";
            sortTransactionBtn.textContent = historySortDirection === "desc"
                ? "Sắp xếp: Giảm dần"
                : "Sắp xếp: Tăng dần";
            resetHistoryPagination();
            renderExpenseHistory();
        });
    }

    if (searchTransactionInput) {
        searchTransactionInput.placeholder = "Tìm theo danh mục";
        searchTransactionInput.addEventListener("input", function (event) {
            historyKeyword = event.target.value.trim();
            resetHistoryPagination();
            renderExpenseHistory();
        });
    }

    if (searchTransactionBtn && searchTransactionInput) {
        searchTransactionBtn.addEventListener("click", function () {
            historyKeyword = searchTransactionInput.value.trim();
            resetHistoryPagination();
            renderExpenseHistory();
        });
    }

    if (historyBody) {
        historyBody.addEventListener("click", function (event) {
            const deleteBtn = event.target.closest("[data-expense-delete]");

            if (!deleteBtn) {
                return;
            }

            expenseDeleteId = deleteBtn.dataset.expenseDelete;
            openModal(expenseDeleteModal);
        });
    }

    if (cancelExpenseDeleteBtn) {
        cancelExpenseDeleteBtn.addEventListener("click", function () {
            expenseDeleteId = null;
            closeModal(expenseDeleteModal);
        });
    }

    if (confirmExpenseDeleteBtn) {
        confirmExpenseDeleteBtn.addEventListener("click", handleExpenseDeleteConfirm);
    }
}

function bindMonthReportEvents() {
    if (openMonthReportBtn && monthReportModal) {
        openMonthReportBtn.addEventListener("click", function () {
            renderMonthReportModal();
            openModal(monthReportModal);
        });
    }

    if (closeMonthReportBtn) {
        closeMonthReportBtn.addEventListener("click", function () {
            closeModal(monthReportModal);
        });
    }

    if (monthReportModal) {
        monthReportModal.addEventListener("click", function (event) {
            if (event.target === monthReportModal) {
                closeModal(monthReportModal);
            }
        });
    }
}

window.addEventListener("pageshow", checkAuth);

document.addEventListener("DOMContentLoaded", function () {
    if (!checkAuth()) {
        return;
    }

    consolidateDuplicateCategoriesForCurrentUser();
    bindAuthModal();
    bindProfileEvents();
    bindMonthInput();
    bindBudgetEvents();
    bindCategoryEvents();
    bindExpenseEvents();
    bindMonthReportEvents();
    renderPageData();
});
