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

app.use(express.urlencoded({extended: true}));
app.get('/', (request, response) =>{
    if(user != null){
        response.render('index');
        console.log('login successful');
    }
    else {
        response.render('index');
    }
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

var user= null;
app.post('/login', async(req, res) =>{
    let loginUsername = req.body.username;
    let loginPassword = req.body.loginPassword;
    //get data with db, and match with login
    let userRef = db.collection('users');
    let allusers = await userRef.get();
    for(const doc of allusers.docs)
    {
        if(doc.data().username == loginUsername && doc.data().password == loginPassword)
        {
            user = doc.data();
        }
    }
    if(user == null)
    {
        console.log(user);
    }
    res.redirect('/');
});


app.post('/signup', (req, res)=>{
    let signUpUsername = req.body.signupusername;
    let signUpEmail = req.body.signupemail;
    let signUpPassword = req.body.signuppassword;
    //writing data to database
    let newDoc = db.collection('users').add({
        username: signUpUsername,
        password: signUpPassword, 
        email: signUpEmail
    });
    res.redirect('/');
})
