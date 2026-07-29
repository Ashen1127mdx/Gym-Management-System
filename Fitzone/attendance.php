<?php

error_reporting(E_ALL);
ini_set('display_errors',1);

include "db.php";

include "header.php";

include "sidebar.php";


$today=mysqli_query($conn,"
SELECT 
members.full_name,
members.member_id,
members.phone,
members.photo,
attendance.check_in,
attendance.check_out,
attendance.status

FROM attendance

JOIN members

ON members.member_id=attendance.member_id

WHERE DATE(attendance.check_in)=CURDATE()

ORDER BY attendance.check_in DESC
");


$totalToday=mysqli_num_rows($today);


$inside=mysqli_query($conn,"
SELECT COUNT(*) total
FROM attendance
WHERE DATE(check_in)=CURDATE()
AND check_out IS NULL
");


$insideCount=mysqli_fetch_assoc($inside)['total'];

?>


<div class="dashboard-area">


<div class="attendance-header">


<div>

<h1>
Live Attendance
</h1>

<p>
Track members currently inside the gym
</p>

</div>


<div class="live-status">

<span></span>

LIVE

</div>


</div>





<div class="attendance-summary">


<div class="summary-card">


<div class="summary-icon orange">

<i class="bi bi-people-fill"></i>

</div>


<div>

<h2>

<?php echo $totalToday; ?>

</h2>

<p>
Today's Visits
</p>

</div>


</div>




<div class="summary-card">


<div class="summary-icon green">

<i class="bi bi-person-walking"></i>

</div>


<div>

<h2>

<?php echo $insideCount; ?>

</h2>

<p>
Currently Inside
</p>

</div>


</div>


</div>







<div class="section-title">

<h3>
Members In Gym
</h3>


<span>
<?php echo date("d M Y"); ?>
</span>


</div>





<div class="member-cards">



<?php


if(mysqli_num_rows($today)>0){


while($row=mysqli_fetch_assoc($today)){


?>


<div class="attendance-member-card">



<div class="member-top">


<div class="member-avatar">

<?php

echo strtoupper(substr($row['full_name'],0,2));

?>

</div>



<div class="member-info">

<h4>

<?php echo $row['full_name']; ?>

</h4>


<p>

Member ID :
<?php echo $row['member_id']; ?>

</p>


</div>



<div class="online-dot">

</div>


</div>





<div class="member-details">


<div>

<i class="bi bi-clock"></i>

Check In

<strong>

<?php

echo date("h:i A",
strtotime($row['check_in']));

?>

</strong>

</div>



<div>

<i class="bi bi-telephone"></i>

Phone

<strong>

<?php echo $row['phone']; ?>

</strong>

</div>


</div>






<div class="member-action">


<?php


if($row['check_out']==NULL){


?>


<a href="checkout.php?id=<?php echo $row['member_id']; ?>"
class="mobile-checkout">

Check Out

<i class="bi bi-arrow-right"></i>

</a>


<?php


}else{


?>


<button class="completed-btn">

Completed

<i class="bi bi-check-circle"></i>

</button>


<?php


}


?>


</div>



</div>



<?php


}


}

else{


?>


<div class="empty-attendance">

<i class="bi bi-person-x"></i>

<h3>
No Members Today
</h3>

<p>
No attendance records available
</p>

</div>


<?php


}


?>


</div>


</div>



<?php

include "footer.php";

?>