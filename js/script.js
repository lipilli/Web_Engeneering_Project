window.onload = function() {
    requestData("events");
};

function requestData(data) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
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

function deleteData(data, id) {
    switch(data) {
        case("event"):
            document.getElementById("testbutton").innerHTML += "Button Delete wurde gedrückt! <br>";
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("DELETE", "http://dhbw.radicalsimplicity.com/calendar/test/events/"+id, true);
            xmlhttp.send();
            break;
    }
}

function loadEventTable(json) {
    var parsed_events = JSON.parse(json.responseText);
    console.log(parsed_events);
    var events;
    var date;
    var time;
    var page;

    console.log(parsed_events);

    for (i in parsed_events) {
        date = parsed_events[i].start.split("T", 1);

        if (parsed_events[i].allday === true) {
            time = "All Day";
        } else {
            time = parsed_events[i].start.split("T", 2)[1] + " - " + parsed_events[i].end.split("T", 2)[1];
        }

        if (parsed_events[i].webpage){
            page = parsed_events[i].webpage.split(".", 2)[1];
        }else{
            page = "";
        }

        if(parsed_events[i].imageurl === null) {
            img = "No Image";
        } else {
            img = "<img src=\"" + parsed_events[i].imageurl + "\" width=\"50\"\>"; //TODO Add alt text
        }

        events = events + "<tr><td>" +
            parsed_events[i].title + "</td><td>" +
            parsed_events[i].status + "</td><td>" +
            parsed_events[i].location + "</td><td>" +
            "<a href=\"mailto:"+parsed_events[i].organizer+"\">"+parsed_events[i].organizer+"</a>" + "</td><td>" +
            date+"<br>"+time + "</td><td>" +
            "<a href=\""+parsed_events[i].webpage+"\">"+page+"</a>" + "</td><td>" +
            img + "</td><td>" +
            "<button onclick=\"editEvent("+parsed_events[i].id+")\">Edit</button>"+"<br>"+"<button onclick=\"deleteEvent("+parsed_events[i].id+")\">Delete</button>" + "</td></tr>";
    }
    document.getElementById("event_table").innerHTML = addTableHeader() + events;
}

function addTableHeader() {
    table="<tr><th>Title</th><th>Status</th><th>Location</th><th>Organizer</th><th>Date and Time</th><th>Webpage</th><th>Image</th><th>Actions</th></tr>";
    return table;
}

function editEvent(i) {
    document.getElementById("testbutton").innerHTML += "Button Edit wurde gedrückt! <br>";
    console.log(i);
}

function deleteEvent(id) {
    var userselection = confirm("Are you sure you want to delete this event?");
    if (userselection === true){
        deleteData("event",id);
        alert("Event deleted!");
        requestData("events");
    }
}

function loadCategoryTable(json) {
    // TODO
}

