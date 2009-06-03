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
    var URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'+self.options.postId; // ossi app Id hard-coded
    self.parent.showLoading();
    new Ajax.Request(URL,{
      method : 'get',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        self.parent.hideLoading();
        var json = response.responseJSON;
        if (typeof(json.entry) != 'undefined') {
          var updated_text = '';
          if (json.updated_at != 'undefined') {
            if (json.updated_at != null) {
              // timestamp to epoch
              var d = json.updated_at;
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
          var author_string = (typeof(json.metadata.author) != 'undefined') ? '<span style="color:#C0C0C0">Posted by</span> '+json.metadata.author+'' : '';

          var avatar_src = (json.owner == null) ? 'images/icons/standard/001_54.png' : BASE_URL+'/people/'+json.updated_by+'/@avatar/small_thumbnail';
          $('post_avatar').update('<img src="'+avatar_src+'" width="50" height="50" border="0" />');
          $('post_author_text').update(author_string);
          $('post_updated_text').update('Updated '+updated_text);
          $('post_content').update(self._parseBBCode(json.metadata.body));
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
          					<a id="post_back_button" class="nav_button_text" href="javascript:void(null);">Back to channel</a>\
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
  _openPostHandler: function(event,button_id) {
    var self = this;
    var post_id = button_id.replace("post_id_","");
    var post_id = self.options.postId;
    self.parent.case20({
      postId : post_id,
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
