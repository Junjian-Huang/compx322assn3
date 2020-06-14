<?php
			//decode packet since packet is Json format
    $_POST = json_decode(file_get_contents('php://input'),true);

			//data from Html packt abstrac data from packet
    $lati = $_POST["lati"];
    $longi = $_POST["longi"];

				//base link
    $Base_URL = "https://api.sunrise-sunset.org/json?";

				//group up components
    $location = 'lat='.$lati.'&lng='.$longi;

		//define the URL
		// this is the web service end point URL
		//including all parameters
    $request = $Base_URL.$location;

		//initialise the connection for the given URL
		//and return a handle to that session or
		//FALSE if not successful
    $connection = curl_init($request);	

		//configure the connection
		// here we just configure a single option
		// CURLOPT_RETURNTRANSFER with the parameter true which
		//returns the response as a string
    curl_setopt($connection, CURLOPT_RETURNTRANSFER, true);

		//make the request and get the response
    $response = curl_exec($connection);

		//close the connection
    curl_close($connection);

   	//return the result as json
    echo $response;
