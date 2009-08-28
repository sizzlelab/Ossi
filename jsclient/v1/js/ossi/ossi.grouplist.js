/**
 * ossi grouplist class
 */
ossi.grouplist = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false
    }, options);
    this.updateOptions = {
      per_page: 8,
      page: 1
    };
    this.pane = false;
    this._draw();
  },
  /**
   * _update
   *
   * does not handle XHR failure yet!
   */
  update: function(options){
    var options = Object.extend({
      startIndex: 0,
      count: this.count
    }, options);
    var self = this;
    // get all public groups
    var URL = BASE_URL + '/groups/@public';
    var params = {
      per_page: this.updateOptions.per_page,
      page: this.updateOptions.page,
      event_id: 'Ossi::BrowseGroupList'
    };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'get',
      parameters: params,
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      onSuccess: function(response){
        var json = response.responseJSON;
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            json.entry.sort(self._myOwnSorter);
            var h = '';
            json.entry.each( function(group) {
              h += self._getButtonHTML(group);
            } );
            self.parent.utils.addPagingFeature( $('grouplist-paging-container') , json, self);
            $('groups_placeholder').update(h);
            self._addLinkListeners();
          }
          else {
            $('groups_placeholder').replace('<div style="padding:10px; text-align:center">There are currently no public groups available in the service. If this is an error please contact system administrators at: otasizzle-helpdesk@hiit.fi</div>');
          }
        }
        else {
          $('groups_placeholder').replace('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
          $('create_group_button_container').hide();
        }
        setTimeout(function(){
          self.parent.hideLoading();
        }, 600);
      },
      onFailure: function(response){
        alert('could not get group list!!!');
      }
    });
  },
  
  _myOwnSorter: function(a, b){
    a = a.is_member;
    b = b.is_member;
    if (a < b) 
      return 1
    if (a > b) 
      return -1
    return 0
  },
  
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('grouplistpane');
    }
    else {
      alert('ossi.grouplist._draw() failed! this.options.hostElement not defined!');
    }
  },
  
  _getHTML: function(){
    var h = '\
          			<div id="grouplistpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="groups_back_button_2_container" class="nav_button" style="display:none">\
          					<a id="groups_back_button2" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
                  <div id="groups_placeholder">\
                  </div>\
				      	<div id="grouplist-paging-container" >\
					      	</div>\
          				<div id="about_groups_button_container" class="nav_button">\
          					<a id="about_groups_button" class="nav_button_text" href="javascript:void(null);">About Groups</a>\
          				</div>\
          				<div id="create_group_button_container" class="nav_button">\
          					<a id="create_group_button" class="nav_button_text" href="javascript:void(null);">Create New Group</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="groups_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(group){
    var self = this;
    var updated_text = self.parent.utils.agoString(group.created_at);
    
    var creator_html = '';
    if (group.metadata != null) {
      if (typeof(group.metadata.creator) != 'undefined') {
        creator_html = '<div class="button_subtitle_text" style="padding-top:2px">Originally created by ' + group.metadata.creator + '</div>';
      }
    }

    var ident_class = '';
    if (!Object.isUndefined(group.group_type)) {
      ident_class = (group.group_type == 'open') ? 'public' : 'private';
    }
    
    // Change the bar to orange if I'm member of the group
    if (!Object.isUndefined(group.is_member)) {
      if (group.is_member) {
        ident_class = 'my';
      }
    }
    
    var members_html = '';
    if (!Object.isUndefined(group.number_of_members)) {
      members_html += group.number_of_members + ' member';
      members_html += group.number_of_members != 1 ? 's' : '';
    }

    var type_html = '';
    if (!Object.isUndefined(group.group_type)) {
     type_html = group.group_type.capitalize()+' group'; 
    }

    var h = '\
          				<div class="channel_button" id="group_id_' + group.id + '">\
                    <div class="channel_button_left_column ' + ident_class + '"></div>\
                    <div class="channel_button_text">\
        						  <div class="button_title"><a href="javascript:void(null);"><span style="font-size:12px">' + group.title + '</span> - <span style="font-size:10px">'+group.description+'</span></a></div>\
        						  <div class="button_subtitle_text" style="padding-top:3px">'+type_html+' with '+members_html+'</div>\
        						  <div class="button_subtitle_text">Updated '+updated_text +'</div>\
        						  ' + creator_html + '\
                    </div>\
          				</div>\
          			';
    return h;
  },
  _backHandler: function(){
    this.options.backCase.apply();
  },
  _createGroupHandler: function(){
    var self = this;
    self.parent.case26({});
  },
  _openGroupHandler: function(event, button_id){
    var self = this;
    var group_id = button_id.replace("group_id_", "");
    self.parent.case27({
      groupId: group_id
    });
  },
  _aboutGroupsHandler: function(){
    var m = '\
                <div style="font-size:10px; padding:10px">\
        				  <h2>About Groups</h2>\
                  <p>You can join groups that are relevant to you and add group channels to them. This allows you to check what other group members are doing and communicate with them. The group channels are visible only to the members of the group.</p>\
                  <p>You can also create groups of your own. Note that a group and all its channels are deleted if even the last member leaves the group.</p>\
                  <p>If you find any bugs or have some other comments about the functionalities of the groups or Ossi in general please post a comment on Ossi\'s "Ossi Feedback" channel, or email us at <a href="mailto:otasizzle-helpdesk@hiit.fi">otasizzle-helpdesk@hiit.fi</a>.</p>\
                </div>\
    ';
    this.parent.case6({
      message: m,
      buttonText: "Back"
    });
  },
  _addListeners: function(){
    $('create_group_button').onclick = this._createGroupHandler.bindAsEventListener(this);
    $('about_groups_button').onclick = this._aboutGroupsHandler.bindAsEventListener(this);
    $('groups_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('groups_back_button2').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function(){
    $('create_group_button').onclick = function(){
      return
    }
    $('about_groups_button').onclick = function(){
      return
    };
    $('groups_back_button').onclick = function(){
      return
    }
    $('groups_back_button2').onclick = function(){
      return
    }
  },
  _addLinkListeners: function(){ // for dynamic buttons
    $$('.channel_button').each(function(button){
      button.onclick = this._openGroupHandler.bindAsEventListener(this, button.id);
    }, this);
  },
  _removeLinkListeners: function(){
    $$('.channel_button').each(function(button){
      button.onclick = function(){
        return
      };
    }, this);
  },
  destroy: function(){
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});
