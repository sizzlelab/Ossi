// Common HTTP request components

function http_request( method, url, parameters ){
        // this should be a smart selector...
        http = new XMLHttpRequest();
        // parameters need to be encoded
        http.open( method , url, false);
        if( parameters != null ) {
                http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                http.setRequestHeader("Content-length", parameters.length);
                http.setRequestHeader("Connection", "close");
                http.send( http_parameter( parameters ) );
        } else {
               http.send( null );
        }
        while( http.readyState != 4 ) {
                // this is syncronous method
        }
        if( http.responseText != '' ) {
                return eval( '(' + http.responseText + ')' );
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

