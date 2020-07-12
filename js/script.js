var url = "http://dhbw.radicalsimplicity.com/calendar/";
var user = "test";
window.onload = function() {
    loadData("categories");
    loadData("events");
};

function loadData(data) {
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
    xhttp.open("GET", url+user+"/"+data, true);
    xhttp.send();
}

function loadEventTable(json) {
    var parsedEvents = JSON.parse(json.responseText);
    var events;
    var date;
    var time;
    var page;
    var category;

    for (var i=0; i<parsedEvents.length; i++) {
        date = parsedEvents[i].start.split("T", 1);
        if (parsedEvents[i].allday === true) {

            time = "All Day";
        } else {
            time = parsedEvents[i].start.split("T", 2)[1] + " - " + parsedEvents[i].end.split("T", 2)[1];
        }
        if (parsedEvents[i].webpage){
            page = parsedEvents[i].webpage;
        }else{
            page = "No page";
        }
        if(parsedEvents[i].imageurl === null) {
            img = "No image";
        } else {
            img = "<img src=\"" + parsedEvents[i].imageurl + "\" width=\"50\"\>";
        }

        if (parsedEvents[i].categories.length === 0) {
            category = "No category";
        } else {
            category = parsedEvents[i].categories[0].name;
        }

        // Inserting new event row
        events = events + "<tr>" +
            "<td>" + parsedEvents[i].title + "</td>" +
            "<td width=\"75\">" + parsedEvents[i].status + "</td>" +
            "<td width=\"100\">" + parsedEvents[i].location + "</td>" +
            "<td>" + "<a href=\"mailto:"+parsedEvents[i].organizer+"\">"+parsedEvents[i].organizer+"</a>" + "</td>" +
            "<td width=\"125\">" + date+"<br>"+time + "</td>" +
            "<td>" + "<a href=\""+parsedEvents[i].webpage+"\">"+page+"</a>" + "</td>" +
            "<td width=\"50\">" + img + "</td><td width=\"75\">" + category + "</td>" +
            "<td>" + "<button onclick=\"editEvent("+parsedEvents[i].id+")\" style=\"width: 100%\"\">Edit</button>"+"<br>"+"<button onclick=\"deleteEvent("+parsedEvents[i].id+")\" style=\"width: 100%\">Delete</button>" + "</td>" +
            "</tr>";
    }

    document.getElementById("event_table").innerHTML = addEventTableHeader() + events;
}

function addEventTableHeader() {
     var tableHead = "<tr><th>Title</th>" +
        "<th>Status</th>" +
        "<th>Location</th>" +
        "<th>Organizer</th>" +
        "<th>Date and Time</th>" +
        "<th>Webpage</th>" +
        "<th>Image</th>" +
        "<th>Category</th>" +
        "<th>Actions</th></tr>";

    return tableHead
}

function deleteEvent(id) {
    var userselection = confirm("Are you sure you want to delete this event?");
    if (userselection == true) {
        deleteData("events",id); //
        alert("Event deleted!");
        loadData("events");
    }
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

function editEvent(id) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url+user+"/events/"+id, true);
    xmlhttp.onreadystatechange = function() {
        if(this.status ===200 && this.readyState===4){
             resp = this;
            var eventInStorageFormat = transformResponse(this);
            console.log(eventInStorageFormat);
            sessionStorage.setItem(id,eventInStorageFormat);
            window.location.replace("edit_entry.html?"+id);
        }
    };
    xmlhttp.send();

}



function loadCategoryTable(json) {
    var parsed_categories = JSON.parse(json.responseText);

    var categories = "<tr>";
    for (var i=0; i<parsed_categories.length; i++) {
        categories = categories + "<th>" + parsed_categories[i].name + "</th>";
    }
    categories = categories + "</tr>";

    categories = categories + "<tr>";
    for ( i=0; i<parsed_categories.length; i++) {
        categories = categories + "<td>" + parsed_categories[i].id + "</td>";
    }
    categories = categories + "</tr>";

    document.getElementById("category_table").innerHTML = categories;
}

function transformResponse(json) {
    console.log(json);
    var parsed_event = JSON.parse(json.responseText);
    var webpage;
    var location;
    var start_time;
    var end_time;
    var start_date;
    var end_date;


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
        webpage = "";
    }
    if (parsed_event.location){
        location = parsed_event.location
    }else{
        location = "";
    }

    var transformed = JSON.stringify({
        id: parsed_event.id,
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
    return transformed;
}