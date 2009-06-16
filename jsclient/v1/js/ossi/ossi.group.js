/**
* ossi group class
*/
ossi.group = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      groupId : false,
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
    var self = this;
    var URL = BASE_URL+'/groups/'+this.options.groupId;
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        var json = response.responseJSON;
		
        // title
        if (! Object.isUndefined(json.group.title)) $('group_title').update(json.group.title);
        else $('group_title').update('N/A');

        // description
        if (! Object.isUndefined(json.group.description)) $('group_description').update(json.group.description);
        else $('group_description').update('N/A');

        // type
        if (! Object.isUndefined(json.group.group_type)) $('group_type').update(json.group.group_type);
        else $('group_type').update('N/A');
		
		if( json.group.is_member ) {
		  $('leave_button_container').show();
		} else {
		  $('join_button_container').show();
		}

        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      },
      onFailure : function() {
        alert('could not load group data!');
      }
    });
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('grouppane');
    } else {
      alert('ossi.group._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="grouppane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form>\
                    <div style="margin: 12px auto 12px auto; text-align: left; width: 205px;">\
                      <dl>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Group title:</dt>\
                          <dd id="group_title" style=" margin:0px 0px 10px 15px;">loading...</dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Group description:</dt>\
                          <dd id="group_description" style=" margin:0px 0px 10px 15px;">loading...</dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Group type:</dt>\
                          <dd id="group_type" style=" margin:0px 0px 10px 15px;">loading...</dd>\
                      </dl>\
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
            				<div class="nav_button">\
            					<a id="back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            				</div>\
                  </form>\
          			</div>\
          		';
    return h;
  },
  _joinHandler: function() {
    var self = this;
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@groups';
    var params = { group_id : this.options.groupId };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'post',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        var json = response.responseJSON;
        self.parent.case6({
          message : "You have successfully joined this group!",
          buttonText : "Back",
          backCase:self.parent.case27.bind(self.parent,{
            groupId : self.options.groupId,
            out:true,
            backCase:self.parent.case25.bind(self.parent,{
              out:true,
              backCase:self.parent.case3.bind(self.parent,{out:true})
            })
          })
        });
        self.parent.hideLoading();
      },
      onFailure : function() {
        alert('could not add user to group!');
      }
    });
  },
  
  _leaveHandler: function() {
    var self = this;
    if (typeof(this.parent.userId) == 'undefined') return; // userId in the parent controller not set
    var URL = BASE_URL+'/people/'+this.parent.userId+'/@groups/' + this.options.groupId;
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'delete',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) { // does not handle invalid responses
        var json = response.responseJSON;
        self.parent.case6({
          message : "You have successfully left this group!",
          buttonText : "Back",
          backCase:self.parent.case27.bind(self.parent,{
            groupId : self.options.groupId,
            out:true,
            backCase:self.parent.case25.bind(self.parent,{
              out:true,
              backCase:self.parent.case3.bind(self.parent,{out:true})
            })
          })
        });
        self.parent.hideLoading();
      },
      onFailure : function() {
        alert('could not add user to group!');
      }
    });
  },
  
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _membersHandler: function() {
    var self = this;
    self.parent.case28({
      groupId : self.options.groupId,
      backCase : self.parent.case27.bind(self.parent,{
        out:true,
        groupId:self.options.groupId,
        backCase : self.parent.case25.bind(self.parent,{
          out:true,
          backCase : self.parent.case3.bind(self.parent,{
            out:true
          })
        })
      })
    });
  },
  _addListeners: function() {
    $('members_button').onclick = this._membersHandler.bindAsEventListener(this);
    $('join_button').onclick = this._joinHandler.bindAsEventListener(this);
    $('leave_button').onclick = this._leaveHandler.bindAsEventListener(this);
    $('back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('members_button').onclick = function() { return }
    $('join_button').onclick = function() { return }
    $('leave_button').onclick = function() { return }
    $('back_button').onclick = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});