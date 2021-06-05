let num_posts = 0;

const sortingOpt = document.querySelector("#sortingOption");
sortingOpt.addEventListener("change", onSortingOptChange);

let posts;
let user;
let isRealUser;
let transactions;


function onSortingOptChange() {
    if (posts.length === 0) {
        return;
    }
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
    const request = new Request("/api/getCurrentUser");
    fetch(request).then((result) => {
        return result.json();
    }).then((json) => {
        const curUser = json.user;
        user = curUser;
        if (!curUser.isAdmin) {
            const request = new Request("/api/myPurchases");

            fetch(request).then((res) => {
                if (res.status === 401) {
                    window.location = '/login';
                }
                return res.json();
            }).then((json) => {
                posts = json.posts;
                posts.sort(function (a, b) {
                    if (a.postingDate <= b.postingDate) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
                isRealUser = true;
                user = json.user;
                transactions = json.transactions;
                const cartNumber = user.shortlist.length;
                updateShoppingCart(cartNumber);
                const signInDiv = document.querySelector("#signIn");
                signInDiv.removeChild(signInDiv.lastElementChild);

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
                if (posts.length === 0) {
                    while (document.querySelector("#posts").lastElementChild) {
                        document.querySelector("#posts").removeChild(document.querySelector("#posts").lastElementChild)
                    }
                    const endOfResults = document.createElement("div");
                    endOfResults.id = "endOfResults";
                    endOfResults.appendChild(document.createTextNode("You haven't bought any items yet"));
                    document.querySelector("#posts").appendChild(endOfResults);
                } else {
                    generateSearchResult(posts, user);
                }
            });
        }else{
            // console.log(sessionStorage.getItem("viewUserProfile"));
            const request = new Request("/api/admin/userPurchases/" +sessionStorage.getItem("viewUserProfile"));
            fetch(request).then((result) => {
                return result.json();
            }).then((json) => {
                posts = json.posts;
                transactions = json.transactions;
                posts.sort(function (a, b) {
                    if (a.postingDate <= b.postingDate) {
                        return 1;
                    } else {
                        return -1;
                    }
                });

                const signInDiv = document.querySelector("#signIn");
                signInDiv.removeChild(signInDiv.lastElementChild);

                const a = document.createElement("a");
                a.setAttribute("href", "/pages/adminDashboard.html");
                const imageContainer = document.createElement("div");
                imageContainer.className = "topBarImageContainer";
                const image = document.createElement("img");
                image.className = "profileImage";
                image.setAttribute("src", "/public/images/dashboard.svg");
                image.setAttribute("style", "width: 40px; height: 40px;");
                imageContainer.setAttribute("style", "width: 40px; height: 40px");
                imageContainer.appendChild(image);
                a.appendChild(imageContainer);
                imageContainer.appendChild(image);
                signInDiv.appendChild(a);

                document.querySelector("#chatShow").style.display = "none";
                document.querySelector("#myCart").style.display = "none";
                document.querySelector("#logOut").style.display = "none";
                document.querySelector("#searchResult").innerHTML = "Following is the user's purchases...";

                if (posts.length === 0) {
                    while (document.querySelector("#posts").lastElementChild) {
                        document.querySelector("#posts").removeChild(document.querySelector("#posts").lastElementChild)
                    }
                    const endOfResults = document.createElement("div");
                    endOfResults.id = "endOfResults";
                    endOfResults.appendChild(document.createTextNode("The user hasn't bought any items yet"));
                    document.querySelector("#posts").appendChild(endOfResults);
                } else {
                    generateSearchResult(posts, user);
                }
            });

        }

    })


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
        fetch("/api/getUser/" + post.seller).then((result) => {
            return result.json();
        }).then((json) => {
            const seller = json;
            const postDiv = document.createElement("div");
            postDiv.className = "post";

            const sellerProfilePhoto = document.createElement("img");
            sellerProfilePhoto.className = "profilePhoto";
            sellerProfilePhoto.setAttribute("src", seller.avatar);
            sellerProfilePhoto.setAttribute("alt", "sellerPhoto");

            // This is actually the title of the post now.
            const sellerNameSpan = document.createElement("span");
            sellerNameSpan.className = "userName";
            //sellerNameSpan.appendChild(document.createTextNode(seller.firstName + " " + seller.lastName));
            sellerNameSpan.appendChild(document.createTextNode(post.title));

            postDiv.appendChild(sellerProfilePhoto);
            postDiv.appendChild(sellerNameSpan);
            postDiv.appendChild(document.createElement("br"));

            postDiv.id = post._id;
            const thisTrans = transactions.filter((tran) => {return tran.postId === post._id})[0];

            const categorySpan = document.createElement("span");
            categorySpan.className = "category";
            categorySpan.appendChild(document.createTextNode("seller: " + seller.username));
            postDiv.appendChild(categorySpan);

            const conditionSpan = document.createElement("span");
            conditionSpan.className = "condition";
            conditionSpan.appendChild(document.createTextNode("Condition: " + post.condition));
            postDiv.appendChild(conditionSpan);

            const timeSpan = document.createElement("span");
            timeSpan.className = "timespan";
            const date = new Date(post.postingDate);
            timeSpan.appendChild(document.createTextNode("Posting Time: " +
                +date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ` ${date.getHours()}:${date.getMinutes()}`));
            postDiv.appendChild(timeSpan);

            const priceDiv = document.createElement("div");
            priceDiv.className = "price";
            priceDiv.appendChild(document.createTextNode("CAD " + post.price));
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
            if (!user.isAdmin) {
                const contactSeller = document.createElement("button");
                contactSeller.className = "contactSeller";
                contactSeller.addEventListener("click", contactTheSeller);
                contactSeller.appendChild(document.createTextNode("Contact Seller"));
                postDiv.appendChild(contactSeller);
            }

            const complete = document.createElement("button");
            complete.className = "complete";
            if (thisTrans.isComplete) {
                complete.appendChild(document.createTextNode("The transaction is complete"));
            } else {
                if (thisTrans.isFailure) {
                    complete.appendChild(document.createTextNode("The transaction is rejected"));
                } else {
                    complete.appendChild(document.createTextNode("The transaction is pending"));
                }
            }
            complete.disabled = true;
            postDiv.appendChild(complete);


            resolve(postDiv);
        }).catch((error) => {
            console.log(error);
            reject();
        });
    });
}

init();

/*********************** Contact Seller by User ************************/

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