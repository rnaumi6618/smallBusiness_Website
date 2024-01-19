//import dependencies
const express = require('express');
const path = require('path');

//setup global variable
var myApp = express();
const {check, validationResult} = require('express-validator');

// //Creating secure session
// var session = require('express-session');

// myApp.use(session({
//     secret: 'mysecret',
//     resave: false,
//     saveUninitialized: true
// }));

// set up the DB connection
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Assignment4Rafia',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//set up the model for the order
const Order = mongoose.model('Order',{
    name: String,
    email :String,
    phone :String,
    Province : String,
    city: String,
    address : String,
    teeShirtQuantity :  Number,
    teeShirtPrice:Number,
    pantsQuantity : Number,
    pantsPrice: Number,
    formalShirtQuantity :Number,
    formalShirtPrice:Number,
    subTotal : Number,
    tax : Number,
    total : Number,
});

//setup the model for login
const Admin = mongoose.model('Login',{
    username: String,
    password: String 
 });

myApp.use(express.urlencoded({extended:false}));

myApp.set('views', path.join(__dirname, 'views'));

myApp.use(express.static(__dirname +'/public'))

// Set the view engine to ejs for server-side templating
myApp.set('view engine', 'ejs');


// This object contains the tax rates for different provinces in Canada
const taxRates = {
    "Alberta": 0.05,
    "British Columbia": 0.12,
    "Manitoba": 0.13,
    "New Brunswick": 0.15,
    "Newfoundland": 0.15,
    "Northwest Territories": 0.05,
    "Nova Scotia": 0.15,
    "Nunavut": 0.05,
    "Ontario": 0.13,
    "Prince Edward Island": 0.15,
    "Quebec": 0.15,
    "Saskatchewan": 0.11,
    "Yukon": 0.05
};

// GET requests to the root ('/') URL of the web server
myApp.get('/', function(req,res){
     // Render the 'form' view when this route is accessed
    res.render('form');
});

// myApp.get('/login', function(req,res){
//     res.render('login');
// });

//myApp.post('/allorders', function(req, res){
    //  var user = req.body.username; // The username is "admin"
    //  var pass = req.body.password; //the password is "admin"

    //  Admin.findOne({username: user, password: pass}).then((logins) => {
    //     if(logins){

    //         //store the username and logged in user in the session
    //         req.session.username = logins.username;
    //         req.session.userLoggedIn = true;

          //  res.redirect('/allorders');

    //     }
    //     else{
    //         res.render('login', {error: 'Sorry, cannot login!'});
    //     }
    // }).catch((err) => {
    //     console.log('Errors :::', err);
    // });

//});

// Define a route handler for POST requests to the root ('/') URL
myApp.post('/', [
    check('name', 'Name is required').notEmpty(),
    check('address','Address is required').notEmpty(),
    check('city','City is required').notEmpty(),
    check('Province','Province is required').notEmpty(),
    check('phone','phone number is required with valid format').matches(/^\d{10}$/),
    check('email', 'Email is required with valid format').isEmail(),
],
//  (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.render('form', { errors: errors.array() });
//     }
//     next();
// }, 
 function(req,res){
    const errors = validationResult(req);
    if(!errors.isEmpty()){
         // If there are any validation errors, re-render the form with error messages
        res.render('form', {
            errors : errors.array()
        });
    }
    else
    {
        // If the form submission is valid, grab the form values and calculate the subtotal, tax, and total
        var name = req.body.name;
        var address = req.body.address;
        var province = req.body.Province;
        var city = req.body.city;
        var email = req.body.email;
        var phone = req.body.phone;
        var teeShirtQuantity = req.body['TeeShirt'];
        var teeShirtPrice= 30;
        var pantsQuantity = req.body['Pants'];
        var pantsPrice= 20;
        var formalShirtQuantity = req.body['FormalShirt'];
        var formalShirtPrice= 40;
        
        //Calculating the total with specific taxrates
        var subTotal = teeShirtQuantity * teeShirtPrice+ formalShirtQuantity * formalShirtPrice + pantsQuantity * pantsPrice;
        if(subTotal<10){
            errors.errors.push({msg: 'Require Minimum $10 purchase'});
            // If there are any validation errors, re-render the form with error messages
           res.render('form', {
               errors : errors.array()
           });

        }
        else{
            var taxRate = taxRates[province];
        var tax = subTotal * taxRate;
        tax = parseFloat(tax.toFixed(2));
        var total = subTotal + tax;
       
        // pagedata variable to passing in the form values and calculated values
       var pageData = {
            name: name,
            email : email,
            phone : phone,
            Province : province,
            city: city,
            address : address,
            teeShirtQuantity :  teeShirtQuantity,
            teeShirtPrice:teeShirtPrice,
            pantsQuantity : pantsQuantity,
            pantsPrice: pantsPrice,
            formalShirtQuantity :formalShirtQuantity,
            formalShirtPrice:formalShirtPrice,
            subTotal : subTotal,
            tax : tax,
            total : total
        }
       //create an object for the model Order
    var myOrder = new Order(pageData);
    //save the order
    myOrder.save().then(function(){
        console.log('New order created');
    });
    
     res.render('thanks', pageData);
    }
   } 
});

myApp.get('/allorders', function(req,res){
    Order.find({}).then((orders) => {
        
            res.render('allorders',{orders:orders});
        
    }).catch((err) => {
        console.log('Errors :::', err);
    });
});


// //Logout
// myApp.get('/logout', function(req,res){

//     req.session.destroy();
//     res.render('login', {error: 'Successfully  logged out'});
// });
// Start the server on port 4500
myApp.listen(4500, function(){
    console.log("Application started and listening on port 4500");
});