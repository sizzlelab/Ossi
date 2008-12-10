/**
* ossi channel class
*/
ossi.channel = Class.create(ossi.base,{
  initialize: function(parent,options) {
    this.parent = parent;
    this.options = Object.extend({
      hostElement : false,
      channelId : false,
      startIndex : 1,
      count : false
    },options);
    this.count = 7;
    this.startIndex = 1;
    this.priv = true; // for moderator privilage check
    this.pane = false;
    this._draw();
	},
	/**
	* _update
	*
	* does not handle XHR failure yet!
	*/
	update: function(options) {
		var options = Object.extend({
      startIndex : 1,
      count : this.count
	  },options);
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    // get contents
    var URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'+self.options.channelId; // ossi app Id hard-coded
    var params = { startIndex : options.startIndex, count : options.count };
    self.parent.showLoading();
    new Ajax.Request(URL,{
      method : 'get',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      parameters : params,
      onSuccess : function(response) {
        self.parent.hideLoading();
        var json = response.responseJSON;

        //for moderator privilage check
        if (self.parent.userRole == 'moderator' && json.tags != null && json.tags.match('private') == 'private') {
          self.priv = true;
        } else if(self.parent.userRole == 'moderator'){
          self.priv = false;
          self._setModeratorHTML();
          self._addModeListeners();
        } 
        if (json.private != null) self.priv = json.private; // if channel has an owner it is a private channel!
//        if (json.owner != null) self.owner = json.owner; // if channel has an owner it is a private channel!
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            self._drawContents(json.entry);
            if (json.entry.length > 5) $('channel_back_button_2_container').show(); // show second back button at top of screen if more than 5 channels
            if (options.startIndex + options.count < json.totalResults) $('channel_next_button_container').show();
            else $('channel_next_button_container').hide()
            if (options.startIndex > 1) $('channel_previous_button_container').show();
            else $('channel_previous_button_container').hide()
          } else {
            $('channel_placeholder').update('<div style="padding:10px; text-align:center">This channel has no posts. Be the first poster by clicking \'Add Post\' below!</div>');
          }
        } else {
          $('channel_placeholder').update('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
          $('add_post_button_container').hide();
        }
      }
    });
	},
	_drawContents: function(entries) {
    var self = this;
    var h = '';
    entries.each(function(entry) {
      h += self._getButtonHTML(entry);
    },self);
    $('channel_placeholder').update(h);
    this._addLinkListeners();
  },
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('channelpane');
    } else {
      alert('ossi.channel._draw() failed! this.options.hostElement not defined!');
    }
  },
  _setModeratorHTML: function(){
    var m = '';
    //moderator privileges
    if(this.parent.userRole == 'moderator' && this.priv != true){
        m = '<div class="nav_button">\
                <a id="channel_allow_delete_button" class="nav_button_text" href="javascript:void(null);">Delete this channel</a>\
        </div>\
        <div class="nav_button" id="channel_delete_channel" style="visibility: hidden;">\
                <a id="channel_delete_button" class="nav_button_text" href="javascript:void(null);">Delete for good.</a>\
        </div>\
        ';
    }
    $('moderator_placeholder').replace(m);
	// return m;
  },

  _getHTML: function() {
    var h =   '\
          			<div id="channelpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="channel_back_button_2_container" class="nav_button" style="display:none">\
          					<a id="channel_back_button2" class="nav_button_text" href="javascript:void(null);">Back to Channel List</a>\
          				</div>\
                  <div id="channel_placeholder">\
                  </div>\
          				<div id="add_post_button_container" class="nav_button">\
          					<a id="add_post_button" class="nav_button_text" href="javascript:void(null);">Add Post</a>\
          				</div>\
          				<div id="channel_next_button_container" class="nav_button" style="display:none">\
          					<a id="channel_next_button" class="nav_button_text" href="javascript:void(null);">Next Page</a>\
          				</div>\
          				<div id="channel_previous_button_container" class="nav_button" style="display:none">\
          					<a id="channel_previous_button" class="nav_button_text" href="javascript:void(null);">Previous Page</a>\
          				</div>\
                <div id="moderator_placeholder">\
                </div>\
					<div class="nav_button">\
          					<a id="channel_back_button" class="nav_button_text" href="javascript:void(null);">Back to Channel List</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(post) {
    var icon = '001_54';
    var updated_text = '';
    if (post.updated_at != 'undefined') {
      if (post.updated_at != null) {
        // timestamp to epoch
        var d = post.updated_at;
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

    var author_string = (typeof(post.metadata.author) != 'undefined') ? 'by '+post.metadata.author+' ' : '';
    var stripped_message = post.metadata.body.replace(/\[quote\].*\[\/quote\]/g,'').replace(/<br \/>/g,'');
    var message_stub = stripped_message.truncate(40);

    var h =   '\
          				<div class="post_button" id="post_id_'+post.id+'">\
                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="'+BASE_URL+'/people/'+post.updated_by+'/@avatar/small_thumbnail?'+Math.random()*9999+'" width="50" height="50" border="0" /></div>\
                    <div class="post_button_text">\
        						  <div class="button_title"><a href="javascript:void(null);">'+message_stub+'</a></div>\
        						  <div class="button_subtitle_text" style="padding-top:3px">'+author_string+' '+updated_text+'</div>\
                    </div>\
          				</div>\
          			';
    return h;
  },
  _openPostHandler: function(event,button_id) {
    var self = this;
    var post_id = button_id.replace("post_id_","");
    var channel_id = self.options.channelId;
    self.parent.case22({
      channelId : channel_id,
      postId : post_id,
      backCase : self.parent.case20.bind(self.parent,{
        out : true,
        channelId : channel_id,
        postId : post_id,
        backCase : self.parent.case18.bind(self.parent,{
          out : true,
          backCase : self.parent.case3.bind(self.parent,{out:true}) 
        })
      })
    })
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _nextHandler: function() {
    this.update({ 'startIndex' : this.startIndex+this.count, 'count' : this.count });
    this.startIndex += this.count;
  },
  _previousHandler: function() {
    this.update({ 'startIndex' : this.startIndex-this.count, 'count' : this.count });
    this.startIndex -= this.count;
  },
  _addPostHandler: function() {
    var self = this;
    self.parent.case21({
      channelId : self.options.channelId,
      priv : (typeof(self.priv) != 'undefined') ? self.priv : false,
      backCase : self.parent.case20.bind(self.parent,{
        channelId : self.options.channelId,
        out : true,
        backCase : self.parent.case18.bind(self.parent,{
          out:true,
          backCase : self.parent.case3.bind(self.parent,{out:true})
        }) 
      })
    });
  },
  _deleteHandler: function() {
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the pa$
    var self = this;

    // get contents
    var URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'+self.options.channelId; // this page. ossi app Id hard-coded
    self.parent.showLoading();
    new Ajax.Request(URL,{
      method : 'delete',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        self.parent.hideLoading();
        var json = response.responseJSON;

        self.options.backCase.apply();

        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      }
      // on403 and on404
    });

  },
  _allowDeleteHandler: function() {
    if(!this.allowDelete) {
      this.allowDelete = true;
      $('channel_allow_delete_button').update('Cancel delete');
      $('channel_delete_channel').setStyle('visibility: visible');
    } else {
      this.allowDelete = false;
      $('channel_allow_delete_button').update('Delete this post');
      $('channel_delete_channel').setStyle('visibility: hidden');
    }
  },

  _addModeListeners: function(){
    $('channel_delete_button').onclick = this._deleteHandler.bindAsEventListener(this);
    $('channel_allow_delete_button').onclick = this._allowDeleteHandler.bindAsEventListener(this);
  },

  _addListeners: function() {
    $('add_post_button').onclick = this._addPostHandler.bindAsEventListener(this);
    $('channel_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('channel_next_button').onclick = this._nextHandler.bindAsEventListener(this);
    $('channel_previous_button').onclick = this._previousHandler.bindAsEventListener(this);
    $('channel_back_button2').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('add_post_button').onclick = function() { return }
    $('channel_back_button').onclick = function() { return }
    $('channel_next_button').onclick = function() { return };
    $('channel_previous_button').onclick = function() { return };
    $('channel_back_button2').onclick = function() { return }

    if(this.parent.userRole == 'moderator' && this.priv != true){
      $('channel_delete_button').onclick = function() { return }
      $('channel_allow_delete_button').onclick = function() { return }
    }

  },
  _addLinkListeners: function() { // for dynamic buttons
    $$('.post_button').each(function(button) {
      button.onclick = this._openPostHandler.bindAsEventListener(this,button.id);
    },this);
  },
  _removeLinkListeners: function() {
    $$('.post_button').each(function(button) {
      button.onclick = function() { return };
    },this);
  },
  destroy: function () {
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});
