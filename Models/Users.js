const  mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    level : Number,
    name : String,
    address : String,
    phone : String
});

module.exports = mongoose.model("User",userSchema);