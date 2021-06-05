let transactionId = 0;
let date = new Date();

class Transaction{
  constructor(post, buyer, amount) {
    this.id = transactionId;
    this.date = date.toDateString();
    this.status = 0;    // 0 for uncompleted, 1 for completed
    transactionId ++;
    post.isSold = 1;
    post.transaction = this;
    buyer.purchase.push(post);
    this.post = post;
    this.buyer = buyer;
    this.amount = amount;
  }
}

let postId = 0;
class Post {
  constructor(title, seller, price, category, condition, description, images=[], byCreditCard) {
    this.postId = postId++;
    this.title = title;
    this.seller = seller;
    seller.sell.push(this);
    this.images = images;              // default value is empty list
    this.category = category;
    this.condition = condition;
    this.description = description;
    this.price = price;
    this.postingDate = new Date();
    this.isSold = false;
    this.byCreditCard = byCreditCard;
    //Should bind with the corresponding transaction if there is one
    this.transaction = null;
  }
}

class User {
  constructor(firstName, lastName, username, email, password, isAdmin=false) {
    // --- Private attributes ---
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
    this.password = password;  // we can fix this in phase 2
    this.isAdmin = isAdmin;
    this.avatar = "../images/profilePic.jpg";                  // src of default avatar
    this.bio = "This is my bio.";
    this.phone = "0123456789";
    this.sell = [];                    // selling items
    this.purchase = [];                // purchased items
    this.shortlist = [];
  }
}


