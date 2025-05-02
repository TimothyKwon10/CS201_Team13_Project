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
            int uscID = Integer.parseInt(request.getParameter("usc_id"));
            int reviewID = Integer.parseInt(request.getParameter("review_id"));
            String UpDown = request.getParameter("vote_type");
            
            try(Connection con = DBConnection.getConnection()){
            	PreparedStatement st = con.prepareStatement("SELECT * FROM Votes WHERE usc_id=? AND review_id=?");
            	st.setInt(1, uscID);
            	st.setInt(2, reviewID);
            	
            	//prevent multiple clicks on it, can only down/upvote once
            	ResultSet rs = st.executeQuery();
            	if(rs.next()) {
            		out.println("{\"message\": \"You already voted.\"}");
            		return;
            	}
            	
            	//updating votes sql table
            	PreparedStatement stI = con.prepareStatement("INSERT INTO Votes(usc_id, review_id, vote_type) VALUES(?, ?, ?)");
            	stI.setInt(1, uscID);
            	stI.setInt(2, reviewID);
            	stI.setString(3, UpDown);
            	stI.executeUpdate();
            	
            	//now actually updating the amount of UP AND DOWN table values in Review table
            	String sqlInsert = "";
            	if(UpDown.equals("up")) sqlInsert = "UPDATE Reviews SET upvotes=upvotes+1 WHERE review_id=?";
            	else sqlInsert = "UPDATE Reviews SET downvotes=downvotes+1 WHERE review_id=?";
            	

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
