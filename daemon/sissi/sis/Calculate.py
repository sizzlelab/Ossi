# -*- coding: iso-8859-15 -*-
# $Id: Calculate.py 107 2008-12-30 10:20:04Z aapris $

# TODO: read this:
# http://discussion.forum.nokia.com/forum/showthread.php?t=153165

import math

nauticalmile = 1852.0 # Nautical mile in meters

def rad2deg(rad):
    """
    Convert radians to degrees.
    Return float radians.
    """
    return rad * 180 / math.pi

def deg2rad(deg):
    """
    Convert degrees to radians.
    Return float degrees.
    """
    return deg * math.pi / 180
    
def distance(lat1, lon1, lat2, lon2):
    """
    Calculate dinstance between two lat/lon pairs.
    Return float distance in meters.
    """
    lat1 = deg2rad(lat1)
    lon1 = deg2rad(lon1)
    lat2 = deg2rad(lat2)
    lon2 = deg2rad(lon2)
    theta = lon1 - lon2
    dist = math.sin(lat1) * math.sin(lat2) \
           + math.cos(lat1) * math.cos(lat2) * math.cos(theta)
    dist = math.acos(dist)
    dist = rad2deg(dist)
    meters = dist * 60 * nauticalmile
    return meters
    
# http://mathforum.org/library/drmath/view/55417.html
# tc1=mod(atan2(sin(lon2-lon1)*cos(lat2),
#         cos(lat1)*sin(lat2)-sin(lat1)*cos(lat2)*cos(lon2-lon1)),
#         2*pi)
def bearing(lat1, lon1, lat2, lon2):
    """
    Calculate bearing from lat1/lon1 to lat2/lon2.
    Return float bearing angle (0 <= bearing < 360).
    """
    lat1 = deg2rad(lat1)
    lon1 = deg2rad(lon1)
    lat2 = deg2rad(lat2)
    lon2 = deg2rad(lon2)
    bearingradians = math.atan2(math.asin(lon2 - lon1) * math.cos(lat2), \
                                math.cos(lat1) * math.sin(lat2) \
                                - math.sin(lat1) * math.cos(lat2) * math.cos(lon2 - lon1))
    bearingdegrees = rad2deg(bearingradians)
    if (bearingdegrees < 0):
        bearingdegrees = 360 + bearingdegrees
    return bearingdegrees

def anglediff(a,b):
    """
    Calculate the difference of two degree angels
    """
    d = abs(a-b)
    if d > 180:
        d = abs(360-d)
    return d

def newlatlon(lat, lon, dist, bear):
    """
    Calculate new latitude and longitude from
    lat, lon, distance (meters) and bearing (degrees, 0 <= bearing < 360).
    Return (newlat, newlon).
    """
    bearrad = deg2rad(bear)
    # Latitude difference in degrees
    latdiff = ((dist / nauticalmile) * math.cos(bearrad)) / 60
    # Mean latitude
    midlat = lat + (latdiff / 2.0)
    # Longitude difference in degrees
    londiff = (dist / nauticalmile * math.sin(bearrad) / math.cos(deg2rad(midlat))) / 60
    return (lat + latdiff, lon + londiff)

def estimatediff(lat1, lon1, speedkmph, secs, bear, lat2, lon2):
    # Not very good name for this function...
    """
    Estimate the 2nd point's coordinates using the 1st point's
    lat+lon, speed in km/h, seconds after and bearing.
    Return error in meters between estimated lat+lon and lat2+lon2.
    """
    dist = speedkmph / 3.6 * secs
    lat_est, lon_est = newlatlon(lat1, lon1, dist, bear)
    return distance(lat2, lon2, lat_est, lon_est)
        
def test():
    """
    Incomplete test-function.
    """
    lat1 = 60.0
    lon1 = 25.0
    lat2, lon2 = newlatlon(lat1, lon1, 111, 0)
    print distance(lat1, lon1, lat2, lon2)
    dist1 = 1852/4.0 # meters
    bear1 = 0
    print "%10s %10s %10s %10s %10s"  % ("error%", "dist1(m)", "bear1°", "dist2(m)", "bear2°")
    for i in range(0,15):
        (lat2, lon2) = newlatlon(lat1 ,lon1, dist1, bear1)
        dist2 = distance(lat1, lon1, lat2, lon2)
        bear2 = bearing(lat1, lon1, lat2, lon2)
        error = abs((1-dist2/dist1)*100)
        #print "%10.4f %10.2f %10.2f %10.2f %10.2f"  % (error, dist1, bear1, dist2, bear2)
        dist1 = dist1 * 2

if __name__ == "__main__":
    test()
