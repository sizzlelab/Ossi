function assertEquals( message, param1, param2 ) {
	if( param1 != param2 ) {
		// do a post to error.log
		alert(message);
	}
}

function assertNotNull( message, param1 ) {
	if( param1 == null )  {
		alert(message);
	}
}
