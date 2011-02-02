/**
* ossi signup class
*/
ossi.signup = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false
	  },options);
	  this.pane = false;
    this._draw();
	},
	update: function() {
    var self = this;
    var params =  { 'session[app_name]' : APP_NAME,
                    'session[app_password]' : APP_PASSWORD
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
        var json = response.responseJSON;
        self.parent.sessionCookie = self.parent.utils.makeCookie(response.getResponseHeader('Set-Cookie'));
        self.parent.appId = json.entry.app_id;
    		self.parent.hideLoading();
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
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('signuppane');
    } else {
      alert('ossi.signup._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="signuppane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form id="signup_form">\
            				<div style="height:33px; text-align:center; padding-top:20px;">\
            					Please fill in the following:\
            				</div>\
            				<div class="login">\
            					username:<br/>\
            					<input id="signup_username" class="textinput" maxlength="30" name="signup_username" type="text"/>\
            				</div>\
            				<div class="login">\
            					email:<br/>\
            					<input id="signup_email" class="textinput" maxlength="60" name="signup_email" type="text"/>\
            				</div>\
            				<div class="login">\
            					password:<br/>\
            					<input id="signup_password" class="textinput" maxlength="30" name="signup_password" type="password"/>\
            				</div>\
            				<div class="login">\
            					confirm  password:<br/>\
            					<input id="signup_password_confirm" class="textinput" maxlength="30" name="signup_password_confirm" type="password"/>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="done_button" class="nav_button_text" href="javascript:void(null);">Done</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="cancel_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                    <input type="submit" style="display:none" />\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _doneHandler: function(e) {
    if (typeof(e) != 'undefined'){
	    Event.stop(e);
    }
    var self = this;
    var u = $F('signup_username');
    var e = $F('signup_email');
    var p = $F('signup_password');
    var pc = $F('signup_password_confirm');
    if (p != pc) {
      alert('passwords do not match!')
      return;
    }

    //19.1.2009 ADDED CONSENT parameter.
    var params =  { 'person[username]' : u,
                    'person[password]' : p,
                    'person[email]' : e,
		                'person[consent]' : 'EN1.0',
                    'event_id' : 'Ossi::CreateUser'
                  };
    self.parent.showLoading();
    new Ajax.Request(BASE_URL+'/people', {
      method : 'post',
      parameters : params,
      onSuccess : function(response) { // will probably have to save cookie here as well... check!
        var json = response.responseJSON;
        self.parent.hideLoading();
        self.parent.userId = json.entry.id;
        self.parent.case3();
      },
      onFailure : function(response) {
        var reasons = response.responseJSON;
        var reason_string = '';
								// Might change?
								// TODO FIXME
        reasons.messages.each( function(error){
          reason_string += error + " ";
        }, self );
        self.parent.hideLoading();
        self.parent.case6({
          message : "Could not create user. Reasons: "+reason_string,
          buttonText : "Try again"
        });
      },
      on403 : function() {
        self.parent.hideLoading();
        self.parent.case6({
          message : "Could not create user. Reason: "+reason_string,
          buttonText : "Try again"
        });
      }
    });
  },
  _cancelHandler: function() {
    this.options.backCase.apply();
  },
  _termsHandler: function() {
    this.parent.case15({});
  },
  _addListeners: function() {
    $('done_button').onclick = this._doneHandler.bindAsEventListener(this);
    $('cancel_button').onclick = this._cancelHandler.bindAsEventListener(this);
    $('signup_form').observe('submit',this._doneHandler.bindAsEventListener(this));
  },
  _removeListeners: function() {
    $('done_button').onclick = function() { return }
    $('cancel_button').onclick = function() { return }
    $('signup_form').onsubmit = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});
