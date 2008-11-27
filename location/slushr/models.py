from google.appengine.ext import db

class Point(db.Model):
  location_area_code = db.StringProperty()
  cell_id = db.StringProperty()
  gps_location = db.GeoPtProperty()
  label = db.StringProperty()