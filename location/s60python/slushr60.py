## The MIT License

## Copyright (c) 2008 Jani Turunen <jani.turunen@hiit.fi>,

## Permission is hereby granted, free of charge, to any person obtaining a copy
## of this software and associated documentation files (the "Software"), to deal
## in the Software without restriction, including without limitation the rights
## to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
## copies of the Software, and to permit persons to whom the Software is
## furnished to do so, subject to the following conditions:

## The above copyright notice and this permission notice shall be included in
## all copies or substantial portions of the Software.

## THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
## IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
## FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
## AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
## LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
## OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
## THE SOFTWARE.

## Ossi locator daemon
##
## written for OtaSizzle / Ossi
## 27/11/2008
## version 0.1

import e32
import positioning
import location
import urllib
import httplib

# call back handler
def cb(event): 
  # getting GSM info
  mobile_country_code, mobile_network_code, location_area_code, cell_id = location.gsm_location()
  print "" 
  print "---" 
  print "GPS: "+str(event['position']['latitude'])+", "+str(event['position']['longitude'])
  print "GSM: "+str(cell_id)
  print "sending to slushr..."


  post_data = urllib.urlencode({  "location_area_code" : location_area_code,
                        "cell_id" : cell_id,
                        "latitude" : str(event['position']['latitude']),
                        "longitude" : str(event['position']['longitude'])})
                        
  headers = {"Content-type": "application/x-www-form-urlencoded", "Accept": "text/plain"}
  conn = httplib.HTTPConnection("slushr.appspot.com")
  conn.request("POST", "/new", post_data, headers)
  response = conn.getresponse()
  data = response.read()
  if response:
      print "Data: "+str(data)
  else:
      print "Error sending data to slushr..."
#  conn.close()

positioning.set_requestors([{"type":"service", "format":"application", "data":"test_app"}]) 
positioning.position(course=0, satellites=0, callback=cb, interval=5000000, partial=1)

