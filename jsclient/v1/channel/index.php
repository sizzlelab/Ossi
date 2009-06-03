<?php

# load extras
require_once "HTTP/Request.php";

# parameters
$CHANNELS_PATH = '/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/bzFvEETj8r3yz7aaWPfx7J'; // on beta.sizl.org
#$CHANNELS_PATH = '/appdata/cWslSQyIyr3yiraaWPEYjL/@collections/bzFvEETj8r3yz7aaWPfx7J'; // on alpha.sizl.org
$BASE_URL = 'http://cos.sizl.org/'; // BASE URL

# functions
function do_get($url) {
  $req = new HTTP_Request($url);
  $response = $req->sendRequest();

  if (PEAR::isError($response)) {
    return false;
  } else {
    return $req->getResponseBody();
  }
}

function do_post($url, $data = null) {
  $req = new HTTP_Request($url);
  $req->setMethod(HTTP_REQUEST_METHOD_POST);
  foreach ($data as $name=>$value) {
    $req->addPostData($name, $value);
  }
  $response = $req->sendRequest();

  if (PEAR::isError($response)) {
    return false;
  } else {
    print $response->getResponseHeader('Set-Cookie');
    return $req->getResponseBody();
  }
} 

# login with ossi application
print do_post($BASE_URL."/session", array('app_name' => 'ossi', 'app_password' => 'Z0ks51r'));
print do_get($BASE_URL.$CHANNELS_PATH);

?>