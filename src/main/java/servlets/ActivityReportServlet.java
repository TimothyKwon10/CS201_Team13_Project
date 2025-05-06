package servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import util.DBConnection;

/**
 * Servlet implementation class ActivityReportServlet
 */
@WebServlet("/ActivityReportServlet")
public class ActivityReportServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ActivityReportServlet() {
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
	    try(Connection conn = DBConnection.getConnection()) {

	      String sql =
	        "SELECT h.hall_id, h.name, a.activity_level, a.report_time " +
	        "FROM DiningHalls h " +
	        "JOIN (" +
	        "SELECT hall_id, MAX(report_time) AS rt " +
	        "FROM DiningHallActivity GROUP BY hall_id" +
	        ") latest ON h.hall_id=latest.hall_id " +
	        "JOIN DiningHallActivity a " +
	        "ON a.hall_id=latest.hall_id AND a.report_time=latest.rt";

	      try(Statement s = conn.createStatement();
	          ResultSet rs = s.executeQuery(sql) ) {

	        JsonArray arr = new JsonArray();
	        
	        while(rs.next()) {
	          JsonObject o = new JsonObject();
	          o.addProperty("hall_id", rs.getInt   ("hall_id"));
	          o.addProperty("name", rs.getString("name"));
	          o.addProperty("activity_level", rs.getString("activity_level"));
	          o.addProperty("reported_at", rs.getTimestamp("report_time").toString());
	          arr.add(o);
	        }

	        response.getWriter().write(new Gson().toJson(arr));
	      }

	    } catch (SQLException e) {
	      response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
	      response.getWriter().write("{\"error\":\""+e.getMessage()+"\"}");
	    }
	}

}
