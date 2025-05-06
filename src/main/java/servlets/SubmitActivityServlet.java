package servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import util.DBConnection;

/**
 * Servlet implementation class SubmitActivityServlet
 */
@WebServlet("/SubmitActivityServlet")
public class SubmitActivityServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public SubmitActivityServlet() {
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
	    
	    try(BufferedReader reader = request.getReader();
	        Connection conn = DBConnection.getConnection()) {

	      JsonObject json = JsonParser.parseReader(reader).getAsJsonObject();
	      int uscId = json.get("usc_id").getAsInt();
	      int hallId = json.get("hall_id").getAsInt();
	      String level = json.get("activity_level").getAsString();

	      try ( PreparedStatement p = conn.prepareStatement("INSERT INTO DiningHallActivity(usc_id, hall_id, activity_level) VALUES(?,?,?)")) {
	        p.setInt(1, uscId);
	        p.setInt(2, hallId);
	        p.setString(3, level);
	        p.executeUpdate();
	      }

	      response.getWriter().write("{\"status\":\"success\"}");
	      response.setStatus(HttpServletResponse.SC_CREATED);
	    } 
	    catch(SQLException e) {
	      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	      response.getWriter().write("{\"error\":\""+e.getMessage()+"\"}");
	    }
	}

}
