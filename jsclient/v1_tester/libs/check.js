function assertEquals( message, param1, param2 ) {
	if( param1 != param2 ) {
		http_request( 'GET' , './log.php?error=' + message, null, function() {} );
	}
}

function assertNotNull( message, param1 ) {
	if( param1 == null )  {
		http_request( 'GET' , './log.php?error=' + message, null , function() {} );
	}
}
