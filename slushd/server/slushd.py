from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from models import *

class Points(webapp.RequestHandler):
  def get(self):
    self.response.out.write('<html><head></head><body>')
    points = Point.all()

    if points:
      self.response.out.write('<table cellpadding="2" cellspacing="1" border="0">')
      self.response.out.write('<tr><th bgcolor="#cccccc">cell id</th><th bgcolor="#cccccc">LAC</th><th bgcolor="#cccccc">GeoPoint</th></tr>')

      for point in points:
        self.response.out.write('<tr>')
        self.response.out.write('<td bgcolor="#eeeeee">%s</td>' % point.cell.cell_id)
        self.response.out.write('<td bgcolor="#eeeeee">%s</td>' % point.location_area.location_area_code)
        self.response.out.write('<td bgcolor="#eeeeee">%s</td>' % point.gps_location)
        self.response.out.write('</tr>')
      self.response.out.write('</table>')
    self.response.out.write("""
        </body>
      </html>""")

class Cells(webapp.RequestHandler):
  def get(self):
    self.response.out.write('<html><head></head><body>')
    cells = Cell.all().order('-date_created')

    if cells:
      
      self.response.out.write('<table cellpadding="2" cellspacing="1" border="0">')
      self.response.out.write('<tr><th bgcolor="#cccccc">cell id</th><th bgcolor="#cccccc">date found</th></tr>')

      for cell in cells:
        self.response.out.write('<tr>')
        self.response.out.write('<td bgcolor="#eeeeee"><a href="/cell/?cell='+str(cell.key())+'">'+cell.cell_id+'</a></td>')
        self.response.out.write('<td bgcolor="#eeeeee">%s</td>' % str(cell.date_created)[0:10])
        self.response.out.write('</tr>')
      self.response.out.write('</table>')
    self.response.out.write("""
        </body>
      </html>""")

class ViewCell(webapp.RequestHandler):
  def get(self):
    if self.request.get('cell'):

      # calculate computed location from all points
      cell = Cell.get(self.request.get('cell'))
      points = Point.gql("WHERE cell=:1 ORDER BY date_created", cell)
      computed_lat = 0
      computed_lon = 0

      # for fictional coverage circle on google map
      tmp_lat_small = points[0].gps_location.lat
      tmp_lon_small = points[0].gps_location.lon
      tmp_lat_large = points[0].gps_location.lat
      tmp_lon_large = points[0].gps_location.lon
      for point in points:
        computed_lat += point.gps_location.lat
        computed_lon += point.gps_location.lon

        # for fictional coverage circle on google map
        if point.gps_location.lat < tmp_lat_small:
          tmp_lat_small = point.gps_location.lat

        if point.gps_location.lon < tmp_lon_small:
          tmp_lon_small = point.gps_location.lon
          
        if point.gps_location.lat > tmp_lat_large:
          tmp_lat_large = point.gps_location.lat

        if point.gps_location.lon > tmp_lon_large:
          tmp_lon_large = point.gps_location.lon

#      computed_lat /= float(points.count())
#      computed_lon /= float(points.count())
      computed_lat = tmp_lat_small + ((tmp_lat_large - tmp_lat_small) / 2)
      computed_lon = tmp_lon_small + ((tmp_lon_large - tmp_lon_small) / 2)
      cell.computed_location = str(computed_lat)+','+str(computed_lon)
      cell.put()
      
      self.response.out.write("""

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Slushd GSM Cell Map</title>
    <script src="http://maps.google.com/maps?file=api&amp;v=2&amp;key=ABQIAAAAb5W9C1rg1PQ9V8v9J83iBRTyeksj_QFHSVkvlHoF-7fpqAIsQxSLEWdKrolM7kbx7bi7u0FNkxqCWA"
      type="text/javascript"></script>
    <script type="text/javascript">

    Number.prototype.toRad = function() {  // convert degrees to radians
      return this * Math.PI / 180;
    }

    //<![CDATA[

    function load() {
      if (GBrowserIsCompatible()) {
        map = new GMap2(document.getElementById("map"));
        map.addControl(new GSmallMapControl());
        map.addControl(new GMapTypeControl());
        drawCellCoverage();
      }
    }
    
    //]]>
      """)
      self.response.out.write("var lat1 = "+str(tmp_lat_small)+";");
      self.response.out.write("var lon1 = "+str(tmp_lon_small)+";");
      self.response.out.write("var lat2 = "+str(tmp_lat_large)+";");
      self.response.out.write("var lon2 = "+str(tmp_lon_large)+";");
      self.response.out.write("""
    </script>
  </head>
  <body onload="load()" onunload="GUnload()">

      """)

      if points:
        self.response.out.write('<div id="data" style="position:absolute; left:20px; top:20px; width: 460px; height: 500px"><h2>Points for CellID '+cell.cell_id+'</h2>')
        self.response.out.write('<table cellpadding="2" cellspacing="1" border="0">')
        self.response.out.write('<tr><th bgcolor="#cccccc">GPS point</th><th bgcolor="#cccccc">date found</th></tr>')

        for point in points:
          self.response.out.write('<tr>')
          self.response.out.write('<td bgcolor="#eeeeee"><a href="http://maps.google.com/maps?f=q&hl=en&q='+str(point.gps_location)+'">'+str(point.gps_location)+'</a></td>')
          self.response.out.write('<td bgcolor="#eeeeee">%s</td>' % str(point.date_created)[0:10])
          self.response.out.write('</tr>')
        self.response.out.write('</table></div>')

        self.response.out.write("""
        
    <script language='javascript'>
    function drawCellCoverage() {
      var polygon = new GPolygon([""")

        length = points.count()
        counter = 1
        startpoint = points[0]
        for point in points:
          if counter < length:
            self.response.out.write("new GLatLng("+str(point.gps_location)+"),")
          else:
            self.response.out.write("new GLatLng("+str(point.gps_location)+"),")
            self.response.out.write("new GLatLng("+str(startpoint.gps_location)+")")
          counter += 1
        self.response.out.write("""], "#2aff00", 3, 0.3, "#2aff00", 0.3);""")
        self.response.out.write("map.setCenter(new GLatLng("+str(startpoint.gps_location)+"), 15);")
        self.response.out.write("""
      map.addOverlay(polygon);
      var cell_latlng = new GLatLng(""")
      self.response.out.write(str(cell.computed_location))
      self.response.out.write(""");
      var cell = new GMarker(cell_latlng);
      map.addOverlay(cell);
      drawCircle(cell_latlng, calculateDistance(lat1,lon1,lat2,lon2)/2);
      
    }
    function drawCircle(center, radius, nodes, liColor, liWidth, liOpa, fillColor, fillOpa) {
      //calculating km/degree
      var latConv = center.distanceFrom(new GLatLng(center.lat()+0.1, center.lng()))/100;
      var lngConv = center.distanceFrom(new GLatLng(center.lat(), center.lng()+0.1))/100;
      //Loop 
      var points = [];
      var step = parseInt(360/nodes)||10;
      for(var i=0; i<=360; i+=step) {
        var pint = new GLatLng(center.lat() + (radius/latConv * Math.cos(i * Math.PI/180)), center.lng() + (radius/lngConv * Math.sin(i * Math.PI/180)));
        points.push(pint);
      }
      points.push(points[0]); // Closes the circle, thanks Martin
      var fillOpa = fillOpa||0.3;
      var liColor = liColor||"#ff0000";
      var fillColor = fillColor||liColor||"#ff0000";
      liWidth = liWidth||2;
      var poly = new GPolygon(points,liColor,liWidth,liOpa,fillColor,fillOpa);
      map.addOverlay(poly);
    }
    function calculateDistance(lat1,lon1,lat2,lon2) {
      var R = 6371; // km
      var dLat = (lat2-lat1).toRad();
      var dLon = (lon2-lon1).toRad(); 
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c;
      return d;
    }
    </script>

        """)
      self.response.out.write("""

    <div id="map" style="position:absolute; left:500px; top:20px; width: 500px; height: 500px"></div>
  </body>
</html>

      """)

class NewPoint(webapp.RequestHandler):
  def post(self):

    # first of all see that all values required are present
    if self.request.get('latitude') and self.request.get('longitude') and self.request.get('cell_id') and self.request.get('location_area_code') and self.request.get('mobile_country_code') and self.request.get('mobile_network_code'):
      # see if cell_id is known
      if self.request.get('cell_id'):
        cell = Cell.gql("WHERE cell_id = :1 LIMIT 1", self.request.get('cell_id'))
        if cell.count() == 0: # unknown cell
          cell = Cell()
          cell.cell_id = self.request.get('cell_id')
          cell.put()
        else:
          cell = cell[0]

        # see if location_area_code is known
        if self.request.get('location_area_code'):
          location_area = LocationArea.gql("WHERE location_area_code = :1 LIMIT 1", self.request.get('location_area_code'))
          if location_area.count() == 0: # unknown area code
            location_area = LocationArea()
            location_area.location_area_code = self.request.get('location_area_code')
            location_area.put()
          else:
            location_area = location_area[0]

          # see if mobile_country_code is known
          if self.request.get('mobile_country_code'):
            mobile_country = MobileCountry.gql("WHERE mobile_country_code = :1 LIMIT 1", self.request.get('mobile_country_code'))
            if mobile_country.count() == 0: # unknown area code
              mobile_country = MobileCountry()
              mobile_country.mobile_country_code = self.request.get('mobile_country_code')
              mobile_country.put()
            else:
              mobile_country = mobile_country[0]

            # see if mobile_network_code is known
            if self.request.get('mobile_network_code'):
              mobile_network = MobileNetwork.gql("WHERE mobile_country_code = :1 LIMIT 1", self.request.get('mobile_network_code'))
              if mobile_network.count() == 0: # unknown area code
                mobile_network = MobileNetwork()
                mobile_network.mobile_network_code = self.request.get('mobile_network_code')
                mobile_network.put()
              else:
                mobile_network = mobile_network[0]

        
              # now stick the GPS coordinates into Point
              point = Point()
              point.gps_location = self.request.get('latitude') +", "+ self.request.get('longitude')
              point.cell = cell
              point.location_area = location_area
              point.mobile_country = mobile_country
              point.mobile_network = mobile_network
              point.put()

application = webapp.WSGIApplication([  ('/cells.*', Cells),
                                        ('/cell.*', ViewCell),
                                        ('/new.*', NewPoint)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()