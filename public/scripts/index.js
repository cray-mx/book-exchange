"use strict";
// ------------------ Change the image on hover -----------------
const dealImage = document.querySelector("#dealImage");
const chatImage = document.querySelector("#chatImage");
const cardImage = document.querySelector("#cardImage");
const saveImage = document.querySelector("#saveImage");
dealImage.addEventListener("mouseover", dealImageChange);
dealImage.addEventListener("mouseout", dealImageRevert);
chatImage.addEventListener("mouseover", chatImageChange);
chatImage.addEventListener("mouseout", chatImageRevert);
cardImage.addEventListener("mouseover", cardImageChange);
cardImage.addEventListener("mouseout", cardImageRevert);
saveImage.addEventListener("mouseover", saveImageChange);
saveImage.addEventListener("mouseout", saveImageRevert);

function dealImageChange(e) {
    e.target.setAttribute("src", "images/index/price-tag-color.svg");
}

function dealImageRevert(e) {
    e.target.setAttribute("src", "images/index/price-tag.svg");
}

function chatImageChange(e) {
    e.target.setAttribute("src", "images/index/chatting.svg");
}

function chatImageRevert(e) {
    e.target.setAttribute("src", "images/index/chat.svg");
}

function cardImageChange(e) {
    e.target.setAttribute("src", "images/index/debit-card.svg");
}

function cardImageRevert(e) {
    e.target.setAttribute("src", "images/index/credit-cards-payment.svg");
}

function saveImageChange(e) {
    e.target.setAttribute("src", "images/index/piggy-bank-color.svg");
}

function saveImageRevert(e) {
    e.target.setAttribute("src", "images/index/piggy-bank.svg");
}

// ------------------------ End of functions change on hover --------
function updateShoppingCart(newNumber) {
    const shoppingCartNumber = document.querySelector("#cartNumber");
    shoppingCartNumber.innerText = newNumber;
}

function init() {
    //Server call to request item in the shopping cart
    const request = new Request("/api/isLogin");
    fetch(request).then((res) => {
        if (res.status === 401) {
            updateShoppingCart(0);
            return Promise.reject();
        } else {
            return res.json();
        }
    }).then((json) => {
        const user = json.user;
        const cartNumber = user.shortlist.length;
        updateShoppingCart(cartNumber);
        const signInDiv = document.querySelector("#signIn");
        signInDiv.removeChild(signInDiv.lastElementChild);
        if (!user.isAdmin) {
            const a = document.createElement("a");
            const profileSpan = document.createElement('span');
            profileSpan.innerText = "My Profile";
            profileSpan.className = "topBarText";
            const brk = document.createElement('br');
            a.setAttribute("href", "/pages/userProfile.html");
            const imageContainer = document.createElement("div");
            imageContainer.className = "topBarImageContainer";
            const image = document.createElement("img");
            image.className = "profileImage";
            image.setAttribute("src", user.avatar);
            imageContainer.appendChild(image);
            a.appendChild(imageContainer);
            a.appendChild(brk);
            a.appendChild(profileSpan);
            imageContainer.appendChild(image);
            signInDiv.appendChild(a);
        } else {
            const a = document.createElement("a");
            const profileSpan = document.createElement('span');
            profileSpan.innerText = "Dashboard";
            profileSpan.className = "topBarText";
            const brk = document.createElement('br');
            a.setAttribute("href", "/pages/adminDashboard.html");
            const imageContainer = document.createElement("div");
            imageContainer.className = "topBarImageContainer";
            const image = document.createElement("img");
            image.className = "dashboardImage";
            image.setAttribute("src", "/images/dashboard.svg");
            imageContainer.appendChild(image);
            a.appendChild(imageContainer);
            imageContainer.appendChild(image);
            a.appendChild(brk);
            a.appendChild(profileSpan);
            signInDiv.appendChild(a);
            const myCart = document.querySelector("#myCart");
            myCart.style.display = "none";
        }

        //Add log out button
        const div = document.createElement("div");
        div.id= "logoutDiv";
        const a = document.createElement("a");
        const profileSpan = document.createElement('span');
        profileSpan.innerText = "Log Out";
        profileSpan.className = "topBarText";
        const brk = document.createElement('br');
        a.setAttribute("href", "/api/logout");
        const imageContainer = document.createElement("div");
        imageContainer.className = "topBarImageContainer";
        const image = document.createElement("img");
        image.className = "logoutImage";
        image.setAttribute("src", "/public/images/admin/logout.png");
        imageContainer.appendChild(image);
        a.appendChild(imageContainer);
        a.appendChild(brk);
        a.appendChild(profileSpan);
        imageContainer.appendChild(image);
        div.appendChild(a);
        document.querySelector("#topBar").appendChild(div);

        // Fix logo position
        const logo = document.querySelector('#indexLogo');
        logo.setAttribute('style', "margin-left: 20%;");
    }).catch((error) => {
        // console.log("User not logged in");
    })
}

const searchButton = document.querySelector("#searchButton");
searchButton.addEventListener("click", search);

const showMeAllButton = document.querySelector("#showMeAllButton");
showMeAllButton.addEventListener("click", showMeAll);

function showMeAll(e) {
    e.preventDefault();
    sessionStorage.setItem("all", "true");
    document.location = '/pages/items.html';
}

function search(e){
    e.preventDefault();
    const keyword = document.querySelector("#searchBox").value.trim();
    //Store the keyword in localstorage,
    //The actual server call happen in the items page.
    if (keyword.length === 0) {
        return;
    }
    sessionStorage.setItem("keyword", keyword);
    sessionStorage.setItem("option", "0");
    sessionStorage.setItem("all", "false");
    document.location = "/pages/items.html";
}
init();
