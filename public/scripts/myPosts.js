let num_posts = 0;

const sortingOpt = document.querySelector("#sortingOption");
sortingOpt.addEventListener("change", onSortingOptChange);

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
  } else {
    //priceHighToLow
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
  fetch(request)
    .then((result) => {
      return result.json();
    })
    .then((json) => {
      const curUser = json.user;
      user = curUser;
      if (!curUser.isAdmin) {
        const request = new Request("/api/myPosts");

        fetch(request)
          .then((res) => {
            if (res.status === 401) {
              window.location = "/login";
            }
            return res.json();
          })
          .then((json) => {
            user = json.user;
            posts = json.posts;
            posts.sort(function (a, b) {
              if (a.postingDate <= b.postingDate) {
                return 1;
              } else {
                return -1;
              }
            });
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
            imageContainer.appendChild(image);
            a.appendChild(imageContainer);
            imageContainer.appendChild(image);
            signInDiv.appendChild(a);
            if (posts.length === 0) {
              while (document.querySelector("#posts").lastElementChild) {
                document
                  .querySelector("#posts")
                  .removeChild(
                    document.querySelector("#posts").lastElementChild
                  );
              }
              const endOfResults = document.createElement("div");
              endOfResults.id = "endOfResults";
              endOfResults.appendChild(
                document.createTextNode("You haven't post anything yet")
              );
              document.querySelector("#posts").appendChild(endOfResults);
            } else {
              generateSearchResult(posts, user);
            }
          });
      } else {
        // console.log(sessionStorage.getItem("viewUserProfile"));
        const request = new Request(
          "/api/admin/userPosts/" + sessionStorage.getItem("viewUserProfile")
        );
        fetch(request)
          .then((result) => {
            return result.json();
          })
          .then((json) => {
            posts = json.posts;
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

            //document.querySelector("#chatShow").style.display = "none";
            document.querySelector("#myCart").style.display = "none";
            document.querySelector("#logOut").style.display = "none";
            document.querySelector("#makePostButton").style.display = "none";
            document.querySelector("#searchResult").innerText =
              "Following is the User's post";

            if (posts.length === 0) {
              while (document.querySelector("#posts").lastElementChild) {
                document
                  .querySelector("#posts")
                  .removeChild(
                    document.querySelector("#posts").lastElementChild
                  );
              }
              const endOfResults = document.createElement("div");
              endOfResults.id = "endOfResults";
              endOfResults.appendChild(
                document.createTextNode("The user hasn't post anything yet")
              );
              document.querySelector("#posts").appendChild(endOfResults);
            } else {
              generateSearchResult(posts, user);
            }
          });
      }
    });
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
    document
      .querySelector("#posts")
      .removeChild(document.querySelector("#posts").lastElementChild);
  }
  for (let i = 0; i < posts.length; i++) {
    // generatePost(posts[i], user).then((resultDiv) => {
    //     document.querySelector("#posts").appendChild(resultDiv);
    // }).catch((error) => {
    //     console.log(error);
    // });
    document
      .querySelector("#posts")
      .appendChild(await generatePost(posts[i], user));
  }
}

/**
 * Generate the div of this post for the user. Buy item will replaced by "delete this post" if the user is an Admin
 * @param post the post that wanted to be displayed
 * @param user the current user, this is used to check whether item is already in the cart.
 */
function generatePost(post, user) {
  return new Promise((resolve, reject) => {
    fetch("/api/getUser/" + post.seller)
      .then((result) => {
        return result.json();
      })
      .then((json) => {
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

        // const postIdSpan = document.createElement("span");
        // postIdSpan.className = "postId";
        // const postIdNumber = document.createElement("span");
        // postIdNumber.className = "postIdNumber";
        // postIdNumber.appendChild(document.createTextNode(post.postId));
        // postIdSpan.appendChild(postIdNumber);
        // postDiv.appendChild(postIdSpan);
        postDiv.id = post._id;

        const categorySpan = document.createElement("span");
        categorySpan.className = "category";
        categorySpan.appendChild(
          document.createTextNode("seller: " + seller.username)
        );
        postDiv.appendChild(categorySpan);

        const conditionSpan = document.createElement("span");
        conditionSpan.className = "condition";
        conditionSpan.appendChild(
          document.createTextNode("Condition: " + post.condition)
        );
        postDiv.appendChild(conditionSpan);

        const timeSpan = document.createElement("span");
        timeSpan.className = "timespan";
        const date = new Date(post.postingDate);
        timeSpan.appendChild(
          document.createTextNode(
            "Posting Time: " +
              +date.getFullYear() +
              "/" +
              date.getMonth() +
              "/" +
              date.getDate() +
              ` ${date.getHours()}:${date.getMinutes()}`
          )
        );
        postDiv.appendChild(timeSpan);

        const priceDiv = document.createElement("div");
        priceDiv.className = "price";
        priceDiv.appendChild(document.createTextNode("₹ " + post.price));
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
          if (!post.isSold) {
            const deleteItem = document.createElement("button");
            deleteItem.className = "deleteItem";
            deleteItem.appendChild(document.createTextNode("Delete this Post"));
            deleteItem.addEventListener("click", deleteAnItem);
            postDiv.appendChild(deleteItem);

            const editItem = document.createElement("button");
            editItem.className = "deleteItem";
            editItem.appendChild(document.createTextNode("Edit this Post"));
            editItem.addEventListener("click", editAnItem);
            postDiv.appendChild(editItem);

            if (!post.byCreditCard) {
              const soldItem = document.createElement("button");
              soldItem.className = "soldItem";
              soldItem.addEventListener("click", soldAnItem);
              soldItem.appendChild(document.createTextNode("Mark as Sold"));
              postDiv.appendChild(soldItem);
            } else {
              const dealBySystem = document.createElement("button");
              dealBySystem.disabled = true;
              dealBySystem.className = "dealBySystem";
              dealBySystem.appendChild(
                document.createTextNode("This post should be handle by system.")
              );
              postDiv.appendChild(dealBySystem);
            }
          } else {
            const soldButton = document.createElement("button");
            soldButton.disabled = true;
            soldButton.className = "dealBySystem";
            soldButton.appendChild(
              document.createTextNode("This post has already sold.")
            );
            postDiv.appendChild(soldButton);
          }
        } else {
          const deleteItem = document.createElement("button");
          deleteItem.className = "deleteItem";
          deleteItem.appendChild(document.createTextNode("Delete this Post"));
          deleteItem.addEventListener("click", deleteAnItem);
          postDiv.appendChild(deleteItem);
        }
        resolve(postDiv);
      })
      .catch((error) => {
        console.log(error);
        reject();
      });
  });
}

init();

const makePostButton = document.querySelector("#makePostButton");
makePostButton.addEventListener("click", makePost);

function makePost(e) {
  //Here should be some code check whether user is logged in
  //If not logged in, should jump to login page
  //Here simply jump to make post page
  document.location = "./postAd.html";
}

function deleteAnItem(e) {
  if (!user.isAdmin) {
    const postId = e.target.parentElement.id;
    const request = new Request("/api/deletePost/" + postId, {
      method: "delete",
    });
    const sure = confirm("Are you sure you want to delete this post.");
    if (!sure) {
      return;
    }
    fetch(request)
      .then((res) => {
        if (res.status !== 200) {
          window.location = "/login";
        }
        location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  } else {
    const postId = e.target.parentElement.id;
    const request = new Request("/api/dashboard/post/" + postId, {
      method: "delete",
    });
    const sure = confirm("Are you sure you want to delete this post.");
    if (!sure) {
      return;
    }
    fetch(request).then((res) => {
      if (res.status !== 200) {
        window.location = "/login";
      }
      location.reload();
    });
  }
}

/*********************** Mark an item as sold ************************/
function soldAnItem(e) {
  e.preventDefault();
  console.log(e.target.parentElement.id);
  const buyer = prompt(
    "Please input the username of the person you sold this item to:"
  );
  if (buyer.trim() === "") {
    return;
  }
  if (
    confirm(
      "After clicking yes, this item will add to the buyer's purchase and this item " +
        "will no longer appear in the search result.\nAre you sure of doing so?"
    )
  ) {
    const payload = {
      id: e.target.parentElement.id,
      buyer: buyer,
    };

    const request = new Request("/api/sellItem", {
      method: "post",
      body: JSON.stringify(payload),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    fetch(request)
      .then((res) => {
        console.log(res);
        debugger;
        if (res.status === 607) {
          alert("The user you just input doesn't exist");
          location.reload();
        } else {
          location.reload();
        }
      })
      .catch((error) => {
        console.log(error);
        location.reload();
      });
  }
}

function editAnItem(e) {
  const id = e.target.parentElement.id;
  console.log(posts);
  const post = posts.filter((thisPost) => {
    return thisPost._id === id;
  })[0];
  sessionStorage.setItem("postToUpdate", JSON.stringify(post));
  window.location = "/pages/updateAd.html";
}
