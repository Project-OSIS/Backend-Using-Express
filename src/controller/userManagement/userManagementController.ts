import { Request, Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../../data-source';
import { user } from '../../model/user';
import { UserRole } from '../../model/user';
import multer from 'multer';  
import path from 'path';  
import { Tree } from 'typeorm';

const userRepository = AppDataSource.getRepository(user);

const storage = multer.diskStorage({    
    destination: (req, file, cb) => {    
        cb(null, 'public/image/userProfile'); // Pastikan folder ini ada    
    },    
    filename: (req, file, cb) => {    
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);    
        cb(null, uniqueSuffix + path.extname(file.originalname));   
    }    
});    
  
export const upload = multer({ storage: storage });  


// Utility response functions
const successResponse = (message: string, data?: any) => ({
    status: "success",
    message,
    data
});
const errorResponse = (message: string) => ({ status: "error", message });

export const createUser = async (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(6).required(),
            role: Joi.string().valid(...Object.values(UserRole)).required(),
            username: Joi.string().required(),

        });

        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(errorResponse(error.details[0].message));

        const { email, password, role,username } = req.body;

        // Cek apakah email sudah terdaftar
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser) {
            return res.status(400).send(errorResponse('Email already exists'));
        }

        const newUser = new user();
        newUser.email = email;
        newUser.password = bcrypt.hashSync(password, 8);
        newUser.role = role;
        newUser.username = username;

        if (req.file) {  
                newUser.image = req.file.path; // Menyimpan path file  
        }  

        const savedUser = await userRepository.save(newUser);

        const { password: _, ...userWithoutPassword } = savedUser;

        return res.status(201).send(successResponse('User created successfully', userWithoutPassword));
    } catch (error) {
        return res.status(500).send(errorResponse('Internal Server Error'));
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userRepository.find({
            relations: ['userStructure', 'userPosition'],
            select: {
                id: true,
                email: true,
                role: true,
                username : true,
                createdAt: true,
                updatedAt: true
            }
        });

        const sanitizedUsers = users.map(({ password, ...rest }) => rest); // Hapus password

        return res.status(200).send(successResponse('Users retrieved successfully', sanitizedUsers));
    } catch (error) {
        return res.status(500).send(errorResponse('Internal Server Error'));
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required()
        });

        const { error } = schema.validate({ id: req.params.id });
        if (error) return res.status(400).send(errorResponse(error.details[0].message));

        const foundUser = await userRepository.findOne({
            where: { id: req.params.id },
            relations: ['userStructure', 'userPosition']
        });
        foundUser.image = foundUser.image ? `${foundUser.image.replace(/\\/g, '/')}` : null; // Ganti dengan domain Anda  


        if (!foundUser) {
            return res.status(404).send(errorResponse('User not found'));
        }

        const { password, ...userWithoutPassword } = foundUser;

        return res.status(200).send(successResponse('User retrieved successfully', userWithoutPassword));
    } catch (error) {
        return res.status(500).send(errorResponse('Internal Server Error'));
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const idSchema = Joi.object({
            id: Joi.string().uuid().required()
        });

        const bodySchema = Joi.object({
            email: Joi.string().email().optional(),
            password: Joi.string().min(6).optional(),
            role: Joi.string().valid(...Object.values(UserRole)).optional(),
            username : Joi.string().optional()
        });

        const { error: idError } = idSchema.validate({ id: req.params.id });
        if (idError) return res.status(400).send(errorResponse(idError.details[0].message));

        const { error: bodyError } = bodySchema.validate(req.body);
        if (bodyError) return res.status(400).send(errorResponse(bodyError.details[0].message));

        const foundUser = await userRepository.findOneBy({ id: req.params.id });
        if (!foundUser) return res.status(404).send(errorResponse('User not found'));

        // Update fields
        if (req.body.email) foundUser.email = req.body.email;
        if (req.body.password) foundUser.password = bcrypt.hashSync(req.body.password, 8);
        if (req.body.role) foundUser.role = req.body.role;
        if (req.body.username) foundUser.username = req.body.username;
        if (req.file) {  
                foundUser.image = req.file.path; // Menyimpan path file  
        }  

        const updatedUser = await userRepository.save(foundUser);

        const { password, ...userWithoutPassword } = updatedUser;

        return res.status(200).send(successResponse('User updated successfully', userWithoutPassword));
    } catch (error) {
        return res.status(500).send(errorResponse('Internal Server Error'));
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const schema = Joi.object({
            id: Joi.string().uuid().required()
        });

        const { error } = schema.validate({ id: req.params.id });
        if (error) return res.status(400).send(errorResponse(error.details[0].message));

        const foundUser = await userRepository.findOneBy({ id: req.params.id });
        if (!foundUser) return res.status(404).send(errorResponse('User not found'));

        await userRepository.remove(foundUser);

        return res.status(200).send(successResponse('User deleted successfully'));
    } catch (error) {
        return res.status(500).send(errorResponse('Internal Server Error'));
    }
};