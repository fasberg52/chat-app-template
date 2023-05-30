const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.getLogin = (req, res) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  res.render("auth/login", {
    path: "/login",
    pageTitle: "ورود",
    errorMessage: message,
    successMessage: req.flash("success"),
  });
};

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      req.flash("error", "ایمیل اشتباه است");
      return res.redirect("/login");
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        req.session.isLoggedIn = true;
        req.session.user = user;
        retrun = req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      } else {
        req.flash("error", "پسورد شما اشتباه است");
        return res.redirect("/login");
      }
    });
  });
};

exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "ثبت نام",
    errorMessage: req.flash("error"),
  });
};

exports.postSignup = (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })

    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "ایمیل دیگری با این مشخصات ثبت نام کرده است");
        return res.redirect("/signup");
      }
      return bcrypt.hash(password, 12).then((hashedPassword) => {
        const user = new User({
          email: email,
          name: name,
          password: hashedPassword,
        });
        return user.save();
      });
    })
    .then((result) => {
      req.flash("success", "ثبت نام شما با موفقیت انجام شد میتوانید وارد شوید");
      res.redirect("/login");
      console.log(`user signed up - email : ${email}`);
    })
    .catch((err) => {
      console.log(err);
    });
};
