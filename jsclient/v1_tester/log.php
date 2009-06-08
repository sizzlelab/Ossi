<?php
	$browser = $_SERVER['HTTP_USER_AGENT'];
	$error = '';
	if( isset( $_POST['error'] ) ) {
		$error = $_POST['error'];
	}
	$res = fopen( 'log.file' , 'a+' );
	$string = $browser.' '.$error.'\n';
	fwrite( $res , $string );
	fclose( $res );
?>
