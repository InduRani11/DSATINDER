const express =require('express');
const app = express();

const {adminAuth} =require('./middleware/auth.js');

app.use("/admin",adminAuth);

app.get("/admin/getallData",(req,res)=>{
        res.send("Welcome to Admin Get All Data Page");
    }   
);

app.get("/admin/deleteData",(req,res)=>{
    const token="abc";
    const isAuthorized = "abc" === token;
    if(!isAuthorized){
        return res.status(401).send("Unauthorized");
    }else{
        res.send("Welcome to Admin Delete Data Page");
        }
    }   
);

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
