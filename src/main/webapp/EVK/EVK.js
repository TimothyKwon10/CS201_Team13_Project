const EVKButton = document.getElementById("EVKButton");
const villageButton = document.getElementById("villageButton");
const parksideButton = document.getElementById("parksideButton");

const searchBar = document.getElementById("searchBar");
const dropdown = document.getElementById("dropdown");
const form = document.getElementById("form");
const searchSection = document.getElementById("searchSection")
const clearButton = document.getElementById("clearButton");

const hallId = parseInt(document.body.dataset.hallId, 10);

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
	
	checkLoginStatus();
	
    // Setup menu and calendar
    menuSetup();
    
    // Setup search functionality
    setupSearchFunctionality();
	
    // Setup crowd level indicators
    setupCrowdLevelIndicators();
    
	
    // If logged in, fetch favorites from server
    //if (isLoggedIn) {
    //    fetchFavoritesFromServer();
    //}
	
	// --- Render Auth Button / Logout ---
});

// Check login status and update UI
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Update header UI based on login status
    updateHeaderLoginStatus(isLoggedIn, user);
    
    // Enable or disable favorite functionality based on login status
    if (isLoggedIn) {
        enableFavorites();
        updateFavoritesDisplay();
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
    
    // Update all star buttons in calendar items
    document.querySelectorAll('.menu-item .star-btn').forEach(btn => {
        const menuItem = btn.parentNode.querySelector('span').textContent.trim();
        
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

function updateHeaderLoginStatus(isLoggedIn, user) {
    const rightHeader = document.getElementById('rightHeader');
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    
    if (isLoggedIn && user) {
        // Hide auth buttons
        if (signInBtn) signInBtn.style.display = 'none';
        if (signUpBtn) signUpBtn.style.display = 'none';
        
        // Create user info if it doesn't exist
        if (!document.getElementById('userInfo')) {
            const userInfo = document.createElement('div');
            userInfo.id = 'userInfo';
            userInfo.style.display = 'flex';
            userInfo.style.alignItems = 'center';
            userInfo.style.gap = '1em';
            
            const welcomeMsg = document.createElement('span');
            welcomeMsg.textContent = `Welcome ${user.firstName || 'User'}!`;
            welcomeMsg.style.color = 'black';
            welcomeMsg.style.fontFamily = "'Helvetica', Arial, sans-serif";
			welcomeMsg.style.fontSize = "14";
			welcomeMsg.style.fontWeight = "normal";
            
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'LOGOUT';
            logoutBtn.className = 'btn-auth'; // Use same class as other buttons
            logoutBtn.id = 'logoutBtn';
            logoutBtn.addEventListener('click', logout);
            
            userInfo.appendChild(welcomeMsg);
            userInfo.appendChild(logoutBtn);
            rightHeader.appendChild(userInfo);
        }
    } else {
        // Show auth buttons
        if (signInBtn) signInBtn.style.display = 'block';
        if (signUpBtn) signUpBtn.style.display = 'block';
        
        // Remove user info if it exists
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            rightHeader.removeChild(userInfo);
        }
    }
}

// Enable favorite functionality for logged-in users
function enableFavorites() {
    // Enable favoriting across all star buttons in search dropdown
    enableDropdownFavorites();
    
    // Enable favoriting in meal tags
    const mealTags = document.querySelectorAll('.meal-tag');
    if (mealTags.length > 0) {
        mealTags.forEach(tag => {
            // Remove disabled class
            tag.classList.remove('disabled');
            
            // Remove any existing event listeners by cloning and replacing
            const newTag = tag.cloneNode(true);
            tag.parentNode.replaceChild(newTag, tag);
            
            // Add click event to toggle favorite
            newTag.addEventListener('click', function() {
                const heartIcon = this.querySelector('i');
                
                if (heartIcon.classList.contains('far')) {
                    // Change to filled heart (favorited)
                    heartIcon.classList.remove('far');
                    heartIcon.classList.add('fas');
                    this.classList.add('favorited');
                    
                    // Save favorite
                    saveFavorite(this.textContent.trim(), true);
                } else {
                    // Change to empty heart (unfavorited)
                    heartIcon.classList.remove('fas');
                    heartIcon.classList.add('far');
                    this.classList.remove('favorited');
                    
                    // Remove favorite
                    saveFavorite(this.textContent.trim(), false);
                }
            });
        });
    }
    
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
    // This will be called whenever the dropdown is generated
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
}

// Enable favoriting in calendar menu items
function enableCalendarFavorites() {
    document.querySelectorAll('.menu-item .star-btn').forEach(btn => {
        // Remove any existing event listeners by cloning and replacing
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Add the favoriting functionality
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent other click events
            
            const menuItem = this.parentNode.querySelector('span').textContent.trim();
            
            if (this.innerHTML.includes("far fa-heart")) {
                // Change to filled heart (favorited)
                this.innerHTML = '<i class="fas fa-heart"></i>'; // filled heart
                this.style.color = "#990001";
                saveFavorite(menuItem, true);
            } else {
                // Change to empty heart (unfavorited)
                this.innerHTML = '<i class="far fa-heart"></i>'; // empty heart
                this.style.color = "#999";
                saveFavorite(menuItem, false);
            }
        });
        
        // Set cursor style
        newBtn.style.cursor = 'pointer';
    });
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

// Save favorite to database/localStorage
function saveFavorite(mealName, isFavorite) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.uscId) {
        console.error('User not logged in or user ID not available');
        return;
    }
    
    console.log(`User ${user.uscId} ${isFavorite ? 'favorited' : 'unfavorited'} "${mealName}"`);
    
    // Store favorites in localStorage
    let favorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    
    // Initialize user favorites if they don't exist
    if (!favorites[user.uscId]) {
        favorites[user.uscId] = [];
    }
    
    if (isFavorite) {
        // Add to favorites if not already there
        if (!favorites[user.uscId].includes(mealName)) {
            favorites[user.uscId].push(mealName);
        }
    } else {
        // Remove from favorites
        favorites[user.uscId] = favorites[user.uscId].filter(item => item !== mealName);
    }
    
    // Save back to localStorage
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
    
    // Make AJAX call to update server-side database
    sendFavoriteToServer(user.uscId, mealName, isFavorite);
}

// Send favorite data to server
function sendFavoriteToServer(uscId, mealName, isFavorite) {
    const formData = new URLSearchParams();
    formData.append('usc_id', uscId);
    formData.append('meal_name', mealName);
    formData.append('is_favorite', isFavorite ? '1' : '0');
    
    fetch('FavoriteMealServlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => console.log('Favorite saved:', data))
    .catch(error => console.error('Error saving favorite:', error));
}

// Logout function
function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');

    // Redirect to home page
    window.location.href = '../HomePage.html';
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
    const clearButton = document.getElementById('clearButton');
    const form = document.getElementById('form');
    const searchSection = document.getElementById('searchSection');
    
    // Prevent any form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    });
    
    // Clear search when clicking the clear button
    clearButton.addEventListener('click', (e) => {
        e.preventDefault();
        clearSearch();
    });
    
    // Handle search input
    searchBar.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        // Clear previous results
        dropdown.innerHTML = '';

        if (searchTerm.length > 0) {
            // Get all menu items from the page
            const menuItems = new Set(); // Use Set to avoid duplicates
            
            // Get items from menu entry (today's menu)
            const menuEntry = document.getElementById('menuEntry');
            if (menuEntry) {
                menuEntry.querySelectorAll('.menu-item span').forEach(span => {
                    menuItems.add(span.textContent.trim());
                });
            }
            
            // Get items from calendar (weekly menu)
            const calendar = document.getElementById('calendar');
            if (calendar) {
                calendar.querySelectorAll('.meal-item span').forEach(span => {
                    menuItems.add(span.textContent.trim());
                });
            }
            
            // Convert Set to Array and filter
            const filteredItems = Array.from(menuItems).filter(item => 
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
                    
                    // Check if item is favorited
                    const isLoggedIn = checkLoginStatus();
                    if (isLoggedIn) {
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        if (!user.uscId) {
                            showLoginPrompt();
                            return;
                        }
                        
                        // Add click event to toggle favorite
                        starBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            const heartIcon = this.querySelector('i');
                            const isFavorited = heartIcon.classList.contains('fas');
                            
                            // Send to FavoriteMealServlet
                            const formData = new URLSearchParams();
                            formData.append('usc_id', user.uscId);
                            formData.append('meal_name', item);
                            formData.append('is_favorite', !isFavorited ? '1' : '0');
                            
                            fetch('../FavoriteMealServlet', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: formData.toString()
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    if (isFavorited) {
                                        heartIcon.classList.remove('fas');
                                        heartIcon.classList.add('far');
                                        this.style.color = '#999';
                                    } else {
                                        heartIcon.classList.remove('far');
                                        heartIcon.classList.add('fas');
                                        this.style.color = '#990001';
                                    }
                                }
                            })
                            .catch(error => {
                                console.error('Error updating favorite:', error);
});
                        });
                    } else {
                        starBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            showLoginPrompt();
                        });
                    }
                    
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

document.addEventListener('DOMContentLoaded', () => {
   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
   const user = JSON.parse(localStorage.getItem('user') || '{}');
   const reviewFormSection = document.getElementById('reviewFormSection');
   const reviewForm = document.getElementById('reviewForm');
   const inputText = document.getElementById('inputText');
   const ratingInput = document.getElementById('rating');
   const reviewError = document.getElementById('reviewError');
   const reviewStars = document.querySelectorAll('.hitBox');
   const hallId = 1; // EVK
   // 1. If not logged in, replace the form with login prompt
   if (!isLoggedIn || !user.uscId) {
       reviewFormSection.innerHTML = `
           <div class="login-prompt">
               Please <a href="../loginPage.html">sign in</a> to leave a review.
           </div>
       `;
       return;
   }
   // 2. Handle star rating selection
   let lockedRating = 0;
   reviewStars.forEach(box => {
       box.addEventListener('click', () => {
           const star = box.querySelector('.reviewStar');
           const value = parseInt(star.dataset.value);
		   console.log("Clicked star value:", value);
		   
           lockedRating = value;
           updateStars(value);
           ratingInput.value = value;
       });

       box.addEventListener('mouseover', () => {
           const star = box.querySelector('.reviewStar');
           updateStars(parseInt(star.dataset.value));
       });

       box.addEventListener('mouseout', () => {
           updateStars(lockedRating);
       });
   });
   
   function updateStars(value) {
       reviewStars.forEach(box => {
           const star = box.querySelector('.reviewStar');
           const val = parseInt(star.dataset.value);
           if (star) {
               star.classList.toggle('selected', val <= value);
           }
       });
   }
   
   // 3. Submit review via POST to ReviewsServlet
   reviewForm.addEventListener('submit', e => {
       e.preventDefault();
       const rating = parseInt(ratingInput.value);
       const comment = inputText.value.trim();
       if (!rating || !comment) {
           reviewError.style.display = 'block';
           return;
       }
       const formData = new URLSearchParams({
           usc_id: user.uscId,
           hall_id: hallId,
           rating: rating,
           comment: comment
       });
       fetch('../ReviewsServlet', {
           method: 'POST',
           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
           body: formData.toString()
       })
       .then(response => response.json())
       .then(data => {
           console.log(data);
           location.reload(); // Reload to show updated reviews (if you implement fetching later)
       })
       .catch(err => {
           console.error('Error submitting review:', err);
           alert('Something went wrong while submitting your review.');
       });
   });
   // Hide error when user clicks outside the form
   document.addEventListener('click', (event) => {
       if (!reviewForm.contains(event.target)) {
           reviewError.style.display = 'none';
       }
   });
});
document.addEventListener('DOMContentLoaded', () => {
   const hallId = 1; // EVK
   const existingReviews = document.getElementById('existingReviews');
   const overallRating = document.getElementById('overallRating');
   fetch('/DiningHall/GetReviewServlet?hall_id=1')
       .then(response => response.json())
       .then(reviews => {
           if (!Array.isArray(reviews)) {
               throw new Error("Invalid JSON response format");
           }
           existingReviews.innerHTML = ''; // Clear default/fallback reviews
           if (reviews.length === 0) {
               existingReviews.innerHTML = '<p>No reviews yet. Be the first to leave one!</p>';
               overallRating.textContent = '0.0';
               return;
           }
           let totalRating = 0;
           reviews.forEach(review => {
               totalRating += review.rating;
               const reviewItem = document.createElement('div');
               reviewItem.className = 'review-item';
               const header = document.createElement('div');
               header.className = 'review-header';
               const author = document.createElement('span');
               author.className = 'review-author';
               author.textContent = review.username;
               const stars = document.createElement('div');
               stars.className = 'review-rating';
               for (let i = 1; i <= 5; i++) {
                   const star = document.createElement('i');
                   star.className = i <= review.rating ? 'fas fa-heart' : 'far fa-heart';
                   stars.appendChild(star);
               }
               header.appendChild(author);
               header.appendChild(stars);
               const comment = document.createElement('p');
               comment.className = 'review-text';
               comment.textContent = review.comment;
               const date = document.createElement('p');
               date.className = 'review-date';
               date.style.fontSize = '0.8em';
               date.style.color = 'gray';
               date.textContent = `Posted on ${new Date(review.created_at).toLocaleString()}`;
               reviewItem.appendChild(header);
               reviewItem.appendChild(comment);
               reviewItem.appendChild(date);
               existingReviews.appendChild(reviewItem);
           });
           const avg = (totalRating / reviews.length).toFixed(1);
           overallRating.textContent = avg;
       })
       .catch(err => {
           console.error("Failed to load reviews:", err);
           existingReviews.innerHTML = '<p>Error loading reviews.</p>';
       });
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
}

// Show login prompt when user tries to use features when logged out
function showLoginPrompt(e) {
    if (e) e.stopPropagation();
    
    // Show login prompt with option to redirect
    if (confirm('You need to be logged in to use this feature. Would you like to log in now?')) {
        window.location.href = '../loginPage.html';
    }
}

// Save favorite to server/local storage
function saveFavorite(menuItem, isFavorite) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.uscId) {
        console.error('User not logged in or user ID not available');
        return;
    }
    
    console.log(`User ${user.uscId} ${isFavorite ? 'favorited' : 'unfavorited'} "${menuItem}"`);
    
    // Here you would send this data to your server to save in the database
    // For now, we'll store favorites in localStorage as an example
    let favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    
    // Initialize user favorites if they don't exist
    if (!favorites[user.uscId]) {
        favorites[user.uscId] = [];
    }
    
    if (isFavorite) {
        // Add to favorites if not already there
        if (!favorites[user.uscId].includes(menuItem)) {
            favorites[user.uscId].push(menuItem);
        }
    } else {
        // Remove from favorites
        favorites[user.uscId] = favorites[user.uscId].filter(item => item !== menuItem);
    }
    
    // Save back to localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Example AJAX call you would use to save to the database:
    /*
    fetch('../SaveFavoriteServlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `usc_id=${user.uscId}&menu_item=${encodeURIComponent(menuItem)}&is_favorite=${isFavorite}`
    })
    .then(response => response.json())
    .then(data => console.log('Favorite saved:', data))
    .catch(error => console.error('Error saving favorite:', error));
    */
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
			
			console.log(data);
            // Populate today's menu
            populateTodayMenu(data.evk[0]); // First index is today's menu
            
            // Setup the weekly calendar
            setupWeeklyCalendar(data.evk);
            
            // Enable favorites if user is logged in
            if (checkLoginStatus()) {
                enableFavorites();
            }
        })
        .catch(error => {
            console.error('Error fetching menu:', error);
            document.getElementById('menuEntry').innerHTML = '<p class="error-message">Failed to load menu data</p>';
            // Also log the specific error for debugging
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
            starBtn.innerHTML = '<i class="far fa-heart"></i>'; // Empty heart
            
            itemDiv.appendChild(mealSpan);
            itemDiv.appendChild(starBtn);
            itemsDiv.appendChild(itemDiv);
        });
        
        categoryDiv.appendChild(itemsDiv);
        menuEntry.appendChild(categoryDiv);
    });
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
                    starBtn.innerHTML = '<i class="far fa-heart"></i>'; // Empty heart
                    
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
}

function setupCrowdLevelIndicators() {
  const circles = Array.from(document.querySelectorAll('.crowdCircle'));
  const desc    = document.getElementById('crowdDescription');
  const levelMap = { LOW: 1, MED: 3, HIGH: 5 };

  //1) Initial load
  fetch('../ActivityReportServlet', { method: 'POST' })
    .then(res => res.json())
    .then(data => {
      const rec = data.find(e => e.hall_id === hallId) || {};
      const n   = levelMap[rec.activity_level] || 0;
      circles.forEach((c, i) =>
        c.textContent = i < n ? '●' : '○'
      );
      desc.textContent = rec.activity_level
        ? `(The dining hall is "${rec.activity_level.toLowerCase()}" busy)`
        : '(No occupancy data yet)';
    })
    .catch(() => {
      desc.textContent = '(Error loading occupancy)';
    });

  // 2) Click-to-submit
  circles.forEach((circle, idx) => {
    circle.addEventListener('click', () => {
      // for testing without login:
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const usc  = user.uscId || 12345;
      const lvl  = idx < 1 ? 'LOW' : idx < 3 ? 'MED' : 'HIGH';

      fetch('../SubmitActivityServlet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usc_id: usc,
          hall_id: hallId,
          activity_level: lvl
        })
      })
      .then(res => res.json())
      .then(r => {
        if (r.status === 'success') {
          const m = levelMap[lvl];
          circles.forEach((c, i) =>
            c.textContent = i < m ? '●' : '○'
          );
          desc.textContent = `(The dining hall is "${lvl.toLowerCase()}" busy)`;
        }
      })
      .catch(console.error);
    });
  });
}

//-----------------------------------------------------------------------------------------------------------------------------------------------
