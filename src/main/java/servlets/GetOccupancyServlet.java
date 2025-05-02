package servlets;

import util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Servlet implementation class GetOccupancyServlet
 */
@WebServlet("/getOccupancy")
public class GetOccupancyServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public GetOccupancyServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

    /**
     * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            String sql = "SELECT dining_hall_id, activity_level, COUNT(*) AS count " +
                         "FROM dining_hall_activity " +
                         "GROUP BY dining_hall_id, activity_level";

            ResultSet rs = stmt.executeQuery(sql);
            JSONArray jsonArray = new JSONArray();

            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("diningHallId", rs.getInt("dining_hall_id"));
                obj.put("activityLevel", rs.getString("activity_level"));
                obj.put("count", rs.getInt("count"));
                jsonArray.put(obj);
            }

            out.print(jsonArray.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"message\": \"Error retrieving occupancy data.\"}");
        }
    }
}
