/**
 * ossi creategroup class
 */
ossi.creategroup = Class.create(ossi.base, {
  initialize: function(parent, options){
    this.parent = parent;
    this.options = Object.extend({
      hostElement: false
    }, options);
    this.pane = false;
    this._draw();
  },
  _draw: function(){
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('creategrouppane');
      setTimeout(function(){
        $('create_group_form').focusFirstElement()
      }, 500); // .delay() did not seem to work on Firefox
    }
    else {
      alert('ossi.creategroup._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function(){
    var h = '\
          			<div id="creategrouppane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
                  <form name="create_group_form" id="create_group_form">\
                    <div style="margin: 12px auto 12px auto; text-align: left; width: 205px;">\
                      <dl>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Group title:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input class="textinput" maxlength="30" name="group_title" id="group_title" type="text"/></dd>\
                        <dt style="color:#666; margin:0px 0px 5px 0px;">Group description:</dt>\
                          <dd style=" margin:0px 0px 10px 15px;"><input class="textinput" maxlength="60" name="group_description" id="group_description" type="text" /></dd>\
                      </dl>\
            				</div>\
            				<div style="height:14px"></div>\
            				<div class="nav_button">\
            					<a id="create_open_group_create_button" class="nav_button_text" href="javascript:void(null);">Create</a>\
            				</div>\
            		  <div class="nav_button">\
            		    <a id="create_group_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
            		   </div>\
                 </form>\
          			 </div>\
              ';
    return h;
  },
  
  _backHandler: function(){
    this.options.backCase.apply();
  },
  
  _createHandler: function(){
    var self = this;
    var type = arguments[1];
    if (typeof(this.parent.userId) == 'undefined') 
      return; // userId in the parent controller not set
    var params = {
      'group[title]': $F('group_title'),
      'group[type]': type,
      'group[description]': $F('group_description'),
      'create_channel': 'true'
    };
    
    var URL = BASE_URL + '/groups/'; // ossi app id hard coded
    self.parent.showLoading();
    new Ajax.Request(URL, {
      method: 'post',
      requestHeaders : (client.is_Dashboard_widget && self.parent.sessionCookie) ? ['Cookie', self.parent.sessionCookie] : '',
      parameters: params,
      onSuccess: function(response) { // now post the new group's collection ID and title to group list collection
        self.parent.hideLoading();
        self.parent.stack.pop();
        self.parent.case6({
          message: "Group created!",
          buttonText: "Back to group list"
        });
      },
      onFailure: function(response) {
        var json = response.responseJSON;
        var reason_string = '';
        json.messages.each(function(error){
          reason_string += error + " ";
        }, self);
        self.parent.hideLoading();
        self.parent.case6({
          message: "Could not create group: " + reason_string + "<br /><br>If this problem persist, please please post a comment on Ossi's \"Features & Bugs\" channel, or email us at <a href=\"mailto:otasizzle-helpdesk@hiit.fi\">otasizzle-helpdesk@hiit.fi</a>.</p>",
          buttonText: "Try again"
        });
      }
    });
  },
  _addListeners: function(){
    $('create_open_group_create_button').onclick = this._createHandler.bindAsEventListener(this, 'open');
    $('create_group_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function(){
    $('create_open_group_create_button').onclick = function(){
      return
    };
    $('create_group_back_button').onclick = function(){
      return
    };
  },
  destroy: function(){
    this._removeListeners();
    this.pane.remove();
  }
});
