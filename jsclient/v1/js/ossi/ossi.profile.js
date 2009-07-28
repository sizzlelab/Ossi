/**
* ossi profile class
*/
ossi.profile = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		  this.options = Object.extend({
		    userId : false,
		    pendingNav : false,
		    search : false,
      hostElement : false
	    },options);
	   this.pane = false;
    this._draw();
	},
	/**
	* update
	*
	* does not handle XHR failure yet!
	*/
	update: function() {
    if (typeof(this.options.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL+'/people/'+this.options.userId+'/@self';
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        var json = response.responseJSON;
								json = json.entry;
        var h = self._getProfileHTML(json);
        $('profile_placeholder').replace(h);
								// hide everything!
								$('profile_add_as_friend_button_container').hide();
			     $('profile_remove_friend_button_container').hide();
								$('pending_nav').hide();
        if (typeof(json.connection) != 'undefined') {
          switch (json.connection) {
            case "none": // not friends with
              // do nothing, default mode
			           $('profile_remove_friend_button_container').hide();
														$('profile_add_as_friend_button_container').show();
              break;
            case "friend":
              $('profile_add_as_friend_button_container').hide();
			           $('profile_remove_friend_button_container').show();
              break;
            case "requested":
              $('profile_add_as_friend_button_container').hide();
              // we could also tell the user here that this user has already been requested to become friends with 
              break;
            case "pending": // this user has requested to become friends with you
              $('pending_nav').show();
              $('profile_add_as_friend_button_container').hide();
              break;
          }
        }
        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      }
    });
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._removeListeners();
      this._addListeners();
      this.pane = $('profilepane');
    } else {
      alert('ossi.profile._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="profilepane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <div id="profile_placeholder"></div>\
          				<div id="profile_add_as_friend_button_container" class="nav_button">\
          					<a id="profile_add_as_friend_button" class="nav_button_text" href="javascript:void(null);">Add as Friend</a>\
          				</div>\
						        <div id="profile_remove_friend_button_container" style="display:none" class="nav_button">\
          					<a id="profile_remove_friend_button" class="nav_button_text" href="javascript:void(null);">Remove this Friend</a>\
          				</div>\
                  <div id="pending_nav" style="display:none">\
            				<div class="nav_button">\
            					<a id="profile_accept_friendship_request_button" class="nav_button_text" href="javascript:void(null);">Accept Friendship Request</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="profile_reject_friendship_request_button" class="nav_button_text" href="javascript:void(null);">Reject Friendship Request</a>\
            				</div>\
                  </div>\
          				<div class="nav_button">\
          					<a id="profile_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
                </div>\
          		';
    return h;
  },
  _getProfileHTML: function(json) {
    var name = (json.name != null) ? json.name.unstructured : json.username;
    var gender = false;
    if (typeof(json.gender) != 'undefined') {
      if (json.gender.displayvalue != null) {
        gender = json.gender.displayvalue.toLowerCase();
      }
    }
    var birthdate = false;
    if (typeof(json.birthdate) != 'undefined') {
      if (json.birthdate != null) {
        var dob = json.birthdate.split('-');
        var d = (dob[2].length == 2 && dob[2].substring(0,1) == '0') ? parseInt(dob[2].substring(1,2)) : parseInt(dob[2]);
        var m = (dob[1].length == 2 && dob[1].substring(0,1) == '0') ? parseInt(dob[1].substring(1,2)) : parseInt(dob[1]);
        birthdate = d+'.'+m+'.'+dob[0];
      }
    }

    var h =   '\
          				<div id="public_profile" style="text-align:center; width:100%">\
                    <div style="margin:8px 8px 12px 8px;">\
          					  <img style="border:solid #eee 1px;" src="'+BASE_URL+'/people/'+json.id+'/@avatar/large_thumbnail" border="0" />\
                    </div>\
                    <div style="margin: 8px auto 12px; text-align: left; width: 170px;">\
                      <dl>\
                        <dt style="color:#666;">Name:</dt>\
                          <dd style="margin-left:15px;">'+name+'</dd>\
            	';

    if (gender) {
      h +=    '\
                        <dt style="color:#666;">Gender:</dt>\
                          <dd style="margin-left:15px;">'+gender+'</dd>\
            	';
      
    }
    if (birthdate) {
      h +=    '\
                        <dt style="color:#666;">D.O.B.:</dt>\
                          <dd style="margin-left:15px;">'+birthdate+'</dd>\
            	';
      
    }
    h +=      '\
                      </dl>\
                    </div>\
          				</div>\
              ';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _addFriendHandler: function() {
    if (typeof(this.options.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@friends';
    var params = {'friend_id' : this.options.userId }
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'post',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        var json = response.responseJSON;
        // currently returns currently logged in user's data. no need to parse
        // should check if the request fails though
        self.parent.case6({
          message : "Friend request sent! After the recipient accepts your request you become connected!",
          buttonText : "Back",
    		  backCase2 : self.options.backCase,
    		  userId : self.options.userId,
    		  hostElement: self.options.hostElement,
          backCase : function() {
            this.parent.case31();
          }.bind(self)
        });

        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      }
    });
  },

  _removeFriendHandler: function() {
    if (typeof(this.options.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@friends/' + this.options.userId;
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'delete',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        var json = response.responseJSON;
        // currently returns currently logged in user's data. no need to parse
        // should check if the request fails though

        self.parent.case6({
          message : "Friendship has been removed.",
          buttonText : "Back",
		        userId : self.options.userId,
		        hostElement: self.options.hostElement,
          backCase : function() {
            this.parent.case31();
          }.bind(self)
        });

        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      }
    });
  },  
  
  _acceptRequestHandler: function() {
    if (typeof(this.options.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@friends';
    var params = {'friend_id' : this.options.userId }
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'post',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        self.parent.case6({
          message : "Friend request accepted!",
          buttonText : "Back",
          backCase : function() {
            this.parent.case31();
          }.bind(self)
        });
        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      }
    });
  },
  _rejectRequestHandler: function() {
    if (typeof(this.options.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/'+this.parent.userId+'/@pending_friend_requests/'+this.options.userId;
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'delete',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        // should check if the request fails though
        self.parent.case6({
          message : "Friend request rejected!",
          buttonText : "Back",
          backCase : function() {
            this.parent.case31();
          }.bind(self)
        });

        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      }
    });
  },
  _addListeners: function() {
    $('profile_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('profile_accept_friendship_request_button').onclick = this._acceptRequestHandler.bindAsEventListener(this);
    $('profile_reject_friendship_request_button').onclick = this._rejectRequestHandler.bindAsEventListener(this);
    $('profile_add_as_friend_button').onclick = this._addFriendHandler.bindAsEventListener(this);
	   $('profile_remove_friend_button').onclick = this._removeFriendHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('profile_back_button').onclick = function() { return };
    $('profile_accept_friendship_request_button').onclick = function() { return };
    $('profile_reject_friendship_request_button').onclick = function() { return };
    $('profile_add_as_friend_button').onclick = function() { return };
	   $('profile_remove_friend_button').onclick = function() { return };
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});