/**
 * ossi changepassword class
 */
ossi.changepassword = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false
    }, options);
    this.pane = false;
    this._draw();
  },
  /**
   * _update
   *
   * does not handle XHR failure yet!
   */
  update: function(){
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    // self.parent.showLoading();
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('changepasswordpane');
    }
    else {
      alert('ossi.myprofile._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
    var h = '\
          			<div id="changepasswordpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form>\
                        <div id="password_container">\
                          <dt style="color:#666; margin:0px 0px 5px 0px;">Password:</dt>\
                            <dd style=" margin:0px 0px 10px 15px;"><input id="profile_password" class="myprofile_input" maxlength="30" name="profile_password" type="password"/></dd>\
                          <dt style="color:#666; margin:0px 0px 5px 0px;">Confirm password:</dt>\
                            <dd style=" margin:0px 0px 10px 15px;"><input id="profile_password_confirm" class="myprofile_input" maxlength="30" name="profile_password_confirm" type="password"/></dd>\
                        </div>\
                      </dl>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="password_save_button" class="nav_button_text" href="javascript:void(null);">Change password</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="password_cancel_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _saveHandler: function(){
    var self = this;
    var p = $F('profile_password');
    var pc = $F('profile_password_confirm');
    var dob = false;
    if (p != pc) {
      self.parent.case6({
        message: "Passwords do not match!",
        buttonText: "Back"
      });
      return;
    }
    var params = {
      'person[password]': p,
      'event_id': 'Ossi::ChangePassword'
    };
    var URL = BASE_URL + '/people/' + this.parent.userId + '/@self';
    self.parent.loadingpane.show();
    new Ajax.Request(URL, {
      method: 'put',
      requestHeaders: (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      parameters: params,
      onSuccess: function(){
        self.parent.loadingpane.hide();
        self.options.backCase.apply();
      },
      onFailure: function(response){
        /*        var reasons = eval(response.responseText);
         var reason_string = '';
         for (var i=0; i<reasons.length; i++) {
         reason_string += reasons[i];
         if (i != (reasons.length-1)) reason_string += ', ';
         }
         */
        self.parent.loadingpane.hide();
        self.parent.case6({
          message: "Error!",
          buttonText: "Back"
        });
      }
    });
  },
  _cancelHandler: function(){
    this.options.backCase.apply();
  },
  _addListeners: function(){
    $('password_save_button').onclick = this._saveHandler.bindAsEventListener(this);
    $('password_cancel_button').onclick = this._cancelHandler.bindAsEventListener(this);
  },
  _removeListeners: function(){
    $('password_save_button').onclick = function(){
      return
    }
    $('password_cancel_button').onclick = function(){
      return
    }
  },
  destroy: function(){
    this._removeListeners();
    this.pane.remove();
  }
});
