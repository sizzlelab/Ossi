/**
* ossi post class
*/
ossi.post = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false,
      channelId : false,
      postId : false
	  },options);
	  this.pane = false;
    this._draw();
	},
	/**
	* _update
	*
	* does not handle XHR failure yet!
	*/
	update: function(options) {
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    // get contents
    var URL = BASE_URL+'/channels/'+self.options.channelId+'/@messages/'+self.options.postId; // ossi app Id hard-coded
    self.parent.showLoading();
    new Ajax.Request(URL,{
      method : 'get',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        self.parent.hideLoading();
        var json = response.responseJSON;
        if (typeof(json.entry) != 'undefined') {
          var updated_text = '';
          if (json.entry.updated_at != 'undefined') {
            if (json.entry.updated_at != null) {
      			  updated_text = self.parent.utils.dateToString(json.entry.updated_at);
            }
          }
          var author_string = (typeof(json.entry.poster_name) != 'undefined') ? '<span style="color:#C0C0C0">By</span> '+json.entry.poster_name+'' : '';
          var avatar_src = (json.entry.poster_id == null) ? 'images/anon_icon.png' : BASE_URL+'/people/'+json.entry.poster_id+'/@avatar/small_thumbnail';
          $('post_avatar').update('<img src="'+avatar_src+'" width="50" height="50" border="0" />');
          $('post_author_text').update(author_string);
          $('post_updated_text').update(updated_text);
          $('post_content').update(self._parseBBCode(json.entry.body));
          if (typeof(json.metadata.author) != 'undefined' && json.owner != null) {
            $('post_profile_button').update(json.metadata.author+'\'s profile');
            $('post_profile_button_container').show();
          }
          self.userId = json.updated_by; // save user id into instance
        } else {
          $('post_placeholder').update('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
        }
      }
    });
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('postpane');
    } else {
      alert('ossi.post._draw() failed! this.options.hostElement not defined!');
    }
  },

  _getModeratorHTML: function(){
    var m = '';
    //moderator privileges
    if(this.parent.userRole == 'moderator'){
        m = '<div class="nav_button">\
                <a id="post_allow_delete_button" class="nav_button_text" href="javascript:void(null);">Delete this post</a>\
        </div>\
        <div class="nav_button" id="post_delete_post" style="visibility: hidden;">\
                <a id="post_delete_button" class="nav_button_text" href="javascript:void(null);">Delete for good.</a>\
        </div>\
        ';
    }
    return m;
  },

  _getHTML: function() {
    var h =   '\
          			<div id="postpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <div class="post_header">\
                    <div id="post_avatar" style="position:absolute; width:50px; height:50px; top:0px; left:0px; border:solid #eee 1px;"></div>\
                    <div style="margin:0px 0px 0px 58px;">\
      						    <div id="post_author_text" class="button_title_text"></div>\
      						    <div id="post_updated_text" class="button_subtitle_text"></div>\
      						  </div>\
                  </div>\
                  <div id="post_content"></div>\
          				<div class="nav_button">\
          					<a id="post_reply_button" class="nav_button_text" href="javascript:void(null);">Reply</a>\
          				</div>\
          				<div id="post_profile_button_container" class="nav_button" style="display:none">\
          					<a id="post_profile_button" class="nav_button_text" href="javascript:void(null);">See profile</a>\
          				</div>\
                ';
    h += this._getModeratorHTML();
    h += '    		<div class="nav_button">\
          					<a id="post_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _parseBBCode: function(value) {
    var search = new Array(
                  /\n/g,
                  /\[quote\]/g,
                  /\[\/quote\]/g);

    var replace = new Array(
                  "<br />",
                  '<span class="quoted_block">',
                  '</span>');
    for (i = 0; i < search.length; i++) {
      var value = value.replace(search[i],replace[i]);
    }
    return value;
  },
  _openProfileHandler: function() {
    var self = this;
    this.parent.case13({
      userId : this.userId,
      backCase : self.parent.case22.bind(self.parent,{
        out : true,
        channelId : self.options.channelId,
		startIndex : self.options.startIndex,
        postId : self.options.postId,
        backCase : self.parent.case20.bind(self.parent,{
          out : true,
          channelId : self.options.channelId,
		  startIndex : self.options.startIndex,
          postId : self.options.postId,
          backCase : self.parent.case18.bind(self.parent,{
            out : true,
            backCase : self.parent.case3.bind(self.parent,{out:true}) 
          })
        })
      })
    });
  },
  _openPostHandler: function(event,button_id) {
    var self = this;
    var post_id = button_id.replace("post_id_","");
    var post_id = self.options.postId;
    self.parent.case20({
      postId : post_id,
      backCase : self.parent.case18.bind(self.parent,{
        out : true,
        postId : post_id,
        backCase : self.parent.case3.bind(self.parent,{out:true}) 
      })
    });
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
  _replyHandler: function() {
    var self = this;
    self.parent.case21({
      replyToId : self.options.postId,
      channelId : self.options.channelId,
      backCase : self.parent.case22.bind(self.parent,{
        out : true,
        channelId : self.options.channelId,
        postId : self.options.postId,
        backCase : self.parent.case20.bind(self.parent,{
          out : true,
          channelId : self.options.channelId,
          postId : self.options.postId,
          backCase : self.parent.case18.bind(self.parent,{
            out : true,
            backCase : self.parent.case3.bind(self.parent,{out:true}) 
          })
        })
      })
    });
  },


  _deleteHandler: function() {
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    // get contents
    var URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'+self.options.postId; // ossi app Id hard-coded
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
    });

  },
  _allowDeleteHandler: function() {
    if(!this.allowDelete) {
      this.allowDelete = true;
      $('post_allow_delete_button').update('Cancel delete');
      $('post_delete_post').setStyle('visibility: visible');
    } else {
      this.allowDelete = false;
      $('post_allow_delete_button').update('Delete this post');
      $('post_delete_post').setStyle('visibility: hidden');
    }

  },


  _addListeners: function() {
    $('post_reply_button').onclick = this._replyHandler.bindAsEventListener(this);
    $('post_profile_button').onclick = this._openProfileHandler.bindAsEventListener(this);
    $('post_back_button').onclick = this._backHandler.bindAsEventListener(this);

    if(this.parent.userRole == 'moderator'){
      $('post_delete_button').onclick = this._deleteHandler.bindAsEventListener(this);
      $('post_allow_delete_button').onclick = this._allowDeleteHandler.bindAsEventListener(this);
    }
  },
  _removeListeners: function() {
    $('post_reply_button').onclick = function() { return }
    $('post_profile_button').onclick = function() { return }
    $('post_back_button').onclick = function() { return }

    if(this.parent.userRole == 'moderator'){
      $('post_delete_button').onclick = function() { return }
      $('post_allow_delete_button').onclick = function() { return }
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
