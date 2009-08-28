/**
* ossi findusers class
*/
ossi.findusers = Class.create(ossi.base,{
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
      this.pane = $('finduserspane');
      setTimeout(function() { $('friend_form').focusFirstElement() },1000); // .delay() did not seem to work on Firefox
    } else {
      alert('ossi.findusers._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="finduserspane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form id="friend_form">\
            				<div style="height:33px; text-align:center; padding-top:20px;">\
            					You can search by person\'s name, or part of, below.\
            				</div>\
            				<div class="login">\
            					<input class="textinput" maxlength="30" name="search_string" id="search_string" type="text"/>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="find_users_search_button" class="nav_button_text" href="javascript:void(null);">Search</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="find_users_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _searchHandler: function(e) {
    Event.stop(e);
    this.parent.case12({
      search : $F('search_string')
    });
    return false;
  },
  _addListeners: function() {
    $('friend_form').onsubmit = this._searchHandler.bindAsEventListener(this);
    $('find_users_search_button').onclick = this._searchHandler.bindAsEventListener(this);
    $('find_users_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('friend_form').onsubmit = function() { return }
    $('find_users_search_button').onclick = function() { return };
    $('find_users_back_button').onclick = function() { return };
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});