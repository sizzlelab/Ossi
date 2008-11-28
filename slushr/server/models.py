from google.appengine.ext import db

class Cell(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  cell_id = db.StringProperty()

class LocationArea(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  location_area_code = db.StringProperty()

class Point(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  location_area = db.ReferenceProperty(LocationArea) # foreign key
  cell = db.ReferenceProperty(Cell) # foreign key
  gps_location = db.GeoPtProperty()

