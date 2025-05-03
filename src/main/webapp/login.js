document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission
            
            // Reset error messages
            document.querySelectorAll('.error-message').forEach(element => {
                element.textContent = '';
            });
            
            // Clear form message
            document.getElementById('formMessage').textContent = '';
            document.getElementById('formMessage').className = 'form-message';
            
            // Get form inputs
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            let isValid = true;
            
            // Validate email
            if (!email) {
                document.getElementById('emailError').textContent = 'Email is required';
                isValid = false;
            } else if (!isValidEmail(email)) {
                document.getElementById('emailError').textContent = 'Please enter a valid email address';
                isValid = false;
            }
            
            // Validate password
            if (!password) {
                document.getElementById('passwordError').textContent = 'Password is required';
                isValid = false;
            }
            
            // If form is valid, send data via fetch
            if (isValid) {
                const formData = new FormData(loginForm);
                const urlEncodedData = new URLSearchParams(formData).toString();
                
                // Show loading state
                const submitButton = loginForm.querySelector('button[type="submit"]');
                
                const originalButtonText = submitButton.textContent;
                submitButton.textContent = 'Logging in...';
                submitButton.disabled = true;
                
                // Make server request
                fetch('LoginServlet', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: urlEncodedData
                })
                .then(response => {
                    // Parse the JSON regardless of status code
                    return response.json().then(data => {
                        // Add the status code to the parsed data
                        return { 
                            status: response.status, 
                            data: data 
                        };
                    });
                })
                .then(result => {
                    // Reset button state
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                    
                    if (result.status === 200) {
                        // Login successful
                        showMessage('Login successful! Redirecting...', 'success');
                        
                        // Store user data in localStorage
                        if (result.data.user) {
                            localStorage.setItem('user', JSON.stringify(result.data.user));
                            localStorage.setItem('isLoggedIn', 'true');
                            
                            // Fetch user favorites
                            fetchUserFavorites(result.data.user.uscId);
                        }
                        
                        // Redirect to home page after a short delay
                        setTimeout(() => {
                            window.location.href = 'HomePage.html';
                        }, 1500);
                    } else if (result.status === 401) {
                        // Unauthorized - invalid credentials
                        showMessage('Invalid email or password. Please try again.', 'error');
                    } else {
                        // Other error
                        showMessage(result.data.message || 'An error occurred. Please try again later.', 'error');
                    }
                })
                .catch(error => {
                    // Reset button state
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                    
                    // Show error message
                    showMessage('Server error. Please try again later.', 'error');
                    console.error('Error:', error);
                });
            }
        });
    }
    
    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Helper function to show form messages
    function showMessage(message, type) {
        const messageElement = document.getElementById('formMessage');
        messageElement.textContent = message;
        messageElement.className = 'form-message ' + type;
    }
    
    // Fetch user favorites from server
    function fetchUserFavorites(uscId) {
        fetch(`FavoriteMealServlet?usc_id=${uscId}`)
            .then(response => response.json())
            .then(data => {
                if (data.favorites) {
                    // Store favorites in localStorage
                    let favorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
                    favorites[uscId] = data.favorites;
                    localStorage.setItem('userFavorites', JSON.stringify(favorites));
                }
            })
            .catch(error => console.error('Error fetching favorites:', error));
    }
});