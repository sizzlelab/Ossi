# -*- coding: latin-1 -*-
# $id$
# Originally from Markku Vahaaho
# Message-ID: <44F03FFA.6080904@vahaaho.fi>
#

def to_unicode(s):
    """
        Converts `s` from UTF-8 or Latin-1 to Unicode.
        
        Returns `s` as is if already in Unicode.
    """

    if s is None:
        return s
    elif isinstance(s, unicode):
        return s
    elif isinstance(s, int):
        return u"%s" % (s)
    try:
        return unicode(s, 'utf-8')
    except UnicodeError:
        return unicode(s, 'latin-1')

    
def from_unicode(s, charset):
    """
        Converts `s` to `charset`.
        
        `charset` should be in Python form ('latin-1' or 'utf-8', for example).
        If `s` is not in Unicode, it is returned as is.
    """

    if s is None:
        return s
    elif isinstance(s, unicode):
        return s.encode(charset, 'ignore')
    else:
        return s
    
    
def to_charset(s, charset):
    """
        Converts `s` to `charset`.
        
        `charset` should be in Python form ('latin-1' or 'utf-8', for example).
        If `s` is not in Unicode or UTF-8, it is assumed to be in Latin-1.
    """

    if s is None:
        return s
    elif isinstance(s, unicode):
        return s.encode(charset, 'ignore')
    try:
        return unicode(s, 'utf-8').encode(charset, 'ignore')
    except UnicodeError:
        return unicode(s, 'latin-1').encode(charset, 'ignore')


def to_utf8(s):
    """
        Optimized shorthand for to_charset(s, 'utf-8').
    """
    
    if s is None:
        return s
    elif isinstance(s, unicode):
        return s.encode('utf-8', 'ignore')
    try:
        unicode(s, 'utf-8')
        return s
    except UnicodeError:
        return unicode(s, 'latin-1').encode('utf-8', 'ignore')

    
def to_latin1(s):
    """
        Optimized shorthand for to_charset(s, 'latin-1').
    """
    
    if s is None:
        return s
    elif isinstance(s, unicode):
        return s.encode('latin-1', 'ignore')
    try:
        return unicode(s, 'utf-8').encode('latin-1', 'ignore')
    except UnicodeError:
        return s
