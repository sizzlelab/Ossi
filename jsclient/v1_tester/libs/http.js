// Common HTTP request components

function http_request( method, url, parameters, f ){
        // from Wikipedia:
	if( typeof XMLHttpRequest == "undefined" ) XMLHttpRequest = function() {
	  	try { return new ActiveXObject("Msxml2.XMLHTTP.6.0") } catch(e) {}
  		try { return new ActiveXObject("Msxml2.XMLHTTP.3.0") } catch(e) {}
  		try { return new ActiveXObject("Msxml2.XMLHTTP") } catch(e) {}
  		try { return new ActiveXObject("Microsoft.XMLHTTP") } catch(e) {}
  		throw new Error( "This browser does not support XMLHttpRequest." )
	};
	// end of Wikipedia (Handling old Explorers)
        http = new XMLHttpRequest();
        // parameters need to be encoded
        http.open( method , url, true);
	http.onreadystatechange = function() { 
		if( http.readyState == 4 ) {
			response = '';
			if( http.responseText != '' ) {
               			 response = eval( '(' + http.responseText + ')' );
        		}
			f();
		}
	};
        if( parameters != null ) {
                http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                http.setRequestHeader("Content-length", parameters.length);
                http.setRequestHeader("Connection", "close");
                http.send( http_parameter( parameters ) );
        } else {
               http.send( null );
        }
}

function http_parameter( object ) {
        ret = '';
        for( element in object ){
                if( ret != '' ) { ret += '&'; }
                ret += escape( element ) + '=' + escape( object[element] );
        }
        return ret;
}

