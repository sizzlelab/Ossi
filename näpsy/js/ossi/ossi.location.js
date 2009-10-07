/**
* ossi location class
*/
ossi.location = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
	  },options);
    this.running = false;
    if (Object.isUndefined(this.parent.serviceObj)) {
      try {
        this.parent.serviceObj = device.getServiceObject("Service.Location", "ILocation");
        this.unavailable = false;
      } catch (ex) {
        this.unavailable = true;
//        alert("Service object cannot be found.");
      }
    }
    this.criteria = {
      LocationInformationClass : "BasicLocationInformation"
    }
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
      evalJSON : 'force',
      onSuccess : function(response) { // now post the new channel's collection ID and title to channel list collection
        var json = response.responseJSON;
        json.geojson.features.each(function(feature) {
          if (feature.properties.name != null && feature.properties.name.length > 0) {
            self.parent.location.label = feature.properties.name;
            throw $break;
          }
        });

        // send location to ASI
        var URL = BASE_URL + '/people/@me/@location';
        var params =  {};
        if (! Object.isUndefined(self.parent.location.label)) {
          params = {
            'location[latitude]' : self.parent.location.latitude,
            'location[longitude]' : self.parent.location.longitude,
            'location[label]' : self.parent.location.label
          };
        } else {
          params = {
            'location[latitude]' : self.parent.location.latitude,
            'location[longitude]' : self.parent.location.longitude
          };
        }
        new Ajax.Request(URL, {
          method : 'put',
          parameters : params
        });
      }
    });
  },
  run: function(interval) {
    if (this.running) return; // do not start more than one "thread"
    var interval = Object.isUndefined(interval) ? 60 : interval;
    var self = this;
    self.running = true;
//    self.update();
    new PeriodicalExecuter(function(pe) {
      if (! self.running) { 
        pe.stop();
        return;
      } else {
        self.update();
      }
    }, interval);
  },
  stop: function() {
    this.running = false;
  },
  destroy: function () {
  }
});