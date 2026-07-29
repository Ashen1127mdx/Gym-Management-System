<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Gym Attendance System</title>


<!-- Bootstrap -->

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">


<!-- Bootstrap Icons -->

<link rel="stylesheet"
href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">


<!-- Google Font -->

<link rel="preconnect" href="https://fonts.googleapis.com">

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>


<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">


<!-- CSS -->

<link rel="stylesheet" href="style.css">


</head>


<body>


<nav class="navbar navbar-expand-lg bg-white shadow-sm px-4">


<div class="container-fluid">



<!-- SEARCH -->

<div class="search-box">


<i class="bi bi-search"></i>


<input type="text"
id="memberSearch"
placeholder="Search members..."
class="form-control">


</div>





<div class="d-flex align-items-center ms-auto">





<!-- NOTIFICATION -->

<div class="header-action" onclick="toggleNotification()">


<i class="bi bi-bell"></i>


<span class="notification-dot"></span>



<div class="header-popup" id="notificationBox">


<h5>

Notifications

</h5>



<div class="popup-item">

<i class="bi bi-check-circle-fill"></i>

System running normally

</div>




<div class="popup-item">

<i class="bi bi-person-check-fill"></i>

Today's attendance updated

</div>




<div class="popup-empty">

No new messages yet

</div>



</div>



</div>







<!-- SETTINGS -->


<div class="header-action" onclick="toggleSettings()">


<i class="bi bi-gear"></i>




<div class="header-popup settings-popup" id="settingsBox">


<h5>

System Settings

</h5>




<div class="popup-item">

<i class="bi bi-database-check"></i>

Database Connected

</div>




<div class="popup-item">

<i class="bi bi-shield-check"></i>

Security Status Active

</div>




<div class="popup-item">

<i class="bi bi-bell-fill"></i>

Notifications Enabled

</div>




</div>



</div>








<!-- FITZONE PROFILE -->


<div class="fitzone-profile">


<div class="fitzone-logo">

<i class="bi bi-lightning-charge-fill"></i>

</div>


<div>


<b>

FitZone

</b>


<small>

Gym Management

</small>



</div>



</div>





</div>


</div>


</nav>





<div class="container-fluid mt-4">


<div class="row">