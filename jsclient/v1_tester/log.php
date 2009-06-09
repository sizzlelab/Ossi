<?php
	$browser = $_SERVER['HTTP_USER_AGENT'];
	$error = '';
	if( isset( $_GET['error'] ) ) {
		$error = $_GET['error'];
		$res = fopen( 'log.file' , 'a+' );
		$string = $browser.' '.$error."\n";
		fwrite( $res , $string );
		fclose( $res );
	 } else { 
                header( 'Location: ./log.file' ) ;
        }

?>
