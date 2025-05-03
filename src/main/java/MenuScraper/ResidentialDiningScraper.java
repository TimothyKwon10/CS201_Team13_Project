package MenuScraper;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.Scanner;

public class ResidentialDiningScraper {

    public static String fetchHTML(String targetUrl) throws IOException {
        URL url = new URL(targetUrl);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        Scanner scanner = new Scanner(connection.getInputStream());
        StringBuilder html = new StringBuilder();
        while (scanner.hasNextLine()) {
            html.append(scanner.nextLine()).append("\n");
        }
        scanner.close();
        return html.toString();
    }
      
    public static MenuObject parseMenus(String html) {
        Document doc = Jsoup.parse(html);
        MenuObject fullmenu = new MenuObject();
		ArrayList<ArrayList<MealCategory>> village = new ArrayList<ArrayList<MealCategory>>();
		ArrayList<ArrayList<MealCategory>> parkside = new ArrayList<ArrayList<MealCategory>>();
		ArrayList<ArrayList<MealCategory>> evk = new ArrayList<ArrayList<MealCategory>>();
        
    
        Elements times = doc.select(".hsp-accordian-container"); 
        for(Element time : times) {
        	
        	Elements loc = time.select(".col-sm-6"); 
        	int c = 0;
            for (Element menu : loc) {
            	ArrayList<MealCategory> menufortime = new ArrayList<MealCategory>();
            	
            	Elements headers = menu.select("h4");
                for (Element header : headers) {
                    Element next = header.nextElementSibling();
                    if (next != null && next.tagName().equals("ul") && next.hasClass("menu-item-list")) {
                        MealCategory category = new MealCategory();
                        category.title = header.text();
                        for (Element item : next.select("li")) {
                            category.meals.add(item.ownText());
                        }
                        menufortime.add(category);
                    }
                }
                if(c == 0) {
                	village.add(menufortime);
                } else if(c==1) {
                	parkside.add(menufortime);
                } else {
                	evk.add(menufortime);
                }
                c++;
            }
            
            
        }
        
        fullmenu.evk= evk;
        fullmenu.parkside = parkside;
        fullmenu.village = village;
        
        return fullmenu;
    }

    
}