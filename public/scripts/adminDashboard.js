let postEdited = 0; // for edit mode
let shownUserNum = 0; // for user display


// load data on DOM loaded
document.addEventListener('DOMContentLoaded', function () {
    loadMessage();
    loadTransaction();
    loadPost();
    loadUserList();

});


function loadMessage() {
    const request = new Request("/api/allChats", {
        method: 'get',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    });


    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json()
        } else if (res.status === 401) {
            window.location = '/login';
        } else {
            document.querySelector('#msgData').innerText = 0;
        }
    }).then((json) => {
        const thisUser = json.user;
        document.querySelector('#msgData').innerText = json.chats.reduce((total, chat) => {
            if (thisUser === chat.user1) {
                return total += chat.user2Messages.length;
            } else {
                return total += chat.user1Messages.length;
            }
        }, 0);
    }).catch((error) => {
    })
}

function loadTransaction() {

    const request = new Request("/api/dashboard/transactions", {
        method: 'get',
    });

    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json()
        } else if (res.status === 401) {
            window.location = '/login';
        } else {
            document.querySelector('#transactionData').innerText = 0;
        }
    }).then((json) => {
        const transactions = json.transactions;
        document.querySelector('#transactionData').innerText = transactions.length;
        for (let i = 0; i < transactions.length; i++) {
            createTransactionEntry(transactions[i]);
        }
    }).catch((error) => {
    })
}

function loadTransactionNum() {

    const request = new Request("/api/dashboard/transactions", {
        method: 'get',
    });

    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json()
        } else if (res.status === 401) {
            window.location = '/login';
        } else {
            document.querySelector('#transactionData').innerText = 0;
        }
    }).then((json) => {
        const transactions = json.transactions;
        document.querySelector('#transactionData').innerText = transactions.length;
    }).catch((error) => {
    })
}


function loadPost() {
    const request = new Request("/api/dashboard/posts", {
        method: 'get',
    });

    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json()
        } else if (res.status === 401) {
            window.location = '/login';
        } else {
            document.querySelector('#postData').innerText = 0;
        }
    }).then((posts) => {
        document.querySelector('#postData').innerText = posts.length;
        const postList = document.querySelector('#postListRow');
        while (postList.firstElementChild.id !== "viewAll") {
            postList.removeChild(postList.firstElementChild);
        }
        let j = 5;
        for (let i = 0; i < posts.length; i++) {
            if (j > 0) {
                if (posts[i].isSold === false) {
                    createPost(posts[i]);
                }
                j--;
            } else {
                break;
            }
        }

        const deleteItems = document.querySelectorAll('.deleteItem');
        Array.from(deleteItems).forEach(function (element) {
            element.addEventListener('click', deleteItem);
        });
    }).catch((error) => {
    })
}


function loadUserList() {
    const request = new Request("/api/dashboard/users", {
        method: 'get'
    });


    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json()
        } else if (res.status === 401) {
            window.location = '/login';
        } else {
            document.querySelector('#userData').innerText = 0;
        }
    }).then((users) => {
        document.querySelector('#userData').innerText = users.length;
        const length = Math.min(users.length - shownUserNum, 3);
        for (let i = 0; i < length; i++) {
            const userEntry = createUserEntry(users[i + shownUserNum]);
            userTable.appendChild(userEntry);
        }
        shownUserNum += length;

    }).catch((error) => {
    })
}


/********** navigation bar expansion and close ***********/


const main = document.querySelector("#main");
const navExpansion = document.querySelector("#navExpansion");
const navClose = document.querySelector('#navClose');
navExpansion.addEventListener('click', openSideNav);
navClose.addEventListener('click', closeSideNav);

function openSideNav(e) {
    e.preventDefault();
    document.querySelector("#sideNav").style.width = "250px";
    main.style.marginLeft = "250px";
}

function closeSideNav(e) {
    e.preventDefault();
    document.querySelector("#sideNav").style.width = "0";
    main.style.marginLeft = "0";
}


/***************** Post Management *****************/

const editPost = document.querySelector("#editPost");
editPost.addEventListener('click', changeEditMode);

const viewAllBtn = document.querySelector('#viewAll');
viewAllBtn.addEventListener('click', viewAllPosts);

function changeEditMode(e) {
    e.preventDefault();

    if (postEdited === 0) {
        postEdited = 1;
        editPost.innerText = "save";
        const deleteItems = document.querySelectorAll('.deleteItem');
        for (let i = 0; i < deleteItems.length; i++) {
            deleteItems[i].style.display = "inline-block";
        }
    } else {
        postEdited = 0;
        editPost.innerText = "edit";
        loadPost();
        const deleteItems = document.querySelectorAll('.deleteItem');
        for (let i = 0; i < deleteItems.length; i++) {
            deleteItems[i].style.display = "none";
        }
    }
}

function deleteItem(e) {
    e.preventDefault();

    if (window.confirm("Do you want to delete this post?")) {

        // get postId
        const postId = e.target.parentElement.parentElement.parentElement.id;

        const request = new Request(`/api/dashboard/post/${postId}`, {
            method: 'delete',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        });


        fetch(request).then((res) => {
            if (res.status === 401) {
                window.location = '/login';
            } else if (res.status === 200) {
                // remove post in DOM
                removePost(e);
                window.alert("You have deleted this post.");
            } else {
                window.alert("Fail to delete this post.");
            }
        }).catch((error) => {
        })

    }
}


function removePost(e) {
    const post = e.target.parentElement.parentElement.parentElement;
    const entry = post.parentElement;
    entry.removeChild(post);
}


function createPost(post) {

    const close = document.createElement("span");
    close.className = "deleteItem";
    const icon = document.createElement('i');
    icon.classList.add("fa");
    icon.classList.add("fa-fw");
    icon.classList.add("fa-close");
    close.appendChild(icon);

    const img = document.createElement('img');
    if (post.image[0] !== undefined) {
        img.src = '/' + post.image[0];
    } else {
        img.src = '/public/images/defaultBook.png';
    }
    img.alt = "textbook";
    img.className = "textbookImg";

    const seller = document.createElement("span");
    seller.className = "seller";
    seller.innerText = `seller: ${post.seller}`;

    const price = document.createElement("span");
    price.className = "price";
    price.innerText = `$${post.price}`;

    const ISBN = document.createElement("span");
    ISBN.className = "ISBN";
    ISBN.innerText = `ISBN: ${post.ISBN}`;

    const postContainer = document.createElement('div');
    postContainer.className = "post";
    postContainer.appendChild(close);
    postContainer.appendChild(img);
    postContainer.appendChild(seller);
    seller.appendChild(price);
    postContainer.appendChild(ISBN);

    const container = document.createElement('div');
    container.classList.add("col-lg-2");
    container.classList.add("col-md-4");
    container.appendChild(postContainer);

    container.id = post._id;

    viewAllBtn.before(container);
}


function viewAllPosts(e) {
    e.preventDefault();

    const request = new Request("/api/getCurrentUser", {method: "get"});

    fetch(request).then((res) => {
        if(res.status === 401){
            window.location = '/login'
        }else if(res.status === 200){
            window.open("/pages/items.html");
            sessionStorage.setItem("all", "true");
        }
    }).catch((error) => {
    })
}


/******************** User Management ********************/

const userList = document.querySelector("#userList");
const userTable = document.querySelector("#userTable");
const listEnd = document.querySelector("#userListEnd");

const showLessButton = document.querySelector("#showLessUser");
const showMoreButton = document.querySelector('#showMoreUser');
const userSearchButton = document.querySelector('#userSearchButton');

showLessButton.addEventListener('click', showLess);
showMoreButton.addEventListener('click', showMore);
userSearchButton.addEventListener('click', searchUser);


function viewUserDetail(e) {
    e.preventDefault();

    const userToView = e.target.parentElement.parentElement.id;
    sessionStorage.setItem("viewUserProfile", userToView);
    window.open("/pages/userProfile.html");
}


// show less user, remove userEntry in DOM
function showLess(e) {
    e.preventDefault();

    const userEntries = document.querySelectorAll('.userEntry');
    const num = shownUserNum;
    for (let i = 1; i <= num; i++) {
        try {
            userTable.removeChild(userEntries[i]);
            shownUserNum--;
        } catch (error) {
        }
    }
}


// show more user
function showMore(e) {
    e.preventDefault();

    loadUserList();
}


function searchUser(e) {
    e.preventDefault();

    const keyword = document.querySelector('#userKeyword').value;
    if (keyword !== "") {

        const request = new Request(`/api/getUser/${keyword}`, {
            method: 'get'
        });

        fetch(request).then((res) => {
            if (res.status === 200) {
                return res.json();
            } else if (res.status === 404) {
                return null;
            } else if (res.status === 401) {
                window.location = '/login';
            }
        }).then((user) => {
            if (!user) {
                showNoResult();
            } else {
                showResult(user);
            }
        }).catch((error) => {
        })

    } else {
        userTable.style.display = "block";
        listEnd.style.display = "block";

        // hide search result table
        const userTable1 = document.querySelector('#userTable1');
        if (userTable1 !== null) {
            userTable1.style.display = "none";
        }
    }
}


function showResult(user) {

    const resultTableOld = document.querySelector("#userTable1");
    if (resultTableOld !== null) {
        userList.removeChild(resultTableOld);
    }

    const userTable1 = document.createElement('div');
    userTable1.id = "userTable1";

    const userEntry = createUserEntry(user);

    userTable1.appendChild(userEntry);
    listEnd.before(userTable1);

    userTable.style.display = "none";
    listEnd.style.display = "none";

}


// helper function for show search user, deals with the situation when
// no result has been found
function showNoResult() {

    const resultTableOld = document.querySelector("#userTable1");
    if (resultTableOld !== null) {
        userList.removeChild(resultTableOld);
    }

    const userTable1 = document.createElement('div');
    userTable1.id = "userTable1";

    const noResultEntry = document.createElement('div');
    noResultEntry.className = "noResultEntry";
    noResultEntry.innerText = "No Result Found";

    userTable1.appendChild(noResultEntry);
    listEnd.before(userTable1);

    userTable.style.display = "none";
    listEnd.style.display = "none";
}


function deleteUserEntry(e) {
    e.preventDefault();

    if (window.confirm("Do you want to delete this user?")) {

        // get username
        const user = e.target.parentElement.parentElement;
        const usernameContainer = user.firstElementChild.lastElementChild.firstElementChild;
        const username = usernameContainer.innerText;

        const request = new Request(`/api/dashboard/user/${username}`, {
            method: 'delete',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        });


        fetch(request).then((res) => {
            if (res.status === 401) {
                window.location = '/login';
            } else if (res.status === 200) {
                return res.json();
            } else if (res.status === 605) {
                window.alert("You cannot delete yourself.");
            } else {
                window.alert("Fail to delete this user.");
            }
        }).then((json) => {
                // remove post in DOM
                removeUser(e);
                window.alert("You have deleted this user.");
                document.querySelector('#userData').innerText = parseInt(json.userNum);
            }
        ).catch((error) => {
        })
    }
}


function removeUser(e) {
    const user = e.target.parentElement.parentElement;
    const table = user.parentElement;
    table.removeChild(user);
}


// Create an entry for user table
function createUserEntry(user) {

    const userEntry = document.createElement("div");
    userEntry.className = "userEntry";
    userEntry.id = user.username;

    const userContainer = document.createElement('div');
    userContainer.className = "user";
    userEntry.appendChild(userContainer);

    // User Picture
    const userPicContainer = document.createElement('div');
    userPicContainer.className = "userPicContainer";
    userContainer.appendChild(userPicContainer);

    const userPic = document.createElement('img');
    userPic.src = user.avatar;
    userPic.className = "userPic";
    userPic.alt = "userPic";
    userPicContainer.appendChild(userPic);

    // User Description
    const userContent = document.createElement('div');
    userContent.className = "userContent";
    userContainer.appendChild(userContent);

    const username = document.createElement('strong');
    username.innerText = user.username;
    userContent.appendChild(username);

    const bio = document.createElement('p');
    bio.innerText = user.bio;
    userContent.appendChild(bio);


    const userAction = document.createElement('div');
    userAction.className = "userAction";
    userEntry.appendChild(userAction);

    const viewUser = document.createElement('button');
    viewUser.className = "viewUserDetail";
    viewUser.innerText = "View Detail";
    viewUser.addEventListener("click", viewUserDetail);
    userAction.appendChild(viewUser);

    const deleteUser = document.createElement("button");
    deleteUser.className = "deleteUser";
    deleteUser.innerText = "Delete";
    deleteUser.addEventListener('click', deleteUserEntry);
    userAction.appendChild(deleteUser);

    return userEntry;
}


/***************** Transaction Management *****************/


const approveButtons = document.querySelectorAll(".approve");
const denyButtons = document.querySelectorAll(".deny");

Array.from(approveButtons).forEach(function (element) {
    element.addEventListener('click', checkTransaction);
});
Array.from(denyButtons).forEach(function (element) {
    element.addEventListener('click', checkTransaction);
});

function checkTransaction(e) {
    e.preventDefault();

    const row = e.target.parentElement.parentElement.parentElement;
    const transactionId = row.id;

    if (e.target.classList.contains('approve')) {
        if (window.confirm("Do you want to approve this transaction?")) {

            const transactionHandler = {
                transactionId: transactionId,
                approve: true
            };

            const request = new Request('/api/dashboard/transaction', {
                method: 'post',
                body: JSON.stringify(transactionHandler),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            });

            fetch(request).then((res) => {
                if (res.status === 401) {
                    window.location = '/login';
                } else if (res.status === 200) {
                    deleteTransactionEntry(e);
                    window.alert("You have approved this transaction.");

                    loadTransactionNum();
                    loadPost();
                } else {
                    window.alert("Fail to approve this transaction.");
                }
            }).catch((error) => {
            })

        }
    } else if (e.target.classList.contains('deny')) {
        if (window.confirm("Do you want to deny this transaction?")) {

            const transactionHandler = {
                transactionId: transactionId,
                approve: false
            };

            const request = new Request('/api/dashboard/transaction', {
                method: 'post',
                body: JSON.stringify(transactionHandler),
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            });

            fetch(request).then((res) => {
                if (res.status === 401) {
                    window.location = '/login';
                } else if (res.status === 200) {
                    deleteTransactionEntry(e);

                    window.alert("You have denied this transaction.");
                    loadTransactionNum();
                    loadPost();
                } else {
                    window.alert("Fail to deny this transaction.");
                }
            }).catch((error) => {
            })
        }
    }
}

function deleteTransactionEntry(e) {
    const row = e.target.parentElement.parentElement.parentElement;
    const tableBody = document.querySelector("#transactionTable").lastElementChild;
    tableBody.removeChild(row);
}

function createTransactionEntry(transaction) {

    const row = document.createElement('tr');

    row.id = transaction._id;

    const title = document.createElement('td');
    title.innerText = transaction.title;
    row.appendChild(title);

    const buyer = document.createElement('td');
    buyer.innerText = transaction.buyer;
    row.appendChild(buyer);

    const seller = document.createElement('td');
    seller.innerText = transaction.seller;
    row.appendChild(seller);

    const amount = document.createElement('td');
    amount.innerText = transaction.amount;
    row.appendChild(amount);

    const creditCard = document.createElement('td');
    creditCard.innerText = `********${transaction.creditCardNumber.toString().slice(11, 15)}`;
    row.appendChild(creditCard);

    const date = document.createElement('td');
    const tranDate = new Date(transaction.date);
    date.innerText = `${tranDate.toDateString()}   ${tranDate.getHours()}: ${tranDate.getMinutes()}: ${tranDate.getSeconds()}`;
    row.appendChild(date);

    const action = document.createElement('td');
    const link1 = document.createElement('a');
    link1.href = "#";
    const icon1 = document.createElement('i');
    icon1.classList.add("fa");
    icon1.classList.add("fa-fw");
    icon1.classList.add("fa-check");
    icon1.classList.add("approve");
    icon1.addEventListener('click', checkTransaction);
    link1.appendChild(icon1);
    const link2 = document.createElement('a');
    link2.href = "#";
    const icon2 = document.createElement('i');
    icon2.classList.add("fa");
    icon2.classList.add("fa-fw");
    icon2.classList.add("fa-close");
    icon2.classList.add("deny");
    icon2.addEventListener('click', checkTransaction);
    link2.appendChild(icon2);
    action.append(link1);
    action.appendChild(link2);
    row.appendChild(action);

    const tableBody = document.querySelector("#transactionTable").lastElementChild;
    tableBody.appendChild(row);

}