/**
* ossi channellist class
*/
ossi.channellist = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      selfUpdate : false,
      hostElement : false
	  },options);
    this.updateInterval = 15000;
    this.updateOptions = {};
    this.count = 8;
	  this.startIndex = 1;
	  this.pane = false;
    this._draw();
    this._resetInterval(); // this resets the intervalled update call, if selfUpdate is enabled
	},
	/**
	* _update
	*
	* does not handle XHR failure yet!
	*/
	update: function() {
		var options = Object.extend({
      startIndex : 1,
      count : this.count
	  },this.updateOptions);
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    if (typeof(this.parent.channelsId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    // get channels
    var URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'+self.parent.channelsId; // ossi app Id hard-coded
    var params = { startIndex : options.startIndex, count : options.count };
    self.parent.showLoading();
    new Ajax.Request(URL,{
      method : 'get',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        var json = response.responseJSON;
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            self._drawContents(json.entry);
            if (json.entry.length > 5) $('channels_back_button_2_container').show(); // show second back button at top of screen if more than 5 channels
            if (options.startIndex + options.count < json.totalResults) $('channels_next_button_container').show();
            else $('channels_next_button_container').hide()
            if (options.startIndex > 1) $('channels_previous_button_container').show();
            else $('channels_previous_button_container').hide()
          } else {
            $('channels_placeholder').replace('<div style="padding:10px; text-align:center">There are currently no channels available to you in the service. Please contact system administrators at: otasizzle-helpdesk@hiit.fi</div>');
          }
        } else {
          $('channels_placeholder').replace('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
          $('create_channel_button_container').hide();
        }
        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      },
      onFailure : function(response) {
        alert('could not get channel list!!!');
      }
    });
	},
	_drawContents: function(entries) {
    var self = this;
    var h = '';
    entries.each(function(entry) {
      h += self._getButtonHTML(entry);
    },self);
    $('channels_placeholder').update(h);
    this._addLinkListeners();
  },
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('channellistpane');
    } else {
      alert('ossi.channellist._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="channellistpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="channels_back_button_2_container" class="nav_button" style="display:none">\
          					<a id="channels_back_button2" class="nav_button_text" href="javascript:void(null);">Back to Main Menu</a>\
          				</div>\
                  <div id="channels_placeholder">\
                  </div>\
          				<div id="channels_next_button_container" class="nav_button" style="display:none">\
          					<a id="channels_next_button" class="nav_button_text" href="javascript:void(null);">Next Page</a>\
          				</div>\
          				<div id="channels_previous_button_container" class="nav_button" style="display:none">\
          					<a id="channels_previous_button" class="nav_button_text" href="javascript:void(null);">Previous Page</a>\
          				</div>\
          				<div id="about_channels_button_container" class="nav_button">\
          					<a id="about_channels_button" class="nav_button_text" href="javascript:void(null);">About Channels</a>\
          				</div>\
          				<div id="create_channel_button_container" class="nav_button">\
          					<a id="create_channel_button" class="nav_button_text" href="javascript:void(null);">Create New Channel</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="channels_back_button" class="nav_button_text" href="javascript:void(null);">Back to Main Menu</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(channel) {
    var updated_text = '';
    if (channel.updated_at != 'undefined') {
      if (channel.updated_at != null) {
        // timestamp to epoch
        var d = channel.updated_at;
        var a = Date.UTC(d.substring(0,4),d.substring(5,7),d.substring(8,10),d.substring(11,13),d.substring(14,16),d.substring(17,19));

        // now to epoch
        var e = new Date();
        var b = Date.UTC(e.getUTCFullYear(),(e.getUTCMonth()+1),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds());

        // set string data
        var s = (b-a) / 1000;
        if (s < 60) {
          updated_text = 'a moment ago';
        } else if (s >= 60 && s < 3600) {
          s = Math.floor(s/60);
          updated_text = s+' mins ago';
        } else if (s >= 3600 && s < 86400) {
          s = Math.floor(s/3600);
          updated_text = s+' hours ago';
        } else if (s >= 86400 && s < 2592000) {
          s = Math.floor(s/86400);
          updated_text = s+' days ago';
        } else if (s >= 2592000) {
          s = Math.floor(s/2592000);
          updated_text = s+' months ago';
        }
      }
    }
    
    var creator_html = '';
    if (channel.metadata != null) {
      if (typeof(channel.metadata.creator) != 'undefined') {
        creator_html = '<div class="button_subtitle_text" style="padding-top:2px">Originally created by '+channel.metadata.creator+'</div>';
      }
    }

    var ident_class = '';
    if (channel.tags != null) {
      ident_class = (channel.tags.match('private')) ? 'private' : 'public';
    }
    
    var h =   '\
          				<div class="channel_button" id="channel_id_'+channel.id+'">\
                    <div class="channel_button_left_column '+ident_class+'"></div>\
                    <div class="channel_button_text">\
        						  <div class="button_title"><a href="javascript:void(null);">'+channel.title+'</a></div>\
        						  <div class="button_subtitle_text" style="padding-top:3px">'+channel.totalResults+' messages. Updated '+updated_text+'</div>\
        						  '+creator_html+'\
                    </div>\
          				</div>\
          			';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _createChannelHandler: function() {
    var self = this;
    self.parent.case19({
      backCase : self.parent.case18.bind(self.parent,{
        out : true,
        backCase : self.parent.case3.bind(self.parent,{out:true}) 
      })
    });
  },
  _openChannelHandler: function(event,button_id) {
    var self = this;
    var channel_id = button_id.replace("channel_id_","");
    self.parent.case20({
      channelId : channel_id,
      backCase : self.parent.case18.bind(self.parent,{
        out : true,
        backCase : self.parent.case3.bind(self.parent,{out:true}) 
      })
    });
  },
  _nextHandler: function() {
    this.updateOptions = { 'startIndex' : this.startIndex+this.count, 'count' : this.count };
    this.update();
    this._resetInterval(); // reset the interval as we just updated
    this.startIndex += this.count;
  },
  _previousHandler: function() {
    this.updateOptions = { 'startIndex' : this.startIndex-this.count, 'count' : this.count };
    this.update();
    this._resetInterval(); // reset the interval as we just updated
    this.startIndex -= this.count;
  },
  _aboutChannelsHandler: function() {
    var m = '\
                <div style="font-size:10px; padding:10px">\
        				  <h2>About Channels</h2>\
                  <p>You can create private (red) and public (green) channels on Ossi. Private channels are visible only to the creator\'s Sizl friends and public channels are visible to all Ossi users.</p>\
                  <p>If you find any bugs or have some other comments about the functionalities of the channels or Ossi in general please post a comment on Ossi\'s "Features & Bugs" channel, or email us at <a href="mailto:helpdesk-otasizzle@hiit.fi">helpdesk-otasizzle@hiit.fi</a>.</p>\
                </div>\
    ';
    this.parent.case6({
      message : m,
      buttonText : "Back",
      backCase:this.parent.case18.bind(this.parent,{
        out:true,
        backCase:this.parent.case3.bind(this.parent,{out:true})
      })
    });            
  },
  _addListeners: function() {
    $('create_channel_button').onclick = this._createChannelHandler.bindAsEventListener(this);
    $('about_channels_button').onclick = this._aboutChannelsHandler.bindAsEventListener(this);
    $('channels_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('channels_next_button').onclick = this._nextHandler.bindAsEventListener(this);
    $('channels_previous_button').onclick = this._previousHandler.bindAsEventListener(this);
    $('channels_back_button2').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('create_channel_button').onclick = function() { return }
    $('about_channels_button').onclick = function() { return };
    $('channels_back_button').onclick = function() { return }
    $('channels_next_button').onclick = function() { return }
    $('channels_previous_button').onclick = function() { return }
    $('channels_back_button2').onclick = function() { return }
  },
  _addLinkListeners: function() { // for dynamic buttons
    $$('.channel_button').each(function(button) {
      button.onclick = this._openChannelHandler.bindAsEventListener(this,button.id);
    },this);
  },
  _removeLinkListeners: function() {
    $$('.channel_button').each(function(button) {
      button.onclick = function() { return };
    },this);
  },
  _resetInterval: function() {
    if (this.options.selfUpdate) {
      clearInterval(this.interval);
      this.interval = setInterval(this.update.bind(this), this.updateInterval);
    }
  },
  destroy: function () {
    if (this.options.selfUpdate) {
      clearInterval(this.interval);
    }
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});