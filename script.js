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
    const buffer = heroHeight/4;
  
    hero.style.opacity = Math.max(1 - scrollY /(heroHeight  + buffer), 0); //reduce opacity of hero section
});

//----------------------------------------------------CREATE DROPDOWN FUNCTIONALITY----------------------------------------------------//

searchBar.addEventListener('input', () => {
    dropdown.innerHTML = "";
    form.style.borderBottom = "none";

    const input = searchBar.value.toLowerCase();

    if (input === "") { //nothing is inputted yet
        dropdown.style.display = "none";
        return;
    }

    const filter = testData.filter(testData => testData.toLowerCase().includes(input)); //filters based on current search
    if (filter.length === 0) {//no search results appear
        const dropdownItem = document.createElement("div");

        dropdownItem.textContent = "There are no menu items with that name.";
        dropdownItem.style.color = "#757575"
        dropdownItem.className = "dropdownItem";

        dropdown.appendChild(dropdownItem);
    }
    else {
        for (let i = 0; i < filter.length; i++) {
            const dropdownItem = document.createElement("div"); 
            dropdownItem.className = "dropdownItem";

            const text = document.createElement("p");
            text.textContent = filter[i];
            text.className = "dropdownSizing";
            
            const favoriteIcon = document.createElement("span");
            favoriteIcon.innerHTML = "&#9734";
            favoriteIcon.className = "dropdownSizing";

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