var image_URL = null;
var windowLoads = 0; // save in session storage
console.log(windowLoads);
var from_value_ids = [
    "event_name",
    "location",
    "organizer",
    "start_date", "start_time",
    "end_date", "end_time",
    "status",
    "all_day",
    "webpage",
    "image_upload"];

var form = document.getElementById("event_edit_form");
function handleForm(event) { event.preventDefault(); }
form.addEventListener('submit', handleForm);

window.onload = function(){
    set_min_date_to_today();
    enable_times();
    windowLoads++;
    if(windowLoads>1){
        userselection = confirm("Are you sure u want to reload?\n All your data will be lost.");
        if(userselection === true){
            document.getElementById("event_edit_form").reset();
        }
    }
}
function uploadEvent() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        readyState = this.readyState;
        status = this.status;
        console.log(xmlhttp.status);
        console.log(xmlhttp.readyState);
        if (this.readyState === 4 && this.status === 200) {
            alert("Your entry was added to the Calendar");
            userselection = confirm("Do you want to add another entry?");
            if (userselection === true) {
                // Simulate an HTTP redirect:
                window.location.replace("edit_entry.html");
            } else {
                window.location.replace("index.html");
            }
        }if(this.status === 400){
            console.log("sth. went wrong ");
        }
        // Validate information was received
    }
    xmlhttp.open("POST", "http://dhbw.radicalsimplicity.com/calendar/test/events", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(get_form_input());
}

function get_form_input() {
    // Get field values
    var form_values = [];
    from_value_ids.forEach(function(item_id){
        form_values.push(document.getElementById(item_id).value);
    });


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
        categories: null,
        extra: null
        });
    console.log(message);
    return message;
    }


function convert_image_to_DataURL(){

    var image = document.getElementById("image_upload");
    var background = new Image();
    background.src = URL.createObjectURL(image.files[0]);

    //Background.onload = onload_of_image(background);
    background.onload = function (){
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");

        canvas.width = background.width;
        canvas.height = background.height;
        context.width = background.width;
        context.height = background.height;
        context.drawImage(background, 0, 0);
        image_URL = canvas.toDataURL('image/jpeg');
    }

}

function validate_all_day() {
    var startTime = document.getElementById("start_time");
    var endTime = document.getElementById("end_time");
    if(document.getElementById("all_day").checked === true){
        startTime.value = "00:00";
        endTime.value = "23:59";
        startTime.disabled = true;
        endTime.disabled = true;
    }else{
        enable_times();
    }
}


function set_min_date_to_today() {
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

function enable_times() {
    document.getElementById("start_time").disabled = false;
    document.getElementById("end_time").disabled = false;
}


function deleteImageUpload() {
    document.getElementById("image_upload").value = null;
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
}