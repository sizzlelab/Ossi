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
    var params =  { search : this.options.search };
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method : 'get',
      parameters : params,
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
          // timestamp to epoch
          var d = user.status.changed;
          var a = Date.UTC(d.substring(0,4),d.substring(5,7),d.substring(8,10),d.substring(11,13),d.substring(14,16),d.substring(17,19));

          // now to epoch
          var e = new Date();
          var b = Date.UTC(e.getUTCFullYear(),(e.getUTCMonth()+1),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds());

          // set string data
          var s = (b-a) / 1000;
          if (s < 60) {
            status_time = 'a moment ago';
          } else if (s >= 60 && s < 3600) {
            s = Math.floor(s/60);
            status_time = s+' mins ago';
          } else if (s >= 3600 && s < 86400) {
            s = Math.floor(s/3600);
            status_time = s+' hours ago';
          } else if (s >= 86400 && s < 2592000) {
            s = Math.floor(s/86400);
            status_time = s+' days ago';
          } else if (s >= 2592000) {
            s = Math.floor(s/2592000);
            status_time = s+' months ago';
          }
        }
      }
    }






    var h =   '\
          				<div class="button">\
          					<a class="search_results_profile_button" id="search_uid_'+user.id+'" href="javascript:void(null);">\
          						<table><tr><td class="button_pic_td"><img class="button_icon" src="images/icons/grey/001_54.png"/></td><td class="button_text_td"><span class="button_title">'+name+'<br/></span>\
          						<span class="button_content_text">'+status_message+'<br/></span>\
          						<span class="button_subtitle_text">'+status_time+'</span></td></tr></table>\
          					</a>\
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
      search : this.options.search,
      backCase : this.parent.case12.bind(this.parent,{
        out : true,
        search : this.options.search,
        backCase : this.parent.case11.bind(this.parent,{
          out : true,
          backCase : this.parent.case9.bind(this.parent,{
            out : true,
            backCase : this.parent.case3.bind(this.parent,{out:true}) }) }) }) 
    });
  },
  _addListeners: function() {
    $('search_results_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('search_results_back_button').onclick = function() { return };
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