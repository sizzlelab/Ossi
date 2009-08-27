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
                    <p>Ossi is a group-centered mobile social media service. You can use Ossi to connect with friends, keep in touch with groups and to stay tuned to what is sizzling around you. We have developed Ossi especially to be used on the three Aalto university campuses in Helsinki metropolitan area. It is a part of the OtaSizzle research project that develops new social media services and studies their adoption and use.</p>\
                    <p>Ossi has been developed to be used on the go. You can use it from your mobile phone either with a web browser or as an installed application (WRT widget). Furthermore, you can use Ossi from a desktop with a web browser or, if you are a Mac user, as a dashboard widget.</p>\
                    <p>Currently, the service is in beta phase. We develop Ossi continuously. You are welcome to shape the future of Ossi by sharing your ideas and giving feedback. Moreover, please report all problems to <a href="mailto:otasizzle-helpdesk@hiit.fi">otasizzle-helpdesk@hiit.fi</a>. For more information and downloads, visit <a href="http://sizl.org">sizl.org</a>.</p>
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