/**
 * ossi searchresults class
 */
ossi.searchallresult = Class.create(ossi.base, {
    initialize: function(parent, options){
        this.parent = parent;
        this.options = Object.extend({
            search: false,
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
        if (typeof(this.parent.userId) == 'undefined') 
            return; // userId in the parent controller not set
        if (this.options.search == false) 
            return; // search terms not set
        var result = [];
        var self = this;
        var URL = BASE_URL + '/search';
        var params = {
            search: this.options.search,
            'event_id' : 'Ossi::SearchAll'
        };
        self.parent.showLoading();
        new Ajax.Request(URL, {
            method: 'get',
            parameters: params,
            onSuccess: function(response){
                var json = response.responseJSON;
                kissa = json;
                self._removeLinkListeners();
                if (typeof(json.entry) != 'undefined') {
                    var h = '';
                    if (json.entry.length > 0) {
                        if (json.entry.length > 7) {
                            $('search_results_back_button_2_container').show();
                        }
                        
                        json.entry.each(function(entry){
                            if (entry.type == 'Person') {
                                h += this._personButton(entry.result);
                            }
                            if (entry.type == 'Group') {
                                h += this._groupButton(entry.result);
                            }
                            if (entry.type == 'Channel') {
                                h += this._channelButton(entry.result);
                            }
                        }, self);
                    }
                    self.parent.hideLoading();
                    $('search_results_placeholder').update(h);
                    self._addLinkListeners();
                }
                
            }
        });
    },
    _draw: function(){
        if (this.options.hostElement) {
            this.options.hostElement.insert(this._getHTML());
            this._addListeners();
            this.pane = $('searchresultspane');
        }
        else {
            alert('ossi.searchresults._draw() failed! this.options.hostElement not defined!');
        }
    },
    _getHTML: function(){
        var h = '\
          			<div id="searchresultspane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
													<div class="nav_button" id="search_results_back_button_2_container" style="display: none">\
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
    
    _personButton: function(element){
        var name = (element.name != null) ? element.name['unstructured'] : element.username; // if name has not been set
        var status_message = '';
        var status_time = '';
        if (typeof(element.status) != 'undefined') {
            if (element.status.message != 'undefined') {
                if (element.status.message != null) {
                    status_message = element.status.message;
                }
            }
            if (element.status.changed != 'undefined') {
                if (element.status.changed != null) {
                    status_time = this.parent.utils.agoString(element.status.changed);
                }
            }
        }
        
        var h = '\
												          				<div class="profile_button" id="search_uid_' + element.id + '" href="javascript:void(null);">\
												                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="' +
        BASE_URL +
        '/people/' +
        element.id +
        '/@avatar/small_thumbnail?' +
        Math.random() * 9999 +
        '" width="50" height="50" border="0" /></div>\
												                    <div class="post_button_text">\
												        						  <div class="button_title">' +
        name +
        '</div>\
												        						  <div class="button_content_text"><a href="javascript:void(null);">' +
        status_message +
        '</a></div>\
												        						  <div class="button_subtitle_text" style="padding-top:3px">' +
        status_time +
        '</div>\
												                    </div>\
												          				</div>\
												          			';
        return h;
    },
    
    _groupButton: function(element){
        var description = element.description != null ? element.description : '';
        var h = '\
												          				<div class="group_button" id="search_gid_' + element.id + '" href="javascript:void(null);">\
												                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="./images/group.png" width="50" height="50" border="0" /></div>\
												                    <div class="post_button_text">\
												        						  							<div class="button_title">' +
        element.title +
        '</div>\
												        						  							<div class="button_content_text"><a href="javascript:void(null);">' +
        description +
        '</a></div>\
												                    </div>\
												          				</div>\
												          			';
        return h;
    },
    
    _channelButton: function(element){
        var description = element.description != null ? element.description : '';
        var h = '\
												          				<div class="channel_button" id="search_cid_' + element.id + '" href="javascript:void(null);">\
												                    <div class="post_button_left_column"><img style="margin:2px 0px 0px 2px; border:solid #eee 1px;" src="./images/channel.png" width="50" height="50" border="0" /></div>\
												                    <div class="post_button_text">\
												        						  							<div class="button_title">' +
        element.name +
        '</div>\
												        						  							<div class="button_content_text"><a href="javascript:void(null);">' +
        description +
        '</a></div>\
												                    </div>\
												          				</div>\
												          			';
        return h;
    },
    
    _backHandler: function(){
        this.options.backCase.apply();
    },
    _openProfileHandler: function(event, button_id){
        var uid = button_id.replace("search_uid_", "");
        this.parent.case13({
            userId: uid,
            search: this.options.search
        });
    },
    _openGroupHandler: function(event, button_id){
        var gid = button_id.replace("search_gid_", "");
        this.parent.case27({
            groupId: gid,
            search: this.options.search
        });
    },
    _openChannelHandler: function(event, button_id){
        var cid = button_id.replace("search_cid_", "");
        this.parent.case20({
            channelId: cid,
            search: this.options.search
        });
    },
    _addListeners: function(){
        $('search_results_back_button').onclick = this._backHandler.bindAsEventListener(this);
        $('search_results_back_button_2').onclick = this._backHandler.bindAsEventListener(this);
    },
    _removeListeners: function(){
        $('search_results_back_button').onclick = function(){
            return
        };
        $('search_results_back_button_2').onclick = function(){
            return
        };
    },
    _addLinkListeners: function(){ // for dynamic buttons
        $$('.profile_button').each(function(button){
            button.onclick = this._openProfileHandler.bindAsEventListener(this, button.id);
        }, this);
        $$('.channel_button').each(function(button){
            button.onclick = this._openChannelHandler.bindAsEventListener(this, button.id);
        }, this);
        $$('.group_button').each(function(button){
            button.onclick = this._openGroupHandler.bindAsEventListener(this, button.id);
        }, this);
    },
    _removeLinkListeners: function(){
        $$('.profile_button').each(function(button){
            button.onclick = function(){
                return
            };
        }, this);
        $$('.group_button').each(function(button){
            button.onclick = function(){
                return
            };
        }, this);
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
