var apiKey = "630e27fa306f06f51bd9ecbb54aae081";
var cityName = "Minneapolis";
var cityState = "Minnesota";
var zipCode = "55419"

var currentURL = "https://api.openweathermap.org/data/2.5/weather?q=";
var apiIdURL = "&appid="
var openCurrWeatherAPI = currentURL + cityName + apiIdURL + apiKey;

console.log(openCurrWeatherAPI);

$.ajax({
url: openCurrWeatherAPI,
method: "GET"
}).then(function(response1) {

console.log(response1);
console.log(response1.coord.lon);
console.log(response1.coord.lat);

});

var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?q=";
var cntURL = "&cnt="
var apiIdURL = "&appid="
var numberDays = 5
var openForecastWeatherAPI = forecastURL + cityName + cntURL + numberDays + apiIdURL + apiKey;

console.log(openForecastWeatherAPI);

$.ajax({
url: openForecastWeatherAPI,
method: "GET"
}).then(function(response2) {

console.log(response2);

});