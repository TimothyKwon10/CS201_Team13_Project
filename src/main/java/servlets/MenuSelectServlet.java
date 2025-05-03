package servlets;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import MenuScraper.*;
import com.google.gson.Gson;

@WebServlet("/MenuSelectServlet")
public class MenuSelectServlet extends HttpServlet {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public MenuSelectServlet() {
		super();
	}
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		PrintWriter out = resp.getWriter();

		ResidentialDiningScraper scraper = new ResidentialDiningScraper();
		MenuObject todayMenu = scraper.parseMenus(scraper.fetchHTML("https://hospitality.usc.edu/residential-dining-menus/"));
		Gson gson = new Gson();
		
		String response = gson.toJson(todayMenu);
		
		out.print(response);
		
		out.flush();
		out.close();
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// TODO Auto-generated method stub
		super.doPost(req, resp);
	}
}