package loginpage;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GooglePublicKeysManager;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.http.javanet.NetHttpTransport;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.sql.*;


@WebServlet("/AuthServlet")
public class AuthServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
	private static final String CLIENT_ID = "419216182764-fo85vdkmt70j32hbvougpgoc6lenku7o.apps.googleusercontent.com";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String credential = request.getParameter("credential");

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JacksonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();

        GoogleIdToken idToken = null;
		try {
			idToken = verifier.verify(credential);
		} catch (GeneralSecurityException | IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();

            String email = payload.getEmail();
            boolean emailVerified = Boolean.valueOf(payload.getEmailVerified());

            if (emailVerified && email.endsWith("@usc.edu")) {
                // 👇 MYSQL DATABASE CHECK START
                String jdbcURL = "jdbc:mysql://localhost:3306/diningHalldb";
                String dbUser = "root";
                String dbPassword = "9ofharts";

                try {
                    Class.forName("com.mysql.cj.jdbc.Driver");
                    Connection connection = DriverManager.getConnection(jdbcURL, dbUser, dbPassword);

                    String checkUserSql = "SELECT * FROM users WHERE email = ?";
                    PreparedStatement checkStmt = connection.prepareStatement(checkUserSql);
                    checkStmt.setString(1, email);

                    ResultSet rs = checkStmt.executeQuery();

                    if (!rs.next()) {
                        String insertUserSql = "INSERT INTO users (email) VALUES (?)";
                        PreparedStatement insertStmt = connection.prepareStatement(insertUserSql);
                        insertStmt.setString(1, email);
                        insertStmt.executeUpdate();
                        insertStmt.close();
                    }

                    rs.close();
                    checkStmt.close();
                    connection.close();
                    
                } catch (Exception e) {
                    e.printStackTrace();
                }
                //MYSQL DATABASE CHECK END

                HttpSession session = request.getSession();
                session.setAttribute("user", email);
                response.sendRedirect("home.html");
            }
            else {
                // Not allowed
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized email");
            }
        } else {
            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid ID token");
        }
    }
}
