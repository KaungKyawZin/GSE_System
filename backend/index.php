<?php

if(!file_exists("installed.lock")){

    require "config/install.php";

    file_put_contents("installed.lock","installed");

}

echo "Backend Running";