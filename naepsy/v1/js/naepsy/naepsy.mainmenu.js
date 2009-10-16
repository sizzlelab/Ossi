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
          			<div id="mainmenupane" style="display:none; position:absolute; top:0px; left:0px; width:100%; height:100%; z-index:2">\
                  <div style="position:absolute; top:5px; right:5px; z-index:2"><span id="logged_in_as_container">logged in as <i>'+this.parent.userName+'</i></span></div>\
                  <div style="text-align:center; margin-top:55px;">\
            				<div><img src="images/logo.png" /></div>\
                  </div>\
                  <div style="text-align:center; margin-top:25px;">\
            				<div style="position:relative; width:280px; height:210px; margin-left:auto; margin-right:auto;">\
                      <div style="position:absolute; left:0px; top:0px; width:168px; height:168px; z-index:4;"><a href="#" id="shoot_button"><img src="images/button_camera.png" border="0" /></a></div>\
                      <div style="position:absolute; right:0px; bottom:0px; width:114px; height:115px; z-index:3;"><a href="#" id=""><img src="images/button_photos.png" border="0" /></a></div>\
            				</div>\
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
  handleImages: function(transactionId, errorCode, images) {
    alert("transactionId: "+transactionId);
    alert("errorCode: "+errorCode);
    alert("typeof(images): "+typeof(images));
    alert("images.length: "+images.length);
//    $('image_pane').show();
//    $('image_pane').update('<img src="'+images[0]+'" border="0" />');
//    for(var i=0;i<outPut.length;i++)
//      alert(outPut[i]); //Array containing paths of all pictures taken
  },
  _startCamera: function(){
    try {
       this.camera = com.nokia.device.load("", "com.nokia.device.camera", "");
       var id = this.camera.startCamera(this.handleImages.bind(this));
    } catch(e) {
       var error = e.toString();
       alert(error);
    }
  },
  _goToBackground: function() {
    widget.openApplication(0x102750F0);
  },
  _addListeners: function() {
//    $('minimize_button').onclick = this._goToBackground.bindAsEventListener(this);
    $('shoot_button').onclick = this._startCamera.bindAsEventListener(this);
  },
  _removeListeners: function(){
//    $('minimize_button').onclick = function() { return }
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
