// create web server
var express = require('express');
var app = express();
// import body-parser module
var bodyParser = require('body-parser');
// import mysql module
var mysql = require('mysql');
// import express-session module
var session = require('express-session');
// import multer module
var multer = require('multer');
// import fs module
var fs = require('fs');
// import path module
var path = require('path');
// import crypto module
var crypto = require('crypto');
// import passport module
var passport = require('passport');
// import passport-local module
var LocalStrategy = require('passport-local').Strategy;
// import passport-facebook module
var FacebookStrategy = require('passport-facebook').Strategy;
// import passport-twitter module
var TwitterStrategy = require('passport-twitter').Strategy;
// import passport-google module
var GoogleStrategy = require('passport-google-oauth20').Strategy;

// create mysql connection
var conn = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '1234',
	database: 'o2'
});

// connect to mysql server
conn.connect();

// use body-parser module
app.use(bodyParser.urlencoded({extended:false}));

// use express-session module
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}));

// use passport module
app.use(passport.initialize());
// use passport session module
app.use(passport.session());

// use multer module
app.use('/user', express.static('uploads'));

// set storage
var storage = multer.diskStorage({
	// destination for files
	destination: function(req, file, callback) {
		callback(null, './uploads');
	},
	// add back the extension
	filename: function(req, file, callback) {
		callback(null, Date.now() + path.extname(file.originalname));
	}
});

// upload parameters for multer
var upload = multer({
	storage: storage
});

// passport serialize
passport.serializeUser(function(user, done) {
	console.log('passport session save : ', user);
	done(null, user);
});
// passport deserialize
passport.deserializeUser(function(user, done) {
	console.log('passport session get id : ', user);
	done(null, user);
});

// create local strategy
passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback : true
	}, function(req, email) {
        var query = conn.query('select * from user where email=?', [email], function(err, rows) {
            if(err) return done(err);

            if(rows.length) {
                return done(null, {'email': email, 'id': rows[0].uid});
            } else {
                return done(null, false, {'message': 'your login info is not found'});
            }
        });
    }));
