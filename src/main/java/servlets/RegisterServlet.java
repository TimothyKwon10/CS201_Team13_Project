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

import util.DBConnection;

/**
 * Servlet implementation class RegisterServlet
 */
@WebServlet("/RegisterServlet")
public class RegisterServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public RegisterServlet() {
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
            // Get parameters and validate them
            String uscIdStr = request.getParameter("usc_id");
            String email = request.getParameter("email");
            String firstName = request.getParameter("first_name");
            String lastName = request.getParameter("last_name");
            String password = request.getParameter("password");
            
            // Basic validation
            if (uscIdStr == null || uscIdStr.trim().isEmpty() ||
                email == null || email.trim().isEmpty() ||
                firstName == null || firstName.trim().isEmpty() ||
                lastName == null || lastName.trim().isEmpty() ||
                password == null || password.trim().isEmpty()) {
                
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"message\": \"All fields are required.\"}");
                return;
            }
            
            // Parse USC ID safely
            Long uscID;
            try {
                uscID = Long.parseLong(uscIdStr);
            } catch (NumberFormatException e) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                out.println("{\"message\": \"USC ID must be a valid number.\"}");
                return;
            }

            try (Connection con = DBConnection.getConnection()) {
                if (con == null) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    out.println("{\"message\": \"Database connection failed.\"}");
                    return;
                }
                
                // Check if user already exists
                PreparedStatement checkStmt = con.prepareStatement("SELECT * FROM Users WHERE usc_id = ? OR email = ?");
                checkStmt.setLong(1, uscID);
                checkStmt.setString(2, email);
                ResultSet rs = checkStmt.executeQuery();

                if(rs.next()) {
                    response.setStatus(HttpServletResponse.SC_CONFLICT);
                    out.println("{\"message\": \"User already exists.\"}");
                    return;
                }

                // Insert new user
                PreparedStatement st = con.prepareStatement("INSERT INTO Users (usc_id, email, first_name, last_name, password) VALUES(?, ?, ?, ?, ?)");
                st.setLong(1, uscID);
                st.setString(2, email);
                st.setString(3, firstName);
                st.setString(4, lastName);
                st.setString(5, password);
                st.executeUpdate();

                out.println("{\"message\": \"Registration successful.\"}");
            } 
            catch(Exception e) {
                e.printStackTrace();
                System.err.println("Database error: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                out.println("{\"message\": \"Registration failed: " + e.getMessage().replace("\"", "'") + "\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"Registration failed due to server error.\"}");
        }
    }
}