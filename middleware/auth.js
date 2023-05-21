const jwt = require('jsonwebtoken');
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

const verifyToken = async (req, res, next) => {
    try {
    //   let token = req.header("Authorization");
      let token = JSON.parse(localStorage.getItem('token'));
  
      if (!token) {
        return res.status(403).send("Access Denied");
      }
  
    //   if (token.startsWith("")) {
    //     token = token.slice(7, token.length).trimLeft();
    //   }
  
    //   console.log("hello");
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      req.user = verified;

      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  module.exports = { verifyToken };