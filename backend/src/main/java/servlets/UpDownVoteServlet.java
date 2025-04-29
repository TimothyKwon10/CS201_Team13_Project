package servlets;

import util.DBConnection;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * Servlet implementation class UpDownVoteServlet
 */
@WebServlet("/UpDownVoteServlet")
public class UpDownVoteServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public UpDownVoteServlet() {
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
        	//subject to change, tables values for Vote table
            int uscID = Integer.parseInt(request.getParameter("uscID"));
            int reviewID = Integer.parseInt(request.getParameter("reviewID"));
            String UpDown = request.getParameter("UpDown");
            
            try(Connection con = DBConnection.getConnection()){
            	PreparedStatement st = con.prepareStatement("SELECT * FROM Votes WHERE USC_ID=? AND Review_ID=?");
            	st.setInt(1, uscID);
            	st.setInt(2, reviewID);
            	
            	//prevent multiple clicks on it, can only down/upvote once
            	ResultSet rs = st.executeQuery();
            	if(rs.next()) {
            		out.println("{\"message\": \"You already voted.\"}");
            		return;
            	}
            	
            	//updating votes sql table
            	PreparedStatement stI = con.prepareStatement("INSERT INTO Votes(USC_ID, Review_ID, Vote_Type) VALUES(?, ?, ?)");
            	stI.setInt(1, uscID);
            	stI.setInt(2, reviewID);
            	stI.setString(3, UpDown);
            	stI.executeUpdate();
            	
            	//now actually updating the amount of UP AND DOWN table values in Review table
            	String sqlInsert = "";
            	if(UpDown.equals("up")) sqlInsert = "UPDATE Reviews SET Upvotes=Upvotes+1 WHERE Review_ID=?";
            	else sqlInsert = "UPDATE Reviews SET Downvotes=Downvotes+1 WHERE Review_ID=?";
            	

            	PreparedStatement Reviewst = con.prepareStatement(sqlInsert);
            	Reviewst.setInt(1, reviewID);
            	Reviewst.executeUpdate();
            	
            	out.println("{\"message\": \"Up/DownVote submitted successfully!\"}");
            }
        }
        catch(Exception e) {
        	e.printStackTrace();
        	response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
	}

}
