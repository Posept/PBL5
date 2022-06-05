var express = require("express");
var bodyParser = require("body-parser");
var app = express();
let alert = require('alert');

app.use(bodyParser.urlencoded({extends:false}));

app.set("view engine","ejs");
app.set("views","./views");
app.use(express.static("public"));
app.listen(3000);

//mongoose
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb+srv://posept:a1252448A@bookstore.xjxcw8j.mongodb.net/?retryWrites=true&w=majority',function (err){
        if(err) {
            console.log("Mongoose connect error : "+err);
        }
        else {
            console.log("Mongoose connect successfull");
        }
    });
}

//bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;
//JWT
var jwt = require('jsonwebtoken');
var secret = "Posept@a19032001A";
//Session
var session = require('express-session');
app.set('trust proxy',1);
app.use(session({
    secret: 'Pdon31@dc21',
    cookie: {maxAge: 60000000 }
}));
//Models
const Category = require("./Models/Category");
const User = require("./Models/Users");


app.get("/category",function (req,res){
    var cate = new Category({
        title: "C#",
        ordering : 1,
        active : 1,
        books_id : []
    });
    cate.save(function (err){
        if(err){
            console.log("Save category error");
            res.json({ks: 0});
        }
        else {
            console.log("Save category successfully" + cate._id);
            res.json({ks: 1});
        }
    });
})


app.get("/login",function (req,res){
    res.render("login");
})
app.post("/login",function (req,res){
    if(req.body.txtUsername==null){
        User.findOne({username:req.body.txtUser},function (err,item){
        if(!err && item !=null){
            bcrypt.compare(req.body.txtPassword,item.password,function (err2,res2){
                if(res2==false){
                    alert("Password wrong !");
                }else{
                    jwt.sign(item.toJSON(),secret,{expiresIn: '168h'},function (err,token){
                        if(err){
                            res.redirect("http://localhost:3000/");
                        }
                        else{
                            req.session.token = token;
                            res.redirect("http://localhost:3000/");
                        }
                    });
                }
            });
        }else{
            if(item==null){
                alert("Username khong ton tai !");
            }
        }
    })}
    else{
        User.findOne({username:req.body.txtUsername},function (err,item){
        if(item==null)
        {bcrypt.hash(req.body.txtPasswordsignup, saltRounds, function (err, hash) {
            let admin = new User({
                username : req.body.txtUsername,
                password : hash,
                level : 1,
                name : req.body.txtName,
                address : req.body.txtAddress,
                phone : req.body.txtPhone
            });
            admin.save(function (err){
                if(err) {
                    res.json({kq : 0});
                } else {
                    res.redirect("http://localhost:3000/login");
                }
            });
        });
        return;}
        else{
            alert("Username đã tồn tại !");
        }})

    }
})


app.get("/admin/:p",function (req,res){
    res.render("admin",{page : req.params.p});
})


app.get("/page/:p",function (req, res){
    res.render("page_black",{page :req.params.p});
})

app.get("/user/:p",function (req, res){
    res.render("user",{page :req.params.p});
})

app.get("/signout",function (req,res){
    req.session.token ="";
    res.redirect("http://localhost:3000/");
})

app.get("/",function (req,res){
    if(req.session.token){
        jwt.verify(req.session.token,secret,function (err,decoded){
            if(err){
                res.redirect("https://localhost:3000/login");
            }else{
                if(decoded.level == 3) {
                    res.render("admin",{page : "category"});
                }
                else{
                    res.render("user",{page :"home"});
                }
            }
        });
    }else{
        res.redirect("http://localhost:3000/page/home");
    }
})

app.get("/404",function (req, res){
    res.render("404");
})
