/**
* ossi searchresults class
*/
ossi.searchresults = Class.create(ossi.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      search : false,
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
    if (this.options.search == false) return; // search terms not set
    var self = this;
    var URL = BASE_URL+'/people';
    var params =  { search : this.options.search, 'event_id' : 'Ossi::SearchUsers' };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      parameters : params,
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        var json = response.responseJSON;
        self._removeLinkListeners();
        if (typeof(json.entry) != 'undefined') {
          if (json.entry.length > 0) {
            var h = '';
            json.entry.each(function(entry) {
              h += this._getButtonHTML(entry);
            },self);
            $('search_results_placeholder').update(h);
            self._addLinkListeners();
          } else {
            $('search_results_placeholder').update('<div style="padding:10px; text-align:center">No users found. Try again.</div>');
          }
        } else {
          $('search_results_placeholder').update('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
        }
        setTimeout(function() {
          self.parent.hideLoading();
        }, 600);
      },
      onFailure : function() {
        $('search_results_placeholder').update('<div style="padding:10px; text-align:center">Error occurred. Try again later.</div>');
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
      this.pane = $('searchresultspane');
    } else {
      alert('ossi.searchresults._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="searchresultspane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <div id="search_results_placeholder">\
                  </div>\
          				<div class="nav_button">\
          					<a id="search_results_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _getButtonHTML: function(user) {
    var name = (user.name != null) ? user.name['unstructured'] : user.username; // if name has not been set
    var status_message = '';
    var status_time = '';
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
		
    var h =   '\
          				<div class="profile_button" id="search_uid_'+user.id+'" href="javascript:void(null);">\
                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="'+BASE_URL+'/people/'+user.id+'/@avatar/small_thumbnail?'+Math.random()*9999+'" width="50" height="50" border="0" /></div>\
                    <div class="post_button_text">\
        						  <div class="button_title">'+name+'</div>\
        						  <div class="button_content_text"><a href="javascript:void(null);">'+status_message+'</a></div>\
        						  <div class="button_subtitle_text" style="padding-top:3px">'+status_time+'</div>\
                    </div>\
          				</div>\
          			';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _openProfileHandler: function(event,button_id) {
    var uid = button_id.replace("search_uid_","");
    this.parent.case13({
      userId : uid,
      search : this.options.search
    });
  },
  _addListeners: function() {
    $('search_results_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('search_results_back_button').onclick = function() { return };
  },
  _addLinkListeners: function() { // for dynamic buttons
    $$('.profile_button').each(function(button) {
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