/**
 * ossi group class
 */
ossi.group = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      groupId: false,
      hostElement: false
    }, options);
    this.pane = false;
    this._draw();
  },
  /**
   * _update
   *
   * does not handle XHR failure yet!
   */
  update: function(){
    var self = this;
    var URL = BASE_URL + '/groups/@public/' + this.options.groupId;
    var params = { 'event_id' : 'Ossi::ShowGroupPage'  };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'get',
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      onSuccess: function(response){ // does not handle invalid responses
        var json = response.responseJSON;
        json = json.entry;
        
        // title
        if (!Object.isUndefined(json.title)) $('view_group_title').update(json.title);
        else $('view_group_title').update('N/A');
        
        // description
        if (!Object.isUndefined(json.description)) $('view_group_description').update(json.description);
        else $('view_group_description').update('N/A');
        
        // type
        if (!Object.isUndefined(json.group_type)) $('view_group_type').update(json.group_type + ' group');
        else $('view_group_type').update('N/A');
        
        if (json.is_member) {
          $('leave_button_container').show();
          $('join_button_container').hide();
        } else {
          if (json.group_type != 'closed') $('join_button_container').show();
          $('leave_button_container').hide();
        }
        
        /*
        // now check if group has channels and display channels button accordingly
        URL = BASE_URL + '/channels?group_id=' + self.options.groupId;
        new Ajax.Request(URL, {
          method: 'get',
          requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
          onSuccess: function(response){ // does not handle invalid responses
            var json = response.responseJSON;
            if (json.entry.length > 0) {
              $('group_channels_button_container').show();
            }
          }
        });
        */
        
        setTimeout(function(){
          self.parent.hideLoading();
        }, 600);
      },
      onFailure: function(){
        alert('could not load group data!');
      }
    });
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('grouppane');
    } else {
      alert('ossi.group._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
   var h = '\
          			<div id="grouppane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form>\
                    <div style="margin: 12px auto 12px auto; text-align: left; width: 205px;">\
                      <div>\
                          <p id="view_group_title" style=" margin:0px 0px 10px 15px; color: #58bb3d; font-size: 120%;">loading...</p>\
                          <p id="view_group_description" style=" margin:0px 0px 10px 15px;">loading...</p>\
                          <p id="view_group_type" style=" margin:0px 0px 10px 15px;">loading...</p>\
                      </div>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div id="join_button_container" class="nav_button" style="display:none"v>\
            					<a id="join_button" class="nav_button_text" href="javascript:void(null);">Join Group</a>\
            				</div>\
							      <div  id="leave_button_container"  class="nav_button" style="display:none" >\
            					<a id="leave_button" class="nav_button_text" href="javascript:void(null);">Leave Group</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="members_button" class="nav_button_text" href="javascript:void(null);">Members</a>\
            				</div>\
            				<div id="group_channels_button_container" class="nav_button">\
            					<a id="group_channels_button" class="nav_button_text" href="javascript:void(null);">Group Channels</a>\
            				</div>\
            				<div class="nav_button">\
            					<a id="back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _joinHandler: function(){
    var self = this;
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var URL = BASE_URL + '/people/' + this.parent.userId + '/@groups';
    var params = {
      group_id: this.options.groupId,
      'event_id' : 'Ossi::GroupPage/JoinGroupAction'
    };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'post',
      parameters: params,
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      onSuccess: function(response){ // does not handle invalid responses
        var json = response.responseJSON;
        self.parent.case6({
          message: "You have successfully joined this group!",
          buttonText: "Back"
        });
        self.parent.hideLoading();
      },
      onFailure: function(){
        alert('could not add user to group!');
      }
    });
  },
  _leaveHandler: function(){
    var self = this;
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var URL = BASE_URL + '/people/@me/@groups/' + this.options.groupId;
    var params = { 'event_id' : 'Ossi::GroupPage/JoinGroupAction' };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'delete',
      parameters : params,
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      onSuccess: function(response){ // does not handle invalid responses
        var json = response.responseJSON;
        // remove one item from the back-stack
        // (if user leaves the group, go back to group list)¨
        // also, handles the case that the group is removed (only one member left)
        self.parent.stack.pop();
        self.parent.case6({
          message: "You have successfully left this group!",
          buttonText: "Back"
        });
        self.parent.hideLoading();
      },
      onFailure: function(){
        alert('could not add user to group!');
      }
    });
  },
  _backHandler: function(){
    this.options.backCase.apply();
  },
  _membersHandler: function(){
    var self = this;
    self.parent.case28({
      groupId: self.options.groupId
    });
  },
  _channelsHandler: function(){
    var self = this;
    self.parent.case18({
      groupId: self.options.groupId
    });
  },
  _addListeners: function(){
    $('group_channels_button').onclick = this._channelsHandler.bindAsEventListener(this);
    $('members_button').onclick = this._membersHandler.bindAsEventListener(this);
    $('join_button').onclick = this._joinHandler.bindAsEventListener(this);
    $('leave_button').onclick = this._leaveHandler.bindAsEventListener(this);
    $('back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function(){
    $('group_channels_button').onclick = function(){
      return
    }
    $('members_button').onclick = function(){
      return
    }
    $('join_button').onclick = function(){
      return
    }
    $('leave_button').onclick = function(){
      return
    }
    $('back_button').onclick = function(){
      return
    }
  },
  destroy: function(){
    this._removeListeners();
    this.pane.remove();
  }
});
