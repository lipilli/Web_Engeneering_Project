var url = "http://dhbw.radicalsimplicity.com/calendar/";
var user = "test";
var alarmTimes = [];
var alarmSound = new Audio("../Resources/alarm.mp3")

window.onload = function() {
    loadData("categories");
    loadData("events");
};

// Prevent user from going forward and backwards
window.addEventListener( "pageshow", function ( event ) {
    window.history.forward(1)
    var historyTraversal = event.persisted ||
        ( typeof window.performance != "undefined" &&
            window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
        // Handle page restore.
        window.location.reload();
    }
});
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
    //setAlarms(alarmTimes);
}

function loadEventTable(json) {
    var response = JSON.parse(json.responseText);
    var parsedEvent;


    var events;
    var datetime;
    var page;
    var img;
    var category;

    for (var i=0; i<response.length; i++) {
        parsedEvent = JSON.parse(transformResponse(response[i]));
        startdate = parsedEvent.start_date;
        starttime = parsedEvent.start_time;
        enddate = parsedEvent.end_date;
        endtime = parsedEvent.end_time;
        if (startdate === enddate) {

            if (parsedEvent.allday === true) {
                datetime = startdate + "<br>" + "All day";
            } else {
                datetime = startdate + "<br>" + starttime + "-" + endtime;
            }
        } else {
            if (parsedEvent.allday === true) {
                datetime = startdate + "<br>-<br>" + enddate;
            } else {
                datetime = startdate + " " + starttime + "<br>-<br>" + enddate + " " + endtime;
            }
        }
        if (parsedEvent.webpage){

            page = parsedEvent.webpage;
        }else{
            page = "No page";
        }
        if(parsedEvent.imageurl === null) {
            img = "No image";
        } else {
            img = "<img src=\"" + parsedEvent.imageurl + "\" width=\"50\"\>";
        }
        if (parsedEvent.categories.length === 0) {

            category = "No category";
        } else {
            category = parsedEvent.categories[0].name;
        }
        events = events +
            "<tr>" +
                "<td>" + parsedEvent.title + "</td>" +
                "<td width=\"75\">" + parsedEvent.status + "</td>" +
                "<td width=\"100\">" + parsedEvent.location + "</td><td>" +
                "<a href=\"mailto:"+parsedEvent.organizer+"\">"+parsedEvent.organizer+"</a>" + "</td>" +
                "<td width=\"125\">" + datetime + "</td>" +
                "<td>" + "<a href=\""+parsedEvent.webpage+"\">"+page+"</a>" + "</td>" +
                "<td width=\"50\">" + img + "</td>" +
                "<td width=\"75\">" + category + "</td>" +
                "<td>" + "<button onclick=\"editEvent("+parsedEvent.id+")\" style=\"width: 100%\"\">Edit</button>"+"<br>"+"<button onclick=\"deleteEvent("+parsedEvent.id+")\" style=\"width: 100%\">Delete</button>" + "</td>" +
            "</tr>";

        // Add starts for the alarms
        alarmTimes.push([parsedEvent.extra,startdate, starttime, parsedEvent.title]);
    }

    document.getElementById("event_table").innerHTML = addEventTableHeader() + events;
    setAlarms(alarmTimes);

}

function addEventTableHeader() {
     var tableHead =
         "<tr>" +
             "<th>Title</th>" +
            "<th>Status</th>" +
            "<th>Location</th>" +
            "<th>Organizer</th>" +
            "<th>Date and Time</th>" +
            "<th>Webpage</th>" +
            "<th>Image</th>" +
            "<th>Category</th>" +
            "<th>Actions</th>" +
         "</tr>";

    return tableHead
}

function deleteEvent(id) {
    var userselection = confirm("Are you sure you want to delete this event?");
    if (userselection === true) {
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
            var responseJSON = JSON.parse(this.responseText);
            var eventInStorageFormat = transformResponse(responseJSON);
            sessionStorage.setItem(id,eventInStorageFormat);
            window.location.replace("edit_entry.html?"+id);
        }
    };
    xmlhttp.send();
}



function loadCategoryTable(json) {
    var parsed_categories = JSON.parse(json.responseText);
    var storeCtegories = [];
    var categories = "<tr>";
    for (var i=0; i<parsed_categories.length; i++) {
        storeCtegories.push(parsed_categories[i].name)
        categories = categories + "<th>" + parsed_categories[i].name + "</th>";
    }
    categories = categories + "</tr>";
    categories = categories + "<tr>";

    for ( i=0; i<parsed_categories.length; i++) {
        categories = categories + "<td>" + parsed_categories[i].id + "</td>";
    }
    categories = categories + "</tr>";
    document.getElementById("category_table").innerHTML = categories;

    sessionStorage.setItem("categories", storeCtegories);
}

function transformResponse(json) {

    var parsed_event = json;
    var webpage;
    var location;
    var start_time;
    var end_time;
    var start_date;
    var end_date;

    start_date = parsed_event.start.split("T", 1)[0];
    end_date = parsed_event.end.split("T", 1)[0];

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
        allday: parsed_event.allday,
        webpage: webpage,
        imageurl: parsed_event.imageurl,
        categories: parsed_event.categories,
        extra: parsed_event.extra
    });
    return transformed;
}
function setAlarms(alarmInfos){

    var AlarmTimes = [];
    var alarmTime;
    var timeDiffernce;
    console.log(alarmInfos)
    console.log(typeof (alarmInfos))
    console.log(alarmInfos.length)


    for(var i=0; i<alarmInfos.length;i++){

        // Check if alarm was set
        if(alarmInfos[i][0] === true){
            // check if alarm is in the past
            alarmTime = getAlarmTime(alarmInfos[i]);
            console.log(alarmInfos[i])
            timeDiffernce = alarmTime.getTime() - (new Date()).getTime();

            if(timeDiffernce > 0) {
                // Append Time until counter goes of and event name
                AlarmTimes.push([timeDiffernce, alarmInfos[i][3]]);
            }
        }
    }
    console.log(AlarmTimes);
    setInterval(countDown, 1000);

    function countDown(){
        for(i = 0; i<AlarmTimes.length; i++){
            //Count down one second
            AlarmTimes[i][0] = AlarmTimes[i][0] - 1000;
            if(AlarmTimes[i][0]<0){
                setOffAlarm(AlarmTimes[i][1]);
                AlarmTimes.splice(i, 1);
            }
        }
    }
}

function getAlarmTime(info) {
    var yyyy;
    var mm;
    var dd;
    var hour;
    var min;
    var alarmTime;
    if(info[0] === true){
        var date = info[1].split("-", 3);
        var time = info[2].split(":",2);
        yyyy = parseInt(date[0]);
        mm = parseInt(date[1])-1; // Jan is 1
        dd = parseInt(date[2]);
        hour = parseInt(time[0]);
        min = parseInt(time[1]);

        alarmTime = new Date(yyyy, mm, dd, hour, min);
    }
    return alarmTime;
}


function setOffAlarm(eventName){
    alarmSound.play();
    alert("Your event: "+eventName+" is happening now!");
}
