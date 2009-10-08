/**
 * ossi mainmenu class
 */
ossi.mainmenu = Class.create(ossi.base, {
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
  /**
   * _update
   *
   * does not handle XHR failure yet!
   */
  update: function() {
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/@me/@self';
//    self.parent.showLoading();
    var params = { 'event_id' : 'Naepsy::MainMenu' };
    new Ajax.Request(URL, {
      method: 'get',
      parameters: params,
      onSuccess: function(response){
        var json = response.responseJSON;
        json = json.entry;
        var name = (json.name != null) ? json.name['unstructured'] : json.username; // if name has not been set
        $('text_container').update('logged in as <i>'+name+'</i>');
      }
    });
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('mainmenupane');
    }
    else {
      alert('ossi.mainmenu._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
    var h = '\
          			<div id="mainmenupane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="text_container" style="text-align:center">\
        				  </div>\
          				<div class="nav_button">\
          					<a id="shoot_button" class="nav_button_text" href="javascript:void(null);">Launch camera</a>\
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
  _startCamera: function(){
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
