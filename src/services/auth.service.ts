import "dotenv/config"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

const JWT_SECRET = process.env.JWT_SECRET || "random_secret_do_not_stuck_your_nose";

if(!JWT_SECRET){
    throw new Error("JWT_SECRET is not configured")
}

export async function registerUser(payload:{
    name:string,
    email:string,
    password:string
}){
    const email = payload.email.trim().toLowerCase();

    const existUser = await User.findOne({email})

    if(existUser){
        throw new Error("EMAIL_ALREADY_EXISTS")
    }

    const passwordHash = await bcrypt.hash(payload.password,12);

    const user = await User.create({
        name:payload.name.trim(),
        email,
        passwordHash,
        role:"user",
    })

    return{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role
    }
}

export async function loginUser(payload:{
    email:string,
    password:string
}){
    const email = payload.email.trim().toLowerCase();

    const user = await User.findOne({email}).select("+passwordHash");

    if(!user){
        throw new Error("INVALID_CREDENTIALS");
    }

    const matchesPassword = await bcrypt.compare(
        payload.password,
        user.passwordHash
    )

    if(!matchesPassword){
        throw new Error("INVALID_CREDENTIALS")
    }

    const token = jwt.sign(
        {sub:user.id,role:user.role},
        JWT_SECRET,
        {expiresIn:"1h"}
    )

    return {
        accessToken:token,
        tokenType:"Bearer",
        user:{
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role
        }
    }
}