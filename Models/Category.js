const  mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
    title : String,
    ordering : Number,
    active : Number,
    books_id : [{type: mongoose.Schema.Types.ObjectId}]
});

module.exports = mongoose.model("Category",categorySchema);