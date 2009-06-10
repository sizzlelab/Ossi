SIS_VERSION = "0.1"
APP_TITLE = u"Sissi"

import appuifw
import e32
appuifw.app.orientation = 'portrait'
appuifw.app.screen = 'large'
import time

class Logger:
    def __init__ (self, filename = 'C:\\data\\sissi.log'):
        self.fname = filename
    def write(self, obj):
        timestamp = time.strftime("%Y%m%d-%H%M%S\r\n")
        log = open(self.fname, 'at')
        log.write(timestamp)
        log.write(obj)
        log.write("\r\n")
        log.close()
    def flush(self):
        pass

def canvas_callback(dummy=(0, 0, 0, 0)):
  pass
    
def draw_screen(text):
    canvas.clear()
    line_height = y = 15
    text = text.split("\n")
    for line in text:
      canvas.text((3, y), u""+line, font=(u"Series 60 Sans", 12), fill=0x333333)
      y += line_height
    e32.ao_sleep(0.01)

canvas = appuifw.Canvas(redraw_callback=canvas_callback)
appuifw.app.body = canvas

draw_screen(u"loading sys")
import sys
draw_screen(u"loading os, socket")
import os
import socket
draw_screen(u"loading time")
import time
draw_screen(u"loading scanner, sysinfo")
from Scanner import Scanner
import sysinfo
draw_screen(u"loading netmapper")
from NetMapper import NetMapper
draw_screen(u"loading simplejson")
import pys60_simplejson
simplejson = pys60_simplejson.simplejson()
draw_screen(u"loading map, COSApi")
from Map import Map
from COSApi import COSApi
draw_screen(u"loading graphics, accelerometer")
import graphics
from Activity import Activity

####################################
# FIXME: move these to an own module
import math
rad=math.pi/180

def project_point(x0, y0, dist, angle):
    """Project a new point from point x0,y0 to given direction and angle."""
    # TODO: check that the docstring is correct
    # TODO: check that alghorithm below is correct
    y1 = y0 + math.cos(angle * rad) * dist
    x1 = x0 + math.cos((90 - angle) * rad) * dist
    return x1, y1

def slope(x0, y0, x1, y1):
    """Calculate the slope of the line joining two points."""
    if x0 == x1: return 0
    return 1.0*(y0-y1)/(x0-x1)

def intercept(x, y, a):
    """Return the y-value (c) where the line intercepts y-axis."""
    # TODO: check that the docstring is correct
    return y-a*x

def distance(a,b,c,m,n):
    return abs(a*m+b*n+c)/math.sqrt(a**2+b**2)

def distance_from_vector(x0, y0, dist, angle, x, y):
    x1, y1 = project_point(x0, y0, dist, angle)
    a = slope(x0, y0, x1, y1)
    c = intercept(x0, y0, a)
    dist = distance(a, -1, c, x, y)
    return dist

def distance_from_line(x0, y0, x1, y1, x, y):
    a = slope(x0, y0, x1, y1)
    c = intercept(x0, y0, a)
    dist = distance(a, -1, c, x, y)
    return dist
####################################



class SissiApp:
    __id__ = u'Sissi'
    __version__ = u'0.1'

    def __init__(self):
      # app title
      appuifw.app.title = u"Sissi"

      # app lock
      self.lock = e32.Ao_lock()

      # ensure data dir exists
      self.datadir = os.path.join(u"C:\\Data", u"Sissi")
      if not os.path.exists(self.datadir):
        os.makedirs(self.datadir)

      # create a directory for temporary data
      self.cachedir = u"D:\\Sissi"
      if not os.path.exists(self.cachedir):
        os.makedirs(self.cachedir)

      # get screen resolution
      self.screen = sysinfo.display_pixels()

      # extra classes instantiated
      self.scanner = Scanner(self)
      self.netmapper = NetMapper(self)
      self.map = Map(self)
      self.cos_api = COSApi(self)
      self.sensor = Activity(self)

      # timers
      self.t = e32.Ao_timer()
      self.t2 = e32.Ao_timer()
      self._timer = 0
      self._interval = 15
      self.active = False

      # set canvas
      self.activate()
      
      # configuration / settings
      self.draw_screen('reading config')
      self.config_file = os.path.join(self.datadir, "settings.ini")
      self.config = {} # TODO: read these from a configuration file
      self.apid = None # Default access point
      self.read_config()
      if self.config.has_key("apid"):
        self._select_access_point(self.config["apid"])

      # set extra handler to be called on each GPS loop
#      self.scanner.set_extra_handler(self.loop)

      # update our menu
      self._update_menu()
      self.draw_screen('ready!')
#        self.debug(self.screen)
      self.scanner_handler() # start scanning automatically

      # set exit key handler
      appuifw.app.exit_key_handler = self.exit_key_handler
 
      # activate sensor if available
      self.sensor.activate()
      
      # call main loop
      self.main()

    def main(self):
      self.t2.cancel()

      if self._timer > self._interval:
        self._timer = 0
        try:
          if self.scanner.position.has_key("gps_data"): # first check whether we have a GPS position
            self.cos_api.post(self.scanner.position["gps_data"]["lat"], self.scanner.position["gps_data"]["lon"])
            # if map view is active load a new one
            if self.map.active:
              self.map.load(self.scanner.position["gps_data"]["lat"], self.scanner.position["gps_data"]["lon"])
          elif self.scanner.position.has_key("wlan_data"): # if not then see if we have wlans in the latest scanned position
            wlanlist = self.scanner.position["wlan_data"]["wlanlist"]
            wlanlist.sort(lambda x, y: cmp(y['rxlevel'], x['rxlevel']))
            if len(wlanlist) > 1:          
              self.netmapper.get_location(wlanlist) # fetching calculated location from OpenNetMap
              if self.netmapper.computed_location["latitude"] and self.netmapper.computed_location["longitude"]:
                self.cos_api.post(self.netmapper.computed_location["latitude"], self.netmapper.computed_location["longitude"])
              # if map view is active load a new one
              if self.netmapper.computed_location["latitude"] and self.netmapper.computed_location["longitude"] and self.map.active:
                self.map.load(self.netmapper.computed_location["latitude"], self.netmapper.computed_location["longitude"])
          elif self.scanner.position.has_key("gsm_data"):
            # not yet implemented!!
            pass
        except:
          pass

        if self.sensor.SENSOR_AVAILABLE:
          if self.sensor.activity > 5000: # we are moving
            self._interval = 15
            appuifw.note(u"sensor available, interval: "+str(self._interval), 'info')
          else:
            self._interval = 120
            appuifw.note(u"sensor available, interval: "+str(self._interval), 'info')
        else:
          self._interval = 120
      self._timer += 1
      self.t2.after(1.0, self.main)
    
    def debug(self,obj):
      self.draw_screen(simplejson.dumps(obj))

    def update(self, dummy=(0, 0, 0, 0)):
      self.t.cancel()
      text = self.get_canvas_text()
      self.draw_screen(text)
      if self.active:
        self.t.after(1.0, self.update)
    
    def get_canvas_text(self):
      text = ""
      if self.scanner.text != None:
        text += self.scanner.text
      if self.netmapper.text != None:
        text += self.netmapper.text
      if self.cos_api.text != None:
        text += self.cos_api.text
      if len(text) == 0:
        text = "Waiting for location fix!"
      else:
        text += "\nUntil next COS update: "+str(self._timer)+"\n"
      return text

    def draw_screen(self,text):
      self.canvas.clear()
      line_height = y = 15
      text = text.split("\n")
      for line in text:
        self.canvas.text((3, y), u""+line, font=(u"Series 60 Sans", 12), fill=0x333333)
        y += line_height

    def open_ossi(self):
      	path = u"e:\\python\\ossi.html"
      	c=appuifw.Content_handler()
      	c.open(path)
      	app_lock = e32.Ao_lock()
      	app_lock.wait()
      	appuifw.app.exit_key_handler = self.exit_key_handler

    def _select_access_point(self, apid = None):
        """
        Shortcut for socket.select_access_point() 
        TODO: save selected access point to the config
        TODO: allow user to change access point later
        """
        if apid is not None:
            self.apid = apid
        else:
            access_points = socket.access_points()
            sort_key = "iapid"
            decorated = [(dict_[sort_key], dict_) for dict_ in access_points]
            decorated.sort()
            access_points = [dict_ for (key, dict_) in decorated]
            ap_names = [dict_["name"] for dict_ in access_points]
            ap_ids = [dict_["iapid"] for dict_ in access_points]
            selected = appuifw.selection_list(ap_names, search_field=1)
            #print selected, ap_names[selected], ap_ids[selected]
            if selected is not None:
                self.apid = ap_ids[selected]
        if self.apid:
            self.apo = socket.access_point(self.apid)
            socket.set_default_access_point(self.apo)
            self.config["apid"] = self.apid
            self.save_config()
            self._update_menu()
            return self.apid

    def _update_menu(self):
        scanner_string = 'Start'
        if self.__dict__.has_key("scanner"): # check that scanner has been initialized
          if self.scanner.running:
            scanner_string = 'Stop'

        appuifw.app.menu = [
            (u""+scanner_string+" scanner", self.scanner_handler),
            (u"Show map", self.toggle_map),
#            (u"Accelerometer view", self.toggle_accelerometer),
            (u"Reset config", self.reset_config),
            (u"About", lambda:appuifw.note("Sissi is OtaSizzle S60 daemon. Version: " + self.__version__ + "\n\nJ Turunen / HIIT", 'info')),
            (u"Close", self.exit_key_handler),
            ]

    def read_config(self):
        data = {}
        try:
            f = open(self.config_file, "rt")
            data = eval(f.read())
            #data = f.read()
            f.close()
        except:
            appuifw.note(u"Generating a settings file...", 'info')
            # raise
        # List here ALL POSSIBLE configuration keys, so they will be initialized
        defaults = {
            "scan_interval" : 20, # 6 minutes
            "scan_interval_active" : 10, # 2 minutes
            "otasizzle_username" : None,
            "otasizzle_password" : None,
            "cos_method" : u"http",
            "cos_domain" : u"cos.alpha.sizl.org",
            "cos_path" : u"/location/single_update",
            "apid" : None,
            "onm_url" : u"http://opennetmap.org/api/?operation=get_wlan_01&wlan_ids=",
            "script" : u"/api/",
        }
        # List here all configuration keys, which must be defined before use
        # If a config key has key "function", it's called to define value
        # TODO: make some order for these
        mandatory = {
            "otasizzle_username" : {"querytext" : u"your OtaSizzle username", 
                          "valuetype" : "text", 
                          "default" : u'',
                          "canceltext" : u'username is mandatory!',
                          },
            "otasizzle_password" : {"querytext" : u"your OtaSizzle password", 
                          "valuetype" : "text", 
                          "default" : u'',
                          "canceltext" : u'password is mandatory!',
                          },
            "apid"    : {"querytext" : u"Select default data connection!", 
                          "valuetype" : "function",
                          "default" : u'',
                          "canceltext" : None,
                          "function" : self._select_access_point,
                          },
        }
        # Loop all possible keys (found from defaults)
        for key in defaults.keys():
            if data.has_key(key): # Use the value found from the data
                defaults[key] = data[key]
            elif mandatory.has_key(key) and defaults[key] is None: # Ask mandatory values from the user
                value = None
                if mandatory[key].has_key("function"): # if defined, call the "function"
                    appuifw.note(mandatory[key]["querytext"], 'info')
                    value = mandatory[key]["function"]() # "function" must return a value
                else:
                    while value is None:
                        value = appuifw.query(mandatory[key]["querytext"], 
                                              mandatory[key]["valuetype"], 
                                              mandatory[key]["default"])
                        if value is None and mandatory[key]["canceltext"]: 
                            appuifw.note(mandatory[key]["canceltext"], 'error')
                        elif value is None: # If canceltext is u"", change value None to u""
                            value = u""
                defaults[key] = value
        self.config = defaults
        self.save_config()
        
    def save_config(self):
        f = open(self.config_file, "wt")
        f.write(repr(self.config))
        f.close()

    def reset_config(self):
      if appuifw.query(u'Are you sure you want to delete all settings?', 'query') is True:
        os.remove(self.config_file)
        appuifw.note(u"Done, now you need to restart Sissi!", 'info')
        self.running = False
        self.lock.signal()
        appuifw.app.exit_key_handler = None

    def scanner_handler(self):
      if self.scanner:
        if self.scanner.running:
          self.scanner.stop()
        else:
          self.scanner.start()
      self._update_menu()

    def toggle_map(self):
      if not appuifw.app.body == self.canvas:
        self.map.active = False
        self.activate()
      else:
        self.active = False
        self.map.activate()

    def activate(self):
      self.active = True
      appuifw.app.exit_key_handler = self.exit_key_handler
      try:
        self.canvas
      except:
        self.canvas = appuifw.Canvas(redraw_callback=self.update)
      appuifw.app.body = self.canvas
      self._update_menu()

    def run(self):
        self.lock.wait()
        self.close()

    def exit_key_handler(self):
      if appuifw.query(u"Quit program", 'query') is True:
        self.running = False
        self.scanner.stop()
        if self.map.active:
          self.map.stop()
        self.sensor.stop()
        self.lock.signal()

    def close(self):
#        positioning.stop_position()
      appuifw.app.exit_key_handler = None
      self.running = False

# Exception harness for test versions
try:
    oldbody = appuifw.app.body
    myApp = SissiApp()
    myApp.run()
    appuifw.app.body = oldbody
#    positioning.stop_position()
except:
    # Exception harness
#    positioning.stop_position()
    import sys
    import traceback
    import e32
    import appuifw
    appuifw.app.screen = "normal"               # Restore screen to normal size.
    appuifw.app.focus = None                    # Disable focus callback.
    body = appuifw.Text()
    appuifw.app.body = body                     # Create and use a text control.
    exitlock = e32.Ao_lock()
    def exithandler(): exitlock.signal()
    appuifw.app.exit_key_handler = exithandler  # Override softkey handler.
    appuifw.app.menu = [(u"Exit", exithandler)] # Override application menu.
    body.set(unicode("\n".join(traceback.format_exception(*sys.exc_info()))))
    try:
        body.add(u"\n".join(App.log))
    except:
        pass
        #body.set(unicode("\n".join(traceback.format_exception(*sys.exc_info()))))
    exitlock.wait()                             # Wait for exit key press.
    
#positioning.stop_position()
e32.ao_sleep(1)
# For SIS-packaged version uncomment this:
# appuifw.app.set_exit()
