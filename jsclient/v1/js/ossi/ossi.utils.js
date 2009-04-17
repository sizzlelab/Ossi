/**
* ossi utils class
*/
ossi.utils = Class.create(ossi.base,{
	initialize: function(parent) {
    this.parent = parent;
	  this.loadertexts =  [ 'loadin.g',
	                        'loadi.ng',
	                        'load.ing',
	                        'loa.ding',
	                        'lo.ading',
	                        'l.oading',
	                        'lo.ading',
	                        'loa.ding',
	                        'load.ing',
	                        'loadi.ng'];
	  this.loadertimer = false;
	  this.loadercounter = 0;
	},
  getSpeed: function(o,d,current,max_speed,f) {
  	if(o>d){var dist=o-d;var perc=Math.abs((o-current)/dist);}
  	else if(d>o){var dist=d-o;var perc=Math.abs((current-o)/dist);}
  	if(max_speed>(dist/4)){max_speed=dist/4;}
  	var tmp=(-(Math.PI/2))+((Math.PI/2)*perc*2);tmp=Math.cos(tmp)*max_speed;tmp=Math.ceil(tmp);if(f&&perc<0.5)tmp=Math.ceil(max_speed);if(o>d)tmp=-(tmp);return tmp;
  },
  out: function(a,b,callback) {
    var self = this;
  	a.setStyle({left:'0px', width:client.dimensions.width+'px'});
  	b.setStyle({left:-client.dimensions.width+'px', width:client.dimensions.width+'px'});
  	b.show();
  	a.scrollTo();
  	new PeriodicalExecuter(function(pe) {
  		var speed = self.getSpeed(0,client.dimensions.width,parseInt(a.getStyle('left')),40,1);
  		a.setStyle({left:(parseInt(a.getStyle('left'))+speed)+'px'});
  		b.setStyle({left:(parseInt(b.getStyle('left'))+speed)+'px'});
  		if (parseInt(b.getStyle('left')) == 0) {
  			pe.stop();
  			a.hide();
  			callback.apply();
  		}
  	}, 0.01);
  },
  into: function(a,b,callback) {
    var self = this;
  	a.setStyle({left:'0px', width:client.dimensions.width+'px'});
  	b.setStyle({left:client.dimensions.width+'px', width:client.dimensions.width+'px'});
  	b.show();
  	a.scrollTo();
  	new PeriodicalExecuter(function(pe) {
  		var speed = self.getSpeed(client.dimensions.width,0,parseInt(b.getStyle('left')),40,1);
  		a.setStyle({left:(parseInt(a.getStyle('left'))+speed)+'px'});
  		b.setStyle({left:(parseInt(b.getStyle('left'))+speed)+'px'});
  		if (parseInt(b.getStyle('left')) == 0) {
  			pe.stop();
  			a.hide();
  			callback.apply();
  		}
  	}, 0.01);
  },
  spinLoader: function() {
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
  agoString: function(UTC_string) {
    
    // return string
    var h = '';
    
    // argument date to epoch
    var d = UTC_string;
    var a = Date.UTC(d.substring(0,4),d.substring(5,7),d.substring(8,10),d.substring(11,13),d.substring(14,16),d.substring(17,19));

    // now to epoch
    var e = new Date();
    var b = Date.UTC(e.getUTCFullYear(),(e.getUTCMonth()+1),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds());

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
  }  
});
