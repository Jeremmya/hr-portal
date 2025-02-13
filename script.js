async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://your-server-ip:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    document.getElementById("login-message").textContent = data.message;

    if (data.success) {
        window.location.href = "job-entry.html";
    }
}