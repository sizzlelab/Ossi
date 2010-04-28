/**
* ossi main class
*/
ossi.main = Class.create(ossi.base,{
	initialize: function(options) {
	  this.options = Object.extend({
      channelId : false,
      chrome : false,
      width : false,
      height : false,
      x : false,
      y : false,
      wall : false
    },options);
    WIDGET_VIEWPORT = { height : 428, width : 313 }; // set these to same values as for #content_area.widget in main.css
    this.stack = []; // array stack for use cases queue

    // if this is a wall then create chrome for the window
    if (this.options.wall) {
      var self = this;
      this.window = new Element('div', { id : 'ossi_window' });
      this.windowHandle = new Element('div', { id : 'ossi_window_handle' });
      this.windowContent = new Element('div', { id : 'ossi_window_content' });
      document.body.appendChild(this.window);
      this.window.appendChild(this.windowContent);
      this.window.appendChild(this.windowHandle);
      this.window.setStyle({
        position : 'absolute',
        top : '100px',
        left : '100px',
        background : '#000',
        border : 'solid #444 2px',
        width : WIDGET_VIEWPORT.width+'px',
        height : WIDGET_VIEWPORT.height+'px'
      });
      this.windowHandle.setStyle({
        position : 'absolute',
        right : '-29px',
        top : '10px',
        width : '25px',
        height : '90px',
        background : '#555',
        cursor : 'pointer',
        color : '#ff8a21',
        fontFamily : 'helvetica',
        fontWeight : 'bold',
        fontSize : '14px',
        textAlign : 'center',
        paddingTop : '10px',
//        layoutFlow: 'vertical-ideographic',
        border : 'solid #444 2px'
      });
      var h = '\
        O<br />S<br />S<br />I\
        <div id="ossi_toggle_window_button" style="position:absolute; left:8px; bottom:10px; width:10px; height:10px; background:red;"><img id="ossi_toggle_button_image" src="../images/ossi_minimize_button.png" border="0" /></div>\
        <img src="../images/ossi_maximize_button.png" style="display:none" />\
      ';
      this.windowHandle.update(h);
      this.windowToggleButton = $('ossi_toggle_window_button');
      this.windowToggleButton.onclick = function() {
        if (!Object.isUndefined(self.wallHidden)) {
          if (self.wallHidden) { 
            self.utils.showWall();
            $('ossi_toggle_button_image').src = '../images/ossi_minimize_button.png';
          } else {
            self.utils.hideWall();
            $('ossi_toggle_button_image').src = '../images/ossi_maximize_button.png';
          }
        } else{
          self.utils.hideWall(this.window);
          $('ossi_toggle_button_image').src = '../images/ossi_maximize_button.png';
        }
      }
      this.windowContent.setStyle({
        position : 'absolute',
        left : '0px',
        top : '0px',
        width : WIDGET_VIEWPORT.width+'px',
        height : WIDGET_VIEWPORT.height+'px',
        overflowY : 'auto',
        overflowX : 'hidden'
      });
    }

    // create main content element
    if (this.options.wall) {
      this.mainElement = this.windowContent;
//      this.windowContent.appendChild(this.mainElement);
      new Draggable(this.window, { 
        handle : this.windowHandle,
        onStart : function() {
          this.wallHidden = false;
        }.bind(this)
      });
    } else {
      this.mainElement = new Element('div', { id : 'content_area' });
      document.body.appendChild(this.mainElement);
    }

    this.sub1 = false; // pointers for case classes
    this.sub2 = false; // pointers for case classes
    this.sessionCookie = false; // for widget's cookie
    this.XHRequests = [];
    Ajax.Responders.register({ onCreate:this._onXHRCreate.bind(this), onComplete:this._onXHRComplete.bind(this) }); // set handlers for managing requests
    this.utils = new ossi.utils(this);
    this.loadingpane = new Element('div', { id : 'loading' });
    this.locatingpane = new Element('div', { id : 'loading' });
    if (this.options.wall) {
      this.window.appendChild(this.loadingpane);
      this.window.appendChild(this.locatingpane);
    } else {
      document.body.appendChild(this.loadingpane);
      document.body.appendChild(this.locatingpane);
    }
    this.loadingpane.hide();
    this.locatingpane.hide();
    this.loadingpane.addClassName('loading');
    this.locatingpane.addClassName('loading');
    this._getClient(); // determine which client we are serving for
    this._setClientUI(); // on the basis of the client values make CSS changes
    if (client.is_WRT_widget) { // init location engine
//      this.locator = new ossi.location(this);
//      this.locator.run();
    }

//    BASE_URL = (client.is_widget || client.is_phonegap) ? 'http://ke-hupnet245-25.hupnet.helsinki.fi:3000' : '/cos'; // where to go asking for COS
//    BASE_URL = (client.is_widget || client.is_phonegap) ? 'https://ossi.alpha.sizl.org/cos' : '/cos-alpha'; // where to go asking for COS
    BASE_URL = (client.is_widget || client.is_phonegap) ? 'https://ossi.sizl.org/cos' : '/cos'; // where to go asking for COS
    GOOGLE_API_KEY = 'ABQIAAAAb5W9C1rg1PQ9V8v9J83iBRS5JptRWcT-q32CJ-O8HE4hq0Hf5hSz_0dBGha5w80BLYWBr0JC6ldFgA';
//    BASE_URL = (client.is_widget || client.is_phonegap) ? 'https://ossi.sizl.org/cos' : '/cos'; // where to go asking for COS
//    BASE_URL = 'https://cos.sizl.org'; // where to go asking for COS
    MAX_REQUEST_LENGTH = 30; // in seconds
    this.tmp = []; // for timers etc. May be deleted at any time.
	  this.case1(); // go to first use case
	},
	/**
	* reset stack
	*/
	stackReset: function() {
    this.stack = [];
	},
		/**
	* application start
	*/
/*
	case1: function(options) {
		var self = this;
		var options = Object.extend({
			out : false
		},options);
//    this.splash.hide();
    this.mainElement.update('');
  	this.mainElement.show();
    this.showLoading();

    // first do a POST to /session to get cookie info for widget
    // i.e. logging in without user
    var params =  { 'session[app_name]' : 'ossi',
                    'session[app_password]' : 'Z0ks51r'
                  };
    new Ajax.Request(BASE_URL+'/session', {
      method : 'post',
      parameters : params,
      on409 : function(response) { // server returns 409 error, meaning session already exists
        if (client.is_Dashboard_widget) {
          self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        }
        else {
          self.sessionCookie = document.cookie;
        }
        self._case1b();
      },
      onSuccess : function(response) {
        if (client.is_Dashboard_widget) {
          self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        }
        else {
          self.sessionCookie = document.cookie;
        }
        self._case1b();
      },
      onFailure : function(response) {
        if (client.is_Dashboard_widget) {
          self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        }
        else {
          self.sessionCookie = document.cookie;
        }
        this.case2({start : true}); // call login
      }
		});
	},
*/
	case1: function() {
	  var self = this;
    this.mainElement.update('');
  	this.mainElement.show();
    this.showLoading();
    new Ajax.Request(BASE_URL+'/session?'+ new Date().getTime(), { 
      method : 'get',
      onSuccess : function(response) {
        if (client.is_Dashboard_widget) {
          self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        } else {
          self.sessionCookie = document.cookie;
        }
        self._case1c(response);
      },
      on409 : function(response) {
        if (client.is_Dashboard_widget) {
          self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        } else {
          self.sessionCookie = document.cookie;
        }
        self._case1c(response);
      },
      onFailure : function(response) {
        if (client.is_Dashboard_widget) {
          self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        } else {
          self.sessionCookie = document.cookie;
        }
        self.hideLoading();

        // here check whether user is logged into facebook
        FB.getLoginStatus(function(response) {
          if (response.session) {
            self.case35(); // user is logged into FB
          } else {
            self.case2({start : true}); // user is not logged into FB
          }
        });        
      }
    });
  },
  /**
  * to remove duplication
  * called only from _case1b
  */
  _case1c: function(response) {
    var self = this;
    this.hideLoading();
    var json = {};
    json.entry = Object.extend({
      user_id : null,
      app_id : null
    },response.responseJSON.entry);
	  if (json.entry.user_id != null) {
  		this.userId = json.entry.user_id;
  		this.appId = json.entry.app_id;
  		// get username here instead of mainmenu or channel or whatever
  		new Ajax.Request(BASE_URL+'/people/'+this.userId+'/@self', {
  			method : 'get',
  			onSuccess : function(response) {
  				var json = response.responseJSON;
  				self.userName = (json.entry.name != null) ? json.entry.name['unstructured'] : json.entry.username;
  				if (typeof(json.role)  != 'undefined' && json.role != null) {
  					self.userRole = json.role;
  				}
      		if (self.options.channelId) { //go to specified channel // THIS BACKCASE WILL PROBABLY NOT WORK DUE TO NEW STACK SYSTEM / JT
      			self.case20({start : true, channelId : self.options.channelId,
      				backCase : self.case18.bind(self,{ out : true, backCase : self.case3.bind(self,{out:true})
      				})
      			});
      		} else { // go to main
      			self.case3({start : true});
      		}
  			}
  		});
    } else { // user not identified
      this.userId = false;
      this.userName = 'Anonymous';
  		if (this.options.channelId && this.options.wall) { 
  			this.case24({channelId : this.options.channelId }); // go to wall
  		} else if(this.options.channelId && !this.options.wall) {
  			this.case2({start : true, channelId : this.options.channelId}); // go to login and then channel
  		} else {
  			this.case2({start : true }); // go to login
  		}
    }
  },

	/**
	* login
	*/
	case2: function(options) {
		var options = Object.extend({
	      out : false,
	      backCase : false,
	      channelId : false,
	      start : false
		  },options);
    
    // Add this item to stack
    if (options.start) this.mainElement.update();
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      opt.start = false;
      this.stack.push(this.case2.bind(this,opt));
    }
    
    if (options.start) { // login without effects (first time)
			if (options.channelId) {
				this.sub1 = new ossi.login(this, {	'hostElement' : this.mainElement,
	      											              'channelId' : options.channelId,
      	                                  	'backCase' : options.backCase});
			} else {
				this.sub1 = new ossi.login(this, {	'hostElement' : this.mainElement,
                  													'backCase' : options.backCase});
			}
	    this.sub1.pane.show();
    } else { // login page emerges with fx
		  this.sub2 = this.sub1;
			if (options.channelId) {
				this.sub1 = new ossi.login(this, {	'hostElement' : this.mainElement,
	      											              'channelId' : options.channelId,
      	                                  	'backCase' : options.backCase});
			} else {
				this.sub1 = new ossi.login(this, {	'hostElement' : this.mainElement,
      	                                  	'backCase' : options.backCase});
			}
      if (options.out) {
        this.utils.out(this.sub2.pane,this.sub1.pane,function() {
          this.sub2.destroy();
        }.bind(this));
      } else {
        this.utils.into(this.sub2.pane,this.sub1.pane,function() {
          this.sub2.destroy();
        }.bind(this));
      }
    }
	},
	/**
	* main screen
	*/
	case3: function(options) {
    var self = this;

		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // stack stuff
    this.stackReset();
    var opt = Object.clone(options);
    opt.out = true;
    opt.start = false;
    this.stack.push(this.case3.bind(this,opt));

    // trial
    if (!options.out) {
      this.case18({});
      return;
    }
		// end of trial code
		
    if (options.start) {
      this.sub1 = new ossi.mainmenu(this, {
        'hostElement' : this.mainElement,
        'backCase' : options.backCase
      });
      this.sub1.pane.show();
      this.sub1.update();
    } else {
      this.sub2 = this.sub1;
      this.sub1 = new ossi.mainmenu(this, {
        'hostElement' : this.mainElement,
        'backCase' : options.backCase
      });
      if (options.out) {
        this.utils.out(this.sub2.pane,this.sub1.pane,function() {
          this.sub2.destroy();
          this.sub1.update();
        }.bind(this));
      } else {
        this.utils.into(this.sub2.pane,this.sub1.pane,function() {
          this.sub2.destroy();
          this.sub1.update();
        }.bind(this));
      }
    }
	},
	/**
	* about screen
	*/
	case4: function(options) {
		var options = Object.extend({
      backCase : false
	  },options)

    // manage stack
    if (options.out) this.stack.pop();
    else {
     var opt = Object.clone(options);
     opt.out = true;
     this.stack.push(this.case4.bind(this, opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.about(this, {
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    this.utils.into(this.sub2.pane,this.sub1.pane,function() {
      this.sub2.destroy();
    }.bind(this));
	},
	/**
	* signup
	*
	* (these basic screens are beginning to look very similar to each other
	* we could probably push them through an eval script later to 
	* minimise code)
	*/
	case5: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case5.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.signup(this, { 
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* dialog
	*/
	case6: function(options) {
		var options = Object.extend({
      backCase : false,
      message : false,
      skipPrevious : false,
      buttonText : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      if (options.skipPrevious == false) this.stack.push(this.case6.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.dialog(this,  {  
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2],
      'message' : options.message,
      'buttonText' : options.buttonText
    });

    this.utils.into(
      this.sub2.pane,
      this.sub1.pane,
      function() {this.sub2.destroy();}.bind(this)
    );
	},
	/**
	* status
	*/
	case7: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case7.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.status(this, {
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* my profile
	*/
	case8: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case8.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.myprofile(this, {  
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* friend list
	*/
	case9: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case9.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.friendlist(this, {   
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* find users
	*/
	case11: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case11.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.findusers(this, {  
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    }
	},
	/**
	* search results
	*/
	case12: function(options) {
		var options = Object.extend({
      search : false,
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case12.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.searchresults(this, {
      'hostElement' : this.mainElement,
      'search' : options.search,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* public profile
	*/
	case13: function(options) {
		var options = Object.extend({
      pendingNav : false,
      search : false,
      userId : false,
      out : false,
      backCase : false,
      channelListUpdateOptions : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      if (options.channelListUpdateOptions != false) { // modify the previous item by adding pagination references
        this.stack.pop();
        var o = {
          out : true,
          updateOptions : options.channelListUpdateOptions
        };
        this.stack.push(this.case18.bind(this,o));
      }
      
      // now add this case
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case13.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.profile(this, {
      'hostElement' : this.mainElement,
      'pendingNav' : options.pendingNav,
      'search' : options.search,
      'userId' : options.userId,
      'backCase' : this.stack[this.stack.length-2],
      'channelListUpdateOptions' : options.channelListUpdateOptions
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* pending friends list
	*/
	case14: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case14.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.pendingfriends(this, { 
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* terms and conditions
	*/
	case15: function(options) {
		var options = Object.extend({
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case15.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.terms(this, {
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    this.utils.into(this.sub2.pane,this.sub1.pane,function() {
      this.sub2.destroy();
    }.bind(this));
	},
	/**
	* consent form
	*/
	case16: function(options) {
		var options = Object.extend({
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case16.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.consent(this, {
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    }
	},
	/**
	* programme information
	*/
	case17: function(options) {
		var options = Object.extend({
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case17.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.information(this, {
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });
    this.utils.into(this.sub2.pane,this.sub1.pane,function() {
      this.sub2.destroy();
    }.bind(this));
	},
	/**
	* channel list
	*/
	case18: function(options) {
		var options = Object.extend({
      groupId : false,
      out : false,
      sizzleMode : true,
      updateOptions : {
        per_page: 8,
        page: 1
      },
      backCase : false
	  },options);

    // stack stuff
    if (options.out) this.stack.pop();
    else { 
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case18.bind(this,opt));
    }
		
		if (Object.isUndefined(this.sub1)) this.sub1 = {};
    this.sub2 = this.sub1;
    this.sub1 = new ossi.channellist(this, {  'hostElement' : this.mainElement,
                                              'groupId' : options.groupId,
                                              'sizzleMode' : options.sizzleMode,
                                              'updateOptions' : options.updateOptions,
                                              'selfUpdate' : true,
                                              'backCase' : this.stack[this.stack.length-2]});
    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      if (Object.isUndefined(this.sub2.destroy)) {
        this.sub1.pane.show();
        this.sub1.update();
      } else {
        this.utils.into(this.sub2.pane,this.sub1.pane,function() {
          this.sub2.destroy();
          this.sub1.update();
        }.bind(this));
      }
    }
	},
	/**
	* create channel
	*/
	case19: function(options) {
		var options = Object.extend({
      out : false,
      personId : false,
      groupId : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case19.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.createchannel(this, {
      'personId' : options.personId,
      'groupId' : options.groupId,
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    }
	},
  /**
	* show channel contents
	*/
	case20: function(options) {
		var options = Object.extend({
  	  start : false,
  	  out : false,
  	  groupId : false,
  	  channelId : false,
  	  backCase : false,
		  startIndex : 1
		},options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      if (options.channelListUpdateOptions != false) { // modify the previous item by adding pagination references
        this.stack.pop();
        var o = {
          out : true,
          updateOptions : options.channelListUpdateOptions
        };
        this.stack.push(this.case18.bind(this,o));
      }

      // now add this case
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case20.bind(this,opt));
    }

		this.sub2 = this.sub1;
  	this.sub1 = new ossi.channel(this, {  
  	  'hostElement' : this.mainElement,
      'selfUpdate' : true,
   	  'groupId' : options.groupId,
   	  'channelId' : options.channelId,
      'wall' : this.options.wall,
  	  'backCase' : this.stack[this.stack.length-2],
//  	  'backCase' : options.backCase,
      'startIndex' : options.startIndex
		});
		if (options.start) {
  		this.sub1.pane.show();
  		this.sub1.update();
		} else {
	    if (options.out) {
	      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
	        this.sub2.destroy();
	        this.sub1.update();
	      }.bind(this));
	    } else {
	      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
	        this.sub2.destroy();
	        this.sub1.update();
	      }.bind(this));
	    }
		}
	},
  /**
	* add new post
	*/
	case21: function(options) {
		var options = Object.extend({
      out : false,
      priv : false,
      channelId : false,
      replyToId : false,
      postId : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case21.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.mypost(this, {   
      'hostElement' : this.mainElement,
      'priv' : options.priv,
      'channelId' : options.channelId,
      'replyToId' : options.replyToId,
      'postId' : options.postId,
      'backCase' : this.stack[this.stack.length-2]
    });
    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        if (options.postId) this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        if (options.postId || options.replyToId) this.sub1.update();
      }.bind(this));
    }
	},
  /**
	* view post
	*/
	case22: function(options) {
		var options = Object.extend({
      out : false,
      channelId : false,
      postId : false,
      backCase : false,
	  startIndex : 1
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case22.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.post(this, {
      'hostElement' : this.mainElement,
      'channelId' : options.channelId,
      'postId' : options.postId,
      'backCase' : this.stack[this.stack.length-2],
			'startIndex' : options.startIndex
		});

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        if (options.postId) this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        if (options.postId) this.sub1.update();
      }.bind(this));
    }
	},
  /**
	* change avatar
	*/
	case23: function(options) {
		var options = Object.extend({
      out : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case23.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.avatar(this, {
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        if (options.postId) this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        if (options.postId) this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* show channel contents without session - NOT IN STACK!!!
	*/
	case24: function(options) {
		var options = Object.extend({
			out : false,
			channelId : false,
			backCase : false
		},options);
    this.sub1 = new ossi.channel(this, {	'hostElement' : this.mainElement,
											'wall' : true,
											'selfUpdate' : true,
											'count' : 7,
											'channelId' : options.channelId
										});
	this.sub1.pane.show();
	this.sub1.update();

	},
	/**
	* show groups page
	*/
	case25: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case25.bind(this,opt));
    }
		
    this.sub2 = this.sub1;
    this.sub1 = new ossi.grouplist(this, {
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* create group
	*/
	case26: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case26.bind(this,opt));
    }
		
    this.sub2 = this.sub1;
    this.sub1 = new ossi.creategroup(this, {  'hostElement' : this.mainElement,
                                              'backCase' : this.stack[this.stack.length-2]});
    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    }
	},
  /**
	* group profile page
	*/
	case27: function(options) {
		var options = Object.extend({
    	  out : false,
    	  groupId : false,
    	  backCase : false
		},options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case27.bind(this,opt));
    }
		
		this.sub2 = this.sub1;
  	this.sub1 = new ossi.group(this, {  
  	  'hostElement' : this.mainElement,
      'groupId' : options.groupId,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
  /**
	* group members
	*/
	case28: function(options) {
		var options = Object.extend({
    	  out : false,
    	  groupId : false,
    	  backCase : false
		},options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case28.bind(this,opt));
    }

		this.sub2 = this.sub1;
  	this.sub1 = new ossi.groupmembers(this, { 
  	  'hostElement' : this.mainElement,
      'selfUpdate' : true,
      'groupId' : options.groupId,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},

  /**
	* change password
	*/
	case29: function(options) {
      var options = Object.extend({
        out : false
      },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case29.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.changepassword(this, { 
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},

    /**
	* search
	*/
	case30: function(options) {
    var options = Object.extend({
      out : false
    },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case30.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.search(this, {   'hostElement' : this.mainElement,
                                          'backCase' : this.stack[this.stack.length-2]});
    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    }
	},

    /**
	* swap back from previous case without recreating sub1 and sub2
	* (for getting back from dialog without losing user's browse path)
	*/
	case31: function(options) {
    var tmp = this.sub2;
    this.sub2 = this.sub1;
    this.sub1 = tmp;

    this.utils.out(this.sub2.pane,this.sub1.pane,function() {
      this.sub2.destroy();
      this.sub1._draw();
      this.sub1.update();
    }.bind(this));
	},
	
	/**
	* search all results
	*/
	case32: function(options) {
		var options = Object.extend({
      search : false,
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case32.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.searchallresult(this, {
      'hostElement' : this.mainElement,
      'search' : options.search,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* other user's friend list
	*/
	case33: function(options) {
		var options = Object.extend({
      userId : false,
      out : false,
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case9.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.friendlist(this, {   
      'userId' : options.userId,
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
        this.sub1.update();
      }.bind(this));
    }
	},
	/**
	* view user on map
	*/
	case34: function(options) {
		var options = Object.extend({
      items : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case9.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.map(this, {   
      'items' : options.items,
      'hostElement' : this.mainElement,
      'backCase' : this.stack[this.stack.length-2]
    });

    if (options.out) {
      this.utils.out(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
      }.bind(this));
    }
	},
	/**
	* handle FB connect stuff
	*/
	case35: function() {
    alert('case35');
    this._appLogin(this.case3.bind(this));
	},
	/**
	* login as application only
	* for FB use
	*/
  _appLogin: function(callback) {
    alert('appLogin');
    var self = this;
    var params =  { 'session[app_name]' : 'ossi',
                    'session[app_password]' : 'Z0ks51r'
                  };
    self.parent.showLoading();
    new Ajax.Request(BASE_URL+'/session', { 
      method : 'post',
      parameters : params,
      on409 : function() { // found existing session, removing it first!
        new Ajax.Request(BASE_URL+'/session', {
          onSuccess : function() {
            self.parent.sessionCookie = false;
            self._appLogin();
          },
          onFailure : function() {
            self.parent.hideLoading();
            self.parent.case6({
              backCase : self.parent.case2.bind(self.parent,{out:true}),
              message : "Found an existing user session, removed it, but after that could not proceed to login with Ossi.",
              buttonText : "Try again"
            });
          }
        });
      },
      onSuccess : function(response) {
        var json = response.responseJSON;
        self.parent.sessionCookie = self.parent.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        callback.apply();
      }
    });
  },
	/**
	* _getClient
	*
	* sets values for a global client object
	*/
  _getClient: function() {
    var agent = navigator.userAgent;
	  client = {};
	  client.is_widget = (typeof(window.widget) != 'undefined') ? true : false;
    client.is_iphone = false
    client.is_WRT_widget = false
    client.is_Dashboard_widget = false
    client.is_phonegap = false
    client.is_safari = false;
	  if (client.is_widget) {
      if (agent.include('Series60')) { // if we're running inside Nokia WRT
        client.is_WRT_widget = true;
	      client.dimensions = document.viewport.getDimensions();
      } else { // if not then we assume User Agent is an OS X Dashboard
        client.is_Dashboard_widget = true;
	      client.dimensions = WIDGET_VIEWPORT;
      }
	  } else if (this.options.width && this.options.height) {
	    client.dimensions = { height : this.options.height, width : this.options.width }
	  } else if (this.options.wall) {
      client.dimensions = WIDGET_VIEWPORT;
	  } else if (agent.include('iPhone')) {
	    client.is_iphone = true;
	    if (agent.include('Safari')) {
	      client.is_phonegap = false;
	      client.is_safari = true;
	    } else { // this fails if some other browser is used on iPhone (not available in 9/2009)
	      client.is_phonegap = true;
	      client.is_safari = false;
	    }
	    client.dimensions = document.viewport.getDimensions();
	  } else {
	    client.dimensions = document.viewport.getDimensions();
	  }
  },
  /**
  * _setClientUI
  *
  * make CSS changes according to client
  *
  */
  _setClientUI: function() {
    if (client.is_Dashboard_widget) {
      document.body.addClassName('widget');
      this.mainElement.addClassName('widget');
      this.loadingpane.addClassName('widget');
      this.locatingpane.addClassName('widget');

    } else if (client.is_WRT_widget) {
      var self = this;
//      document.styleSheets[1].disabled = false;
      try {
        this.serviceInfo = device.getServiceObject("Service.SysInfo", "ISysInfo");
      } catch (ex) {
        delete this.serviceInfo;
      }
      this.orientation = -1;
    	new PeriodicalExecuter(function(pe) {
        var criteria = {
          Entity : 'Display',
          Key : 'DisplayOrientation'
        };
        if (window.widget.isrotationsupported) {
          try {
            var t = self.serviceInfo.ISysInfo.GetInfo(criteria).ReturnValue.Status;
            if (self.orientation != t) client.dimensions = document.viewport.getDimensions();
            self.orientation = t;
          } catch (ex) {
            return;
          }
        }
    	}, 2);
      
    } else if (this.options.wall) {
      this.loadingpane.addClassName('wall');
      this.locatingpane.addClassName('wall');
    } else if (this.options.width && this.options.height) {
      this.mainElement.setStyle({
        width: this.options.width+'px',
        height: this.options.height+'px'
      });
      this.loadingpane.setStyle({
        width: this.options.width+'px'
      });
      this.locatingpane.setStyle({
        width: this.options.width+'px'
      });
    }
  },
	/**
	* reset
	*
	* effectively resets the application
	*/
  reset: function() {
    var self = this;
    Ajax.Responders.unregister({ onCreate:this._onXHRCreate.bind(this), onComplete:this._onXHRComplete.bind(this) }); // set handlers for managing requests
    if (this.sessionCookie) this.sessionCookie = false;
    this.hideLoading();
    this.case6({
      message : "There has been an error within Aalto Social Interface, or Ossi has been unable to reach Aalto Social Interface. You may have lost network connectivity. Please try again later!",
      buttonText : "Restart application",
      backCase: function() { window.location.reload(); }.bind(self)
    });
    this.reset = function() { return };
  },
  /**
  * _onXHRCreate
  *
  * handler for managing XHRequests. Called onCreate.
  */
  _onXHRCreate: function(request) {
//    if (client.is_Dashboard_widget && this.sessionCookie) request.options.requestHeaders = ['Cookie',this.sessionCookie]; // if client is Dashboard, then manually slap cookie onto every single request (due to Dashboard bug)
//    if ((client.is_Dashboard_widget || client.is_phonegap) && this.sessionCookie) request.options.requestHeaders = ['Cookie',this.sessionCookie]; // if client is Dashboard, then manually slap cookie onto every single request (due to Dashboard bug)
    if (client.is_Dashboard_widget) request.options.requestHeaders = ['Cookie',this.sessionCookie]; // if client is Dashboard, then manually slap cookie onto every single request (due to Dashboard lacking cookie support)
//    if (request.method == 'get' && client.is_WRT_widget) {
//      request.parameters.force_refresh = new Date().getTime();
//    }
    this.XHRequests.push(request);
    this.tmp.push(setTimeout(function(request) {
      for (var i=0; i<this.XHRequests.length; i++) {
        var stored_request = this.XHRequests[i];
        if (stored_request == request) { // we have a lagging connection, so clear the array, kill the connection and reset application
          this._cancelRequests();
          this.reset(); // call reset on application
        }
      }
    }.bind(this,request), MAX_REQUEST_LENGTH*1000));
  },
  /**
  *
  *
  */
  _cancelRequests: function() {
    for (var i=0; i<this.XHRequests.length; i++) {
      var request = this.XHRequests[i];
      request.transport.abort();
      request = null;
      delete request;
    }
    this.XHRequests = [];
  },
  /**
  * _onXHRComplete
  *
  * handler for managing XHRequests. Called on complete.
  */
  _onXHRComplete: function(request) {
    // check whether we still have network connectivity
    // i.e. parse response.transport.status for 500 series codes
    if (request.transport.status >= 500 && request.transport.status <= 600) {
      this._cancelRequests();
      for (var k=0; k<this.tmp; k++) {
        clearTimeout(this.tmp[k]);
      }
      this.reset(); // call reset on application
      return;
    } else {
      for (var i=0; i<this.XHRequests.length; i++) {
        var stored_request = this.XHRequests[i];
        if (stored_request == request) {
          this.XHRequests.splice(i,1);
          break;
        }
      }
    }
  },
  	/**
	* reLogin
	*
	* hack for flaky WRT
	* sometimes WRT just decides to drop cookies, if that happens then re-login
	*/
  
	/**
	* showLoading
	*
	* shows loading animation on top the UI
	*/
	showLoading: function() {
    this.loadingpane.show();
    if (Object.isUndefined(this.utils.spinning)) {
	    this.utils.spinLoader();
    }
	},
	/**
	* hideLoading
	*
	* hides loading animation
	*/
	hideLoading: function() {
    this.loadingpane.hide();
//	  this.utils.stopLoader();
	},
	/**
	* showLocating
	*
	* shows locating animation on top the UI
	*/
	showLocating: function() {
    this.locatingpane.show();
    if (Object.isUndefined(this.utils.locatingspinning)) {
	    this.utils.spinLocater();
    }
	},
	/**
	* hideLocating
	*
	* hides locating animation
	*/
	hideLocating: function() {
    this.locatingpane.hide();
//	  this.utils.stopLoader();
	}
});