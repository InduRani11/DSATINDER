const adminAuth = (req, res, next) => { 
    const token="abc";
    const isAuthorized = "abxfgc" === token;
    if(!isAuthorized){
        return res.status(401).send("Unauthorized");
    }else{
        next()
    }
};

module.exports = {
    adminAuth,
};