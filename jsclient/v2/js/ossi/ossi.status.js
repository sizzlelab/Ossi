/**
 * ossi status class
 */
ossi.status = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false
    }, options);
    this.pane = false;
    this.getOldLocation = true;
    this._draw();
    if (Object.isUndefined(this.parent.location)) this.parent.location = {};
    //    if (Object.isUndefined(this.parent.locator) || this.parent.settings_auto_updates == false) $('location_input_container').show();
    //    else $('location_input_container').hide();
    if (Object.isUndefined(this.parent.locator) || this.parent.settings_auto_updates == false) $('location_input').value = 'Finding out...';
  },
  /**
   * _update
   *
   * does not handle XHR failure yet!
   */
  update: function() {
    var self = this;
      alert('hello');
    if (geo_position_js.init()) {
      this.parent.showLocating();
      geo_position_js.getCurrentPosition(function(p) {
        var self = this;
        self.getOldLocation = false;
        var GOOGLE_REVERSE_GEOCODING_URL = '/maps.google.com/maps/api/geocode/json';
        var params = {
          sensor : 'true',
          latlng : p.coords.latitude+','+p.coords.longitude
        };
        new Ajax.Request(GOOGLE_REVERSE_GEOCODING_URL, {
          method : 'get',
          parameters : params,
          onSuccess : function(response) {
            var json = response.responseJSON;
            if (json.status == "OK") {
              json.results.each(function(result) {
                result.address_components.each(function(component) {
                  if (component.types.indexOf("route") != -1) {
                    $('location_input').value = component.long_name;
                    self.parent.location = {
                      latitude : p.coords.latitude,
                      longitude : p.coords.longitude,
                      latlonDatetime : new Date().toUTCString()
                    };
                    throw $break;
                  }
                });
                throw $break;
              });
            }            
            self.parent.hideLocating();
          }
        });
      }.bind(this), function() {
        alert('We could not locate you automatically! Please try again or input your location manually!');
        self.parent.hideLocating();
      });
    }
/*
        var ONM_API_URL = (client.is_widget || client.is_phonegap) ? 'http://fi.opennetmap.org/api/' : '/onm/';
        var params = {
          'operation' : 'get_osm',
          'lat' : p.coords.latitude,
          'lon' : p.coords.longitude
        }
        new Ajax.Request(ONM_API_URL, {
          method : 'get',
          parameters : params,
          evalJSON : 'force',
          onSuccess : function(response) {
            var json = response.responseJSON;
            json.geojson.features.each(function(feature) {
              if (feature.properties.name != null && feature.properties.name.length > 0) {
                $('location_input').value = feature.properties.name;
                self.parent.location = {
                  latitude : p.coords.latitude,
                  longitude : p.coords.longitude,
                  latlonDatetime : new Date().toUTCString()
                };          
                throw $break;
              }
            });
            self.parent.hideLocating();
          }
        });
*/
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL + '/people/'+this.parent.userId+'/@self';
    var params = { 'event_id' : 'Ossi::UpdateStatus/GetData'};
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'get',
      parameters : params,
      onSuccess: function(response){
        var json = response.responseJSON;
        if (typeof(json.entry.status) != 'undefined') {
          if (json.entry.status.message != 'undefined') {
            if (json.entry.status.message != null) {
              $('status_input').value = json.entry.status.message;
              // a bit convoluted, but works for the time being
              setTimeout(function() {
                $('status_form').focusFirstElement()
              }, 500); // .delay() did not seem to work on Firefox
            }
          }
        }
        if (typeof(json.entry.location) != 'undefined' && self.getOldLocation) { // disabled
          if (json.entry.location.label != 'undefined') {
            if (json.entry.location.label != null) {
              $('location_input').value = json.entry.location.label;
            }
          }
        }
        if (! Object.isUndefined(self.parent.locator)) {
          self.parent.locator.update(function() {
            $('location_input').value = this.parent.location.label;
          }.bind(self));
        }
        self.parent.hideLoading();
      }
    });
  },
  _putStatus: function(e){
    Event.stop(e);
    var self = this;
    var s = $F('status_input');
    var URL = BASE_URL + '/people/'+self.parent.userId+'/@self';
    var params = {
      'person[status_message]': s,
      'event_id' : 'Ossi::UpdateStatus/UpdateStatus'
    };
    self.parent.loadingpane.show();
    new Ajax.Request(URL, {
      method: 'put',
      parameters: params,
      onSuccess: function(response){
        if (Object.isUndefined(self.parent.locator) || true) { // forced
          // also update the location
            self.parent.location.label = $F('location_input');
            self.parent.location.labelDatetime = new Date().toUTCString();

            // send location to server
            var URL = BASE_URL + '/people/'+self.parent.userId+'/@location';
            var params = {
              'location[label]': self.parent.location.label,
              'location[latitude]': (! Object.isUndefined(self.parent.location.latitude)) ? self.parent.location.latitude : '',
              'location[longitude]': (! Object.isUndefined(self.parent.location.longitude)) ? self.parent.location.longitude : '',
              'event_id' : 'Ossi::UpdateStatus/UpdateLocation'
            };
            new Ajax.Request(URL, {
              method: 'put',
              parameters: params,
              onSuccess: function(response) {
                self.parent.loadingpane.hide();
                self.options.backCase.apply();
              }
            });
        } else {
          self.parent.loadingpane.hide();
          self.options.backCase.apply();
        }
      },
      onFailure: function(){
        alert('XHR to set status message failed!');
        self.parent.hideLoading();
      }
    });
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('statuspane');
    }
    else {
      alert('ossi.status._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
    var h = '\
             <div id="statuspane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form id="status_form">\
                    <div style="margin: 12px auto 12px auto; text-align: left; width: 205px;">\
                      <dl>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">What\'s going on?</dt>\
                        <dd style=" margin:0px 0px 5px 15px;"><input type="text" class="myprofile_input" id="status_input" name="status" />\
                      </dd>\
                        <span id="location_input_container">\
                          <dt style="color:#666; margin:0px 0px 5px 0px;">Where are ya?</dt>\
                          <dd style=" margin:0px 0px 5px 15px;"><input type="text" class="myprofile_input" id="location_input" name="location" />\</dd>\
                        </span>\
                        </dl>\
                      <input type="submit" style="display:none" />\
                    </div>\
            				<div class="nav_button">\
            					<a id="done_button" class="nav_button_text" href="javascript:void(null);">Save</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="profile_button" class="nav_button_text" href="javascript:void(null);">Profile settings</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="cancel_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _focusHandler: function(){
    $('status_input').select();
    $('status_input').setStyle({
      color: '#000'
    });
    $('status_input').stopObserving('focus', this._focusHandler); // clears handler to fix issue with N95 calling focus again when blur is supposed to be called
  },
  _cancelHandler: function(){
    this.options.backCase.apply();
  },
  _profileHandler: function(){
    var self = this;
    this.parent.case8({});
  },
  _addListeners: function(){
    $('status_form').observe('submit', this._putStatus.bindAsEventListener(this));
    $('done_button').onclick = this._putStatus.bindAsEventListener(this);
    $('cancel_button').onclick = this._cancelHandler.bindAsEventListener(this);
    $('profile_button').onclick = this._profileHandler.bindAsEventListener(this);
    $('status_input').observe('focus', this._focusHandler); // removed when entered
  },
  _removeListeners: function(){
    $('done_button').onclick = function() { return }
    $('cancel_button').onclick = function() { return }
    $('profile_button').onclick = function() { return }
    $('status_form').onsubmit = function() { return }
  },
  destroy: function(){
    this._removeListeners();
    this.pane.remove();
  }
});
