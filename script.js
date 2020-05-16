$(document).ready(function () {

    // On click of Search or city list
    $('#getWeather,#past-cities').on('click', function () {
        // get location from user input if seearch event
        // or get location from city history if click event from history list
        let eventTGT = $(event.target)[0];
        let location = "";
        if (eventTGT.id === "getWeather" || eventTGT.id === "getWeatherId") {
          location = $('#city-search').val().trim().toUpperCase();
        } else if ( eventTGT.className === ("cityList") ) {
          location = eventTGT.innerText;
        }
        if (location == "") return;
        // update City in local storage, pass location
        updateCityLocalStore(location);
        // get current weather for searched location, pass location
        getCurrWeather(location);
        // get forecast for searched location, pass location
        getForecastWeather(location);
       });
 
    // Convert Unix timestampe to useable format - See epochconvert.com/programming/javascript
    function convertDate(epoch) {
      let useableDate = [];
      // use Javascript Date() function to parse date into useable format
      let myDate = new Date(epoch * 1000);
      useableDate[0] = (myDate.toLocaleString());
      // need [1] for MM/DD/YYY format
      useableDate[1] = ((myDate.toLocaleString().split(", "))[0]);
      useableDate[2] = ((myDate.toLocaleString().split(", "))[1]);
      // return array, but MM/DD/YYY format will is primary need
      return useableDate;
    }

    // Get current user location
    function getCurrLocation() {
        // set location to null
        let location = {};
        // get latitude and longitude
        function success(position) {
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            success: true
          }
          // Get current conditions for current location
          getCurrWeather(location);
          // Get forecast for local conditions 
          getForecastWeather(location);
        }
        // console.log if location is unavailable
        function error() {
          location = { success: false }
          console.log('Could not get location');
          return location;
        }
        // console.log if browswer doesn't support location
        if (!navigator.geolocation) {
          console.log('Geolocation is not supported by your browser');
        } else {
          navigator.geolocation.getCurrentPosition(success, error);
        }
      }

    // Get current locaation weather
    function getCurrWeather(loc) {
        // start by rendering history from local storage
        renderHistory();
        
        // reset search value to null
        $('#city-search').val("");
        
        // determine if search is based upon city name or lat/lon
        if (typeof loc === "object") {
          city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
          city = `q=${loc}`;
        }
        
        // Set up Open Weather API Query - weather request 
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;
        
        // Open weather API query - weather request
        $.ajax({
            url: openCurrWeatherAPI,
            method: "GET"
        }).then(function (response1) {
        
        // load result into weatherObj
        weatherObj = {
            city: `${response1.name}`,
            wind: response1.wind.speed,
            humidity: response1.main.humidity,
            temp: response1.main.temp,
            // convert date to usable format [1] = MM/DD/YYYY Format
            date: (convertDate(response1.dt))[1],
            icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
            desc: response1.weather[0].description
        }

        // render current waeather passing weatherObj
        renderCurrWeather(weatherObj);

        // get uvi index - pass query result
        getUvIndex(response1);
        });
    }

    // get 5 day forecast
    function getForecastWeather(loc) {
        console.log (loc);

        // determiing the type of request.. if an object, we have lat/lon, use it
        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
            console.log (city);
          // else call api using city name 
        } else {
            city = `q=${loc}`; }
        
        // Set up Open Weather API Query - weather request 
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrWeatherAPI2 = currentURL + cityName + unitsURL + apiIdURL + apiKey;
        console.log (openCurrWeatherAPI2)
        
        // Open weather API query - weather request
        $.ajax({
            url: openCurrWeatherAPI2,
            method: "GET",
        }).then(function (response4) {
        
        console.log (response4);

        // capture lat/lon for subsequent request
        var cityLon = response4.coord.lon;
        var cityLat = response4.coord.lat;
        // set city with lat/long
        city = `lat=${cityLat}&lon=${cityLon}`;
        
        console.log(city);
        
        // get five days with longitude and latitude - send lon/lat (w city variable)
        getFiveDays(city);
        });        
    }
    
    // Get five days of weather history using longitude and latitude
    function getFiveDays(city) {
      console.log(city);
      // array to hold all the days of results
      let weatherArr = [];
      let weatherObj = {};

      // Initiate API Call to get current weather... use onecall request
      var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
      var cityName = city;
      console.log(city);
      var exclHrlURL = "&exclude=hourly";
      var unitsURL = "&units=imperial";
      var apiIdURL = "&appid=";
      var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
      var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + apiKey;
      console.log (openFcstWeatherAPI);

      // Open weather api... onecall request
      $.ajax({
          url: openFcstWeatherAPI,
          method: "GET"
      }).then(function (response2) {
        console.log (response2);
        // load weatherObj from response... only a history of 5 days needed
        for (let i=1; i < (response2.daily.length-2); i++) {
          let cur = response2.daily[i]
          weatherObj = {
              weather: cur.weather[0].description,
              icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
              minTemp: cur.temp.min,
              maxTemp: cur.temp.max,
              humidity: cur.humidity,
              uvi: cur.uvi,
              // convert date to usable format [1] = MM/DD/YYYY Format
              date: (convertDate(cur.dt))[1]
          };
          // push day to weatherArr
          weatherArr.push(weatherObj);
      }
      // render forecast on page
      renderForecast(weatherArr);
    });

  }
    // render current weather on page
    function renderCurrWeather(currCity) {
        console.log (currCity);
        // remove the current forecast
        $('#forecast').empty(); 
        // render the current search city
        $('#cityName').text(currCity.city + " (" + currCity.date + ")");
        // render the current search city weather icon
        $('#currWeathIcn').attr("src", currCity.icon);
        // render the current search city temp
        $('#currTemp').text("Temp: " + currCity.temp + " F");
         // render the current search city humidity
        $('#currHum').text("Humidity: " + currCity.humidity + "%");
        // render current city search wind speed
        $('#currWind').text("Windspeed: " + currCity.wind + " MPH");      
        // note.. UVI called in seperate function
      }

      // render 5 day forecast on page
      function renderForecast(cur) {

        for (let i = 0; i < cur.length; i++) {
          let $colmx1 = $('<div class="col mx-1">');
          let $cardBody = $('<div class="card-body forecast-card">');
          let $cardTitle = $('<h6 class="card-title">');
          $cardTitle.text(cur[i].date);
    
          // format HTML UL Tag
          let $ul = $('<ul>'); 
          // format HTML image
          let $iconLi = $('<li>');
          let $iconI = $('<img>');
          $iconI.attr('src', cur[i].icon);

          // format HTML for Weather Description
          let $weathLi = $('<li>');
          $weathLi.text(cur[i].weather);
          // format HTML for Min Temp
          let $tempMinLi = $('<li>');
          $tempMinLi.text('Min Temp: ' + cur[i].minTemp + " F");
          // format HTML for Max Temp
          let $tempMaxLi = $('<li>');
          $tempMaxLi.text('Max Temp: ' + cur[i].maxTemp + " F");
          // format HTML for humidity
          let $humLi = $('<li>');
          $humLi.text('Humidity: ' + cur[i].humidity + "%");
    
          // append icon
          $iconLi.append($iconI);
          $ul.append($iconLi);
          // append weather description
          $ul.append($weathLi);
          // append temp min
          $ul.append($tempMinLi);
          // append temp max
          $ul.append($tempMaxLi);
          // append temp humidity
          $ul.append($humLi);
          // append date
          $cardTitle.append($ul);
          // append card title
          $cardBody.append($cardTitle);
          // append card body
          $colmx1.append($cardBody);
    
          $('#forecast').append($colmx1);
        }
      }
    
    // get UVI from open weather using UVI Query and format UVI on current weather
    function getUvIndex(uviLocation) {
        // Since UVI request searches based upon lat/long, define city using lat/lon
        city = `&lat=${parseInt(uviLocation.coord.lat)}&lon=${parseInt(uviLocation.coord.lon)}`;

        // Initiate API Call to get current weather... use UVI request
        var uviURL = "https://api.openweathermap.org/data/2.5/uvi";
        var apiIdURL = "?appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var cityName = city;
        var openUviWeatherAPI = uviURL + apiIdURL + apiKey + cityName;
        // open weather call... UVI request
        $.ajax({
            url: openUviWeatherAPI,
            method: "GET"
        }).then(function(response3) {
        
        // initiate background as violet
        let backgrdColor = "violet";
        // load respone into UviLevel variable
        let UviLevel = parseFloat(response3.value);

        // determine backgrouind color depending on value
        if (UviLevel < 3) { 
            backgrdColor = 'green';
            } else if (UviLevel < 6) { 
            backgrdColor = 'yellow';
            } else if (UviLevel < 8) { 
            backgrdColor = 'orange';
            } else if (UviLevel < 11) { 
            backgrdColor = 'red';
            }     
        // insert UVI Lable and value into HTML
        let uviTitle = '<span>UV Index: </span>';
        let color = uviTitle + `<span style="background-color: ${backgrdColor}; padding: 0 7px 0 7px;">${response3.value}</span>`;
        $('#currUVI').html(color);
        }); 
    }

    // update city store in local storage
    function updateCityLocalStore(city) {
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        cityList.push(city); 
        cityList.sort();
        // removes dulicate cities
        for (let i=1; i<cityList.length; i++) {
            if (cityList[i] === cityList[i-1]) cityList.splice(i,1);
        }
        //stores in local storage
        localStorage.setItem('cityList', JSON.stringify(cityList));
    };

    // function to pull city history from local memory - citylist 
    function renderHistory() {
        // JSON parse to pull from local storage 
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
        // build dive for each history location - link to HTML ID="past-cities"
        $('#past-cities').empty();
        // calls for each row of the CityList array
        cityList.forEach ( function (city) {
          // add div tag
          let cityHistoryNameDiv = $('<div>');
          // add class of "cityList"
          cityHistoryNameDiv.addClass("cityList");
          // add the City Value from local storage
          cityHistoryNameDiv.attr("value",city);
          // appends div to next row in past-cities
          cityHistoryNameDiv.text(city);
          $('#past-cities').append(cityHistoryNameDiv);
        });
      };

    // will get location when page initializes
    var location = getCurrLocation();
  });