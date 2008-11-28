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
    cells = Cell.all()

    if cells:
      self.response.out.write('<table cellpadding="2" cellspacing="1" border="0">')
      self.response.out.write('<tr><th bgcolor="#cccccc">cell id</th><th>date found</th></tr>')

      for cell in cells:
        self.response.out.write('<tr>')
        self.response.out.write('<td bgcolor="#eeeeee"><a href="/cell/?cell='+str(cell.key())+'">'+cell.cell_id+'</a></td>')
        self.response.out.write('<td bgcolor="#eeeeee">%s</td>' % cell.date_created)
        self.response.out.write('</tr>')
      self.response.out.write('</table>')
    self.response.out.write("""
        </body>
      </html>""")

class ViewCell(webapp.RequestHandler):
  def get(self):
    if self.request.get('cell'):
      
      self.response.out.write('<html><head></head><body>')
      cell = Cell.get(self.request.get('cell'))
      points = Point.gql("WHERE cell=:1 ORDER BY date_created", cell)

      if points:
        self.response.out.write('<h2>Points for Cell ...</h2>')
        self.response.out.write('<table cellpadding="2" cellspacing="1" border="0">')
        self.response.out.write('<tr><th bgcolor="#cccccc">getpoint</th><th>date found</th></tr>')

        for point in points:
          self.response.out.write('<tr>')
          self.response.out.write('<td bgcolor="#eeeeee"><a href="http://maps.google.com/maps?f=q&hl=en&q='+str(point.gps_location)+'">'+str(point.gps_location)+'</a></td>')
          self.response.out.write('<td bgcolor="#eeeeee">%s</td>' % point.date_created)
          self.response.out.write('</tr>')
        self.response.out.write('</table>')
      self.response.out.write("""
          </body>
        </html>""")

class NewPoint(webapp.RequestHandler):
  def post(self):

    # first of all see that all values required are present
    if self.request.get('latitude') and self.request.get('longitude') and self.request.get('cell_id') and self.request.get('location_area_code'):

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
          
          # now stick the GPS coordinates into Point
          point = Point()
          point.gps_location = self.request.get('latitude') +", "+ self.request.get('longitude')
          point.cell = cell
          point.location_area = location_area
          point.put()

          self.response.out.write('<br /><br />point:<br />');
          self.response.out.write(point.key());

application = webapp.WSGIApplication([  ('/cells.*', Cells),
                                        ('/cell.*', ViewCell),
                                        ('/new.*', NewPoint)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()