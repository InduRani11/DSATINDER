const express =require('express');
const app = express();

app.use("/",(err,req,res,next)=>{
    if(err){
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
    
});

app.get('/getuserdata',(req,res)=>{
    try{
        throw new Error('Something went wrong');
        res.send('Hello World');
    }catch(err){
        res.status(500).send('Server Error');
    }   
     
});

app.use("/",(err,req,res,next)=>{
    if(err){
        console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
    
});

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
