// global variables
var url = "http://dhbw.radicalsimplicity.com/calendar/";
var user = "7035821";

var alarmTimes = [];
var alarmSound = new Audio("../Resources/alarm.mp3")

// fill the category and event table when page is loaded
window.onload = function() {
    window.history.forward(1);
    loadData("categories");
    loadData("events");
};

// the first row of the event table
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

// start the server request to get entry items of events and categories
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

// fill the event table with the data list which we received from the server response
function loadEventTable(json) {
    var response = JSON.parse(json.responseText);
    var parsedEvent;

    var events;
    var datetime;
    var page;
    var img;
    var category;
    let startDate;
    let startTime;
    let endDate;
    let endTime;
    for (var i = 0; i < response.length; i++) {
        parsedEvent = JSON.parse(transformResponseEvent(response[i]));
        startDate = parsedEvent.start_date;
        startTime = parsedEvent.start_time;
        endDate = parsedEvent.end_date;
        endTime = parsedEvent.end_time;
        if (startDate === endDate) {

            if (parsedEvent.allday === true) {
                datetime = startDate + "<br>" + "All day";
            } else {
                datetime = startDate + "<br>" + startTime + "-" + endTime;
            }
        } else {
            if (parsedEvent.allday === true) {
                datetime = startDate + "<br>-<br>" + endDate;
            } else {
                datetime = startDate + " " + startTime + "<br>-<br>" + endDate + " " + endTime;
            }
        }
        if (parsedEvent.webpage) {

            page = parsedEvent.webpage;
        } else {
            page = "No page";
        }
        if (parsedEvent.imageurl === null) {
            img = "No image";
        } else {
            img = "<img alt='Image upload' src=\"" + parsedEvent.imageurl + "\" width=\"50\"\>";
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
            "<a href=\"mailto:" + parsedEvent.organizer + "\">" + parsedEvent.organizer + "</a>" + "</td>" +
            "<td width=\"125\">" + datetime + "</td>" +
            "<td>" + "<a href=\"" + parsedEvent.webpage + "\">" + page + "</a>" + "</td>" +
            "<td width=\"50\">" + img + "</td>" +
            "<td width=\"75\">" + category + "</td>" +
            "<td>" + "<button onclick=\"editData(\'events\'," + parsedEvent.id + ")\" style=\"width: 100%\">Edit</button>" + "<br>" + "<button onclick=\"confirmDeletion(\'events\'," + parsedEvent.id + ")\" style=\"width: 100%\">Delete</button>" + "</td>" +
            "</tr>";

        // Add starts for the alarms
        alarmTimes.push([parsedEvent.extra, startDate, startTime, parsedEvent.title]);
    }
    document.getElementById("event_table").innerHTML = addEventTableHeader() + events;
    setAlarms(alarmTimes);
}

// fill the category table with the data list which we received from th server response
function loadCategoryTable(json) {
    var parsedCategories = JSON.parse(json.responseText);
    sessionStorage.setItem("category_count",parsedCategories.length);

    var categories = "<tr>";
    for (var i=0; i<parsedCategories.length; i++) {
        categories = categories + "<th>" + parsedCategories[i].name + "</th>";
    }
    categories = categories + "</tr>";
    categories = categories + "<tr>";
    for ( i=0; i<parsedCategories.length; i++) {
        categories = categories + "<td>" + "<button onclick=\"editData(\'categories\',"+parsedCategories[i].id+")\" style=\"width: 100%\">Edit</button>"+"<br>"+"<button onclick=\"confirmDeletion(\'categories\',"+parsedCategories[i].id+")\" style=\"width: 100%\">Delete</button>" + "</td>";
    }
    categories = categories + "</tr>";
    document.getElementById("category_table").innerHTML = categories;
}

// check if the user really wants to delete an entry in the tables
function confirmDeletion(data, id) {
    console.log(data,id);
    var userselection = confirm("Are you sure you want to delete this entry?");
    if (userselection === true) {
        deleteData(data,id);
        alert("Entry deleted!");
        loadData(data);
    }
}

// start the server request to delete entry items
function deleteData(data, id) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("DELETE", url+user+"/"+data+"/"+id, true);
    xmlhttp.send();
}

// start the server request to edit entry items of events and categories
function editData(data, id) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", url+user+"/"+data+"/"+id, true);
    xmlhttp.onreadystatechange = function() {
        if(this.status ===200 && this.readyState===4){
            var responseJSON = JSON.parse(this.responseText);
            var eventInStorageFormat
            if (data==="events") {
                eventInStorageFormat = transformResponseEvent(responseJSON);
                sessionStorage.setItem(id,eventInStorageFormat);
                window.location.replace("editEntry.html?"+id);
            } else if (data==="categories") {
                eventInStorageFormat = transformResponseCategory(responseJSON);
                sessionStorage.setItem(id,eventInStorageFormat);
                window.location.replace("editCategory.html?"+id);
            }
        }
    };
    xmlhttp.send();
}

// check if the user has more than 10 categories
function checkAmountOfCategories() {
    if (sessionStorage.category_count > 10) {
        alert("You cannot have more than 10 categories. Please delete some first to add more!");
    } else {
        window.location.replace("editCategory.html");
    }
}

// store the event data which we received from the server response
function transformResponseEvent(json) {
    var parsedEvent = json;
    var webPage;
    var location;
    var startTime;
    var endTime;
    var startDate;
    var endDate;
    var categories;

    startDate = parsedEvent.start.split("T", 1)[0];
    endDate = parsedEvent.end.split("T", 1)[0];

    if (parsedEvent.allday === true) {
        startTime = "00:00";
        endTime = "23:59";
    } else {
        startTime = parsedEvent.start.split("T", 2)[1];
        endTime= parsedEvent.end.split("T", 2)[1];
    }
    if (parsedEvent.webpage){
        webPage = parsedEvent.webpage;
    }else{
        webPage = "";
    }
    if (parsedEvent.location){
        location = parsedEvent.location
    }else{
        location = "";
    }
    if (parsedEvent.categories.length === 0){
        categories = [{id: 0, name: "none"}];
    }else{
        categories = parsedEvent.categories;
    }

    var transformed = JSON.stringify({
        id: parsedEvent.id,
        title: parsedEvent.title,
        location: location,
        organizer: parsedEvent.organizer,
        start_date:startDate,
        start_time: startTime,
        end_date:endDate,
        end_time:endTime,
        status: parsedEvent.status,
        allday: parsedEvent.allday,
        webpage: webPage,
        imageurl: parsedEvent.imageurl,
        categories: categories,
        extra: parsedEvent.extra
    });
    return transformed;
}

// store the category data which we received from the server response
function transformResponseCategory(json) {
    var parsedCategory = json;
    var transformed = JSON.stringify({
        id: parsedCategory.id,
        name: parsedCategory.name
    });
    return transformed;
}

// set the reminder for the events
function setAlarms(alarmInfos){
    var AlarmTimes = [];
    var alarmTime;
    var timeDifference;

    for(var i=0; i<alarmInfos.length;i++){
        // Check if alarm was set
        if(alarmInfos[i][0] === true){
            // check if alarm is in the past
            alarmTime = getAlarmTime(alarmInfos[i]);
            console.log(alarmInfos[i])
            timeDifference = alarmTime.getTime() - (new Date()).getTime();

            if(timeDifference > 0) {
                // Append Time until counter goes of and event name
                AlarmTimes.push([timeDifference, alarmInfos[i][3]]);
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

// cut the date string to transform them together into a valid date object
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

// alert for the reminder 
function setOffAlarm(eventName){
    alarmSound.play();
    alert("Your event: "+eventName+" is happening now!");
}

// Reset number of window loads, for the case of leaving the page
 function resetWindowLoads(option) {
    if(option === "reset"){
        sessionStorage.setItem("windowLoads","0");
    }
}