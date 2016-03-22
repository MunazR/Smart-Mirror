var message_last_updated, weather_last_updated;
var weatherAppId = "b3088fdcc0dd30e437a03dd8a18bc936";

$(function() {
    console.log("Ready to start!");

    var updateEnabled = getParameterByName("update");

    updateMessage();
    updateWeather();

    if (updateEnabled == "true") {
        setInterval(updateMessage, 60 * 1000);
        setInterval(updateWeather, 15 * 60 * 1000);
    }
});

function updateMessage() {
    var now = new Date();
    if (!message_last_updated || message_last_updated.getHours() != now.getHours()) {
        message_last_updated = now;

        refreshMessageInfo(function(sunrise, noon, sunset, eveningStart, eveningEnd) {
            var message = "";
            var name = getParameterByName("name");

            if (name) {
                name = " " + name;
            } else {
                name = "";
            }

            if (now < sunrise && now.getDay() === sunrise.getDay()) {
                message = "Zzzzzz";
            } else if (now < noon && now.getDay() === noon.getDay()) {
                message = "Good morning" + name;
            } else if (now < eveningStart && now.getDay() === eveningStart.getDay()) {
                message = "Good afternoon" + name;
            } else if (now < eveningEnd && now.getDay() === eveningEnd.getDay()) {
                message = "Good evening" + name;
            } else {
                message = "Good night" + name;
            }

            $("#message").html(message);
        });
    }
}

function updateWeather() {
    var now = new Date();

    if (!weather_last_updated || weather_last_updated.getDay() != now.getDay()) {
        weather_last_updated = now;

        refreshWeatherInfo(function(current, forecast) {
            $("#location").html(current.name);
            $("#current-temp").html("It is currently " + Math.round(current.main.temp) + "&#8451");

            var currentWeatherContainer = $("#current-weather-container");
            currentWeatherContainer.find(".temp").html(Math.round(current.main.temp_min) + "/" + Math.round(current.main.temp_max));
            currentWeatherContainer.find(".condition").attr("src", "http://openweathermap.org/img/w/" + current.weather[0].icon + ".png")

            var tomorrowWeatherContainer = $("#tomorrow-weather-container");
            tomorrowWeatherContainer.find(".temp").html(Math.round(forecast.list[0].temp.min) + "/" + Math.round(forecast.list[0].temp.max));
            tomorrowWeatherContainer.find(".condition").attr("src", "http://openweathermap.org/img/w/" + forecast.list[0].weather[0].icon + ".png")

            var dayAfterWeatherContainer = $("#day-after-weather-container");
            dayAfterWeatherContainer.find(".temp").html(Math.round(forecast.list[1].temp.min) + "/" + Math.round(forecast.list[1].temp.max));
            dayAfterWeatherContainer.find(".condition").attr("src", "http://openweathermap.org/img/w/" + forecast.list[1].weather[0].icon + ".png")
        });
    }
}

function refreshMessageInfo(cb) {
    var lat = getParameterByName("lat");
    var lng = getParameterByName("lng");

    if (!lat || !lng) {
        return;
    }

    var url = "http://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + lng + "&formatted=0&date=today";

    $.get(url, function(data, status) {
        if (status !== "success") {
            alert("Error getting sunrise/sunset times");
        }

        var sunrise = new Date(data.results.sunrise);
        var sunset = new Date(data.results.sunset);

        var eveningStart = new Date(sunset.getTime());
        eveningStart.setHours(eveningStart.getHours() - 1);

        var eveningEnd = new Date(sunset.getTime());
        eveningEnd.setHours(eveningEnd.getHours() + 1);

        var noon = new Date();
        noon.setHours(12);
        noon.setMinutes(0);
        noon.setSeconds(0);

        cb(sunrise, noon, sunset, eveningStart, eveningEnd);
    });
}

function refreshWeatherInfo(cb) {
    var lat = getParameterByName("lat");
    var lng = getParameterByName("lng");

    if (!lat || !lng) {
        return;
    }

    var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&units=metric&appid=" + weatherAppId;
    var currentWeather, forecastWeather;

    $.get(url, function(data, status) {
        if (status !== "success") {
            alert("Error getting current weather");
        }

        currentWeather = data;

        url = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" + lng + "&units=metric&cnt=2&mode=json&appid=" + weatherAppId;

        $.get(url, function(data, status) {
            if (status !== "success") {
                alert("Error getting weather forecast");
            }

            forecastWeather = data;

            cb(currentWeather, forecastWeather);
        });
    });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}