"use strict";

const express = require("express");
const port = process.env.PORT || 3000;
const session = require("express-session");
const fs = require("fs");
const mongoose = require("./db/mongoose").mongoose;
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

const Post = require("./models/Post").Post;
const User = require("./models/User").User;

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
    secret: "BookExchange",
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

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
