// Common HTTP request components

function http_request( method, url, parameters, f ){
        // this should be a smart selector...
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

function sleep( ms ) {
	time = new Date();
	nowTime = new Date();
	while( nowTime - time < ms ) {
		nowTime = new Date();
	}
}
