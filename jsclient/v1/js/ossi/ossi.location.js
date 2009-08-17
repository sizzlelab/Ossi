/**
* ossi location class
*/
ossi.location = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
	  },options);
    if (Object.isUndefined(this.parent.serviceObj)) {
      try {
        this.parent.serviceObj = device.getServiceObject("Service.Location", "ILocation");
        this.unavailable = false;
      } catch (ex) {
        this.unavailable = true;
        alert("Service object cannot be found.");
      }
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
	  if (this.unavailable) return false;
	  
    // Obtain the location information (synchronous, so will block device momentarily)
    var result = this.parent.serviceObj.ILocation.GetLocation(this.criteria);

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




