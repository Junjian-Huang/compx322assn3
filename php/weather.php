<?php
	$lati = $_POST["lat"];
	$longi = $_POST["lng"];

			//define the URL
			// this is the web service end point URL
			//including all parameters
	$request = "https://api.openweathermap.org/data/2.5/weather?lat=".$lati."&lon=".$longi."&units=metric&mode=xml&appid=e6929d89f31f943b5f4e0e5131d6106a";

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

			//Takes the response and converts it to a  SimpleXMLElement object
	$xml=simplexml_load_string($response) or die("Error: Cannot create object");

				//Sets the MIME type of the response heade
	header('Content-type: text/xml');

			//print content on html
	echo $xml->asXML();
