import { Request, Response, NextFunction } from "express";
import { PrismaClient, hotel } from "@prisma/client";
import { ErrorHandler } from "@errors";

const client = new PrismaClient();

function validateId(id: string): number {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        throw new ErrorHandler('Invalid ID format', 400);
    }
    return idNumber;
}

function sendResponse(res: Response, statusCode: number, success: boolean, message: string, data?: any) {
    res.status(statusCode).json({
        success,
        message,
        data
    });
}

export class HotelController {
    static async getAllHotels(req: Request, res: Response, next: NextFunction) {
        try {
            const hotels: hotel[] = await client.hotel.findMany({  include: {
                rooms: true, 
            },});
            sendResponse(res, 200, true, "Hotels fetched successfully", hotels);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch hotels: ${error}`, 500));
        }
    }

    static async createHotel(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, location, rating, description, ...extraFields } = req.body;

            let errors: string[] = [];
            let unexpectedFields: string[] = Object.keys(extraFields);

            // Keraksiz yoki noto‘g‘ri ma'lumotlarni tekshirish
            if (!name) errors.push('Name is required');
            if (!location) errors.push('Location is required');
            if (rating === undefined || typeof rating !== 'number' || rating < 0 || rating > 5) errors.push('Rating must be a number between 0 and 5');
            if (!description) errors.push('Description is required');

            if (unexpectedFields.length > 0) {
                errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
            }

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            const existingHotel = await client.hotel.findUnique({
                where: { name },
            });

            if (existingHotel) {
                return next(new ErrorHandler('Hotel with this name already exists', 400));
            }

            const newHotel = await client.hotel.create({
                data: { name, location, rating, description },
            });

            sendResponse(res, 201, true, "Hotel created successfully", newHotel);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create hotel: ${error}`, 400));
        }
    }

    static async updateHotel(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { name, location, rating, description, ...extraFields }: Partial<hotel> = req.body;

            let errors: string[] = [];
            let unexpectedFields: string[] = Object.keys(extraFields);

            // Keraksiz yoki noto‘g‘ri ma'lumotlarni tekshirish
            if (name !== undefined && typeof name !== 'string') errors.push('Name must be a string');
            if (location !== undefined && typeof location !== 'string') errors.push('Location must be a string');
            if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) errors.push('Rating must be a number between 0 and 5');
            if (description !== undefined && typeof description !== 'string') errors.push('Description must be a string');

            if (unexpectedFields.length > 0) {
                errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
            }

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            const existingHotel = await client.hotel.findUnique({
                where: { id: idNumber },
            });

            if (!existingHotel) {
                return next(new ErrorHandler('Hotel not found', 404));
            }

            const updatedData: Partial<hotel> = {
                name: name !== undefined ? name : existingHotel.name,
                location: location !== undefined ? location : existingHotel.location,
                rating: rating !== undefined ? rating : existingHotel.rating,
                description: description !== undefined ? description : existingHotel.description,
            };

            const updatedHotel = await client.hotel.update({
                where: { id: idNumber },
                data: updatedData,
            });

            sendResponse(res, 200, true, "Hotel updated successfully", updatedHotel);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update hotel: ${error}`, 500));
        }
    }

    static async deleteHotel(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingHotel = await client.hotel.findUnique({
                where: { id: idNumber },
            });

            if (!existingHotel) {
                return next(new ErrorHandler('Hotel not found', 404));
            }

            await client.hotel.delete({
                where: { id: idNumber },
            });

            sendResponse(res, 200, true, "Hotel deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete hotel: ${error}`, 500));
        }
    }
}
