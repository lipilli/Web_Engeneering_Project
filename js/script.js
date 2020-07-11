window.onload = function() {
    requestData("events", "");
};

function requestData(data, id) {

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
                case("event"):
                    transform_response(this, id);
            }
        }
    };
    var url;
    if(id != ""){
        var num = id;
        var num_str = "/"+num.toString()
        url = "http://dhbw.radicalsimplicity.com/calendar/test/events"+num_str;
    }else{
        url = "http://dhbw.radicalsimplicity.com/calendar/test/events"+id;
    }

    xhttp.open("GET", url, true);
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
    var image;


    var table_div = document.getElementById("table-scroll");
    var table_content = "<table align=\"center\" id=\"event_table\" style=\"width: 900px\"></table>"
    table_div.innerHTML = table_content;


    for (var i=0; i<parsed_events.length; i++) {
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

        if(parsed_events[i]){

        }
    }

    document.getElementById("event_table").innerHTML = addTableHeader() + events;
}

function addTableHeader() {
    table="<tr><th>Title</th><th>Status</th><th>Location</th><th>Organizer</th><th>Date and Time</th><th>Webpage</th><th>Image</th><th>Actions</th></tr>";
    return table;
}

function editEvent(i) {
    requestData("event", i);
}

function deleteEvent(id) {
    var userselection = confirm("Are you sure you want to delete this event?");
    if (userselection === true){
        deleteData("event",id);
        alert("Event deleted!");
        requestData("events", "");
    }
}

function transform_response(json,i) {
    var parsed_event = JSON.parse(json.responseText);
    console.log(json);
    var webpage;
    var location;
    var start_time;
    var end_time;
    var start_date;
    var end_date;
    var page;


        start_date = parsed_event.start.split("T", 1);
        end_date = parsed_event.end.split("T", 1);

        if (parsed_event.allday === true) {
            start_time = "00:00";
            end_time = "23:59";
        } else {
            start_time = parsed_event.start.split("T", 2)[1];
            end_time= parsed_event.end.split("T", 2)[1];
        }
        if (parsed_event.webpage){
            webpage = parsed_event.webpage;
        }else{
            page = "";
        }
        if (parsed_event.location){
            location = parsed_event.location
        }else{
            location = "";
        }

        var transformed = JSON.stringify({
            title: parsed_event.title,
            location: location,
            organizer: parsed_event.organizer,
            start_date:start_date,
            start_time: start_time,
            end_date:end_date,
            end_time:end_time,
            status: parsed_event.status,
            allday: parsed_event.status,
            webpage: webpage,
            imageurl: parsed_event.imageurl,
            categories: parsed_event.categories,
            extra: parsed_event.extra
        });
        sessionStorage.setItem(i,transformed);
        window.location.replace("edit_entry.html?"+i);
}

