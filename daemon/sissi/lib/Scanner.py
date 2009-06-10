import appuifw
import e32
import time
import copy
import positioning
import location

class Scanner:
  def __init__(self, parent):
    self.parent = parent
    self.track = []
    self.wlan_scans = []
    self.running = False
    self._wlan_scanning = False
    self.wlan_cache = None
    self.position = None
    self.extra_handler = None
#    self.t = e32.Ao_timer()
    self.text = ""

  def start(self):
    appuifw.note(u"starting location scan", 'info')
    positioning.set_requestors([{"type":"service", "format":"application", "data":"test_app"}]) 
    positioning.position(course=1,satellites=1, callback=self.run, interval=1000000, partial=1)
    self.running = True

  def stop(self):
    appuifw.note(u"stopping location scan", 'info')
    positioning.stop_position()
    self.running = False
    self.parent.draw_screen("location scan stopped!")

  def get_gps_position(self):
    return self.position

  def run(self,pos):
    position = {}
    position["systime"] = time.time()
    if self.has_fix(pos):
      position["gps_data"] = self.simplify_position(pos, isotime=True)
      self.text += "Latitude: "+str(position["gps_data"]["lat"])+"\nLongitude: "+str(position["gps_data"]["lon"])+"\nSatellites: "+str(position["gps_data"]["satellites"])+"\nHorizontal DOP: "+str(position["gps_data"]["hdop"])+"\nVertical DOP: "+str(position["gps_data"]["vdop"])+"\n"
    gsm_data = self.get_gsm_data()
    if gsm_data:
      position["gsm_data"] = gsm_data
      self.text += "\nMobile Country Code: "+str(position["gsm_data"][0])+"\nMobile Network Code: "+str(position["gsm_data"][1])+"\nLocation Area Code: "+str(position["gsm_data"][2])+"\nCellId: "+str(position["gsm_data"][3])+"\n"
    self.position = position

  def set_extra_handler(self,handler):
    self.extra_handler = handler

  def has_fix(self, pos):
    if pos.has_key("position") and pos["position"].has_key("latitude") and str(pos["position"]["latitude"]) != "NaN":
      return True
    else:
      return False

  def get_gsm_data(self):
    l = location.gsm_location()
    if l is not None and len(l) == 4:
      return l
    else:
      return False

  def get_wlan_data(self):
    try:
      import wlantools
    except Exception, error:
      pass
    if self._wlan_scanning:
      pass
    self._wlan_scanning = True
    starttime = time.clock()
    wlan_devices = wlantools.scan(False)
    duration = time.clock() - starttime
    for w in wlan_devices:
        # Lowercase all keys and Remove possible null-characters, hidden SSID shows as nulls
        for k,v in w.items():
            del w[k]
            w[k.lower()] = (u"%s" % v).replace('\x00', '')
    # s60 seems to cache wlan scans so do not save 
    # new scan point if previous scan resulted exactly the same wlan list
    # Save new scan point always if latest's result was empty  
    if (wlan_devices != []):
      if (self.wlan_cache == wlan_devices):
        self._wlan_scanning = False
        return False
        pass
    self.wlan_cache = wlan_devices
    data = {}
    data["position"] = self.get_gps_position()
    data["duration"] = duration
    data["wlanlist"] = wlan_devices
    if not data.has_key("systime"):
      data["systime"] = self.get_iso_systime()
    self._wlan_scanning = False
    self.wlan_scans.append(data) # add latest gps location to this data
    return data

  def simplify_position(self, pos, isotime=False):
    data = {}
    if not pos: return data
    if pos.has_key("systime"):
      if (time.time() - pos["systime"]) > 1: # If position is more than 1 seconds old
        data["gpsage"] = time.time() - pos["systime"]
      if isotime:
        data["systime"] = time.strftime(u"%Y-%m-%dT%H:%M:%S", time.localtime(pos["systime"])) + self._get_timezone()
      else:
        data["systime"] = pos["systime"]
    if pos.has_key("position"):
      if (pos["position"].has_key("latitude") and -90 <= pos["position"]["latitude"] <= 90):        
        data["lat"] = pos["position"]["latitude"]
        data["lon"] = pos["position"]["longitude"]
      if (pos["position"].has_key("altitude") and pos["position"]["altitude"] > -10000):        
        data["alt_m"] = pos["position"]["altitude"]
    if pos.has_key("course"):
      if pos["course"].has_key("speed"): 
        data["speed_kmh"] = pos["course"]["speed"] * 3.6
      if pos["course"].has_key("heading"): 
        data["heading"] = pos["course"]["heading"]
    if pos.has_key("satellites"):
      if pos["satellites"].has_key("time"):
        if isotime:
          data["gpstime"] = time.strftime(u"%Y-%m-%dT%H:%M:%SZ", time.localtime(pos["satellites"]["time"]))
        else:
          data["gpstime"] = pos["satellites"]["time"]
    try:
        data["hdop"] = pos["satellites"]["horizontal_dop"]
        data["vdop"] = pos["satellites"]["vertical_dop"]
        data["tdop"] = pos["satellites"]["time_dop"]
    except:
      pass
    data["satellites"] = "%d/%d"  % (pos["satellites"]["used_satellites"], pos["satellites"]["satellites"])
    return data

  def get_iso_systime(self):
    return time.strftime(u"%Y-%m-%dT%H:%M:%S", time.localtime(time.time())) + self._get_timezone()

  def _get_timezone(self):
    """Return timezone with prefix, e.g. +0300"""
    if time.altzone <= 0: prefix = "+"
    else: prefix = "-"
    hours = ("%2d" % (abs(time.altzone / (60 * 60)))).replace(" ", "0")
    mins = ("%2d" % (abs(time.altzone / 60) % 60)).replace(" ", "0")
    if int(mins) > 0:
      return "%s%s%s" % (prefix, hours, mins)
    else:
      return "%s%s" % (prefix, hours)

