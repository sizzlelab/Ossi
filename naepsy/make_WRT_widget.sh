#!/bin/bash
#############################################################
# create a Nokia Web Runtime widget from Ossi source
# tree
#
# Jani Turunen / HIIT / 2009 
#############################################################

rm -Rf _tmp
cp -R v2 _tmp
pushd _tmp
rm -rf `find . -type d -name .svn`
mv Info.plist_WRT Info.plist
popd
zip -rq Ossi.wgz _tmp/
rm -Rf _tmp
