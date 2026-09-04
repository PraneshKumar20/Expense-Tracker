const User = require("../models/User");
const bcrypt = require("bcryptjs");

//Signup
const Signup = async(req,res) => {
    try{
        const {name, email, password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })
        res.status(201).json({
            message: "Signup Successful",
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch(error){
        res.status(500).json({message: error.message});
    }
}

//Login
const Login = async(req,res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message: "Invalid email or password"});
        }
        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, name: user.name, email: user.email }
        });

    } catch(error){
        res.status(500).json({message: error.message});
    }
}

module.exports = {Signup, Login};