/**
* ossi search class
*/
ossi.search = Class.create(ossi.base,{
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
      this.pane = $('searchpane');
      setTimeout(function() { $('search_form').focusFirstElement() },1000); // .delay() did not seem to work on Firefox
    } else {
      alert('ossi.findusers._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="searchpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form id="search_form">\
            				<div style="height:33px; text-align:center; padding-top:20px;">\
            					You can search from persons, Sizzle and groups below.\
            				</div>\
            				<div class="login">\
            					<input class="textinput" maxlength="30" name="search_string" id="search_string" type="text"/>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="search_search_button" class="nav_button_text" href="javascript:void(null);">Search</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="search_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
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
    this.parent.case32({
      search : $F('search_string')
    });
    return false;
  },
  _addListeners: function() {
    $('search_form').onsubmit = this._searchHandler.bindAsEventListener(this);
    $('search_search_button').onclick = this._searchHandler.bindAsEventListener(this);
    $('search_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('search_form').onsubmit = function() { return }
    $('search_search_button').onclick = function() { return };
    $('search_back_button').onclick = function() { return };
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});