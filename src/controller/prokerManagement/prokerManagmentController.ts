import { Request, Response } from 'express';
import Joi from 'joi';
import { AppDataSource } from '../../data-source';
import { proker } from '../../model/proker';

const { successResponse, validationResponse, responseHandler } = require('../utils/response');

const prokerRepository = AppDataSource.getRepository(proker);


export const createProker = async (req: Request, res: Response) => {
    try {
        // Validasi request body
        const createProkerSchema = Joi.object({
            title: Joi.string().required(),
            description: Joi.string().required(),
            image: Joi.string().uri().allow(null),
        });

        await createProkerSchema.validateAsync(req.body);

        // Membuat objek proker baru
        const newProker = prokerRepository.create({
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
        });

        // Simpan ke database
        const savedProker = await prokerRepository.save(newProker);

        return res.status(201).send(successResponse('Proker created successfully', savedProker));
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            return res.status(400).send(validationResponse(error.details[0].message));
        }
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};


export const getAllProkers = async (req: Request, res: Response) => {
    try {
        // Mengambil semua data proker
        const prokers = await prokerRepository.find();

        return res.status(200).send(successResponse('Prokers retrieved successfully', prokers));
    } catch (error) {
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};


export const getProkerById = async (req: Request, res: Response) => {
    try {
        const prokerId = req.params.id;

        // Validasi ID
        const getProkerSchema = Joi.object({
            id: Joi.string().uuid().required(),
        });

        await getProkerSchema.validateAsync({ id: prokerId });

        // Mengambil proker berdasarkan ID
        const proker = await prokerRepository.findOneBy({ id: prokerId });

        if (!proker) {
            return res.status(404).send({ message: 'Proker not found' });
        }

        return res.status(200).send(successResponse('Proker retrieved successfully', proker));
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            return res.status(400).send(validationResponse(error.details[0].message));
        }
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};

export const updateProker = async (req: Request, res: Response) => {
    try {
        const prokerId = req.params.id;

        // Validasi ID
        const updateProkerSchema = Joi.object({
            id: Joi.string().uuid().required(),
        });

        await updateProkerSchema.validateAsync({ id: prokerId });

        // Validasi request body
        const updateBodySchema = Joi.object({
            title: Joi.string().optional(),
            description: Joi.string().optional(),
            image: Joi.string().uri().allow(null).optional(),
        });

        await updateBodySchema.validateAsync(req.body);

        // Cari proker berdasarkan ID
        const proker = await prokerRepository.findOneBy({ id: prokerId });

        if (!proker) {
            return res.status(404).send({ message: 'Proker not found' });
        }

        // Update properti yang ada di request body
        if (req.body.title) proker.title = req.body.title;
        if (req.body.description) proker.description = req.body.description;
        if (req.body.image) proker.image = req.body.image;

        // Simpan perubahan
        const updatedProker = await prokerRepository.save(proker);

        return res.status(200).send(successResponse('Proker updated successfully', updatedProker));
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            return res.status(400).send(validationResponse(error.details[0].message));
        }
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};


export const deleteProker = async (req: Request, res: Response) => {
    try {
        const prokerId = req.params.id;

        // Validasi ID
        const deleteProkerSchema = Joi.object({
            id: Joi.string().uuid().required(),
        });

        await deleteProkerSchema.validateAsync({ id: prokerId });

        // Cari proker berdasarkan ID
        const proker = await prokerRepository.findOneBy({ id: prokerId });

        if (!proker) {
            return res.status(404).send({ message: 'Proker not found' });
        }

        // Hapus proker
        await prokerRepository.remove(proker);

        return res.status(200).send(successResponse('Proker deleted successfully'));
    } catch (error) {
        if (error instanceof Joi.ValidationError) {
            return res.status(400).send(validationResponse(error.details[0].message));
        }
        return res.status(500).send({ message: 'Internal Server Error' });
    }
};
