/**
* ossi pending friends class
*/
ossi.pendingfriends = Class.create(ossi.base,{
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
    var URL = BASE_URL+'/people/'+self.parent.userId+'/@pending_friend_requests'
    new Ajax.Request(URL,{
      method : 'get',
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        var json = response.responseJSON;
        self._removeLinkListeners();
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            var h = '';
            json.entry.each(function(entry) {
              h += this._getButtonHTML(entry);
            },self);
            $('pending_friends_placeholder').update(h);
            self._addLinkListeners();
          } else {
            $('pending_friends_placeholder').update('<div style="padding:10px; text-align:center">You have no more pending friend requests.</div>');
          }
        } else {
          $('pending_friends_placeholder').update('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
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
      this._addListeners();
      this.pane = $('pendingfriendslistpane');
    } else {
      alert('ossi.pendingfriends._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="pendingfriendslistpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <div id="pending_friends_placeholder">\
                  </div>\
          				<div class="nav_button">\
          					<a id="pending_friend_list_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(user) {
    var name = (user.name != null) ? user.name['unstructured'] : user.username; // if name has not been set
    var status = (user.status_message != null) ? user.status_message : 'n/a'; // if name has not been set
    var h =   '\
          				<div class="button">\
          					<a class="search_results_profile_button" id="pending_person_uid_'+user.id+'" href="javascript:void(null);">\
          						<table><tr><td class="button_pic_td"><img class="button_icon" src="images/icons/grey/001_54.png"/></td><td class="button_text_td"><span class="button_title">'+name+'<br/></span>\
          						<span class="button_content_text">'+status+'<br/></span>\
          						<span class="button_subtitle_text">[when updated], [how far away]</span></td></tr></table>\
          					</a>\
          				</div>\
          			';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _removeFriendHandler: function() {
    this.parent.case10({ backCase : this.parent.case9.bind(this.parent,{out : true, backCase : this.parent.case3.bind(this.parent,{out:true}) }) });
  },
  _addFriendHandler: function() {
    this.parent.case11({ backCase : this.parent.case9.bind(this.parent,{out : true, backCase : this.parent.case3.bind(this.parent,{out:true}) }) });
  },
  _openProfileHandler: function(event,button_id) {
    var uid = button_id.replace("pending_person_uid_","");
    this.parent.case13({
      pendingNav : true,
      userId : uid,
      backCase : this.parent.case14.bind(this.parent,{
        out : true,
        backCase : this.parent.case9.bind(this.parent,{
          out : true,
          backCase : this.parent.case3.bind(this.parent,{out:true}) 
        })
      })
    });
  },
  _addListeners: function() {
    $('pending_friend_list_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('pending_friend_list_back_button').onclick = function() { return };
  },
  _addLinkListeners: function() { // for dynamic buttons
    $$('.search_results_profile_button').each(function(button) {
      button.onclick = this._openProfileHandler.bindAsEventListener(this,button.id);
    },this);
  },
  _removeLinkListeners: function() {
    $$('.search_results_profile_button').each(function(button) {
      button.onclick = function() { return };
    },this);
  },
  destroy: function () {
    this._removeListeners();
    this._removeLinkListeners();
    this.pane.remove();
  }
});