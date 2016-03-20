var message_last_updated;

$(function() {
    console.log("Ready to start!");

    updateMessage();
    setInterval(updateMessage, 60 * 1000);
});

function updateMessage() {
    var now = new Date();
    if (!message_last_updated || message_last_updated.getHours() != now.getHours()) {
        message_last_updated = now;

        refreshMessageInfo(function(sunrise, noon, sunset, eveningStart, eveningEnd) {
            var message = "";
            var name = getParameterByName("name");

            if (now < sunrise && now.getDay() === sunrise.getDay()) {
                message = "Zzzzzz";
            } else if (now < noon && now.getDay() === noon.getDay()) {
                message = "Good morning " + name;
            } else if (now < eveningStart && now.getDay() === eveningStart.getDay()) {
                message = "Good afternoon " + name;
            } else if (now < eveningEnd && now.getDay() === eveningEnd.getDay()) {
                message = "Good evening " + name;
            } else {
                message = "Good night " + name;
            }

            $("#message").html(message);
        });
    }
}

function refreshMessageInfo(cb) {
    var lat = getParameterByName("lat");
    var lng = getParameterByName("lng");

    var url = "http://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + lng + "&formatted=0&date=today"

    $.get(url, function(data, status) {
        var sunrise = new Date(data.results.sunrise);
        var sunset = new Date(data.results.sunset);

        var eveningStart = sunset;
        eveningStart.setHours(eveningStart.getHours() - 1);

        var eveningEnd = sunset;
        eveningEnd.setHours(eveningEnd.getHours + 1);

        var noon = new Date();
        noon.setHours(12);
        noon.setMinutes(0);
        noon.setSeconds(0);

        cb(sunrise, noon, sunset, eveningStart, eveningEnd);
    });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    url = url;
    name = name.replace(/[\[\]]/g, "\\$&").toLowerCase();
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}