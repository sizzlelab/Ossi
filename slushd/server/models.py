from google.appengine.ext import db

class Cell(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  computed_location = db.GeoPtProperty()
  cell_id = db.StringProperty()

class LocationArea(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  location_area_code = db.StringProperty()

class MobileCountry(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  mobile_country_code = db.StringProperty()

class MobileNetwork(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  mobile_network_code = db.StringProperty()

class LocationArea(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  location_area_code = db.StringProperty()

class Point(db.Model):
  date_created = db.DateTimeProperty(auto_now_add=True,auto_now=False)
  location_area = db.ReferenceProperty(LocationArea) # foreign key
  cell = db.ReferenceProperty(Cell) # foreign key
  mobile_network = db.ReferenceProperty(MobileNetwork) # foreign key
  mobile_country = db.ReferenceProperty(MobileCountry) # foreign key
  gps_location = db.GeoPtProperty()

