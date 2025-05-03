package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import util.DBConnection;

/**
 * Servlet implementation class FavoriteMealServlet
 * Handles adding, removing, and retrieving favorite meals for users
 */
@WebServlet("/FavoriteMealServlet")
public class FavoriteMealServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public FavoriteMealServlet() {
        super();
    }

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     * Retrieves a user's favorite meals
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Get user's favorite meals
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Get user ID from request or session
            String uscIdStr = request.getParameter("usc_id");
            if (uscIdStr == null || uscIdStr.trim().isEmpty()) {
                // Try to get from session
                Object userObj = request.getSession().getAttribute("user");
                if (userObj != null) {
                    try {
                        // Assuming user object has a uscId field
                        uscIdStr = String.valueOf(userObj.toString());
                    } catch (Exception e) {
                        System.err.println("Error getting USC ID from session: " + e.getMessage());
                    }
                }
            }
            
            if (uscIdStr == null || uscIdStr.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"message\": \"USC ID is required.\", \"favorites\": []}");
                return;
            }
            
            int uscId = Integer.parseInt(uscIdStr.trim());
            System.out.println("Fetching favorites for USC ID: " + uscId);
            
            // Get user's favorites from database
            try (Connection con = DBConnection.getConnection()) {
                StringBuilder jsonBuilder = new StringBuilder();
                jsonBuilder.append("{\"favorites\": [");
                
                // Query to join FavoriteMeals with Meals to get meal names
                PreparedStatement st = con.prepareStatement(
                    "SELECT m.name FROM FavoriteMeals fm " +
                    "JOIN Meals m ON fm.meal_id = m.meal_id " +
                    "WHERE fm.usc_id = ?"
                );
                st.setInt(1, uscId);
                
                ResultSet rs = st.executeQuery();
                
                boolean first = true;
                while (rs.next()) {
                    if (!first) {
                        jsonBuilder.append(",");
                    }
                    String mealName = rs.getString("name");
                    jsonBuilder.append("\"").append(mealName.replace("\"", "\\\"")).append("\"");
                    first = false;
                }
                
                jsonBuilder.append("]}");
                String jsonResponse = jsonBuilder.toString();
                System.out.println("Sending response: " + jsonResponse);
                out.println(jsonResponse);
            }
        } catch (NumberFormatException e) {
            System.err.println("Invalid USC ID format: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Invalid USC ID format.\", \"favorites\": []}");
        } catch (SQLException e) {
            System.err.println("Database error: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"Database error occurred.\", \"favorites\": []}");
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"An error occurred.\", \"favorites\": []}");
        }
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     * Adds or removes a favorite meal for a user
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Add or remove a favorite meal
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Get parameters
            String uscIdStr = request.getParameter("usc_id");
            String mealName = request.getParameter("meal_name");
            String isFavoriteStr = request.getParameter("is_favorite");
            
            // Validate parameters
            if (uscIdStr == null || uscIdStr.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"message\": \"USC ID is required.\"}");
                return;
            }
            
            if (mealName == null || mealName.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"message\": \"Meal name is required.\"}");
                return;
            }
            
            if (isFavoriteStr == null || isFavoriteStr.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"message\": \"Favorite status is required.\"}");
                return;
            }
            
            int uscId = Integer.parseInt(uscIdStr.trim());
            mealName = mealName.trim();
            boolean isFavorite = "1".equals(isFavoriteStr) || "true".equalsIgnoreCase(isFavoriteStr);
            
            try (Connection con = DBConnection.getConnection()) {
                // First, get the meal_id (or create the meal if it doesn't exist)
                int mealId = getMealId(con, mealName);
                
                if (isFavorite) {
                    // Add to favorites
                    PreparedStatement st = con.prepareStatement(
                        "INSERT IGNORE INTO FavoriteMeals (usc_id, meal_id) VALUES (?, ?)"
                    );
                    st.setInt(1, uscId);
                    st.setInt(2, mealId);
                    
                    int rowsAffected = st.executeUpdate();
                    
                    if (rowsAffected > 0) {
                        out.println("{\"message\": \"Meal added to favorites.\", \"success\": true}");
                    } else {
                        out.println("{\"message\": \"Meal is already a favorite.\", \"success\": true}");
                    }
                } else {
                    // Remove from favorites
                    PreparedStatement st = con.prepareStatement(
                        "DELETE FROM FavoriteMeals WHERE usc_id = ? AND meal_id = ?"
                    );
                    st.setInt(1, uscId);
                    st.setInt(2, mealId);
                    
                    int rowsAffected = st.executeUpdate();
                    
                    if (rowsAffected > 0) {
                        out.println("{\"message\": \"Meal removed from favorites.\", \"success\": true}");
                    } else {
                        out.println("{\"message\": \"Meal was not in favorites.\", \"success\": true}");
                    }
                }
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("{\"message\": \"Invalid USC ID format.\", \"success\": false}");
        } catch (SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"Database error occurred: " + e.getMessage() + "\", \"success\": false}");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"An error occurred: " + e.getMessage() + "\", \"success\": false}");
        }
    }
    
    /**
     * Helper method to get or create a meal_id
     * @param con Database connection
     * @param mealName Name of the meal
     * @return meal_id from the database
     * @throws SQLException if database operation fails
     */
    private int getMealId(Connection con, String mealName) throws SQLException {
        // First try to get the meal_id if it exists
        PreparedStatement st = con.prepareStatement(
            "SELECT meal_id FROM Meals WHERE name = ?"
        );
        st.setString(1, mealName);
        
        ResultSet rs = st.executeQuery();
        if (rs.next()) {
            return rs.getInt("meal_id");
        }
        
        // If the meal doesn't exist, create it
        // Note: In a real application, you should include all required fields
        // For simplicity, we're just creating a basic meal record with default values
        st = con.prepareStatement(
            "INSERT INTO Meals (name, day_of_week, meal_type) VALUES (?, 'Mon', 'Breakfast')",
            PreparedStatement.RETURN_GENERATED_KEYS
        );
        st.setString(1, mealName);
        
        st.executeUpdate();
        
        // Get the generated meal_id
        ResultSet generatedKeys = st.getGeneratedKeys();
        if (generatedKeys.next()) {
            return generatedKeys.getInt(1);
        } else {
            throw new SQLException("Creating meal failed, no ID obtained.");
        }
    }
}