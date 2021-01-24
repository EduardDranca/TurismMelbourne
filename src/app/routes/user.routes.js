module.exports = app => {
    const users = require("../controllers/user.controller");
  
    var router = require("express").Router();
  
    router.post("/register", users.create);

    router.post("/signin", users.findOne);
  
    app.use('/', router);
  };