package servlets;

import util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;

/**
 * Servlet implementation class SubmitOccupancyServlet
 */
@WebServlet("/submitOccupancy")
public class SubmitOccupancyServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    /**
     * @see HttpServlet#HttpServlet()
     */
    public SubmitOccupancyServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

    /**
     * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
     */
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json");
        PrintWriter out = response.getWriter();

        try {
            int uscID = Integer.parseInt(request.getParameter("usc_id"));
            int diningHallID = Integer.parseInt(request.getParameter("dining_hall_id"));
            String activityLevel = request.getParameter("activity_level");

            try (Connection conn = DBConnection.getConnection()) {
                PreparedStatement stmt = conn.prepareStatement(
                        "INSERT INTO dining_hall_activity (usc_id, dining_hall_id, activity_level, report_timestamp) VALUES (?, ?, ?, NOW())"
                );
                stmt.setInt(1, uscID);
                stmt.setInt(2, diningHallID);
                stmt.setString(3, activityLevel.toUpperCase());
                stmt.executeUpdate();

                out.println("{\"message\": \"Occupancy report submitted successfully.\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.println("{\"message\": \"Error submitting occupancy report.\"}");
        }
    }
}
