/**
* ossi location class
*/
ossi.location = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
	  },options);
    this.serviceObj = null;
    try {
      this.serviceObj = device.getServiceObject("Service.Location", "ILocation");
    } catch (ex) {
      alert("Service object cannot be found.");
    }
    this.criteria = new Object();
    this.criteria.LocationInformationClass = "BasicLocationInformation";
	},
	/**
	* update
	*
	* update device location
	*/
	update: function() {
    alert('running update');
    // Obtain the location information (synchronous)
    var result = this.serviceObj.ILocation.GetLocation(this.criteria);

    // save location to main class
    this.parent.location = {
      latitude : result.ReturnValue.Latitude,
      longitude : result.ReturnValue.Longitude,
      datetime : new Date().toUTCString()
    };

    // send location to server
    var self = this;
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@location';
    var params =  { 
      'location[latitude]' : self.parent.location.latitude,
      'location[longitude]' : self.parent.location.longitude
    };
    new Ajax.Request(URL, {
      method : 'put',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : ''
    });
  },
  destroy: function () {
  }
});




