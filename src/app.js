const express =require('express');
const app = express();
// "/" is root route it overrides all other routes if it is placed before them
// app.use("/",(req,res)=>{
//     res.send('Hello World');
// })
// app.use("/hello",(req,res)=>{
//     res.send('Hello hello hello');
// })

app.get("/test",(req,res)=>{
    // if you request on /test?userid=123  then you can access the query parameter using req.query.userid
    console.log(req.query.userid)
    res.send('Hello tests get request');
})

// this is dynamic route where you can pass parameter in the url like /test/123 and you can access the parameter using req.params.userid
app.get("/test/:userid",(req,res)=>{
     console.log(req.params.userid)
    res.send('Hello tests get request');
})
app.get("/abc",(req,res)=>{
    res.send('Hello tests get request');
})


app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
