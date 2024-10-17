// const mongoose=require('mongoose')

// const apiSchema=new mongoose.Schema({
//     key:{
//         type:String,
//         required:true,
//         unique:true
//     },
//     createdAt:{
//         type:Date,
//         default:Date.Now
//     },
//     expiredAt:{
//         type:Date,
//         required:true
//     }
// })

// const apiModel=mongoose.model('apiModel',apiSchema)


// module.exports=apiModel

import mongoose,{Document,Schema} from "mongoose";
import { Stream } from "stream";

interface MyApiModel extends Document{
    key:string;
    createdAt:Date;
    expiredAt:Date;
}

const apiSchema:Schema=new Schema({
    key:{
        type:String,
        required:true,
        unique:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    expiredAt:{
        type:Date,
        required:true
    }
})

const apiModel=mongoose.model<MyApiModel>('apiModel',apiSchema)

export default apiModel