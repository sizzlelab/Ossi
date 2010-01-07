var ossi = {
  Version: '1.0',
  bootstrap: {
    load: function(libraryName) {
      // inserting via DOM fails in Safari 2.0, so brute force approach
      document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
    },
    CSS: [
      'main.css',
//      'n97fonts.css',
      'ossiWallStyles.css'
    ],
    libraries: [  '3rdParty/prototype-m.js',
                  '3rdParty/effects.js',
                  '3rdParty/dragdrop.js',
                  '3rdParty/md5.js',
                  'extras/prototype.extras.js',
                  'ossi/ossi.base.js',
                  'ossi/ossi.main.js',
                  'ossi/ossi.login.js',
                  'ossi/ossi.signup.js',
                  'ossi/ossi.about.js',
                  'ossi/ossi.mainmenu.js',
                  'ossi/ossi.dialog.js',
                  'ossi/ossi.sloganizer.js',
                  'ossi/ossi.status.js',
                  'ossi/ossi.myprofile.js',
                  'ossi/ossi.profile.js',
                  'ossi/ossi.friendlist.js',
                  'ossi/ossi.findusers.js',
                  'ossi/ossi.searchresults.js',
                  'ossi/ossi.pendingfriends.js',
                  'ossi/ossi.terms.js',
                  'ossi/ossi.consent.js',
                  'ossi/ossi.information.js',
                  'ossi/ossi.channellist.js',
                  'ossi/ossi.grouplist.js',
                  'ossi/ossi.creategroup.js',
                  'ossi/ossi.group.js',
                  'ossi/ossi.groupmembers.js',
                  'ossi/ossi.createchannel.js',
                  'ossi/ossi.channel.js',
                  'ossi/ossi.mypost.js',
                  'ossi/ossi.post.js',
                  'ossi/ossi.avatar.js',
                  'ossi/ossi.utils.js',
									'ossi/ossi.changepassword.js',
		              'ossi/ossi.search.js',
		              'ossi/ossi.location.js',
									'ossi/ossi.searchallresult.js'
                ],
    loadLibraries: function() {
      var getBootScript = function () { 
        var s = document.getElementsByTagName("script"); 
        for (var i=0; i<s.length; i++) {
          if (s[i].src && s[i].src.match(/ossi\.js(\?.*)?$/)){return s[i];}
        }
      };
      var bootScript = getBootScript();
      if (!bootScript)
        return alert ('ossi boot script failed');
      ossi.path = bootScript.src.replace(/ossi\.js(\?.*)?$/,'');
      ossi.cssPath = bootScript.src.replace(/js\/ossi\.js(\?.*)?$/,'') + 'css/';
      for (var i = 0; i < ossi.bootstrap.libraries.length; i++) {
        ossi.bootstrap.load(ossi.path+ossi.bootstrap.libraries[i]);
      }
      ossi.bootstrap.loadCSS(); // load CSS too
    },
    loadCSS: function() {
      for (var i = 0; i < ossi.bootstrap.CSS.length; i++) {
        document.write('<link type="text/css" rel="stylesheet" href="'+ossi.cssPath+ossi.bootstrap.CSS[i]+'" />');
      }
    }
  }
}
ossi.bootstrap.loadLibraries();
if (typeof(wall) == 'undefined') {
  window.onload = function() {
  //  new ossi.main({width:400, height:400, x:100, y:100});
    document.styleSheets[1].disabled = true;
    new ossi.main();  
  }
}