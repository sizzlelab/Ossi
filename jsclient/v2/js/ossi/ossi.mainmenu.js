/**
 * ossi mainmenu class
 */
ossi.mainmenu = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false,
      selfUpdate: true,
      backCase: function(){
        return false;
      }
    }, options);
    this.pane = false;
    this.updateInterval = 20000;
    this._draw();
//    this._resetInterval(); // this resets the intervalled update call, if selfUpdate is enabled
  },
  /**
   * _update
   *
   * does not handle XHR failure yet!
   */
  update: function(){
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/@me/@self';
//    self.parent.showLoading();
    var params = { 'event_id' : 'Ossi::MainMenu' };
    new Ajax.Request(URL, {
      method: 'get',
      parameters: params,
      onSuccess: function(response){
        var json = response.responseJSON;
        json = json.entry;
        var name = (json.name != null) ? json.name['unstructured'] : json.username; // if name has not been set
        self.parent.userName = name;
        $('mainmenu_profile_name').update(name);
        var status_message = '';
        var status_time = false;
        var location = '';
        if (typeof(json.location) != 'undefined') {
          if (typeof(json.location.label) != 'undefined') {
            if (json.location.label != null) {
             if (json.location.label.length > 0) {
              location = ' @ ' + json.location.label;
             }
            }
          }
        }
        if (typeof(json.role) != 'undefined' && json.role != null) {
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
            } else {
              $('mainmenu_status_time').update('');
            }
          }
        }

        $('mainmenu_status_text').update(status_message + location);
        
        URL = BASE_URL + '/people/@me/@pending_friend_requests'
        var params = { 'event_id' : 'Ossi::MainMenu/Friends' };
        new Ajax.Request(URL, {
          method: 'get',
          parameters: params,
          onSuccess: function(response){
            var json = response.responseJSON;
            if (json.entry.length > 0) 
              $('pending_friends_container').update('<b>(' + json.entry.length + ' new)</b>');
            
//            setTimeout(function(){
//              self.parent.hideLoading();
//            }, 600);
          }
        });
      }
    });
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('mainmenupane');
    }
    else {
      alert('ossi.mainmenu._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
    var h = '\
          			<div id="mainmenupane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="logo_small" style="text-align: right; padding-top:7px; padding-right:10px;"><a style="color:#ff9c00;" href="http://sizl.org" target="_blank">www.sizl.org</a></div>\
          				<div id="microblog_button" class="post_button">\
                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="' + BASE_URL + '/people/'+this.parent.userId+'/@avatar/small_thumbnail" width="50" height="50" border="0" /></div>\
                    <div class="post_button_text">\
        						  <div class="button_title"><a id="mainmenu_profile_name" href="javascript:void(null);">loading...</a></div>\
        						  <div id="mainmenu_status_text" class="button_title" style="font-size:10px;">loading...</div>\
        						  <div id="mainmenu_status_time" class="button_subtitle_text">loading...</div>\
                    </div>\
        				  </div>\
          				<div class="nav_button" style="display:none">\
          					<a id="feeds_button" class="nav_button_text" href="javascript:void(null);">Feeds</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="channels_button" class="nav_button_text" href="javascript:void(null);">Sizzle</a>\
          				</div>\
          				<div class="nav_button">\
          				  <a id="friends_button" class="nav_button_text" href="javascript:void(null);">Friends <span id="pending_friends_container"></span></a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="groups_button" class="nav_button_text" href="javascript:void(null);">Groups</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="search_button" class="nav_button_text" href="javascript:void(null);">Search</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="logout_button" class="nav_button_text" href="javascript:void(null);">Logout</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _logoutHandler: function(){
    var self = this;
    clearInterval(this.interval);
    this.parent.loadingpane.show();
    var params = { 'event_id' : 'Ossi::MainMenu/LogOut' }; 
    new Ajax.Request(BASE_URL + '/session', {
      method: 'delete',
      parameters: params,
      onSuccess: function(){
        self.parent.sessionCookie = false;
        
        delete self.parent.userId; //deleted so that attribute could be indicator of valid session.
        delete self.parent.userName;
        delete self.parent.userRole;
        if (! Object.isUndefined(self.parent.locator)) self.parent.locator.stop();
        
        self.parent.loadingpane.hide();
        self.parent.case1({
          out: true
        });
      },
      onFailure: function(){
        self.parent.loadingpane.hide();
        self.parent.case6({
          message: "Could not log user out.",
          buttonText: "Try again"
        });
      }
    });
  },
  _channelsHandler: function(){
    this.parent.case18({});
  },
  _groupsHandler: function(){
    this.parent.case25({});
  },
  _friendsHandler: function(){
    this.parent.case9({});
  },
  _feedsHandler: function(){
  },
  _microblogHandler: function(){
    this.parent.case7({});
  },
  _searchHandler: function(){
    this.parent.case30({});
  },
  _addListeners: function(){
    //    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
    //    thus old skool
    
    $('logout_button').onclick = this._logoutHandler.bindAsEventListener(this);
    $('channels_button').onclick = this._channelsHandler.bindAsEventListener(this);
    $('groups_button').onclick = this._groupsHandler.bindAsEventListener(this);
    $('friends_button').onclick = this._friendsHandler.bindAsEventListener(this);
    $('feeds_button').onclick = this._feedsHandler.bindAsEventListener(this);
    $('microblog_button').onclick = this._microblogHandler.bindAsEventListener(this);
    $('search_button').onclick = this._searchHandler.bindAsEventListener(this);
    
    /*    $('logout_button').observe('click',this._logoutHandler.bindAsEventListener(this));
     $('channels_button').observe('click',this._channelsHandler.bindAsEventListener(this));
     $('friends_button').observe('click',this._friendsHandler.bindAsEventListener(this));
     $('feeds_button').observe('click',this._feedsHandler.bindAsEventListener(this));
     $('microblog_button').observe('click',this._microblogHandler.bindAsEventListener(this));
     */
  },
  _removeListeners: function(){
    //    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
    //    thus old skool
    
    $('logout_button').onclick = function(){
      return
    }
    $('channels_button').onclick = function(){
      return
    }
    $('groups_button').onclick = function(){
      return
    }
    $('friends_button').onclick = function(){
      return
    }
    $('feeds_button').onclick = function(){
      return
    }
    $('microblog_button').onclick = function(){
      return
    }
    $('search_button').onclick = function(){
      return
    }
    
    /*    $('logout_button').stopObserving('click',this._logoutHandler.bindAsEventListener(this));
     $('channels_button').stopObserving('click',this._channelsHandler.bindAsEventListener(this));
     $('friends_button').stopObserving('click',this._friendsHandler.bindAsEventListener(this));
     $('feeds_button').stopObserving('click',this._feedsHandler.bindAsEventListener(this));
     $('microblog_button').stopObserving('click',this._microblogHandler.bindAsEventListener(this));
     */
  },
  _resetInterval: function(){
    if (this.options.selfUpdate) {
      clearInterval(this.interval);
      this.interval = setInterval(this.update.bind(this), this.updateInterval);
    }
  },
  destroy: function(){
    clearInterval(this.interval);
    this._removeListeners();
    this.pane.remove();
  }
});
