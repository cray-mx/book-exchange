/**
 * This module handles posting a new ad for a user.
 */
const log = console.log;


const postAdForm = document.querySelector('#postAdForm');
document.querySelector("#submit").addEventListener('submit', handlePostAd);

document.querySelector("#cancel").addEventListener("click", (e) => {
    window.location = "/pages/myPosts.html";
});

const price = document.querySelector('#price');
price.addEventListener('input', handlePrice);

const free = document.querySelector("#freeCheck");
free.addEventListener("click", handleFree);

function handleFree(event) {
    if (event.target.checked) {
        price.value = "";
        price.placeholder = "Free";
    } else {
        price.placeholder = "10"
    }
}

const handleViaSystemCheck = document.querySelector("#handleViaSystem");
const handleBySelfCheck = document.querySelector("#handleBySelf");
handleViaSystemCheck.addEventListener("click", systemCheck);
handleBySelfCheck.addEventListener("click", myselfCheck);

function systemCheck(event) {
    if (event.target.checked) {
        handleBySelfCheck.checked = false;
    } else {
        handleBySelfCheck.checked = true;
    }
}

function myselfCheck(event) {
    if (event.target.checked) {
        handleViaSystemCheck.checked = false;
    } else {
        handleViaSystemCheck.checked = true;
    }
}


function handlePrice(event) {

    if (event.target.value !== '') {
        document.getElementById("freeCheck").checked = false;
    }
}



function handlePostAd(event) {

    // Ad details
    const title = document.querySelector('#adTitle').value;
    const isbn = document.querySelector('#isbn').value;
    const edition = document.querySelector('#edition').value;
    const description = document.querySelector('#description').value;

    if (!(handleViaSystemCheck || handleBySelfCheck)) {
        alert("You must choose a way to handle payment!");
        return;
    }

    // Photos
    if (title.trim().length === 0) {
        alert("You have to fill in the title of the post");
        return;
    } else if (description.trim().length === 0) {
        alert("You have to fill in a description for the post");
        return;
    }
    postAdForm.submit();

    // Price

}
