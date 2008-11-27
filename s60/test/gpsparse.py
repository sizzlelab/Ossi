"""
Quick and dirty parser.

License:  GPL v 3
"""
import sys
import traceback

import utils

if sys.platform.startswith('linux'):
    def get_gps_device():

        return open('/dev/rfcomm0'), None
else:
    import socket
    

    class SocketPlus(object):
        """ Helper class to wrap a series 60 socket up as an object with readline. """
        def __init__(self):

            pass

        def connect(self, target):

            self.sock = socket.socket(socket.AF_BT, socket.SOCK_STREAM)
            self.target = target
            self.fptr = None
            try:
                self.sock.connect(target)
            except:
                utils.error('xxx')
                return

            try:
                self.fptr = self.sock.makefile()
            except:
                utils.error('error making file')
                self.fptr = None

        def reconnect(self):

            print 'closing socket'
            try:
                self.close()
            except:
                utils.error('closing socket error')
                

            try:
                self.connect(self.target)
            except:
                utils.error('connect failed')
                raise
                
            print 're-connected (hopefully)'
            
        def readline(self):

            line = ''
            if self.fptr is not None:
                try:
                    line = self.fptr.readline()
                    return line
                except:
                    utils.error('error reading line from socket')
                    raise

            return line
            

        def close(self):

            try:
                self.fptr.close()
            except:
                utils.error('sockplus fptr close')

            try:
                self.sock.close()
            except:
                utils.error('sockplus sock close')


    def get_gps_device(target=None):

        if target is None:
            try:
                address, services = socket.bt_discover()
                target=(address, services.values()[0])
            except:
                utils.error('error getting bt device')
                raise


        sock = SocketPlus()
        sock.connect(target)
        
        return sock, None

def snr_compare(a, b):

    return cmp(a.get('snr', 0), b.get('snr', 0))

class Gps(object):

    def __init__(self, device=None, sock=None):

        if device is None:
            device, sock = get_gps_device()

        self.set_device(device, sock)
        self.satellites = {}
        self.satellites_building = {}
        self.need_reconnect = False
            
    def set_device(self, device, sock):
        
        self.device = device
        #if sock is None:
        #    sock = device
        #self.sock = sock
        self.quality = None
        self.speed = None
        self.altitude = 0.0
        self.track = 0.0
        self.utctime = '000000'

    def reconnect(self):
        #self.need_reconnect = True
        self._reconnect()
        
    def _reconnect(self):

        print 'in Gps reconnect'

        if hasattr(self.device, 'reconnect'):
            print 'trying to reconnect socket'
            try:
                self.device.reconnect()
                self.need_reconnect = False
            except:
                utils.message('device.reconnect failed')
        else:
            # try getting gps device
            print 'crossing fingers and trying to get device to reconnect to.'
            device, sock = get_gps_device()
            self.set_device(device, sock)

    def close(self):

        self.device.close()

    def gga_parse(self, line):
        """
        GGA          Global Positioning System Fix Data
         1. Fix Time
         2. Latitude
         3. N or S
         4. Longitude
         5. E or W
         6. Fix quality
                       0 = invalid
                       1 = GPS fix (SPS)
                       2 = DGPS fix
                       3 = PPS fix
                       4 = Real Time Kinematic
                       5 = Float RTK
                       6 = estimated (dead reckoning) (2.3 feature)
                       7 = Manual input mode
                       8 = Simulation mode
         7. Number of satellites being tracked
         8. Horizontal dilution of position
         9. Altitude, Meters, above mean sea level
         10. Alt unit (meters)
         11. Height of geoid (mean sea level) above WGS84 ellipsoid
         12. unit
         13. (empty field) time in seconds since last DGPS update
         14. (empty field) DGPS station ID number
         15. the checksum data
        """
        fields = line.split(',')
        quality = int(fields[6])
        if not quality:
           return
        self.quality = quality
        self.fixtime = fields[1]
        self.latitude = self.fix_angle(fields[2], fields[3])
        self.longitude = self.fix_angle(fields[4], fields[5])

        self.ntracked = int(fields[7])
        self.dilution = float(fields[8])
        self.altitude = float(fields[9])
        self.height_of_geoid = float(fields[11])


    def unknown(self, line):
        
        print 'unk', len(line), line[:10]

    def gsv_parse(self, line):
        """ GSV - Satellites in view

        1) total number of messages
        2) message number
        3) satellites in view
        4) satellite number
        5) elevation in degrees (0-90)
        6) azimuth in degrees to true north (0-359)
        7) SNR in dB (0-99)
        more satellite infos like 4)-7)
        n) checksum
        """
        fields = line.strip()[:-3].split(',')
        print fields
        self.sats_in_view = int(fields[3])
        sats = self.satellites_building
        done = fields[1] == fields[2]
        fields = fields[4:]
        while len(fields) >= 4:
            number, elevation, azimuth, snr = fields[:4]
            if not snr: snr = '0'
            number = int(number)
            sats[number] = {'number': int(number),
                            'elevation': float(elevation),
                            'azimuth': float(azimuth),
                            'snr': float(snr),
                            'inuse': 0}
            fields = fields[4:]

        if done:
            self.satellites = self.satellites_building
            self.satellites_building = {}

    def gsa_parse(self, line):
        """ GPS DOP and active satellites

        1) Auto selection of 2D or 3D fix (M = manual)
        2) 3D fix - values include: 1 = no fix, 2 = 2D, 3 = 2D
        3) PRNs of satellites used for fix
           (space for 12)
        4) PDOP (dilution of precision)
        5) Horizontal dilution of precision (HDOP)
        6) Vertical dilution of precision (VDOP)
        7) Checksum
        """
        #print 'gsa'

        fields = line.split(',')
        self.auto = fields[1]
        self.fix_dimensions = fields[2]
        sats = self.satellites
        for x in fields[3:15]:
            if x == '':
                continue
            if x in sats:
                sats[x][inuse] = 1
            else:
                sats[x] = {'number': int(x),
                           'elevation': 0.0,
                           'azimuth': 0.0,
                           'snr': 0.0,
                           'inuse': 1}

    def rmc_parse(self, line):
        """ Recommended Minimum Navigation Information C
        1) UTC Time
        2) Status, V=Navigation receiver warning A=Valid
        3) Latitude
        4) N or S
        5) Longitude
        6) E or W
        7) Speed over ground, knots
        8) Track made good, degrees true
        9) Date, ddmmyy
        10) Magnetic Variation, degrees
        11) E or W
        12) FAA mode indicator (NMEA 2.3 and later)
        13) Checksum
        """
        fields = line.split(',')
        #print fields
        if fields[2] == 'V':
            return
        self.utctime = fields[1]
        self.status = fields[2]
        if not fields[3]:
            return
        
        self.rlatitude = self.fix_angle(fields[3], fields[4])
        self.rlongitude = self.fix_angle(fields[5], fields[6])

        self.speed = float(fields[7])
        self.track = float(fields[8])
        self.date = fields[9]
        self.magnetic_variation = fields[10] + fields[11]

    def fix_angle(self, angle, mode):
        """ Fix up and angle to be something useful. """
        angle = float(angle) / 1e2
        degrees = int(angle)
        minutes = (angle - degrees) * 100.0
        #print 'angle, degrees, minutes, final', angle, degrees, minutes,
        angle = degrees + (minutes / 60.0)

        if mode in 'WS':
            angle *= -1
        #print angle
        return angle
        
    def show(self, outfile):

        if not self.quality:
            print 'No fix',
            if self.speed is not None:
                print >>outfile, 'rmc', self.speed, self.rlatitude, self.rlongitude, self.track
                print >>outfile, 'rmc', self.speed, self.latitude, self.longitude, self.track
            else:
                print >>outfile
                
            return

        try:
            print >>outfile, self.fixtime, self.latitude, self.longitude,
            print >>outfile, self.altitude, self.height_of_geoid, self.ntracked, self.dilution,
            print >>outfile, self.sats_in_view

            if self.speed is not None:
                print >>outfile, 'qrmc', self.speed, self.rlatitude, self.rlongitude, self.track
                print >>outfile, 'qrmc', self.speed, self.latitude, self.longitude, self.track

        except:
            pass

    def qshow(self):
        if not self.quality:
            print 'No fix'
        try:
            if self.speed is not None:
                print 'alt: %6.2f\nspeed: %6.2f\nll: %6.2f %6.2f\n' % (
                    self.altitude, self.speed, self.rlatitude, self.rlongitude)

        except:
            pass

    def show_satellites(self):

        for number, info in self.satellites.items():
            print '%2d %5.1f %5.1f %4.0f %s' % (
                number, info['elevation'],
                info['azimuth'], ['snr'],
                info['inuse'] != 0)
        

    def update(self, timeout=100):

        parsers = {
            'GPGGA': self.gga_parse,
            'GPGSV': self.gsv_parse,
            'GPGSA': self.gsa_parse,
            'GPRMC': self.rmc_parse,
            }

        got_data = False

        # Process n lines per update
        n = 5
        for x in range(n):
            if self.need_reconnect:
                self._reconnect()
            line = self.device.readline()
            if len(line) > 1:
                token = line[1:6]
                try:
                    parsers.get(token, self.unknown)(line)
                except:
                    traceback.print_exc()
                    print 'parse error', line
                    return got_data
            
                got_data = True
        
        return got_data

    
if __name__ == '__main__':

    import time

    gps = Gps()

    while True:
        if gps.update():
            #gps.qshow()
            gps.show_satellites()
            time.sleep(0.3)
            #gps.show(sys.stdout)
