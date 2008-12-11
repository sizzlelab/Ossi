/**
* ossi createchannel class
*/
ossi.createchannel = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false
	  },options);
	  this.pane = false;
    this._draw();
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('createchannelpane');
    } else {
      alert('ossi.createchannel._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="createchannelpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form>\
            				<div style="height:33px; text-align:center; padding-top:20px;">\
            					Enter channel\'s name below:\
            				</div>\
            				<div class="login">\
            					<input class="textinput" maxlength="30" name="channel_title" id="channel_title" type="text"/>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="create_channel_create_public_button" class="nav_button_text" href="javascript:void(null);">Create Public Channel</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="create_channel_create_private_button" class="nav_button_text" href="javascript:void(null);">Create Friends Only Channel</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="create_channel_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _createHandler: function(event,options) {
		var options = Object.extend({
      private : false
	  },options);
    var self = this;
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    if (typeof(this.parent.channelsId) == 'undefined') return; // userId in the parent controller not set
    var userName = (typeof(self.parent.userName) != 'undefined') ? self.parent.userName : 'N/A'; 
    var params = options.private ? { 
                                      owner : this.parent.userId, 
                                      'private' : 'true', 
                                      title : $F('channel_title'), 
                                      tags : 'channel,private',
                                      'metadata[creator]' : userName 
                                    } : { 
                                      owner : this.parent.userId, 
                                      title : $F('channel_title'),
                                      tags : 'channel',
                                      'metadata[creator]' : userName 
                                    };
    var URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'; // ossi app id hard coded
    self.parent.showLoading();
    new Ajax.Request(URL,{
      method : 'post',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      parameters : params,
      onSuccess : function(response) { // now post the new channel's collection ID and title to channel list collection
        var channel = response.responseJSON;
        if (options.private) {
          params = {  owner : this.parent.userId,
                      content_type : 'collection',
                      collection_id : channel.id
                    };
        } else {
          params = {  content_type : 'collection',
                      collection_id : channel.id
                    };
        }
        URL = BASE_URL+'/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/'+self.parent.channelsId; // ossi app Id hard-coded
        new Ajax.Request(URL,{
          method : 'post',
          requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
          parameters : params,
          onSuccess : function(response) {
            self.parent.hideLoading();
            self.parent.case6({
              message : "Channel created!",
              buttonText : "Back",
              backCase:self.parent.case18.bind(self.parent,{
                out:true,
                backCase:self.parent.case3.bind(self.parent,{out:true})
              })
            });            
          },
          onFailure : function(response) {
            self.parent.hideLoading();
            self.parent.case6({
              message : "Error! Could not add channel to channel list!",
              buttonText : "Back",
              backCase : self.parent.case19.bind(self.parent,{
                out:true,
                backCase:self.parent.case18.bind(self.parent,{
                  out:true,
                  backCase:self.parent.case3.bind(self.parent,{out:true})
                })
              })
            });
          }
        });
      },
      onFailure : function(response) {
        self.parent.hideLoading();
        self.parent.case6({
          message : "Could not create channel.",
          buttonText : "Try again",
          backCase : self.parent.case19.bind(self.parent,{
            out:true,
            backCase:self.parent.case18.bind(self.parent,{
              out:true,
              backCase:self.parent.case3.bind(this.parent,{out:true})
            })
          })
        });
      }
    });







  },
  _addListeners: function() {
    $('create_channel_create_public_button').onclick = this._createHandler.bindAsEventListener(this,{'private':false});
    $('create_channel_create_private_button').onclick = this._createHandler.bindAsEventListener(this,{'private':true});
    $('create_channel_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('create_channel_create_public_button').onclick = function() { return };
    $('create_channel_create_private_button').onclick = function() { return };
    $('create_channel_back_button').onclick = function() { return };
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});