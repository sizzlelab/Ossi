/**
* ossi friendlist class
*/
ossi.friendlist = Class.create(ossi.base,{
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
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@friends';
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        var json = response.responseJSON;
        self._removeLinkListeners();
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            var h = '';
            json.entry.each(function(entry) {
              h += this._getButtonHTML(entry);
            },self);
            $('friends_placeholder').update(h);
            self._addLinkListeners();
            if (json.entry.length > 5) $('friend_list_back_button_2_container').show(); // show second back button at top of screen if more than 5 channels
          } else {
            $('friends_placeholder').replace('<div style="padding:10px; text-align:center">Your friend list is currently empty. Click on "Find Friends" to search for people in the network and add them onto your list.</div>');
          }
        } else {
          $('friends_placeholder').replace('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
          $('add_friend_button_container').hide();
        }
        
        // now check if any pending friend requests
        URL = BASE_URL+'/people/'+self.parent.userId+'/@pending_friend_requests'
        new Ajax.Request(URL,{
          method : 'get',
          requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
          onSuccess : function(response) {
            var json = response.responseJSON;
            if (json.entry.length > 0) {
              $('new_friend_requests_button_container').show();
              $('new_friend_requests_button').update(json.entry.length+' New Friend Requests!')
            }
            setTimeout(function() {
              self.parent.hideLoading();
            }, 600);
          }
        });
      }
    });
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('friendlistpane');
    } else {
      alert('ossi.friendlist._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="friendlistpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="friend_list_back_button_2_container" class="nav_button" style="display:none">\
          					<a id="friend_list_back_button2" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
                  <div id="friends_placeholder">\
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
          // timestamp to epoch
          var d = user.status.changed;
          var a = Date.UTC(d.substring(0,4),d.substring(5,7),d.substring(8,10),d.substring(11,13),d.substring(14,16),d.substring(17,19));

          // now to epoch
          var e = new Date();
          var b = Date.UTC(e.getUTCFullYear(),(e.getUTCMonth()+1),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds());

          // set string data
          var s = (b-a) / 1000;
          if (s < 60) {
            status_time = 'a moment ago';
          } else if (s >= 60 && s < 3600) {
            s = Math.floor(s/60);
            status_time = s+' mins ago';
          } else if (s >= 3600 && s < 86400) {
            s = Math.floor(s/3600);
            status_time = s+' hours ago';
          } else if (s >= 86400 && s < 2592000) {
            s = Math.floor(s/86400);
            status_time = s+' days ago';
          } else if (s >= 2592000) {
            s = Math.floor(s/2592000);
            status_time = s+' months ago';
          }
        }
      }
    }

    var h =   '\
          				<div class="profile_button" id="person_uid_'+user.id+'" href="javascript:void(null);">\
                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="'+BASE_URL+'/people/'+user.id+'/@avatar/small_thumbnail?'+Math.random()*9999+'" width="50" height="50" border="0" /></div>\
                    <div class="post_button_text">\
        						  <div class="button_title"><a href="javascript:void(null);">'+name+'</a></div>\
        						  <div class="button_content_text"><a href="javascript:void(null);">'+status_message+'</a></div>\
        						  <div class="button_subtitle_text" style="padding-top:3px">'+status_time+'</div>\
                    </div>\
          				</div>\
          			';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _addFriendHandler: function() {
    this.parent.case11({ backCase : this.parent.case9.bind(this.parent,{out : true, backCase : this.parent.case3.bind(this.parent,{out:true}) }) });
  },
  _openProfileHandler: function(event,button_id) {
    var uid = button_id.replace("person_uid_","");
    this.parent.case13({
      userId : uid,
      backCase : this.parent.case9.bind(this.parent,{
        out : true,
        backCase : this.parent.case3.bind(this.parent,{out:true}) 
      })
    });

  },
  _friendRequestsHandler: function() {
    this.parent.case14({
      backCase : this.parent.case9.bind(this.parent,{
        out : true,
        backCase : this.parent.case3.bind(this.parent,{out:true}) 
      })
    });
  },
  _addListeners: function() {
    $('new_friend_requests_button').onclick = this._friendRequestsHandler.bindAsEventListener(this);
    $('friend_list_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('friend_list_back_button2').onclick = this._backHandler.bindAsEventListener(this);
    $('add_friend_button').onclick = this._addFriendHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('new_friend_requests_button').onclick = function() { return };
    $('friend_list_back_button').onclick = function() { return };
    $('friend_list_back_button2').onclick = function() { return };
    $('add_friend_button').onclick = function() { return };
  },
  _addLinkListeners: function() { // for dynamic buttons
    $$('.profile_button').each(function(button) {
      button.onclick = this._openProfileHandler.bindAsEventListener(this,button.id);
    },this);
  },
  _removeLinkListeners: function() {
    $$('.profile_button').each(function(button) {
      button.onclick = function() { return };
    },this);
  },
  destroy: function () {
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});