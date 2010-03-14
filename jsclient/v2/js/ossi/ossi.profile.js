/**
 * ossi profile class
 */
ossi.profile = Class.create(ossi.base, {
  initialize: function(parent, options) {
    this.parent = parent;
    this.options = Object.extend({
      userId: false,
      pendingNav: false,
      search: false,
      hostElement: false
    }, options);
    this.pane = false;
    this._draw();
    if (this.parent.stack.length > 4) $('profile_back_to_main_menu_button_container').show();
  },
  /**
   * update
   *
   * does not handle XHR failure yet!
   */
  update: function() {
    if (typeof(this.options.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/' + this.options.userId + '/@self';
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'get',
      onSuccess: function(response){ // does not handle invalid responses
        var json = response.responseJSON;
        json = json.entry;
        var h = self._getProfileHTML(json);
        $('profile_placeholder').replace(h);
        // hide everything!
        $('profile_add_as_friend_button_container').hide();
        $('profile_remove_friend_button_container').hide();
        $('pending_nav').hide();
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
        // if they are friends and this profile has an associated lat and lon then show map button
        if (json.connection == 'friend' && Object.isNumber(json.location.latitude) && Object.isNumber(json.location.longitude)) { // show map button
          self.location = {
            latitude : json.location.latitude,
            longitude : json.location.longitude,
            label : (json.location.label != null) ? json.location.label : "",
            datetime : json.location.updated_at
          }
          $('profile_show_map_button_container').show();
        }
        self.parent.hideLoading();
      }
    });
  },
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._removeListeners();
      this._addListeners();
      this.pane = $('profilepane');
    }
    else {
      alert('ossi.profile._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h = '\
          			<div id="profilepane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <div id="profile_placeholder"></div>\
					        <div id="profile_view_friends_button_container" class="nav_button">\
          					<a id="profile_view_friends_button" class="nav_button_text" href="javascript:void(null);">User\'s Friends</a>\
          				</div>\
          				<div id="profile_add_as_friend_button_container" class="nav_button">\
          					<a id="profile_add_as_friend_button" class="nav_button_text" href="javascript:void(null);">Add as Friend</a>\
          				</div>\
          				<div id="profile_show_map_button_container" class="nav_button" style="display:none">\
          					<a id="profile_show_map_button" class="nav_button_text" href="javascript:void(null);">New: Show on Map!</a>\
          				</div>\
          				<div id="profile_send_message_button_container" class="nav_button">\
          					<a id="profile_send_message_button" class="nav_button_text" href="javascript:void(null);">Send Private Message</a>\
          				</div>\
					        <div id="profile_remove_friend_button_container" style="display:none" class="nav_button">\
          					<a id="profile_remove_friend_button" class="nav_button_text" href="javascript:void(null);">Remove This Friend</a>\
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
          					<a id="profile_back_button" class="nav_button_text" href="javascript:void(null);">Back to Previous</a>\
          				</div>\
					        <div id="profile_back_to_main_menu_button_container" style="display:none" class="nav_button">\
          					<a id="profile_back_to_main_menu_button" class="nav_button_text" href="javascript:void(null);">Back to Main Menu</a>\
          				</div>\
                </div>\
          		';
    return h;
  },
  _getProfileHTML: function(json) {
    var name = (json.name != null) ? json.name.unstructured : json.username;
    var gender = false;
    if (typeof(json.gender) != 'undefined' && json.gender != null) {
      if (json.gender.displayvalue != null) {
        gender = json.gender.displayvalue.toLowerCase();
      }
    }
    var website = false;
    if (!Object.isUndefined(json.website) && json.website != null) {
      if (json.website.length > 5) {
        website = json.website;
      }
    }
    var description = false;
    if (!Object.isUndefined(json.description) && json.description != null) {
      if (json.description.length > 5) {
        description = json.description;
      }
    }
    var birthdate = false;
    if (typeof(json.birthdate) != 'undefined') {
      if (json.birthdate != null) {
        var dob = json.birthdate.split('-');
        var d = (dob[2].length == 2 && dob[2].substring(0, 1) == '0') ? parseInt(dob[2].substring(1, 2)) : parseInt(dob[2]);
        var m = (dob[1].length == 2 && dob[1].substring(0, 1) == '0') ? parseInt(dob[1].substring(1, 2)) : parseInt(dob[1]);
        birthdate = d + '.' + m + '.' + dob[0];
      }
    }
    
    var h = '\
          				<div id="public_profile" style="text-align:center; width:100%">\
                    <div style="margin:8px 8px 12px 8px;">\
          					  <img style="border:solid #eee 1px;" src="' + BASE_URL + '/people/' + json.id + '/@avatar/large_thumbnail" border="0" />\
                    </div>\
                    <div style="margin: 8px auto 12px; text-align: left; width: 170px;">\
                      <dl>\
                        <dt style="color:#666; margin-top:7px;">Name:</dt>\
                          <dd style="margin-left:15px;">' +
    name +
    '</dd>\
            	';
    if (website) {
      h += '\
                        <dt style="color:#666; margin-top:7px;">Website:</dt>\
                          <dd style="margin-left:15px;"><a href="' + website + '" target="_blank">' + website + '</a></dd>\
            	';
      
    }
    if (description) {
      h += '\
                        <dt style="color:#666; margin-top:7px;">About me:</dt>\
                          <dd style="margin-left:15px;">' + description + '</dd>\
            	';
      
    }
    if (gender) {
      h += '\
                        <dt style="color:#666; margin-top:7px;">Gender:</dt>\
                          <dd style="margin-left:15px;">' + gender + '</dd>\
            	';
      
    }
    if (birthdate) {
      h += '\
                        <dt style="color:#666; margin-top:7px;">D.O.B.:</dt>\
                          <dd style="margin-left:15px;">' + birthdate + '</dd>\
            	';
      
    }
    h += '\
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
    if (typeof(this.options.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/' + this.parent.userId + '/@friends';
    var params = {
      'friend_id': this.options.userId,
      'event_id' : 'Ossi::Profile/RequestFriendship'
    }
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'post',
      parameters: params,
      onSuccess: function(response){ // does not handle invalid responses
        var json = response.responseJSON;
        // currently returns currently logged in user's data. no need to parse
        // should check if the request fails though
        self.parent.case6({
          message: "Friend request sent! After the recipient accepts your request you become connected!",
          buttonText: "Back",
          userId: self.options.userId,
          hostElement: self.options.hostElement
        });
        
        setTimeout(function(){
          self.parent.hideLoading();
        }, 600);
      }
    });
  },
  _sendPrivateMessageHandler: function() {
    var self = this;
    self.parent.case19({
      personId : self.options.userId
    });
  },
  _removeFriendHandler: function() {
    if (typeof(this.options.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/' + this.parent.userId + '/@friends/' + this.options.userId;
    var params = {'event_id' : 'Ossi::Profile/RemoveFriendship'};
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'delete',
      parameters : params,
      onSuccess: function(response){ // does not handle invalid responses
        var json = response.responseJSON;
        // currently returns currently logged in user's data. no need to parse
        // should check if the request fails though
        
        self.parent.case6({
          message: "Friendship has been removed.",
          buttonText: "Back",
          userId: self.options.userId,
          hostElement: self.options.hostElement
        });
        
        setTimeout(function(){
          self.parent.hideLoading();
        }, 600);
      }
    });
  },
  
  _acceptRequestHandler: function() {
    if (typeof(this.options.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/' + this.parent.userId + '/@friends';
    var params = {
      'friend_id': this.options.userId,
      'event_id' : 'Ossi::Profile/AcceptFriendship'
    }
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'post',
      parameters: params,
      onSuccess: function(response){ // does not handle invalid responses
        self.parent.case6({
          message: "Friend request accepted!",
          buttonText: "Back"
        });
        setTimeout(function(){
          self.parent.hideLoading();
        }, 600);
      }
    });
  },
  _rejectRequestHandler: function() {
    if (typeof(this.options.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/' + this.parent.userId + '/@pending_friend_requests/' + this.options.userId;
    var params = { 'event_id' : 'Ossi::Profile/DenyFriendship' };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'delete',
      parameters : params,
      onSuccess: function(response){ // does not handle invalid responses
        // should check if the request fails though
        self.parent.case6({
          message: "Friend request rejected!",
          buttonText: "Back"
        });
        
        setTimeout(function(){
          self.parent.hideLoading();
        }, 600);
      }
    });
  },
  _viewFriendsHandler: function() {
    this.parent.case33({
      userId: this.options.userId
    });
  },
  _backToMainMenuHandler: function() {
    this.parent.case3({out:true});
  },
  _showOnMapHandler: function() {
    var items = [this.location];
    this.parent.case34({
      'items' : items
    });
  },
  _addListeners: function() {
    $('profile_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('profile_show_map_button').onclick = this._showOnMapHandler.bindAsEventListener(this);
    $('profile_send_message_button').onclick = this._sendPrivateMessageHandler.bindAsEventListener(this);
    $('profile_accept_friendship_request_button').onclick = this._acceptRequestHandler.bindAsEventListener(this);
    $('profile_reject_friendship_request_button').onclick = this._rejectRequestHandler.bindAsEventListener(this);
    $('profile_add_as_friend_button').onclick = this._addFriendHandler.bindAsEventListener(this);
    $('profile_add_as_friend_button').onclick = this._addFriendHandler.bindAsEventListener(this);
    $('profile_remove_friend_button').onclick = this._removeFriendHandler.bindAsEventListener(this);
    $('profile_view_friends_button').onclick = this._viewFriendsHandler.bindAsEventListener(this);
    $('profile_back_to_main_menu_button').onclick = this._backToMainMenuHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('profile_back_button').onclick = function() { return };
    $('profile_send_message_button').onclick = function() { return };
    $('profile_accept_friendship_request_button').onclick = function() { return };
    $('profile_reject_friendship_request_button').onclick = function() { return };
    $('profile_add_as_friend_button').onclick = function() { return };
    $('profile_remove_friend_button').onclick = function() { return };
    $('profile_back_to_main_menu_button').onclick = function() { return };
  },
  destroy: function() {
    this._removeListeners();
    this.pane.remove();
  }
});
