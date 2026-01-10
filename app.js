const express = require("express");
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("post");
  // console.log(user); //now showing just id's
  res.render("profile", { user });
});


app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post  = await postModel
    .findOne({_id: req.params.id })
    .populate("user");
    if(post.likes.indexOf(req.user.userid) === -1){
       post.likes.push(req.user.userid);
    }else {
      post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
  // console.log(user); //now showing just id's
  res.redirect("/profile");
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post  = await postModel
    .findOne({_id: req.params.id })
    .populate("user");
    if(post.likes.indexOf(req.user.userid) === -1){
       post.likes.push(req.user.userid);
    }else {
      post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
  // console.log(user); //now showing just id's
  res.redirect("/profile");
});

app.post("/post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { postdata } = req.body;
  let post = await postModel.create({
    user: user._id,
    postdata,
  });
  if (postdata) {
    user.post.push(post._id);
    await user.save();
  }
  // console.log("yes post ");
  res.redirect("/profile");
});

app.post("/register", async (req, res) => {
  let { name, username, age, email, password } = req.body;
  let user = await userModel.findOne({ email });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        name,
        username,
        age,
        email,
        password: hash,
      });
      let token = jwt.sign(
        { email: email, userid: user._id },
        "shhhhhhhhhhhhhhh"
      );
      res.cookie("token", token);
      // res.send(user);
      res.redirect("/profile");
    });
  });
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send(`
      <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#0f172a;">
        <h1 style="color:#f87171;font-family:sans-serif;">
          Something went wrong 😢 \n may be you don't have account
        </h1>
      </div>
    `);
  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign(
        { email: email, userid: user._id },
        "shhhhhhhhhhhhhhh"
      );
      res.cookie("token", token);
      res.redirect("/profile");
    } else res.redirect("/login");
  });
});
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") res.redirect("/login");
  else {
    let data = jwt.verify(req.cookies.token, "shhhhhhhhhhhhhhh"); //for checking coming token is valid or not if yes then store in user
    req.user = data;
  }
  next();
}

app.listen(3000);
