package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

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
                PreparedStatement st = con.prepareStatement(
                    "SELECT * FROM Users WHERE email=? AND password=?"
                );
                st.setString(1, email);
                st.setString(2, password);
                
                ResultSet rs = st.executeQuery();
                
                if (rs.next()) {
                    // User authenticated successfully
                    // Get user details
                    Long uscId = rs.getLong("usc_id");
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
                    // Authentication failed
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    out.println("{\"message\": \"Invalid email or password.\"}");
                }
            }
        } catch (Exception e) {
            // Log the exception
            e.printStackTrace();
            
            // Send error response
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"Login failed due to a server error.\"}");
        }
    }
}