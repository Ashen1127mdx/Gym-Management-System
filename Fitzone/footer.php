<footer class="footer">

<p>
© <?php echo date("Y"); ?> FitZone Gym Management System | All Rights Reserved
</p>

</footer>


<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>


<script>

function toggleNotification(){

let box=document.getElementById("notificationBox");

let settings=document.getElementById("settingsBox");

settings.classList.remove("show");

box.classList.toggle("show");

}



function toggleSettings(){

let box=document.getElementById("settingsBox");

let notification=document.getElementById("notificationBox");

notification.classList.remove("show");

box.classList.toggle("show");

}



document.addEventListener("click",function(event){


if(!event.target.closest(".header-action")){


document.querySelectorAll(".header-popup").forEach(function(box){


box.classList.remove("show");


});


}


});


</script>


</body>

</html>