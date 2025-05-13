package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import MenuScraper.*;
import com.google.gson.Gson;

@WebServlet("/MenuSelectServlet")
public class MenuSelectServlet extends HttpServlet {
	public MenuSelectServlet() {
		super();
	}
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		PrintWriter out = resp.getWriter();

		ResidentialDiningScraper scraper = new ResidentialDiningScraper();
		ArrayList<MenuObject> menus = new ArrayList<MenuObject>();
		String baseUrl = "https://hospitality.usc.edu/residential-dining-menus/";
		//MenuObject todayMenu = scraper.parseMenus(scraper.fetchHTML("https://hospitality.usc.edu/residential-dining-menus/"));
		
		SimpleDateFormat formatter = new SimpleDateFormat("MMMM d, yyyy");
        Calendar calendar = Calendar.getInstance(); // today's date
		
		for (int i = 0; i < 7; i++) {
            String formattedDate = formatter.format(calendar.getTime());
            String encodedDate = URLEncoder.encode(formattedDate, StandardCharsets.UTF_8);
            String fullUrl = baseUrl + "?menu_date=" + encodedDate;

            try {
                String html = scraper.fetchHTML(fullUrl);
                MenuObject menu = scraper.parseMenus(html);
                menus.add(menu);
            } catch (Exception e) {
                System.err.println("Failed to fetch or parse menu for " + formattedDate);
                e.printStackTrace();
            }

            calendar.add(Calendar.DATE, 1);
        }
		
		Gson gson = new Gson();
		
		String response = gson.toJson(menus);
		
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