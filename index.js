var express = require("express");
var bodyParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var app = express();
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
const Book = require("./Models/Book");
const User = require("./Models/Users");
var Name="";
var Upload = 0;

//Upload
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null, 'public/upload')
    },
    filename: function (req,file,cb) {
        cb(null,Date.now() + "."+ file.originalname)
    }
});
var upload = multer({
    storage : storage,
    fileFilter: function (req,file,cb) {
        console.log(file);
        if( file.mimetype=="image/bmp" ||
            file.mimetype=="image/png" ||
            file.mimetype=="image/gif" ||
            file.mimetype=="image/jpg" ||
            file.mimetype=="image/jpeg" ){
            cb(null,true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("fileImage");

app.get("/login",function (req,res){
    res.render("login");
})
app.post("/login",function (req,res){
    if(req.body.txtUsername==null){
        User.findOne({username:req.body.txtUser},function (err,item){
        if(!err && item !=null){
            bcrypt.compare(req.body.txtPassword,item.password,function (err2,res2){
                if(res2==false){
                    res.render("login",{message:"Password wrong"});
                }else{
                    jwt.sign(item.toJSON(),secret,{expiresIn: '168h'},function (err,token){
                        if(err){
                            res.redirect("http://localhost:3000/");
                        }
                        else{
                            req.session.token = token;
                            Name = item.name;
                            res.redirect("http://localhost:3000/");
                        }
                    });
                }
            });
        }else{
            if(item==null){
                res.render("login",{message:"Username does not exist"});
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
                    res.render("login",{message:"Create Account Success"});
                }
            });
        });
        return;}
        else{
            res.render("login",{message:"Username already exist"});
        }})

    }
})


app.get("/admin/:p",function (req,res){
    if(req.params.p=="category"){
        Category.find(function (err,items){
            if(err){
                res.render("admin",{page : req.params.p,list:[]});
            }else {
                res.render("admin",{page : req.params.p,list:items});
            }
        })
    }
    else{
        if(req.params.p=="book"){
            Category.find(function (err,items){
                if(err){
                    res.render("admin",{page :"book",list:[]});
                }else{
                    if(Upload!=1){
                        res.render("admin",{page :"book",list:items});
                    }else{
                        Upload =0;
                        res.render("admin",{page :"book",list:items,message:"Upload successfully"});
                    }

                }
            })
        }
        else{
            res.render("admin",{page : req.params.p});
        }
    }
})

app.get("/image",function (req,res){
    Book.find(function (err,items){
        if(err){
            console.log("Error");
        }
        else{
            res.render('imagesPage', { items: items });
        }
    })
})

app.post("/admin/:p",function (req,res){
    if(req.params.p=="category") {
        var cate = new Category({
            title: req.body.txtTitle,
            ordering : req.body.txtOrder,
            active : 1,
            books_id : []
        });
        cate.save(function (err){
            if(err){
                console.log("Save category error");
                Category.find(function (err,items){
                    if(err){
                        res.render("admin",{page : req.params.p,list:[]});
                    }else {
                        res.render("admin",{page : req.params.p,message:"Save category error",list:items});
                    }
                })
            }
            else {
                console.log("Save category success");
                Category.find(function (err,items){
                    if(err){
                        res.render("admin",{page : req.params.p,list:[]});
                    }else {
                        res.render("admin",{page : req.params.p,message:"Save category successfully",list:items});
                    }
                })
            }
        });
        return;
    }
    if(req.params.p == "book"){
        upload(req,res,function (err) {
            if(err instanceof multer.MulterError){
                console.log("A Multer error occurred when uploading.")
                res.json({kq:0})
            } else if(err){
                console.log("An unknown error occurred when uploading.")
                res.json({kq:0})
            }else{
                console.log("Upload is okay");
                console.log(req.file);
                var book = new Book({
                    title : req.body.txtTitle,
                    img: {
                        data: fs.readFileSync(path.join(__dirname + '/public/upload/' + req.file.filename)),
                        contentType: 'image/png'
                    },
                    description :req.body.txtPdfurl,
                    ordering : req.body.txtOrder,
                    active : 1
                });
                book.save(function (err){
                    if(err){
                        res.json({kq:0})
                    }else{
                        Category.findOneAndUpdate({_id:req.body.selectCate},{$push :{books_id:book._id}},function (err){
                            if(err){
                                res.json({kq:0})
                            }else{
                                console.log("Update book okay");
                                Upload = 1;
                                res.redirect("/admin/book");
                            }
                        })
                    }
                })
            }
        })
    }
})

app.get("/page/:p",function (req, res){
    res.render("page_black",{page :req.params.p});
})

app.get("/user/:p",function (req, res){
    res.render("user",{page :req.params.p,message:Name});
})

app.get("/signout",function (req,res){
    req.session.token ="";
    Name = "";
    res.redirect("http://localhost:3000/");
})

app.get("/",function (req,res){
    if(req.session.token){
        jwt.verify(req.session.token,secret,function (err,decoded){
            if(err){
                res.redirect("https://localhost:3000/login");
            }else{
                if(decoded.level == 3) {
                    Category.find(function (err,items){
                        if(err){
                            res.render("admin",{page :"category",list:[]});
                        }else {
                            res.render("admin",{page :"category",list:items});
                        }
                    })
                }
                else{
                    res.render("user",{page :"home",message:Name});
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
