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
    this.mainElement = new Element('div', { id : 'content_area' });
    document.body.appendChild(this.mainElement);
    this.channelsId = 'd8-W0MMEir3yhJaaWPEYjL'; // hardcoded id on alpha.sizl.org!
//    this.channelsId = 'bzFvEETj8r3yz7aaWPfx7J'; // hardcoded id on beta.sizl.org!
    this.sub1 = false; // pointers for case classes
    this.sub2 = false; // pointers for case classes
    this.sessionCookie = false; // for widget's cookie
    this.XHRequests = [];
    Ajax.Responders.register({ onCreate:this._onXHRCreate.bind(this), onComplete:this._onXHRComplete.bind(this) }); // set handlers for managing requests
    this.utils = new ossi.utils(this);
    this.loadingpane = new Element('div', { id : 'loading' });
    Element.extend(this.loadingpane);
    document.body.appendChild(this.loadingpane);
    this.loadingpane.hide();
    this.loadingpane.addClassName('loading');
    this._getClient(); // determine which client we are serving for
    this._setClientUI(); // on the basis of the client values make CSS changes
    BASE_URL = (client.is_widget) ? 'http://cos.alpha.sizl.org' : '/cos'; // where to go asking for COS
    MAX_REQUEST_LENGTH = 20; // in seconds
    this.tmp = []; // for timers etc. May be deleted at any time.
	  this.case1(); // go to first use case
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
    var params =  { app_name : 'ossi',
                    app_password : 'Z0ks51r'
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
      requestHeaders : (client.is_widget) ? ['Cookie',self.sessionCookie] : '',
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
	  if (json.user_id != null) {
  		this.userId = json.user_id;
  		// get username here instead of mainmenu or channel or whatever
  		new Ajax.Request(BASE_URL+'/people/'+this.userId+'/@self', {
  			method : 'get',
  			requestHeaders : (client.is_widget && self.sessionCookie) ? ['Cookie',self.sessionCookie] : '',
  			onSuccess : function(response) {
  				var json = response.responseJSON;
  				self.userName = (json.name != null) ? json.name['unstructured'] : json.username;
  				if (typeof(json.role)  != 'undefined' && json.role != null) {
  					self.userRole = json.role;
  				}
      		if (self.options.channelId) { //go to specified channel
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
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

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
	  },options);

    this.sub2 = this.sub1;
    this.sub1 = new ossi.about(this,  { 'hostElement' : this.mainElement,
	                                      'backCase' : options.backCase
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.signup(this, { 'hostElement' : this.mainElement,
                                        'backCase' : options.backCase});
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
      buttonText : false
	  },options);

    this.sub2 = this.sub1;
    this.sub1 = new ossi.dialog(this,  { 'hostElement' : this.mainElement,
	                                      'backCase' : options.backCase,
	                                      'message' : options.message,
	                                      'buttonText' : options.buttonText
	                                    });
    this.utils.into(this.sub2.pane,this.sub1.pane,function() {
      this.sub2.destroy();
    }.bind(this));
	},
	/**
	* status
	*/
	case7: function(options) {
		var options = Object.extend({
      out : false,
      backCase : false
	  },options);

    this.sub2 = this.sub1;
    this.sub1 = new ossi.status(this, {  'hostElement' : this.mainElement,
                                            'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.myprofile(this, {  'hostElement' : this.mainElement,
                                          'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.friendlist(this, {   'hostElement' : this.mainElement,
                                              'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.findusers(this, {  'hostElement' : this.mainElement,
                                            'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.searchresults(this, {  'hostElement' : this.mainElement,
                                                'search' : options.search,
                                                'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.profile(this, {  'hostElement' : this.mainElement,
                                          'pendingNav' : options.pendingNav,
                                          'search' : options.search,
                                          'userId' : options.userId,
                                          'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.pendingfriends(this, {   'hostElement' : this.mainElement,
                                                  'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.terms(this,  { 'hostElement' : this.mainElement,
	                                      'backCase' : options.backCase
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.consent(this, {  'hostElement' : this.mainElement,
	                                        'backCase' : options.backCase
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.information(this, {  'hostElement' : this.mainElement,
	                                            'backCase' : options.backCase
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
      out : false,
      backCase : false
	  },options);

    this.sub2 = this.sub1;
    this.sub1 = new ossi.channellist(this, {  'hostElement' : this.mainElement,
                                              'selfUpdate' : true,
                                              'backCase' : options.backCase});
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
      backCase : false
	  },options);

    this.sub2 = this.sub1;
    this.sub1 = new ossi.createchannel(this, {  'hostElement' : this.mainElement,
                                                'backCase' : options.backCase});
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
    	  channelId : false,
    	  backCase : false
		},options);
		this.sub2 = this.sub1;
  	this.sub1 = new ossi.channel(this, {  'hostElement' : this.mainElement,
                                          'selfUpdate' : true,
          	                           	  'channelId' : options.channelId,
							                            'wall' : this.options.wall,
                  	                  	  'backCase' : options.backCase
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
    this.sub2 = this.sub1;
    this.sub1 = new ossi.mypost(this, {   'hostElement' : this.mainElement,
                                          'priv' : options.priv,
                                          'channelId' : options.channelId,
                                          'replyToId' : options.replyToId,
                                          'postId' : options.postId,
                                          'backCase' : options.backCase});
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
      backCase : false
	  },options);

    this.sub2 = this.sub1;
    this.sub1 = new ossi.post(this, {   'hostElement' : this.mainElement,
                                        'channelId' : options.channelId,
                                        'postId' : options.postId,
                                        'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.avatar(this, {   'hostElement' : this.mainElement,
                                          'backCase' : options.backCase});
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
	* show channel contents without session
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.grouplist(this, {  'hostElement' : this.mainElement,
                                            'backCase' : options.backCase});
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

    this.sub2 = this.sub1;
    this.sub1 = new ossi.creategroup(this, {  'hostElement' : this.mainElement,
                                              'backCase' : options.backCase});
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
		this.sub2 = this.sub1;
  	this.sub1 = new ossi.group(this, {  'hostElement' : this.mainElement,
        	                              'groupId' : options.groupId,
                	                      'backCase' : options.backCase });
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
		this.sub2 = this.sub1;
  	this.sub1 = new ossi.groupmembers(this, { 'hostElement' : this.mainElement,
      	                                      'selfUpdate' : true,
      	                                      'groupId' : options.groupId,
              	                              'backCase' : options.backCase });
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
	  client = {};
	  client.is_widget = (typeof(window.widget) != 'undefined') ? true : false;
	  if (client.is_widget) {
	    client.dimensions = WIDGET_VIEWPORT;
	  } else if (this.options.width && this.options.height) {
	    client.dimensions = { height : this.options.height, width : this.options.width }
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
    if (client.is_widget) {
      document.body.addClassName('widget');
      this.mainElement.addClassName('widget');
      this.loadingpane.addClassName('widget');
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
      message : "There has been an error within Common Services, or Ossi has been unable to reach Common Services. You may have lost network connectivity. Please try again later!",
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