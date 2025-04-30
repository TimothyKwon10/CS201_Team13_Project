CREATE DATABASE IF NOT EXISTS db_usc_dining;
USE db_usc_dining;

CREATE TABLE IF NOT EXISTS user_information (
	USC_ID INT PRIMARY KEY,
    USC_Email VARCHAR(255) UNIQUE NOT NULL,
    First_Name VARCHAR(255) NOT NULL,
    Last_Name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS dining_hall_information (
	Dining_Hall_ID INT PRIMARY KEY AUTO_INCREMENT, 
    Dining_Hall_Name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS dining_hall_review(
	Review_ID INT PRIMARY KEY AUTO_INCREMENT,
    USC_ID INT NOT NULL,
    Dining_Hall_ID INT NOT NULL,
    Rating INT NOT NULL,
    Comment TEXT NULL,
    CONSTRAINT check_rating CHECK (rating BETWEEN 1 AND 5),
	CONSTRAINT fk_review_user FOREIGN KEY (USC_ID) REFERENCES user_information(USC_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_dining_hall FOREIGN KEY (Dining_Hall_ID) REFERENCES dining_hall_information(Dining_Hall_ID) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS dining_hall_activity(
	Report_ID INT PRIMARY KEY AUTO_INCREMENT,
	USC_ID INT NOT NULL,
    Dining_Hall_ID INT NOT NULL,
    Report_Timestamp TIMESTAMP NULL DEFAULT NULL,
    Activity_Level TEXT NOT NULL,
    CONSTRAINT check_activity_level CHECK (Activity_Level IN ('LOW', 'MED', 'HIGH')),
    CONSTRAINT fk_activity_user FOREIGN KEY (USC_ID) REFERENCES user_information(USC_ID) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_activity_dining_hall FOREIGN KEY (Dining_Hall_ID) REFERENCES dining_hall_information(Dining_Hall_ID) ON DELETE CASCADE ON UPDATE CASCADE
);
