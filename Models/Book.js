const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title : String,
    img:
        {
            data: Buffer,
            contentType: String
        },
    description : String,
    cost : Number,
    ordering : Number,
    active : Number
})

module.exports = mongoose.model("Book",bookSchema);