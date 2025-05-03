const EVKButton = document.getElementById("EVKButton");
const villageButton = document.getElementById("villageButton");
const parksideButton = document.getElementById("parksideButton");

const searchBar = document.getElementById("searchBar");
const dropdown = document.getElementById("dropdown");
const form = document.getElementById("form");
const searchSection = document.getElementById("searchSection")
const clearButton = document.getElementById("clearButton");

//----------------------------------------------------HERO SCROLL FUNCTIONALITY----------------------------------------------------//

window.addEventListener('scroll', () => {
    const hero = document.getElementById("hero");
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight;
    const buffer = heroHeight/5;
  
    hero.style.opacity = Math.max(1 - scrollY /(heroHeight  + buffer), 0); //reduce opacity of hero section
});

//----------------------------------------------------CREATE DROPDOWN FUNCTIONALITY----------------------------------------------------//

searchBar.addEventListener('input', () => {
    dropdown.innerHTML = "";
    form.style.borderBottom = "none";

    const input = searchBar.value.toLowerCase();

    if (input === "") {
        dropdown.style.display = "none";
        return;
    }

    const filter = testData.filter(testData => testData.toLowerCase().includes(input));

    if (filter.length === 0) {
        const dropdownItem = document.createElement("div");
        dropdownItem.textContent = "There are no menu items with that name.";
        dropdownItem.style.color = "#757575";
        dropdownItem.className = "dropdownItem";
        dropdown.appendChild(dropdownItem);
    } else {
        for (let i = 0; i < filter.length; i++) {
            const dropdownItem = document.createElement("div"); 
            dropdownItem.className = "dropdownItem";

            const text = document.createElement("p");
            text.textContent = filter[i];
            text.className = "dropdownSizing";
            
            const favoriteIcon = document.createElement("button");
            favoriteIcon.innerHTML = "&#9734;"; // empty star
            favoriteIcon.className = "dropdownSizing star-btn";
            favoriteIcon.setAttribute('aria-label', 'Favorite');

            // ✅ Add toggle behavior just like the calendar
            favoriteIcon.addEventListener('click', () => {
                if (favoriteIcon.innerHTML === "☆") {
                    favoriteIcon.innerHTML = "&#9733;"; // filled star
                    favoriteIcon.style.color = "#f0a500";
                } else {
                    favoriteIcon.innerHTML = "&#9734;";
                    favoriteIcon.style.color = "#999";
                }
            });

            dropdownItem.appendChild(text);
            dropdownItem.appendChild(favoriteIcon);
            dropdown.appendChild(dropdownItem);
        }
    }

    form.style.borderBottom = "2px solid lightgray";
    dropdown.style.display = "block";
});

//----------------------------------------------------SUBMIT SEARCH FUNCTIONALITY----------------------------------------------------//

form.addEventListener('submit', (event) => {
    event.preventDefault();
    searchBar.blur();

    if (searchBar.value === "") {
        const dropdownItem = document.createElement("div");
        dropdownItem.textContent = "Please search for a menu item.";
        dropdownItem.style.color = "#757575"
        dropdownItem.className = "dropdownItem";

        dropdown.appendChild(dropdownItem);
        form.style.borderBottom = "2px solid lightgray";
        dropdown.style.display = "block";
    }

    searchSection.style.border = "4px solid #990001";
});

//----------------------------------------------------CLEAR SEARCH FUNCTIONALITY----------------------------------------------------//

function clearSearch() {
    searchBar.value = "";
    searchSection.style.border = "2px solid lightgray";
    dropdown.innerHTML = "";
    form.style.borderBottom = "none";
}

clearButton.addEventListener('click', (event) => {
    event.preventDefault();

    clearSearch();
});

document.addEventListener('click', (event) => {
    if (!form.contains(event.target) && !dropdown.contains(event.target)) {
        clearSearch();
    }
});

//----------------------------------------------------STAR REVIEW FUNCTIONALITY----------------------------------------------------//

const hitBoxes =  document.querySelectorAll(".hitBox");
const inputText = document.getElementById("inputText");
const reviewStar = document.querySelectorAll(".reviewStar");
const starInput = document.getElementById("rating");
const ratingForm = document.getElementById("rate");
let lockedRating = 0;

hitBoxes.forEach(hitbox => {
    hitbox.addEventListener('click', () => {
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
    if (!starInput.value) {
        event.preventDefault();
        const reviewError = document.getElementById("reviewError");
        reviewError.style.display = "block";
    }
    else {
        event.preventDefault();

        inputText.value = "";
        starInput.value = null;
        lockedRating = 0;
        reviewStar.forEach(s => {
            s.classList.remove('selected');
        });
    }
});

document.addEventListener('click', (event) => {
    if (!ratingForm.contains(event.target)) {
        const reviewError = document.getElementById("reviewError");
        reviewError.style.display = "none";
    }
});

//----------------------------------------------------CALENDAR FUNCTIONALITY----------------------------------------------------//

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const placeholderMenu = ['Grilled Chicken', 'Caesar Salad', 'Pasta Primavera'];

const calendar = document.getElementById('calendar');

days.forEach(day => {
  const dayDiv = document.createElement('div');
  dayDiv.className = 'day';

  const title = document.createElement('h3');
  title.textContent = day;
  dayDiv.appendChild(title);

  placeholderMenu.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';

    const itemText = document.createElement('span');
    itemText.textContent = item;

    const starBtn = document.createElement('button');
    starBtn.innerHTML = '&#9734;'; // Empty star ☆
    starBtn.className = 'star-btn';
    starBtn.setAttribute('aria-label', 'Favorite');

    // Toggle between empty (☆) and filled (★) star
    starBtn.addEventListener('click', () => {
      if (starBtn.innerHTML === '☆') {
        starBtn.innerHTML = '&#9733;'; // Filled star ★
        starBtn.style.color = '#f0a500';
      } else {
        starBtn.innerHTML = '&#9734;';
        starBtn.style.color = '#999';
      }
    });

    menuItem.appendChild(itemText);
    menuItem.appendChild(starBtn);
    dayDiv.appendChild(menuItem);
  });

  calendar.appendChild(dayDiv);
});


//Navigation

function navigateTo(page){
	console.log("attempting to nav");
	if (page === 'evk') {
		window.location.href = '../EVK/EVK.html';
	} else if (page === 'village') {
		window.location.href = '../village/village.html';
	} else if (page === 'parkside') {
		window.location.href = '../parkside/parkside.html';
	} else if(page === 'homes'){
		window.location.href = '../HomePage.html';
	}
}
/*
async function menuSetup(){
	event.preventDefault();
	const url = window.location.origin + "/DiningHall_Backend/MenuSelectServlet";
	const menuEntry = document.getElementById('menuEntry');
	
	const response = await fetch(url, {method:'GET'});
	
	if(!response.ok){
		const result = await response.text();
		return;
	} else {
		const result = await response.json();
		console.log(result);
		
		menuEntry.innerText = "";
		if(result.village[0].length != 0){
			const breakfastArray = result.village[0];
			menuEntry.innerText += "Breakfast:\n";
			for(var i in breakfastArray){
				menuEntry.innerText += breakfastArray[i].title;
				menuEntry.innerText += ": ";
				menuEntry.innerText += breakfastArray[i].meals[0];
				menuEntry.innerText += "\n";
			}
			
		}
		
		if(result.village[1].length != 0){
			menuEntry.innerText += "Brunch:\n";
			const brunchArray = result.village[1];
			for(var i in brunchArray){
				menuEntry.innerText += brunchArray[i].title;
				menuEntry.innerText += ": ";
				menuEntry.innerText += brunchArray[i].meals[0];
				menuEntry.innerText += "\n";
			}
		}
		
		if(result.village[2].length != 0){
			menuEntry.innerText += "Lunch:\n";
			const brunchArray = result.village[2];
			for(var i in brunchArray){
				menuEntry.innerText += brunchArray[i].title;
				menuEntry.innerText += ": ";
				menuEntry.innerText += brunchArray[i].meals[0];
				menuEntry.innerText += "\n";
			}
		}
		
		if(result.village[3].length != 0){
			menuEntry.innerText += "Dinner:\n";
			const brunchArray = result.village[3];
			for(var i in brunchArray){
				menuEntry.innerText += brunchArray[i].title;
				menuEntry.innerText += ": ";
				menuEntry.innerText += brunchArray[i].meals[0];
				menuEntry.innerText += "\n";
			}
		}
	}
}
*/

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
    
    // Disable favoriting across all star buttons
    document.querySelectorAll('.star-btn').forEach(btn => {
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
            if (!data || !data.village) {
                throw new Error('Invalid menu data received');
            }
            // Populate today's menu
            populateTodayMenu(data.village[0]); // First index is today's menu
            
            // Setup the weekly calendar
            setupWeeklyCalendar(data.village);
            
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
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Create a day div for each day of the week
    days.forEach((day, index) => {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        
        // Add day title
        const title = document.createElement('h3');
        title.textContent = day;
        dayDiv.appendChild(title);
        
        // Get menu data for this day
        const dayMenu = weeklyMenu[index];
        if (dayMenu) {
            // For each category in the day's menu
            dayMenu.forEach(category => {
                // Add category title
                const categoryTitle = document.createElement('h4');
                categoryTitle.textContent = category.title;
                categoryTitle.className = 'category-title';
                dayDiv.appendChild(categoryTitle);
                
                // Add menu items
                category.meals.forEach(meal => {
                    const menuItem = document.createElement('div');
                    menuItem.className = 'menu-item';
                    
                    const itemText = document.createElement('span');
                    itemText.textContent = meal;
                    
                    const starBtn = document.createElement('button');
                    starBtn.className = 'star-btn';
                    starBtn.innerHTML = '<i class="far fa-heart"></i>'; // Empty heart by default
                    starBtn.style.color = "#999";
                    
                    menuItem.appendChild(itemText);
                    menuItem.appendChild(starBtn);
                    dayDiv.appendChild(menuItem);
                });
            });
        }
        
        calendar.appendChild(dayDiv);
    });
    
    // Enable favorites and update display
    if (checkLoginStatus()) {
        enableFavorites();
        updateFavoritesDisplay();
    }
}