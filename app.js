"use strict";

const express = require("express");
const port = process.env.PORT || 3000;
const session = require("express-session");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);
const fs = require("fs");
const mongoose = require("./db/mongoose").mongoose;
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

const Post = require("./models/Post").Post;
const User = require("./models/User").User;
const Transaction = require("./models/Transaction").Transaction;
const Chat = require("./models/Message").Chat;
const Recovery = require("./models/Recovery").Recovery;

const app = express();
const ObjectID = require("mongodb").ObjectID;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static directories
app.use("/", express.static(__dirname + "/public"));
app.use("/lightbox", express.static(__dirname + "/public/lightbox"));
app.use("/pages", express.static(__dirname + "/public/pages"));
app.use("/styles", express.static(__dirname + "/public/styles"));
app.use("/scripts", express.static(__dirname + "/public/scripts"));
app.use("/images", express.static(__dirname + "/public/images"));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use("/public/images", express.static(__dirname + "/public/images"));

app.use(
  session({
    secret: "UofTExchange",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
    },
  })
);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/404", (req, res, next) => {
  res.sendFile(__dirname + "/public/pages/404.html");
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.sendFile(__dirname + "/public/pages/userProfile.html");
  } else {
    res.sendFile(__dirname + "/public/pages/login.html");
  }
});

/*
 * Except two parameters in request body, keyword and option and all
 * option 0: find by title and description
 * option 1: find by ISBN
 **/
app.post("/api/search", (req, res) => {
  const keyword = req.body.keyword;
  const option = parseInt(req.body.option);
  const all = req.body.all;
  if (all === "true") {
    Post.find({ isSold: false }).then((posts) => {
      const payload = { result: posts };
      if (!req.session.user) {
        payload.user = null;
        res.send(payload);
      } else {
        User.findOne({ username: req.session.user }).then((result) => {
          payload.user = result;
          res.send(payload);
        });
      }
    });
  } else {
    const keywordRegex = new RegExp(keyword);
    if (option === 0) {
      Post.find({
        isSold: false,
        $or: [
          { title: { $regex: keywordRegex, $options: "i" } },
          { description: { $regex: keywordRegex, $options: "i" } },
        ],
      })
        .then((result) => {
          const payload = { result: result };
          if (!req.session.user) {
            payload.user = null;
            res.send(payload);
          } else {
            User.findOne({ username: req.session.user }).then((result) => {
              payload.user = result;
              res.send(payload);
            });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send();
        });
    } else {
      Post.find({ isSold: false, ISBN: keyword.trim() })
        .then((result) => {
          const payload = { result: result };
          if (!req.session.user) {
            payload.user = null;
            res.send(payload);
          } else {
            User.findOne({ username: req.session.user }).then((result) => {
              payload.user = result;
              res.send(payload);
            });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send();
        });
    }
  }
});

app.post("/api/createAccount", (req, res) => {
  const username = req.body.username.trim();
  const email = req.body.email.trim();
  User.findOne({ $or: [{ username: username }, { email: email }] })
    .then((result) => {
      if (result !== null) {
        if (result.username === username) {
          // 600 to indicate username exist
          res.status(600).send();
          return;
        } else if (result.email === email) {
          // 601 to indicate email exist
          res.status(601).send();
          return;
        }
      }
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        isAdmin: false,
        userName: req.body.username,
        avatar: "/public/images/user.png",
        bio: "Set your Bio",
        phone: "Set your PhoneNumber",
        sell: [],
        purchase: [],
        transaction: [],
        shortlist: [],
      });
      newUser
        .save()
        .then((result) => {
          res.send(result);
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send();
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.post("/api/postAd", upload.array("image", 4), (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  const files = req.files;
  let price;
  if (req.body.isFree) {
    price = 0;
  } else {
    price = req.body.price;
  }
  let byCreditCard;
  User.findOne({ username: req.session.user })
    .then((result) => {
      byCreditCard = req.body.handleBySelf !== "on";
      const newPost = new Post({
        title: req.body.title,
        seller: req.session.user,
        image: [],
        condition: req.body.condition,
        ISBN: req.body.ISBN,
        edition: req.body.edition,
        description: req.body.description,
        price: price,
        postingDate: new Date(),
        isSold: false,
        byCreditCard: byCreditCard,
      });
      for (let i = 0; i < files.length; i++) {
        newPost.image.push(files[i].path);
      }
      newPost
        .save()
        .then((result) => {
          res.redirect("/pages/myPosts.html");
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send();
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.post("/api/updateAd", upload.array("image", 4), (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  const files = req.files;
  let price;
  if (req.body.isFree) {
    price = 0;
  } else {
    price = req.body.price;
  }
  let byCreditCard;
  Post.findById(req.body.postId)
    .then((result) => {
      byCreditCard = req.body.handleBySelf !== "on";
      result.title = req.body.title;
      result.condition = req.body.condition;
      result.ISBN = req.body.ISBN;
      result.edition = req.body.edition;
      result.description = req.body.description;
      result.price = price;
      result.byCreditCard = byCreditCard;
      result.image = [];
      for (let i = 0; i < files.length; i++) {
        result.image.push(files[i].path);
      }
      User.find({ "shortlist._id": req.body.postId }).then((users) => {
        for (let i = 0; i < users.length; i++) {
          users[i].shortlist.pull(req.body.postId);
          users[i].shortlist.push(result);
          users[i].save().catch((error) => {
            console.log(error);
          });
        }
      });

      result
        .save()
        .then((result) => {
          res.redirect("/pages/myPosts.html");
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send();
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.post("/api/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.findByEmailPassword(username, password)
    .then((user) => {
      req.session.user = user.username;
      res.send();
    })
    .catch((error) => {
      res.status(401).send();
    });
});

app.post("/api/addToCart/:postId", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
  } else {
    if (!ObjectID.isValid(req.params.postId)) {
      res.status(600).send();
    }
    User.findOne({ username: req.session.user })
      .then((user) => {
        if (!user) {
          res.status(404).send();
        }
        if (
          user.shortlist.filter((post) => {
            return post._id.equals(req.params.postId);
          }).length !== 0
        ) {
          res.send({ user });
          return;
        }
        Post.findById(req.params.postId).then((post) => {
          if (!post) {
            res.status(404).send();
          }
          if (post.seller === req.session.user) {
            res.status(610).send();
            return;
          }
          user.shortlist.push(post);
          user
            .save()
            .then((user) => {
              res.send({ user });
            })
            .catch((error) => {
              console.log(error);
              res.status(500).send();
            });
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send();
      });
  }
});

app.delete("/api/removeFromCart/:postId", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
  } else {
    if (!ObjectID.isValid(req.params.postId)) {
      res.status(600).send();
    }
    User.findOne({ username: req.session.user })
      .then((user) => {
        if (!user) {
          res.status(404).send();
        }
        const temp = user.shortlist.filter((post) => {
          return !post._id.equals(req.params.postId);
        });
        if (temp.length === user.shortlist.length) {
          res.send({ newUser: user });
          return;
        } else {
          user.shortlist = temp;
        }
        user
          .save()
          .then((newUser) => {
            res.send({ newUser });
          })
          .catch((error) => {
            console.log(error);
            res.status(500).send();
          });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send();
      });
  }
});

app.get("/api/user/:username", (req, res) => {
  User.findOne({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(404).send();
      } else {
        res.send(user);
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

/********************** for chat *************************/

// Middleware for authentication for resources
const authenticate = (req, res, next) => {
  if (req.session.user) {
    User.findOne({ username: req.session.user })
      .then((user) => {
        if (!user) {
          return Promise.reject();
        } else {
          req.user = user;
          next();
        }
      })
      .catch((error) => {
        res.status(401).send();
      });
  } else {
    res.status(401).send();
  }
};

app.get("/api/getUser/:username", authenticate, (req, res) => {
  User.findOne({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(404).send();
      } else {
        res.send(user);
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.get("/api/getUserUnsafe/:username", (req, res) => {
  User.findOne({ username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(404).send();
      } else {
        res.send(user);
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// create new chat between two users
app.post("/api/createChat", authenticate, (req, res) => {
  const user1 = req.user.username;
  const user2 = req.body.user1;
  if (user1 === user2) {
    res.status(404).send();
  }
  Chat.findOne({
    $or: [
      { user1: user1, user2: user2 },
      { user1: user2, user2: user1 },
    ],
  })
    .then((chat) => {
      if (chat !== null) {
        res.send({ user: user1, chat: chat });
      } else {
        const newChat = new Chat({
          user1: user1,
          user2: user2,
          user1Messages: [],
          user2Messages: [],
          messages: [],
        });

        newChat
          .save()
          .then((result) => {
            if (!result) {
              res.status(404).send();
            } else {
              res.send({ user: user1, chat: result });
            }
          })
          .catch((error) => {
            res.status(500).send();
          });
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

// find the chat between two users
app.get("/api/startChat/:user", authenticate, (req, res) => {
  const user2 = req.params.user;
  const user1 = req.user.username;

  Chat.findOne({
    $or: [
      { user1: user1, user2: user2 },
      { user1: user2, user2: user1 },
    ],
  })
    .then((chat) => {
      if (!chat) {
        res.status(404).send();
      } else {
        res.send({ user: user1, chat: chat });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// find all chat histories belonging to a user
app.get("/api/allChats", authenticate, (req, res) => {
  const username = req.user.username;
  Chat.find({ $or: [{ user1: username }, { user2: username }] })
    .then((chats) => {
      if (!chats) {
        res.status(404).send();
      } else {
        const usersToFind = chats.map((chat) => {
          if (chat.user1 === username) {
            return chat.user2;
          } else {
            return chat.user1;
          }
        });
        User.find({ username: { $in: usersToFind } }).then((users) => {
          if (!users) {
            res.status(404).send();
          } else {
            const avatars = users.map((user) => {
              return user.avatar;
            });
            res.send({ user: username, avatars: avatars, chats: chats });
          }
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

// add a new message to chat history
app.post("/api/chat/:chatId", authenticate, (req, res) => {
  const chatId = req.params.chatId;
  const username = req.user.username;
  if (!ObjectID.isValid(chatId)) {
    res.status(404).send();
  }

  Chat.findById(chatId)
    .then((chat) => {
      if (!chat) {
        res.status(404).send();
      } else {
        const newMessage = {
          time: req.body.time,
          sender: username,
          content: req.body.content,
        };
        if (username === chat.user1 || username === chat.user2) {
          chat.messages.push(newMessage);
          if (username === chat.user1) {
            chat.user1Messages.push(newMessage);
          } else {
            chat.user2Messages.push(newMessage);
          }
          chat.save().then((result) => {
            res.send(result);
          });
        } else {
          // unauthorized access
          res.status(401).send();
        }
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

// get a specific chat
app.get("/api/chat/:chatId", authenticate, (req, res) => {
  const chatId = req.params.chatId;
  const username = req.user.username;

  if (!ObjectID.isValid(chatId)) {
    res.status(404).send();
  }

  Chat.findById(chatId)
    .then((chat) => {
      if (!chat) {
        res.status(404).send();
      } else {
        if (username === chat.user1 || username === chat.user2) {
          res.send({ user: username, chat: chat });
        } else {
          res.status(401).send();
        }
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

// update chat history after loading new messages
app.post("/api/loadChat/:chatId", authenticate, (req, res) => {
  const chatId = req.params.chatId;
  const user = req.user.username;

  if (!ObjectID.isValid(chatId)) {
    res.status(404).send();
  }

  Chat.findById(chatId)
    .then((chat) => {
      if (!chat) {
        res.status(404).send();
      } else {
        if (user === chat.user1) {
          chat.user2Messages = [];
        } else if (user === chat.user2) {
          chat.user1Messages = [];
        } else {
          res.status(401).send();
          return;
        }
        chat.save().then((result) => {
          res.send(result);
        });
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

app.post("/api/changeProfilePicture", upload.single("image"), (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
  }
  User.findOne({ username: req.session.user }).then((user) => {
    user.avatar = "/" + req.file.path;
    user.save().then((newUser) => {
      res.redirect("/pages/userProfile.html");
    });
  });
});

app.get("/api/getCurrentUser", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
  } else {
    User.findOne({ username: req.session.user }).then((user) => {
      res.send({ user: user });
    });
  }
});

app.get("/api/findSeller/:postId", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  const postId = req.params.postId;
  if (!ObjectID.isValid(postId)) {
    res.status(404).send();
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        res.status(404).send();
      } else {
        if (post.seller !== req.session.user) {
          res.send({ username: post.seller });
        } else {
          res.status(605).send();
        }
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

app.post("/api/updatePhoneNumber/:newNumber", (req, res) => {
  const newNumber = req.params.newNumber;
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  if (isNaN(parseInt(newNumber)) || newNumber.trim().length !== 10) {
    res.status(600).send();
    return;
  }
  User.findOne({ username: req.session.user }).then((user) => {
    user.phone = newNumber;
    user
      .save()
      .then((newUser) => {
        res.redirect("/pages/userProfile.html");
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send();
      });
  });
});

app.post("/api/updateBio/:newBio", (req, res) => {
  const newBio = req.params.newBio;
  if (!req.session.user) {
    res.status(401).send();
  }
  User.findOne({ username: req.session.user }).then((user) => {
    user.bio = newBio;
    user
      .save()
      .then((newUser) => {
        res.redirect("/pages/userProfile.html");
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send();
      });
  });
});

app.post("/api/sendCode/:email", (req, res) => {
  const email = req.params.email;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        res.status(404).send();
        return;
      }
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 10);
      }
      const msg = {
        to: email,
        from: "recovery@uoftexchange.ca",
        subject: "Recovery your password",
        text: "Your recovery code is " + code,
      };

      Recovery.findOne({ email: email })
        .then((result) => {
          if (result) {
            result.code = code;
            result.save().then((newUser) => {
              sgMail.send(msg).catch((error) => {
                console.log(error);
              });
              req.session.recoverEmail = email;
              res.send();
            });
          } else {
            const recovery = new Recovery({
              email: email,
              code: code,
            });
            recovery.save().then((newUser) => {
              sgMail.send(msg).catch((error) => {
                console.log(error);
              });
              res.send();
            });
          }
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send();
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

/****************** for dashboard *****************/
// Middleware for authentication for resources
const adminAuthenticate = (req, res, next) => {
  if (req.session.user) {
    User.findOne({ username: req.session.user })
      .then((user) => {
        if (!user) {
          return Promise.reject();
        } else {
          if (user.isAdmin) {
            req.user = user;
            next();
          } else {
            return Promise.reject();
          }
        }
      })
      .catch((error) => {
        res.status(401).send();
      });
  } else {
    res.status(401).send();
  }
};

app.get("/api/dashboard/posts", adminAuthenticate, (req, res) => {
  Post.find({ isSold: false })
    .then((posts) => {
      if (!posts) {
        res.status(404).send();
      } else {
        res.send(posts);
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

app.get("/api/dashboard/transactions", adminAuthenticate, (req, res) => {
  Transaction.find({ isComplete: false, isSubmitted: true })
    .then((transactions) => {
      if (!transactions) {
        res.status(404).send();
      } else {
        res.send({ transactions: transactions });
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

app.delete("/api/dashboard/post/:postId", adminAuthenticate, (req, res) => {
  if (!ObjectID.isValid(req.params.postId)) {
    res.status(600).send();
    return;
  }
  const postId = req.params.postId;
  Post.findByIdAndDelete(postId)
    .then((post) => {
      if (!post) {
        res.status(404).send();
      } else {
        res.send(post);
      }
      User.find({ "shortlist._id": post._id }).then((users) => {
        for (let i = 0; i < users.length; i++) {
          users[i].shortlist.pull(post._id);
          users[i].save().catch((error) => {
            console.log(error);
          });
        }
      });
    })
    .catch((error) => {
      res.status(500).send();
    });
});

// This is for user delete post
app.delete("/api/deletePost/:postId", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  if (!ObjectID.isValid(req.params.postId)) {
    res.status(600).send();
    return;
  }
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        res.status(404).send();
      } else if (post.seller !== req.session.user) {
        // This is not the user's post, operation denied
        res.status(401).send();
      } else {
        Post.findByIdAndDelete(postId).then((post) => {
          if (!post) {
            res.status(404).send();
          } else {
            res.status(200).send();
          }
        });
        User.find({ "shortlist._id": post._id }).then((users) => {
          for (let i = 0; i < users.length; i++) {
            users[i].shortlist.pull(post._id);
            users[i].save().catch((error) => {
              console.log(error);
            });
          }
        });
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

app.get("/api/dashboard/users", adminAuthenticate, (req, res) => {
  User.find({ isAdmin: false })
    .then((users) => {
      if (!users) {
        res.status(404).send();
      } else {
        res.send(users);
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

app.delete("/api/dashboard/user/:user", adminAuthenticate, (req, res) => {
  const username = req.params.user;
  User.findOneAndDelete({ username: username })
    .then((user) => {
      if (!user) {
        res.status(404).send();
      } else {
        if (user.isAdmin) {
          res.status(605).send();
        } else {
          User.find().then((users) => {
            if (!users) {
              res.status(404).send();
            } else {
              Post.deleteMany({ seller: username }).then((result) => {
                User.find({ "shortlist.seller": username }).then((users) => {
                  for (let i = 0; i < users.length; i++) {
                    users[i].shortlist = users[i].shortlist.filter((post) => {
                      return post.seller !== username;
                    });
                    users[i]
                      .save()
                      .then((newUser) => {
                        return;
                      })
                      .catch((error) => {
                        console.log(error);
                      });
                  }
                });
                res.status(200).send();
              });
              res.send({ userNum: users.length });
            }
          });
        }
      }
    })
    .catch((error) => {
      res.status(500).send();
    });
});

app.post("/api/dashboard/transaction", adminAuthenticate, (req, res) => {
  const transactionId = req.body.transactionId;
  const approve = req.body.approve;

  if (approve) {
    Transaction.findByIdAndUpdate(transactionId, { $set: { isComplete: true } })
      .then((transaction) => {
        if (!transaction) {
          res.status(404).send();
        } else {
          res.status(200).send();
        }
      })
      .catch((error) => {
        res.status(500).send();
      });
  } else {
    Transaction.findByIdAndUpdate(transactionId, { $set: { isFailure: true } })
      .then((transaction) => {
        if (!transaction) {
          res.status(404).send();
        } else {
          Post.findByIdAndUpdate(transaction.postId, {
            $set: { isSold: false },
          }).then((post) => {
            if (!post) {
              res.status(606).send();
            } else {
              res.status(200).send();
            }
          });
        }
      })
      .catch((error) => {
        res.status(500).send();
      });
  }
});

/****************************************************/

app.post("/api/recover", (req, res) => {
  if (!req.session.recoverEmail) {
    res.status(401).send();
  }
  const code = req.body.code;
  const email = req.session.recoverEmail;
  const password = req.body.password;
  Recovery.findOne({ email: email })
    .then((entry) => {
      if (!entry) {
        res.status(401).send();
      } else {
        if (entry.code !== code) {
          res.status(401).send();
        } else {
          User.findOne({ email: email }).then((user) => {
            user.password = password;
            user.save().then((newUser) => {
              req.session.destroy((error) => {
                if (error) {
                  res.status(500).send(error);
                } else {
                  Recovery.findByIdAndDelete(entry._id).then((deleteEntry) => {
                    res.send(newUser);
                  });
                }
              });
            });
          });
        }
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.get("/userProfile", (req, res) => {
  res.sendFile(__dirname + "/public/pages/userProfile.html");
});

app.get("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      res.status(500).send();
    } else {
      res.redirect("/");
    }
  });
});

app.get("/shoppingCart", (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    res.redirect("/pages/shoppingCart.html");
  }
});

app.get("/api/isLogin", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
  } else {
    User.findOne({ username: req.session.user })
      .then((user) => {
        res.send({ user: user });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send();
      });
  }
});

app.get("/api/myPurchases", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  const username = req.session.user;
  Transaction.find({ buyer: username, isSubmitted: true })
    .then((transactions) => {
      const transactionIds = transactions.map((trans) => {
        return trans.postId;
      });
      Post.find({ _id: { $in: transactionIds } }).then((posts) => {
        User.findOne({ username: username }).then((user) => {
          res.send({ posts: posts, user: user, transactions: transactions });
        });
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.get("/api/admin/userPurchases/:username", adminAuthenticate, (req, res) => {
  const username = req.params.username;
  Transaction.find({ buyer: username })
    .then((transactions) => {
      const transactionIds = transactions.map((trans) => {
        return trans.postId;
      });
      Post.find({ _id: { $in: transactionIds } }).then((posts) => {
        User.findOne({ username: username }).then((user) => {
          res.send({ posts: posts, user: user, transactions: transactions });
        });
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.get("/api/myPosts", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  const username = req.session.user;
  Post.find({ seller: username }).then((posts) => {
    User.findOne({ username: username }).then((user) => {
      res.send({ posts: posts, user: user });
    });
  });
});

app.get("/api/admin/userPosts/:username", adminAuthenticate, (req, res) => {
  const username = req.params.username;
  Post.find({ seller: username }).then((posts) => {
    User.findOne({ username: username }).then((user) => {
      res.send({ posts: posts, user: user });
    });
  });
});

app.post("/api/sellItem", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  const id = req.body.id;
  const buyer = req.body.buyer;
  const username = req.session.user;
  Post.findById(id)
    .then((post) => {
      if (!post) {
        res.status(404).send();
        return;
      }
      if (post.seller !== username) {
        res.status(401).send();
        return;
      }
      if (post.isSold) {
        res.status(400).send();
      }
      User.find({ username: buyer }).then((user) => {
        if (!user) {
          res.status(607).send();
          return;
        }
        post.isSold = true;
        post.buyer = buyer;
        const transaction = new Transaction({
          postId: post._id,
          date: new Date(),
          isComplete: true,
          title: post.title,
          amount: 0,
          seller: req.session.user,
          buyer: buyer,
          handleByUser: true,
          isSubmitted: true,
          isFailure: false,
        });
        transaction.save().then((trans) => {
          post.save().then((newPost) => {
            User.find({ "shortlist._id": post._id }).then((users) => {
              for (let i = 0; i < users.length; i++) {
                users[i].shortlist.pull(post._id);
                users[i]
                  .save()
                  .then((newUser) => {
                    return;
                  })
                  .catch((error) => {
                    console.log(error);
                  });
              }
            });
            res.status(200).send();
          });
        });
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.post("/api/checkout", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }

  const checkoutItems = req.body.items;
  const transactions = [];
  for (let i = 0; i < checkoutItems.length; i++) {
    const transaction = new Transaction({
      postId: checkoutItems[i]._id,
      date: new Date(),
      isComplete: false,
      title: checkoutItems[i].title,
      amount: checkoutItems[i].price,
      seller: checkoutItems[i].seller,
      buyer: req.session.user,
      handleByUser: false,
      isSubmitted: false,
      isFailure: false,
    });
    transactions.push(transaction);
  }
  Transaction.insertMany(transactions)
    .then((docs) => {
      res.status(200).send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

app.post("/api/submitPayment", (req, res) => {
  if (!req.session.user) {
    res.status(401).send();
    return;
  }
  const checkoutItems = req.body.items;
  const creditCardNumber = req.body.creditCardNumber;
  //The index of items to be removed from user shorlist
  User.findOne({ username: req.session.user })
    .then((user) => {
      for (let i = 0; i < checkoutItems.length; i++) {
        user.shortlist.pull(checkoutItems[i]);
        Transaction.findOne({ postId: checkoutItems[i]._id })
          .then((trans) => {
            trans.isSubmitted = true;
            trans.creditCardNumber = creditCardNumber;
            trans
              .save()
              .then((newTrans) => {
                const postId = trans.postId;
                Post.findByIdAndUpdate(postId, { $set: { isSold: true } }).then(
                  (post) => {
                    User.find({ "shortlist._id": post._id }).then((users) => {
                      for (let i = 0; i < users.length; i++) {
                        users[i].shortlist.pull(post._id);
                        users[i]
                          .save()
                          .then((newUser) => {
                            return;
                          })
                          .catch((error) => {
                            console.log(error);
                          });
                      }
                    });
                  }
                );
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      }
      user.save().catch((error) => {
        console.log(error);
      });
      res.status(200).send();
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
    });
});

const sayHello = () => {
  return "hello";
};

module.exports = {
  sayHello,
};

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
