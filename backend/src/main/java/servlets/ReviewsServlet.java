package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;

import util.DBConnection;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class ReviewsServlet
 */
@WebServlet("/ReviewsServlet")
public class ReviewsServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ReviewsServlet() {
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
			//subject to change, I have the table values for Reviews here
            int uscID = Integer.parseInt(request.getParameter("uscID"));
            int dininghallID = Integer.parseInt(request.getParameter("dininghallID"));
            int rating = Integer.parseInt(request.getParameter("rating"));
            String comment = request.getParameter("comment");
            
            try (Connection con = DBConnection.getConnection()) {
            	//updating reviews
            	PreparedStatement st = con.prepareStatement("INSERT INTO Reviews(USC_ID, Dining_Hall_ID, Rating, Comment) VALUES(?, ?, ?, ?)");
                st.setInt(1, uscID);
                st.setInt(2, dininghallID);
                st.setInt(3, rating);
                st.setString(4, comment);
                st.executeUpdate();
            }
            
            out.write("{\"message\": \"Review Submitted.\"}"); 
		}
		catch(Exception e){
			e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Could not submit review.\"}");
		}
	}

}
