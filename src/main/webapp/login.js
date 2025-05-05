document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const formMessage = document.getElementById('formMessage');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Clear previous messages
        emailError.textContent = '';
        passwordError.textContent = '';
        formMessage.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        let isValid = true;

		if (!email) {
		    emailError.textContent = 'Email is required.';
		    isValid = false;
		} 
		else if (!/\S+@\S+\.\S+/.test(email)) {
		    emailError.textContent = 'Enter a valid email address.';
		    isValid = false;
		}
		
        if (!password) {
            passwordError.textContent = 'Password is required.';
            isValid = false;
        }

        if (!isValid) return;

        const params = new URLSearchParams();
        params.append('email', email);
        params.append('password', password);

        fetch('LoginServlet', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === "Login successful.") {
                // Store login info in localStorage
                const user = data.user;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify({
                    uscId: user.uscId,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }));

                // Redirect to homepage
                window.location.href = 'HomePage.html';
            } else {
                formMessage.textContent = data.message || "Login failed.";
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            formMessage.textContent = "Login failed due to a network or server error.";
        });
    });
});
