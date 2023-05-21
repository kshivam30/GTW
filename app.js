const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const {User} = require("./models/User.js");
const jwt = require('jsonwebtoken');
const { verifyToken } = require("./middleware/auth.js");
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const bodyParser = require("body-parser");

dotenv.config();

app.use(bodyParser.urlencoded({ extended: true }));
const port=80;

app.use(express.json())

// Express Specific Stuff
app.use('/static', express.static('static')); // For serving static files
app.use(express.urlencoded());

// PUG Specific Stuff
app.set('view engine', 'pug'); // Set the template engine as pug
app.set('views', path.join(__dirname, 'views')); // Set the views directory


// ENDPOINTS
app.get('/', (req,res)=>{
    const params = {}
    res.status(200).render('login.pug',params);
})
app.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    // res.render('home.pug', {
    //   token : token
    // });
  
    localStorage.setItem('token', JSON.stringify(token));
    // console.log(token);
    res.redirect('/home');
    // res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/register', (req,res)=>{
    const params = {}
    res.status(200).render('register.pug',params);
})
app.post('/register', async (req, res) => {
  try {
    var {
      fullName,
      email,
      password,
      gender,
    } = req.body;

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    password=passwordHash;

    const newUser = new User({
      fullName,
      email,
      password,
      gender,
    });
    const savedUser = await newUser.save();
    // res.status(201).json(savedUser);
    res.redirect('/');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/home', verifyToken, (req,res)=>{
    const params = {}
    res.status(200).render('home.pug',params);
})

app.get('/logout', verifyToken, (req,res)=>{
    localStorage.removeItem('token');
    res.redirect('/');
})


app.post('/update', verifyToken, async (req,res)=>{
  const { result, time } = req.body;
  const user = await User.findById(req.user.id);

  if(result==1) user.win++;
  else user.loss++;
  console.log(time);

  if(result==1){
    if(user.bestTime==='NOTA') user.bestTime=time;
    else{
      var min = time.substring(0,2);
      var sec = time.substring(3);

      var user_min = user.bestTime.substring(0,2);
      var user_sec = user.bestTime.substring(3);

      if(user_min > min){
        user.bestTime=time
      }
      else if(min>user_min){}
      else{
        if(sec<user_sec) user.bestTime=time;
      }
    }
  }

  await user.save();
  res.status(200).render('home.pug');
})

app.get('/profile', verifyToken, async(req,res)=>{
  const user = await User.findById(req.user.id);
  const users = await User.find();

  let arr=[];
  users.forEach(user=>{
    arr.push({name: user.fullName, win: user.win});
  });

  arr.sort((a, b) => {
    return b.win - a.win;
  });
  console.log(arr);
  // console.log(user);
  res.status(200).render('profile.pug', {user: user, arr: arr});
})

/* MONGOOSE SETUP */
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(process.env.PORT || port, () => console.log(`Server Port: ${port}`));

  })
  .catch((error) => console.log(`${error} did not connect`));
