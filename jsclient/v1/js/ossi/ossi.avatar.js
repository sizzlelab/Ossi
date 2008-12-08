/**
* ossi avatar class
*/
ossi.avatar = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false,
      backCase : function() { return false; }
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
      requestHeaders : (client.is_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
      }
    });
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('avatarpane');
    } else {
      alert('ossi.avatar._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="avatarpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form target="avatar_frame" action="/cos/people/'+this.parent.userId+'/@avatar" method="post" enctype="multipart/form-data" name="avatar_form" id="avatar_form">\
                    <input name="_method" type="hidden" class="upload_pic" value="PUT" />\
            				<div id="about_Ossi" style="text-align:center; margin:12px 10px 12px 10px">\
                      <p>Please note that avatar upload does not work in iPhone. On N95 it will open a new window, which you can then close after upload to return to Ossi.</p>\
                    </div>\
                    <div id="upload_container" style="position:relative; margin:12px auto 12px auto; width:200px;">\
                      <div style="position: relative; text-align: center; top: 0px; z-index: 2;">\
                        <input name="file" type="file" id="avatar_file" />\
                      </div>\
                    </div>\
            				<div class="nav_button">\
            					<a id="upload_button" class="nav_button_text" href="javascript:void(null);">Upload</a>\
            				</div>\
            				<div class="nav_button">\
            				  <a id="back_button" class="nav_button_text" href="javascript:void(null);">Cancel</a>\
            				</div>\
            				<iframe id="avatar_frame" name="avatar_frame" style="display:none"></iframe>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _uploadHandler: function() {
    this.parent.showLoading();
    $('avatar_form').submit();
  },
  _addListeners: function() {
    $('upload_button').onclick = this._uploadHandler.bindAsEventListener(this);
    $('back_button').onclick = this._backHandler.bindAsEventListener(this);

    // put listener in global namespace for iframe upload
    handleResponse = function() {
      this.parent.hideLoading();
      this.parent.case6({
        message : "Avatar uploaded!",
        buttonText : "Back to profile view",
        backCase: this.parent.case8.bind(this.parent,{
          out:true,
          backCase:this.parent.case3.bind(this.parent,{out:true})
        })
      });
    }.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('upload_button').onclick = function() { return };
    $('back_button').onclick = function() { return };
    delete handleResponse; // remove listener from global namespace
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});