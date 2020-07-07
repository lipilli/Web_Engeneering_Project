window.onload = function() {
    requestData("events");
};

function requestData(data) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            switch(data) {
                case("events"):
                    loadEventTable(this);
                    break;
                case("categories"):
                    loadCategoryTable(this);
                    break;
            }
        }
    };
    xhttp.open("GET", "http://dhbw.radicalsimplicity.com/calendar/test/events", true);
    xhttp.send();
}

function loadEventTable(json) {
    var event = JSON.parse(json.responseText);

    var events;
    var date;
    var time;
    var page;
    var image;
    for (i in event) {
        date = event[i].start.split("T", 1);

        if (event[i].allday == true) {
            time = "All Day";
        } else {
            time = event[i].start.split("T", 2)[1] + " - " + event[i].end.split("T", 2)[1];
        }

        page = event[i].webpage.split(".", 2)[1];

        if(event[i].imageurl == null) {
            img = "No Image";
        } else {
            img = "<img src=\"" + event[i].imageurl + "\">";
        }

        events = events + "<tr><td>" +
            event[i].title + "</td><td>" +
            event[i].status + "</td><td>" +
            event[i].location + "</td><td>" +
            "<a href=\"mailto:"+event[i].organizer+"\">"+event[i].organizer+"</a>" + "</td><td>" +
            date+"<br>"+time + "</td><td>" +
            "<a href=\""+event[i].webpage+"\">"+page+"</a>" + "</td><td>" +
            img + "</td><td>" +
            "<button onclick=\"editEvent()\">Edit</button>"+"<br>"+"<button onclick=\"deleteEvent()\">Delete</button>" + "</td></tr>";
    }
    document.getElementById("event_table").innerHTML = addEventHeader() + events;
}

function addEventHeader() {
    var table="<tr><th>Title</th><th>Status</th><th>Location</th><th>Organizer</th><th>Date and Time</th><th>Webpage</th><th>Image</th><th>Actions</th></tr>";
    return table;
}

function editEvent() {
    document.getElementById("testbutton").innerHTML += "Button Edit wurde gedrückt! <br>";
}

function deleteEvent() {
    document.getElementById("testbutton").innerHTML += "Button Delete wurde gedrückt! <br>";
}

function loadCategoryTable(json) {

}