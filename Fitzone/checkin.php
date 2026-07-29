<?php

error_reporting(E_ALL);
ini_set('display_errors',1);

include "db.php";


if($_SERVER["REQUEST_METHOD"]=="POST"){


$member_id=$_POST['member_id'];



// Check already checked in today

$check=mysqli_query($conn,"
SELECT * FROM attendance
WHERE member_id='$member_id'
AND DATE(check_in)=CURDATE()
");


if(mysqli_num_rows($check)>0){


echo "
<script>
alert('Member already checked in today!');
window.location='index.php';
</script>
";


exit();


}




// Insert attendance


$sql="INSERT INTO attendance
(member_id,check_in,status)
VALUES
('$member_id',NOW(),'Active')";



if(mysqli_query($conn,$sql)){


echo "
<script>

alert('Check-In Successful!');

window.location='index.php';

</script>
";


}

else{


echo "Error : ".mysqli_error($conn);


}



}


?>