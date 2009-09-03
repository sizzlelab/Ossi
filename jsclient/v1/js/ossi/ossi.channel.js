/**
 * ossi channel class
 */
ossi.channel = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false,
      groupId: false,
      channelId: false,
      selfUpdate: false,
      wall: false,
      startIndex: 1,
      count: 7
    }, options);
    this.count = this.options.count;
    this.updateInterval = 20000;
    this.updateOptions = {
      per_page: 8,
      page: 1
    };
    this.startIndex = this.options.startIndex;
    this.pane = false;
    this._draw();
    this._resetInterval(); // this resets the intervalled update call, if selfUpdate is enabled
  },
  /**
   * update
   *
   * does not handle XHR failure yet!
   */
  update: function(){
    if (!this.options.wall && typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var params = {
      per_page: this.updateOptions.per_page,
      page: this.updateOptions.page,
      event_id: 'Ossi::BrowseChannel'
    };
    
    // get contents
    var URL = BASE_URL + '/channels/' + self.options.channelId + '/@messages';
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'get',
      requestHeaders: (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      parameters: params,
      onSuccess: function(response){
        //        if(!self.options.wall) self.parent.hideLoading();
        self.parent.hideLoading();
        var json = response.responseJSON;
        
        if ((!Object.isUndefined(self.parent.userId) || !self.options.wall)) {
          self._setModeratorHTML();
        }
        
        if (json.priv != null) 
          self.priv = json.priv; // if channel has an owner it is a private channel!
        //        if (json.owner != null) self.owner = json.owner; // if channel has an owner it is a private channel!
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            self._drawContents(json.entry);
            // show second back button at top of screen if more than 5 channels
            if (self.updateOptions.page > 1) 
              $('channel_back_button_2_container').show(); // show second back button at top of screen if more than 5 channels
            self.parent.utils.addPagingFeature($('channel-paging-container'), json, self);
          }
          else {
            $('channel_placeholder').update('<div style="padding:10px; text-align:center">This channel has no posts. Be the first poster by clicking \'Add Post\' below!</div>');
          }
        }
        else {
          $('channel_placeholder').update('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
          $('add_post_button_container').hide();
        }
      },
      on404: function(response){
        // Channel not found
        // FIXME: define action
      }
    });
  },
  _drawContents: function(entries){
    var self = this;
    var h = '';
    entries.each(function(entry){
      h += self._getButtonHTML(entry);
    }, self);
    $('channel_placeholder').update(h);
    this._addLinkListeners();
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('channelpane');
    }
    else {
      alert('ossi.channel._draw() failed! this.options.hostElement not defined!');
    }
  },
  _setModeratorHTML: function(){
    var self = this;
    var URL = BASE_URL + '/channels/' + self.options.channelId;
    new Ajax.Request(URL, {
      method: 'get',
      requestHeaders: (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      onSuccess: function(response){
        response = response.responseJSON;
        //moderator privileges
        if (self.parent.userId == response.entry.owner_id) {
          $('channel_delete_button_container').show();
          $('channel_delete_button').onclick = self._deleteHandler.bindAsEventListener(self);
        }
      }
    });
  },
  
  _getHTML: function(){
    var h = '\
          		  <div id="channelpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
            			<div id="channel_back_button_2_container" class="nav_button" style="display:none">\
            				<a id="channel_back_button2" class="nav_button_text" href="javascript:void(null);">Back</a>\
            			</div>\
                	<div id="channel_placeholder"></div>\
              ';
    
    if (this.parent.userId != false) {
      h += '\
  			  	      <div id="add_post_button_container" class="nav_button">\
          					<a id="add_post_button" class="nav_button_text" href="javascript:void(null);">Add Post</a>\
          		  	</div>\
       		    ';
    }
    else {
      h += '\
  			  	      <div id="add_post_button_container" class="nav_button">\
          					<a id="add_post_button" class="nav_button_text" href="javascript:void(null);">Add Anonymous Post</a>\
          		  	</div>\
       		    ';
    }
    h += '\
				<div id="channel-paging-container"></div>\
          		';
    h += '<div id="channel_delete_button_container" class="nav_button" style="display:none;">\
                <a id="channel_delete_button" class="nav_button_text" href="javascript:void(null);">Delete this channel</a>\
        </div>\
        ';
    if (this.parent.userId != false) {
      h += '\
  				        <div class="nav_button">\
          					<a id="channel_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
        		  ';
    }
    else {
      h += '\
  	  		        <div class="nav_button">\
          					<a id="channel_login_button" class="nav_button_text" href="javascript:void(null);">Log in</a>\
          				</div>\
          			</div>\
        		  ';
    }
    return h;
  },
  _getButtonHTML: function(post){
    var anonymous_icon = '../images/anon_icon.png'; // FIX THIS! SHOULD NOT BE RELATIVE PATH!
    var updated_text = '';
    if (post.updated_at != 'undefined') {
      if (post.updated_at != null) {
        updated_text = this.parent.utils.dateToString(post.updated_at);
      }
    }
    
    var author_string = (typeof(post.poster_name) != 'undefined') ? 'by ' + post.poster_name + ' ' : '';
    var stripped_message = post.title + ' - ' + post.body;
    var avatar_src = (post.poster_id == null) ? anonymous_icon : BASE_URL + '/people/' + post.poster_id + '/@avatar/small_thumbnail';
    
    if (!this.options.wall) {
      stripped_message = stripped_message.replace(/<\/?[^>]+(>|$)/g, ""); //clean html-tags away
      stripped_message = stripped_message.replace(/&lt;br \/&gt;/g, ""); // clean breaks away
      stripped_message = stripped_message.replace(/\[quote\].*\[\/quote\]/g, '').replace(/<br \/>/g, '');
      var message_stub = stripped_message.truncate(40);
      var h = '\
            				<div class="post_button" id="post_id_' + post.id + '">\
                      <div class="post_button_left_column">\
                      	<img style="margin:2px 0px 0px 2px; border:solid #eee 1px;"\
                      	src="' +
      avatar_src +
      '"\
                      	width="50" height="50" border="0" />\
                      	</div>\
                      <div class="post_button_text">\
          						  <div class="button_title"><a href="javascript:void(null);">' +
      message_stub +
      '</a></div>\
          						  <div class="button_subtitle_text" style="padding-top:3px">' +
      author_string +
      ' ' +
      updated_text +
      '</div>\
                      </div>\
            				</div>\
            			';
    }
    else {
      stripped_message = stripped_message.replace(/<\/?[^>]+(>|$)/g, ""); //clean html-tags away
      stripped_message = stripped_message.replace(/\[quote\].*\[\/quote\]/g, '').replace(/<br \/>/g, '');
      var message_stub = stripped_message.replace(/(ftp|http|https|file):\/\/[\S]+(\b|$)/gim, '<a href="$&" style="text-decoration: underline;" target="_blank">$&</a>').replace(/([^\/])(www[\S]+(\b|$))/gim, '$1<a href="http://$2" style="text-decoration: underline;" target="_blank">$2</a>');
      
      var h = '\
            		<div class="post_wall" id="post_id_' + post.id + '">\
                  <div class="wall_post_button_left_column">\
                  	<img style="margin:2px 0px 0px 2px; border:solid #eee 1px;"\
                  	src="' +
      avatar_src +
      '"\
                  	width="50" height="50" border="0" />\
                  </div>\
                  <div  style="height:55px; float:left;">&nbsp;</div>\
                  <div class="wall_post_button_text">\
      						  <div class="wall_button_title"><a href="javascript:void(null);">' +
      message_stub +
      '</a></div>\
      						  <div class="wall_button_subtitle_text" style="padding-top:3px">' +
      author_string +
      ' , ' +
      updated_text +
      '</div>\
                  </div><div style="clear:both;"></div>\
            		</div>\
          			';
      
    }
    return h;
  },
  _openPostHandler: function(event, button_id){
    var self = this;
    var post_id = button_id.replace("post_id_", "");
    var channel_id = self.options.channelId;
    var startIndex = self.startIndex;
    self.parent.case22({
      channelId: channel_id,
      postId: post_id,
      startIndex: startIndex
    });
  },
  _loginHandler: function(){
    var self = this;
    self.parent.case2({
      channelId: self.options.channelId
    });
  },
  _backHandler: function(){
    this.options.backCase.apply();
  },
  _addPostHandler: function(){
    var self = this;
    self.parent.case21({
      channelId: self.options.channelId,
      priv: (typeof(self.priv) != 'undefined') ? self.priv : false
    });
  },
  _deleteHandler: function(){
    var self = this;
    // get contents
    var URL = BASE_URL + '/channels/' + self.options.channelId; // this page. ossi app Id hard-coded
    self.parent.showLoading();
    var params = {
      'event_id': 'Ossi::ChannelView//DeleteChannel'
    };
    new Ajax.Request(URL, {
      method: 'delete',
      parameters: params,
      requestHeaders: (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      onSuccess: function(response){
        self.parent.hideLoading();
        self.parent.stack.pop();
        self.parent.case6({
          message: "Channel has been deleted",
          buttonText: "Back to channel list"
        });
      }
      // on403 and on404
    });
    
  },
  _allowDeleteHandler: function(){
    if (!this.allowDelete) {
      this.allowDelete = true;
      $('channel_delete_channel').setStyle('visibility: visible');
    }
    else {
      this.allowDelete = false;
      $('channel_delete_channel').setStyle('visibility: hidden');
    }
  },
  
  _addListeners: function(){
    if (this.parent.userId != false || !this.options.wall) {
      $('channel_back_button').onclick = this._backHandler.bindAsEventListener(this);
      $('channel_back_button2').onclick = this._backHandler.bindAsEventListener(this);
      $('add_post_button').onclick = this._addPostHandler.bindAsEventListener(this);
    }
    else {
      $('add_post_button').onclick = this._addPostHandler.bindAsEventListener(this);
      $('channel_login_button').onclick = this._loginHandler.bindAsEventListener(this);
    }
  },
  _removeListeners: function(){
    if (this.parent.userId != false || !this.options.wall) {
      $('channel_back_button').onclick = function(){
        return
      }
      $('add_post_button').onclick = function(){
        return
      }
      $('channel_back_button2').onclick = function(){
        return
      }
      if (!Object.isUndefined(this.parent.userRole)) {
        if (this.parent.userRole == 'moderator' && this.priv != true) {
          if ($('channel_delete_button')) {
            $('channel_delete_button').onclick = function(){
              return
            }
            if ($('channel_allow_delete_button')) {
              $('channel_allow_delete_button').onclick = function(){
                return
              }
            }
          }
        }
      }
    }
    else {
      $('channel_login_button').onclick = function(){
        return
      }
    }
  },
  _addLinkListeners: function(){ // for dynamic buttons
    if (!Object.isUndefined(this.parent.userId) && !this.options.wall) {
      $$('.post_button').each(function(button){
        button.onclick = this._openPostHandler.bindAsEventListener(this, button.id);
      }, this);
    }
    else 
      if (!Object.isUndefined(this.parent.userId)) {
        $$('.post_wall').each(function(button){
          button.onclick = this._openPostHandler.bindAsEventListener(this, button.id);
        }, this);
      }
  },
  _removeLinkListeners: function(){
    if (!Object.isUndefined(this.parent.userId) && !this.options.wall) {
      $$('.post_button').each(function(button){
        button.onclick = function(){
          return
        };
      }, this);
    }
    else 
      if (!Object.isUndefined(this.parent.userId)) {
        $$('.post_wall').each(function(button){
          button.onclick = function(){
            return
          };
        }, this);
      }
  },
  _resetInterval: function(){
    if (this.options.selfUpdate) {
      clearInterval(this.interval);
      this.interval = setInterval(this.update.bind(this), this.updateInterval);
    }
  },
  destroy: function(){
    if (this.options.selfUpdate) {
      clearInterval(this.interval);
    }
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});
