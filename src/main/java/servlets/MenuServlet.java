package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import util.DBConnection;

/**
 * Servlet implementation class MenuServlet
 */
@WebServlet("/MenuServlet")
public class MenuServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public MenuServlet() {
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

        try {
            int hallId = Integer.parseInt(request.getParameter("hall_id"));
            String weekStart = request.getParameter("week_start"); //yyyy-mm-dd
            String weekEnd = request.getParameter("week_end");

            try (Connection con = DBConnection.getConnection()) {
                PreparedStatement st = con.prepareStatement("INSERT INTO Menus(hall_id, week_start, week_end) VALUES(?, ?, ?)");
                st.setInt(1, hallId);
                st.setDate(2, java.sql.Date.valueOf(weekStart));
                st.setDate(3, java.sql.Date.valueOf(weekEnd));
                st.executeUpdate();
            }

            out.println("{\"message\": \"Got the menu!\"}");
        } 
        catch(Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"Error uploading menu.\"}");
        }
	}

}
