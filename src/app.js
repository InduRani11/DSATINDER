const express =require('express');
const app = express();

app.use("/user",
    // middleware
    (req,res,next)=>{
        console.log("Route 1 ")
        next();
        
    },
    // route handler
    (req,res,next)=>{
        console.log("Route 2 ")
        // next(); 
        res.send("User route 2");
    }
)

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
