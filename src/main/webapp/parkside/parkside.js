const EVKButton = document.getElementById("EVKButton");
const villageButton = document.getElementById("villageButton");
const parksideButton = document.getElementById("parksideButton");

const searchBar = document.getElementById("searchBar");
const dropdown = document.getElementById("dropdown");
const form = document.getElementById("form");
const searchSection = document.getElementById("searchSection")
const clearButton = document.getElementById("clearButton");

const testData = ["lasagna", "ramen", "ragu", "pasta", "steak", "bulgogi", "ratatouille", "ramune", "raz", "rain", "ranky", "RAM", "rapper", "raont"];
//NEED DATABASE FOR POTENTIAL MENU ITEMS FOR EACH DINING HALL ^

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

function navigateTo(page){
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
		if(result.parkside[0].length != 0){
			const breakfastArray = result.parkside[0];
			menuEntry.innerText += "Breakfast:\n";
			for(var i in breakfastArray){
				menuEntry.innerText += breakfastArray[i].title;
				menuEntry.innerText += ": ";
				menuEntry.innerText += breakfastArray[i].meals[0];
				menuEntry.innerText += "\n";
			}
			
		}
		
		if(result.parkside[1].length != 0){
			menuEntry.innerText += "Brunch:\n";
			const brunchArray = result.parkside[1];
			for(var i in brunchArray){
				menuEntry.innerText += brunchArray[i].title;
				menuEntry.innerText += ": ";
				menuEntry.innerText += brunchArray[i].meals[0];
				menuEntry.innerText += "\n";
			}
		}
		
		if(result.parkside[2].length != 0){
			menuEntry.innerText += "Lunch:\n";
			const brunchArray = result.parkside[2];
			for(var i in brunchArray){
				menuEntry.innerText += brunchArray[i].title;
				menuEntry.innerText += ": ";
				menuEntry.innerText += brunchArray[i].meals[0];
				menuEntry.innerText += "\n";
			}
		}
		
		if(result.parkside[3].length != 0){
			menuEntry.innerText += "Dinner:\n";
			const brunchArray = result.parkside[3];
			for(var i in brunchArray){
				menuEntry.innerText += brunchArray[i].title;
				menuEntry.innerText += ": ";
				menuEntry.innerText += brunchArray[i].meals[0];
				menuEntry.innerText += "\n";
			}
		}
	}
}