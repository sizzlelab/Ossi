/**
* naepsy consent class
*/
naepsy.consent = Class.create(naepsy.base,{
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
      this.pane = $('consentpane');
    } else {
      alert('naepsy.consent._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="consentpane" style="display:none; position:absolute; top:0px; left:0px; width:100%; height:100%; z-index:2">\
          				<div id="consent_naepsy" style="margin:20px 10px 20px 10px">\
                    <h2>WRITTEN CONSENT FOR RESEARCH STUDY (naepsy)</h2>\
                    <p>By giving my consent I confirm my voluntary participation in a study entitled phuksieksperimentti, belonging to the OtaSizzle project.</p>\
                    <p>I have read and understood the appended research description (link to research description), entitled “Information for Participants in Scientific Research”, and confirm that I have received sufficient information on the study and have been given the opportunity to ask questions about the study (and if the information affects the test I have been assured I will have this opportunity after the study).</p>\
                    <p>I am willing to follow the instructions provided by the researchers before, during and after the study.</p>\
                    <p>I consent to my personal data being processed in the ways described in the research description.</p>\
                    <p>I am aware of the fact that I have the right to cancel my participation in the test at any time without providing a reason, and to refuse to answer any questions asked before, during or after the study.</p>\
                    <p>The services in the study (naepsy, etc.) may only be used in accordance with their terms of use. I accept the terms of use before I use the services.</p>\
                    <p>For more information on the study or in case of any questions, please contact:</p>\
                    <p>Researcher Vilma Lehtinen, Researcher Airi Lampinen, Project Manager Olli Pitkänen or Professor Martti Mäntylä</p>\
                    <p>Helsinki Institute for Information Technology, Spektri Pilotti, Metsänneidonkuja 4, 02130  Espoo, tel.:+358 (0)9 4511, email:vilma.lehtinen@hiit.fi, airi.lampinen@hiit.fi, olli.pitkanen@hiit.fi, martti.mantyla@hiit.fi</p>\
                  </div>\
          				<div class="nav_button">\
          					<a id="agree_button" class="nav_button_text" href="javascript:void(null);">I agree</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="consent_back_button" class="nav_button_text" href="javascript:void(null);">I do not agree</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="terms_button" class="nav_button_text" href="javascript:void(null);">naepsy Terms of Use</a>\
          				</div>\
          				<div class="nav_button">\
          					<a id="info_button" class="nav_button_text" href="javascript:void(null);">Information for Participants</a>\
          				</div>\
          			</div>\
         ';
    return h;
  },
  _agreeHandler: function() {
    this.parent.case5({ });
  },
  _infoHandler: function() {
    this.parent.case17({ });
  },
  _termsHandler: function() {
    this.parent.case15({ });
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _addListeners: function() {
    $('agree_button').onclick = this._agreeHandler.bindAsEventListener(this);
    $('consent_back_button').onclick = this._backHandler.bindAsEventListener(this);
    $('terms_button').onclick = this._termsHandler.bindAsEventListener(this);
    $('info_button').onclick = this._infoHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('agree_button').onclick = function() { return };
    $('consent_back_button').onclick = function() { return };
    $('terms_button').onclick = function() { return };
    $('info_button').onclick = function() { return };
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});