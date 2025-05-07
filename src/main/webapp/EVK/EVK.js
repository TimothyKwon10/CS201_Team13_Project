// detect your WAR’s context path (e.g. "/DiningHall" or whatever your app folder is)
const contextPath = window.location.pathname.split('/')[1]
  ? '/' + window.location.pathname.split('/')[1]
  : '';

const EVKButton = document.getElementById("EVKButton");
const villageButton = document.getElementById("villageButton");
const parksideButton = document.getElementById("parksideButton");

const searchBar = document.getElementById("searchBar");
const dropdown = document.getElementById("dropdown");
const form = document.getElementById("form");
const searchSection = document.getElementById("searchSection");
const clearButton = document.getElementById("clearButton");

const hallId = parseInt(document.body.dataset.hallId, 10);

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    menuSetup();
    setupSearchFunctionality();
    setupCrowdLevelIndicators();
    loadReviews();
});

// Check login status and update UI
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    updateHeaderLoginStatus(isLoggedIn, user);
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
    if (localStorage.getItem('isLoggedIn') !== 'true') return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uscId) return;
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    const userFavorites = favorites[user.uscId] || [];
    document.querySelectorAll('.menu-item .star-btn').forEach(btn => {
        const menuItem = btn.parentNode.querySelector('span').textContent.trim();
        if (userFavorites.includes(menuItem)) {
            btn.innerHTML = '<i class="fas fa-heart"></i>';
            btn.style.color = "#990001";
        } else {
            btn.innerHTML = '<i class="far fa-heart"></i>';
            btn.style.color = "#999";
        }
    });
}

function updateHeaderLoginStatus(isLoggedIn, user) {
    const rightHeader = document.getElementById('rightHeader');
    const signInBtn = document.getElementById('signInBtn');
    const signUpBtn = document.getElementById('signUpBtn');
    if (isLoggedIn && user) {
        if (signInBtn) signInBtn.style.display = 'none';
        if (signUpBtn) signUpBtn.style.display = 'none';
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
            welcomeMsg.style.fontSize = "14px";
            welcomeMsg.style.fontWeight = "normal";
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'LOGOUT';
            logoutBtn.className = 'btn-auth';
            logoutBtn.id = 'logoutBtn';
            logoutBtn.addEventListener('click', logout);
            userInfo.appendChild(welcomeMsg);
            userInfo.appendChild(logoutBtn);
            rightHeader.appendChild(userInfo);
        }
    } else {
        if (signInBtn) signInBtn.style.display = 'block';
        if (signUpBtn) signUpBtn.style.display = 'block';
        const userInfo = document.getElementById('userInfo');
        if (userInfo) rightHeader.removeChild(userInfo);
    }
}

// Enable favorite functionality for logged-in users
function enableFavorites() {
    enableDropdownFavorites();
    document.querySelectorAll('.meal-tag').forEach(tag => {
        tag.classList.remove('disabled');
        const newTag = tag.cloneNode(true);
        tag.parentNode.replaceChild(newTag, tag);
        newTag.addEventListener('click', function() {
            const heartIcon = this.querySelector('i');
            if (heartIcon.classList.contains('far')) {
                heartIcon.classList.replace('far','fas');
                this.classList.add('favorited');
                saveFavorite(this.textContent.trim(), true);
            } else {
                heartIcon.classList.replace('fas','far');
                this.classList.remove('favorited');
                saveFavorite(this.textContent.trim(), false);
            }
        });
    });
    enableCalendarFavorites();
    if (document.getElementById('rate')) {
        document.getElementById('inputText').disabled = false;
        document.getElementById('inputText').placeholder = "Please leave a review:";
        document.getElementById('submitButton').disabled = false;
    }
}

function enableDropdownFavorites() {
    document.querySelectorAll('.star-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const menuItem = this.parentNode.querySelector('span, p').textContent.trim();
            if (this.innerHTML.includes("far")) {
                this.innerHTML = '<i class="fas fa-heart"></i>';
                this.style.color = "#990001";
                saveFavorite(menuItem, true);
            } else {
                this.innerHTML = '<i class="far fa-heart"></i>';
                this.style.color = "#999";
                saveFavorite(menuItem, false);
            }
        });
        newBtn.style.cursor = 'pointer';
    });
}

function enableCalendarFavorites() {
    document.querySelectorAll('.menu-item .star-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const menuItem = this.parentNode.querySelector('span').textContent.trim();
            if (this.innerHTML.includes("far")) {
                this.innerHTML = '<i class="fas fa-heart"></i>';
                this.style.color = "#990001";
                saveFavorite(menuItem, true);
            } else {
                this.innerHTML = '<i class="far fa-heart"></i>';
                this.style.color = "#999";
                saveFavorite(menuItem, false);
            }
        });
        newBtn.style.cursor = 'pointer';
    });
}

function disableFavorites() {
    document.querySelectorAll('.star-btn, .meal-tag').forEach(el => {
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        newEl.style.cursor = 'not-allowed';
        newEl.addEventListener('click', showLoginPrompt);
    });
    if (document.getElementById('rate')) {
        document.getElementById('inputText').disabled = true;
        document.getElementById('inputText').placeholder = "Please log in to leave a review";
        document.getElementById('submitButton').disabled = true;
    }
}

function showLoginPrompt() {
    localStorage.setItem('redirectUrl', window.location.href);
    window.location.href = '../loginPage.html';
}

function saveFavorite(mealName, isFavorite) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.uscId) return console.error('User not logged in');
    const favorites = JSON.parse(localStorage.getItem('userFavorites') || '{}');
    favorites[user.uscId] = favorites[user.uscId] || [];
    if (isFavorite && !favorites[user.uscId].includes(mealName)) {
        favorites[user.uscId].push(mealName);
    } else if (!isFavorite) {
        favorites[user.uscId] = favorites[user.uscId].filter(i => i !== mealName);
    }
    localStorage.setItem('userFavorites', JSON.stringify(favorites));
    fetch(`${contextPath}/FavoriteMealServlet`, {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: new URLSearchParams({ usc_id: user.uscId, meal_name: mealName, is_favorite: isFavorite ? '1':'0' })
    }).catch(console.error);
}

function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    window.location.href = '../HomePage.html';
}

// HERO SCROLL
window.addEventListener('scroll', () => {
    const hero = document.getElementById("hero");
    const opacity = 1 - window.scrollY / (hero.offsetHeight * 1.2);
    hero.style.opacity = Math.max(opacity, 0);
});

// SEARCH
function getAllMenuItems() {
    return Array.from(document.querySelectorAll('.menu-item span'))
        .map(s => s.textContent.trim());
}

function setupSearchFunctionality() {
    form.addEventListener('submit', e => e.preventDefault());
    clearButton.addEventListener('click', clearSearch);
    searchBar.addEventListener('input', () => {
        const term = searchBar.value.toLowerCase().trim();
        dropdown.innerHTML = '';
        if (!term) return dropdown.classList.remove('visible');
        const items = new Set([
            ...getAllMenuItems(),
            ...Array.from(document.querySelectorAll('.meal-item span')).map(s=>s.textContent.trim())
        ]);
        const matches = Array.from(items).filter(i=>i.toLowerCase().includes(term));
        if (matches.length) {
            matches.forEach(item => {
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                const span = document.createElement('span');
                span.textContent = item;
                const btn = document.createElement('button');
                btn.className = 'star-btn';
                btn.addEventListener('click', e => {
                    e.stopPropagation();
                    checkLoginStatus() ? saveFavorite(item, !btn.innerHTML.includes('fas')) : showLoginPrompt();
                });
                div.append(span, btn);
                dropdown.appendChild(div);
            });
        } else {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.textContent = 'No matching items found';
            dropdown.appendChild(div);
        }
        dropdown.classList.add('visible');
    });
    document.addEventListener('click', e => {
        if (!searchBar.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('visible');
        }
    });
}

function clearSearch() {
    searchBar.value = '';
    dropdown.innerHTML = '';
    dropdown.classList.remove('visible');
}

// MENU
function menuSetup() {
    fetch(`${contextPath}/MenuSelectServlet`)
      .then(r => r.json())
      .then(data => {
        if (!data.evk) throw new Error('Menu fetch failed');
        populateTodayMenu(data.evk[0]);
        setupWeeklyCalendar(data.evk);
        if (checkLoginStatus()) enableFavorites();
      })
      .catch(err => {
        console.error('Error fetching menu:', err);
        document.getElementById('menuEntry').innerHTML =
          '<p class="error-message">Failed to load menu data</p>';
      });
}

function populateTodayMenu(menuData) {
    const menuEntry = document.getElementById('menuEntry');
    menuEntry.innerHTML = '';
    menuData.forEach(cat => {
        const cd = document.createElement('div');
        cd.className = 'menu-category';
        const h2 = document.createElement('h2');
        h2.className = 'category-title';
        h2.textContent = cat.title;
        cd.appendChild(h2);
        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'menu-items';
        cat.meals.forEach(meal => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'menu-item';
            const span = document.createElement('span');
            span.textContent = meal;
            const btn = document.createElement('button');
            btn.className = 'star-btn';
            itemsDiv.append(span, btn);
            itemDiv.appendChild(span);
            itemDiv.appendChild(btn);
            itemsDiv.appendChild(itemDiv);
        });
        cd.appendChild(itemsDiv);
        menuEntry.appendChild(cd);
    });
}

function setupWeeklyCalendar(weeklyMenu) {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = new Date().getDay();
    weeklyMenu.forEach((dayMenu, i) => {
        const dayDiv = document.createElement('div'); dayDiv.className = 'day';
        const h3 = document.createElement('h3');
        h3.className = 'day-header';
        h3.textContent = days[i] + (i===today?' (Today)':'');
        dayDiv.appendChild(h3);
        const dm = document.createElement('div'); dm.className = 'day-menu';
        (dayMenu||[]).forEach(cat => {
            const cd = document.createElement('div');
            cd.className = 'meal-category';
            const h4 = document.createElement('h4');
            h4.className = 'meal-category-title';
            h4.textContent = cat.title;
            cd.appendChild(h4);
            const mi = document.createElement('div'); mi.className = 'meal-items';
            cat.meals.forEach(meal => {
                const md = document.createElement('div'); md.className = 'meal-item';
                const ms = document.createElement('span'); ms.textContent = meal;
                const mb = document.createElement('button'); mb.className = 'star-btn';
                md.appendChild(ms); md.appendChild(mb); mi.appendChild(md);
            });
            cd.appendChild(mi); dm.appendChild(cd);
        });
        if (!dayMenu) dm.innerHTML = '<p class="no-menu">Menu not available</p>';
        dayDiv.appendChild(dm); calendar.appendChild(dayDiv);
    });
}

// CROWD
function setupCrowdLevelIndicators() {
    const circles = Array.from(document.querySelectorAll('.crowdCircle'));
    const desc    = document.getElementById('crowdDescription');
    const levelMap = { LOW: 1, MED: 3, HIGH: 5 };

    // initial load
	fetch(`${contextPath}/ActivityReportServlet`, { method: 'POST' })
	  .then(r => r.json())
	  .then(data => {
	    const rec = data.find(e => e.hall_id === hallId) || {};
	    const n   = levelMap[rec.activity_level] || 0;
	    circles.forEach((c, i) => c.textContent = i < n ? '●' : '○');
	    desc.textContent = rec.activity_level
	      ? `(The dining hall is "${rec.activity_level.toLowerCase()}" busy)`
	      : '(No occupancy data yet)';
	  })
	  .catch(err => {
	    console.error('Error loading occupancy:', err);
	    desc.textContent = '(Error loading occupancy)';
	  });

    // click-to-submit
    circles.forEach((c,idx)=>{
      c.addEventListener('click',()=>{
        const user = JSON.parse(localStorage.getItem('user')||'{}');
        const usc = user.uscId;
        const lvl = idx<1?'LOW':idx<3?'MED':'HIGH';
        fetch(`${contextPath}/SubmitActivityServlet`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({usc_id:usc,hall_id:hallId,activity_level:lvl})
        })
        .then(r=>r.json())
        .then(resp=>{
          if(resp.status==='success'){
            const m=levelMap[lvl];
            circles.forEach((cc,i)=>cc.textContent=i<m?'●':'○');
            desc.textContent=`(The dining hall is "${lvl.toLowerCase()}" busy)`;
          }
        })
        .catch(console.error);
      });
    });
}

// REVIEWS
function loadReviews() {
    const container = document.getElementById('existingReviews');
    const overall   = document.getElementById('overallRating');

    fetch(`${contextPath}/GetReviewServlet?hall_id=${hallId}`)
      .then(r => r.json())
      .then(reviews => {
        container.innerHTML = '';
        if (!Array.isArray(reviews)||!reviews.length) {
          container.innerHTML='<p>No reviews yet. Be the first!</p>';
          overall.textContent='0.0';
          return;
        }
        let sum=0;
        reviews.forEach(r=>{
          sum+=r.rating;
          const card=document.createElement('div');
          card.className='review-card';
          const stars='★'.repeat(r.rating)+'☆'.repeat(5-r.rating);
          card.innerHTML=`<div class="review-stars">${stars}</div>
            <p>${r.comment}</p>
            <small>by ${r.first_name} ${r.last_name} @ ${new Date(r.created_at).toLocaleString()}</small>`;
          container.appendChild(card);
        });
        overall.textContent=(sum/reviews.length).toFixed(1);
      })
      .catch(err=>{
        console.error('Error loading reviews:',err);
        container.innerHTML='<p>(Error loading reviews)</p>';
        overall.textContent='0.0';
      });
}
