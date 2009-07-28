/**
* ossi login class
*/
ossi.login = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      channelId : false,
      postId : false,
      hostElement : false
	  },options);
	  this.pane = false;
    this._draw();
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      new ossi.sloganizer(this,{targetElement:$('slogan_text')});
      this._addListeners();
      this.pane = $('loginpane');
    } else {
      alert('ossi.login._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="loginpane" style="display:none; position:absolute; top:0px; left:0px; width:'+client.dimensions.width+'px">\
          			  <form id="login_form">\
            				<div id="logo"></div>\
            				<div id="slogan">\
            					<span id="slogan_text">\
            						Share moments, share with Ossi.\
            					</span>\
            				</div>\
            				<div class="login">\
            					username:<br/>\
            					<input id="username" class="textinput" maxlength="30" name="username" type="text"/>\
            				</div>\
            				<div class="login">\
            					password:<br/>\
            					<input id="password" class="textinput" maxlength="30" name="password" type="password"/>\
            				</div>\
            				<div class="nav_button" style="margin-top:12px;">\
            					<a id="login_button" class="nav_button_text" href="javascript:void(null);">Login</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="signup_button" class="nav_button_text" href="javascript:void(null);">Sign up</a>\
            				</div>\
            				<div class="nav_button" style="display:none">\
            					<a id="wappu_button" class="nav_button_text" href="javascript:void(null);"><b><i>Wappu Login</i></b></a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="about_button" class="nav_button_text" href="javascript:void(null);">About Ossi</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _loginHandler: function(e) {
    var self = this;
    var u = $F('username');
    var p = $F('password');
    var params =  { 'session[username]' : u,
                    'session[password]' : p,
                    'session[app_name]' : 'ossi',
                    'session[app_password]' : 'Z0ks51r'
                  };
    self.parent.showLoading();
    new Ajax.Request(BASE_URL+'/session', { 
      method : 'post',
      parameters : params,
      requestHeaders : (client.is_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
      on409 : function() { // found existing session, removing it first!
        new Ajax.Request(BASE_URL+'/session', {
          method : 'delete',
          requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
          onSuccess : function() {
            self.parent.sessionCookie = false;
            self._loginHandler();
          },
          onFailure : function() {
            self.parent.hideLoading();
            self.parent.case6({
              backCase : self.parent.case2.bind(self.parent,{out:true}),
              message : "Found an existing user session, removed it, but after that could not log you in with the credentials provided.",
              buttonText : "Try again"
            });
          }
        });
      },
      onSuccess : function(response) {
        var json = response.responseJSON;
        self.parent.sessionCookie = self.parent.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        self.parent.userId = json.user_id;

    		// we also need name for that id
    		new Ajax.Request(BASE_URL+'/people/'+self.parent.userId+'/@self', {
    			method : 'get',
    			requestHeaders : (client.is_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
    			onSuccess : function(response) {
    				var json = response.responseJSON;
    				var name = (json.name != null) ? json.name['unstructured'] : json.username; // if name has not been set
    				self.parent.userName = name;
    				if (typeof(json.role)  != 'undefined' && json.role != null){
    					self.parent.userRole = json.role;
    				}
    			},
    			onFailure : function() {
    				self.parent.hideLoading();
    				self.parent.case3();
    			}
    		});

    		self.parent.hideLoading();

        if(!Object.isUndefined(self.options.channelId) && self.options.channelId){ // if channelId exists, go there
        	self.parent.case20({
        		out : true,
        		channelId : self.options.channelId,
        		backCase : self.parent.case18.bind(self.parent,{
        			out : true,
        			backCase : self.parent.case3.bind(self.parent,{
        				out : true
        			})
        		})
        	});

        } else {
	        self.parent.case3();
        }
      },
      on401 : function() {
        self.parent.hideLoading();
        self.parent.case6({
          backCase : self.parent.case2.bind(self.parent,{out:true}),
          message : "Could not log you in with the credentials you provided. Please check your typing and try again.",
          buttonText : "Back"
        });
      },
      onFailure : function() {
        self.parent.hideLoading();
        self.parent.case6({
          backCase : function() { window.location.reload(); }.bind(self),
          message : "We could not reach Common Services. Please try again later!",
          buttonText : "Restart Application"
        });
      }
    });
    if(typeof(e) != 'undefined'){
	    Event.stop(e); //Might be problem with Firefox
    }
  },
  _wappuHandler: function(e) {
    var self = this;
    var u = 'wappu';
    var p = 'wabus5';
    var params =  { username : u,
                    password : p,
                    app_name : 'ossi',
                    app_password : 'Z0ks51r'
                  };
    self.parent.showLoading();
    new Ajax.Request(BASE_URL+'/session', { 
      method : 'post',
      parameters : params,
      requestHeaders : (client.is_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
      on409 : function() { // found existing session, removing it first!
        new Ajax.Request(BASE_URL+'/session', {
          method : 'delete',
          requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
          onSuccess : function() {
            self.parent.sessionCookie = false;
            self._wappuHandler();
          },
          onFailure : function() {
            self.parent.hideLoading();
            self.parent.case6({
              backCase : self.parent.case2.bind(self.parent,{out:true}),
              message : "Found an existing user session, removed it, but after that could not log you in with the credentials provided.",
              buttonText : "Try again"
            });
          }
        });
      },
      onSuccess : function(response) {
        var json = response.responseJSON;
        self.parent.sessionCookie = self.parent.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        self.parent.userId = json.user_id;

		// we also need name for that id
		new Ajax.Request(BASE_URL+'/people/'+self.parent.userId+'/@self', {
			method : 'get',
			requestHeaders : (client.is_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
			onSuccess : function(response) {
				var json = response.responseJSON;
				var name = (json.name != null) ? json.name['unstructured'] : json.username; // if name has not been set
				self.parent.userName = name;
			},
			onFailure : function() {
				self.parent.hideLoading();
				self.parent.case3();
			}
		});

		self.parent.hideLoading();
        
        if(self.options.channelId){ // if channelId exists, go there
        	self.parent.case20({
        		out : true,
        		channelId : self.options.channelId,
        		backCase : self.parent.case18.bind(self.parent,{
        			out : true,
        			backCase : self.parent.case3.bind(self.parent,{
        				out : true
        			})
        		})
        	});

        } else {
	        self.parent.case3();
        }
      },
      on401 : function() {
        self.parent.hideLoading();
        self.parent.case6({
          backCase : self.parent.case2.bind(self.parent,{out:true}),
          message : "Could not log you in with the credentials you provided. Please check your typing and try again.",
          buttonText : "Back"
        });
      },
      onFailure : function() {
        self.parent.hideLoading();
        self.parent.case6({
          backCase : function() { window.location.reload(); }.bind(self),
          message : "We could not reach Common Services. Please try again later!",
          buttonText : "Restart Application"
        });
      }
    });
    if(typeof(e) != 'undefined'){
	    Event.stop(e); //Might be problem with Firefox
    }
  },
  _signupHandler: function() {
    this.parent.case16({ backCase : this.parent.case2.bind(this.parent,{out:true}) });
  },
  _aboutHandler: function() {
    this.parent.case4({ backCase : this.parent.case2.bind(this.parent,{out:true}) });
  },
  _addListeners: function() {
    $('login_button').onclick = this._loginHandler.bindAsEventListener(this);
    $('signup_button').onclick = this._signupHandler.bindAsEventListener(this);
    $('about_button').onclick = this._aboutHandler.bindAsEventListener(this);
    $('wappu_button').onclick = this._wappuHandler.bindAsEventListener(this);
    $('login_form').onsubmit = this._loginHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('login_button').onclick = function() { return }
    $('signup_button').onclick = function() { return }
    $('about_button').onclick = function() { return }
    $('wappu_button').onclick = function() { return }
    $('login_form').onsubmit = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});