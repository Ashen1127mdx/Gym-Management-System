<?php
error_reporting(E_ALL);
ini_set('display_errors',1);
include "db.php";
include "header.php";
include "sidebar.php";


$result=mysqli_query($conn,"SELECT COUNT(*) total FROM members");
$totalMembers=mysqli_fetch_assoc($result)['total'];

$result=mysqli_query($conn,"SELECT COUNT(*) total FROM attendance WHERE DATE(check_in)=CURDATE()");
$todayAttendance=mysqli_fetch_assoc($result)['total'];

$result=mysqli_query($conn,"SELECT COUNT(*) total FROM attendance WHERE check_out IS NULL");
$currentInside=mysqli_fetch_assoc($result)['total'];

$attendance=mysqli_query($conn,"
SELECT 
attendance.attendance_id,
members.full_name,
members.member_id,
attendance.check_in,
attendance.check_out,
attendance.status
FROM attendance
JOIN members
ON members.member_id=attendance.member_id
WHERE DATE(attendance.check_in)=CURDATE()
ORDER BY attendance.attendance_id DESC
LIMIT 5
");
?>

<div class="dashboard-area">

<h2 class="mb-4">Attendance Dashboard</h2>

<div class="dashboard-grid">

<section class="card checkin-card">

<div class="card-title">

<div class="icon-box">
<i class="bi bi-person-check"></i>
</div>

<div>
<h3>Member Check-In</h3>
<p>Register today's gym attendance</p>
</div>

</div>

<form action="checkin.php" method="POST">

<select name="member_id" class="input-control" required>

<option value="">Select Member</option>

<?php
$members=mysqli_query($conn,"SELECT * FROM members ORDER BY full_name ASC");

while($m=mysqli_fetch_assoc($members)){
?>

<option value="<?php echo $m['member_id']; ?>">
<?php echo $m['full_name']; ?>
</option>

<?php } ?>

</select>

<button class="check-btn">
Check In
<i class="bi bi-arrow-right"></i>
</button>

</form>

</section>


<section class="card history-card">

<div class="card-header-flex">

<h3>Attendance Summary</h3>

<i class="bi bi-calendar3"></i>

</div>

<div class="date-box">

<i class="bi bi-calendar-event"></i>

<div>

<span>Today</span>

<h4><?php echo date("d M Y"); ?></h4>

</div>

</div>


<div class="metric-row">

<div class="metric peach">

<h2><?php echo $todayAttendance; ?></h2>

<p>Today's Check-ins</p>

</div>

<div class="metric">

<h2><?php echo $currentInside; ?></h2>

<p>Currently Inside</p>

</div>

</div>

</section>

</div>



<div class="main-grid">


<section class="card table-card">


<div class="card-header-flex">

<h3>Today's Check-In Members</h3>

<div>

<a href="export.php" class="export-btn">
<i class="bi bi-download"></i>
Export
</a>

</div>

</div>



<table>

<tr>

<th>Member</th>
<th>Check In</th>
<th>Check Out</th>
<th>Status</th>
<th>Action</th>

</tr>


<?php

if(mysqli_num_rows($attendance)>0){

while($row=mysqli_fetch_assoc($attendance)){

?>

<tr class="member-row">

<td>

<div class="member">

<div class="avatar">

<?php echo strtoupper(substr($row['full_name'],0,2)); ?>

</div>

<div>

<b>
<?php echo $row['full_name']; ?>
</b>

<small>
ID : <?php echo $row['member_id']; ?>
</small>

</div>

</div>

</td>


<td>

<?php echo date("h:i A",strtotime($row['check_in'])); ?>

</td>
<td>

<?php

if($row['check_out']==NULL){

?>

<a href="checkout.php?id=<?php echo $row['attendance_id']; ?>"
class="checkout-btn">

Check Out

</a>

<?php

}

else{

echo date("h:i A",strtotime($row['check_out']));

}

?>

</td>

<td>

<span class="status active">

<?php echo $row['status']; ?>

</span>

</td>


<td>

<a href="member_details.php?id=<?php echo $row['member_id']; ?>">

<i class="bi bi-eye"></i>

</a>

</td>


</tr>


<?php

}

}else{

?>

<tr>

<td colspan="5">
No Attendance Records
</td>
</tr>

<?php } ?>

</table>

</section>



<aside>


<div class="card chart-card">

<h3>Daily Check-ins</h3>


<div class="attendance-chart">

<div class="bar-item">
<div class="bar" style="height:40%"></div>
<span>MON</span>
</div>

<div class="bar-item">
<div class="bar" style="height:60%"></div>
<span>TUE</span>
</div>

<div class="bar-item">
<div class="bar" style="height:70%"></div>
<span>WED</span>
</div>

<div class="bar-item active-bar">
<div class="bar" style="height:95%"></div>
<span>THU</span>
</div>

<div class="bar-item">
<div class="bar" style="height:80%"></div>
<span>FRI</span>
</div>

<div class="bar-item">
<div class="bar" style="height:50%"></div>
<span>SAT</span>
</div>

<div class="bar-item">
<div class="bar" style="height:35%"></div>
<span>SUN</span>
</div>

</div>


<div class="growth">

Weekly Total

<b>
688 Check-ins
</b>

<br>

<span>
↑ +12.4%
</span>

</div>

</div>



<div class="alert-card">

<h3>Capacity Alert</h3>

<p>
Current facility occupancy is at 82%. Monitor peak hours.
</p>

</div>


</aside>


</div>


</div>
<?php
include "footer.php";
?>


<script>

document.addEventListener("DOMContentLoaded", function(){

const searchBox = document.getElementById("memberSearch");

if(searchBox){

searchBox.addEventListener("keyup", function(){

let value=this.value.toLowerCase();

let rows=document.querySelectorAll(".member-row");


rows.forEach(function(row){

let text=row.textContent.toLowerCase();


if(text.includes(value)){

row.style.display="";

}
else{

row.style.display="none";

}

});


});

}


});

</script>