/**
* ossi mypost class
*/
ossi.mypost = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
		  channelId : false,
		  owner : false,
		  priv : false,
		  replyToId : false,
		  postId : false,
      hostElement : false
	  },options);
	  this.pane = false;
    this._draw();
	},
	update: function() {
    var self = this;
    // get the original post
    if (this.options.replyToId) {
      if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
      var URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'+self.options.replyToId; // ossi app Id hard-coded
      self.parent.showLoading();
      new Ajax.Request(URL,{
        method : 'get',
        requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
        onSuccess : function(response) {
          self.parent.hideLoading();
          var json = response.responseJSON;
          if (typeof(json.entry) != 'undefined') {
            $('post_message').value = "[quote]" + self._parseBBCode(json.metadata.body) + "[/quote]\n" + $('post_message').value;
            self.replyToUserName = json.updated_by_name; // save user id into instance
            setTimeout(function() { $('mypost_form').focusFirstElement() },500); // .delay() did not seem to work on Firefox
          }
        }
      });
    }
  },
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('mypostpane');
    } else {
      alert('ossi.mypost._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="mypostpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form name="mypost_form" id="mypost_form">\
            				<div style="height:33px; text-align:center; padding-top:20px;">\
            					Message:\
            				</div>\
            				<div class="login">\
            					<textarea class="textinput" style="height:90px; width:70%" name="post_message" id="post_message"/></textarea>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="save_post_button" class="nav_button_text" href="javascript:void(null);">Save post</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="mypost_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _parseBBCode: function(value) {
    var search = new Array(
                  /\<br \/\>/g);
    var replace = new Array(
                  "\n");
    for(i = 0; i < search.length; i++) {
      var value = value.replace(search[i],replace[i]);
    }
    return value;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _saveHandler: function() {
    var self = this;
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    if (typeof(this.parent.channelsId) == 'undefined') return; // channelsId not set in main controller
    if (typeof(this.options.channelId) == 'undefined') return; // channelId not set
    var message = $F('post_message').replace(/\n/g,'<br />');
    if (typeof(self.replyToUserName) != 'undefined') {
      message = '@'+self.replyToUserName+": "+message;
    }
    var params = {  tags : 'post',
                    owner : self.parent.userId, // now each post has an owner
                    'private' : self.options.priv,
                    'metadata[body]' : message,
                    'metadata[author]' : (typeof(self.parent.userName) != 'undefined') ? self.parent.userName : null
                 };
    self.parent.showLoading();
    var URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'; // ossi app id hard coded
    new Ajax.Request(URL,{
      method : 'post',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // now post the new channel's collection ID and title to channel list collection
        var post = response.responseJSON;
        params = {  content_type : 'collection',
                    collection_id : post.id 
                  };
        URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'+self.options.channelId; // put this post to the channel
        new Ajax.Request(URL,{
          method : 'post',
          parameters : params,
          requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
          onSuccess : function(response) {
            self.parent.hideLoading();
            self.parent.case6({
              message : "Post added.",
              buttonText : "Back",
              backCase:self.parent.case20.bind(self.parent,{
                channelId:self.options.channelId,
                out:true,
                backCase:self.parent.case18.bind(self.parent,{
                  out:true,
                  backCase:self.parent.case3.bind(self.parent,{out:true})
                })
              })
            });
          },
          onFailure : function(response) {
            self.parent.hideLoading();
            self.parent.case6({
              message : "Could not create post.",
              buttonText : "Try again",
              backCase : self.parent.case21.bind(self.parent,{
                postId:self.options.postId,
                channelId:self.options.channelId,
                out:true,
                backCase:self.parent.case20.bind(self.parent,{
                  channelId:self.options.channelId,
                  out:true,
                  backCase:self.parent.case18.bind(self.parent,{
                    out:true,
                    backCase:self.parent.case3.bind(self.parent,{out:true})
                  })
                })
              })
            });
          }
        });
      },
      onFailure : function(response) {
        self.parent.hideLoading();
        self.parent.case6({
          message : "Could not create post.",
          buttonText : "Try again",
          backCase : self.parent.case21.bind(self.parent,{
            postId:self.options.postId,
            channelId:self.options.channelId,
            out:true,
            backCase:self.parent.case20.bind(self.parent,{
              channelId:self.options.channelId,
              out:true,
              backCase:self.parent.case18.bind(self.parent,{
                out:true,
                backCase:self.parent.case3.bind(self.parent,{out:true})
              })
            })
          })
        });
      }
    });
  },
  _addListeners: function() {
    $('save_post_button').onclick = this._saveHandler.bindAsEventListener(this);
    $('mypost_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('save_post_button').onclick = function() { return };
    $('mypost_back_button').onclick = function() { return };
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});