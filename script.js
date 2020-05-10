$(document).ready(function () {
    // Get current Location
    $('#getWeather,#past-cities').on('click', function () {
        console.log("on click");
        
        // Get location from user input box
        let e = $(event.target)[0];
        let location = "";

        if (e.id === "getWeather" || e.id === "getWeatherId") {
        console.log("getWeather");
        location = $('#city-search').val().trim().toUpperCase();
        } else if ( e.className === ("cityList") ) {
        console.log("cityList");
        location = e.innerText;
        }
        if (location == "") return;

        updateCityStore(location);
        getCurrWeather(location);
        getForecastWeather(location);
    });

    //Function to convert to local time
    function convertDate(epoch) {
        console.log(`convertData - epoch: ${epoch}`);
        let readable = [];
        let myDate = new Date(epoch * 1000);
        readable[0] = (myDate.toLocaleString());
        readable[1] = ((myDate.toLocaleString().split(", "))[0]);
        readable[2] = ((myDate.toLocaleString().split(", "))[1]);
        console.log(` readable[0]: ${readable[0]}`);
        return readable;
    }

    function getCurrLocation() {
        console.log("getCurrLocation");
        let location = {};
        
        function success(position) {
            console.log(" success");
            console.log(" location", location);
        
        location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            success: true
        }
        
        console.log(" success location", location);

        getCurrWeather(location);
        getForecastWeather(location);
        }

        function error() {
        location = { success: false }
        console.log('Could not get location');
        return location;
        }

        if (!navigator.geolocation) {
            console.log('Geolocation is not supported by your browser');
        }   else {
            navigator.geolocation.getCurrentPosition(success, error);
            console.log("getCurrWeather - toloc:",typeof loc);
        }
    };

    // Function to get current weather
    function getCurrWeather(loc) {
        console.log("getCurrWeather - loc:", loc);
        console.log("getCurrWeather - toloc:",typeof loc);

        renderHistory();
        // Clear Search Field
        $('#city-search').val("");

        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
            city = `q=${loc}`;   
        }

        // Initiate API Call to get current weather
        var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
        var cityName = city;
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openCurrWeatherAPI = currentURL + cityName + apiIdURL + apiKey;

        console.log(openCurrWeatherAPI);

        $.ajax({
            url: openCurrWeatherAPI,
            method: "GET"
        }).then(function (response1) {
        
        console.log(response1);

        weatherObj = {
            city: `${response1.name}`,
            wind: response1.wind.speed,
            humidity: response1.main.humidity,
            temp: response1.main.temp,
            date: (convertDate(response1.dt))[1],
            icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
            desc: response1.weather[0].description
        }
        
        // calls function to render results to page
        renderCurrWeather(weatherObj);
        getUvIndex(response1);
        });
    };

    // Get 5 day forecast
    function getForecastWeather(loc) {
        console.log("getForecastWeather - loc:", loc);

        if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
        } else {
            city = `q=${loc}`;
        }

        let weatherArr = [];
        let weatherObj = {};

        var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
        var cityName = city;
        var cntURL = "&cnt="
        var numberDays = 5
        var apiIdURL = "&appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var openForecastWeatherAPI = forecastURL + cityName + cntURL + numberDays + apiIdURL + apiKey;

        console.log(openForecastWeatherAPI);

        $.ajax({
        url: openForecastWeatherAPI,
        method: "GET"
        }).then(function(response2) {

        console.log(response2);

        for (let i=1; i < response2.list.length; i++) {
            let cur = response2.list[i]
            weatherObj = {
                weather: cur.weather[0].description,
                icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
                minTemp: cur.temp.min,
                maxTemp: cur.temp.max,
                humidity: cur.humidity,
                date: (convertDate(cur.dt))[1]
            };

            weatherArr.push(weatherArr);
        }
            renderForecast(weatherArr);
        });
    };

    function renderCurrWeather(cur) {
        // function to draw  weather all days
        // need logic to pick variables
        if (test) { console.log('renderCurWeather - cur:', cur); }

        $('#forecast').empty(); 
        $('#cityName').text(cur.city + " (" + cur.date + ")");
        $('#curWeathIcn').attr("src", cur.icon);
        $('#curTemp').text("Temp: " + cur.temp + " F");
        $('#curHum').text("Humidity: " + cur.humidity + "%");
        $('#curWind').text("Windspeed: " + cur.wind + " MPH");
    };

    function renderForecast(cur) {
        console.log('renderForecast - cur:', cur);

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
    };

    function getUvIndex(uvLoc) {
        console.log('getUvIndex loc:',uvLoc);
        
        // function to color uv index
        let city = `lat=${parseInt(uvLoc.coord.lat)}&lon=${parseInt(uvLoc.coord.lon)}`;

        var uviURL = "https://api.openweathermap.org/data/2.5/uvi/forecast";
        var apiIdURL = "?appid="
        var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
        var cityName = city;
        var openUviWeatherAPI = uviURL + apiIdURL + apiKey + cityName;
    
        console.log(openUviWeatherAPI);
    
        $.ajax({
        url: openUviWeatherAPI,
        method: "GET"
        }).then(function(response3) {
        
        console.log(response3);
            
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
        let color = title + `<span style="background-color: ${bkcolor}; padding: 0 7px 0 7px;">${response.value}</span>`;

        $('#curUv').html(color);
        }); 
    };

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

    function renderHistory() {
        // function to pull city history from local memory
        
        console.log('getHistory');
        
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
    const location = getCurrLocation();
});