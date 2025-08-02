import jwt from'jsonwebtoken';
import bcrypt from'bcrypt';
import User from "../models/user.model.js";
// User Registration
export const userRegister = async (req, res) => {
        const { email,password, cpassword} = req.body;
       
        if (password !== cpassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // Check if the email already exists in the database
        const existingUser = await User.findOne({email:email});
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }

        // Hash the password and create a new user
        const hashedPassword = await bcrypt.hash(password, 8);
        const newUser = new User({ email, password: hashedPassword });
        
        await newUser.save();
        console.log("User saved:", newUser);
        res.status(200).json({ status: 'success', message: 'User registered successfully', newUser });
     
};

// User Login
export const userLogin = async (req, res,next) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const matching = await bcrypt.compare(password,user.password);
        
        if (!matching) {
            return res.status(404).json({ success: false, message: "The Email or UserName is incorrect" });
        
        }
       
        const token = jwt.sign({ id: user._id,email: user.email },process.env.JWT_KEY,{ expiresIn: '3d' });
            
        // Set cookies for tokens
        res.cookie("token", token, {
            httpOnly: false,
            secure: true, 
            sameSite: "none",
            maxAge: 3 * 24 * 60 * 60 * 1000 
        });


        res.status(200).json({ status: 'success', message: "User Logged in successfully",user});
      
};

//user logout
export const userLogout = async (req, res) => {
    res.clearCookie('token', {     
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    res.status(200).json({ status: 'success', message: 'Logout successful' });
};

