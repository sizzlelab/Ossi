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
          				  <h2>About Naepsy</h2>\
                    <p>Naepsy is an experimental photography application developed specifically for Nokia Web Runtime v1.1+. Naepsy has been developed within the OtaSizzle framework and to use the application you have you have OtaSizzle username and password.</p>\
                    <p>With Naepsy you can take photos using your mobile phone\'s camera and save them to the Aalto Social Interface with location tagging. Please note that photos are visible to all OtaSizzle users.</p>\
                    <p>Currently, the service is in beta phase and any feedback is welcome. Please report all problems, and send feedback to <a href="mailto:otasizzle-helpdesk@hiit.fi">otasizzle-helpdesk@hiit.fi</a>. For more information and downloads, visit <a href="http://sizl.org" target="_blank">sizl.org</a>.</p>\
                  </div>\
          				<div class="nav_button">\
          					<a id="about_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
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

    $('about_back_button').onclick = this._backHandler.bindAsEventListener(this);

//    $('back_button').observe('click',this._backHandler.bindAsEventListener(this));
  },
  _removeListeners: function() {
//    Element.observe does not work in Nokia Minimap browser when tabbed navigation is enabled,
//    thus old skool

    $('about_back_button').onclick = function() { return }
  
//    $('back_button').stopObserving('click',this._backHandler.bindAsEventListener(this));
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});