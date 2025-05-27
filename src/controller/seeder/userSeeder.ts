import { Request, Response } from "express";
import Joi from "joi";
import { AppDataSource } from "../../data-source";
import { user, UserRole } from "../../model/user";
import { encrypt } from "../../utils/CryptoData";
import bcrypt from 'bcryptjs';


const { successResponse, errorResponse, validationResponse } = require('../../utils/response')


const userRepository = AppDataSource.getRepository(user)


export const userSeeder = async (req: Request, res: Response) => {
    const User = [
        {email : "Admin1@gmail.com",password : "Admin123!",UserRole : "ADMIN"},
    ];
    try{

        for (const data of User){
            const newUser = new user()
            newUser.email = data.email
            newUser.password =  data.password
            newUser.password = bcrypt.hashSync(data.password, 8);
            await userRepository.save(newUser)
        }
        console.log("User seeded successfully.");

    }catch(error){
        return res.status(400).send(errorResponse(error,400))
    }
}