// Global variables
var url = "http://dhbw.radicalsimplicity.com/calendar/";
var user = "7035821";

var imageURL = null;
var imageLink = null;
var windowLoads = sessionStorage.getItem("windowLoads");
//Event or category ID passed to the page
var queryString = location.search.substring(1);
var categoryFormValueIds = ["category_name"];

var editEntryForm = document.getElementById("edit_form");
function handleForm(event) { event.preventDefault(); }
editEntryForm.addEventListener('submit', handleForm);


function saveSelectedCategory() {
    var selectedCategory = document.getElementById("category").value;
    sessionStorage.setItem("selectedCategory", selectedCategory);
}

// Resets editEntryForm data when page is reloaded.
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

        loadCategories();
        var userSelection = confirm("Are you sure u want to reload?\n All your data will be lost.");
           if(userSelection === true){
               if(queryString){
                  // loadCategories();
                   preFillEntry(queryString);
                   // Reset editEntryForm if this is a new entry
               }else{
                   // Pre-fill if this is an edit entry
                   document.getElementById("edit_form").reset();
                   windowLoads = parseInt(sessionStorage.getItem("windowLoads"))+1;
                   sessionStorage.setItem("windowLoads", windowLoads.toString());
               }
           }else{
               document.getElementById("category").value = sessionStorage.getItem("selectedCategory");
           }
    }
}

// Gets available categories from server
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

// Fills the category drop-down menu
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
// Image preview
function showImageOnCanvas(){

    var image = document.getElementById("image_upload");
    var background = new Image();
    if(imageLink){
        background.src = imageLink;
    }else {
        background.src = URL.createObjectURL(image.files[0]);
    }
    background.onload = function (){
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");

        canvas.width = background.width;
        canvas.height = background.height;
        context.width = background.width;
        context.height = background.height;
        context.drawImage(background, 0, 0);
        if(!(imageLink)){
            convertImageToDataURL(canvas);
        }
    }
}

function convertImageToDataURL(canvas){
    imageURL = canvas.toDataURL('image/jpeg');
}

// Pre-fill editEntryForm with event that is to be edited
function preFillEntry(queryString) {
    if(queryString){
        var entry = sessionStorage.getItem(queryString);
        var entryJSON = JSON.parse(entry);
        document.getElementById("addCalendarEntryPageHeader").innerHTML = "Edit Calendar Entry";
        document.getElementById("event_name").value = entryJSON.title;
        document.getElementById("status").value = entryJSON.status;
        document.getElementById("category").value = entryJSON.categories[0].id.toString();
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
        }
    }
}

//Clear image preview and upload
function deleteImageUpload() {
    document.getElementById("image_upload").value = null;
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function enableTimes() {
    document.getElementById("start_time").disabled = false;
    document.getElementById("end_time").disabled = false;
}

//Pre-set Times when all-day option is selected
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
    var entryFormValueIds = [
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
    var formValues = [];
    entryFormValueIds.forEach(function(item_id){
        formValues.push(document.getElementById(item_id).value);
    });

    var categoryNumber =formValues[11];
    if (categoryNumber !== "None"){
        categoryNumber = [{id:categoryNumber}];
    }else{categoryNumber = null}

    // Convert input into string with json format
    var message = JSON.stringify({
        title: formValues[0],
        location: formValues[1],
        organizer: formValues[2],
        start: formValues[3]+"T"+formValues[4],
        end: formValues[5]+"T"+formValues[6],
        status: formValues[7],
        allday: document.getElementById("all_day").checked,
        webpage: formValues[9],
        imagedata: imageURL,
        categories: categoryNumber,
        extra: document.getElementById("setAlarm").checked
        //extra: document.getElementById("setAlarm").checked
    });

    return message;
}

function setMinTimes(startDate, endDate) {

    var date = startDate.split("-", 3);
    var yyyy = parseInt(date[0]);
    var mm = parseInt(date[1])-1; // Jan is 1
    var dd = parseInt(date[2]);
    var min;
    var hour;
    startDate = new Date(yyyy, mm, dd);
    var now = new Date();

    // Start Time
    if(startDate.getFullYear() === now.getFullYear() &&
        startDate.getMonth() ===  now.getMonth() &&
        startDate.getDay() === now.getDay()){

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
    date = endDate.split("-", 3);
    yyyy = parseInt(date[0]);
    dd = parseInt(date[2]);
    min;
    hour;
    endDate = new Date(yyyy, mm, dd);
    now = new Date();

    if(endDate.getFullYear() === now.getFullYear() &&
        endDate.getMonth() ===  now.getMonth() &&
        endDate.getDay() === now.getDay()){

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

function setMinimums(){
    // Making sure min dates and times have not been reached when submitting
    setMinTimes(document.getElementById("start_date").value, document.getElementById("end_date").value);
    setEndDateMin();
}
function uploadEvent() {
    setMinDateToToday();

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            alert("Your entry was added to the Calendar");
            userselection = confirm("Do you want to add another entry?");
            if (userselection === true) {
                // Simulate an HTTP redirect:
                window.location.replace("editEntry.html");
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
    if(queryString){
        xmlhttp.open("PUT", url+user+"/events/"+queryString.toString(), true);
    }else{
        xmlhttp.open("POST", url+user+"/events", true);
    }
    xmlhttp.setRequestHeader("Content-Type", "text/plain");
    xmlhttp.send(getInputFromEntryForm());

}

// Pre-fill editCategoryForm with category that is to be edited
function preFillCategory(queryString) {
    if(queryString){
        var entry = sessionStorage.getItem(queryString);
        var entryJSON = JSON.parse(entry);
        document.getElementById("addCategoryPageHeader").innerHTML = "Edit Category";
        document.getElementById("category_name").value = entryJSON.name;
    }
}

function getCategoryFormInput() {
    var form_values = [];
    categoryFormValueIds.forEach(function(item_id){
        form_values.push(document.getElementById(item_id).value);
    });

    // Convert input into string with json format
    var message = JSON.stringify({
        name: form_values[0]
    });
    return message;
}

function uploadCategory() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        readyState = this.readyState;
        status = this.status;
        if (this.readyState === 4 && this.status === 200) {
            alert("Your category was added to the calendar!");
            window.location.replace("index.html");
        } else if(this.status === 400){
            console.log("sth. went wrong ");
        } else if(this.status === 500) {
            alert("This category already exists. Try another name!");
            window.location.replace("editCategory.html");
        }
    }


    xmlhttp.open("POST", url+user+"/categories", true);

    xmlhttp.setRequestHeader("Content-Type", "text/plain");
    xmlhttp.send(getCategoryFormInput());
}

window.onload = function(){
    // prevent User from going backwards
    window.history.forward(1);

    if (window.location.href.match('editEntry.html')) {
        setMinDateToToday();
        enableTimes();
        resetWindowLoads();
        // preFillEntry(queryString);
    } else if (window.location.href.match('editCategory.html')) {
        preFillCategory(queryString);
    } else if (window.location.href.match('contact.html')) {
        resetWindowLoads();
    }
}
// Prevent user from going forward and backwards
window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted ||
        ( typeof window.performance !== "undefined" &&
            window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
        // Handle page restore.
        window.location.reload();
        resetWindowLoads("reset");
    }
});

