#!/bin/bash
#############################################################
# create a Nokia Web Runtime widget from Ossi source
# tree
#
# Jani Turunen / HIIT / 2009 
#############################################################

rm -Rf Ossi.wdgt
cp -R v1 _tmp
pushd _tmp
rm -rf `find . -type d -name .svn`
mv Info.plist_Dashboard Info.plist
popd
mv _tmp/ Ossi.wdgt