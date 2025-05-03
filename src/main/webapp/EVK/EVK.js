const EVKButton = document.getElementById("EVKButton");
const villageButton = document.getElementById("villageButton");
const parksideButton = document.getElementById("parksideButton");

const searchBar = document.getElementById("searchBar");
const dropdown = document.getElementById("dropdown");
const form = document.getElementById("form");
const searchSection = document.getElementById("searchSection")
const clearButton = document.getElementById("clearButton");

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Setup menu and other functionality
    setupPage();
    
    // Wait for userLoginState.js to load and initialize
    if (typeof window.userLoginStateInitialized === 'undefined') {
        const checkLoginState = setInterval(() => {
            if (typeof window.userLoginStateInitialized !== 'undefined') {
                clearInterval(checkLoginState);
                // Now that userLoginState is initialized, update favorites
                if (checkLoginStatus()) {
                    updateFavoritesDisplay();
                }
            }
        }, 100);
    }
});

// Function to setup the page
function setupPage() {
    // Setup menu and calendar
    menuSetup();
    
    // Setup search functionality
    setupSearchFunctionality();
    
    // Setup star review functionality
    setupStarReviewFunctionality();
    
    // Setup crowd level indicators
    setupCrowdLevelIndicators();
    }

// Check login status and update UI
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update header UI based on login status
    updateHeaderLoginStatus(isLoggedIn, user);
    
    // Enable or disable favorite functionality based on login status
    if (isLoggedIn) {
        enableFavorites();
    } else {
        disableFavorites();
    }
    
    return isLoggedIn;
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
    document.querySelectorAll('.menu-item .star-btn, .meal-item .star-btn, .dropdown-item .star-btn').forEach(btn => {
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
}

// Update header to show login status
function updateHeaderLoginStatus(isLoggedIn, user) {
    const rightHeader = document.getElementById('rightHeader');
    
    // If logged in, show user info and logout button
    if (isLoggedIn && user) {
        // Check if we already added user info elements
        if (!document.getElementById('userInfo')) {
            // Create user info and logout button
            const userInfo = document.createElement('div');
            userInfo.id = 'userInfo';
            userInfo.style.display = 'flex';
            userInfo.style.alignItems = 'center';
            userInfo.style.gap = '1em';
            
            // Welcome message
            const welcomeMsg = document.createElement('span');
            welcomeMsg.textContent = `Welcome, ${user.firstName || 'User'}`;
            welcomeMsg.style.color = 'white';
            welcomeMsg.style.fontFamily = 'Georgia';
            
            // Logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'LOGOUT';
            logoutBtn.className = 'headerButton';
            logoutBtn.id = 'logoutBtn';
            logoutBtn.addEventListener('click', logout);
            
            // Add elements to the header
            userInfo.appendChild(welcomeMsg);
            userInfo.appendChild(logoutBtn);
            
            // Add user info to the right of the navigation buttons
            rightHeader.appendChild(userInfo);
        }
    } else {
        // If not logged in, remove user info if it exists
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            rightHeader.removeChild(userInfo);
        }
        
        // Add login button if it doesn't exist
        if (!document.getElementById('loginBtn')) {
            const loginBtn = document.createElement('button');
            loginBtn.textContent = 'LOGIN';
            loginBtn.className = 'headerButton';
            loginBtn.id = 'loginBtn';
            loginBtn.addEventListener('click', () => window.location.href = '../loginPage.html');
            
            rightHeader.appendChild(loginBtn);
        }
    }
}

// Enable favorite functionality for logged-in users
function enableFavorites() {
    // Enable favoriting in search dropdown
    enableDropdownFavorites();
    
    // Enable favoriting in calendar menu items
    enableCalendarFavorites();
    
    // Make review form accessible
    if (document.getElementById('rate')) {
        document.getElementById('inputText').disabled = false;
        document.getElementById('inputText').placeholder = "Please leave a review:";
        document.getElementById('submitButton').disabled = false;
    }
}

// Enable favoriting in search dropdown
function enableDropdownFavorites() {
    document.querySelectorAll('.dropdown-item .star-btn').forEach(btn => {
        // Remove any existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add the favoriting functionality
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent dropdown item click
            
            const menuItem = this.parentNode.querySelector('span').textContent.trim();
            toggleFavorite(this, menuItem);
        });
        
        newBtn.style.cursor = 'pointer';
    });
}

// Enable favoriting in calendar menu items
function enableCalendarFavorites() {
    document.querySelectorAll('.menu-item .star-btn, .meal-item .star-btn').forEach(btn => {
        // Remove any existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add the favoriting functionality
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent other click events
            
            const menuItem = this.parentNode.querySelector('span').textContent.trim();
            toggleFavorite(this, menuItem);
        });
        
        newBtn.style.cursor = 'pointer';
    });
}

// Toggle favorite state
function toggleFavorite(button, menuItem) {
    const isFavorite = !button.innerHTML.includes('far fa-heart');
    
    if (!isFavorite) {
        // Change to filled heart (favoriting)
        button.innerHTML = '<i class="fas fa-heart"></i>';
        button.style.color = "#990001";
        // Use the global saveFavorite from userLoginState.js
        if (typeof window.saveFavorite === 'function') {
            window.saveFavorite(menuItem, true);
        }
    } else {
        // Change to empty heart (unfavoriting)
        button.innerHTML = '<i class="far fa-heart"></i>';
        button.style.color = "#999";
        // Use the global saveFavorite from userLoginState.js
        if (typeof window.saveFavorite === 'function') {
            window.saveFavorite(menuItem, false);
        }
    }
}

// Disable favorite functionality for logged-out users
function disableFavorites() {
    // Disable favoriting in meal tags
    const mealTags = document.querySelectorAll('.meal-tag');
    if (mealTags.length > 0) {
        mealTags.forEach(tag => {
            // Add disabled class
            tag.classList.add('disabled');
            
            // Remove existing event listeners by cloning and replacing
            const newTag = tag.cloneNode(true);
            tag.parentNode.replaceChild(newTag, tag);
            
            // Add click event to show login prompt
            newTag.addEventListener('click', function() {
                showLoginPrompt();
            });
        });
    }
    
    // Disable favoriting across all star buttons in search dropdown
    document.querySelectorAll('.star-btn').forEach(btn => {
        // Remove any existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add the login prompt functionality
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent dropdown item click
            showLoginPrompt();
        });
        
        // Set cursor style
        newBtn.style.cursor = 'not-allowed';
    });
    
    // Disable favoriting in calendar menu items
    document.querySelectorAll('.menu-item .star-btn').forEach(btn => {
        // Remove any existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add the login prompt functionality
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showLoginPrompt();
        });
        
        // Set cursor style
        newBtn.style.cursor = 'not-allowed';
    });
    
    // Make review form inaccessible
    if (document.getElementById('rate')) {
        document.getElementById('inputText').disabled = true;
        document.getElementById('inputText').placeholder = "Please log in to leave a review";
        document.getElementById('submitButton').disabled = true;
    }
}

// Show login prompt for logged-out users
function showLoginPrompt() {
    // Save the current page URL to redirect back after login
    localStorage.setItem('redirectUrl', window.location.href);
    
    // Redirect to login page with correct path
        window.location.href = '../loginPage.html';
}

//----------------------------------------------------HERO SCROLL FUNCTIONALITY----------------------------------------------------//

window.addEventListener('scroll', () => {
    const hero = document.getElementById("hero");
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;
    const buffer = heroHeight/5;
  
    hero.style.opacity = Math.max(1 - scrollY /(heroHeight  + buffer), 0); //reduce opacity of hero section
});

//----------------------------------------------------CREATE DROPDOWN FUNCTIONALITY----------------------------------------------------//

// Add a function to get all menu items from the current menu
function getAllMenuItems() {
    const menuItems = [];
    const menuEntry = document.getElementById('menuEntry');
    const menuSpans = menuEntry.querySelectorAll('.menu-item span');
    
    menuSpans.forEach(span => {
        menuItems.push(span.textContent.trim());
    });
    
    return menuItems;
}

// Update the search functionality
function setupSearchFunctionality() {
    const searchBar = document.getElementById('searchBar');
    const dropdown = document.getElementById('dropdown');
    
    searchBar.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        dropdown.innerHTML = ''; // Clear previous results
        
        if (searchTerm.length > 0) {
            // Get all menu items from today's menu and weekly calendar
            const menuItems = Array.from(document.querySelectorAll('.menu-item span, .meal-item span'))
                .map(span => span.textContent.trim())
                .filter((item, index, self) => self.indexOf(item) === index); // Remove duplicates
            
            // Filter items based on search term
            const filteredItems = menuItems.filter(item => 
                item.toLowerCase().includes(searchTerm)
            );
            
            // Display results
            if (filteredItems.length > 0) {
                filteredItems.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'dropdown-item';

                    const span = document.createElement('span');
                    span.textContent = item;
            
                    const starBtn = document.createElement('button');
                    starBtn.className = 'star-btn';
                    starBtn.innerHTML = '<i class="far fa-heart"></i>'; // Initialize with empty heart
                    starBtn.style.color = "#999";
                    
                    div.appendChild(span);
                    div.appendChild(starBtn);
                    dropdown.appendChild(div);
                });
                dropdown.classList.add('visible');
            } else {
                const noResults = document.createElement('div');
                noResults.className = 'dropdown-item';
                noResults.textContent = 'No matching items found';
                noResults.style.color = '#757575';
                dropdown.appendChild(noResults);
                dropdown.classList.add('visible');
            }
        } else {
            dropdown.classList.remove('visible');
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchBar.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('visible');
        }
    });
}

function clearSearch() {
    const searchBar = document.getElementById('searchBar');
    const dropdown = document.getElementById('dropdown');
    
    if (searchBar) searchBar.value = '';
    if (dropdown) {
        dropdown.innerHTML = '';
        dropdown.classList.remove('visible');
    }
}

//----------------------------------------------------STAR REVIEW FUNCTIONALITY----------------------------------------------------//

const hitBoxes =  document.querySelectorAll(".hitBox");
const inputText = document.getElementById("inputText");
const reviewStar = document.querySelectorAll(".reviewStar");
const starInput = document.getElementById("rating");
const ratingForm = document.getElementById("rate");
let lockedRating = 0;

hitBoxes.forEach(hitbox => {
    hitbox.addEventListener('click', () => {
        // Check if user is logged in before allowing rating
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            showLoginPrompt();
            return;
        }
        
        const star = hitbox.querySelector('.reviewStar');
        const value = star.getAttribute("data-value");
        starInput.value = value;
        lockedRating = value;

        updateStars(lockedRating);
    });

    hitbox.addEventListener('mouseover', () => {
        const star = hitbox.querySelector('.reviewStar');
        const value = star.getAttribute("data-value");
        updateStars(value);
    });

    hitbox.addEventListener('mouseout', () => {
        updateStars(lockedRating);
    });
});

function updateStars(value) {
    reviewStar.forEach(s => {
        if (parseFloat(s.getAttribute("data-value")) <= value) {
            s.classList.add('selected');
        } else {
            s.classList.remove('selected');
        }
    });
}

ratingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        showLoginPrompt();
        return;
    }
    
    if (!starInput.value) {
        const reviewError = document.getElementById("reviewError");
        reviewError.style.display = "block";
    }
    else {
        // Get user data for the review submission
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // If we have a valid user with USC ID
        if (user && user.uscId) {
            // Prepare review data
            const reviewData = {
                usc_id: user.uscId,
                hall_id: 1, // EVK ID (adjust as needed)
                rating: starInput.value,
                comment: inputText.value
            };
            
            // Submit review to server
            submitReview(reviewData);
            
            // Clear form
            inputText.value = "";
            starInput.value = null;
            lockedRating = 0;
            reviewStar.forEach(s => {
                s.classList.remove('selected');
            });
        } else {
            showLoginPrompt();
        }
    }
});

// Submit review to server
function submitReview(reviewData) {
    // Create form data from review object
    const formData = new URLSearchParams();
    Object.keys(reviewData).forEach(key => {
        formData.append(key, reviewData[key]);
    });
    
    // Send review to server
    fetch('../ReviewsServlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        // Reload reviews after successful submission
        loadReviews();
    })
    .catch(error => {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
    });
}

// Load reviews from server
function loadReviews() {
    // This function would fetch reviews from the server
    console.log('Loading reviews...');
    
    // You would implement something like this:
    /*
    fetch('../GetReviewsServlet?hall_id=1') // 1 for EVK
        .then(response => response.json())
        .then(reviews => {
            displayReviews(reviews);
        })
        .catch(error => {
            console.error('Error loading reviews:', error);
        });
    */
}

document.addEventListener('click', (event) => {
    if (!ratingForm.contains(event.target)) {
        const reviewError = document.getElementById("reviewError");
        reviewError.style.display = "none";
    }
});

//----------------------------------------------------FAVORITE FUNCTIONALITY----------------------------------------------------//

// Enable favorite functionality for logged-in users
function enableFavorites() {
    // Enable favoriting across all star buttons
    document.querySelectorAll('.star-btn').forEach(btn => {
        // Remove any existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add the favoriting functionality
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent other click events
            
            const menuItem = this.parentNode.querySelector('span, p').textContent.trim();
            
            if (this.innerHTML.includes("far fa-heart")) {
                this.innerHTML = '<i class="fas fa-heart"></i>'; // filled heart
                this.style.color = "#990001";
                saveFavorite(menuItem, true);
            } else {
                this.innerHTML = '<i class="far fa-heart"></i>'; // empty heart
                this.style.color = "#999";
                saveFavorite(menuItem, false);
            }
        });
        
        // Set cursor style
        newBtn.style.cursor = 'pointer';
    });
    
    // Make review form accessible
    if (ratingForm) {
        inputText.disabled = false;
        inputText.placeholder = "Please leave a review:";
    }
}

// Disable favorite functionality for logged-out users
function disableFavorites() {
    // Disable favoriting across all star buttons
    document.querySelectorAll('.star-btn').forEach(btn => {
        // Remove any existing event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add the login prompt functionality
        newBtn.addEventListener('click', showLoginPrompt);
        
        // Set cursor style
        newBtn.style.cursor = 'not-allowed';
    });
    
    // Make review form inaccessible
    if (ratingForm) {
        inputText.disabled = true;
        inputText.placeholder = "Please log in to leave a review";
    }
}

// Show login prompt when user tries to use features when logged out
function showLoginPrompt(e) {
    if (e) e.stopPropagation();
    
    // Show login prompt with option to redirect
    if (confirm('You need to be logged in to use this feature. Would you like to log in now?')) {
        window.location.href = '../loginPage.html';
    }
}

//----------------------------------------------------CALENDAR FUNCTIONALITY----------------------------------------------------//

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const placeholderMenu = ['Grilled Chicken', 'Caesar Salad', 'Pasta Primavera'];

// Setup calendar functionality
function setupCalendar() {
    // Clear calendar first
    const calendar = document.getElementById('calendar');
    if (!calendar) {
        console.error("Calendar element not found");
        return;
    }
    
    calendar.innerHTML = '';
    
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let userFavorites = [];
    
    // Get user favorites if logged in
    if (isLoggedIn && user.uscId) {
        const favorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
        userFavorites = favorites[user.uscId] || [];
    }
    
    // Create calendar layout
    days.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';

        const title = document.createElement('h3');
        title.textContent = day;
        dayDiv.appendChild(title);

        // Add menu items for this day
        placeholderMenu.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';

            const itemText = document.createElement('span');
            itemText.textContent = item;

            const starBtn = document.createElement('button');
            starBtn.className = 'star-btn';
            starBtn.setAttribute('aria-label', 'Favorite');
            
            // Check if this item is in user's favorites
            const isFavorite = userFavorites.includes(item);
            
            if (isFavorite) {
                starBtn.innerHTML = '<i class="fas fa-heart"></i>'; // Filled heart
                starBtn.style.color = '#990001';
            } else {
                starBtn.innerHTML = '<i class="far fa-heart"></i>'; // Empty heart
                starBtn.style.color = '#999';
            }

            menuItem.appendChild(itemText);
            menuItem.appendChild(starBtn);
            dayDiv.appendChild(menuItem);
        });

        calendar.appendChild(dayDiv);
    });
    
    // Update star button functionality based on login status
    if (isLoggedIn) {
        enableCalendarFavorites();
    } else {
        disableFavorites();
    }
}

function navigateTo(page) {
    if (page === 'home') {
        window.location.href = '../HomePage.html';
    } else if (page === 'evk') {
        window.location.href = 'EVK.html';
	} else if (page === 'village') {
		window.location.href = '../village/village.html';
	} else if (page === 'parkside') {
		window.location.href = '../parkside/parkside.html';
	}
}

function menuSetup() {
    // Fetch menu data from the server with the correct URL
    fetch('../MenuSelectServlet')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.evk) {
                throw new Error('Invalid menu data received');
            }
            // Populate today's menu
            populateTodayMenu(data.evk[0]); // First index is today's menu
            
            // Setup the weekly calendar
            setupWeeklyCalendar(data.evk);
            
            // Enable favorites if user is logged in
            if (checkLoginStatus()) {
                enableFavorites();
                updateFavoritesDisplay();
                
                // Add a small delay to ensure all elements are properly initialized
                setTimeout(() => {
                    enableFavorites();
                    updateFavoritesDisplay();
                }, 100);
            }
        })
        .catch(error => {
            console.error('Error fetching menu:', error);
            document.getElementById('menuEntry').innerHTML = '<p class="error-message">Failed to load menu data</p>';
            console.log('Specific error:', error.message);
        });
}

function populateTodayMenu(menuData) {
	const menuEntry = document.getElementById('menuEntry');
    menuEntry.innerHTML = ''; // Clear existing content
    
    // Create HTML for each menu category
    menuData.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'menu-category';
        
        // Add category title
        const titleH2 = document.createElement('h2');
        titleH2.className = 'category-title';
        titleH2.textContent = category.title;
        categoryDiv.appendChild(titleH2);
        
        // Add menu items
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'menu-items';
        
        category.meals.forEach(meal => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'menu-item';
            
            const mealSpan = document.createElement('span');
            mealSpan.textContent = meal;
            
            const starBtn = document.createElement('button');
            starBtn.className = 'star-btn';
            starBtn.innerHTML = '<i class="far fa-heart"></i>'; // Empty heart by default
            starBtn.style.color = "#999";
            
            itemDiv.appendChild(mealSpan);
            itemDiv.appendChild(starBtn);
            itemsDiv.appendChild(itemDiv);
        });
        
        categoryDiv.appendChild(itemsDiv);
        menuEntry.appendChild(categoryDiv);
    });
    
    // Enable favorites and update display
    if (checkLoginStatus()) {
        enableFavorites();
        updateFavoritesDisplay();
    }
}

function setupWeeklyCalendar(weeklyMenu) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = ''; // Clear existing content
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    
    // Create calendar grid
    for (let i = 0; i < 7; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        
        // Add day header
        const headerH3 = document.createElement('h3');
        headerH3.className = 'day-header';
        headerH3.textContent = days[i];
        if (i === today) {
            headerH3.textContent += ' (Today)';
            dayDiv.classList.add('today');
        }
        dayDiv.appendChild(headerH3);
        
        // Add menu for the day
        const dayMenu = document.createElement('div');
        dayMenu.className = 'day-menu';
        
        if (weeklyMenu[i]) {
            weeklyMenu[i].forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'meal-category';
                
                const categoryTitle = document.createElement('h4');
                categoryTitle.className = 'meal-category-title';
                categoryTitle.textContent = category.title;
                categoryDiv.appendChild(categoryTitle);
                
                const mealItems = document.createElement('div');
                mealItems.className = 'meal-items';
                
                category.meals.forEach(meal => {
                    const mealDiv = document.createElement('div');
                    mealDiv.className = 'meal-item';
                    
                    const mealSpan = document.createElement('span');
                    mealSpan.textContent = meal;
                    
                    const starBtn = document.createElement('button');
                    starBtn.className = 'star-btn';
                    starBtn.innerHTML = '<i class="far fa-heart"></i>'; // Empty heart by default
                    starBtn.style.color = "#999";
                    
                    mealDiv.appendChild(mealSpan);
                    mealDiv.appendChild(starBtn);
                    mealItems.appendChild(mealDiv);
                });
                
                categoryDiv.appendChild(mealItems);
                dayMenu.appendChild(categoryDiv);
				});
			} else {
            dayMenu.innerHTML = '<p class="no-menu">Menu not available</p>';
        }
        
        dayDiv.appendChild(dayMenu);
        calendar.appendChild(dayDiv);
    }
    
    // Let userLoginState handle the favorites
    if (checkLoginStatus()) {
        updateFavoritesDisplay();
    }
}

function setupCrowdLevelIndicators() {
    const crowdCircles = document.querySelectorAll('.crowdCircle');
    const crowdDescription = document.getElementById('crowdDescription');
    
    // Simulated crowd level (1-5)
    // In a real implementation, this would come from your backend
    const currentCrowdLevel = 3;

    const descriptions = {
        1: 'The dining hall is "not busy"',
        2: 'The dining hall is "slightly busy"',
        3: 'The dining hall is "moderately busy"',
        4: 'The dining hall is "very busy"',
        5: 'The dining hall is "extremely busy"'
    };
    
    // Update circles based on crowd level
    crowdCircles.forEach((circle, index) => {
        if (index < currentCrowdLevel) {
            circle.classList.add('active');
        } else {
            circle.classList.remove('active');
        }
        
        // Add click event to update crowd level
        circle.addEventListener('click', () => {
            const isLoggedIn = checkLoginStatus();
            if (!isLoggedIn) {
                showLoginPrompt();
                return;
            }
            
            // Get user data
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.uscId) {
                showLoginPrompt();
                return;
            }
            
            // Here you would add the logic to update the crowd level
            const newLevel = index + 1;
            
            // Send to SubmitOccupancyServlet
            const formData = new URLSearchParams();
            formData.append('usc_id', user.uscId);
            formData.append('hall_id', '1'); // EVK's ID
            formData.append('occupancy_level', newLevel);
            
            fetch('../SubmitOccupancyServlet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Update UI
                    crowdCircles.forEach((c, i) => {
                        if (i < newLevel) {
                            c.classList.add('active');
                        } else {
                            c.classList.remove('active');
                        }
                    });
                    crowdDescription.textContent = descriptions[newLevel];
                }
            })
            .catch(error => {
                console.error('Error submitting occupancy:', error);
            });
        });
    });
    
    // Update description
    crowdDescription.textContent = descriptions[currentCrowdLevel];
    
    // Fetch current occupancy level
    fetch('../GetOccupancyServlet?hall_id=1')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.occupancy_level) {
                const level = data.occupancy_level;
                crowdCircles.forEach((circle, index) => {
                    if (index < level) {
                        circle.classList.add('active');
                    } else {
                        circle.classList.remove('active');
			}
                });
                crowdDescription.textContent = descriptions[level];
            }
        })
        .catch(error => {
            console.error('Error fetching occupancy:', error);
		});
}