package servlets;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import util.DBConnection;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@WebServlet("/GetReviewServlet")
public class GetReviewServlet extends HttpServlet {
   private static final long serialVersionUID = 1L;
   public GetReviewServlet() {
       super();
   }
   @Override
   protected void doGet(HttpServletRequest request, HttpServletResponse response)
           throws ServletException, IOException {
   	
       response.setContentType("application/json");
       PrintWriter out = response.getWriter();
       String hallIdParam = request.getParameter("hall_id");
       if (hallIdParam == null) {
           response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
           out.write("{\"message\": \"Missing hall_id parameter\"}");
           return;
       }
       try {
           int hallId = Integer.parseInt(hallIdParam);
           try (Connection con = DBConnection.getConnection()) {
               String sql = "SELECT R.review_id, R.rating, R.comment, R.created_at, R.upvotes, R.downvotes, " +
                            "U.first_name, U.last_name " +
                            "FROM Reviews R " +
                            "JOIN Users U ON R.usc_id = U.usc_id " +
                            "WHERE R.hall_id = ? " +
                            "ORDER BY R.created_at DESC";
               PreparedStatement ps = con.prepareStatement(sql);
               ps.setInt(1, hallId);
               ResultSet rs = ps.executeQuery();
               StringBuilder json = new StringBuilder("[");
               boolean first = true;
               while (rs.next()) {
                   if (!first) json.append(",");
                   first = false;
                   String username = rs.getString("first_name") + " " + rs.getString("last_name");
                   int rating = rs.getInt("rating");
                   String comment = rs.getString("comment").replace("\"", "\\\"");
                   int upvotes = rs.getInt("upvotes");
                   int downvotes = rs.getInt("downvotes");
                   String createdAt = rs.getTimestamp("created_at").toString();
                   json.append("{")
                       .append("\"review_id\":").append(rs.getInt("review_id")).append(",")
                       .append("\"username\":\"").append(username).append("\",")
                       .append("\"rating\":").append(rating).append(",")
                       .append("\"comment\":\"").append(comment).append("\",")
                       .append("\"created_at\":\"").append(createdAt).append("\",")
                       .append("\"upvotes\":").append(upvotes).append(",")
                       .append("\"downvotes\":").append(downvotes)
                       .append("}");
               }
               json.append("]");
               out.write(json.toString());
           }
       } catch (NumberFormatException e) {
           response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
           out.write("{\"message\": \"Invalid hall_id parameter\"}");
       } catch (Exception e) {
           e.printStackTrace();
           response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
           out.write("{\"message\": \"Error retrieving reviews\"}");
       }
   }
}
