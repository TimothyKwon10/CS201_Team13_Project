package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.io.InputStream;
import java.io.IOException;
import java.io.File;
import java.io.FileInputStream;

public class DBConnection {
    private static String url;
    private static String user;
    private static String password;
    private static boolean configured = false;

    static {
        try {
            loadProperties();
        } catch (Exception e) {
            System.err.println("Error loading database properties: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Attempts to load properties using multiple strategies
     */
    private static void loadProperties() throws IOException {
        boolean loaded = false;
        
        // Strategy 1: Try to load directly from the classpath root
        try (InputStream input = DBConnection.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (input != null) {
                Properties prop = new Properties();
                prop.load(input);
                setPropertiesFromProp(prop);
                System.out.println("Loaded properties from classpath root");
                loaded = true;
            }
        } catch (Exception e) {
            System.err.println("Could not load properties from classpath root: " + e.getMessage());
        }
        
        // Strategy 2: Try to load from the config directory in classpath
        if (!loaded) {
            try (InputStream input = DBConnection.class.getClassLoader().getResourceAsStream("config/db.properties")) {
                if (input != null) {
                    Properties prop = new Properties();
                    prop.load(input);
                    setPropertiesFromProp(prop);
                    System.out.println("Loaded properties from config directory in classpath");
                    loaded = true;
                }
            } catch (Exception e) {
                System.err.println("Could not load properties from config directory: " + e.getMessage());
            }
        }
        
        // Strategy 3: Try to load using direct file paths relative to the project
        if (!loaded) {
            String[] paths = {
                "./config/db.properties",
                "../config/db.properties",
                "config/db.properties",
                System.getProperty("user.dir") + "/config/db.properties"
            };
            
            for (String path : paths) {
                File file = new File(path);
                if (file.exists() && file.isFile()) {
                    try (FileInputStream fis = new FileInputStream(file)) {
                        Properties prop = new Properties();
                        prop.load(fis);
                        setPropertiesFromProp(prop);
                        System.out.println("Loaded properties from file: " + file.getAbsolutePath());
                        loaded = true;
                        break;
                    } catch (Exception e) {
                        System.err.println("Error loading from " + path + ": " + e.getMessage());
                    }
                }
            }
        }
        
        if (!loaded) {
            System.err.println("WARNING: Could not load db.properties from any location!");
            System.err.println("Paths checked:");
            System.err.println("- Classpath root (db.properties)");
            System.err.println("- Classpath config directory (config/db.properties)");
            System.err.println("- File paths: ./config/db.properties, ../config/db.properties, etc.");
        }
    }
    
    /**
     * Set the database properties from a loaded Properties object
     */
    private static void setPropertiesFromProp(Properties prop) {
        url = prop.getProperty("db.url");
        user = prop.getProperty("db.user");
        password = prop.getProperty("db.password");
        
        // Print info about what was loaded (remove in production)
        System.out.println("Database properties loaded:");
        System.out.println("URL: " + url);
        System.out.println("User: " + user);
        System.out.println("Password: " + (password != null ? "[PROVIDED]" : "[NOT PROVIDED]"));
        
        configured = (url != null && user != null && password != null);
    }

    /**
     * Get a database connection using the properties from db.properties
     */
    public static Connection getConnection() throws SQLException {
        if (!configured) {
            throw new SQLException("Database connection is not properly configured. Please check that db.properties contains valid db.url, db.user, and db.password values.");
        }
        
        try {
            // Load JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC Driver not found. Please add it to your project libraries.", e);
        }
        
        return DriverManager.getConnection(url, user, password);
    }
}