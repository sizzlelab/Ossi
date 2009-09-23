/**
 * ossi mypost class
 */
ossi.mypost = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      channelId: false,
      owner: false,
      priv: false,
      replyToId: false,
      postId: false,
      hostElement: false
    }, options);
    this.pane = false;
    this._draw();
  },
  update: function(){
    var self = this;
    // get the original post
    if (this.options.replyToId) {
      if (typeof(this.parent.userId) == 'undefined') 
        return; // userId in the parent controller not set
      var URL = BASE_URL + '/channels/' + self.options.channelId + '/@messages/' + self.options.replyToId;
      self.parent.showLoading();
      new Ajax.Request(URL, {
        method: 'get',
        onSuccess: function(response){
          self.parent.hideLoading();
          var json = response.responseJSON;
          if (typeof(json.entry) != 'undefined') {
            $('post_message').value = "[quote]" + self._parseBBCode(json.entry.body) + "[/quote]\n" + $('post_message').value;
            self.replyToUserName = (json.entry.poster_name != null) ? json.entry.poster_name : 'Anonymous'; // save user id into instance
            setTimeout(function(){
              $('mypost_form').focusFirstElement()
            }, 500); // .delay() did not seem to work on Firefox
          }
        }
      });
    }
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('mypostpane');
      $('post_title').value = '';
      $('post_message').value = '';
      setTimeout(function(){
        $('mypost_form').focusFirstElement()
      }, 500); // .delay() did not seem to work on Firefox
    } else {
      alert('ossi.mypost._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
    var h = '\
          			<div id="mypostpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form name="mypost_form" action="' + BASE_URL + '/channels/' + this.options.channelId + '/@messages" id="mypost_form" method="post" target="testframe" enctype="multipart/form-data">\
                    <div style="margin: 18px auto 12px; text-align: left; width: 170px;">\
                      <dl>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Message title:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input class="textinput" maxlength="30" name="message[title]" id="post_title" type="text"/></dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Message body:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><textarea class="textinput" style="height:90px;" name="message[body]" id="post_message"/></textarea></dd>\
                        <!--dt style="color:#666; margin:0px 0px 5px 0px;">Attachment:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input type="file" name="message[attachment]" /></dd-->\
                      </dl>\
                      <input type="hidden" name="message[content_type]" id="content_type" value="" />\
                    </div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="save_post_button" class="nav_button_text" href="javascript:void(null);">Save post</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="mypost_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
                  <iframe name="testframe" style="display:none"></iframe>\
          			</div>\
          		';
    return h;
  },
  _parseBBCode: function(value){
    var search = new Array(/\<br \/\>/g);
    var replace = new Array("\n");
    for (i = 0; i < search.length; i++) {
      var value = value.replace(search[i], replace[i]);
    }
    return value;
  },
  _backHandler: function(){
    this.options.backCase.apply();
  },
  _saveHandler: function(){
    /*
     // for image upload testing
     $('content_type').value = 'image/jpeg';
     document.forms['mypost_form'].submit();
     return;
     */
    var self = this;
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    if (typeof(this.options.channelId) == 'undefined') return; // channelId not set
    var title = $('post_title').value;
    var message = $('post_message').value.replace(/\n/g, '<br />');
    if (typeof(self.replyToUserName) != 'undefined') {
      message = '@' + self.replyToUserName + ": " + message;
    }
    var params = {
      'message[body]': message,
      'message[title]': title,
      'event_id': 'Ossi::SendNewMessageToChannel'
    };
    if (this.options.replyToId) params.reference_to = this.options.replyToId;
    self.parent.showLoading();
    var URL = BASE_URL + '/channels/' + self.options.channelId + '/@messages'; // ossi app id hard coded
    new Ajax.Request(URL, {
      method: 'post',
      parameters: params,
      onSuccess: function(response) { // now post the new channel's collection ID and title to channel list collection
        self.parent.hideLoading();
        self.parent.case6({
          message: "Post added.",
          buttonText: "Back",
          skipPrevious: true
        });
      },
      onFailure: function(response){
        self.parent.hideLoading();
        self.parent.case6({
          message: "Could not create post.",
          buttonText: "Try again",
          skipPrevious: true
        });
      }
    });
  },
  _addListeners: function(){
    $('save_post_button').onclick = this._saveHandler.bindAsEventListener(this);
    $('mypost_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function(){
    $('save_post_button').onclick = function(){
      return
    };
    $('mypost_back_button').onclick = function(){
      return
    };
  },
  destroy: function(){
    this._removeListeners();
    this.pane.remove();
  }
});
