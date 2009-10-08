/**
* naepsy terms class
*/
naepsy.terms = Class.create(naepsy.base,{
	initialize: function(parent,options) {
    this.parent = parent;
		this.options = Object.extend({
      hostElement : false,
      backCase : function() { return false; }
	  },options);
	  this.pane = false;
    this._draw();
	},
  _draw: function() {
    if (this.options.hostElement) {
      this.options.hostElement.insert(this._getHTML());
      this._addListeners();
      this.pane = $('termspane');
    } else {
      alert('naepsy.terms._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="termspane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          			  <div class="terms_div" style="margin:20px 10px 20px 10px">\
                    <h2>Terms of Use</h2>\
                    <p>naepsy is a social media service that allows its users to inter-communicate. It is a part of Helsinki University of Technology’s (HUT) OtaSizzle-research project, where the service is being tested and developed. The project is conducted by Helsinki Institute for Information Technology (HIIT), a joint research institute of HUT and University of Helsinki. The naepsy-service may only be used in accordance with these terms of use. HIIT reserves the right to change these terms of use if required. Valid terms of use can be found from naepsy’s website. \
                    <h3>Rights of Content</h3>\
                    <p>The users themselves retain the rights to all text, pictures and other content that they create in the service. The users allow others to utilize the content in accordance with the nature of the service and, furthermore, allow HIIT to file information and data and make changes that are necessary for the service or the study, however other rights are not transferred from the users, unless specifically otherwise agreed. The responsibility of the content lies with the user, who has produced it to the service. HIIT has the right to remove any material when it deems it necessary. \
                    <h3>Disclaimer</h3>\
                    <p>naepsy-service is experimental in its nature, as well as a part of a study and therefore no guarantees of its functioning can be given. HIIT, HUT and University of Helsinki can under no circumstances be liable for damage that is caused to the user. The user may not store any information or data in the service, and expect it to remain there. \
                    <h3>The Removal of a User</h3>\
                    <p>HIIT has the right to remove any users from naepsy and terminate their right of use of the service without any specific reason and without being liable for compensation.\
                    <h3>Applicable Jurisdiction</h3>\
                    <p>The jurisdiction that is applicable in this service and these terms of use is that of Finland, unless something else is required by binding law. \                  </div>\
          				<div class="nav_button">\
          					<a id="terms_back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _addListeners: function() {
    $('terms_back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('terms_back_button').onclick = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});