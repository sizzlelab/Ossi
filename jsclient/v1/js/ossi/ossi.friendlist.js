/**
 * ossi friendlist class
 */
ossi.friendlist = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false
    }, options);
    this.pane = false;
    this.updateOptions = {
      per_page: 8,
      page: 1
    };
    this._draw();
  },
  
  /**
   * _update
   *
   * does not handle XHR failure yet!
   */
  update: function(options){
    var options = Object.extend({
      startIndex: 0,
      count: this.count
    }, options);
    
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/' + this.parent.userId + '/@friends';
    var params = {
      per_page: this.updateOptions.per_page,
      page: this.updateOptions.page,
      event_id: 'Ossi::BrowseGroupList',
      'sortBy': 'status_changed',
      'sortOrder': 'descending'
    };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'get',
      parameters: params,
      requestHeaders: (client.is_widget) ? ['Cookie', self.parent.sessionCookie] : '',
      onSuccess: function(response){
        var json = response.responseJSON;
        self._removeLinkListeners();
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            var h = '';
            json.entry.each( function(person) {
              h += self._getButtonHTML(person);
            } );
            $('friends_placeholder').update(h);
            self._addLinkListeners();
            if (json.entry.length > 5) 
              $('friend_list_back_button_2_container').show(); // show second back button at top of screen if more than 5 friends
            self.parent.utils.addPagingFeature( $('friendlist-paging-container') , json, self);
            
           self.parent.hideLoading();
          }
          else {
            $('friends_placeholder').replace('<div style="padding:10px; text-align:center">Your friend list is currently empty. Click on "Find Friends" to search for people in the network and add them onto your list.</div>');
          }
        }
        else {
          $('friends_placeholder').replace('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
          $('add_friend_button_container').hide();
        }
        
        // now check if any pending friend requests
        URL = BASE_URL + '/people/' + self.parent.userId + '/@pending_friend_requests'
        new Ajax.Request(URL, {
          method: 'get',
          requestHeaders: (client.is_widget) ? ['Cookie', self.parent.sessionCookie] : '',
          onSuccess: function(response){
            var json = response.responseJSON;
            if (json.entry.length > 0) {
              $('new_friend_requests_button_container').show();
              $('new_friend_requests_button').update(json.entry.length + ' New Friend Requests!')
            }
            setTimeout(function(){
              self.parent.hideLoading();
            }, 600);
          }
        });
      }
    });
  },
  
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('friendlistpane');
    }
    else {
      alert('ossi.friendlist._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
    var h = '\
          <div id="friendlistpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
            <div id="friend_list_back_button_2_container" class="nav_button" style="display:none">\
              <a id="friend_list_back_button2" class="nav_button_text" href="javascript:void(null);">Back</a>\
            </div>\
            <div id="friends_placeholder">\
            </div>\
	          <div id="friendlist-paging-container">\
	          </div>\
          <div id="new_friend_requests_button_container" class="nav_button" style="display:none;">\
            <a id="new_friend_requests_button" class="nav_button_text" href="javascript:void(null);"></a>\
          </div>\
          <div id="add_friend_button_container" class="nav_button">\
            <a id="add_friend_button" class="nav_button_text" href="javascript:void(null);">Find Friends</a>\
       	  </div>\
          <div class="nav_button">\
            <a id="friend_list_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          </div>\
        </div>\
		';
    return h;
  },
  _getButtonHTML: function(user){
    var name = (user.name != null) ? user.name['unstructured'] : user.username; // if name has not been set
    var status_message = '';
    var update_time = '';
    var location = '';
    if (typeof(user.status) != 'undefined') {
      if (user.status.message != 'undefined') {
        if (user.status.message != null) {
          status_message = user.status.message;
        }
      }
      if (user.status.changed != 'undefined') {
        if (user.status.changed != null) {
           update_time = user.status.changed;
        }
      }
    }
   if (user.location ) {
    if (user.location.label) {
     location = ' @ ' + user.location.label;
    }
    else 
     if (Object.isNumber(user.location.latitude) && Object.isNumber(user.location.longitude)) {
      location = ' @ ' + this.parent.utils.roundNumber(user.location.latitude, 4) + ' / ' + this.parent.utils.roundNumber(user.location.longitude, 4);
     }
     // Take min of location and status update
     // update_time = user.location.updated_at;
   }
    
    update_time = this.parent.utils.agoString(update_time);
    var h = '\
           <div class="profile_button" id="person_uid_' + user.id + '" href="javascript:void(null);">\
           <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="' +
             BASE_URL + '/people/' + user.id +'/@avatar/small_thumbnail?' + Math.random() * 9999 +
           '" width="50" height="50" border="0" /></div>\
           <div class="post_button_text">\
              <div class="button_title"><a id="friend_uid_link_' + user.id +'" href="javascript:void(null);">' +
              name + location +
              '</a></div>\
            <div class="button_content_text">' + status_message + '</div>\
            <div class="button_subtitle_text" style="padding-top:3px">' +
              update_time +
            '</div>\
           </div>\
       </div>\
	   ';
    return h;
  },
  _backHandler: function(){
    this.options.backCase.apply();
  },
  _addFriendHandler: function(){
    this.parent.case11({ });
  },
  _openProfileHandler: function(event, button_id){
    var uid = button_id.replace("person_uid_", "");
    this.parent.case13({
      userId: uid,
    });
  },
  _friendRequestsHandler: function(){
    this.parent.case14({ });
  },
  _addListeners: function(){
    $('new_friend_requests_button').onclick = this._friendRequestsHandler.bindAsEventListener(this);
    $('friend_list_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('friend_list_back_button2').onclick = this._backHandler.bindAsEventListener(this);
    $('add_friend_button').onclick = this._addFriendHandler.bindAsEventListener(this);
  },
  _removeListeners: function(){
    $('new_friend_requests_button').onclick = function(){
      return
    };
    $('friend_list_back_button').onclick = function(){
      return
    };
    $('friend_list_back_button2').onclick = function(){
      return
    };
    $('add_friend_button').onclick = function(){
      return
    };
    $$('action_button').each( function(button) {
      button.onclick = function(){ return };
    });
  },
  _addLinkListeners: function(){ // for dynamic buttons
    $$('.profile_button').each(function(button){
      button.onclick = this._openProfileHandler.bindAsEventListener(this, button.id);
    }, this);
  },
  _removeLinkListeners: function(){
    $$('.profile_button').each(function(button){
      button.onclick = function(){
        return
      };
    }, this);
  },
  destroy: function(){
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});
