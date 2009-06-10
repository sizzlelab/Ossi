# $Id: PositionHelper.py 107 2008-12-30 10:20:04Z aapris $

import time
import re
xml_attr_re = re.compile("""(\w+)=["']([^"']+)["']""")
xml_tagname_re = re.compile("^<([a-zA-Z0-9_]+)""")

def _get_common_attributes(p):
    """
    Extract common values from a position position object.
    """
    att = {}
    att["lat"] = u"%.6f" % (p["position"]["latitude"])
    att["lon"] = u"%.6f" % (p["position"]["longitude"])
    att["alt"] = u"%.1f" % (p["position"]["altitude"])
    att["time"] = time.strftime(u"%Y-%m-%dT%H:%M:%SZ", time.localtime(p["satellites"]["time"]))
    att["speed_kmh"] = u"%.2f" % (p["course"]["speed"] * 3.6)
    att["heading"] = u"%.2f" % (p["course"]["heading"])
    att["dop"] = u"%.2f;%.2f;%.2f" % (p["satellites"]["horizontal_dop"], p["satellites"]["vertical_dop"], p["satellites"]["time_dop"])
    return att

def _make_xml_tag(name, att):
    """
    Create an XML tag named "name" with attributes found from att.
    """
    attributes = " ".join([ '%s="%s"' % (k, att[k]) for k in att.keys() ])
    return "<%s %s></%s>" % (name, attributes, name) # End tag is probably needless

def _make_xml_cellpt(p, p2):
    """Create a <cellpt ...> string."""
    att = _get_common_attributes(p)
    att["cellfrom"] = u"%s,%s,%s,%s" % (p["gsm"]["cellid"])
    att["cellto"] = u"%s,%s,%s,%s" % (p2["gsm"]["cellid"])
    att["signalfrom"] = u"%.1f" % (p["gsm"]["signal_dbm"])
    att["signalto"] = u"%.1f" % (p2["gsm"]["signal_dbm"])
    return _make_xml_tag("cellpt", att) 

def _make_xml_trackpt(p):
    att = _get_common_attributes(p)
    return _make_xml_tag("trackpt", att) 

def _parse_xml_tag(line):
    tag = xml_tagname_re.findall(line)
    attr_list = xml_attr_re.findall(line)
    attr_dict = {}
    for att_tuple in attr_list:
        attr_dict[att_tuple[0]] = att_tuple[1]
    return tag, attr_dict
