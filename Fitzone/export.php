<?php

include "db.php";


header('Content-Type: text/csv');

header('Content-Disposition: attachment; filename=attendance_report.csv');


$output=fopen("php://output","w");


// CSV headings

fputcsv($output,array(
"Member ID",
"Member Name",
"Phone",
"Check In",
"Check Out",
"Status"
));



$result=mysqli_query($conn,"

SELECT

members.member_id,
members.full_name,
members.phone,
attendance.check_in,
attendance.check_out,
attendance.status

FROM attendance

JOIN members

ON members.member_id=attendance.member_id

ORDER BY attendance.check_in DESC

");



while($row=mysqli_fetch_assoc($result)){


fputcsv($output,array(

$row['member_id'],

$row['full_name'],

$row['phone'],

$row['check_in'],

$row['check_out'],

$row['status']

));


}



fclose($output);

exit;


?>