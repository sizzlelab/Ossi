from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from models import Point

class BrowsePoints(webapp.RequestHandler):
  def get(self):
    self.response.out.write('<html><body>')
    points = Point.gql("")

    if points:
      self.response.out.write('<table>')
      for point in points:
        self.response.out.write('<tr>')
        self.response.out.write('<td>%s</td>' % point.label)
        self.response.out.write('<td>%s</td>' % point.location_area_code)
        self.response.out.write('<td>%s</td>' % point.cell_id)
        self.response.out.write('<td>%s</td>' % point.gps_location)
        self.response.out.write('</tr>')
      self.response.out.write('</table>')
    self.response.out.write("""
        </body>
      </html>""")

class NewPoint(webapp.RequestHandler):
  def pos(self):
    point = Point()
    if self.request.get('latitude') and self.request.get('longitude'):
      point.gps_location = self.request.get('latitude') +", "+ self.request.get('longitude')
    if self.request.get('label'):
      point.label = self.request.get('label')
    if self.request.get('cell_id'):
      point.cell_id = self.request.get('cell_id')
    if self.request.get('location_area_code'):
      point.location_area_code = self.request.get('location_area_code')
    point.put()
    self.redirect('/')
    
  def get(self):
    self.response.headers['Content-Type'] = 'text/plain'
    self.response.out.write('wrong, you should POST not GET!!!')

application = webapp.WSGIApplication([  ('/', BrowsePoints),
                                        ('/new*', NewPoint)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()