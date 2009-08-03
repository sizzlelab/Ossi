/**
* ossi status class
*/
ossi.status = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false
	  },options);
	  this.pane = false;
    this._draw();
	},
	/**
	* _update
	*
	* does not handle XHR failure yet!
	*/
	update: function() {
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@self';
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        var json = response.responseJSON;
        if (typeof(json.status) != 'undefined') {
          if (json.status.message != 'undefined') {
            if (json.status.message != null) {
              $('status_textarea').value = json.status.message;
              
              // a bit convoluted, but works for the time being
              setTimeout(function() { $('status_form').focusFirstElement() },500); // .delay() did not seem to work on Firefox
            }
          }
        }
        setTimeout(function() {
          self.parent.hideLoading();
          if (!Object.isUndefined(self.parent.locator)) {
            self.parent.locator.update();
          }
        }, 600);
      }
    });
	},
	_putStatus: function(e) {
    var self = this;
    var s = $F('status_textarea');
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@self';
    var params =  { 'person[status_message]' : s
                  };
    self.parent.loadingpane.show();
    new Ajax.Request(URL, {
      method : 'put',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        setTimeout(function() {
          self.parent.hideLoading();
          self.options.backCase.apply();
        }, 600);
      },
      onFailure : function() {
        alert('XHR to set status message failed!');
        self.parent.hideLoading();
      }
    });
    Event.stop(e);
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('statuspane');
    } else {
      alert('ossi.status._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          		 	<div id="statuspane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form id="status_form">\
                    <div align="center" style="margin-top:10px;">What\'s going on?</div>\
            				<div align="center" style="margin-top:10px;">\
            					<input type="text" id="status_textarea" name="status" />\
            				</div>\
            				<div class="nav_button">\
            					<a id="done_button" class="nav_button_text" href="javascript:void(null);">Done</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="cancel_button" class="nav_button_text" href="javascript:void(null);">Cancel</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _focusHandler: function() {
    $('status_textarea').select();
    $('status_textarea').setStyle({color: '#000'})
    $('status_textarea').stopObserving('focus', this._focusHandler); // clears handler to fix issue with N95 calling focus again when blur is supposed to be called
  },
  _cancelHandler: function() {
    this.options.backCase.apply();
  },
  _addListeners: function() {
    $('done_button').onclick = this._putStatus.bindAsEventListener(this);
    $('cancel_button').onclick = this._cancelHandler.bindAsEventListener(this);
    $('status_form').onsubmit = this._putStatus.bindAsEventListener(this);
    $('status_textarea').observe('focus', this._focusHandler); // removed when entered
  },
  _removeListeners: function() {
    $('done_button').onclick = function() { return }
    $('cancel_button').onclick = function() { return }
    $('status_form').onsubmit = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});