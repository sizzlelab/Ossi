/**
* ossi utils class
*/
ossi.utils = Class.create(ossi.base,{
	initialize: function(parent) {
    this.parent = parent;
	  this.loadertexts =  [ 'l.oading',
	                        'lo.ading',
	                        'loa.ding',
	                        'load.ing',
	                        'loadi.ng',
	                        'loadin.g'];
	  this.locatertexts =  [  'l.ocating user',
  	                        'lo.cating user',
  	                        'loc.ating user',
  	                        'loca.ting user',
  	                        'locat.ing user',
  	                        'locati.ng user',
  	                        'locatin.g user',
  	                        'locating. user',
  	                        'locating .user',
  	                        'locating u.ser',
  	                        'locating us.er',
  	                        'locating use.r'];
	  this.loadertimer = false;
	  this.loadercounter = 0;
	  this.locatingtimer = false;
	  this.locatingcounter = 0;
	},
  getSpeed: function(o,d,current,max_speed,f) {
  	if(o>d){var dist=o-d;var perc=Math.abs((o-current)/dist);}
  	else if(d>o){var dist=d-o;var perc=Math.abs((current-o)/dist);}
  	if(max_speed>(dist/4)){max_speed=dist/4;}
  	var tmp=(-(Math.PI/2))+((Math.PI/2)*perc*2);tmp=Math.cos(tmp)*max_speed;tmp=Math.ceil(tmp);if(f&&perc<0.5)tmp=Math.ceil(max_speed);if(o>d)tmp=-(tmp);return tmp;
  },
  out: function(a,b,callback) {
    var self = this;
    var b_orig_width = b.getStyle('width');
  	a.setStyle({left:'0px', width:client.dimensions.width+'px'});
  	b.setStyle({left:-client.dimensions.width+'px', width:client.dimensions.width+'px'});
  	b.show();
  	new PeriodicalExecuter(function(pe) {
  		var speed = self.getSpeed(0,client.dimensions.width,parseInt(a.getStyle('left')),80,1);
  		a.setStyle({left:(parseInt(a.getStyle('left'))+speed)+'px'});
  		b.setStyle({left:(parseInt(b.getStyle('left'))+speed)+'px'});
  		if (parseInt(b.getStyle('left')) == 0) {
  			pe.stop();
      	b.setStyle({width:b_orig_width});
  			a.hide();
  			callback.apply();
  		}
  	}, 0.01);
  },
  into: function(a,b,callback) {
    var self = this;
    var b_orig_width = b.getStyle('width');
  	a.setStyle({left:'0px', width:client.dimensions.width+'px'});
  	b.setStyle({left:client.dimensions.width+'px', width:client.dimensions.width+'px'});
  	b.show();
  	new PeriodicalExecuter(function(pe) {
  		var speed = self.getSpeed(client.dimensions.width,0,parseInt(b.getStyle('left')),80,1);
  		a.setStyle({left:(parseInt(a.getStyle('left'))+speed)+'px'});
  		b.setStyle({left:(parseInt(b.getStyle('left'))+speed)+'px'});
  		if (parseInt(b.getStyle('left')) == 0) {
  			pe.stop();
      	b.setStyle({width:b_orig_width});
  			a.hide();
  			callback.apply();
  		}
  	}, 0.01);
  },
  spinLoader: function() {
    this.spinning = true;
    this.loadertimer = setInterval(function() {
      if (this.loadercounter < (this.loadertexts.length-1)) {
        this.loadercounter++;
        this.parent.loadingpane.update(this.loadertexts[this.loadercounter]);
      } else {
        this.loadercounter = 0;
        this.parent.loadingpane.update(this.loadertexts[this.loadercounter]);
      }
    }.bind(this),100);
  },
  stopLoader: function() {
    clearInterval(this.loadertimer);
  },
  spinLocater: function() {
    this.locatingspinning = true;
    this.locatertimer = setInterval(function() {
      if (this.locatercounter < (this.locatertexts.length-1)) {
        this.locatercounter++;
        this.parent.locatingpane.update(this.locatertexts[this.locatercounter]);
      } else {
        this.locatercounter = 0;
        this.parent.locatingpane.update(this.locatertexts[this.locatercounter]);
      }
    }.bind(this),100);
  },
  stopLocater: function() {
    clearInterval(this.locatertimer);
  },
  localtimeFromUTC: function(utc) {
    var d = new Date(utc);
    var t = d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear();
    return t;    
  },
  makeCookie: function(headerText) {
    if (headerText == null) return headerText;
    var h = headerText;
    var o = []
    h = h.split(';');
    h.each(function(nv) {
      o.push(nv);
//      var k = nv.split('=');
//      o.push(k[0]);
//      o.push(k[1]);
      throw $break; // temporary, only get the first name-value pair, e.g. session id
    });
    return o;
  },
  roundNumber: function(num, dec) {
  	return Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
  },

  dateToString: function(UTC_string) {
//  	return UTC_string.substring(8,10) + '.' + UTC_string.substring(5,7) + '.' + UTC_string.substring(0,4) + ' ' + UTC_string.substring(11,13) + ':' + UTC_string.substring(14,16) + ':' + UTC_string.substring(17,19);
    var d = UTC_string;
    var month = d.substring(5,6) == '0' ? d.substring(6,7) : d.substring(5,7);
    var day = d.substring(8,9) == '0' ? d.substring(9,10) : d.substring(8,10);
  	var a = Date.UTC(d.substring(0,4),(month-1),day,d.substring(11,13),d.substring(14,16),d.substring(17,19));
  	a = new Date(a);
  	var minutes = ''+a.getMinutes();
  	minutes = minutes.length == 1 ? "0"+minutes : minutes;
  	return a.getDate() + '.' + (a.getMonth()+1) + '.' + a.getFullYear() + ' ' + a.getHours() + ':' + minutes;
  },
  toEpoch: function(UTC_string) {
    var d = UTC_string;
    var a = Date.UTC(this.stripLeadingZeros(d.substring(0,4)),(this.stripLeadingZeros(d.substring(5,7))-1),this.stripLeadingZeros(d.substring(8,10)),this.stripLeadingZeros(d.substring(11,13)),this.stripLeadingZeros(d.substring(14,16)),this.stripLeadingZeros(d.substring(17,19)));
    return a;
  },
  agoString: function(UTC_string) {
    
    // return string
    var h = '';
    
    // argument date to epoch
    var d = UTC_string;
    var a = Date.UTC(this.stripLeadingZeros(d.substring(0,4)),(this.stripLeadingZeros(d.substring(5,7))-1),this.stripLeadingZeros(d.substring(8,10)),this.stripLeadingZeros(d.substring(11,13)),this.stripLeadingZeros(d.substring(14,16)),this.stripLeadingZeros(d.substring(17,19)));
	
    // now to epoch
    var e = new Date();
    var b = Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds());

    // set string data
    var s = (b-a) / 1000;
    if (s < 60) {
//      h = s+' sec ago';
      h = 'a moment ago';
    } else if (s >= 60 && s < 3600) {
      s = Math.floor(s/60);
      h = s+' mins ago';
    } else if (s >= 3600 && s < 86400) {
      s = Math.floor(s/3600);
      h = s+' hours ago';
    } else if (s >= 86400 && s < 2592000) {
      s = Math.floor(s/86400);
      h = s+' days ago';
    } else if (s >= 2592000) {
      s = Math.floor(s/2592000);
      h = s+' months ago';
    }
    return h;
  },
  stripLeadingZeros: function(string) {
    while (string.startsWith('0') && string.length > 1) {
      string = string.substring(1);
    }
    return string;
  },
  hideWall: function() {
    var self = this;
    var startpoint = parseInt(self.parent.window.getStyle('left'));
    var endpoint = -self.parent.window.getWidth();
  	new PeriodicalExecuter(function(pe) {
  		var speed = self.getSpeed(startpoint,endpoint,parseInt(self.parent.window.getStyle('left')),40,1);
  		self.parent.window.setStyle({left:(parseInt(self.parent.window.getStyle('left'))+speed)+'px'});
  		if (parseInt(self.parent.window.getStyle('left')) == endpoint) {
  			pe.stop();
        self.parent.wallX = startpoint;
        self.parent.wallHidden = true;
  		}
  	}, 0.01);
  },
  showWall: function() {
    var self = this;
    var startpoint = parseInt(self.parent.window.getStyle('left'));
    var endpoint = (Object.isUndefined(self.parent.wallX)) ? 100 : self.parent.wallX;
  	new PeriodicalExecuter(function(pe) {
  		var speed = self.getSpeed(startpoint,endpoint,parseInt(self.parent.window.getStyle('left')),40,1);
  		self.parent.window.setStyle({left:(parseInt(self.parent.window.getStyle('left'))+speed)+'px'});
  		if (parseInt(self.parent.window.getStyle('left')) == endpoint) {
  			pe.stop();
        self.parent.wallHidden = false;
  		}
  	}, 0.01);
  },
    
  addPagingFeature: function(container, json, self) {
     var nextButton = new Element( 'div' , { 'class' : 'nav_button next_button' } );
     var nextButtonText = new Element( 'a' , {'class' : 'nav_button_text' , 'href' : 'javascript:void(null);'} ).update('Next Page');
     nextButton.update( nextButtonText );
     // IE8 fix
     nextButton.addClassName('nav_button');
     nextButton.addClassName('next_button');
     nextButtonText.addClassName('nav_button_text');
     // end of IE8 fix
     var previousButton = new Element( 'div' , { 'class' : 'nav_button previous_button' } );
     var previousButtonText = new Element( 'a' , {'class' : 'nav_button_text' , 'href' : 'javascript:void(null);'} ).update('Previous Page');
     previousButton.update( previousButtonText );
     // IE8 fix
     previousButton.addClassName('nav_button');
     previousButton.addClassName('previous_button');
     previousButtonText.addClassName('nav_button_text');
     // end of IE8 fix

     container.addClassName('paging-container');
     container.update();
     container.insert( nextButton );
     container.insert( previousButton );
     
     // initially show all
     if( json.pagination.page == 1 ) {
       // first page
       previousButton.hide();
       nextButton.setStyle( { 'width' : '100%'} );
     }
     if( json.pagination.page * json.pagination.per_page >= json.pagination.size ) {
       // last page
       nextButton.hide();
       previousButton.setStyle( { 'width' : '100%'} );
     }
     // if we can show things on one page, then hide the container
     if( json.pagination.size < json.pagination.per_page ) {
       container.hide();
     }
     // add actions
     nextButton.onclick = function() {
       self.updateOptions = {
          page: ++self.updateOptions.page,
          per_page: 8
       };
       self.update();
    };
    previousButton.onclick = function() {
       self.updateOptions = {
          page: --self.updateOptions.page,
          per_page: 8
       };
       self.update();
    };
  },
  addLocalPagination: function(container, view, entries) {
    view.nextButton = new Element( 'div' , { 'class' : 'nav_button next_button' } );
    view.nextButtonText = new Element( 'a' , {'class' : 'nav_button_text' , 'href' : '#top'} ).update('Next Page');
    view.nextButton.update(view.nextButtonText);
    // IE8 fix
    view.nextButton.addClassName('nav_button');
    view.nextButton.addClassName('next_button');
    view.nextButtonText.addClassName('nav_button_text');
    // end of IE8 fix
    view.previousButton = new Element( 'div' , { 'class' : 'nav_button previous_button' } );
    view.previousButtonText = new Element( 'a' , {'class' : 'nav_button_text' , 'href' : '#top'} ).update('Previous Page');
    view.previousButton.update(view.previousButtonText);
    // IE8 fix
    view.previousButton.addClassName('nav_button');
    view.previousButton.addClassName('previous_button');
    view.previousButtonText.addClassName('nav_button_text');
    // end of IE8 fix

    container.addClassName('paging-container');
    container.update();
    container.insert(view.nextButton);
    container.insert(view.previousButton);

    view.previousButton.hide();
    view.nextButton.setStyle( { 'width' : '100%'} );
    
    // handle visibility
    if (view.options.updateOptions.page != 1) { // not first page
     view.previousButton.show();
     view.nextButton.show();
     view.previousButton.setStyle({'width' : '50%'});
     view.nextButton.setStyle({'width' : '50%'});
    }
    if (view.options.updateOptions.page * view.options.updateOptions.per_page >= entries.length) { // last page
     view.nextButton.hide();
     view.previousButton.show();
     view.nextButton.setStyle( { 'width' : '0%'} );
     view.previousButton.setStyle( { 'width' : '100%'} );
    }
    

    // if we can show things on one page, then hide the container
    if (entries.length < view.options.updateOptions.per_page) {
      container.hide();
    }

    // add actions
    view.nextButton.onclick = function() {
     view.options.updateOptions = {
        page: ++view.options.updateOptions.page,
        per_page: view.options.updateOptions.per_page
     };

     if (view.options.updateOptions.page != 1) { // not first page
       view.previousButton.show();
       view.nextButton.show();
       view.previousButton.setStyle({'width' : '50%'});
       view.nextButton.setStyle({'width' : '50%'});
     }
     if (view.options.updateOptions.page * view.options.updateOptions.per_page >= (entries.length-2)) { // last page
       view.nextButton.hide();
       view.previousButton.show();
       view.nextButton.setStyle( { 'width' : '0%'} );
       view.previousButton.setStyle( { 'width' : '100%'} );
     }
     view.drawContents(entries);
    };
    view.previousButton.onclick = function() {
     view.options.updateOptions = {
        page: --view.options.updateOptions.page,
        per_page: view.options.updateOptions.per_page
     };
     if (view.options.updateOptions.page == 1) { // first page
       view.previousButton.hide();
       view.nextButton.show();
       view.previousButton.setStyle({'width' : '0%'});
       view.nextButton.setStyle({'width' : '100%'});
     } else { // not first page
       view.previousButton.show();
       view.nextButton.show();
       view.previousButton.setStyle({'width' : '50%'});
       view.nextButton.setStyle({'width' : '50%'});
     }
     view.drawContents(entries);
    };
  }
});

ossi.open_link = function(url) {
  if (client.is_WRT_widget) {
    widget.openURL(encodeURI(url));
    return false;
  }
}
