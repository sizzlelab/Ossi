/**
* ossi information class
*/
ossi.information = Class.create(ossi.base,{
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
      this.pane = $('informationpane');
    } else {
      alert('ossi.information._draw() failed! this.options.hostElement not defined!');
    }
  },
  _getHTML: function() {
    var h =   '\
          			<div id="informationpane" style="display:none; position:absolute; top:0px; left:0px; width:100%">\
          				<div id="information_Ossi" style="margin:20px 10px 20px 10px">\
                    <h2>INFORMATION FOR PARTICIPANTS IN A SCIENTIFIC RESEARCH</h2>\
                    <p>This document describes the purpose, progress and other aspects of the study in question, as required by the ethical rules of research on human subjects, and as decreed by the HIIT Ethical Committee. The Ethical Committee has granted approval for human research to be carried out in the study for the purposes given in this document and for the methods listed in it.</p>\
                    <h3>Invitation</h3>\
                    <p>You are invited to take part in a scientific user study led by Professor Martti Mäntylä of the Helsinki Institute for Information Technology (HIIT), a joint research institution of the Helsinki University of Technology and the University of Helsinki. The study forms a part of the OtaSizzle project in the MIDE Programme of Helsinki University of Technology. You are a suitable test subject if you are a male or female over the age of 18 who uses a mobile phone and/or Internet services. The study involves several test subjects. Participation is voluntary.</p>\
                    <h3>Purpose of the Research</h3>\
                    <p>In line with the project to which it belongs, this study examines social media services. By collecting information on our test subjects, we hope to learn what is most important for service users. The ultimate aim of the study is to produce results that can be used in designing and creating better services.</p>\
                    <h3>Risks and Discomfort</h3>\
                    <p>The methods used during the study present no greater risk to the subjects than normal use of computers and mobile phones does. In the study’s interviews and questionnaires you are entitled to skip any questions you are uncomfortable with. Our researchers also observe users’ actions “in the field”, in their daily lives. The observers will introduce themselves in advance to test subjects and tell them about the research and their methods. If the observation makes you uncomfortable, the researchers can stop observing you on request.</p>\
                    <h3>Benefits for Participants and the Community</h3>\
                    <p>We strive to make the tested services at least partially useful, so that participants in the study will receive some benefit from using them. There is no other particular benefit from participating in the study. Although you receive no personal gain from participating, we believe that by taking part you will help to produce information that will lead to better services being designed and offered in the future.</p>\
                    <h3>Confidentiality</h3>\
                    <p>During the study, we will collect data on you and your use of services. Data is collected by asking you directly and observing your actions, but also by using unnoticeable programs installed on mobile phones and computers. All the data collected on you during the study is treated confidentially and is never disclosed to third parties without express consent from you, unless it is required by law. If you are using SP360 software, Nokia has access to the data collected by the software, as described in the SP360 consent document. Data related to you is only used in combination with other data. In the analysis, data will be collated using phone numbers, IMEI codes and other identifiers. All identifying data will be destroyed at the latest at the end of this five-year project; earlier, if possible in practice. Whenever the study’s outcomes are published or processed scientifically or otherwise, individual test subjects will not be mentioned, nor can they be identified from the data. HIIT holds a public data file description that determines how data is processed, stored and eventually destroyed.</p>\
                    <p>This research complies with the Finnish Personal Data Act (523/1999), which is based on EU legislation.</p>\
                    <h3>Participation and Cancellation</h3>\
                    <p>Participation in the study is completely voluntary. If you decide to take part in the study, you have the right to cancel your participation at any time, without any consequences. You also have the right not to answer any questions you don\'t want to answer, and still continue participating in the study. In the unlikely event that the circumstances should require it, the Research Director has the right to cancel your participation.</p>\
                    <h3>Researchers’ Contact Details</h3>\
                    <p>For more information on the study or in case of any questions, please contact:</p>\
                    <p>Helsinki University of Technology, Helsinki Institute for Information Technology</p>\
                    <p>Research Director:<br />\
                    Professor Martti Mäntylä<br />\
                    Tel.: +358 (0)9 4511<br />\
                    Email:martti.mantyla@hiit.fi</p>\
                    <p>Practical matters:<br />\
                    Project Manager Olli Pitkänen<br />\
                    Tel.:+358 (0)9 4511 <br />\
                    Email:olli.pitkanen@hiit.fi</p>\
                  </div>\
          				<div class="nav_button">\
          					<a id="back_button" class="nav_button_text" href="javascript:void(null);">Back</a>\
          				</div>\
          			</div>\
          		';
    return h;
  },
  _backHandler: function() {
    this.options.backCase.apply();
  },
  _addListeners: function() {
    $('back_button').onclick = this._backHandler.bindAsEventListener(this);
  },
  _removeListeners: function() {
    $('back_button').onclick = function() { return }
  },
  destroy: function () {
    this._removeListeners();
    this.pane.remove();
  }
});