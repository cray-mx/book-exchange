/**
 * This module handles posting a new ad for a user.
 */
const log = console.log;


const postAdForm = document.querySelector('#postAdForm');
document.querySelector("#submit").addEventListener('click', handlePostAd);
// log(postAdForm);

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
    // log(event.target.value);
    // log(event);

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

    // Price
    postAdForm.submit();

}

function init() {
    document.querySelector("#postId").style.display = "none";
    if (!sessionStorage.getItem("postToUpdate")) {
        window.location = '/pages/myPosts.html';
        return;
    }
    const post = JSON.parse(sessionStorage.getItem("postToUpdate"));
    document.querySelector("#postId").value = post._id;
    document.querySelector("#adTitle").value = post.title;
    document.querySelector("#isbn").value = post.ISBN;
    document.querySelector("#edition").value = post.edition;
    document.querySelector("#condition").value = post.condition;
    document.querySelector("#description").value = post.description;

    if (parseInt(post.price) === 0) {
        document.querySelector("#freeCheck").checked = true;
    } else {
        document.querySelector("#price").value = post.price;
    }

    if (post.byCreditCard) {
        document.querySelector("#handleViaSystem").checked = true;
        document.querySelector("#handleBySelf").checked = false;
    } else {
        document.querySelector("#handleViaSystem").checked = false;
        document.querySelector("#handleBySelf").checked = true;
    }

}

init();
