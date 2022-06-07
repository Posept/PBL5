const  mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    username : String,
    password : String,
    level : Number,
    name : String,
    address : String,
    phone : String,
    books_order_id : [{type: mongoose.Schema.Types.ObjectId}]
});

module.exports = mongoose.model("User",userSchema);