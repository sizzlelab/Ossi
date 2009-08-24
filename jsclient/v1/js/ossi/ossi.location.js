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
    var self = this;
	  if (this.unavailable) return false;
	  
    // Obtain the location information (synchronous, so will block device momentarily)
    var result = this.parent.serviceObj.ILocation.GetLocation(this.criteria);

    // save location to main class
    this.parent.location = {
      latitude : result.ReturnValue.Latitude,
      longitude : result.ReturnValue.Longitude,
      datetime : new Date().toUTCString()
    };
    
    // get OpenStreetMap semantic location from OpenNetMap server
    var ONM_API_URL = 'http://fi.opennetmap.org/api/';
    var params = {
      'operation' : 'get_osm',
      'lat' : this.parent.location.latitude,
      'lon' : this.parent.location.longitude
    }
      
    new Ajax.Request(ONM_API_URL, {
      method : 'get',
      parameters : params,
      onSuccess : function(response) { // now post the new channel's collection ID and title to channel list collection
        alert(response);

        // send location to ASI
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
      }
    });
  },
  destroy: function () {
  }
});