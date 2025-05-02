/*
package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/GetOccupancyServlet")
public class GetOccupancyServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        Connection conn = null;
        Statement stmt = null;

        try {
            conn = DBConnection.getConnection(); // Uses Darryl's DB connection
            stmt = conn.createStatement();

            String sql = "SELECT Dining_Hall_ID, Activity_Level, COUNT(*) AS count "
                       + "FROM dining_hall_activity "
                       + "GROUP BY Dining_Hall_ID, Activity_Level";

            ResultSet rs = stmt.executeQuery(sql);

            JSONArray jsonArray = new JSONArray();

            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("diningHallId", rs.getInt("Dining_Hall_ID"));
                obj.put("activityLevel", rs.getString("Activity_Level"));
                obj.put("count", rs.getInt("count"));
                jsonArray.put(obj);
            }

            out.print(jsonArray.toString());

        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"error\": \"" + e.getMessage() + "\"}");
        } finally {
            try { if (stmt != null) stmt.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }
    }
}
*/