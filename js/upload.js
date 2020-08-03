var url = "http://dhbw.radicalsimplicity.com/calendar/";
var user = "7035821";

var image_URL = null;
var imageLink = null;
var windowLoads = sessionStorage.getItem("windowLoads"); // save in session storage
var queryString = location.search.substring(1);
var category_form_value_ids = ["category_name"];

var form = document.getElementById("edit_form");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

window.onload = function(){
    // prevent User from goin backwards
    window.history.forward(1);
    console.log(windowLoads);

    if (window.location.href.match('edit_entry.html')) {
        setMinDateToToday();
        enableTimes();
        resetWindowLoads();
        // preFillEntry(queryString);
    } else if (window.location.href.match('edit_category.html')) {
        preFillCategory(queryString);
    } else if (window.location.href.match('contact.html')) {
        resetWindowLoads();
    }
}
// Prevent user from going forward and backwards
window.addEventListener( "pageshow", function ( event ) {
    window.history.forward(1);
    var historyTraversal = event.persisted ||
        ( typeof window.performance != "undefined" &&
            window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
        // Handle page restore.
        window.location.reload();
        resetWindowLoads("reset");
    }
});

function saveSelectedCategory() {
    var selectedCategory = document.getElementById("category").value;
    sessionStorage.setItem("selectedCategory", selectedCategory);
}

//Fuction that resets form data when page is reloaded.
function resetWindowLoads(option) {
    //Reset number of window loads, for the case of leaving the page.
    if(option === "reset"){
        sessionStorage.setItem("windowLoads","0");
    //Create entry if windowLoads variable does not exist
    }else if(windowLoads == null){
        loadCategories();
        sessionStorage.setItem("windowLoads","0");
        preFillEntry(queryString);
    }else if(parseInt(windowLoads)===0){
        loadCategories();
        windowLoads = 1;
        sessionStorage.setItem("windowLoads", "1");
        preFillEntry(queryString);

        //Reset page to its initial state.
    }else if(parseInt(windowLoads)>0){
        console.log(sessionStorage.getItem("selectedCategory"));

        loadCategories();
        var userselection = confirm("Are you sure u want to reload?\n All your data will be lost.");
           if(userselection === true){
               if(queryString){
                  // loadCategories();
                   preFillEntry(queryString);
                   // Reset form if this is a new entry
               }else{
                   // Reprefill if this is an edit entry
                  // loadCategories();
                   document.getElementById("edit_form").reset();
                   windowLoads = parseInt(sessionStorage.getItem("windowLoads"))+1;
                   sessionStorage.setItem("windowLoads", windowLoads.toString());
               }
           }else{
               document.getElementById("category").value = sessionStorage.getItem("selectedCategory");
           }
    }
}

function loadCategories(){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            importCategoryOptions(this);
        }
    };
    xhttp.open("GET", url+user+"/categories", true);
    xhttp.send();
}

function importCategoryOptions(json) {
    var parsedCategories = JSON.parse(json.responseText);

    // Clear old categories
    document.getElementById("category").innerHTML = "";

    // Category option "None"
    document.getElementById("category").innerHTML =
        document.getElementById("category").innerHTML +
        "<option value=\"None\">None</option>";

    // Load Categories
    parsedCategories.forEach(function(category){
        document.getElementById("category").innerHTML=
            document.getElementById("category").innerHTML +
            "<option value="+category.id+">"+category.name+"</option>";
    });


}

function preFillEntry(queryString) {
    if(queryString){
        var entry = sessionStorage.getItem(queryString);
        var entryJSON = JSON.parse(entry);
        console.log(entryJSON);
        document.getElementById("header3").innerHTML = "Edit Calendar Entry";
        document.getElementById("event_name").value = entryJSON.title;
        document.getElementById("status").value = entryJSON.status;

        document.getElementById("category").value = entryJSON.categories[0].id.toString();
        console.log(document.getElementById("category").value);
        console.log(entryJSON.categories[0]);

        document.getElementById("location").value = entryJSON.location;
        document.getElementById("all_day").checked = entryJSON.allday;
        document.getElementById("start_date").value = entryJSON.start_date;
        document.getElementById("start_time").value = entryJSON.start_time;
        document.getElementById("end_date").value = entryJSON.end_date;
        document.getElementById("end_time").value = entryJSON.end_time;
        document.getElementById("webpage").value = entryJSON.webpage;
        document.getElementById("organizer").value = entryJSON.organizer;

        if(entryJSON.imageurl){
            imageLink = entryJSON.imageurl;
            showImageOnCanvas(imageLink);
        }
    }
}

function showImageOnCanvas(link){

    var image = document.getElementById("image_upload");
    var background = new Image();
    if(link===''){
        background.src = URL.createObjectURL(image.files[0]);
    }else {
        background.src = link;
    }

    background.onload = function (){
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");

        canvas.width = background.width;
        canvas.height = background.height;
        context.width = background.width;
        context.height = background.height;
        context.drawImage(background, 0, 0);
        if(!(link==="")){
            convertImageToDataURL(canvas);
        }
    }
}

function convertImageToDataURL(canvas){
        image_URL = canvas.toDataURL('image/jpeg');
}


function deleteImageUpload() {
    document.getElementById("image_upload").value = null;
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function validateAllDayOption() {
    var startTime = document.getElementById("start_time");
    var endTime = document.getElementById("end_time");
    if(document.getElementById("all_day").checked === true){
        startTime.value = "00:00";
        endTime.value = "23:59";
        startTime.disabled = true;
        endTime.disabled = true;
    }else{
        enableTimes();
    }
}

function getInputFromEntryForm() {
    var entry_form_value_ids = [
        "event_name",
        "location",
        "organizer",
        "start_date", "start_time",
        "end_date", "end_time",
        "status",
        "all_day",
        "webpage",
        "image_upload",
        "category"];

    // Get field values
    var form_values = [];
    entry_form_value_ids.forEach(function(item_id){
        form_values.push(document.getElementById(item_id).value);
    });

    var categoryNumber =form_values[11];
    if (categoryNumber != "None"){
        categoryNumber = [{id:categoryNumber}];
    }else{categoryNumber = null}

    // Convert input into string with json format
    var message = JSON.stringify({
        title: form_values[0],
        location: form_values[1],
        organizer: form_values[2],
        start: form_values[3]+"T"+form_values[4],
        end: form_values[5]+"T"+form_values[6],
        status: form_values[7],
        allday: document.getElementById("all_day").checked,
        webpage: form_values[9],
        imagedata: image_URL,
        categories: categoryNumber,
        extra: document.getElementById("setAlarm").checked
        //extra: document.getElementById("setAlarm").checked
    });

    return message;
}

function setMinTimes(start_date, end_date) {

    var date = start_date.split("-", 3);
    var yyyy = parseInt(date[0]);
    var mm = parseInt(date[1])-1; // Jan is 1
    var dd = parseInt(date[2]);
    var min;
    var hour;
    start_date = new Date(yyyy, mm, dd);
    var now = new Date();

    // Start Time
    if(start_date.getFullYear() === now.getFullYear() &&
        start_date.getMonth() ===  now.getMonth() &&
        start_date.getDay() === now.getDay()){

        if(now.getHours()<10){
            hour = '0'+now.getHours();
        }else{
            hour = now.getHours();
        }
        if(now.getMinutes()<10){
            min = now.getMinutes();
        }else{
            min = now.getMinutes();
        }
        // For some reason hours and minutes are switched...
        var currentTimeString = hour+":"+min;
        document.getElementById("start_time").min = currentTimeString;
    }

    // End Time
    mm = parseInt(date[1])-1; // Jan is 1
    date = end_date.split("-", 3);
    yyyy = parseInt(date[0]);
    dd = parseInt(date[2]);
    min;
    hour;
    end_date = new Date(yyyy, mm, dd);
    now = new Date();

    if(end_date.getFullYear() === now.getFullYear() &&
        end_date.getMonth() ===  now.getMonth() &&
        end_date.getDay() === now.getDay()){

        if(now.getHours()<10){
            hour = '0'+now.getHours();
        }else{
            hour = now.getHours();
        }
        if(now.getMinutes()<10){
            min = now.getMinutes();
        }else{
            min = now.getMinutes();
        }
        // For some reason hours and minutes are switched...
        currentTimeString = hour+":"+min;
        document.getElementById("end_time").min = currentTimeString;
    }
}

function setMinDateToToday() {
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth()+1;
    var year = today.getFullYear();
    if(day<10){
        day='0'+day
    }
    if(month<10){
        month='0'+month
    }
    today = year+'-'+month+'-'+day;
    document.getElementById("start_date").min = today;
    document.getElementById("end_date").min = today;
}

function setEndDateMin() {
    document.getElementById("end_date").min = document.getElementById("start_date").value;
}

function enableTimes() {
    document.getElementById("start_time").disabled = false;
    document.getElementById("end_time").disabled = false;
}



function uploadEvent() {
    // Making sure min dates and times have not been reached when submitting
    setMinTimes(document.getElementById("start_date").value, document.getElementById("end_date").value);
    setEndDateMin();
    setMinDateToToday();

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            alert("Your entry was added to the Calendar");
            userselection = confirm("Do you want to add another entry?");
            if (userselection === true) {
                // Simulate an HTTP redirect:
                window.location.replace("edit_entry.html");
                resetWindowLoads("reset");
            } else {
                resetWindowLoads("reset");
                window.location.replace("index.html");
            }
        }if(this.status === 400){
            console.log("sth. went wrong ");
        }
        // Validate information was received
    }
    //TODO: event is not found somehow
    if(queryString){
        xmlhttp.open("PUT", url+user+"/events/"+queryString.toString(), true);
    }else{
        xmlhttp.open("POST", url+user+"/events", true);
    }
    xmlhttp.setRequestHeader("Content-Type", "text/plain");
    xmlhttp.send(getInputFromEntryForm());
    var summissionCount = sessionStorage.getItem("submissionFailCount");

    // Try to submit once more so min Times and Dates get set
    if(summissionCount){
        if(parseInt(summissionCount) === 1){
            uploadEvent();
            summissionCount = parseInt(summissionCount)+1;
            sessionStorage.setItem("submissionFailCount", summissionCount)
        }else{
            sessionStorage.setItem("submissionFailCount", 0);
        }
    }
}


function preFillCategory(queryString) {
    if(queryString){
        var entry = sessionStorage.getItem(queryString);
        var entryJSON = JSON.parse(entry);
        console.log(entryJSON);
        document.getElementById("header3").innerHTML = "Edit Category";
        document.getElementById("category_name").value = entryJSON.name;
    }
}

function getCategoryFormInput() {
    var form_values = [];
    category_form_value_ids.forEach(function(item_id){
        form_values.push(document.getElementById(item_id).value);
    });

    // Convert input into string with json format
    var message = JSON.stringify({
        name: form_values[0]
    });
    console.log(message);
    return message;
}

function uploadCategory() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        readyState = this.readyState;
        status = this.status;
        console.log(xmlhttp.status);
        console.log(xmlhttp.readyState);
        if (this.readyState === 4 && this.status === 200) {
            alert("Your category was added to the calendar!");
            window.location.replace("index.html");
        } else if(this.status === 400){
            console.log("sth. went wrong ");
        } else if(this.status === 500) {
            alert("This category already exists. Try another name!");
            window.location.replace("edit_category.html");
        }
        // Validate information was received
    }

    if(queryString){
        xmlhttp.open("PUT", url+user+"/categories/"+queryString.toString(), true);
    }else{
        xmlhttp.open("POST", url+user+"/categories", true);
    }
    xmlhttp.setRequestHeader("Content-Type", "text/plain"); //TODO
    xmlhttp.send(getCategoryFormInput());
}
