import appuifw
import e32
import graphics
import urllib
import os.path

class Map:
  def __init__(self, parent):
    self.parent = parent
    self.map = graphics.Image.new((self.parent.screen[1], self.parent.screen[0]))
    self.buffer = graphics.Image.new((self.parent.screen[1], self.parent.screen[0]))
    self.t = e32.Ao_timer()
    self.active = False
#    self.center_x = self.canvas.size[0]
#    self.center_y = self.canvas.size[1]
#    self.activate()

  def activate(self):
    self.active = True
    appuifw.app.exit_key_handler = self.parent.exit_key_handler
    try:
      self.canvas
    except:
      self.canvas = appuifw.Canvas(redraw_callback=self.update)
    appuifw.app.body = self.canvas # set this canvas as the main app body
    appuifw.app.menu = [(u"Close map", self.close)]
    if not os.path.isfile(self.parent.cachedir + "\map.jpg"):
      appuifw.note(u"Loading map file, please wait!", 'info')
      self.canvas.clear()
      self.canvas.text((3, 15), u"loading map...", font=(u"Series 60 Sans", 12), fill=0x333333)


  def close(self):
    self.t.cancel()
    self.active = False
    self.parent.toggle_map()

  # this is called externally from the main class loop
  def load(self, lat, lon):
    if lat and lon:
      try:
        url = "http://maps.google.com/staticmap?center="+str(lat)+","+str(lon)+"&zoom=16&size="+str(self.parent.screen[1])+"x"+str(self.parent.screen[0])+"&key=&markers="+str(lat)+","+str(lon)+"&maptype=satellite&sensor=true"
        f = open(self.parent.cachedir + "\map.jpg", "wb")
        m = urllib.urlopen(url)
        f.write(m.read())
        f.close()
        self.buffer.load(self.parent.cachedir + "\map.jpg", self.loaded)
      except:
        appuifw.note(u"Could not open image!", 'error')
    else:
      appuifw.note(u"Latitude and longitude not present!", 'error')
      
  def update(self, dummy=(0, 0, 0, 0)):
    self.t.cancel()
#    self.canvas.clear()
#  	appuifw.app.exit_key_handler = self.parent.exit_key_handler
    self.canvas.blit(self.map)
    if self.active:
      e32.reset_inactivity()
      self.t.after(0.5, self.update)

  def loaded(self, image):
    if self.active:
      self.map.blit(self.buffer)
      self.canvas.blit(self.map)