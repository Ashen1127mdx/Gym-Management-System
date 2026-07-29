<?php

error_reporting(E_ALL);
ini_set('display_errors',1);

include "db.php";


if(isset($_GET['id'])){


$attendance_id=$_GET['id'];



$sql="UPDATE attendance 
SET check_out=NOW()
WHERE attendance_id='$attendance_id'";



if(mysqli_query($conn,$sql)){


echo "
<script>

alert('Check-Out Successful!');

window.location='index.php';

</script>
";


}
else{


echo mysqli_error($conn);


}



}

?>