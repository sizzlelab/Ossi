/**
* ossi pending friends class
*/
ossi.pendingfriends = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false
	  },options);
	  this.pane = false;
    this._draw();
	},
	/**
	* _update
	*
	* does not handle XHR failure yet!
	*/
	update: function() {
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL+'/people/'+self.parent.userId+'/@pending_friend_requests'
    var params = { 'event_id' : 'Ossi::ShowPendingFriends'};
    new Ajax.Request(URL,{
      method : 'get',
      parameters : params,
      onSuccess : function(response) {
        var json = response.responseJSON;
        self._removeLinkListeners();
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            var h = '';
            json.entry.each(function(entry) {
              h += this._getButtonHTML(entry);
            },self);
            $('pending_friends_placeholder').update(h);
            self._addLinkListeners();
          } else {
            $('pending_friends_placeholder').update('<div style="padding:10px; text-align:center">You have no more pending friend requests.</div>');
          }
        } else {
          $('pending_friends_placeholder').update('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
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
      this._addListeners();
      this.pane = $('pendingfriendslistpane');
    } else {
      alert('ossi.pendingfriends._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="pendingfriendslistpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <div id="pending_friends_placeholder">\
                  </div>\
          				<div class="nav_button">\
          					<a id="pending_friend_list_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(user) {
    var name = (user.name != null) ? user.name['unstructured'] : user.username; // if name has not been set
    var status_message = '';
    var status_time = '';
    if (typeof(user.status) != 'undefined') {
      if (user.status.message != 'undefined') {
        if (user.status.message != null) {
          status_message = user.status.message;
        }
      }
      if (user.status.changed != 'undefined') {
        if (user.status.changed != null) {
          status_time = this.parent.utils.agoString(user.status.changed);
        }
      }
    }
    var h = '\
           <div class="profile_button" id="pending_person_uid_' + user.id + '" href="javascript:void(null);">\
           <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="' +
             BASE_URL + '/people/' + user.id +'/@avatar/small_thumbnail?' + Math.random() * 9999 +
           '" width="50" height="50" border="0" /></div>\
           <div class="post_button_text">\
              <div class="button_title"><a id="friend_uid_link_' + user.id +'" href="javascript:void(null);">' +
              name +
              '</a></div>\
            <div class="button_content_text">' + status_message + '</div>\
            <div class="button_subtitle_text" style="padding-top:3px">' +
              status_time +
            '</div>\
           </div>\
       </div>\
	   ';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _removeFriendHandler: function() {
    this.parent.case10({});
  },
  _addFriendHandler: function() {
    this.parent.case11({});
  },
  _openProfileHandler: function(event,button_id) {
    var uid = button_id.replace("pending_person_uid_","");
    this.parent.case13({
//      pendingNav : true, // no longer needed, status of user's relationship is now handled in ossi.profile.js
      userId : uid
    });
  },
  _addListeners: function() {
    $('pending_friend_list_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('pending_friend_list_back_button').onclick = function() { return };
  },
  _addLinkListeners: function() { // for dynamic buttons
    $$('.profile_button').each(function(button) {
      button.onclick = this._openProfileHandler.bindAsEventListener(this,button.id);
    },this);
  },
  _removeLinkListeners: function() {
    $$('.search_results_profile_button').each(function(button) {
      button.onclick = function() { return };
    },this);
  },
  destroy: function () {
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});