import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
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


function validateRequiredFields(body: any, requiredFields: string[]) {
    for (const field of requiredFields) {
        if (!body[field]) {
            throw new ErrorHandler(`Missing required field: ${field}`, 400);
        }
    }
}


function validateNoExtraFields(body: any, validFields: string[]) {
    for (const field in body) {
        if (!validFields.includes(field)) {
            throw new ErrorHandler(`Unexpected field: ${field}`, 400);
        }
    }
}

export class RoomAmenityController {

    static async createRoomAmenity(req: Request, res: Response, next: NextFunction) {
        try {
            const { room_id, amenity_type } = req.body;

            validateRequiredFields(req.body, ['room_id', 'amenity_type']);
            validateNoExtraFields(req.body, ['room_id', 'amenity_type']);

            const room = await client.room.findUnique({ where: { id: room_id } });
            if (!room) {
                return next(new ErrorHandler('Room not found', 404));
            }

            const newRoomAmenity = await client.room_amenity.create({
                data: {
                    room_id,
                    amenity_type
                }
            });

            sendResponse(res, 201, true, "Room amenity created successfully", newRoomAmenity);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create room amenity: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

  
    static async getAllRoomAmenities(req: Request, res: Response, next: NextFunction) {
        try {
            const roomAmenities = await client.room_amenity.findMany({
                include: { room: true }
            });

            if (roomAmenities.length === 0) {
                return next(new ErrorHandler('No room amenities found', 404));
            }

            sendResponse(res, 200, true, "Room amenities fetched successfully", roomAmenities);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch room amenities: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

 
    static async getRoomAmenityById(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const roomAmenity = await client.room_amenity.findUnique({
                where: { id: idNumber },
                include: { room: true }
            });

            if (!roomAmenity) {
                return next(new ErrorHandler('Room amenity not found', 404));
            }

            sendResponse(res, 200, true, "Room amenity fetched successfully", roomAmenity);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch room amenity: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    
    static async updateRoomAmenity(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { amenity_type } = req.body;

            validateNoExtraFields(req.body, ['amenity_type']);

            const existingRoomAmenity = await client.room_amenity.findUnique({
                where: { id: idNumber }
            });

            if (!existingRoomAmenity) {
                return next(new ErrorHandler('Room amenity not found', 404));
            }

            const updatedRoomAmenity = await client.room_amenity.update({
                where: { id: idNumber },
                data: {
                    amenity_type: amenity_type !== undefined ? amenity_type : existingRoomAmenity.amenity_type
                }
            });

            sendResponse(res, 200, true, "Room amenity updated successfully", updatedRoomAmenity);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update room amenity: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }


    static async deleteRoomAmenity(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingRoomAmenity = await client.room_amenity.findUnique({
                where: { id: idNumber }
            });

            if (!existingRoomAmenity) {
                return next(new ErrorHandler('Room amenity not found', 404));
            }

            await client.room_amenity.delete({
                where: { id: idNumber }
            });

            sendResponse(res, 200, true, "Room amenity deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete room amenity: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
