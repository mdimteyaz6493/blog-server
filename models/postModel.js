const {Schema,model} = require("mongoose")

const postSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    category:{
        type:String,
        enum:["Agriculture","Business","Education","Entertainment","Art","Investment","Weather","Uncategorized"]
    },
    desc:{
        type:String,
        required:true
    },
    creator:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    thumbnail:{
        type:String,
        required:true
    },
   
}, {timestamps:true})

const postModel = model('Post',postSchema)

module.exports = postModel;