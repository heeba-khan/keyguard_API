const mongoose=require('mongoose')

const apiSchema=new mongoose.Schema({
    key:{
        type:String,
        required:true,
        unique:true
    },
    createdAt:{
        type:Date,
        default:Date.Now
    },
    expiredAt:{
        type:Date,
        required:true
    }
})

const apiModel=mongoose.model('apiModel',apiSchema)


module.exports=apiModel