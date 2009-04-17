/**
* ossi grouplist class
*/
ossi.grouplist = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false
	  },options);
    this.count = 8;
	  this.startIndex = 1;
	  this.pane = false;
    this._draw();
	},
	/**
	* _update
	*
	* does not handle XHR failure yet!
	*/
	update: function(options) {
		var options = Object.extend({
      startIndex : 1,
      count : this.count
	  },options);
    var self = this;
    // get all public groups
    var URL = BASE_URL+'/groups/@public';
    var params = { startIndex : options.startIndex, count : options.count };
    self.parent.showLoading();
    new Ajax.Request(URL,{
      method : 'get',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        console.log(response);
        var json = response.responseJSON;
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            self._drawContents(json.entry);
            if (json.entry.length > 5) $('groups_back_button_2_container').show(); // show second back button at top of screen if more than 5 groups
            if (options.startIndex + options.count < json.totalResults) $('groups_next_button_container').show();
            else $('groups_next_button_container').hide()
            if (options.startIndex > 1) $('groups_previous_button_container').show();
            else $('groups_previous_button_container').hide()
          } else {
            $('groups_placeholder').replace('<div style="padding:10px; text-align:center">There are currently no public groups available in the service. If this is an error please contact system administrators at: otasizzle-helpdesk@hiit.fi</div>');
          }
        } else {
          $('groups_placeholder').replace('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
          $('create_group_button_container').hide();
        }
        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      },
      onFailure : function(response) {
        alert('could not get group list!!!');
      }
    });
	},
	_drawContents: function(entries) {
    var self = this;
    var h = '';
    entries.each(function(entry) {
      h += self._getButtonHTML(entry);
    },self);
    $('groups_placeholder').update(h);
    this._addLinkListeners();
  },
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('grouplistpane');
    } else {
      alert('ossi.grouplist._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="grouplistpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="groups_back_button_2_container" class="nav_button" style="display:none">\
          					<a id="groups_back_button2" class="nav_button_text" href="javascript:void(null);">Back to Main Menu</a>\
          				</div>\
                  <div id="groups_placeholder">\
                  </div>\
          				<div id="groups_next_button_container" class="nav_button" style="display:none">\
          					<a id="groups_next_button" class="nav_button_text" href="javascript:void(null);">Next Page</a>\
          				</div>\
          				<div id="groups_previous_button_container" class="nav_button" style="display:none">\
          					<a id="groups_previous_button" class="nav_button_text" href="javascript:void(null);">Previous Page</a>\
          				</div>\
          				<div id="about_groups_button_container" class="nav_button">\
          					<a id="about_groups_button" class="nav_button_text" href="javascript:void(null);">About Groups</a>\
          				</div>\
          				<div id="create_group_button_container" class="nav_button" style="display:none">\
          					<a id="create_group_button" class="nav_button_text" href="javascript:void(null);">Create New Group</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="groups_back_button" class="nav_button_text" href="javascript:void(null);">Back to Main Menu</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(group) {
    var updated_text = '';
    if (group.updated_at != 'undefined') {
      if (group.updated_at != null) {
        // timestamp to epoch
        var d = group.updated_at;
        var a = Date.UTC(d.substring(0,4),d.substring(5,7),d.substring(8,10),d.substring(11,13),d.substring(14,16),d.substring(17,19));

        // now to epoch
        var e = new Date();
        var b = Date.UTC(e.getUTCFullYear(),(e.getUTCMonth()+1),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds());

        // set string data
        var s = (b-a) / 1000;
        if (s < 60) {
          updated_text = 'a moment ago';
        } else if (s >= 60 && s < 3600) {
          s = Math.floor(s/60);
          updated_text = s+' mins ago';
        } else if (s >= 3600 && s < 86400) {
          s = Math.floor(s/3600);
          updated_text = s+' hours ago';
        } else if (s >= 86400 && s < 2592000) {
          s = Math.floor(s/86400);
          updated_text = s+' days ago';
        } else if (s >= 2592000) {
          s = Math.floor(s/2592000);
          updated_text = s+' months ago';
        }
      }
    }
    
    var creator_html = '';
    if (group.metadata != null) {
      if (typeof(group.metadata.creator) != 'undefined') {
        creator_html = '<div class="button_subtitle_text" style="padding-top:2px">Originally created by '+group.metadata.creator+'</div>';
      }
    }

    var ident_class = '';
    if (group.tags != null) {
      ident_class = (group.tags.match('private')) ? 'private' : 'public';
    }
    
    var h =   '\
          				<div class="group_button" id="group_id_'+group.id+'">\
                    <div class="group_button_left_column '+ident_class+'"></div>\
                    <div class="group_button_text">\
        						  <div class="button_title"><a href="javascript:void(null);">'+group.title+'</a></div>\
        						  <div class="button_subtitle_text" style="padding-top:3px">'+group.totalResults+' messages. Updated '+updated_text+'</div>\
        						  '+creator_html+'\
                    </div>\
          				</div>\
          			';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _createGroupHandler: function() {
    var self = this;
    self.parent.case19({
      backCase : self.parent.case18.bind(self.parent,{
        out : true,
        backCase : self.parent.case3.bind(self.parent,{out:true}) 
      })
    });
  },
  _openGroupHandler: function(event,button_id) {
    var self = this;
    var group_id = button_id.replace("group_id_","");
    self.parent.case20({
      groupId : group_id,
      backCase : self.parent.case18.bind(self.parent,{
        out : true,
        backCase : self.parent.case3.bind(self.parent,{out:true}) 
      })
    });
  },
  _nextHandler: function() {
    this.update({ 'startIndex' : this.startIndex+this.count, 'count' : this.count });
    this.startIndex += this.count;
  },
  _previousHandler: function() {
    this.update({ 'startIndex' : this.startIndex-this.count, 'count' : this.count });
    this.startIndex -= this.count;
  },
  _aboutGroupsHandler: function() {
    var m = '\
                <div style="font-size:10px; padding:10px">\
        				  <h2>About Groups</h2>\
                  <p>Information is not yet available.</p>\
                  <p>If you find any bugs or have some other comments about the functionalities of the groups or Ossi in general please post a comment on Ossi\'s "Features & Bugs" group, or email us at <a href="mailto:helpdesk-otasizzle@hiit.fi">helpdesk-otasizzle@hiit.fi</a>.</p>\
                </div>\
    ';
    this.parent.case6({
      message : m,
      buttonText : "Back",
      backCase:this.parent.case25.bind(this.parent,{
        out:true,
        backCase:this.parent.case3.bind(this.parent,{out:true})
      })
    });            
  },
  _addListeners: function() {
    $('create_group_button').onclick = this._createGroupHandler.bindAsEventListener(this);
    $('about_groups_button').onclick = this._aboutGroupsHandler.bindAsEventListener(this);
    $('groups_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('groups_next_button').onclick = this._nextHandler.bindAsEventListener(this);
    $('groups_previous_button').onclick = this._previousHandler.bindAsEventListener(this);
    $('groups_back_button2').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('create_group_button').onclick = function() { return }
    $('about_groups_button').onclick = function() { return };
    $('groups_back_button').onclick = function() { return }
    $('groups_next_button').onclick = function() { return }
    $('groups_previous_button').onclick = function() { return }
    $('groups_back_button2').onclick = function() { return }
  },
  _addLinkListeners: function() { // for dynamic buttons
    $$('.group_button').each(function(button) {
      button.onclick = this._openGroupHandler.bindAsEventListener(this,button.id);
    },this);
  },
  _removeLinkListeners: function() {
    $$('.group_button').each(function(button) {
      button.onclick = function() { return };
    },this);
  },
  destroy: function () {
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});