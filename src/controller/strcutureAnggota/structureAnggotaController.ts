import { Request, Response } from 'express';
import Joi from 'joi';
import { AppDataSource } from '../../data-source';
import { user } from '../../model/user';
import { StructurePosition } from '../../model/structurePosition';
import { StructurePerson } from '../../model/structurePerson';

const { successResponse, validationResponse, responseHandler } = require('../utils/response');
const userRepository = AppDataSource.getRepository(user);
const structurePositionRepository = AppDataSource.getRepository(StructurePosition);
const structurePersonRepository = AppDataSource.getRepository(StructurePerson);


export const getOrganizationStructure = async (req: Request, res: Response) => {
    try {
        const structures = await structurePositionRepository.find({
            relations: ['structuresPerson'],
        });

        const responseData = structures.map(structure => ({
            id: structure.id,
            positionName: structure.positionName,
            organizationStructurePerson: structure.structuresPerson.map(person => ({
                id: person.id,
                personName: person.personName,
                descriptionPerson: person.descriptionPerson,
                image: person.image,
                rank: person.rank,
                structuresPosition: {
                    id: structure.id,
                    positionName: structure.positionName,
                },
            })),
        }));

        return res.status(200).send(successResponse('Organization structure retrieved successfully', responseData));
    } catch (error) {
        return res.status(400).send({ message: error.message });
    }
};


export const createOrganizationStructure = async (req: Request, res: Response) => {
    const createOrganizationStructureSchema = Joi.object({
        organizations: Joi.array().items(
            Joi.object({
                id: Joi.string().uuid().required(),
                organizationStructurePerson: Joi.array().items(
                    Joi.object({
                        personId: Joi.string().uuid().allow(null),
                        name: Joi.string().required(),
                        description: Joi.string().allow(''),
                        picture: Joi.string().uri()
                    })
                )
            })
        ).required()
    });

    try {
        await createOrganizationStructureSchema.validateAsync(req.body);

        const user = await userRepository.findOneBy({ id: req.jwtPayload.id });

        if (!user) {
            return res.status(401).send(successResponse('Add Event is Not Authorized'));
        }

        const body = req.body;
        const responseData = [];

        for (const o of body.organizations) {
            const organizationId = o.id;
            const organization = await structurePositionRepository.findOneBy({ id: organizationId });

            if (!organization) {
                return res.status(400).send(successResponse('Organization not found'));
            }

            const lastPersonInOrganization = await structurePersonRepository.findOne({
                where: {
                    structuresPosition: organization
                },
                order: {
                    rank: 'DESC'
                }
            });

            let lastRank = 0;
            if (lastPersonInOrganization) {
                lastRank = lastPersonInOrganization.rank;
            }

            const organizationData = {
                id: organizationId,
                organizationStructurePerson: []
            };

            for (const p of o.organizationStructurePerson) {
                if (p.personId == null) {
                    // create new person
                    const newPerson = new StructurePerson();
                    newPerson.updatedBy = user
                    newPerson.personName = p.name;
                    newPerson.descriptionPerson = p.description;
                    newPerson.image = p.picture;
                    lastRank++;
                    newPerson.rank = lastRank;
                    newPerson.structuresPosition = organization;
                    const savedPerson = await structurePersonRepository.save(newPerson);
                    organizationData.organizationStructurePerson.push(savedPerson);
                } else {
                    const person = await structurePersonRepository.findOneBy({ id: p.personId });

                    if (!person) {
                        return res.status(400).send(successResponse('Person not found'));
                    }

                    person.personName = p.name;
                    person.updatedBy = user
                    person.descriptionPerson = p.description;
                    person.image = p.picture;
                    person.structuresPosition = organization;
                    const updatedPerson = await structurePersonRepository.save(person);
                    organizationData.organizationStructurePerson.push(updatedPerson);
                }
            }

            responseData.push(organizationData);
        }

        return res.status(200).send(successResponse('Organization has been created', responseData));
    } catch (error) {
        return res.status(400).send({ message: error.message });
    }
};
