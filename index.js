const { request, response } = require('express');
const express = require('express');
const path = require('path')
const app = express();
const firebase = require('firebase')
const http = require('http');
const url = require('url');
const maximum = 10000;
const minimum = 1;
var user= null;
var results = new Array();
var myorders = new Array();
var newtrain = {};
var docid ;
// npm i ;alert ;
// let alert = require('alert');
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
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(express.urlencoded({extended: true}));
app.get('/', (request, response) =>{
    if(user != null){
        response.render('index', {loggedInUser: user});
        // console.log('login successful');
    }
    else {
        response.render('index', {loggedInUser: user});
    }
});

app.get('/signup', (req, res)=>{
    res.render('signup');
});

app.get('/login', (req, res)=>{
    res.render('login');
});
app.get('/logout', (req,res)=>{
    user = null;
    res.render('index', {loggedInUser: user});
})

app.get('/alltrains', (req, res)=>{
    res.render('alltrains', {allresults : results, loggedInUser: user});
})

app.get('/booknow/:id/:date/:cap/', async(req, res)=>{
    const id = req.params.id;
    const date = req.params.date; 
    const cap = req.params.cap;
    let TrainsRef = db.collection('trains/trains/trainID');
    let traininfo = await TrainsRef.get();
    for(const temp of traininfo.docs) {
        // console.log(temp.data().id); //Id is not matching with train id change it
        if(temp.data().id == id) {
            var data = temp.data();
            var mytrain= {trainid: temp.data().id, trainname: temp.data().name, bookingdate: date, capacityleft: cap};
        }
    }
    // console.log(mytrain);
    res.render('book-now', {train: mytrain});
})
app.get('/profile', async(req, res)=>{
    if(user)
    {
        let myBookingRef = db.collection('orders');
        let mybookings = await myBookingRef.get();
        let TrainsRef = db.collection('trains/trains/trainID');
        let traininfo = await TrainsRef.get();
        myorders.length = 0;
        for(const order of mybookings.docs)
        {
            if(user.username == order.data().bookinguser){
                for(const info of traininfo.docs){
                    if(order.data().trainid == info.data().id){
                        var single = {amtbooked: order.data().amountbooked, netcost : (order.data().amountbooked * info.data().costperunit), trainname: info.data().name ,date : order.data().date, time : info.data().time , servtype : info.data().service, orderid: order.data().orderid}
                        myorders.push(single);
                    }
                    
                }
            }
        }
        res.render('profile', {loggedInUser: user , orders : myorders });
    }
    // console.log(myorders);
})


const port = process.env.PORT || 4000;
//Use for development

//app.listen(4000, ()=>{
//    console.log("server is running");
//});

//Use for production
app.listen(port);

app.post('/login', async(req, res) =>{
    let loginUsername = req.body.loginUsername;
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

app.post('/search', async(req, res) =>{
    let searchSource= req.body.sourcestation;
    let searchDestination = req.body.destinationstation;
    var traveldate = new Date(req.body.traveldate).toISOString().slice(0, 10);
    let traintype = req.body.type;
    // console.log(traveldate);
    //let today = new Date().toISOString()
    // console.log(today)
    // searching for these in the database. 
    let alltrainsRef= db.collection('trains/trains/trainID');
    let allTrains = await alltrainsRef.get();
    let bookingsRef = db.collection('orders');
    let allbookings = await bookingsRef.get();  
    //checking available space of that train on a particular date
    results.length = 0;
    for(const tdoc of allTrains.docs)
    {
        var data= tdoc.data();
        if(data.source == searchSource && data.destination == searchDestination  )
        {   
            var remaining = data.capacity;
            for(const book of allbookings.docs)
            {
                if(traveldate == book.data().date && data.id == book.data().trainid)
                {
                    remaining = remaining - book.data().amountbooked;
                }
            }
            var details = {  name: data.name ,service: data.service, source: data.source, destination : data.destination, cost : data.costperunit, departure : data.time, trainid : data.id, capacity: data.capacity, capacityleft: remaining, bookingdate: traveldate};
            //console.log(details);
            results.push(details);

        }
    };
    res.redirect('/alltrains');
})
app.post('/confirm/:id/:date/:cap/', async(req, res)=>{
    let amtbooked = req.body.amount;
    // let amtbooked = rq.params.amtbooked;
    let trainid = req.params.id;
    let date = req.params.date;
    let capleft = req.params.cap;
    if(capleft < amtbooked)
    {
        // alert("message");
        // popup.alert({content : "Sorry! Not enough space. Please try with a lesser amount or some other date:)"});
    }
    let newDoc= db.collection('orders').add({
        amountbooked: amtbooked, 
        bookinguser: user.username,
        date : date,
        orderid: Math.floor(Math.random() * (maximum - minimum + 1)) + minimum,
        trainid: trainid
    });
    console.log("booking done successfully!");
    res.redirect('/profile');
})
app.get('/cancelorder/:orderID/', async(req,res)=>{
    let ID= req.params.orderID;
    // console.log(ID);
    let orderRef = db.collection('orders');
    let alldocs = await orderRef.get();
    for(const mydoc of alldocs.docs){
        if(ID == mydoc.data().orderid){
            // console.log("true");
            docid= mydoc.id;
            // break;
        }
    }
    // console.log(docid);
    db.collection('orders').doc(docid).delete().then(()=>{
        console.log("deletion successful");
    }).catch((err)=>{
        console.log("err");
    });
    res.redirect('/profile');
});
