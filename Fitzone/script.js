// Search box (placeholder)

document.addEventListener("DOMContentLoaded", function () {

    console.log("FitZone Gym Attendance System Loaded");

});


// Confirm Logout

function logoutConfirm() {

    return confirm("Are you sure you want to logout?");

}


// Highlight current sidebar page

let links = document.querySelectorAll(".sidebar a");

links.forEach(link => {

    if (link.href === window.location.href) {

        link.classList.add("active");

    }

});