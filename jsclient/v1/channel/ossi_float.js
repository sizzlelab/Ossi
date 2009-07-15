ossiFloater = {

  init: function(channelID, groupID){
  
    var WIDGET_VIEWPORT = {
      height: 428,
      width: 313
    };
    // CHeck IE
    var ie = document.all ? true : false;

    // Initial container div
    var div = document.createElement('div');
    div.style.display = 'none';
    div.style.position = 'absolute';
    div.style.top = '100px';
    div.style.left = '100px';
    div.style.background = '#000';
    div.style.padding = '10px';
    div.style.height = WIDGET_VIEWPORT.height;
    div.style.width = WIDGET_VIEWPORT.width;
    div.setAttribute('id', 'ossi-float');
    document.body.appendChild(div);
    // Show/hide button
    var closeButton = document.createElement('div');
    closeButton.innerHTML = 'O<br/>S<br/>S<br/>I<br/>';
    closeButton.setAttribute('id', 'ossi-float-button');
    var closeImage = document.createElement('img');
    closeImage.setAttribute('src', '../images/ossi_minimize_button.png');
    closeButton.appendChild(closeImage);
    closeButton.style.position = 'absolute';
    closeButton.style.right = '-29px';
    closeButton.style.top = '10px';
    closeButton.style.width = '25px';
    closeButton.style.height = '90px';
    closeButton.style.background = '#555';
    closeButton.style.color = '#ff8a21';
    closeButton.style.fontFamily = 'helvetica';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.fontSize = '14px';
    closeButton.style.textAlign = 'center';
    closeButton.style.paddingTop = '10px';
    closeButton.style.border = 'solid #444 2px';
    var clickCount = 0;
    closeButton.onclick = function(){
      clickCount++;
      if (clickCount % 2 == 0) {
        ossi.style.display = 'inline';
	div.style.padding = '10px';
	div.style.width = WIDGET_VIEWPORT.width + 'px';
        closeImage.setAttribute('src', '../images/ossi_minimize_button.png');
      }
      else {
        ossi.style.display = 'none';
	div.style.width = 0;
        closeImage.setAttribute('src', '../images/ossi_maximize_button.png')
        div.style.left = 0;
	div.style.padding = 0;
      }
    };
    div.appendChild(closeButton);
    // Ossi iframe
    var ossi = document.createElement('iframe');
    ossi.setAttribute('src', './index.html?channelId=' + channelID);
    ossi.setAttribute('height', WIDGET_VIEWPORT.height);
    ossi.setAttribute('width', WIDGET_VIEWPORT.width);
    ossi.setAttribute('frameborder', 0);
    div.appendChild(ossi);
    
    var tragMode = false;
    document.onmousedown = function(e){
      var id = '';
      id = ie ? window.event.srcElement.id : e.target.id;
      if (id == 'ossi-float-button'  || id == 'ossi-float') {
        tragMode = true;
      }
    }
    
    document.onmousemove = function(e){
      if (tragMode) {
	var x = ie ? event.clientX : e.clientX;
	var y = ie ? event.clientY : e.clientY;
	// set different x's and y's when ossi is shown
	if( ossi.style.display != 'none' ) {
		y -= 10;
		x -= WIDGET_VIEWPORT.width;
		x -= 20;
	}
        div.style.top =  (y - 90 ) + 'px';
        div.style.left = (x - 30 ) + 'px';
      }
    };
    
    document.onmouseup = function(e){
      tragMode = false;
    };
    
    // Loading done, show screen!
    div.style.display = 'block';
  }
}
