import {connectDB} from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import {NextResponse , NextRequest} from "next/server";
import bcryptjs from 'bcryptjs';
import { sendMail } from "@/helpers/mailer";


export async function POST(request: NextRequest){
    try {
        await connectDB();

        const reqBody = await request.json()
        const {username, email, password} = reqBody

        if(!username || !email || !password){
            return NextResponse.json({error: "username, email and password are required"}, {status: 400})
        }

        //check if user already exists
        const user = await User.findOne({email})

        if(user){
            return NextResponse.json({error: "User already exists"}, {status: 400})
        }

        //hash password
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save()

        //send verification email - don't fail signup if the mail provider errors
        try {
            await sendMail({email, emailType: "VERIFY", userId: savedUser._id})
        } catch (mailError) {
            console.log("Verification email failed to send", mailError)
        }

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            user: {
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                isVerified: savedUser.isVerified,
            }
        }, {status: 201})

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}
