/**
* naepsy main class
*/
naepsy.main = Class.create(naepsy.base,{
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

    // add main element
    this.mainElement = new Element('div', { id : 'content_area' });
    document.body.appendChild(this.mainElement);
    this.mainElement.setStyle({height:'100%', width:'100%'});
    this.mainElement.insert('<div style="width:100%; height:100%; position:absolute; top:0px; left:0px; z-index:1;"><img src="images/background.png" border="0" width="100%" height="100%" /></div>');

    this.sub1 = false; // pointers for case classes
    this.sub2 = false; // pointers for case classes
    this.sessionCookie = false; // for widget's cookie

    // XHR management
    this.XHRequests = [];
    Ajax.Responders.register({ onCreate:this._onXHRCreate.bind(this), onComplete:this._onXHRComplete.bind(this) }); // set handlers for managing requests

    // loading panel
    this.utils = new naepsy.utils(this);
    this.loadingpane = new Element('div', { id : 'loading' });
    document.body.appendChild(this.loadingpane);
    this.loadingpane.hide();
    this.loadingpane.addClassName('loading');

    // do client UI stuff (which client is in question etc...)
    this._getClient(); // determine which client we are serving for
    this._setClientUI(); // on the basis of the client values make CSS changes

    // base URL for COS / ASI
    BASE_URL = (client.is_widget || client.is_phonegap) ? 'https://ossi.sizl.org/cos' : '/cos'; // where to go asking for COS
//    BASE_URL = 'https://cos.sizl.org'; // where to go asking for COS
    MAX_REQUEST_LENGTH = 30; // in seconds
    this.tmp = []; // for timers etc. May be deleted at any time.

    // start application
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
    // first check if we have a session ID saved via the widget interface
//    var sessionID = widget.preferenceForKey('session-id');
//    alert(widget.preferenceForKey('session-id'));
//    if (! Object.isUndefined(widget.preferenceForKey('session-id'))) {
//      this.sessionCookie = widget.preferenceForKey('session-id');
//      alert(this.sessionCookie);
//    }

		var self = this;
		var options = Object.extend({
			out : false
		},options);
//    this.splash.hide();
//    this.mainElement.update('');
  	this.mainElement.show();
    this.showLoading();
    new Ajax.Request(BASE_URL+'/session', {
      method : 'get',
      onSuccess : function(response) {
//        console.log(response.getAllHeaders());
//        alert('200, '+response.responseJSON.entry.user_id);
//        alert(response.getAllHeaders());
//        var a = response.getAllHeaders();
//        var b = a.split("\n");
//        alert(a);
//        b.each(function(c) {
//          alert(c);
//        });
//        widget.setPreferenceForKey(self.utils.makeCookie(response.getResponseHeader('Set-Cookie')), 'session-id');
//        self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        self._case1c(response);
      },
      on409 : function(response) {
//        alert('409, '+response.responseJSON.entry.user_id);
//        alert(self.utils.makeCookie(response.getResponseHeader('Set-Cookie')));
//        widget.setPreferenceForKey(self.utils.makeCookie(response.getResponseHeader('Set-Cookie')), 'session-id');
//        self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        self._case1c(response);
      },
      onFailure : function(response) {
//        var a = response.getAllHeaders();
//        var b = a.split("\n");
//        alert(a);
//        alert('no session');
//        alert(self.utils.makeCookie(response.getResponseHeader('Set-Cookie')));
//        self.sessionCookie = self.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
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
  				if (typeof(json.entry.role)  != 'undefined' && json.role != null) {
  					self.userRole = json.entry.role;
  				}
    			self.case3({start : true});
  			}
  		});
    } else { // user not identified
      this.userId = false;
      this.userName = false;
			this.case2({start : true }); // go to login
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
//    if (options.start) this.mainElement.update();
    if (options.out) this.stack.pop();
    else {
      var opt = Object.clone(options);
      opt.out = true;
      opt.start = false;
      this.stack.push(this.case2.bind(this,opt));
    }
    
    if (options.start) { // login without effects (first time)
			this.sub1 = new naepsy.login(this, {	'hostElement' : this.mainElement,
                													  'backCase' : options.backCase});
	    this.sub1.pane.show();
    } else { // login page emerges with fx
		  this.sub2 = this.sub1;
			if (options.channelId) {
				this.sub1 = new naepsy.login(this, {	'hostElement' : this.mainElement,
	      											              'channelId' : options.channelId,
      	                                  	'backCase' : options.backCase});
			} else {
				this.sub1 = new naepsy.login(this, {	'hostElement' : this.mainElement,
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
          onSuccess : function(response) {
            var json = response.responseJSON;
            if (Object.isUndefined(json.entry.settings_auto_updates)) {
              // create the settings key with default value true
              var params = {
                'data[settings_auto_updates]' : true
              };
              new Ajax.Request(URL, {
                method : 'put',
                parameters : params
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
      } else if (self.settings_auto_updates) {
        if (client.is_WRT_widget && this.locator.unavailable == false) this.locator.run();
      } // no else
    }

    // stack stuff
    this.stackReset();
    var opt = Object.clone(options);
    opt.out = true;
    opt.start = false;
    this.stack.push(this.case3.bind(this,opt));
		
    if (options.start) {
      this.sub1 = new naepsy.mainmenu(this, {
        'hostElement' : this.mainElement,
        'backCase' : options.backCase
      });
      this.sub1.pane.show();
    } else {
      this.sub2 = this.sub1;
      this.sub1 = new naepsy.mainmenu(this, {
        'hostElement' : this.mainElement,
        'backCase' : options.backCase
      });
      if (options.out) {
        this.utils.out(this.sub2.pane,this.sub1.pane,function() {
          this.sub2.destroy();
//          this.sub1.update();
        }.bind(this));
      } else {
        this.utils.into(this.sub2.pane,this.sub1.pane,function() {
          this.sub2.destroy();
//          this.sub1.update();
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
    this.sub1 = new naepsy.about(this, {
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
    this.sub1 = new naepsy.signup(this, { 
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
    this.sub1 = new naepsy.dialog(this,  {  
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
    this.sub1 = new naepsy.status(this, {
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
    this.sub1 = new naepsy.myprofile(this, {  
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
    this.sub1 = new naepsy.friendlist(this, {   
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
    this.sub1 = new naepsy.findusers(this, {  
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
    this.sub1 = new naepsy.searchresults(this, {
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
    this.sub1 = new naepsy.profile(this, {
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
    this.sub1 = new naepsy.pendingfriends(this, { 
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
    this.sub1 = new naepsy.terms(this, {
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
    this.sub1 = new naepsy.consent(this, {
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
    this.sub1 = new naepsy.information(this, {
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
    this.sub1 = new naepsy.channellist(this, {  'hostElement' : this.mainElement,
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
    this.sub1 = new naepsy.createchannel(this, {
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
  	this.sub1 = new naepsy.channel(this, {  
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
    this.sub1 = new naepsy.mypost(this, {   
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
    this.sub1 = new naepsy.post(this, {
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
    this.sub1 = new naepsy.avatar(this, {
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
    this.sub1 = new naepsy.channel(this, {	'hostElement' : this.mainElement,
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
    this.sub1 = new naepsy.grouplist(this, {
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
    this.sub1 = new naepsy.creategroup(this, {  'hostElement' : this.mainElement,
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
  	this.sub1 = new naepsy.group(this, {  
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
  	this.sub1 = new naepsy.groupmembers(this, { 
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
    this.sub1 = new naepsy.changepassword(this, { 
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
    this.sub1 = new naepsy.search(this, {   'hostElement' : this.mainElement,
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
    this.sub1 = new naepsy.searchallresult(this, {
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
    this.sub1 = new naepsy.friendlist(this, {   
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
	* _getClient
	*
	* sets values for a global client object
	*/
  _getClient: function() {
    var agent = navigator.userAgent;
	  client = {};
	  client.is_widget = (typeof(window.widget) != 'undefined') ? true : false;
    client.is_iphone, client.is_WRT_widget, client.is_Dashboard_widget, client.is_phonegap, client.is_safari = false;
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
      message : "There has been an error within Aalto Social Interface, or naepsy has been unable to reach Aalto Social Interface. You may have lost network connectivity. Please try again later!",
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
    if (this.sessionCookie) request.options.requestHeaders = ['Cookie',this.sessionCookie]; // if client is Dashboard, then manually slap cookie onto every single request (due to Dashboard bug)
//    request.options.requestHeaders = ['Cookie',this.sessionCookie]; // if client is Dashboard, then manually slap cookie onto every single request (due to Dashboard bug)
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
	}
});