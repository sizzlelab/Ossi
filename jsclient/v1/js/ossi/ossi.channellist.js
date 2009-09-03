/**
 * ossi channellist class
 */
ossi.channellist = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      groupId: false,
      selfUpdate: false,
      hostElement: false
    }, options);
    this.updateInterval = 20000;
    this.updateOptions = {
      per_page: 8,
      page: 1
    };
    this.pane = false;
    this._draw();
//    if (this.options.groupId != false) 
//      $('create_channel_button_container').hide();
    this._resetInterval(); // this resets the intervalled update call, if selfUpdate is enabled
  },
  /**
   * _update
   *
   * does not handle XHR failure yet!
   */
  update: function(options){
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    // get channels
    var URL = BASE_URL + '/channels';
    var params = {
      per_page: this.updateOptions.per_page,
      page: this.updateOptions.page,
      event_id: 'Ossi::BrowseChannelList'
    };
    if (self.options.groupId != false) 
      params.group_id = self.options.groupId;
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'get',
      parameters: params,
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      onSuccess: function(response){
        var json = response.responseJSON;
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            self._drawContents(json.entry);
            self.parent.utils.addPagingFeature( $('channellist-paging-container') , json, self);
          } else {
            $('channels_placeholder').replace('<div style="padding:10px; text-align:center">There are currently no channels available. Create one now!</div>');
          }
        } else {
          $('channels_placeholder').replace('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
          $('create_channel_button_container').hide();
        }
        setTimeout(function(){
          self.parent.hideLoading();
        }, 600);
      },
      onFailure: function(response){
        alert('could not get channel list!!!');
      }
    });
  },
  _drawContents: function(entries){
    var self = this;
    var h = '';
    entries.each(function(entry){
      h += self._getButtonHTML(entry);
    }, self);
    $('channels_placeholder').update(h);
    this._addLinkListeners();
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('channellistpane');
    }
    else {
      alert('ossi.channellist._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
    var h = '\
          			<div id="channellistpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="channels_back_button_2_container" class="nav_button" style="display:none">\
          					<a id="channels_back_button2" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
                  <div id="channels_placeholder">\
                  </div>\
          				<div id="channellist-paging-container" >\
						      </div>\
						      <div style="clear:both"></div>\
          				<div id="create_channel_button_container" class="nav_button">\
          					<a id="create_channel_button" class="nav_button_text" href="javascript:void(null);">Create New Channel</a>\
          				</div>\
          				<div id="about_channels_button_container" class="nav_button">\
          					<a id="about_channels_button" class="nav_button_text" href="javascript:void(null);">About Channels</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="channels_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(channel){
    var updated_text = '';
    if (channel.updated_at != 'undefined') {
      if (channel.updated_at != null) {
        updated_text = this.parent.utils.agoString(channel.updated_at);
      }
    }
    
    var creator_html = '';
    if (channel.metadata != null) {
      if (typeof(channel.metadata.creator) != 'undefined') {
        creator_html = '<div class="button_subtitle_text" style="padding-top:2px">Originally created by ' + channel.metadata.creator + '</div>';
      }
    }
    
    var ident_class = '';
    if (!Object.isUndefined(channel.channel_type)) {
      if (channel.channel_type == 'public') {
        ident_class = 'public';
      } else if (channel.channel_type == 'group') {
        ident_class = 'group';
      } else {
        ident_class = 'private';
      }
    }
    
    var h = '\
          				<div class="channel_button" id="channel_id_' + channel.id + '">\
                    <div class="channel_button_left_column ' +
    ident_class +
    '"></div>\
                    <div class="channel_button_text">\
        						  <div class="button_title" style="font-size:11px; font-weight:bold;"><a href="javascript:void(null);">' +
    channel.name +
    '</a></div>\
        						  <div class="button_subtitle_text" style="padding:3px 0px 0px 15px">' +
    channel.description +
    '</div>\
        						  <div class="button_subtitle_text" style="padding:0px 0px 0px 15px">Created by ' +
    channel.owner_name +
    '</div>\
        						  <div class="button_subtitle_text" style="padding:0px 0px 0px 15px"><!--' +
    channel.totalResults +
    ' messages.--> Updated ' +
    updated_text +
    '</div>\
                    </div>\
          				</div>\
          			';
    return h;
  },
  _backHandler: function(){
    this.options.backCase.apply();
  },
  _createChannelHandler: function(){
    var self = this;
    self.parent.case19({
      groupId : self.options.groupId
    });
  },
  _openChannelHandler: function(event, button_id){
    var self = this;
    var channel_id = button_id.replace("channel_id_", "");
    self.parent.case20({
      channelId: channel_id,
      groupId: self.options.groupId
    });
  },
  _aboutChannelsHandler: function(){
    var m = '\
                <div style="font-size:10px; padding:10px">\
        				  <h2>About Channels</h2>\
                  <p>Browse the channels in Sizzle to see what\'s being discussed and what\'s happening around you. You can participate in the discussion by posting messages. The most recently updated channels are ranked on the top of the Sizzle view.</p>\
                  <p>Ossi has three types of channels. Public (green) channels are open to all Sizl users. Friends-only (read) are visible only to the creator\'s Sizl friends. You can create new channels yourself or use ones that already exist.</p>\
                  <p>You can also create group channels (orange) through the group\'s profile page. Group channels are visible only to the members of the group. You can view group channels either in the group’s profile page or in the Sizzle view.</p>\
                  <p>If you find any bugs or have some other comments about the functionalities of the groups or Ossi in general please post a comment on Ossi\'s "Ossi Feedback" channel, or email us at <a href="mailto:otasizzle-helpdesk@hiit.fi">otasizzle-helpdesk@hiit.fi</a>.</p>\
                </div>\
    ';
    this.parent.case6({
      message: m,
      buttonText: "Back"
    });
  },
  _addListeners: function(){
    $('create_channel_button').onclick = this._createChannelHandler.bindAsEventListener(this);
    $('about_channels_button').onclick = this._aboutChannelsHandler.bindAsEventListener(this);
    $('channels_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('channels_back_button2').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function(){
    $('create_channel_button').onclick = function(){
      return
    }
    $('about_channels_button').onclick = function(){
      return
    };
    $('channels_back_button').onclick = function(){
      return
    }
    $('channels_back_button2').onclick = function(){
      return
    }
    $$('.nav_button').each(function(button){ button.onclick = function(){}; });
  },
  _addLinkListeners: function(){ // for dynamic buttons
    $$('.channel_button').each(function(button){
      button.onclick = this._openChannelHandler.bindAsEventListener(this, button.id);
    }, this);
  },
  _removeLinkListeners: function(){
    $$('.channel_button').each(function(button){
      button.onclick = function(){
        return
      };
    }, this);
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
