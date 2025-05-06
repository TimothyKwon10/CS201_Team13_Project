-- ========================
-- SCHEMA: USC Dining Halls System
-- ========================
DROP DATABASE IF EXISTS dininghall;
CREATE DATABASE IF NOT EXISTS dininghall;
USE dininghall;

-- 1. Users
CREATE TABLE Users (
    usc_id INT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL
);

-- 2. Dining Halls
CREATE TABLE DiningHalls (
    hall_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- 3. Menus
CREATE TABLE Menus (
    menu_id INT PRIMARY KEY AUTO_INCREMENT,
    hall_id INT,
    week_start DATE,
    week_end DATE,
    FOREIGN KEY (hall_id) REFERENCES DiningHalls(hall_id)
);

-- 4. Meals
CREATE TABLE Meals (
    meal_id INT PRIMARY KEY AUTO_INCREMENT,
    menu_id INT,
    name VARCHAR(100) NOT NULL,
    day_of_week ENUM('Mon','Tue','Wed','Thu','Fri','Sat','Sun'),
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner'),
    FOREIGN KEY (menu_id) REFERENCES Menus(menu_id)
);

-- 5. Favorite Meals
CREATE TABLE FavoriteMeals (
    usc_id INT,
    meal_id INT,
    PRIMARY KEY (usc_id, meal_id),
    FOREIGN KEY (usc_id) REFERENCES Users(usc_id),
    FOREIGN KEY (meal_id) REFERENCES Meals(meal_id)
);

-- 6. Reviews
CREATE TABLE Reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    usc_id INT,
    hall_id INT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    upvotes INT DEFAULT 0,
    downvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usc_id) REFERENCES Users(usc_id),
    FOREIGN KEY (hall_id) REFERENCES DiningHalls(hall_id)
);

-- 7. Review Votes
CREATE TABLE ReviewVotes (
    review_id INT,
    usc_id INT,
    vote_type ENUM('up', 'down'),
    PRIMARY KEY (review_id, usc_id),
    FOREIGN KEY (review_id) REFERENCES Reviews(review_id),
    FOREIGN KEY (usc_id) REFERENCES Users(usc_id)
);

-- 8. Dining Hall Activity
CREATE TABLE DiningHallActivity (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    usc_id INT,
    hall_id INT,
    report_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activity_level ENUM('LOW', 'MED', 'HIGH'),
    FOREIGN KEY (usc_id) REFERENCES Users(usc_id),
    FOREIGN KEY (hall_id) REFERENCES DiningHalls(hall_id)
);

-- 9. Notifications
CREATE TABLE Notifications (
    notif_id INT PRIMARY KEY AUTO_INCREMENT,
    usc_id INT,
    meal_id INT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usc_id) REFERENCES Users(usc_id),
    FOREIGN KEY (meal_id) REFERENCES Meals(meal_id)
);

INSERT INTO DiningHalls (name) VALUES
  ('Everybody\'s Kitchen'),       
  ('USC Village Dining Hall'),   
  ('Parkside Kitchen and Grill'); 

SELECT * FROM DiningHalls;