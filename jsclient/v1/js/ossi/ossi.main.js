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

    this.channelsId = 'd8-W0MMEir3yhJaaWPEYjL'; // hardcoded id on alpha.sizl.org!
//    this.channelsId = 'bzFvEETj8r3yz7aaWPfx7J'; // hardcoded id on beta.sizl.org!
    this.sub1 = false; // pointers for case classes
    this.sub2 = false; // pointers for case classes
    this.sessionCookie = false; // for widget's cookie
    this.XHRequests = [];
    Ajax.Responders.register({ onCreate:this._onXHRCreate.bind(this), onComplete:this._onXHRComplete.bind(this) }); // set handlers for managing requests
    this.utils = new ossi.utils(this);
    this.loadingpane = new Element('div', { id : 'loading' });
    if (this.options.wall) {
      this.window.appendChild(this.loadingpane);
    } else {
      document.body.appendChild(this.loadingpane);
    }
    this.loadingpane.hide();
    this.loadingpane.addClassName('loading');
    this._getClient(); // determine which client we are serving for
    this._setClientUI(); // on the basis of the client values make CSS changes
    if (client.is_WRT_widget) { // init location engine
      this.locator = new ossi.location(this);
//      this.locator.run();
    }
    BASE_URL = (client.is_widget) ? 'https://cos.sizl.org' : '/cos'; // where to go asking for COS
    MAX_REQUEST_LENGTH = 20; // in seconds
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
        self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        self._case1b();
      },
      onSuccess : function(response) {
        self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        self._case1b();
      },
      onFailure : function(response) {
        this.case2({start : true}); // call login
      }
		});
	},
	/**
	* to remove duplication within closures
	* this is to be called only from within case1
	*/
	_case1b: function() {
	  var self = this;
    new Ajax.Request(BASE_URL+'/session', { 
      method : 'get',
      requestHeaders : (client.is_Dashboard_widget && self.sessionCookie) ? ['Cookie',self.sessionCookie] : '',
      onSuccess : function(response) {
        self._case1c(response);
      },
      on409 : function(response) {
        self._case1c(response);
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
    var json = Object.extend({
      user_id : null,
      app_id : null
    },response.responseJSON);
	  if (json.entry.user_id != null) {
  		this.userId = json.entry.user_id;
  		this.appId = json.entry.app_id;
  		// get username here instead of mainmenu or channel or whatever
  		new Ajax.Request(BASE_URL+'/people/'+this.userId+'/@self', {
  			method : 'get',
  			requestHeaders : (client.is_Dashboard_widget && self.sessionCookie) ? ['Cookie',self.sessionCookie] : '',
  			onSuccess : function(response) {
  				var json = response.responseJSON;
  				self.userName = (json.name != null) ? json.name['unstructured'] : json.username;
  				if (typeof(json.role)  != 'undefined' && json.role != null) {
  					self.userRole = json.role;
  				}
      		if (self.options.channelId) { //go to specified channel // THESE BACKCASE WILL PROBABLY NOT WORK DUE TO NEW STACK SYSTEM / JT
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
    this.mainElement.update();
    this.stack.push(this.case2.bind(this,options));
    
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

    // THIS IS NOT WELL WRITTEN SO PLEASE FIND TIME TO MODULARISE THIS INTO A SETTINGS CLASS
    // check for automatic location updates
    if (client.is_WRT_widget) {
      if (Object.isUndefined(this.settings_auto_updates)) { // first time, we don't have a value for the parameter yet
        if (Object.isUndefined(this.userId) || Object.isUndefined(this.appId)) { // force re login
          new Ajax.Request(BASE_URL + '/session', {
            method: 'delete',
            requestHeaders : (client.is_Dashboard_widget && self.sessionCookie) ? ['Cookie', self.sessionCookie] : '',
            onSuccess: function(){
              self.sessionCookie = false;
        
              delete self.userId; //deleted so that attribute could be indicator of valid session.
              delete self.userName;
              delete self.userRole;
              if (! Object.isUndefined(self.locator)) self.locator.stop();
        
              self.case1({
                out: true
              });
              return;
            }
          });
        }
        var URL = BASE_URL + '/appdata/'+self.userId+'/@self/'+self.appId;
        new Ajax.Request(URL, {
          method : 'get',
          requestHeaders : (client.is_Dashboard_widget && self.sessionCookie) ? ['Cookie',self.sessionCookie] : '',
          onSuccess : function(response) {
            var json = response.responseJSON;
            if (Object.isUndefined(json.entry.settings_auto_updates)) {
              // create the settings key with default value true
              var params = {
                'data[settings_auto_updates]' : true
              };
              new Ajax.Request(URL, {
                method : 'put',
                parameters : params,
                requestHeaders : (client.is_Dashboard_widget && self.sessionCookie) ? ['Cookie',self.sessionCookie] : ''
              });
              self.settings_auto_updates = true;
            } else { // object exists

              // ASI converts these into strings thus:
              if (json.entry.settings_auto_updates == 'true') {
                self.settings_auto_updates = true;
              } else if (json.entry.settings_auto_updates == 'false') {
                self.settings_auto_updates = false;
              }
            }

            // act accordingly 
            if (self.settings_auto_updates) {
              if (client.is_WRT_widget) self.locator.run();
            }
          },
          onFailure : function(response) {
          }
          
        });
      } else if (this.autoUpdates) {
        if (client.is_WRT_widget) this.locator.run();
      } // no else
    }

    // stack stuff
    this.stackReset();
    var opt = Object.clone(options);
    opt.out = true;
    opt.start = false;
    this.stack.push(this.case3.bind(this,opt));
		
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
      }.bind(this));
    } else {
      this.utils.into(this.sub2.pane,this.sub1.pane,function() {
        this.sub2.destroy();
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
      backCase : false
	  },options);

    // manage stack
    if (options.out) this.stack.pop();
    else {
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
      backCase : false
	  },options);

    // stack stuff
    if (options.out) this.stack.pop();
    else { 
      var opt = Object.clone(options);
      opt.out = true;
      this.stack.push(this.case18.bind(this,opt));
    }
		
    this.sub2 = this.sub1;
    this.sub1 = new ossi.channellist(this, {  'hostElement' : this.mainElement,
                                              'groupId' : options.groupId,
                                              'selfUpdate' : true,
                                              'backCase' : this.stack[this.stack.length-2]});
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
	* create channel
	*/
	case19: function(options) {
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
      this.stack.push(this.case19.bind(this,opt));
    }

    this.sub2 = this.sub1;
    this.sub1 = new ossi.createchannel(this, {
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
	* _getClient
	*
	* sets values for a global client object
	*/
  _getClient: function() {
    var agent = navigator.userAgent;
	  client = {};
	  client.is_widget = (typeof(window.widget) != 'undefined') ? true : false;
    client.is_WRT_widget = false;
    client.is_Dashboard_widget = false;
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

    } else if (client.is_WRT_widget) {
      var self = this;
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
    } else if (this.options.width && this.options.height) {
      this.mainElement.setStyle({
        width: this.options.width+'px',
        height: this.options.height+'px'
      });
      this.loadingpane.setStyle({
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
	* showLoading
	*
	* shows loading animation on top the UI
	*/
	showLoading: function() {
    this.loadingpane.show();
	  this.utils.spinLoader();
	},
	/**
	* hideLoading
	*
	* hides loading animation
	*/
	hideLoading: function() {
    this.loadingpane.hide();
	  this.utils.stopLoader();
	}
});