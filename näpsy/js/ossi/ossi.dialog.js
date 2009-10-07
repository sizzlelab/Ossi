/**
* ossi dialog class
*/
ossi.dialog = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false,
      backCase : false,
      buttonText : false,
      message : false
	  },options);
	  this.pane = false;
    this._draw();
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      if (this.options.message) $('dialog_message').update(this.options.message);
      if (this.options.buttonText) $('ok_button').update(this.options.buttonText);
      this._addListeners();
      this.pane = $('dialogpane');
    } else {
      alert('ossi.dialog._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="dialogpane" style="display:none; position:absolute; top:0px; left:0px; width:100%; height:100%; background: black;">\
          				<div id="dialog_message" style="font-size:12px; text-align:left; margin:30px 10px 10px 10px;">\
          					Error!<br/><br/>\
          				</div>\
          				<div class="nav_button">\
          					<a id="ok_button" class="nav_button_text" href="#">Ok</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _okHandler: function() {
    this.options.backCase.apply();
  },
  _addListeners: function() {
//    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
//    thus old skool

    $('ok_button').onclick = this._okHandler.bindAsEventListener(this);
    
//    $('ok_button').observe('click',this._okHandler.bindAsEventListener(this));
  },
  _removeListeners: function() {
//    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
//    thus old skool

    $('ok_button').onclick = function() { return }

//    $('ok_button').stopObserving('click',this._okHandler.bindAsEventListener(this));
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});