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
                    <div style="margin: 18px auto 12px; text-align: left; width: 170px;">\
                      <dl>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Channel name:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input class="textinput" maxlength="30" name="channel_name" id="channel_name" type="text"/></dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Channel description:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input class="textinput" maxlength="60" name="channel_description" id="channel_description" type="text"/></dd>\
                      </dl>\
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
      priv : false
	  },options);
    var self = this;
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    if (typeof(this.parent.channelsId) == 'undefined') return; // userId in the parent controller not set
    var userName = (typeof(self.parent.userName) != 'undefined') ? self.parent.userName : 'N/A'; 
    var params = options.priv ? { 
      'channel[channel_type]' : 'friend',
      'channel[name]' : $F('channel_name'), 
      'channel[description]' : $F('channel_description')
    } : { 
      'channel[channel_type]' : 'public', 
      'channel[name]' : $F('channel_name'), 
      'channel[description]' : $F('channel_description')
    };
    var URL = BASE_URL+'/channels';
    self.parent.showLoading();
    new Ajax.Request(URL,{
      method : 'post',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      parameters : params,
      onSuccess : function(response) { // now post the new channel's collection ID and title to channel list collection
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
        var json = response.responseJSON;
        var message = '';
        json.messages.each(function(m) {
          message += '<p>' + m + '</p>';
        });
        self.parent.hideLoading();
        self.parent.case6({
          message : message,
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
    $('create_channel_create_public_button').onclick = this._createHandler.bindAsEventListener(this,{'priv':false});
    $('create_channel_create_private_button').onclick = this._createHandler.bindAsEventListener(this,{'priv':true});
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