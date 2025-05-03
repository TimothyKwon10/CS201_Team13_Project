// userLoginState.js - Manages user login state across all pages
document.addEventListener('DOMContentLoaded', function() {
    // Mark that userLoginState is initialized
    window.userLoginStateInitialized = true;
    
    // Check if user is logged in
    const isLoggedIn = checkLoginStatus();
    
    // If logged in, fetch favorites from server first
    if (isLoggedIn) {
        fetchFavoritesFromServer().then(() => {
            // Enable favorites functionality
            enableFavorites();
            // Update favorites display
            updateFavoritesDisplay();
            
            // If we're on a page with menu setup, call those functions
            if (typeof menuSetup === 'function') {
                menuSetup();
            }
            if (typeof setupSearchFunctionality === 'function') {
                setupSearchFunctionality();
            }
            if (typeof setupStarReviewFunctionality === 'function') {
                setupStarReviewFunctionality();
            }
            if (typeof setupCrowdLevelIndicators === 'function') {
                setupCrowdLevelIndicators();
            }
        });
    } else {
        // If not logged in, disable favorites
        disableFavorites();
        
        // If we're on a page with menu setup, call those functions
        if (typeof menuSetup === 'function') {
            menuSetup();
        }
        if (typeof setupSearchFunctionality === 'function') {
            setupSearchFunctionality();
        }
        if (typeof setupStarReviewFunctionality === 'function') {
            setupStarReviewFunctionality();
        }
        if (typeof setupCrowdLevelIndicators === 'function') {
            setupCrowdLevelIndicators();
        }
    }
});

// Function to check if user is logged in and update UI accordingly
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Get auth buttons container
    const authButtons = document.querySelector('.auth-buttons');
    
    if (authButtons) {
        // Clear existing buttons
        authButtons.innerHTML = '';
        
        if (isLoggedIn && user) {
            // User is logged in - show welcome message and logout button
            const userInfo = document.createElement('span');
            userInfo.className = 'user-info';
            userInfo.textContent = `Welcome, ${user.firstName || 'User'}`;
            
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'btn-auth';
            logoutBtn.id = 'logout-btn';
            logoutBtn.textContent = 'LOGOUT';
            logoutBtn.addEventListener('click', logout);
            
            authButtons.appendChild(userInfo);
            authButtons.appendChild(logoutBtn);
        } else {
            // User is not logged in - show sign up and sign in buttons
            const signUpBtn = document.createElement('button');
            signUpBtn.className = 'btn-auth';
            signUpBtn.textContent = 'SIGN UP';
            signUpBtn.addEventListener('click', () => {
                // Check if we're in a subdirectory
                const path = window.location.pathname;
                const isInSubdir = path.includes('/EVK/') || path.includes('/village/') || path.includes('/parkside/');
                window.location.href = isInSubdir ? '../registerPage.html' : 'registerPage.html';
            });
            
            const signInBtn = document.createElement('button');
            signInBtn.className = 'btn-auth';
            signInBtn.textContent = 'SIGN IN';
            signInBtn.addEventListener('click', () => {
                // Check if we're in a subdirectory
                const path = window.location.pathname;
                const isInSubdir = path.includes('/EVK/') || path.includes('/village/') || path.includes('/parkside/');
                window.location.href = isInSubdir ? '../loginPage.html' : 'loginPage.html';
            });
            
            authButtons.appendChild(signUpBtn);
            authButtons.appendChild(signInBtn);
        }
    }
    
    return isLoggedIn;
}

// Enable favoriting functionality for logged-in users
function enableFavorites() {
    enableMealTagFavorites();
    enableStarButtonFavorites();
}

// Enable favoriting for meal tags
function enableMealTagFavorites() {
    // Get all meal tags
    const mealTags = document.querySelectorAll('.meal-tag');
    
    if (mealTags.length > 0) {
        mealTags.forEach(tag => {
            // Remove disabled class if present
            tag.classList.remove('disabled');
            tag.style.display = 'flex'; // Ensure visible
            
            // Remove existing event listeners
            const newTag = tag.cloneNode(true);
            tag.parentNode.replaceChild(newTag, tag);
            
            // Add click event to toggle favorite status
            newTag.addEventListener('click', function() {
                const heartIcon = this.querySelector('i');
                const mealName = this.textContent.trim();
                
                if (heartIcon.classList.contains('far')) {
                    // Change to filled heart (favorited)
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    this.classList.add('favorited');
                    
                    // Save favorite to database/localStorage
                    saveFavorite(mealName, true);
                } else {
                    // Change to empty heart (unfavorited)
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                    this.classList.remove('favorited');
                    
                    // Remove favorite from database/localStorage
                    saveFavorite(mealName, false);
                }
            });
        });
    }
}

// Enable favoriting for star buttons
function enableStarButtonFavorites() {
    // Handle star buttons in search dropdown or calendar
    const starButtons = document.querySelectorAll('.star-btn');
    
    if (starButtons.length > 0) {
        starButtons.forEach(btn => {
            btn.style.display = 'inline-block'; // Make visible
            
            // Remove any existing event listeners
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Initialize with empty heart
            if (!newBtn.innerHTML.includes('fa-heart')) {
                newBtn.innerHTML = '<i class="far fa-heart"></i>';
                newBtn.style.color = "#999";
            }
            
            // Add click handling
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent other click events
                
                // Get the menu item text (handles both dropdown and calendar items)
                const menuItem = this.parentNode.querySelector('span')?.textContent.trim();
                if (!menuItem) return; // Skip if no menu item found
                
                const heartIcon = this.querySelector('i');
                if (heartIcon.classList.contains('far')) {
                    // Change to filled heart
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    this.style.color = "#990001";
                    saveFavorite(menuItem, true);
                } else {
                    // Change to empty heart
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                    this.style.color = "#999";
                    saveFavorite(menuItem, false);
                }
            });
            
            newBtn.style.cursor = 'pointer';
        });
    }
}

// Disable favoriting functionality for logged-out users
function disableFavorites() {
    // Handle meal tags
    const mealTags = document.querySelectorAll('.meal-tag');
    if (mealTags.length > 0) {
        mealTags.forEach(tag => {
            // Add disabled class
            tag.classList.add('disabled');
            
            // Remove existing event listeners
            const newTag = tag.cloneNode(true);
            tag.parentNode.replaceChild(newTag, tag);
            
            // Add click event to show login prompt
            newTag.addEventListener('click', function() {
                showLoginPrompt();
            });
        });
    }
    
    // Disable star buttons from search results or calendar
    const starButtons = document.querySelectorAll('.star-btn');
    if (starButtons.length > 0) {
        starButtons.forEach(btn => {
            // Option 2: Show login prompt when clicked
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                showLoginPrompt();
            });
            
            newBtn.style.cursor = 'not-allowed';
            newBtn.style.opacity = '0.5';
        });
    }
}

// Show login prompt for logged-out users
function showLoginPrompt() {
    if (confirm('You need to be logged in to favorite meals. Would you like to log in now?')) {
        // Check if we're in a subdirectory
        const path = window.location.pathname;
        const isInSubdir = path.split('/').length > 4; // Assuming webapp is 3 levels deep
        window.location.href = isInSubdir ? '../loginPage.html' : 'loginPage.html';
    }
}

// Save favorite to database/localStorage
function saveFavorite(mealName, isFavorite) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.uscId) {
        console.error('User not logged in or user ID not available');
        return;
    }
    
    console.log(`[saveFavorite] User ${user.uscId} ${isFavorite ? 'favoriting' : 'unfavoriting'} "${mealName}"`);
    
    // Store favorites in localStorage
    let favorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    if (!favorites[user.uscId]) {
        favorites[user.uscId] = [];
    }
    
    if (isFavorite) {
        // Add to favorites if not already there
        if (!favorites[user.uscId].includes(mealName)) {
            favorites[user.uscId].push(mealName);
            console.log(`[saveFavorite] Added "${mealName}" to localStorage favorites`);
        }
    } else {
        // Remove from favorites
        const initialLength = favorites[user.uscId].length;
        favorites[user.uscId] = favorites[user.uscId].filter(item => item !== mealName);
        if (favorites[user.uscId].length < initialLength) {
            console.log(`[saveFavorite] Removed "${mealName}" from localStorage favorites`);
        }
    }
    
    // Save back to localStorage
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
    
    // Update UI immediately
    updateFavoritesDisplay();
    
    // Make AJAX call to update server-side database
    sendFavoriteToServer(user.uscId, mealName, isFavorite);
}

// Send favorite data to server
function sendFavoriteToServer(uscId, mealName, isFavorite) {
    console.log(`[sendFavoriteToServer] Sending request to server:`, {
        uscId,
        mealName,
        isFavorite
    });

    const formData = new URLSearchParams();
    formData.append('usc_id', uscId);
    formData.append('meal_name', mealName);
    formData.append('is_favorite', isFavorite ? '1' : '0');
    
    // Get the context path
    const contextPath = window.location.pathname.split('/')[1];
    const servletPath = `/${contextPath}/FavoriteMealServlet`;
    
    console.log(`[sendFavoriteToServer] Using servlet path: ${servletPath}`);
    
    fetch(servletPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    })
    .then(response => {
        console.log(`[sendFavoriteToServer] Server response status:`, response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('[sendFavoriteToServer] Server response:', data);
        if (!data.success) {
            console.error('[sendFavoriteToServer] Failed to save favorite:', data.message);
            alert('Failed to save favorite: ' + data.message);
        }
        // Update favorites display again after server confirmation
        updateFavoritesDisplay();
    })
    .catch(error => {
        console.error('[sendFavoriteToServer] Error:', error);
        alert('Error saving favorite. Please try again.');
        // Even if server save fails, keep the local state
        updateFavoritesDisplay();
    });
}

// Update favorites display based on saved favorites
function updateFavoritesDisplay() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) return;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uscId) return;
    
    // Get user's favorites
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    const userFavorites = favorites[user.uscId] || [];
    
    // Update all star buttons in both menu items and meal items
    document.querySelectorAll('.menu-item .star-btn, .meal-item .star-btn').forEach(btn => {
        const menuItem = btn.parentNode.querySelector('span')?.textContent.trim();
        if (!menuItem) return;
        
        if (userFavorites.includes(menuItem)) {
            // This item is a favorite
            btn.innerHTML = '<i class="fas fa-heart"></i>'; // filled heart
            btn.style.color = "#990001";
        } else {
            // This item is not a favorite
            btn.innerHTML = '<i class="far fa-heart"></i>'; // empty heart
            btn.style.color = "#999";
        }
    });
    
    // Update star buttons in the search dropdown
    document.querySelectorAll('.dropdown-item .star-btn').forEach(btn => {
        const menuItem = btn.parentNode.querySelector('span')?.textContent.trim();
        if (!menuItem) return;
        
        if (userFavorites.includes(menuItem)) {
            btn.innerHTML = '<i class="fas fa-heart"></i>'; // filled heart
            btn.style.color = "#990001";
        } else {
            btn.innerHTML = '<i class="far fa-heart"></i>'; // empty heart
            btn.style.color = "#999";
        }
    });

    // Update meal tags in the home page
    document.querySelectorAll('.meal-tag').forEach(tag => {
        const mealName = tag.textContent.trim();
        const heartIcon = tag.querySelector('i');
        
        if (userFavorites.includes(mealName)) {
            // This item is a favorite
            heartIcon.classList.remove('far');
            heartIcon.classList.add('fas');
            tag.classList.add('favorited');
            heartIcon.style.color = "#990001";
        } else {
            // This item is not a favorite
            heartIcon.classList.remove('fas');
            heartIcon.classList.add('far');
            tag.classList.remove('favorited');
            heartIcon.style.color = "#999";
        }
    });
}

// Logout function
function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    // Reload the page to update UI
    window.location.reload();
}

// Fetch favorites from server
function fetchFavoritesFromServer() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uscId) {
        console.log('[fetchFavoritesFromServer] No user ID found, skipping fetch');
        return Promise.resolve();
    }
    
    console.log(`[fetchFavoritesFromServer] Fetching favorites for user ${user.uscId}`);
    
    // Get the context path
    const contextPath = window.location.pathname.split('/')[1];
    const servletPath = `/${contextPath}/FavoriteMealServlet?usc_id=${user.uscId}`;
    
    console.log(`[fetchFavoritesFromServer] Using servlet path: ${servletPath}`);
    
    return fetch(servletPath, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        },
        credentials: 'same-origin'
    })
    .then(response => {
        console.log(`[fetchFavoritesFromServer] Server response status:`, response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('[fetchFavoritesFromServer] Failed to parse JSON:', text);
                throw new Error('Invalid JSON response from server');
            }
        });
    })
    .then(data => {
        console.log('[fetchFavoritesFromServer] Server response:', data);
        if (data.favorites) {
            // Update localStorage with server data
            let favorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
            favorites[user.uscId] = data.favorites;
            localStorage.setItem('userFavorites', JSON.stringify(favorites));
            console.log('[fetchFavoritesFromServer] Updated localStorage with server data');
            
            // Update the display immediately after fetching
            updateFavoritesDisplay();
        } else {
            console.warn('[fetchFavoritesFromServer] No favorites array in response:', data);
        }
        return data;
    })
    .catch(error => {
        console.error('[fetchFavoritesFromServer] Error:', error);
        // Don't show alert for initial load errors
        if (!error.message.includes('Failed to fetch')) {
            alert('Error fetching favorites. Some favorites may not be displayed correctly.');
        }
        return null;
    });
}