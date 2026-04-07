let users = JSON.parse(localStorage.getItem("users")) || [];

if (users.length === 0) {
    users = [
        {
            id: Date.now(),
            fullName: "Demo User",
            email: "demo@example.com",
            password: "123456",
            phone: "",
            gender: "",
            status: true,
        },
    ];
    localStorage.setItem("users", JSON.stringify(users));
}

const emailInput = document.getElementById("acount-input");
const passwordInput = document.getElementById("password-input");
const erremail = document.getElementById("error-email");
const errpassword = document.getElementById("error-password");
const successMsg = document.getElementById("success-msg");

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
                <p class="toast-card__title">Sign In Successfully</p>
                <p class="toast-card__subtitle">Success</p>
            </div>
        </div>
    `;
    return content;
}

function showLoginSuccessToast() {
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

clearError(emailInput, erremail);
clearError(passwordInput, errpassword);

window.login = function () {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    erremail.style.display = "none";
    errpassword.style.display = "none";
    if (successMsg) {
        successMsg.style.display = "none";
    }

    if (email === "" || password === "") {
        erremail.innerText = "Email and password are required";
        erremail.style.display = "block";
        emailInput.classList.add("errinput");
        passwordInput.classList.add("errinput");
        return;
    }

    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
        erremail.innerText = "Invalid email or password";
        erremail.style.display = "block";
        emailInput.classList.add("errinput");
        return;
    }

    localStorage.setItem(
        "currentUser",
        JSON.stringify({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
        })
    );

    if (successMsg) {
        successMsg.style.display = "block";
    }

    showLoginSuccessToast();

    setTimeout(function () {
        window.location.replace("../index.html");
    }, 1400);
};
