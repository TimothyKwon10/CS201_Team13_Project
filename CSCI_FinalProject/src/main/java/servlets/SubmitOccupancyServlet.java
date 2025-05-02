package servlets;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;

import util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/submitOccupancy")
public class SubmitOccupancyServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String uscId = request.getParameter("uscId");
        String diningHallId = request.getParameter("diningHallId");
        String activityLevel = request.getParameter("activityLevel");

        Connection conn = null;
        PreparedStatement stmt = null;

        try {
            conn = DBConnection.getConnection(); // Uses Darryl's shared DB connection class

            String sql = "INSERT INTO dining_hall_activity (USC_ID, Dining_Hall_ID, Activity_Level, Report_Timestamp) "
                       + "VALUES (?, ?, ?, NOW())";

            stmt = conn.prepareStatement(sql);
            stmt.setInt(1, Integer.parseInt(uscId));
            stmt.setInt(2, Integer.parseInt(diningHallId));
            stmt.setString(3, activityLevel.toUpperCase());

            stmt.executeUpdate();
            response.getWriter().write("Success");

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().write("Error: " + e.getMessage());
        } finally {
            try { if (stmt != null) stmt.close(); } catch (Exception e) {}
            try { if (conn != null) conn.close(); } catch (Exception e) {}
        }
    }
}
