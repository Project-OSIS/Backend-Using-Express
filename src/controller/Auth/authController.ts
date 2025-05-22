import { Request, Response } from "express";
import { user } from "../../model/user";
import { AppDataSource } from "../../data-source";
import { JwtPayload } from "../../types/JwtPayload";
import { createJwtToken } from "../../utils/createJwtToken";
import bcrypt from 'bcryptjs';


const { successResponse, errorResponse, validationResponse } = require('../../utils/response')

const userRepository = AppDataSource.getRepository(user)



export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).send(validationResponse('email and password are required', 400));
        }

        // Periksa apakah email sudah digunakan
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).send(errorResponse('email already exists', 409));
        }

        // Hash password sebelum menyimpan ke database
        const hashedPassword = bcrypt.hashSync(password, 8);

        // Buat objek pengguna baru
        const newUser = new user();
        newUser.email = email;
        newUser.password = hashedPassword;

        // Simpan pengguna ke database
        await userRepository.save(newUser);

        return res.status(201).send(successResponse('Registration successful', { data: newUser }, 201));
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).send(errorResponse('Internal server error', 500));
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).send(validationResponse('Email and password are required', 400));
        }

        // Ambil pengguna berdasarkan email
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            return res.status(409).send(errorResponse('Incorrect email or password', 409));
        }

        // Verifikasi password menggunakan bcrypt.compare
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(409).send(errorResponse('Incorrect email or password', 409));
        }

        const jwtPayload: JwtPayload = {
            id: user.id,
            email: user.email,
            createdAt: user.createdAt,
        };

        const token = createJwtToken(jwtPayload);
        const data = { user: { id: user.id, email: user.email, createdAt: user.createdAt }, token };

        return res.status(200).send(successResponse("Login Success", { data: data }, res.statusCode));
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(400).send(errorResponse(error, 400));
    }
};


export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = req.jwtPayload.id;

        // Ambil data pengguna berdasarkan ID
        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
            return res.status(404).send(errorResponse('User not found', 404));
        }

        // Hapus password dari respons
        const { password, ...safeUser } = user;

        return res.status(200).send(successResponse('User Authorized', { data: safeUser }, 200));
    } catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).send(errorResponse('Internal server error', 500));
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        // Hapus cookie JWT
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        return res.status(200).send(successResponse('Logout successful', {}, 200));
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).send(errorResponse('Internal server error', 500));
    }
};

