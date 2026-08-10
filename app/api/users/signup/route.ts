import {connectDB} from "@/dbconfig/dbconfig";
import User from "@/models/userModel";
import {NextResponse , NextRequest} from "next/server";
import bcryptjs from 'bcryptjs';


export async function POST(request: NextRequest){
    try {
        await connectDB();

        const reqBody = await request.json()
        const {username, email, password} = reqBody

        if(!username || !email || !password){
            return NextResponse.json({error: "username, email and password are required"}, {status: 400})
        }

        const user = await User.findOne({email})

        if(user){
            return NextResponse.json({error: "User already exists"}, {status: 400})
        }

        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        const savedUser = await newUser.save()

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            user: {
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
            }
        }, {status: 201})

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500})
    }
}
