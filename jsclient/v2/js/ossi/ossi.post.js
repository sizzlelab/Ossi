/**
 * ossi post class
 */
ossi.post = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false,
      channelId: false,
      postId: false
    }, options);
    this.pane = false;
    this._draw();
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
    // get contents
    var URL = BASE_URL + '/channels/' + self.options.channelId + '/@messages/' + self.options.postId;
    var params = {
      event_id: 'Ossi::BrowseChannelMessages/ShowOneMessage'
    };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'get',
      parameters: params,
      onSuccess: function(response){
        self.parent.hideLoading();
        var json = response.responseJSON;
        if (typeof(json.entry) != 'undefined') {
          var updated_text = '';
          if (json.entry.updated_at != 'undefined') {
            if (json.entry.updated_at != null) {
              updated_text = self.parent.utils.dateToString(json.entry.updated_at);
            }
          }
          self.options.posterId = json.entry.poster_id;
          var author_string = (typeof(json.entry.poster_name) != 'undefined') ? '<span style="color:#C0C0C0">By</span> ' + json.entry.poster_name + '' : '';
          var avatar_src = (json.entry.poster_id == null) ? 'images/anon_icon.png' : BASE_URL + '/people/' + json.entry.poster_id + '/@avatar/small_thumbnail';
          $('post_avatar').update('<img src="' + avatar_src + '" width="50" height="50" border="0" />');
          $('post_author_text').update(author_string);
          $('post_updated_text').update(updated_text);
          var k = '<b>' + json.entry.title + '</b><br /><br />' + self._parseBody(json.entry.body);
          $('post_content').update(k);
          // Show delete, if I'm the poster
          if (self.options.posterId == self.parent.userId) {
            $('post_delete_container_' + self.options.postId).show();
          }
        }
        else {
          $('post_placeholder').update('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
        }
      }
    });
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('postpane_' + this.options.postId);
      this._getNextAndPrevius();
    }
    else {
      alert('ossi.post._draw() failed! this.options.hostElement not defined!');
    }
  },
  
  _getNextAndPrevius: function(){
    var self = this;
    // Get next and previous message ids
    // XXX: Ugly
    var params = {
      event_id: 'Ossi::BrowseChannelList'
    };
    new Ajax.Request(BASE_URL + '/channels/' + self.options.channelId + '/@messages/', {
      method: 'get',
      parameters: params,
      onSuccess: function(response){
        var json = response.responseJSON;
        // iterete until the message is found
        var messageIndex = 0;
        json.entry.each(function(message, index){
          if (message.id == self.options.postId) {
            messageIndex = index;
          }
        });
        // get the next and previous messages
        var id = self.options.postId;
        if (messageIndex > 0) {
          self.options.next = json.entry[messageIndex - 1].id;
          $('post_next_button_container_' + id).show();
        }
        if (messageIndex <= json.entry.length - 2) {
          self.options.previous = json.entry[messageIndex + 1].id;
          $('post_previous_button_container_' + id).show();
        }
        else {
          $('post_next_button_container_' + id).setStyle({
            'width': '100% '
          });
        }
        if (messageIndex == 0) {
          $('post_previous_button_container_' + id).setStyle({
            'width': '100% '
          });
        }
        // if there is only one message, hide the next/previous
        if (json.entry.length == 1) {
          $('post_nav_bar').hide();
        }
      }
    });
  },
  
  _getHTML: function(){
    var id = this.options.postId;
    var h = '\
          			<div id="postpane_' + id + '" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <div class="post_header">\
                    <div id="post_avatar" style="position:absolute; width:50px; height:50px; top:0px; left:0px; border:solid #eee 1px;"></div>\
                    <div style="margin:0px 0px 0px 58px;">\
      						    <div id="post_author_text" class="button_title_text"></div>\
      						    <div id="post_updated_text" class="button_subtitle_text"></div>\
      						  </div>\
                  </div>\
                  <div id="post_content"></div>\
          				<div class="nav_button">\
          					<a id="post_reply_button_' +
    id +
    '" class="nav_button_text" href="javascript:void(null);">Reply</a>\
          				</div>\
          				<div id="post_profile_button_container" class="nav_button" style="">\
          					<a id="post_profile_button_' +
    id +
    '" class="nav_button_text" href="javascript:void(null);">See profile</a>\
          				</div>\
                  <div id="post_nav_bar" class="nav_button" style="top: -1px; position: relative;">\
    		  	      <div id="post_next_button_container_' +
    id +
    '" class="nav_button next_button" style="display:none">\
        				    <a id="post_next_button_' +
    id +
    '" class="nav_button_text" href="javascript:void(null);">Newer post</a>\
          		  	</div>\
          		  	<div id="post_previous_button_container_' +
    id +
    '" class="nav_button previous_button" style="display:none">\
        				     <a id="post_previous_button_' +
    id +
    '" class="nav_button_text" href="javascript:void(null);">Older post</a>\
          		  	</div>\
				          </div>\
                    <div id="post_delete_container_' +
    id +
    '"  class="nav_button" style="display: none">\
          					<a id="post_delete_button_' +
    id +
    '" class="nav_button_text" href="javascript:void(null);">Delete Post</a>\
          				</div>\
                  <div class="nav_button">\
          					<a id="post_back_button_' +
    id +
    '" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  
  _parseBody: function(value){
    var search = new Array( /&lt;br \/&gt;/g,
                            /\[quote\]/g,
                            /\[\/quote\]/g,
                            /(ftp|http|https|file):\/\/[\S]+(\b|$)/gim
    );
    var replace = new Array(  '<br />',
                              '<span class="quoted_block">',
                              '</span>',
                              '<a href="javascript:ossi.open_link(\'$&\');" class="embedded_link">$&</a>'
    );
    for (i = 0; i < search.length; i++) {
      var value = value.replace(search[i], replace[i]);
    }
    return value;
  },
  
  _openProfileHandler: function(){
    var self = this;
    var poster_id = self.options.posterId;
    this.parent.case13({
      userId: poster_id
    });
  },
  
  _backHandler: function(){
    this.options.backCase.apply();
  },
  
  _nextHandler: function(){
    var self = this;
    self.parent.stack.pop();
    var channel_id = self.options.channelId;
    var post_id = self.options.next;
    self.parent.case22({
      channelId: channel_id,
      postId: post_id
    })
  },
  _previousHandler: function(){
    var self = this;
    self.parent.stack.push(self.parent.case22.bind(self.parent, self.options));
    var channel_id = self.options.channelId;
    var post_id = self.options.previous;
    self.parent.case22({
      channelId: channel_id,
      postId: post_id,
      out: true
    })
  },
  _replyHandler: function(){
    var self = this;
    self.parent.case21({
      replyToId: self.options.postId,
      channelId: self.options.channelId
    });
  },
  
  _deleteHandler: function(){
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var conf = confirm('Really want to delete this message?');
    if (conf) {
      var URL = BASE_URL + '/channels/' + self.options.channelId + '/@messages/' + self.options.postId;
      var params = {
        event_id: 'Ossi::MessageDelete'
      };
      self.parent.showLoading();
      new Ajax.Request(URL, {
        method: 'delete',
        parameters: params,
        onSuccess: function(response){
          self.parent.hideLoading();
          var json = response.responseJSON;
          self.options.backCase.apply();
          setTimeout(function(){
            self.parent.hideLoading();
          }, 600);
        }
      });
    }
  },
  
  _addListeners: function(){
    var id = this.options.postId;
    $('post_reply_button_' + id).onclick = this._replyHandler.bindAsEventListener(this);
    $('post_profile_button_' + id).onclick = this._openProfileHandler.bindAsEventListener(this);
    $('post_back_button_' + id).onclick = this._backHandler.bindAsEventListener(this);
    $('post_next_button_' + id).onclick = this._nextHandler.bindAsEventListener(this);
    $('post_previous_button_' + id).onclick = this._previousHandler.bindAsEventListener(this);
    $('post_delete_button_' + id).onclick = this._deleteHandler.bindAsEventListener(this);
  },
  
  _removeListeners: function(){
    var id = this.options.postId;
    $('post_reply_button_' + id).onclick = function(){
      return
    }
    $('post_back_button_' + id).onclick = function(){
      return
    }
    $('post_profile_button_' + id).onclick = function(){
      return
    }
    $('post_next_button_' + id).onclick = function(){
      return
    }
    $('post_previous_button_' + id).onclick = function(){
      return
    }
    $('post_delete_button_' + id).onclick = function(){
      return
    }
  },
  destroy: function(){
    this._removeListeners();
    this.pane.remove();
  }
});
