const express=require('express')
const dotenv=require('dotenv')
const { v4: uuidv4 }=require('uuid')
const mongoose=require('mongoose')
const apiModel=require('./models/apiModel')
dotenv.config();

const app=express()
const PORT=process.env.PORT||3000

mongoose.connect(process.env.MONGO_URL)
.then(()=>{console.log('MongoDB connected succesfully!!');
})
.catch((e)=>{console.log('MongoDB connection error',e);
})

async function checkApi(req,res,next){
    const authorizationHeader=req.headers['authorization']
    console.log('Authorization Header:', authorizationHeader);
    let apikey;

    if(authorizationHeader&&authorizationHeader.startsWith('Bearer ')){
        apikey=authorizationHeader.split(' ')[1];
    }else{
        res.status(401).send({error:'No Api key found in headers!!'});
    }

    try{
        const apiKeyRecord=await apiModel.findOne({key:apikey})

        if(!apiKeyRecord){
            return res.status(403).send({error:'Api key not found!!'})
        }
        if(new Date()>apiKeyRecord.expiredAt){
            return res.status(403).send({error:'Api key has expired!!'})
        }
        next();
    }
    catch(error){
        return res.status(500).send({error:'server error'})
    }
}


//route to generate a api key
app.get('/api-key',async(req,res)=>{
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
            expiredAt:'In 30 minutes'
        })

    }catch(error){
        res.status(500).json({error:'Could not generate API key.'})
    }
})

// now protected routes that requires API key
app.get('/api/protected-route-1',checkApi,(req,res)=>{
    res.json({message:'You can access protected route!!'})
})

app.get('/api/protected-route-2',checkApi,(req,res)=>{
    res.json({message:'You can access this protected route as well!!'})
})


app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`);
})