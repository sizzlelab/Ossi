# -*- coding: iso-8859-1 -*-
# $Id: http_poster.py 107 2008-12-30 10:20:04Z aapris $

import httplib

"""
A scripted web client that will post data to a site as if from a 
form using ENCTYPE="multipart/form-data". This is typically used 
to upload files, but also gets around a server's (e.g. ASP's) 
limitation on the amount of data that can be accepted via a 
standard POST (application/x-www-form-urlencoded).
http://aspn.activestate.com/ASPN/Cookbook/Python/Recipe/146306
"""

__version__ = u'$Id: http_poster.py 107 2008-12-30 10:20:04Z aapris $'
user_agent = "http_poster.py/$Rev: 104 $"

def post_multipart(host, selector, params, files, headers={}):
    """
    Post params and files to an http host as multipart/form-data.
    params is a dictionary of elements for regular form fields.
    files is a sequence of (name, filename, value) elements for data to be uploaded as files
    Return a HTTPResponse.
    """
    content_type, body = encode_multipart_formdata(params, files)
    conn = httplib.HTTPConnection(host)
    if 'User-Agent' not in headers:
        headers['User-Agent'] = user_agent
    if 'Content-Type' not in headers:
        headers['Content-Type'] = content_type
    conn.request('POST', selector, body, headers)
    response = conn.getresponse()
    data = response.read()
    conn.close()
    return data, response

def encode_multipart_formdata(params, files):
    """
    params is a dictionary of elements for regular form fields.
    Value must be supported by plain %s conversion so ensure to 
    encode unicode values to string-type.
    files is a sequence of (name, filename, value) elements for data to be uploaded as files.
    Return (content_type, body) ready for httplib.HTTP instance.
    """
    BOUNDARY = '----------ThIs_Is_tHe_bouNdaRY_$'
    CRLF = '\r\n'
    L = []
    for (key, value) in params.items():
        L.append('--' + BOUNDARY)
        L.append('Content-Disposition: form-data; name="%s"' % key)
        L.append('')
        L.append("%s" % value)
    for (key, filename, value) in files:
        L.append('--' + BOUNDARY)
        L.append('Content-Disposition: form-data; name="%s"; filename="%s"' % (key, filename))
        L.append('Content-Type: %s' % get_content_type(filename))
        L.append('')
        L.append("%s" % value)
    L.append('--' + BOUNDARY + '--')
    L.append('')
    try:
        body = CRLF.join(L)
    except: # Which Error we except here?
        print "Are you having unicode strings in L?"
        print "Check all keys AND values for that."
        raise
    content_type = 'multipart/form-data; boundary=%s' % BOUNDARY
    return content_type, body

def get_content_type(filename):
    # FIXME Some kind of contenttype guessing here!
    return 'application/octet-stream'
    #return mimetypes.guess_type(filename)[0] or 'application/octet-stream'

if __name__ == "__main__":
    import time
    import sys
    host = "http://127.0.0.1:8000"
    script = "/dump/"
    if len(sys.argv) <= 2:  # Print error if less than 2 arguments
        print "Usage %s <URL> <filename>" % sys.argv[0]
        print "Example:\n%s %s%s file.xml" % (sys.argv[0], host, script)
        sys.exit()
    # Parse host and script variables
    url = sys.argv[1]
    urlparts = url.split('/')
    if len(urlparts) >= 3:
        host = urlparts[2]
        script = "/%s" % "/".join(urlparts[3:])
    # Read file
    filename = sys.argv[2]
    f=open(filename, 'r')
    filedata = f.read()
    f.close()
    # Create "files"-list which contains all files to send
    files = [("file1", filename, filedata)]
    params = {"param1":"foo", 
              "param2":"bar",
              }
    try:
        ret = post_multipart(host, script, params, files)
        print ret[0]
        print ret[2]
    except:
        raise
