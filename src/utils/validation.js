const validator = require('validator');
const validateSignupData = (req) => {
    const { firstName, lastName, emailId, password   } = req.body;

    // Add validation logic here
    if (!firstName || !lastName ) {
        throw new Error('name is required');
    }else if(firstName.length<3 || firstName.length>50 ){
        throw new Error('name length is not valid');
    }
    else if(!validator.isEmail(emailId)){
        throw new Error('email is not valid');
    }else if(!validator.isStrongPassword(password)){
        throw new Error('password is not valid');
    }
}

module.exports = {
    validateSignupData,
};