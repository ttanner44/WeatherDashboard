$(document).ready(function () {

    $('#getWeather,#past-cities').on('click', function () {
        // get location from user input box
        let e = $(event.target)[0];
        let location = "";
        if (e.id === "getWeather" || e.id === "getWeatherId") {
          location = $('#city-search').val().trim().toUpperCase();
        } else if ( e.className === ("cityList") ) {
          location = e.innerText;
        }
        if (location == "") return;
        updateCityStore(location);
        getCurWeather(location);
        getForecastWeather(location);
       });
    
    function convertDate(epoch) {
      // function to convert unix epoch to local time
      let readable = [];
      let myDate = new Date(epoch * 1000);
      readable[0] = (myDate.toLocaleString());
      readable[1] = ((myDate.toLocaleString().split(", "))[0]);
      readable[2] = ((myDate.toLocaleString().split(", "))[1]);
      return readable;
    }

    function getCurLocation() {
        let location = {};
        function success(position) {
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            success: true
          }
          getCurWeather(location);
          getForecastWeather(location);
        }
    
        function error() {
          location = { success: false }
          console.log('Could not get location');
          return location;
        }
        if (!navigator.geolocation) {
          console.log('Geolocation is not supported by your browser');
        } else {
          navigator.geolocation.getCurrentPosition(success, error);
        }
      }

    function getCurWeather(loc) {
    
        drawHistory();

        $('#city-search').val("");
    
        if (typeof loc === "object") {
          city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
          city = `q=${loc}`;
        }

        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;

        $.ajax({
            url: openCurrWeatherAPI,
            method: "GET"
        }).then(function (response1) {
        
        weatherObj = {
            city: `${response1.name}`,
            wind: response1.wind.speed,
            humidity: response1.main.humidity,
            temp: response1.main.temp,
            date: (convertDate(response1.dt))[1],
            icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
            desc: response1.weather[0].description
        }

        drawCurWeather(weatherObj);
        getUvIndex(response1);
        });
    }

    function getForecastWeather(loc) {
      
        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
            var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
            var cityName = loc;
            var unitsURL = "&units=imperial";
            var apiIdURL = "&appid="
            var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
            var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + apiKey;
      
            $.ajax({
                url: openCurrWeatherAPI,
                method: "GET"
            }).then(function (response4) {
                         
            var cityLon = response4.coord.lon;
            var cityLat = response4.coord.lat;
            city = `lat=${cityLat}&lon=${cityLon}`;
            
            });
        }

        // array to hold all the days of results
        let weatherArr = [];
        let weatherObj = {};

        // Initiate API Call to get current weather
        var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
        var cityName = city;
        var exclHrlURL = "&exclude=hourly";
        var unitsURL = "&units=imperial";
        var apiIdURL = "&appid=";
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + apiKey;

        $.ajax({
            url: openFcstWeatherAPI,
            method: "GET"
        }).then(function (response2) {
  
        for (let i=1; i < (response2.daily.length-2); i++) {
            let cur = response2.daily[i]
            weatherObj = {
                weather: cur.weather[0].description,
                icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
                minTemp: cur.temp.min,
                maxTemp: cur.temp.max,
                humidity: cur.humidity,
                uvi: cur.uvi,
                date: (convertDate(cur.dt))[1]
            };
            weatherArr.push(weatherObj);
        }
 
        drawForecast(weatherArr);

      });
    }

    function drawCurWeather(cur) {
   
        $('#forecast').empty(); 
        $('#cityName').text(cur.city + " (" + cur.date + ")");
        $('#curWeathIcn').attr("src", cur.icon);
        $('#curTemp').text("Temp: " + cur.temp + " F");
        $('#curHum').text("Humidity: " + cur.humidity + "%");
        $('#curWind').text("Windspeed: " + cur.wind + " MPH");
      }

      function drawForecast(cur) {

        for (let i = 0; i < cur.length; i++) {
          let $colmx1 = $('<div class="col mx-1">');
          let $cardBody = $('<div class="card-body forecast-card">');
          let $cardTitle = $('<h5 class="card-title">');
          $cardTitle.text(cur[i].date);
    
    
          let $ul = $('<ul>'); 
          let $iconLi = $('<li>');
          let $iconI = $('<img>');
          $iconI.attr('src', cur[i].icon);
    
          let $weathLi = $('<li>');
          $weathLi.text(cur[i].weather);
    
          let $tempMinLi = $('<li>');
          $tempMinLi.text('Min Temp: ' + cur[i].minTemp + " F");
    
          let $tempMaxLi = $('<li>');
          $tempMaxLi.text('Max Temp: ' + cur[i].maxTemp + " F");
    
          let $humLi = $('<li>');
          $humLi.text('Humidity: ' + cur[i].humidity + "%");
    
          // assemble element
          $iconLi.append($iconI);
    
          $ul.append($iconLi);
          $ul.append($weathLi);
          $ul.append($tempMinLi);
          $ul.append($tempMaxLi);
          $ul.append($humLi);
    
          $cardTitle.append($ul);
          $cardBody.append($cardTitle);
          $colmx1.append($cardBody);
    
          $('#forecast').append($colmx1);
        }
      }

    function getUvIndex(uvLoc) {

        city = `&lat=${parseInt(uvLoc.coord.lat)}&lon=${parseInt(uvLoc.coord.lon)}`;

        var uviURL = "https://api.openweathermap.org/data/2.5/uvi";
        var apiIdURL = "?appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var cityName = city;
        var openUviWeatherAPI = uviURL + apiIdURL + apiKey + cityName;

        $.ajax({
            url: openUviWeatherAPI,
            method: "GET"
        }).then(function(response3) {
            
        let bkcolor = "violet";
        let uv = parseFloat(response3.value);

        if (uv < 3) { 
            bkcolor = 'green';
            } else if (uv < 6) { 
            bkcolor = 'yellow';
            } else if (uv < 8) { 
            bkcolor = 'orange';
            } else if (uv < 11) { 
            bkcolor = 'red';
            }

            let title = '<span>UV Index: </span>';
            let color = title + `<span style="background-color: ${bkcolor}; padding: 0 7px 0 7px;">${response3.value}</span>`;

            $('#curUv').html(color);
        }); 
    }

    function updateCityStore(city) {
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

    function drawHistory() {
        // function to pull city history from local memory
        let cityList = JSON.parse(localStorage.getItem("cityList")) || [];
    
        $('#past-cities').empty();
        cityList.forEach ( function (city) {
          let cityNameDiv = $('<div>');
          cityNameDiv.addClass("cityList");
          cityNameDiv.attr("value",city);
          cityNameDiv.text(city);
          $('#past-cities').append(cityNameDiv);
        });
      };

    // will get location when page initializes
    const location = getCurLocation();
  });