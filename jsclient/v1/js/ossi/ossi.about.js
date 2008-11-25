/**
* ossi about class
*/
ossi.about = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false,
      backCase : function() { return false; }
	  },options);
	  this.pane = false;
    this._draw();
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('aboutpane');
    } else {
      alert('ossi.about._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="aboutpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="about_Ossi" style="margin:20px 10px 20px 10px">\
          				  <h2>About Ossi</h2>\
                    <p>Ossi is a browser-based social networking service enabling media rich communication between users on mobile and web platforms. Ossi is a part of the OtaSizzle research project that develops a mobile living lab in the Otaniemi campus. Students actively participate in the developing of both Ossi and of the OtaSizzle platform. OtaSizzle as well as Ossi are in beta phase i.e. under development. This might result in some technical problems every now and then. We count on your understanding and patience and are grateful for all feedback that you are willing to give us.</p>\
                    <p>Please report all problems to <a href="mailto:helpdesk-otasizzle@hiit.fi">helpdesk-otasizzle@hiit.fi</a>.</p>\
                  </div>\
          				<div class="nav_button">\
          					<a id="back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _addListeners: function() {
//    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
//    thus old skool

    $('back_button').onclick = this._backHandler.bindAsEventListener(this);

//    $('back_button').observe('click',this._backHandler.bindAsEventListener(this));
  },
  _removeListeners: function() {
//    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
//    thus old skool

    $('back_button').onclick = function() { return }
  
//    $('back_button').stopObserving('click',this._backHandler.bindAsEventListener(this));
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});