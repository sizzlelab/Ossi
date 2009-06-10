import appuifw
import e32
import time
import math
try:
  import sensor
  SENSOR_AVAILABLE = True
except ImportError:
  SENSOR_AVAILABLE = False

class Activity:
  def __init__(self, parent):
    self.parent = parent
    self.active = False
    self._activity = 0
    self.activity = 0
    self.t = e32.Ao_timer()
    self.dimensions = {"width" : self.parent.screen[1], "height": self.parent.screen[0]}
    self.data = []
    self._timer = 0
    self.SENSOR_AVAILABLE = SENSOR_AVAILABLE

  def activate(self):
    if not SENSOR_AVAILABLE:
      appuifw.note(u"sensor data not available, using defaults!", 'info')
      return False
    self.active = True
    appuifw.app.exit_key_handler = self.parent.exit_key_handler
    try:
      sensors = sensor.sensors() 
      if sensors.has_key('AccSensor'): 
        sensor_data = sensors['AccSensor'] 
        self.sensor = sensor.Sensor(sensor_data['id'], sensor_data['category']) 
        self.sensor.connect(self.sensor_event)
    except:
      appuifw.note(u"could not connect to accelerometer!", 'error')
      self.stop()
    self.update()
    return True

  def stop(self):
    self.t.cancel()
    self.active = False

  def update(self, dummy=(0, 0, 0, 0)):
    self.t.cancel()
    if self.active:
      if self._timer > 10:
        self._timer = 0
        self.activity = self._activity
        self._activity = 0
      self._timer += 1
      self.t.after(1.0, self.update)

  def sensor_event(self,data):
    try:
      if len(self.data) > 0:
        a = data["data_1"] - self.data[0]
        b = data["data_2"] - self.data[1]
        c = data["data_3"] - self.data[2]
        self._activity += math.fabs(a) + math.fabs(b) + math.fabs(c)
    except:
      pass
    self.data = [data["data_1"], data["data_2"], data["data_3"]]