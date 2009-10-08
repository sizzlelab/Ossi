var naepsys = {
  Version: '1.0',
  bootstrap: {
    load: function(libraryName) {
      // inserting via DOM fails in Safari 2.0, so brute force approach
      document.write('<script type="text/javascript" src="'+libraryName+'"></script>');
    },
    CSS: [
      'main.css'
    ],
    libraries: [  '3rdParty/prototype-m.js',
                  '3rdParty/effects.js',
                  '3rdParty/dragdrop.js',
                  '3rdParty/md5.js',
                  'extras/prototype.extras.js',
                  'naepsys/naepsys.base.js',
                  'naepsys/naepsys.main.js',
                  'naepsys/naepsys.login.js',
                  'naepsys/naepsys.signup.js',
                  'naepsys/naepsys.about.js',
                  'naepsys/naepsys.mainmenu.js',
                  'naepsys/naepsys.dialog.js',
                  'naepsys/naepsys.sloganizer.js',
                  'naepsys/naepsys.status.js',
                  'naepsys/naepsys.myprofile.js',
                  'naepsys/naepsys.profile.js',
                  'naepsys/naepsys.friendlist.js',
                  'naepsys/naepsys.findusers.js',
                  'naepsys/naepsys.searchresults.js',
                  'naepsys/naepsys.pendingfriends.js',
                  'naepsys/naepsys.terms.js',
                  'naepsys/naepsys.consent.js',
                  'naepsys/naepsys.information.js',
                  'naepsys/naepsys.channellist.js',
                  'naepsys/naepsys.grouplist.js',
                  'naepsys/naepsys.creategroup.js',
                  'naepsys/naepsys.group.js',
                  'naepsys/naepsys.groupmembers.js',
                  'naepsys/naepsys.createchannel.js',
                  'naepsys/naepsys.channel.js',
                  'naepsys/naepsys.mypost.js',
                  'naepsys/naepsys.post.js',
                  'naepsys/naepsys.avatar.js',
                  'naepsys/naepsys.utils.js',
									'naepsys/naepsys.changepassword.js',
		              'naepsys/naepsys.search.js',
		              'naepsys/naepsys.location.js',
									'naepsys/naepsys.searchallresult.js'
                ],
    loadLibraries: function() {
      var getBootScript = function () { 
        var s = document.getElementsByTagName("script"); 
        for (var i=0; i<s.length; i++) {
          if (s[i].src && s[i].src.match(/naepsys\.js(\?.*)?$/)){return s[i];}
        }
      };
      var bootScript = getBootScript();
      if (!bootScript)
        return alert ('naepsys boot script failed');
      naepsys.path = bootScript.src.replace(/naepsys\.js(\?.*)?$/,'');
      naepsys.cssPath = bootScript.src.replace(/js\/naepsys\.js(\?.*)?$/,'') + 'css/';
      for (var i = 0; i < naepsys.bootstrap.libraries.length; i++) {
        naepsys.bootstrap.load(naepsys.path+naepsys.bootstrap.libraries[i]);
      }
      naepsys.bootstrap.loadCSS(); // load CSS too
    },
    loadCSS: function() {
      for (var i = 0; i < naepsys.bootstrap.CSS.length; i++) {
        document.write('<link type="text/css" rel="stylesheet" href="'+naepsys.cssPath+naepsys.bootstrap.CSS[i]+'" />');
      }
    }
  }
}
naepsys.bootstrap.loadLibraries();
if (typeof(wall) == 'undefined') {
  window.onload = function() {
  //  new naepsys.main({width:400, height:400, x:100, y:100});  
    new naepsys.main();  
  }
}