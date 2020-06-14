
//initialize map ............
var mymap;

function setMap(){
    mymap = L.map('mapid').setView([-36.853467, 174.765551], 13);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        accessToken: 'pk.eyJ1Ijoienk4MyIsImEiOiJja2I1eHZneDUxOW9iMnJwN3lwZGFubzZiIn0.s3L5ts0zHKeUZgNJ8Si6Bw'
    }).addTo(mymap);
}

function initialiseGeocoder() {
  	setMap();
}
// .................. initialize map end


//get content from textbox and create fetch URL, set return respone in Json format,send to server....................
requestLongiAndlati = function(){
    //get data from user input textbox, send request to web server
    //server will send back the location's latitude and longitude
    var inputLocation = document.getElementById("inputDataTextBox").value;
    var country = "NZ";
    if(inputLocation == "")
    {
      alert("Please type a city name.");
      document.getElementById("inputDataTextBox").focus();
      return;
    }
    else {
        fetch("https://www.mapquestapi.com/geocoding/v1/address?key=omVWTjpjO6oX4CY3xUPvNxiNRz7cQ1gp&inFormat=kvp&outFormat=json&location=" + inputLocation + " " + country + "&thumbMaps=false",{method:'post'})
        .then(response => response.json())
        .then(json => dealWithReturnResult(json),handleError);//parses the response Json to method, deal with display response
    }
}
//....................get content from textbox and create fetch URL, set return respone in Json format,send to server


// Error handling for Fetch request.............
function handleError(errStat){
alert("Could not get data " + errStat);
}
//.............Error handling for Fetch request


//find out latitude, longitude from respone message and change city's location on map...........
dealWithReturnResult = function(jsonDataFromApi){

    var countryFromResponse = jsonDataFromApi.results[0].locations[0].adminArea1;

     if(countryFromResponse.valueOf() == 'NZ'.valueOf())
      {
      		//use JSON.stringify() to retrieve longi and lati from Json response
      	var lati = jsonDataFromApi.results[0].locations[0].latLng.lat;
      	var longi = jsonDataFromApi.results[0].locations[0].latLng.lng;

      			//set the map to new location
      	mymap.setView([lati, longi], 13);

      			//get city name from the respone data
      	var cityName = jsonDataFromApi.results[0].locations[0].adminArea5;

      			//show sunrise/sunset time
      	requestSunrise(cityName,lati,longi);

      	var dataForAjx = "lat=" + lati + "&lng=" + longi;
      	_ajaxRequest("POST","./php/weather.php",dataForAjx,weatherRetrieve)

      			//build an object to save data
      	var city = new City(cityName,lati,longi);

        	  	      //if new input city not in list
        	if(_isExist(city.getName())==false)
        	 {
        		 	//add new city into cityList
        	     cityList.push(city);
        	 }
          		//update list on html page
          	updateList();
      }
     else
      {alert("Please input city name only in New Zealand");}
}
//.............find out latitude, longitude from respone message and change city's location on map


      //use Ajax function
var _request = new XMLHttpRequest();

      //create global variables to disdinguish which city is current clicked
var curCity = "";
var cityList = new Array();; //create a list to store all cities


//create city object, store cities information(name,longi,lati)....................
function City(name, lati, longi){
	         //private field
	var _name = name;
	var _lati = lati;
	var _longi = longi;

	var _dom_element;

	var _createUI = function(){
		_dom_element = document.createElement('ul');
		_dom_element.className = "Cities";
		_dom_element.innerHTML = _name;

		  _dom_element.onclick = function(){
                  mymap.setView([_lati, _longi], 13);
  					                            //parse data into this method
                  requestSunrise(_name, _lati, _longi);

        				//packing data into a variable
        		var dataForAjx = "lat=" + _lati + "&lng=" + _longi;
        		_ajaxRequest("POST","./php/weather.php",dataForAjx,weatherRetrieve)
      };
	}

		//geters and setters
	this.getDomElement = function(){
            return _dom_element;
        }

	this.getName = function(){
            return _name;
        }

	this.getLati = function(){
            return _lati;
        }

	this.getLongi = function(){
            return _longi;
        }

	_createUI();
}
//....................create city object, store cities information(name,longi,lati)



//collect city name,lati,longi in this method and send to php server..............
requestSunrise = function(name, lati, longi){
	var url = "./php/sunApi.php";
	curCity = name;
			//make the Fetch request using 'post' and make the response as Json format
		fetch(url,{
			   method:'post',
			   headers:{'Content-Type': 'application/json',},
					//pass parameters to php server
			   body:JSON.stringify({lati:lati,longi:longi})
		           }
		)
		.then(response => response.json())
		.then(json => sunRiseInfo(json),handleError);
}
//..............collect city name,lati,longi in this method and send to php server


//display return respone which are sunrise/sunset message on html.............
sunRiseInfo = function(sunRiseMessage){
      //get the location of the html element
    var displayData = document.getElementById("sunInfor");

            //retrieve data from Json respone packet
    var sunrise = sunRiseMessage.results.sunrise;
    var sunset = sunRiseMessage.results.sunset;

            //get the first content [7:30;20] in sunRise/sunSet [7:30:20 PM], because
            //the time zone is different,so need to change the sunSet and sunRise that match the AM/PM
    var sunRiseDisplay = sunrise.substr(0,sunrise.indexOf(' '));
    var sunSetDisplay = sunset.substr(0,sunset.indexOf(' '));

    //display data on html
    displayData.innerHTML = curCity + " Currently: Sun rises at " + sunRiseDisplay + " AM and Sun sets at " + sunSetDisplay + " PM";
}
//.............display return respone which are sunrise/sunset message on html


//Ajax request frame to initialise........................
_ajaxRequest = function(method, url, data, callback){
    _request.onreadystatechange = callback;
    _request.open("POST", url, true);
    _request.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    _request.send(data);
}
//........................Ajax request frame to initialise


//retrieve data from respone xml packet and display data on HTML...............
weatherRetrieve = function(){
	if(_request.readyState == 4)
  	 {
	     if(_request.status == 200){
    		  let response = _request.responseXML;

    		         //find out weather tag from XML response, extract it into variable
    		  var weatherTagFromResponse = response.getElementsByTagName("weather")[0];

    			  //extract weather data from abover
    		  var weatherDataToDisplay = weatherTagFromResponse.getAttribute("value");

    		  var htmlElement = document.getElementById("weather");

    		  if(weatherDataToDisplay != null)
    		    {
        				//find out temperature tag from XML response, extract it into variable
        			var temperatureTagFromResponse = response.getElementsByTagName("temperature")[0];

        			         //extract temperature data from abover
        			var minTemperatureDataToDisplay = temperatureTagFromResponse.getAttribute("min");
        			var maxTemperatureDataToDisplay = temperatureTagFromResponse.getAttribute("max");

        			htmlElement.innerHTML = "outlook : " + weatherDataToDisplay + ", max temp : " + maxTemperatureDataToDisplay + " , min temp : " + minTemperatureDataToDisplay;
		        }
		       else
		        {
          			var cityTagFromResponse = response.getElementsByTagName("City")[0];
          			var cityName = cityTagFromResponse.getAttribute("name");

          			htmlElement.innerHTML = "Weather information unavailable in" +  cityName;
		         }
	      }
	      else{
 		       alert(_ajaxRequest.statusText);
	      }
	 }

}
//.................retrieve data from respone xml packet and display data on HTML


//method to check new city is in cityList or not....................
function _isExist(newCity){
    for(var i = 0; i < cityList.length; i++){
        var city = cityList[i].getName();
        if(city == newCity){
            return true;
        }
    }
    return false;
}
//....................method to check new city is in cityList or not


//update cityList and display all cities on HTML page..................
updateList = function(){
	var currentSearch = document.getElementById('searchesRecord');

	if (currentSearch==null)
	 {
		   return;
	 }
			// if the list has content
	 while(currentSearch.hasChildNodes())
	   {
  				//remove the content in the list
  		  currentSearch.removeChild(currentSearch.lastChild);
	   }

			//loop through all content in list
	for(var i = 0; i < cityList.length; i++)
	 {
	    var cities = cityList[i];
			     //put all content in list on html
	    currentSearch.appendChild(cities.getDomElement());
	 }

}
//..................update cityList and display all cities on HTML page
