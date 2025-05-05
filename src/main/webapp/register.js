document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    const fields = {
        usc_id: {
			element: document.getElementById('usc_id'),
			error: document.getElementById('uscIdError'),
			validate: value => value.trim() ? '' : 'USC_ID is required.'
        },
        first_name: {
            element: document.getElementById('first_name'),
            error: document.getElementById('firstNameError'),
            validate: value => value.trim() ? '' : 'First name is required.'
        },
        last_name: {
            element: document.getElementById('last_name'),
            error: document.getElementById('lastNameError'),
            validate: value => value.trim() ? '' : 'Last name is required.'
        },
        email: {
            element: document.getElementById('email'),
            error: document.getElementById('emailError'),
            validate: value => /\S+@\S+\.\S+/.test(value) ? '' : 'Enter a valid email address.'
        },
        password: {
			element: document.getElementById('password'),
			error: document.getElementById('passwordError'),
			validate: value => value.trim() ? '' : 'Password is required.'
        }
    };

    // Real-time validation
    Object.values(fields).forEach(({ element, error, validate }) => {
        element.addEventListener('input', () => {
            const message = validate(element.value);
            error.textContent = message;
        });
    });

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form from reloading

        let valid = true;

        // Validate all fields
        Object.values(fields).forEach(({ element, error, validate }) => {
            const message = validate(element.value);
            error.textContent = message;
            if (message) valid = false;
        });

        if (!valid) return;

		const params = new URLSearchParams();
		params.append('usc_id', fields.usc_id.element.value.trim());
		params.append('first_name', fields.first_name.element.value.trim());
		params.append('last_name', fields.last_name.element.value.trim());
		params.append('email', fields.email.element.value.trim());
		params.append('password', fields.password.element.value.trim());

		fetch('RegisterServlet', {
		    method: 'POST',
		    headers: {
		        'Content-Type': 'application/x-www-form-urlencoded'
		    },
		    body: params
		})
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return;
            if (data.message === "Registration successful.") {
                const uscId = fields.usc_id.element.value;
                const email = fields.email.element.value;

                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('user', JSON.stringify({ uscId, email }));

                window.location.href = 'HomePage.html';
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Registration failed:', error);
            alert('An error occurred. Please try again later.');
        });
    });
});
