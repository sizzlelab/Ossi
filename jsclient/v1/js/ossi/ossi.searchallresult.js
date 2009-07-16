/**
* ossi searchresults class
*/
ossi.searchallresult = Class.create(ossi.base,{
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
    var result = new Array();
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
						     json.entry.each(function(entry){
							     // Write here a toButton and time functions for different classes
												 entry = Object.extend( {
														toButton : function(){
															 var name = (this.name != null) ? this.name['unstructured'] : this.username; // if name has not been set
												    var status_message = '';
												    var status_time = '';
												    if (typeof(this.status) != 'undefined') {
												      if (this.status.message != 'undefined') {
												        if (this.status.message != null) {
												          status_message = this.status.message;
												        }
												      }
												      if (this.status.changed != 'undefined') {
												        if (this.status.changed != null) {
														         status_time = self.parent.utils.agoString(this.status.changed);
												        }
												      }
												    }
														
												    var h =   '\
												          				<div class="profile_button" id="search_uid_'+this.id+'" href="javascript:void(null);">\
												                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="'+BASE_URL+'/people/'+this.id+'/@avatar/small_thumbnail?'+Math.random()*9999+'" width="50" height="50" border="0" /></div>\
												                    <div class="post_button_text">\
												        						  <div class="button_title">'+name+'</div>\
												        						  <div class="button_content_text"><a href="javascript:void(null);">'+status_message+'</a></div>\
												        						  <div class="button_subtitle_text" style="padding-top:3px">'+status_time+'</div>\
												                    </div>\
												          				</div>\
												          			';
												    return h;
														},
														getDate : function(){
															  if (typeof(this.status) != 'undefined') {
												      if (this.status.changed != 'undefined') {
												        if (this.status.changed != null) {
														         var d = this.status.changed;
																							var a = Date.UTC(d.substring(0,4),d.substring(5,7),d.substring(8,10),d.substring(11,13),d.substring(14,16),d.substring(17,19));
	   													      return a;
												        }
												      }
												    }
															  return 0; 
														}
													} ,
													entry );
							      result.push( entry );
						    }, self);
					   }
				   }
							self._drawResults( result );
      }
    });
	/*			// FIXME: These are ideas, need to be fixed according to real COS
				URL = BASE_URL + '/channels';
				params = {search: this.options.search};
				new Ajax.Request(URL, {
      method : 'get',
      parameters : params,
      requestHeaders : (client.is_widget) ? ['Cookie',self.parent.sessionCookie] : '',
      onSuccess : function(response) {
        var json = response.responseJSON;
        self._removeLinkListeners();
        if (typeof(json.entry) != 'undefined') {
					     if (json.entry.length > 0) {
						     json.entry.each(function(entry){
							     // Write here a toButton and time functions for different classes
												 entry = Object.extend( entry );
							      result.push( entry );
						    }, self);
					   }
				   }
							self._drawResults( result );
      },
    }); */
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
													<div class="nav_button">\
          					<a id="search_results_back_button_2" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
                  <div id="search_results_placeholder">\
                  </div>\
          				<div class="nav_button">\
          					<a id="search_results_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
		_drawResults: function(data){
			 data = data.sort( this._timeSorter );
				var h = '';
				data.each( function(element){
					 h += element.toButton();
				} );
				$('search_results_placeholder').update(h);
    this._addLinkListeners();
				this.parent.hideLoading();
		},
		_timeSorter: function(a, b){
			var ret = -10;
			var dateA = a.getDate();
			var dateB = b.getDate();
			if( dateA < dateB ) ret = 1;
			else if( dateB < dateA ) ret = -1;
			else ret = 0;
			return ret;
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