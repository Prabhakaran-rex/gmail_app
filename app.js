var express = require('express');
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

 

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'gmail_app_dev'
});
var app = express();

connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");    
} else {
    console.log("Error connecting database ... nn");    
}
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use('/style',  express.static(__dirname + '/style'));

app.get('/',function(req,res){
    res.render('home',{user: ''});
    // res.render('header.html');
})

app.get('/login',function(req,res){
    res.render('signin',{user: ''});
})

app.get('/register',function(req,res){
    res.render('signup',{user: ''});
})

// app.get('/dashboard',function(req,res){
// 	console.log(req);
//     res.render('dashboard',{user: ''});
// })

app.post("/create", function(req, res) {
	
	console.log("req");
	console.log(req.body.email);
	if (req.body.password == req.body.confirm){
		var user = { email: req.body.email, password: encrypt(req.body.password), username: req.body.username };
		connection.query('INSERT INTO users SET ?', user, function(err,res){
		  if(err) throw err;

		  console.log('Last insert ID:', res.insertId);
		})
		res.redirect('/login');
	}else{
		// do your thang
		res.redirect('/');
	}
	console.log('Register Users');
})

app.post("/dashboard", function(req, res) {
	
	console.log("req");
	console.log(req.body.email);
	var email = req.body.email;
	var pwd1 = req.body.password;

	connection.query('SELECT * FROM users WHERE email =' + connection.escape(email), 
	  function(err,rows){
	  	connection.end();
	    if(err){ 
	    	throw err;
	    }else{
		    console.log(rows[0].password);
		    var pwd2 = decrypt(rows[0].password);
		    if (pwd1 == pwd2){
		    	console.log('login sucessfully');
		    	console.log(rows[0]);
		    	res.render('dashboard',{user: rows[0]});

		    }else{
		    	console.log('record not found');
		    	res.render('/login',{user: ''});
		    }
		}
	  })
	console.log('Register Users');
})

app.get('/dashboard', function(req, res){
	var email = req.body.email;
	connection.query('SELECT * FROM users WHERE email =' + connection.escape(email), 
	  function(err,rows){
	  	if (err){
	  		console.log(err);
	  	}else{
	  		res.render('dashboard',{user: rows[0]});
	  	}
	  })
})

// Binding express app to port 3000
app.listen(3000,function(){
    console.log('Node server running @ http://localhost:3000')
});

function dashboard(user){
	app.get('/dashboard',function(req,res){
		console.log(req);
	    res.render('dashboard',{user: user});
	})
}

function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}
 
var hw = encrypt("hello world")