ossiFloater = {

  init: function(channelID, groupID){
  
    var OSSI_INSTANCE_URL = 'http://labs.humanisti.fixme.fi/sizzle/ossi/jsclient/v1/';
    
    var WIDGET_VIEWPORT = {
      height: 428,
      width: 313
    };
    
    // init coordinate calc placeholders
    var diffX, diffY, restoreX;
    var hidden = false;
    
    // Check IE
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
    closeImage.setAttribute('src', OSSI_INSTANCE_URL + '/images/ossi_minimize_button.png');
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
    var dragMode = false;
    closeImage.setAttribute('id', 'ossi-close-image');
    closeImage.style.paddingTop = '8px';
    closeImage.onclick = function(){
      if (!dragMode) {
        if (hidden) {
          closeImage.setAttribute('src', OSSI_INSTANCE_URL + '/images/ossi_minimize_button.png');
          div.style.left = restoreX+'px';
          hidden = false;
        } else {
          closeImage.setAttribute('src', OSSI_INSTANCE_URL + '/images/ossi_maximize_button.png')
          restoreX = parseInt(div.offsetLeft);
          div.style.left = -div.offsetWidth+'px';
          hidden = true;
        }
      }
    };
    div.appendChild(closeButton);
    // Ossi iframe
    var ossi = document.createElement('iframe');
    ossi.setAttribute('src', OSSI_INSTANCE_URL + '/index.html?channelId=' + channelID);
    ossi.setAttribute('height', WIDGET_VIEWPORT.height);
    ossi.setAttribute('width', WIDGET_VIEWPORT.width);
    ossi.setAttribute('frameborder', 0);
    div.appendChild(ossi);
    
    window.onmousedown = function(e){
      var id = '';
      id = ie ? window.event.srcElement.id : e.target.id;
      if (id == 'ossi-float-button') {
        closeImage.setAttribute('src', OSSI_INSTANCE_URL + '/images/ossi_minimize_button.png');
        hidden = false;
        var x = ie ? event.clientX : e.clientX;
        var y = ie ? event.clientY : e.clientY;
        diffX = (parseInt(div.offsetLeft)+parseInt(closeButton.offsetWidth)+parseInt(div.offsetWidth))-x;
        diffY = (parseInt(div.offsetTop)+parseInt(closeButton.offsetHeight)+parseInt(div.offsetHeight))-y;
        dragMode = true;
      }
    }
    
    window.onmousemove = function(e){
      if (dragMode) {
        var x = ie ? event.clientX : e.clientX;
        var y = ie ? event.clientY : e.clientY;

        x -= (parseInt(closeButton.offsetWidth)+parseInt(div.offsetWidth)-diffX);
        y -= (parseInt(closeButton.offsetHeight)+parseInt(div.offsetHeight)-diffY);

        // set different x's and y's when ossi is shown
        if (ossi.style.display != 'none') {
//          y -= 10;
//          x -= WIDGET_VIEWPORT.width;
//          x -= 20;
        }
        div.style.top = y + 'px';
        div.style.left = x + 'px';
      }
    };
    
    window.onmouseup = function(e){
      dragMode = false;
    };
    
    // Loading done, show screen!
    div.style.display = 'block';
  }
}
