/**
* ossi map class
*/
ossi.map = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      items : false,
      hostElement: false
	  },options);
	  this.pane = false;
    this._draw();
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('mappane');
    } else {
      alert('ossi.map._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    // build parameters for map
    var height = (client.dimensions.height-20 < 640) ? client.dimensions.height-20 : 640;
    var width = (client.dimensions.width-20 < 640) ? client.dimensions.width-20 : 640;
    var params = 'size='+width+'x'+height+'&maptype=roadmap';
    this.options.items.each(function(item) {
      var label = (item.label.length > 0) ? 'label:'+item.label+'|' : "";
      params += '&markers=color:blue|'+label+item.latitude+','+item.longitude;
    });
    params += '&mobile=true&sensor=false';
    var h =   '\
          			<div id="mappane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="mapdiv" style="text-align: center; margin:10px;">\
                    <img src="http://maps.google.com/maps/api/staticmap?'+params+'" border="0" />\
                  </div>\
          				<div class="nav_button">\
          					<a id="map_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _addListeners: function() {
    $('map_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('map_back_button').onclick = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});