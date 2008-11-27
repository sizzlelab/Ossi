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

import os
import locationrequestor # use internal GPS

FILEPATH = 'e:/ossi/data.txt'
INTERVAL = 10 # polling interval in seconds

def ReadPos():
  pos = lr.NotifyPositionUpdate() 
  msg = 'LAT:' + pos[1] + "LON:" + pos[2]

lr = locationrequestor.LocationRequestor()  
lr.Open(-1)
pos = lr.NotifyPositionUpdate()

while (True):
  e32.ao_sleep(INTERVAL)
  msg = ReadPos()
  print 'Location: '+ msg