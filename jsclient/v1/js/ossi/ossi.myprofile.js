/**
* ossi myprofile class
*/
ossi.myprofile = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false
	  },options);
	  this.pane = false;
    this._draw();
	},
	/**
	* _update
	*
	* does not handle XHR failure yet!
	*/
	update: function() {
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@self';
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        var json = response.responseJSON;
				json = json.entry;
        if (json.name != null) $('profile_first_name').value = json.name.given_name;
        if (json.name != null) $('profile_last_name').value = json.name.family_name;
        if (json.description != null) $('profile_about_me').value = json.description;
        if (json.website != null) $('profile_website').value = json.website;
        if (typeof(json.gender) != 'undefined') {
          switch(json.gender.key) {
            case "MALE":
              $('profile_gender').selectedIndex = 3;
              break;
            case "FEMALE":
              $('profile_gender').selectedIndex = 2;
              break;
            default:
              $('profile_gender').selectedIndex = 0;
              break;
          }
        }
        
        // for wappu experiment
        if (! Object.isUndefined(json.username)) {
          if (json.username == 'wappu') {
            $('password_container').hide();
          }
        }
        
        if (typeof(json.birthdate) != 'undefined') {
          if (json.birthdate != null) {
            var dob = json.birthdate.split('-');
            var d = (dob[2].length == 2 && dob[2].substring(0,1) == '0') ? parseInt(dob[2].substring(1,2)) : parseInt(dob[2]);
            var m = (dob[1].length == 2 && dob[1].substring(0,1) == '0') ? parseInt(dob[1].substring(1,2)) : parseInt(dob[1]);
            $('profile_day').selectedIndex = d+1;
            $('profile_month').selectedIndex = m+1;
            var l = $('profile_year').options.length;
            for (var i=0; i<l; i++) {
              if ($('profile_year').options[i].value == dob[0]) {
                $('profile_year').selectedIndex = i;
                break;
              }
            } 
          }
        }

        // get settings
        if (client.is_WRT_widget) {
          URL = BASE_URL + '/appdata/'+self.parent.userId+'/@self/'+self.parent.appId;
          new Ajax.Request(URL,{
            method : 'get',
            requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
            onSuccess : function(response) {
              var json = response.responseJSON;
              if (json.entry.settings_auto_updates == 'true') {
                self.parent.settings_auto_updates = true;
                $('location_updates_button_container').show();
                $('location_updates_button').update('Disable automatic location updates');
              } else {
                self.parent.settings_auto_updates = false;
                $('location_updates_button_container').show();
                $('location_updates_button').update('Enable automatic location updates');
              }
            }
          });
        }
        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      }
    });
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      // draw options to select elements (less code this way), may be slow on handset??
      var s = $('profile_day');
      for (var i=1; i<32; i++) {
        var o = new Element('option');
        o.value = i;
        o.update(i);
        s.appendChild(o);
      }
      var s = $('profile_month');
      for (var i=1; i<13; i++) {
        var o = new Element('option');
        o.value = i;
        o.update(i);
        s.appendChild(o);
      }
      var s = $('profile_year');
      for (var i=2008; i>1900; i--) {
        var o = new Element('option');
        o.value = i;
        o.update(i);
        s.appendChild(o);
      }
      this._addListeners();
      this.pane = $('myprofilepane');
    } else {
      alert('ossi.myprofile._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="myprofilepane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form>\
                    <div style="margin: 12px auto 12px auto; text-align: center;">\
          					  <img style="border:solid #eee 1px;" src="'+BASE_URL+'/people/'+this.parent.userId+'/@avatar/large_thumbnail?'+Math.random()*9999+'" border="0" />\
                    </div>\
                    <div style="margin: 12px auto 12px auto; text-align: left; width: 205px;">\
                      <dl>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">First name:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input id="profile_first_name" class="myprofile_input" maxlength="50" name="profile_first_name" type="text"/></dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Last name:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input id="profile_last_name" class="myprofile_input" maxlength="50" name="profile_last_name" type="text"/></dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Website:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input id="profile_website" class="myprofile_input" maxlength="100" name="profile_website" type="text"/></dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">About me:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><textarea class="myprofile_input" name="profile_about_me" id="profile_about_me"></textarea></dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Gender:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;">\
                  					<select id="profile_gender" class="myprofile_input" name="profile_gender">\
                              <option value="">Select gender</option>\
                              <option value="">-------------</option>\
                              <option value="FEMALE">female</option>\
                              <option value="MALE">male</option>\
                  					</select>\
                          </dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Date of birth:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;">\
                  					<select id="profile_day" class="textinput" name="profile_day" style="width:50px">\
                  					  <option value="">day</option>\
                              <option value="">------</option>\
                  					</select>\
                  					<select id="profile_month" class="textinput" name="profile_month" style="width:60px">\
                  					  <option value="">month</option>\
                              <option value="">------</option>\
                  					</select>\
                  					<select id="profile_year" class="textinput" name="profile_year" style="width:65px">\
                  					  <option value="">year</option>\
                              <option value="">------</option>\
                  					</select>\
                          </dd>\
	                        </dl>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="save_button" class="nav_button_text" href="javascript:void(null);">Save</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="avatar_button" class="nav_button_text" href="javascript:void(null);">Change avatar</a>\
            				</div>\
            				<div class="nav_button" id="location_updates_button_container" style="display:none">\
            					<a id="location_updates_button" class="nav_button_text" href="javascript:void(null);">Disable automatic location updates</a>\
            				</div>\
							      <div class="nav_button">\
            					<a id="password_button" class="nav_button_text" href="javascript:void(null);">Change password</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="myprofile_cancel_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _saveHandler: function() {
    var self = this;
    var fn = $F('profile_first_name');
    var ln = $F('profile_last_name');
    var am = $F('profile_about_me');
    var website = $F('profile_website');
    var g = ($F('profile_gender') == 'MALE' || $F('profile_gender') == 'FEMALE') ? $F('profile_gender') : false;
    var dob = false;
    if ($F('profile_day') != '' && $F('profile_month') != '' && $F('profile_year') != '') {
      var d = ($F('profile_day').length != 2) ? '0'+$F('profile_day') : $F('profile_day');
      var m = ($F('profile_month').length != 2) ? '0'+$F('profile_month') : $F('profile_month');
      dob = $F('profile_year') + '-' + m + '-' + d;
    }
    var params =  { 'person[name][given_name]' : fn,
                    'person[name][family_name]' : ln,
                    'person[website]' : website,
                    'person[description]' : am
                  };
    if (g != false) params['person[gender]'] = g;
    if (dob) params['person[birthdate]'] = dob;
    var URL = BASE_URL+'/people/@me/@self';
    self.parent.loadingpane.show();
    new Ajax.Request(URL, {
      method : 'put',
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
      parameters : params,
      onSuccess : function() {
        self.parent.loadingpane.hide();
        self.options.backCase.apply();
      },
      onFailure : function(response) {
/*        var reasons = eval(response.responseText);
        var reason_string = '';
        for (var i=0; i<reasons.length; i++) {
          reason_string += reasons[i];
          if (i != (reasons.length-1)) reason_string += ', ';
        }
*/
        self.parent.loadingpane.hide();
        self.parent.case6({
          backCase : self.parent.case8.bind(self.parent,{
            out:true,
            backCase:self.parent.case3.bind(self.parent,{out:true})
          }),
          message : "Error!",
          buttonText : "Back"
        });
      }
    });
  },
  
  _cancelHandler: function() {
    this.options.backCase.apply();
  },
  
  _avatarHandler: function() {
    var self = this;
    self.parent.case23({
      backCase : self.parent.case8.bind(self.parent,{
        out:true,
        backCase:self.parent.case3.bind(self.parent,{out:true})
      })
    });
  },

  _passwordHandler: function() {
    var self = this;
    self.parent.case29({
        backCase : self.parent.case8.bind(self.parent,{
        out:true,
        backCase:self.parent.case3.bind(self.parent,{out:true})
      })
    });
  },
  
  _toggleLocationUpdatesHandler: function() {
    var self = this;
    var params = {};
    if (self.parent.settings_auto_updates) {
      self.parent.settings_auto_updates = false;
      params = {
        'data[settings_auto_updates]' : false
      };
    } else {
      self.parent.settings_auto_updates = true;
      params = {
        'data[settings_auto_updates]' : true
      };
    }
    self.parent.loadingpane.show();
    var URL = BASE_URL + '/appdata/'+self.parent.userId+'/@self/'+self.parent.appId;
    new Ajax.Request(URL, {
      method : 'put',
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
      parameters : params,
      onSuccess : function() {
        if (self.parent.settings_auto_updates) { // these, for some reason, as set to strings in ASI
          self.parent.locator.run();
          $('location_updates_button').update('Disable automatic location updates');
        } else {
          self.parent.locator.stop();
          $('location_updates_button').update('Enable automatic location updates');
        }
        self.parent.loadingpane.hide();
      },
      onFailure : function() {
        
      }
    });
  },

  _addListeners: function() {
    $('save_button').onclick = this._saveHandler.bindAsEventListener(this);
    $('avatar_button').onclick = this._avatarHandler.bindAsEventListener(this);
    $('password_button').onclick = this._passwordHandler.bindAsEventListener(this);
    $('myprofile_cancel_button').onclick = this._cancelHandler.bindAsEventListener(this);
    $('location_updates_button').onclick = this._toggleLocationUpdatesHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('save_button').onclick = function() { return }
    $('avatar_button').onclick = function() { return }
    $('password_button').onclick = function() { return }
	  $('myprofile_cancel_button').onclick = function() { return }
    $('location_updates_button').onclick = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});