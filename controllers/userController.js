const HttpError = require("../models/errorModel");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {v4:uuid} = require("uuid")
const fs = require('fs');
const path = require('path');

const userRegistration=async (req,res,next)=>{
 try {
    const {name,email,password,password2} = req.body;
    if(!name || !email || !password){
        return next(new HttpError("Fill all fields",422))
    }
    const newEmail = email.toLowerCase();
    const emailExist = await userModel.findOne({email:newEmail});
    if(emailExist){
        return next(new HttpError("Email Already Exist",422))
    }
    if((password.trim()).length < 6){
        return next(new HttpError("Password should be at least 6 character ",422))
    }
    if(password!=password2){
        return next(new HttpError("Password do not match ",422))
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = await userModel.create({
        name,
        email:newEmail,
        password:hashedPassword
    })
    res.status(201).json(newUser)
 } catch (error) {
    return next(new HttpError("User Registration failed",422))
 }
}

const loginUser=async (req,res,next)=>{
    try {
        const {email,password} = req.body;
        if(!email || !password){
            return next(new HttpError("Fill All fields",422))
        }
        const newEmail = email.toLowerCase();
        const User = await userModel.findOne({email:newEmail});
        if(!User){
            return next(new HttpError("Invalid credentiasl",422))
        }
        const comparePass = await bcrypt.compare(password,User.password)
        if(!comparePass){
            return next(new HttpError("Invalid credentiasl",422))
        }
        const {_id:id,name} = User;
        const token = jwt.sign({id,name},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.status(200).json({token,id,name})
    } catch (error) {
        return next(new HttpError("User Login failed",422))
    }
   }


const getUser=async (req,res,next)=>{
    try {
        const {id} = req.params;
        const User = await userModel.findById(id)
        if(!User){
            return next(new HttpError("User Not Found ",422))
        }
        res.status(200).json({User});
    } catch (error) {
        return next(new HttpError(error))
    }
}

const getAuthor=async(req,res,next)=>{
    try {
        const authors = await userModel.find().select('-password');
        res.json(authors)
    } catch (error) {
        return next(new HttpError(error)) 
    }
}

const changeAvatar = async (req, res, next) => {
    try {
        if (!req.files || !req.files.avatar) {
            return next(new HttpError("Please choose an image"));
        }

        const { avatar } = req.files;
        const User = await userModel.findById(req.user.id);

        // Delete old avatar if it exists
        if (User.avatar) {
            fs.unlink(path.join(__dirname, '..', 'uploads', User.avatar), (err) => {
                if (err) {
                    return next(new HttpError(err));
                }
            });
        }

        // Check file size
        if (avatar.size > 500000) {
            return next(new HttpError('Profile picture too big. Should be less than 500kb', 422));
        }

        const filName = avatar.name;
        const splittedfilename = filName.split('.');
        const newFilename = `${splittedfilename[0]}_${uuid()}.${splittedfilename[splittedfilename.length - 1]}`;

        avatar.mv(path.join(__dirname, '..', 'uploads', newFilename), async (err) => {
            if (err) {
                return next(new HttpError(err));
            }

            const updatedAvatar = await userModel.findByIdAndUpdate(req.user.id, { avatar: newFilename }, { new: true });

            if (!updatedAvatar) {
                return next(new HttpError("Failed to update avatar"));
            }

            res.status(200).json(updatedAvatar);
        });
    } catch (error) {
        return next(new HttpError(error.message));
    }
};

const editUser=async(req,res,next)=>{
  try {
    const {name,email,currentPassword,newPassword,confirmNewPassword,avatar} = req.body;

    if(!name || !email || !currentPassword || !newPassword ){
        return next(new HttpError('Fill all fields',422))
    }

    //get user from db 

    const user = await userModel.findById(req.user.id);
    if(!user){
        return next(new HttpError("User not found ",403))
    }
    //to check new email id does not already exist
    const emailExist = await userModel.findOne({email});
    if(emailExist && (emailExist._id != req.user.id)){
        return next(new HttpError("Email Already exists",422))
    }
    //compare current password to db password
    const validateUserPassword = await bcrypt.compare(currentPassword,user.password)
    if(!validateUserPassword){
        return next(new HttpError('Invalid Current password',422))
    }
    if(newPassword != confirmNewPassword){
        return next(new HttpError("password not matched",422))
    }

    //hash new password
    const salt = await bcrypt.genSalt(10)
    const newHashedPass = await bcrypt.hash(newPassword,salt);

    //update user info in db
    const newInfo = await userModel.findByIdAndUpdate(req.user.id, { name, email, password: newHashedPass,avatar }, { new: true });
    res.status(200).json(newInfo)
  } catch (error) {
    return next(new HttpError(error))
  }
   }


module.exports = {userRegistration,loginUser,getUser,changeAvatar,editUser,getAuthor}