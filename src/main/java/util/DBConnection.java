package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.io.InputStream;
import java.io.IOException;

public class DBConnection {
    private static String url;
    private static String user;
    private static String password;

    static {
    	//taking from db.properties where the database name, user, password is stored
        try(InputStream input = DBConnection.class.getClassLoader().getResourceAsStream("config/db.properties")) {
            Properties prop = new Properties();
            if(input != null) {
                prop.load(input);
                url = prop.getProperty("db.url");
                user = prop.getProperty("db.user");
                password = prop.getProperty("db.password");
            } 
            else {
                System.err.println("File could not be found.");
            }
        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }

    public static Connection getConnection() throws SQLException {
        if(url == null || user == null || password == null) {
            throw new SQLException("Fill in db.properties properly please!");
        }
        return DriverManager.getConnection(url, user, password);
    }
}
