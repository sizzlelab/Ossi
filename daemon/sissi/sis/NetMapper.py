import appuifw
import e32
import urllib
import pys60_simplejson
simplejson = pys60_simplejson.simplejson()

class NetMapper:
  def __init__(self, parent):
    self.parent = parent
    self.computed_location = None
    self.text = ""

  def get_location(self, *args):
      wlans_string = ''
      i = 0
      if len(args) > 0:
        for wlan in args[0]:
          wlans_string += wlan["bssid"]
          if len(args) > i:
            wlans_string += ','
          i += 1
      url = self.parent.config["onm_url"] + wlans_string
      try:
        response = simplejson.load(urllib.urlopen(url))
        self.computed_location = {
          "latitude" : response['geojson']['geometries'][0]['coordinates'][1],
          "longitude" : response['geojson']['geometries'][0]['coordinates'][0]
        }
        self.text = "\nComputed lat: "+str(self.computed_location["latitude"])+"\nComputed lon: "+str(self.computed_location["longitude"])+"\n"
      except:
        self.text = "\nCould not parse ONM GeoJSON!"
#      self.parent.update_screen()

#      self.parent.draw_screen("computed lat: "+str(self.computed_location["latitude"])+"\ncomputed lon: "+str(self.computed_location["longitude"]))
