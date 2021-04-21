const { request, response } = require('express');
const express = require('express');
const app = express();
const firebase = require('firebase')
var firebaseConfig = {
    apiKey: "AIzaSyBujDlmk_AaKWqMnMdPZoMOMgN3JatH2Go",
    authDomain: "railgoods.firebaseapp.com",
    projectId: "railgoods",
    storageBucket: "railgoods.appspot.com",
    messagingSenderId: "365694726224",
    appId: "1:365694726224:web:97a3e22cae2376a5382155"
  };

const firebaseApp = firebase.default.initializeApp(firebaseConfig);
const db = firebaseApp.firestore(); //database
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', (request, response) =>{
    response.render('index');
});

app.get('/signup', (req, res)=>{
    res.render('signup');
});
app.get('/login', (req, res)=>{
    res.render('login');
});
app.post('/alltrains', (req, res)=>{
    res.redirect('/alltrains');
});
app.get('/alltrains', (req, res)=>{
    res.render('alltrains');
})
app.listen(4000, ()=>{
    console.log("server is running");
});
