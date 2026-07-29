<?php
error_reporting(E_ALL);
ini_set('display_errors',1);

include "db.php";
include "header.php";
include "sidebar.php";


$id=$_GET['id'];


$result=mysqli_query($conn,"
SELECT *
FROM members
WHERE member_id='$id'
");


$member=mysqli_fetch_assoc($result);


?>


<div class="dashboard-area">


<h2 class="mb-4">
Member Profile
</h2>



<div class="profile-container">



<div class="profile-card">



<div class="profile-top">


<div class="big-avatar">

<?php echo strtoupper(substr($member['full_name'],0,2)); ?>

</div>


<div>

<h2>
<?php echo $member['full_name']; ?>
</h2>

<p>
Member ID : <?php echo $member['member_id']; ?>
</p>


<span class="status active">
Active Member
</span>


</div>


</div>



<hr>



<div class="profile-details">


<div class="detail-box">

<i class="bi bi-telephone-fill"></i>

<div>

<small>Phone</small>

<h5>
<?php echo $member['phone']; ?>
</h5>

</div>

</div>



<div class="detail-box">

<i class="bi bi-envelope-fill"></i>

<div>

<small>Email</small>

<h5>
<?php echo $member['email']; ?>
</h5>

</div>

</div>



<div class="detail-box">

<i class="bi bi-person-badge-fill"></i>

<div>

<small>Membership Status</small>

<h5>
<?php echo $member['membership_status']; ?>
</h5>

</div>

</div>



</div>


</div>





<div class="profile-card">


<h3>
Attendance Summary
</h3>


<?php

$attendance=mysqli_query($conn,"
SELECT COUNT(*) total
FROM attendance
WHERE member_id='$id'
");


$count=mysqli_fetch_assoc($attendance)['total'];

?>


<div class="metric-row">


<div class="metric peach">

<h2>

<?php echo $count; ?>

</h2>

<p>
Total Visits
</p>

</div>



<div class="metric">

<h2>
Gym
</h2>

<p>
Member Type
</p>

</div>


</div>



</div>



<a href="index.php" class="back-btn">

<i class="bi bi-arrow-left"></i>

Back To Dashboard

</a>



</div>


<?php

include "footer.php";

?>