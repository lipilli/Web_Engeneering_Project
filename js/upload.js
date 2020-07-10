var image_URL = null;
function uploadEvent() {
    var xmlhttp = new XMLHttpRequest();

    // xmlhttp.onreadystatechange = function () {
    //
    //     // if (this.readyState == 4 && this.status == 200) {
    //     //???
    //     //
    //     }

    xmlhttp.open("POST", "http://dhbw.radicalsimplicity.com/calendar/test/events", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.send(get_form_input());
    console.log(xmlhttp);
}




function get_form_input() {
    // Get field values
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
    return message;
    }


function convert_image_to_DataURL(){

    var image = document.getElementById("image_upload");
    var background = new Image();
    background.src = URL.createObjectURL(image.files[0]);

    console.log(image.value);
    console.log(URL.createObjectURL(image.files[0]));

    //Background.onload = onload_of_image(background);
    background.onload = function (){
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext("2d");

        canvas.width = background.width;
        canvas.height = background.height;
        context.width = background.width;
        context.height = background.height;
        context.drawImage(background, 0, 0);
        var dataURL = canvas.toDataURL('image/jpeg');
        console.log(dataURL);
        image_URL = "data:ContentType;base64"+dataURL;
    }

}


