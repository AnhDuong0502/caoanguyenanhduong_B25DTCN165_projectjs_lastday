let users = JSON.parse(localStorage.getItem("users")) || [];
const loginPath = window.location.pathname.includes("/pages/")
    ? "./login.html"
    : "./pages/login.html";

const emailInput = document.getElementById("acount-input");
const passwordInput = document.getElementById("password-input");
const confirmInput = document.getElementById("password-input-again");
const form = document.getElementById("form");

const errEmail = document.getElementById("error-email");
const errPassword = document.getElementById("error-password");
const errConfirm = document.getElementById("error-confirm");
const successMsg = document.getElementById("success-msg");

function checkEmail(email) {
    return email.includes("@") && email.includes(".");
}

function clearError(inputElement, errorElement) {
    if (!inputElement || !errorElement) return;

    inputElement.addEventListener("input", function () {
        errorElement.style.display = "none";
        inputElement.classList.remove("errinput");
    });
}

function createSuccessToastContent() {
    const content = document.createElement("div");
    content.className = "toast-card";
    content.innerHTML = `
        <div class="toast-card__accent"></div>
        <div class="toast-card__body">
            <div class="toast-card__icon">
                <i class="fa-solid fa-check"></i>
            </div>
            <div class="toast-card__text">
                <p class="toast-card__title">Sign Up Successfully</p>
                <p class="toast-card__subtitle">Success</p>
            </div>
        </div>
    `;
    return content;
}

function showRegisterSuccessToast() {
    const toastContent = createSuccessToastContent();

    if (typeof window.Toastify === "function") {
        window.Toastify({
            node: toastContent,
            duration: 2200,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            className: "auth-toast",
        }).showToast();
        return;
    }

    const toast = document.createElement("div");
    toast.className = "custom-toast-wrapper";
    toast.appendChild(toastContent);
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.add("show");
    });

    setTimeout(function () {
        toast.classList.remove("show");
        setTimeout(function () {
            toast.remove();
        }, 250);
    }, 2200);
}

function redirectToLogin() {
    window.location.replace(loginPath);
}

clearError(emailInput, errEmail);
clearError(passwordInput, errPassword);
clearError(confirmInput, errConfirm);

function confirmSingUp(event) {
    if (event) {
        event.preventDefault();
    }

    let flag = true;

    errEmail.style.display = "none";
    errPassword.style.display = "none";
    errConfirm.style.display = "none";

    if (successMsg) {
        successMsg.style.display = "none";
    }

    emailInput.classList.remove("errinput");
    passwordInput.classList.remove("errinput");
    confirmInput.classList.remove("errinput");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (email === "") {
        errEmail.innerText = "Please enter email";
        errEmail.style.display = "block";
        emailInput.classList.add("errinput");
        flag = false;
    } else if (!checkEmail(email)) {
        errEmail.innerText = "Email is not in the correct format";
        errEmail.style.display = "block";
        emailInput.classList.add("errinput");
        flag = false;
    }

    if (password === "") {
        errPassword.innerText = "Please enter password";
        errPassword.style.display = "block";
        passwordInput.classList.add("errinput");
        flag = false;
    } else if (password.length < 6) {
        errPassword.innerText = "Password must be at least 6 characters";
        errPassword.style.display = "block";
        passwordInput.classList.add("errinput");
        flag = false;
    }

    if (confirmPassword === "") {
        errConfirm.innerText = "Please confirm password";
        errConfirm.style.display = "block";
        confirmInput.classList.add("errinput");
        flag = false;
    } else if (confirmPassword !== password) {
        errConfirm.innerText = "Password does not match";
        errConfirm.style.display = "block";
        confirmInput.classList.add("errinput");
        flag = false;
    }

    const isExist = users.some(function (user) {
        return user.email === email;
    });

    if (isExist) {
        errEmail.innerText = "Email already exists";
        errEmail.style.display = "block";
        emailInput.classList.add("errinput");
        flag = false;
    }

    if (!flag) {
        return;
    }

    const newUser = {
        id: Date.now(),
        fullName: "",
        email: email,
        password: password,
        phone: "",
        gender: null,
        status: true,
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    if (successMsg) {
        successMsg.style.display = "block";
    }

    form.reset();
    showRegisterSuccessToast();

    setTimeout(function () {
        redirectToLogin();
    }, 1400);
}

window.confirmSingUp = confirmSingUp;

if (form) {
    form.addEventListener("submit", confirmSingUp);
}
