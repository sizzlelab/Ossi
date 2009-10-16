/**
* naepsy login class
*/
naepsy.login = Class.create(naepsy.base,{
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
      this._addListeners();
      this.pane = $('loginpane');
      setTimeout(function() { $('login_form').focusFirstElement() },500); // .delay() did not seem to work on Firefox
    } else {
      alert('naepsy.login._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="loginpane" style="display:none; position:absolute; top:0px; left:0px; width:100%; height:100%; z-index:2">\
      			      <form id="login_form">\
                    <div style="text-align:center; margin-top:55px;">\
              				<div><img src="images/logo.png" /></div>\
                    </div>\
            				<div style="text-align:center; margin-top:20px;">\
            					<input id="uusernaame" value="OtaSizzle username" class="textinput" maxlength="30" name="uusernaame" type="text"/>\
            				</div>\
            				<div style="text-align:center; margin-top:15px;">\
            					<input id="paasswoord" value="OtaSizzle password" class="textinput" maxlength="30" name="paasswoord" type="text"/>\
            				</div>\
            				<div style="text-align:center; margin-top:10px;">\
                      <a href="#" id="login_button"><img src="images/button_go.png" border="0" /></a>\
                      <input type="image" src="images/button_go.png" style="display:none;" />\
                    </div>\
            				<div style="text-align:center; margin-top:10px;">\
                      <span style="font-size:13px; color:#000;">Or <a style="font-size:13px; color:#000; font-style:italic;" href="#" id="signup_button">Sign Up</a></span>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _loginHandler: function(e) {
    var self = this;
    var u = $F('uusernaame');
    var p = $F('paasswoord');
    var params =  { 'session[username]' : u,
                    'session[password]' : p,
                    'session[app_name]' : 'naepsy',
                    'session[app_password]' : 'Ax0E44II+eoLoe1oL'
                  };
    self.parent.showLoading();
    new Ajax.Request(BASE_URL+'/session', { 
      method : 'post',
      parameters : params,
      on409 : function() { // found existing session, removing it first!
        new Ajax.Request(BASE_URL+'/session', {
          method : 'delete',
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
        console.log(response.getAllHeaders());
        var json = response.responseJSON;
        self.parent.sessionCookie = self.parent.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        self.parent.userId = json.entry.user_id;
        self.parent.appId = json.entry.app_id;
//        widget.setPreferenceForKey("hello"+self.parent.sessionCookie, 'session-id');

    		// we also need name for that id
    		new Ajax.Request(BASE_URL+'/people/'+self.parent.userId+'/@self', {
    			method : 'get',
    			onSuccess : function(response) {
    				var json = response.responseJSON;
    				var name = (json.entry.name != null) ? json.entry.name['unstructured'] : json.username; // if name has not been set
    				self.parent.userName = name;
    				if (typeof(json.role)  != 'undefined' && json.role != null){
    					self.parent.userRole = json.role;
    				}
        		self.parent.hideLoading();
            self.parent.case3();
    			},
    			onFailure : function(response) {
    			  alert('failure, response code: '+response.status); // iphone & phonegap gives 401 :(
    				self.parent.hideLoading();
    			}
    		});
      },
      on403 : function() {
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
          message : "We could not reach Aalto Social Interface. Please try again later!",
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
    this.parent.case4();
  },
  _passwordFieldOnFocus: function() {
    if ($('paasswoord').value == 'OtaSizzle password') {
      $('paasswoord').value = '';
      $('paasswoord').type = 'password';
      $('paasswoord').onblur = function() {
        if ($('paasswoord').value == '') {
          $('paasswoord').value = 'OtaSizzle password';
          $('paasswoord').type = 'text';
        }
      }.bindAsEventListener(this);
    }
  },
  _addListeners: function() {
    $('login_form').observe('submit',this._loginHandler.bindAsEventListener(this));
    $('paasswoord').onfocus = this._passwordFieldOnFocus.bindAsEventListener(this);
    $('login_button').onclick = this._loginHandler.bindAsEventListener(this);
    $('signup_button').onclick = this._signupHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('paasswoord').onfocus = function() { return }
    $('paasswoord').onblur = function() { return }
    $('login_button').onclick = function() { return }
    $('signup_button').onclick = function() { return }
    $('login_form').onsubmit = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});