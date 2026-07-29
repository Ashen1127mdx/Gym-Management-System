<?php

error_reporting(E_ALL);
ini_set('display_errors',1);

include "db.php";

include "header.php";

include "sidebar.php";


$history=mysqli_query($conn,"

SELECT

members.full_name,
members.member_id,
members.phone,
attendance.check_in,
attendance.check_out,
attendance.status

FROM attendance

JOIN members

ON members.member_id=attendance.member_id

ORDER BY attendance.check_in DESC

");


$total=mysqli_num_rows($history);



$active=mysqli_query($conn,"

SELECT COUNT(*) total

FROM attendance

WHERE status='Active'

");


$activeCount=mysqli_fetch_assoc($active)['total'];

?>


<div class="dashboard-area">



<div class="history-header">


<div>

<h1>
Attendance History
</h1>


<p>
Review previous gym activities
</p>

</div>



<a href="export.php" class="history-export">

<i class="bi bi-download"></i>

Export

</a>


</div>






<div class="history-summary">


<div class="history-stat">


<div class="history-icon">

<i class="bi bi-calendar-check"></i>

</div>


<div>

<h2>

<?php echo $total; ?>

</h2>

<p>
Total Records
</p>

</div>


</div>




<div class="history-stat">


<div class="history-icon green-icon">

<i class="bi bi-person-check"></i>

</div>


<div>

<h2>

<?php echo $activeCount; ?>

</h2>

<p>
Active Visits
</p>

</div>


</div>



<div class="history-stat">


<div class="history-icon dark-icon">

<i class="bi bi-clock-history"></i>

</div>


<div>

<h2>

<?php echo date("M"); ?>

</h2>

<p>
Current Month
</p>

</div>


</div>


</div>







<div class="timeline-card">


<div class="timeline-title">

<h3>
Attendance Timeline
</h3>


<div class="filter-btn">

<i class="bi bi-filter"></i>

Filter

</div>


</div>





<?php


if(mysqli_num_rows($history)>0){


while($row=mysqli_fetch_assoc($history)){


?>



<div class="timeline-item">



<div class="timeline-date">


<h3>

<?php

echo date("d",
strtotime($row['check_in']));

?>

</h3>


<span>

<?php

echo date("M",
strtotime($row['check_in']));

?>

</span>


</div>





<div class="timeline-content">


<div class="timeline-user">


<div class="history-avatar">

<?php

echo strtoupper(substr($row['full_name'],0,2));

?>

</div>



<div>


<h4>

<?php echo $row['full_name']; ?>

</h4>


<p>

Member ID :

<?php echo $row['member_id']; ?>

</p>


</div>


</div>





<div class="timeline-details">


<div>

<i class="bi bi-box-arrow-in-right"></i>

Check In

<strong>

<?php

echo date("h:i A",
strtotime($row['check_in']));

?>

</strong>

</div>




<div>

<i class="bi bi-box-arrow-right"></i>

Check Out

<strong>

<?php


if($row['check_out']){

echo date("h:i A",
strtotime($row['check_out']));

}

else{

echo "Not Yet";

}


?>

</strong>

</div>



</div>





<span class="history-status">

<?php echo $row['status']; ?>

</span>



</div>



</div>




<?php


}


}

else{


?>


<div class="empty-history">

<i class="bi bi-clock-history"></i>

<h3>
No History Available
</h3>

<p>
Attendance records will appear here
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