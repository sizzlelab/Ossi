/**
* ossi groupmembers class
*/
ossi.groupmembers = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      groupId : false,
      selfUpdate : false,
      hostElement : false
	  },options);
    this.updateInterval = 15000;
	  this.pane = false;
    this._draw();
    this._resetInterval(); // this resets the intervalled update call, if selfUpdate is enabled
	},
	/**
	* _update
	*
	* does not handle XHR failure yet!
	*/
	update: function() {
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var self = this;
    var URL = BASE_URL+'/groups/@public/'+this.options.groupId+'/@members';
    var params = {'event_id' : 'Ossi::ShowGroupMembers'};
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      onSuccess : function(response) {
        var json = response.responseJSON;
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            var h = '';
            json.entry.each(function(entry) {
              h += this._getButtonHTML(entry);
            },self);
            $('group_members_placeholder').update(h);
            self._addLinkListeners();
            if (json.entry.length > 5) $('group_member_list_back_button_2_container').show(); // show second back button at top of screen if more than 5 channels
            self.parent.hideLoading();
          } else {
            $('group_members_placeholder').replace('<div style="padding:10px; text-align:center">This group has currently no members.</div>');
          }
        } else {
          $('group_members_placeholder').replace('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
        }
      }
    });
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('groupmemberspane');
    } else {
      alert('ossi.groupmembers._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="groupmemberspane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="group_member_list_back_button_2_container" class="nav_button" style="display:none">\
          					<a id="group_member_list_back_button2" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
                  <div id="group_members_placeholder">\
                  </div>\
          				<div class="nav_button">\
          					<a id="group_member_list_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(user) {
    var name = (user.name != null) ? user.name['unstructured'] : user.username; // if name has not been set
    var status_message = '';
    var status_time = '';
    var location = '';
    if (typeof(user.status) != 'undefined') {
      if (user.status.message != 'undefined') {
        if (user.status.message != null) {
          status_message = user.status.message;
        }
      }
      if (user.status.changed != 'undefined') {
        if (user.status.changed != null) {
          status_time = this.parent.utils.agoString(user.status.changed);
        }
      }
    }
    if (user.location ) {
    if (user.location.label) {
     if (user.location.label.lenght > 0) {
      location = ' @ ' + user.location.label;
     }
    }
    else 
     if (Object.isNumber(user.location.latitude) && Object.isNumber(user.location.longitude)) {
      location = ' @ ' + this.parent.utils.roundNumber(user.location.latitude, 4) + ' / ' + this.parent.utils.roundNumber(user.location.longitude, 4);
     }
     // Take min of location and status update
     // update_time = user.location.updated_at;
   }

    var h =   '\
          				<div class="profile_button" id="person_uid_'+user.id+'" href="javascript:void(null);">\
                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="'+BASE_URL+'/people/'+user.id+'/@avatar/small_thumbnail?'+Math.random()*9999+'" width="50" height="50" border="0" /></div>\
                    <div class="post_button_text">\
        						  <div class="button_title"><a id="friend_uid_link_'+user.id+'" href="javascript:void(null);">'+name+'</a></div>\
        						  <div class="button_content_text"><a href="javascript:void(null);">'+status_message + location+ '</a></div>\
        						  <div class="button_subtitle_text" style="padding-top:3px">'+status_time+'</div>\
                    </div>\
          				</div>\
          			';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _addFriendHandler: function() {
    this.parent.case11({ backCase : this.parent.case9.bind(this.parent,{out : true, backCase : this.parent.case3.bind(this.parent,{out:true}) }) });
  },
  _openProfileHandler: function(event,button_id) {
  	var groupId = this.options.groupId;
    var uid = button_id.replace("person_uid_","");
    this.parent.case13({
      userId : uid,
  	   groupId : this.options.groupId,
      backCase : this.backCase
    });

  },
  _friendRequestsHandler: function() {
    this.parent.case14({
      backCase : this.parent.case9.bind(this.parent,{
        out : true,
        backCase : this.parent.case3.bind(this.parent,{out:true}) 
      })
    });
  },
  _addListeners: function() {
    $('group_member_list_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('group_member_list_back_button2').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('group_member_list_back_button').onclick = function() { return };
    $('group_member_list_back_button2').onclick = function() { return };
  },
  _addLinkListeners: function() { // for dynamic buttons
    $$('.profile_button').each(function(button) {
      button.onclick = this._openProfileHandler.bindAsEventListener(this,button.id);
    },this);
  },
  _removeLinkListeners: function() {
    $$('.profile_button').each(function(button) {
      button.onclick = function() { return };
    },this);
  },
  _resetInterval: function() {
    if (this.options.selfUpdate) {
      clearInterval(this.interval);
      this.interval = setInterval(this.update.bind(this), this.updateInterval);
    }
  },
  destroy: function () {
    if (this.options.selfUpdate) {
      clearInterval(this.interval);
    }
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});