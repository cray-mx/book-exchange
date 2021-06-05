
let num_posts = 0;

const sortingOpt = document.querySelector("#sortingOption");
sortingOpt.addEventListener("change", onSortingOptChange);
const searchOption = document.querySelector("#searchOption");

let posts;
let user;
let isRealUser;


function onSortingOptChange() {
    const newOption = sortingOpt.value;
    if (newOption === "timeNewToOld") {
        posts.sort(function (a, b) {
            if (a.postingDate <= b.postingDate) {
                return 1;
            } else {
                return -1;
            }
        });
    } else if (newOption === "timeOldToNew") {
        posts.sort(function (a, b) {
            if (a.postingDate <= b.postingDate) {
                return -1;
            } else {
                return 1;
            }
        });
    } else if (newOption === "priceLowToHigh") {
        posts.sort(function (a, b) {
            if (parseFloat(a.price) <= parseFloat(b.price)) {
                return -1;
            } else {
                return 1;
            }
        });
    } else {//priceHighToLow
        posts.sort(function (a, b) {
            if (parseFloat(a.price) <= parseFloat(b.price)) {
                return 1;
            } else {
                return -1;
            }
        });
    }
    generateSearchResult(posts, user);
}

function init() {
    const keyword = sessionStorage.getItem("keyword");
    let option = sessionStorage.getItem("option");
    const all = sessionStorage.getItem("all");
    if (parseInt(option) === 0) {
        document.querySelector("#searchMethod").value = '0';
    } else {
        document.querySelector("#searchMethod").value = '1';
    }
    if (keyword || all === "true") {
        const payload = {
            keyword: keyword,
            option: option,
            all: all
        };

        const request = new Request("/api/search", {
            method: "post",
            body: JSON.stringify(payload),
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        });
        if (all === "true") {
            document.querySelector("#searchResult").innerHTML = "Here is all the posts ...";
        } else {
            document.querySelector("#result").innerText = keyword;
            const searchBox = document.querySelector("#searchBox");
            searchBox.value = keyword;
        }

        fetch(request).then((res) => {
            return res.json();
        }).then((json) => {
            if (json.user === null) {
                //Create a trivial user for page generation
                user =
                    new User('user', 'user', 'user', 'user@example.com', 'user', false);
                posts = json.result;
                posts.sort(function (a, b) {
                    if (a.postingDate <= b.postingDate) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
            } else {
                isRealUser = true;
                user = json.user;
                posts = json.result;
                posts.sort(function (a, b) {
                    if (a.postingDate <= b.postingDate) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
            }
            if (isRealUser) {
                if (!user.isAdmin) {
                    const cartNumber = user.shortlist.length;
                    updateShoppingCart(cartNumber);
                    const signInDiv = document.querySelector("#signIn");
                    signInDiv.removeChild(signInDiv.lastElementChild);

                    const makePost = document.querySelector('#makePost');
                    makePost.setAttribute('href', '/pages/postAd.html');
                    const a = document.createElement("a");
                    a.setAttribute("href", "/pages/userProfile.html");
                    const imageContainer = document.createElement("div");
                    imageContainer.className = "topBarImageContainer";
                    const image = document.createElement("img");
                    image.className = "profileImage";
                    image.setAttribute("src", user.avatar);
                    image.setAttribute("style", "width: 40px; height: 40px;");
                    imageContainer.setAttribute("style", "width: 40px; height: 40px");
                    imageContainer.appendChild(image);
                    a.appendChild(imageContainer);
                    imageContainer.appendChild(image);
                    signInDiv.appendChild(a);
                } else {
                    const signInDiv = document.querySelector("#signIn");
                    signInDiv.removeChild(signInDiv.lastElementChild);

                    const a = document.createElement("a");
                    a.setAttribute("href", "/pages/adminDashboard.html");
                    const imageContainer = document.createElement("div");
                    imageContainer.className = "topBarImageContainer";
                    const image = document.createElement("img");
                    image.className = "dashboardImage";
                    image.setAttribute("src", "/images/dashboard.svg");
                    imageContainer.appendChild(image);
                    a.appendChild(imageContainer);
                    imageContainer.appendChild(image);
                    signInDiv.appendChild(a);
                    const makePost = document.querySelector("#makePost");
                    const myCart = document.querySelector("#myCart");
                    makePost.style.display = "none";
                    myCart.style.display = "none";
                }
            } else {
                // hide the logout button if the user is not logged in
                const logout = document.querySelector("#logOut");
                logout.style.display = "none";
            }
            if (posts.length !== 0) {
                generateSearchResult(posts, user);
            } else {
                while (document.querySelector("#posts").lastElementChild) {
                    document.querySelector("#posts").removeChild(document.querySelector("#posts").lastElementChild)
                }
                const emptyInfoDiv = document.createElement("div");
                emptyInfoDiv.id = "emptyInformation";
                const text = document.createTextNode("There is no post match your search!");

                emptyInfoDiv.appendChild(text);
                document.querySelector("#posts").appendChild(emptyInfoDiv);
            }
        });
    }
}

function updateShoppingCart(newNumber) {
    const shoppingCartNumber = document.querySelector("#cartNumber");
    shoppingCartNumber.innerText = newNumber;
}

/**
 * Generate the posts onto the page.
 * @param posts the posts should appear on this page
 * @param user
 */
async function generateSearchResult(posts, user) {
    //clear the posts currently displayed on screen
    while (document.querySelector("#posts").lastElementChild) {
        document.querySelector("#posts").removeChild(document.querySelector("#posts").lastElementChild)
    }
    for (let i = 0; i < posts.length; i++) {
        // generatePost(posts[i], user).then((resultDiv) => {
        //     document.querySelector("#posts").firstElementChild.before(resultDiv);
        // }).catch((error) => {
        //     console.log(error);
        // });
        document.querySelector("#posts").append(await generatePost(posts[i], user));
    }
    const endOfResults = document.createElement("div");
    endOfResults.id = "endOfResults";
    endOfResults.appendChild(document.createTextNode("End of Results"));
    document.querySelector("#posts").appendChild(endOfResults);

}

/**
 * Generate the div of this post for the user. Buy item will replaced by "delete this post" if the user is an Admin
 * @param post the post that wanted to be displayed
 * @param user the current user, this is used to check whether item is already in the cart.
 */
function generatePost(post, user) {
    return new Promise((resolve, reject) => {
        fetch("/api/getUserUnsafe/" + post.seller).then((result) => {
            return result.json();
        }).then((json) => {
            const seller = json;
            const postDiv = document.createElement("div");
            postDiv.className = "post";

            const sellerProfilePhoto = document.createElement("img");
            sellerProfilePhoto.className = "profilePhoto";
            sellerProfilePhoto.setAttribute("src", seller.avatar);
            sellerProfilePhoto.setAttribute("alt", "avatar");

            // This is actually the title of the post now.
            const sellerNameSpan = document.createElement("span");
            sellerNameSpan.className = "userName";
            //sellerNameSpan.appendChild(document.createTextNode(seller.firstName + " " + seller.lastName));
            sellerNameSpan.appendChild(document.createTextNode(post.title));



            postDiv.appendChild(sellerProfilePhoto);
            postDiv.appendChild(sellerNameSpan);
            postDiv.appendChild(document.createElement("br"));

            postDiv.id = post._id;

            const categorySpan = document.createElement("span");
            categorySpan.className = "category";
            categorySpan.appendChild(document.createTextNode("seller: " + seller.username));
            postDiv.appendChild(categorySpan);

            const conditionSpan = document.createElement("span");
            conditionSpan.className = "condition";
            conditionSpan.appendChild(document.createTextNode("Condition: " + post.condition));
            postDiv.appendChild(conditionSpan);

            const editionSpan = document.createElement("span");
            editionSpan.className = "condition";
            editionSpan.appendChild(document.createTextNode("Edition: " + post.edition));
            postDiv.appendChild(editionSpan);

            const timeSpan = document.createElement("span");
            timeSpan.className = "timespan";
            const date = new Date(post.postingDate);
            timeSpan.appendChild(document.createTextNode("Posting Time: " +
                +date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ` ${date.getHours()}:${date.getMinutes()}`));
            postDiv.appendChild(timeSpan);

            postDiv.appendChild(document.createElement("br"));

            const ISBNSpan = document.createElement("span");
            ISBNSpan.className = "condition";
            ISBNSpan.appendChild(document.createTextNode("ISBN: " + post.ISBN));
            postDiv.appendChild(ISBNSpan);

            const priceDiv = document.createElement("div");
            priceDiv.className = "price";
            if (parseFloat(post.price) === 0) {
                priceDiv.appendChild(document.createTextNode("Free"));
            } else {
                priceDiv.appendChild(document.createTextNode("CAD " + post.price));
            }
            postDiv.appendChild(priceDiv);

            const descriptionDiv = document.createElement("div");
            descriptionDiv.className = "description";
            descriptionDiv.appendChild(document.createTextNode(post.description));
            postDiv.appendChild(descriptionDiv);

            if (post.image.length > 0) {
                const pictureContainer = document.createElement("div");
                const lightboxAttr = `pictureSet${num_posts}`;
                for (let k = 0; k < post.image.length; k++) {
                    const a = document.createElement("a");
                    a.setAttribute("href", "/" + post.image[k]);
                    a.setAttribute("data-lightbox", lightboxAttr);
                    const image = document.createElement("img");
                    image.className = "itemPicture";
                    image.setAttribute("src", "/" + post.image[k]);
                    a.appendChild(image);
                    pictureContainer.appendChild(a);
                }
                postDiv.appendChild(pictureContainer);
            }
            num_posts++;

            postDiv.appendChild(document.createElement("hr"));

            if (user.shortlist.filter((post) => {
                return post._id === postDiv.id;
            }).length === 0) {
                if (!user.isAdmin) {
                    const removeButton = document.createElement("button");
                    removeButton.className = "addToCart";
                    removeButton.appendChild(document.createTextNode("Add to Cart"));
                    removeButton.addEventListener("click", addToCart);
                    postDiv.appendChild(removeButton);
                }
            } else {
                if (!user.isAdmin) {
                    const addButton = document.createElement("button");
                    addButton.className = "removeFromCart";
                    addButton.appendChild(document.createTextNode("Remove from Cart"));
                    addButton.addEventListener("click", removeFromCart);
                    postDiv.appendChild(addButton);
                }
            }

            const contactSeller = document.createElement("button");
            contactSeller.className = "contactSeller";
            contactSeller.addEventListener("click", contactTheSeller);
            contactSeller.appendChild(document.createTextNode("Contact Seller"));

            if (user.isAdmin) {
                const deletePostBtn = document.createElement("button");
                deletePostBtn.className = "deletePost";
                deletePostBtn.appendChild(document.createTextNode("Delete this post"));
                deletePostBtn.addEventListener('click', deletePost);
                postDiv.appendChild(deletePostBtn);
            }
            postDiv.appendChild(contactSeller);
            resolve(postDiv);
        }).catch((error) => {
            console.log(error);
            reject();
        });
    });
}



function deletePost(e){

    if (window.confirm("Do you want to delete this post?")) {

        // get postId
        const postElement = e.target.parentElement;
        const request = new Request(`/api/dashboard/post/${postElement.id}`, {
            method: 'delete',
        });


        fetch(request).then((res) => {
            if (res.status === 200) {
                // remove post in DOM
                postElement.parentElement.removeChild(postElement);
                window.alert("You have deleted this post.");
            } else if(res.status === 401) {
                window.location = '/login';
            }else{
                window.alert("Fail to delete this post.");
            }
        }).catch((error) => {
        })

    }
}

function addToCart(e) {
    const postId = e.target.parentElement.id;
    const request = new Request("/api/addToCart/" + postId, {
        method: 'post',
    });
    fetch(request).then((newUser) => {
        if (newUser.status === 401) {
            window.location = '/login';
        } else if (newUser.status === 610) {
            alert("This is your item!");
            return Promise.reject();
        } else {
            return newUser.json();
        }
    }).then((newUser) => {
        updateShoppingCart(newUser.user.shortlist.length);
        //Change the button to remove the item from shopping cart.
        e.target.className = "removeFromCart";
        e.target.innerHTML = "";
        e.target.appendChild(document.createTextNode("Remove from Cart"));
        e.target.removeEventListener("click", addToCart);
        e.target.addEventListener("click", removeFromCart);
        user = newUser.user;
        updateShoppingCart(user.shortlist.length);
    }).catch((error) => {
        return;
    });
}

function removeFromCart(e) {
    const postId = e.target.parentElement.id;
    const request = new Request("/api/removeFromCart/" + postId, {
        method: 'delete',
    });
    fetch(request).then((newUser) => {
        if (newUser.status === 401) {
            window.location = '/login';
        } else {
            return newUser.json();
        }
    }).then((newUser) => {
        updateShoppingCart(newUser.newUser.shortlist.length);
        //Change the button to remove the item from shopping cart.
        e.target.className = "addToCart";
        e.target.innerHTML = "";
        e.target.appendChild(document.createTextNode("Add to Cart"));
        e.target.removeEventListener("click", removeFromCart);
        e.target.addEventListener("click", addToCart);
        user = newUser.newUser;
    });
}

const makePostButton = document.querySelector("#makePostButton");
makePostButton.addEventListener("click", makePost);

function makePost(e) {
    //Here should be some code check whether user is logged in
    //If not logged in, should jump to login page
    //Here simply jump to make post page
    document.location = "./postAd.html";
}

// const buyItemButtons = document.querySelectorAll(".buyItem");
// for (let i = 0; i < buyItemButtons.length; i++) {
//     buyItemButtons[i].addEventListener("click", buyItem);
// }
//
// function buyItem(e) {
//     //Server call to update the shopping cart of user
//     // Here just use user0
//     const postId = parseInt(e.target.parentElement.querySelector(".postIdNumber").innerHTML);
//     //Should make a server call to fetch the post, here just use the hardcoded posts array
//     const post = posts.filter(x => x.postId === postId)[0];
//     if (!post.byCreditCard) {
//         alert("The seller want you to pay him/her directly, please contact the seller!");
//     } else {
//         // jump to the credit card page
//         document.location = "./payment.html";
//         //Make a server call to submit the credit card Number and the postId!
//     }
// }


/*********************** Contact Seller by User "user" ************************/

function contactTheSeller(e) {
    e.preventDefault();

    const postId = e.target.parentElement.id;

    const postRequest = new Request(`/api/findSeller/${postId}`, {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    });

    fetch(postRequest).then((res) => {
        if (res.status === 200) {
            return res.json();
        }else if(res.status === 605){
            window.alert("This is your item.");
        }else if (res.status === 401) {
            window.location = '/login';
        }else{
            window.alert("Seller not found.");
        }
    }).then((json) => {
        const keyword = json.username;

        // find if the user to chat exists
        const newChat = {
            user1: keyword
        };

        const request = new Request("/api/createChat", {
            method: 'post',
            body: JSON.stringify(newChat),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        });
        fetch(request).then((res2) => {
            if (res2.status === 200) {
                return res2.json();
            }
        }).then((json) => {

            loadChatHistory(json);
            // set up chat box
            const chatName = document.querySelector('#chatName');
            chatName.innerText = keyword;
            const chatRoom = document.querySelector('#chatRoom');
            chatRoom.style.display = "block";
        })
    })
}

const searchButton = document.querySelector("#searchButton");
searchButton.addEventListener("click", searching);
const showAllButton = document.querySelector("#showAllButton");
showAllButton.addEventListener("click", showAll);

function showAll(e) {
    e.preventDefault();
    sessionStorage.removeItem("keyword");
    sessionStorage.removeItem("option");
    sessionStorage.removeItem("all");
    const keyword = document.querySelector("#searchBox").value.trim();
    const option = document.querySelector("#searchMethod").value;
    sessionStorage.setItem("keyword", keyword);
    sessionStorage.setItem("option", option);
    sessionStorage.setItem("all", "true");
    location.reload();
}


function searching(e) {
    e.preventDefault();
    if (document.querySelector("#searchBox").value.trim().length === 0) {
        return;
    }
    sessionStorage.removeItem("keyword");
    sessionStorage.removeItem("option");
    sessionStorage.removeItem("all");
    const keyword = document.querySelector("#searchBox").value.trim();
    const option = document.querySelector("#searchMethod").value;
    sessionStorage.setItem("keyword", keyword);
    sessionStorage.setItem("option", option);
    sessionStorage.setItem("all", "false");
    location.reload();
}

init();
