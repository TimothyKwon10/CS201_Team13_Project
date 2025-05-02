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
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        String email = request.getParameter("email");
        String firstName = request.getParameter("first_name");
        String lastName = request.getParameter("last_name");
        int uscID = Integer.parseInt(request.getParameter("usc_id"));

        try (Connection con = DBConnection.getConnection()) {
            // Check if user already exists
            PreparedStatement checkStmt = con.prepareStatement("SELECT * FROM Users WHERE usc_id = ? OR email = ?");
            checkStmt.setInt(1, uscID);
            checkStmt.setString(2, email);
            ResultSet rs = checkStmt.executeQuery();

            if(rs.next()) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                out.println("{\"message\": \"User already exists.\"}");
                return;
            }

            PreparedStatement st = con.prepareStatement("INSERT INTO Users (usc_id, email, first_name, last_name) VALUES (?, ?, ?, ?)");
            st.setInt(1, uscID);
            st.setString(2, email);
            st.setString(3, firstName);
            st.setString(4, lastName);
            st.executeUpdate();

            out.println("{\"message\": \"Registration successful.\"}");
        } 
        catch(Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"Registration failed.\"}");
        }
	}

}
