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
              $('mainmenu_status_time').update(self.parent.utils.agoString(json.status.changed));
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

              // get location
              URL = BASE_URL+'/people/'+self.parent.userId+'/@location';
              new Ajax.Request(URL,{
                method : 'get',
                requestHeaders : (client.is_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
                onSuccess : function(response) {
                  var json = response.responseJSON;
                  if (Object.isNumber(json.latitude) && Object.isNumber(json.longitude)) {
                    $('mainmenu_profile_name').insert(' @ ' + self.parent.utils.roundNumber(json.latitude,4) + ' / ' + self.parent.utils.roundNumber(json.longitude,4) + ' ' + self.parent.utils.agoString(json.updated_at));
                  }
                  setTimeout(function() {
                    self.parent.hideLoading();
                  }, 600);
                }
              });
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
          					<a id="groups_button" class="nav_button_text" href="javascript:void(null);">Groups</a>\
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

        delete self.parent.userId; //deleted so that attribute could be indicator of valid session.
        delete self.parent.userName; 
        delete self.parent.userRole;

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
  _groupsHandler: function() {
    this.parent.case25({ backCase : this.parent.case3.bind(this.parent,{out:true}) });
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
    $('groups_button').onclick = this._groupsHandler.bindAsEventListener(this);
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
    $('groups_button').onclick = function() { return }
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
