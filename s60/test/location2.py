import e32
import positioning
import location
import urllib
import httplib2
import sys

# call back handler
def cb(event): 
  # getting GSM info
  mobile_country_code, mobile_network_code, location_area_code, cell_id = location.gsm_location()
  print "---" 
  print "GPS: "+str(event['position']['latitude'])+", "+str(event['position']['longitude'])
  print "GSM: "+str(cell_id)

positioning.set_requestors([{"type":"service", "format":"application", "data":"test_app"}]) 
positioning.position(course=0, satellites=0, callback=cb, interval=2000000, partial=1)

http = httplib2.Http()
response = http.request(
  "http://twitter.com/statuses/update.xml",
  "POST",
  urllib.urlencode({"status": msg})
)

if response:
    print "Update OK!"
else:
    print "Error updating..."