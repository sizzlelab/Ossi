/**
 * naepsy mainmenu class
 */
naepsy.mainmenu = Class.create(naepsy.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false,
      selfUpdate: true,
      backCase: function(){
        return false;
      }
    }, options);
    this.pane = false;
    this._draw();
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('mainmenupane');
    }
    else {
      alert('naepsy.mainmenu._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h = '\
          			<div id="mainmenupane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <div style="position:absolute; right:5px; top:5px;"><span id="logged_in_as_container">logged in as <i>'+this.parent.userName+'</i></span></div>\
          				<div style="text-align:center; margin:20px 10px 20px 10px;">\
                    <img src="images/naepsy_logo.png" width="50" height="50" />\
        				  </div>\
          				<div class="nav_button">\
          					<a id="shoot_button" class="nav_button_text" href="javascript:void(null);">Take a picture!</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="logout_button" class="nav_button_text" href="javascript:void(null);">Logout</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _logoutHandler: function(){
    var self = this;
    clearInterval(this.interval);
    this.parent.loadingpane.show();
    var params = { 'event_id' : 'Naepsy::MainMenu/LogOut' }; 
    new Ajax.Request(BASE_URL + '/session', {
      method: 'delete',
      parameters: params,
      onSuccess: function(){
        self.parent.sessionCookie = false;
        
        delete self.parent.userId; //deleted so that attribute could be indicator of valid session.
        delete self.parent.userName;
        delete self.parent.userRole;
        if (! Object.isUndefined(self.parent.locator)) self.parent.locator.stop();
        
        self.parent.loadingpane.hide();
        self.parent.case1({
          out: true
        });
      },
      onFailure: function(){
        self.parent.loadingpane.hide();
        self.parent.case6({
          message: "Could not log user out.",
          buttonText: "Try again"
        });
      }
    });
  },
  handleImages: function(transactionId, errorCode, outPut) {
    for(var i=0;i<outPut.length;i++)
      alert(outPut[i]); //Array containing paths of all pictures taken
  },
  _startCamera: function(){
    try {
       var camera = com.nokia.device.load("", "com.nokia.device.camera", "");
       var id = camera.startCamera(this.handleImages.bind(this));
       alert('Transaction Id = ' + id);
    } catch(e) {
       var error = e.toString();
       alert(error);
    }
  },
  _addListeners: function(){
    $('logout_button').onclick = this._logoutHandler.bindAsEventListener(this);
    $('shoot_button').onclick = this._startCamera.bindAsEventListener(this);
  },
  _removeListeners: function(){
    $('logout_button').onclick = function() { return }
    $('shoot_button').onclick = function() { return }
  },
  _resetInterval: function(){
    if (this.options.selfUpdate) {
      clearInterval(this.interval);
      this.interval = setInterval(this.update.bind(this), this.updateInterval);
    }
  },
  destroy: function(){
    clearInterval(this.interval);
    this._removeListeners();
    this.pane.remove();
  }
});
