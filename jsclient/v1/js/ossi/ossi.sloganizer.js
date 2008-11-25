/**
* ossi sloganizer class
*/
ossi.sloganizer = Class.create(ossi.base,{
	initialize: function(parent,options) {
		this.options = Object.extend({
      targetElement : false
	  },options);
    this._draw();
	},
  _draw: function() {
    if (this.options.targetElement) {
      this.options.targetElement.update(this._getSlogan())
    }
  },
  _getSlogan: function() {
		var slogans =   [ "Say it with Ossi.",
		                  "Share moments, share with Ossi.",
		                  "With a name like Ossi, it has to be good.",
		                  "Say it with Ossi."
		                ];
		return slogans[Math.floor(Math.random()*slogans.length)]
  },
  destroy: function () {
  }
});