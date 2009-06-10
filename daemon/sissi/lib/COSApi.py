import appuifw
import e32
import httplib
import urllib
import time

class COSApi:
  def __init__(self, parent):
    self.parent = parent
    self.text = None

  def post(self, lat, lon):
    if lat and lon:
      try:
        params = urllib.urlencode({'username': self.parent.config["otasizzle_username"], 'password': self.parent.config["otasizzle_password"], 'latitude' : lat, 'longitude' : lon})
        headers = { "Content-type": "application/x-www-form-urlencoded",
                    "Accept": "text/plain"}
        conn = httplib.HTTPConnection(self.parent.config["cos_domain"]+":80")
        conn.request("POST", self.parent.config["cos_path"], params, headers)
        response = conn.getresponse()
        conn.close()
        if response.status == 200:
          self.text = "\nCOS updated at: "+ time.strftime("%H:%M:%S %d/%m/%Y")
        else:
          self.text = "\nError in COS response!"
      except:
        self.text = "\nError in POSTing to COS!"
