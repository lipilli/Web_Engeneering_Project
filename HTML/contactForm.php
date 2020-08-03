<?php

   if(isset($_POST['submit'])){
        $salutation = $_POST['salutation'];
        $name = $_POST['name'];
        $subject = $_POST['subject'];
        $mailFrom = $_POST['email'];
        $name = $_POST['message'];

        $mailTo = "deborah_chrystall_djon@yahoo.de";
        $headers = "From: ".mailFrom;
        $txt = "You have received an e-mail from: ".salutation." ".name."\n\n".message;

        mail($mailTo, $subject, $txt, $headers);
        header("Location: index.html?mailSent");
   }
 >