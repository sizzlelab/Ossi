function assertEquals( message, param1, param2 ) {
	if( param1 != param2 ) {
		// do a post to error.log
		http_request( 'GET' , './log.php?error=' + message, null);
	}
}

function assertNotNull( message, param1 ) {
	if( param1 == null )  {
		http_request( 'GET' , './log.php?error=' + message, null);;
	}
}
