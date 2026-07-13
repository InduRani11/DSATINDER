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
    res.send('Hello tests get request');
})

app.post("/test",(req,res)=>{
    res.send('Hello tests post request');
})
app.delete("/test",(req,res)=>{
    res.send('Hello tests delete request');
})
// this will match all the http methods api call to /test
app.use("/test",(req,res)=>{
    res.send('Hello test');
})

app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});
