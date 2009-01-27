/**
* ossi mainmenu class
*/
ossi.mainmenu = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false,
      backCase : function() { return false; }
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
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@self';
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      requestHeaders : (client.is_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        var json = response.responseJSON;
        var name = (json.name != null) ? json.name['unstructured'] : json.username; // if name has not been set
        self.parent.userName = name;
        $('mainmenu_profile_name').update(name);
        var status_message = false;
        var status_time = false;

        if (typeof(json.role)  != 'undefined' && json.role != null){
          self.parent.userRole = json.role;
        }

        if (typeof(json.status) != 'undefined') {
          if (json.status.message != 'undefined') {
            if (json.status.message != null) {
              status_message = json.status.message;
            }
          }
          if (json.status.changed != 'undefined') {
            if (json.status.changed != null) {
              // timestamp to epoch
              var d = json.status.changed;
              var a = Date.UTC(d.substring(0,4),d.substring(5,7),d.substring(8,10),d.substring(11,13),d.substring(14,16),d.substring(17,19));

              // now to epoch
              var e = new Date();
              var b = Date.UTC(e.getUTCFullYear(),(e.getUTCMonth()+1),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds());

              // set string data
              var s = (b-a) / 1000;
              if (s < 60) {
//                $('mainmenu_status_time').update(s+' sec ago');
                $('mainmenu_status_time').update('a moment ago');
              } else if (s >= 60 && s < 3600) {
                s = Math.floor(s/60);
                $('mainmenu_status_time').update(s+' mins ago');
              } else if (s >= 3600 && s < 86400) {
                s = Math.floor(s/3600);
                $('mainmenu_status_time').update(s+' hours ago');
              } else if (s >= 86400 && s < 2592000) {
                s = Math.floor(s/86400);
                $('mainmenu_status_time').update(s+' days ago');
              } else if (s >= 2592000) {
                s = Math.floor(s/2592000);
                $('mainmenu_status_time').update(s+' months ago');
              }
            }
          }
        }
        if (status_message) $('mainmenu_status_text').update(status_message);
        URL = BASE_URL+'/people/'+self.parent.userId+'/@pending_friend_requests'
        new Ajax.Request(URL,{
          method : 'get',
          requestHeaders : (client.is_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
          onSuccess : function(response) {
            var json = response.responseJSON;
            if (json.entry.length > 0) Element.insert($('friends_button'),' <span style="font-size:10px; font-weight:bold;">('+json.entry.length+' new)</span>');
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
      this.pane = $('mainmenupane');
    } else {
      alert('ossi.mainmenu._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="mainmenupane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="logo_small"></div>\
          				<div id="microblog_button" class="post_button">\
                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="'+BASE_URL+'/people/'+this.parent.userId+'/@avatar/small_thumbnail?'+Math.random()*9999+'" width="50" height="50" border="0" /></div>\
                    <div class="post_button_text">\
        						  <div class="button_title"><a id="mainmenu_profile_name" href="javascript:void(null);">n/a</a></div>\
        						  <div id="mainmenu_status_text" class="button_title" style="font-size:10px;">n/a</div>\
        						  <div id="mainmenu_status_time" class="button_subtitle_text">n/a</div>\
                    </div>\
        				  </div>\
          				<div class="nav_button" style="display:none">\
          					<a id="feeds_button" class="nav_button_text" href="javascript:void(null);">Feeds</a>\
          				</div>\
          				<div class="nav_button">\
          				  <a id="friends_button" class="nav_button_text" href="javascript:void(null);">Friends</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="channels_button" class="nav_button_text" href="javascript:void(null);">Channels</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="profile_button" class="nav_button_text" href="javascript:void(null);">My Profile</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="logout_button" class="nav_button_text" href="javascript:void(null);">Logout</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _logoutHandler: function() {
    var self = this;
    this.parent.loadingpane.show();
    new Ajax.Request(BASE_URL+'/session', {
      method : 'delete',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function() {
        self.parent.sessionCookie = false;
        self.parent.loadingpane.hide();
  	    self.parent.case1({out : true});
      },
      onFailure : function() {
        self.parent.loadingpane.hide();
        self.parent.case6({
          backCase : self.parent.case3.bind(self.parent,{out:true}),
          message : "Could not log user out.",
          buttonText : "Try again"
        });
      }
    });
  },
  _channelsHandler: function() {
    this.parent.case18({ backCase : this.parent.case3.bind(this.parent,{out:true}) });
  },
  _friendsHandler: function() {
    this.parent.case9({ backCase : this.parent.case3.bind(this.parent,{out:true}) });
  },
  _feedsHandler: function() {
  },
  _profileHandler: function() {
    this.parent.case8({ backCase : this.parent.case3.bind(this.parent,{out:true}) });
  },
  _microblogHandler: function() {
    this.parent.case7({ backCase : this.parent.case3.bind(this.parent,{out:true}) });
  },
  _addListeners: function() {
//    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
//    thus old skool

    $('logout_button').onclick = this._logoutHandler.bindAsEventListener(this);
    $('channels_button').onclick = this._channelsHandler.bindAsEventListener(this);
    $('friends_button').onclick = this._friendsHandler.bindAsEventListener(this);
    $('feeds_button').onclick = this._feedsHandler.bindAsEventListener(this);
    $('profile_button').onclick = this._profileHandler.bindAsEventListener(this);
    $('microblog_button').onclick = this._microblogHandler.bindAsEventListener(this);

/*    $('logout_button').observe('click',this._logoutHandler.bindAsEventListener(this));
    $('channels_button').observe('click',this._channelsHandler.bindAsEventListener(this));
    $('friends_button').observe('click',this._friendsHandler.bindAsEventListener(this));
    $('feeds_button').observe('click',this._feedsHandler.bindAsEventListener(this));
    $('microblog_button').observe('click',this._microblogHandler.bindAsEventListener(this));
*/
  },
  _removeListeners: function() {
//    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
//    thus old skool

    $('logout_button').onclick = function() { return }
    $('channels_button').onclick = function() { return }
    $('friends_button').onclick = function() { return }
    $('feeds_button').onclick = function() { return }
    $('profile_button').onclick = function() { return }
    $('microblog_button').onclick = function() { return }

/*    $('logout_button').stopObserving('click',this._logoutHandler.bindAsEventListener(this));
    $('channels_button').stopObserving('click',this._channelsHandler.bindAsEventListener(this));
    $('friends_button').stopObserving('click',this._friendsHandler.bindAsEventListener(this));
    $('feeds_button').stopObserving('click',this._feedsHandler.bindAsEventListener(this));
    $('microblog_button').stopObserving('click',this._microblogHandler.bindAsEventListener(this));
*/
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});
