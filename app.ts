import express,{Request,Response,NextFunction} from "express"
import dotenv from "dotenv"
import {v4 as uuidv4} from "uuid"
import mongoose from "mongoose"
import apiModel from "./models/apiModel"
dotenv.config();

const app=express()
const PORT=process.env.PORT||3000

mongoose.connect(process.env.MONGO_URL as string)
.then(()=>{console.log('MongoDB connected succesfully!!');
})
.catch((e)=>{console.log('MongoDB connection error',e);
})

async function checkApi(req:Request,res:Response,next:NextFunction):Promise<void>{
    const authorizationHeader=req.headers['authorization']
    console.log('Authorization Header:', authorizationHeader);
    let apikey:string|undefined;

    if(authorizationHeader&&authorizationHeader.startsWith('Bearer ')){
        apikey=authorizationHeader.split(' ')[1];
    }else{
        res.status(401).send({error:'No Api key found in headers!!'});
        return;
    }

    try{
        const apiKeyRecord=await apiModel.findOne({key:apikey})

        if(!apiKeyRecord){
            res.status(403).send({error:'Api key not found!!'})
            return;
        }
        if(new Date()>apiKeyRecord.expiredAt){
            res.status(403).send({error:'Api key has expired!!'})
            return;
        }
        next();
    }
    catch(error){
        res.status(500).send({error:'server error'})
        return;
    }
}


//route to generate a api key
app.get('/api-key',async(req:Request,res:Response)=>{
    const newApiKey=uuidv4()

    const expiredAt=new Date(Date.now()+30*60*1000);

    try{
        const apikeyrecord=new apiModel({
            key:newApiKey,
            expiredAt:expiredAt
        });

        await apikeyrecord.save();  //saved the apikey record in database

        res.json({
            message:'API key generated.',
            key:newApiKey,
            expiredAt:expiredAt
        })

    }catch(error){
        res.status(500).json({error:'Could not generate API key.'})
    }
})

// now protected routes that requires API key
app.get('/api/protected-route-1',checkApi,(req:Request,res:Response)=>{
    res.json({message:'You can access protected route!!'})
})

app.get('/api/protected-route-2',checkApi,(req:Request,res:Response)=>{
    res.json({message:'You can access this protected route as well!!'})
})


app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})