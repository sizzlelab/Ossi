ossiFloater = {

  init: function(channelID, groupID){
  
    var OSSI_INSTANCE_URL = 'http://ossi/';
    
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
    div.style.background = '#222';
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
    closeButton.style.cursor = 'move';
    var clickCount = 0;
    var dragMode = false;
    closeImage.setAttribute('id', 'ossi-close-image');
    closeImage.style.paddingTop = '8px';
    closeImage.style.cursor = 'pointer';
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
    
    document.onmousedown = function(e){
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

        // create blocker
        var blocker = document.createElement('div');
        blocker.style.position = 'absolute';
        blocker.style.top = '0px';
        blocker.style.left = '0px';
        blocker.style.zIndex = '999999999';
        blocker.setAttribute('id','ossi-temporary-blocker');
        div.appendChild(blocker);
        blocker.innerHTML = '<img src="'+OSSI_INSTANCE_URL+'/images/s.png" height="'+WIDGET_VIEWPORT.height+'" width="'+WIDGET_VIEWPORT.width+'" border="0" />';
//        blocker.innerHTML = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
      }

      // disable selecting
		  document.onselectstart = function () { return false; } // ie
		  return false; // mozilla
    }
    
    document.onmousemove = function(e){
      if (dragMode) {
        var x = ie ? event.clientX : e.clientX;
        var y = ie ? event.clientY : e.clientY;

        x -= (parseInt(closeButton.offsetWidth)+parseInt(div.offsetWidth)-diffX);
        y -= (parseInt(closeButton.offsetHeight)+parseInt(div.offsetHeight)-diffY);
        y = y>0 ? y : 0;

        div.style.top = y + 'px';
        div.style.left = x + 'px';
      }
    };
    
    document.onmouseup = function(e){
      var p = document.getElementById('ossi-float');
      var c = document.getElementById('ossi-temporary-blocker');
      p.removeChild(c);
      dragMode = false;

		  document.onselectstart = function () { return; } // ie
    };

    // Loading done, show screen!
    div.style.display = 'block';
  }
}
