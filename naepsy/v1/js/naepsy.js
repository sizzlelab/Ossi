var naepsy = {
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
                  '3rdParty/platformservices.js', // nokia WRT platformservices 2.0
                  'naepsy/naepsy.base.js',
                  'naepsy/naepsy.main.js',
                  'naepsy/naepsy.login.js',
                  'naepsy/naepsy.signup.js',
                  'naepsy/naepsy.about.js',
                  'naepsy/naepsy.mainmenu.js',
                  'naepsy/naepsy.dialog.js',
                  'naepsy/naepsy.terms.js',
                  'naepsy/naepsy.consent.js',
                  'naepsy/naepsy.information.js',
                  'naepsy/naepsy.utils.js',
		              'naepsy/naepsy.location.js'
                ],
    loadLibraries: function() {
      var getBootScript = function () { 
        var s = document.getElementsByTagName("script"); 
        for (var i=0; i<s.length; i++) {
          if (s[i].src && s[i].src.match(/naepsy\.js(\?.*)?$/)){return s[i];}
        }
      };
      var bootScript = getBootScript();
      if (!bootScript)
        return alert ('naepsy boot script failed');
      naepsy.path = bootScript.src.replace(/naepsy\.js(\?.*)?$/,'');
      naepsy.cssPath = bootScript.src.replace(/js\/naepsy\.js(\?.*)?$/,'') + 'css/';
      for (var i = 0; i < naepsy.bootstrap.libraries.length; i++) {
        naepsy.bootstrap.load(naepsy.path+naepsy.bootstrap.libraries[i]);
      }
      naepsy.bootstrap.loadCSS(); // load CSS too
    },
    loadCSS: function() {
      for (var i = 0; i < naepsy.bootstrap.CSS.length; i++) {
        document.write('<link type="text/css" rel="stylesheet" href="'+naepsy.cssPath+naepsy.bootstrap.CSS[i]+'" />');
      }
    }
  }
}
naepsy.bootstrap.loadLibraries();
if (typeof(wall) == 'undefined') {
  window.onload = function() {
  //  new naepsy.main({width:400, height:400, x:100, y:100});  
    new naepsy.main();  
  }
}