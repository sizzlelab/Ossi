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
      LocationInformationClass : "BasicLocationInformation",
      UpdateOptions : {
        PartialUpdates : false
      }
    }
	},
	/**
	* update
	*
	* update device location
	*/
	update: function(callback) {

    var self = this;
	  if (this.unavailable) return false;
	  
    // Obtain the location information (synchronous, so will block device momentarily)
//    this.parent.serviceObj.ILocation.GetLocation(this.criteria,this._updateReady);
//  },
//  _updateReady: function(transId, eventCode, result) {
    var result = this.parent.serviceObj.ILocation.GetLocation(this.criteria);
    if (result.ErrorCode == 0) {
      alert('hello');
      console.info("latitude: %s, longitude: %s", result.ReturnValue.Latitude, result.ReturnValue.Longitude);
      // save location to main class
      this.parent.location = {
        latitude : result.ReturnValue.Latitude,
        longitude : result.ReturnValue.Longitude,
        datetime : new Date().toUTCString()
      };          

      alert('3');
      // get OpenStreetMap semantic location from OpenNetMap server
      var ONM_API_URL = 'http://fi.opennetmap.org/api/';
      var params = {
        'operation' : 'get_osm',
        'lat' : this.parent.location.latitude,
        'lon' : this.parent.location.longitude
      }
  
      alert('4');
      var self = this;
      new Ajax.Request(ONM_API_URL, {
        method : 'get',
        parameters : params,
        evalJSON : 'force',
        onSuccess : function(response) {
          alert('5');
          var json = response.responseJSON;
          json.geojson.features.each(function(feature) {
            if (feature.properties.name != null && feature.properties.name.length > 0) {
              self.parent.location.label = feature.properties.name;
              if (! Object.isUndefined(callback)) {
                alert('6');
                callback.apply();
                alert('7');
              }
              throw $break;
            }
          });

          // send location to ASI
          var URL = BASE_URL + '/people/'+self.parent.userId+'/@location';
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

          alert('8');
          new Ajax.Request(URL, {
            method : 'put',
            parameters : params
          });
          self.parent.hideLoading();
        }
      });
    }
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