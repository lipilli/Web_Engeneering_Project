var url = "http://dhbw.radicalsimplicity.com/calendar/";
var user = "test";
window.onload = function() {
    requestData("categories", "");
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
    if(id != "" && data === "event"){
        var num = id;
        var num_str = num.toString()
        data = "events/"+num_str
    }
    console.log("hello");

    xhttp.open("GET", url+user+"/"+data, true);
    xhttp.send();
}

function deleteData(data, id) {
    switch(data) {
        case("events"):
            document.getElementById("testbutton").innerHTML += "Button Delete wurde gedrückt! <br>";
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("DELETE", url+user+"/"+data+"/"+id, true);
            xmlhttp.send();
            break;
    }
}

function loadEventTable(json) {
    var parsed_events = JSON.parse(json.responseText);
    var events;
    var date;
    var time;
    var page;
    var image;
    var category;

    for (var i=0; i<parsed_events.length; i++) {
        date = parsed_events[i].start.split("T", 1);
        if (parsed_events[i].allday === true) {

            time = "All Day";
        } else {
            time = parsed_events[i].start.split("T", 2)[1] + " - " + parsed_events[i].end.split("T", 2)[1];
        }
        if (parsed_events[i].webpage){
            page = parsed_events[i].webpage;
        }else{
            page = "No page";
        }
        if(parsed_events[i].imageurl === null) {
            img = "No image";
        } else {
            img = "<img src=\"" + parsed_events[i].imageurl + "\" width=\"50\"\>"; //TODO Add alt text
        }

        if (parsed_events[i].categories.length == 0) {
            category = "No category";
        } else {
            category = parsed_events[i].categories[0].name;
        }

        events = events + "<tr><td>" +
            parsed_events[i].title + "</td><td width=\"75\">" +
            parsed_events[i].status + "</td><td width=\"100\">" +
            parsed_events[i].location + "</td><td>" +
            "<a href=\"mailto:"+parsed_events[i].organizer+"\">"+parsed_events[i].organizer+"</a>" + "</td><td width=\"125\">" +
            date+"<br>"+time + "</td><td>" +
            "<a href=\""+parsed_events[i].webpage+"\">"+page+"</a>" + "</td><td width=\"50\">" +
            img + "</td><td width=\"75\">" +
            category + "</td><td>" +
            "<button onclick=\"editEvent("+parsed_events[i].id+")\" style=\"width: 100%\"\">Edit</button>"+"<br>"+"<button onclick=\"deleteEvent("+parsed_events[i].id+")\" style=\"width: 100%\">Delete</button>" + "</td></tr>";
    }

    document.getElementById("event_table").innerHTML = addEventTableHeader() + events;
}

function addEventTableHeader() {
    var table="<tr><th>Title</th><th>Status</th><th>Location</th><th>Organizer</th><th>Date and Time</th><th>Webpage</th><th>Image</th><th>Category</th><th>Actions</th></tr>";
    return table;
}

function editEvent(i) {
    requestData("event", i);
}

function deleteEvent(id) {
    var userselection = confirm("Are you sure you want to delete this event?");
    if (userselection == true) {
        deleteData("events",id);
        alert("Event deleted!");
        requestData("events", "");
    }
}

function loadCategoryTable(json) {
    var parsed_categories = JSON.parse(json.responseText);

    var categories = "<tr>";
    for (var i=0; i<parsed_categories.length; i++) {
        categories = categories + "<th>" + parsed_categories[i].name + "</th>";
    }
    categories = categories + "</tr>";

    categories = categories + "<tr>";
    for (var i=0; i<parsed_categories.length; i++) {
        categories = categories + "<td>" + parsed_categories[i].id + "</td>";
    }
    categories = categories + "</tr>";

    document.getElementById("category_table").innerHTML = categories;
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