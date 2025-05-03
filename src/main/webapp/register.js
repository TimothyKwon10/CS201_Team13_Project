document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission
            
            // Reset error messages
            document.querySelectorAll('.error-message').forEach(element => {
                element.textContent = '';
            });
            
            // Get form inputs
            const uscId = document.getElementById('usc_id').value.trim();
            const firstName = document.getElementById('first_name').value.trim();
            const lastName = document.getElementById('last_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            let isValid = true;
            
            // Validate USC ID (assuming it should be a 10-digit number)
            if (!uscId || !/^\d{10}$/.test(uscId)) {
                document.getElementById('uscIdError').textContent = 'Please enter a valid 10-digit USC ID';
                isValid = false;
            }
            
            // Validate first name
            if (!firstName) {
                document.getElementById('firstNameError').textContent = 'First name is required';
                isValid = false;
            }
            
            // Validate last name
            if (!lastName) {
                document.getElementById('lastNameError').textContent = 'Last name is required';
                isValid = false;
            }
            
            // Validate email (should be a USC email)
            if (!email || !email.endsWith('@usc.edu')) {
                document.getElementById('emailError').textContent = 'Please enter a valid USC email address';
                isValid = false;
            }
            
            // Validate password (at least 8 characters)
            if (!password || password.length < 8) {
                document.getElementById('passwordError').textContent = 'Password must be at least 8 characters';
                isValid = false;
            }
            
            // If form is valid, send data via fetch
            if (isValid) {
                const formData = new FormData(registerForm);
                const urlEncodedData = new URLSearchParams(formData).toString();
                
                fetch('RegisterServlet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: urlEncodedData
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.message || 'Registration failed');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    alert(data.message);
                    // Redirect to login page on successful registration
                    if (data.message === "Registration successful.") {
                        window.location.href = 'loginPage.html';
                    }
                })
                .catch(error => {
                    alert(error.message);
                    console.error('Error:', error);
                });
            }
        });
    }
});