var messageLastUpdated, weatherLastUpdated, travelLastUpdated, newsLastUpdated;
var weatherAppId = "b3088fdcc0dd30e437a03dd8a18bc936",
    alchemyApiKey = "eaa9a9963af51af296826982a62980c6edb7af08";

$(function() {
    console.log("Ready to start!");

    var updateEnabled = getParameterByName("update");

    updateMessage();
    updateWeather();
    updateTravel();
    updateNews();

    if (updateEnabled == "true") {
        setInterval(updateMessage, 60 * 1000);
        setInterval(updateWeather, 15 * 60 * 1000);
        setInterval(updateTravel, 15 * 60 * 1000);
        setInterval(updateNews, 60 * 60 * 1000);
    }
});

function updateMessage() {
    var now = new Date();
    if (!messageLastUpdated || messageLastUpdated.getHours() !== now.getHours()) {
        messageLastUpdated = now;

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

    if (!weatherLastUpdated || weatherLastUpdated.getHours() !== now.getHours()) {
        weatherLastUpdated = now;

        refreshWeatherInfo(function(current, forecast) {
            $("#location").html(current.name);
            $("#current-temp").html("It is currently " + Math.round(current.main.temp) + "&#8451");

            var source = $("#weather-template").html();
            var template = Handlebars.compile(source);

            var todayWeather = {
                max_temp: Math.round(current.main.temp_max),
                min_temp: Math.round(current.main.temp_min),
                condition_icon: "http://openweathermap.org/img/w/" + current.weather[0].icon + ".png"
            };

            var tomorrowWeather = {
                max_temp: Math.round(forecast.list[0].temp.max),
                min_temp: Math.round(forecast.list[0].temp.min),
                condition_icon: "http://openweathermap.org/img/w/" + forecast.list[0].weather[0].icon + ".png"
            };

            var dayAfterWeather = {
                max_temp: Math.round(forecast.list[1].temp.max),
                min_temp: Math.round(forecast.list[1].temp.min),
                condition_icon: "http://openweathermap.org/img/w/" + forecast.list[1].weather[0].icon + ".png"
            };

            $("#forecast-container").html(template(todayWeather) + template(tomorrowWeather) + template(dayAfterWeather));
        });
    }
}

function updateTravel() {
    var now = new Date();

    if (!travelLastUpdated || travelLastUpdated.getHours() !== now.getHours()) {
        travelLastUpdated = now;

        refreshTravelInfo(function(travelData) {
            $("#travel-time").html("Time to work: " + travelData.rows[0].elements[0].duration.text);
        });
    }
}

function updateNews() {
    var now = new Date();

    if (!newsLastUpdated || newsLastUpdated.getHours() !== now.getHours()) {
        newsLastUpdated = now;

        refreshNewsInfo(function(newsData) {
            var headlines = "";

            for (var i = 0; i < newsData.length; i++) {
                headlines += newsData[i].source.enriched.url.title + " || ";
            }

            $("#news-container").html(headlines);
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
    var unit = getParameterByName("unit") || "metric";

    if (!lat || !lng) {
        return;
    }

    var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&units=" + unit + "&appid=" + weatherAppId;
    var currentWeather, forecastWeather;

    $.get(url, function(data, status) {
        if (status !== "success") {
            alert("Error getting current weather");
        }

        currentWeather = data;

        url = "http://api.openweathermap.org/data/2.5/forecast/daily?lat=" + lat + "&lon=" + lng + "&units=" + unit + "&cnt=2&mode=json&appid=" + weatherAppId;

        $.get(url, function(data, status) {
            if (status !== "success") {
                alert("Error getting weather forecast");
            }

            forecastWeather = data;

            cb(currentWeather, forecastWeather);
        });
    });
}

function refreshTravelInfo(cb) {
    var originLat = getParameterByName("lat");
    var originLng = getParameterByName("lng");
    var destLat = getParameterByName("worklat");
    var destLng = getParameterByName("worklng");
    var unit = getParameterByName("unit") || "metric";

    if (!originLat || !originLng || !destLat || !destLng) {
        return;
    }

    var origin = new google.maps.LatLng(originLat, originLng);
    var destination = new google.maps.LatLng(destLat, destLng);
    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix({
        origins: [origin],
        destinations: [destination],
        travelMode: google.maps.TravelMode.DRIVING
    }, function(response, status) {
        if (status !== "OK") {
            alert("Error getting travel data");
        }

        cb(response);
    });
}

function refreshNewsInfo(cb) {
    var query = getParameterByName("news");

    if (!query) {
        return;
    }

    var url = "https://gateway-a.watsonplatform.net/calls/data/GetNews?apikey=" + alchemyApiKey + "&outputMode=json&start=now-1d&end=now&maxResults=10&q.enriched.url.title=" + query + "&return=enriched.url.title";

    $.get(url, function(data, status) {
        if (status !== "success") {
            alert("Error getting news");
        }

        return cb(data.result.docs);
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
