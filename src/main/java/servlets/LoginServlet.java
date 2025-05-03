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
import javax.servlet.http.HttpSession;

import util.DBConnection;

/**
 * Servlet implementation class LoginServlet
 */
@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public LoginServlet() {
        super();
    }

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.getWriter().append("Served at: ").append(request.getContextPath());
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();
        
        try {
            // Get and validate parameters
            String email = request.getParameter("email");
            String password = request.getParameter("password");
            
            // Basic validation
            if (email == null || email.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"message\": \"Email is required.\"}");
                return;
            }
            
            if (password == null || password.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"message\": \"Password is required.\"}");
                return;
            }
            
            // Trim input
            email = email.trim();
            
            // Database connection and query
            try (Connection con = DBConnection.getConnection()) {
                if (con == null) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.println("{\"message\": \"Database connection failed.\"}");
                    return;
                }
                
                // Check if user exists and get their details
                PreparedStatement checkUser = con.prepareStatement(
                    "SELECT usc_id, first_name, last_name, password FROM Users WHERE email = ?"
                );
                checkUser.setString(1, email);
                
                ResultSet rs = checkUser.executeQuery();
                
                if (rs.next()) {
                    // User exists, verify password
                    String storedPassword = rs.getString("password");
                    
                    if (password.equals(storedPassword)) {
                        // Password matches
                        int uscId = rs.getInt("usc_id");
                        String firstName = rs.getString("first_name");
                        String lastName = rs.getString("last_name");
                        
                        // Create session
                        HttpSession session = request.getSession();
                        session.setAttribute("authenticated", true);
                        session.setAttribute("uscId", uscId);
                        session.setAttribute("email", email);
                        session.setAttribute("firstName", firstName);
                        session.setAttribute("lastName", lastName);
                        
                        // Send success response
                        out.println("{\"message\": \"Login successful.\", \"user\": {" +
                            "\"uscId\": " + uscId + ", " +
                            "\"email\": \"" + email + "\", " +
                            "\"firstName\": \"" + firstName + "\", " +
                            "\"lastName\": \"" + lastName + "\"}}");
                    } else {
                        // Password doesn't match
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        out.println("{\"message\": \"Invalid password.\"}");
                    }
                } else {
                    // User not found
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    out.println("{\"message\": \"User not found.\"}");
                }
            } catch (SQLException e) {
                // Log the SQL exception
                e.printStackTrace();
                System.err.println("Database error: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.println("{\"message\": \"Database error occurred.\"}");
            }
        } catch (Exception e) {
            // Log the exception
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"Login failed due to a server error.\"}");
        }
    }
}