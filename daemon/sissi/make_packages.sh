#!/bin/bash
#############################################################
# use ensymble to create installable SIS packages of Sissi
# software for S60 phones 
#
# Originally by Aapo Rista 2008, modified for Sissi by 
# Jani Turunen / HIIT / 2009 
#############################################################

# Find out version string

SIS_VERSION=$(perl -ne 'if (/SIS_VERSION\s*=\s*"([\d\.]+)"/) {print "-$1";}' Sissi.py)

# Cleanup old stuff

rm -f Sissi*.zip
rm -Rf sis
rm -Rf *.sis

# Create a zip-package.
# Installation:
# 1. transfer it to the phone
# 2. extract it into E:\Python with phone's ZipManager

find Sissi.py lib -name "*.py" | zip -@ Sissi${SIS_VERSION}.zip

# Create a directory hierarchy for SIS-package

mkdir sis
pushd sis
cp -p ../Sissi.py default.py
echo "appuifw.app.set_exit()" >> default.py
mkdir -p plugins
cp -p ../plugins/*.py plugins/
for py in ../lib/*.py;
  do cp -p $py .
done
popd

# Check if ensyble is found in path
# and created unsigned (selfsigned?) sis package

ENSYMBLE=$(which ensymble)
if [ -z ${ENSYMBLE} ];
then
  echo Did not found ensymble from the path.
  echo Download ensymble from here:
  echo http://www.nbl.fi/~nbl928/ensymble.html
  echo and put it somewhere into your PATH e.g. ~/bin/.
  exit 1;
fi;

# http://www.forum.nokia.com/main/platforms/s60/capability_descriptions.html
# Create unsigned testrange package
${ENSYMBLE} py2sis --uid=0xE00184F0 --appname=Sissi --lang=EN --textfile=CHANGELOG.txt --shortcaption="Sissi" --caption="Sissi - OtaSizzle Location Daemon"  --drive=C --caps=ALL-TCB-DRM-AllFiles-CommDD-MultimediaDD-NetworkControl-DiskAdmin --vendor="Helsinki Institute for Information Technology" --runinstall --verbose sis Sissi${SIS_VERSION}.sis

if [ -z $1 ];
then 
  echo NOTE: If you want to create signed version, 
  echo give the file body of your cers as an argument.
  echo sh $0 mycert # you must have mycert.cer and mycert.key
  exit 0
fi

# Create signed version
${ENSYMBLE} py2sis --uid=0x200184F0 --appname=Sissi --lang=EN --textfile=CHANGELOG.txt --shortcaption="Sissi" --caption="Sissi - OtaSizzle Location Daemon"  --drive=C --caps=ALL-TCB-DRM-AllFiles --vendor="Helsinki Institute for Information Technology" --runinstall --verbose --cert=$1.cer  --privkey=$1.key sis $1-Sissi${SIS_VERSION}-signed.sis

