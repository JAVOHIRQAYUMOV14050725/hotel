import { Request, Response, NextFunction } from "express";
import { PrismaClient, room } from "@prisma/client";
import { ErrorHandler } from "@errors";

const client = new PrismaClient();

function validateId(id: string): number {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        throw new ErrorHandler('Invalid ID format', 400);
    }
    return idNumber;
}

export class RoomController {
    // Barcha xonalarni olish
    static async getAllRooms(req: Request, res: Response, next: NextFunction) {
        try {
            const rooms: room[] = await client.room.findMany({  include: {
                hotel: true, // Xonalarni ham qo'shish
            },});
            res.status(200).json({
                success: true,
                data: rooms,
            });
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch rooms: ${error}`, 500));
        }
    }




    static async createRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { hotel_id, roomNumber, room_type, price, availability } = req.body;
    
            
            if (hotel_id === undefined || roomNumber === undefined || room_type === undefined || price === undefined || availability === undefined) {
                return next(new ErrorHandler('All fields are required', 400));
            }
    
        
            const existingHotel = await client.hotel.findUnique({
                where: { id: hotel_id },
            });
    
            if (!existingHotel) {
                return next(new ErrorHandler('Hotel with this ID does not exist', 400));
            }
    
            const existingRoom = await client.room.findFirst({
                where: {
                    hotel_id: hotel_id,
                    roomNumber: roomNumber,
                },
            });
    
            if (existingRoom) {
                return next(new ErrorHandler('Room with this number already exists in this hotel', 400));
            }
    
    
            const newRoom = await client.room.create({
                data: { hotel_id, roomNumber, room_type, price, availability },
            });
            res.status(200).json({
                success: true,
                message: "Room created successfully",
                data: newRoom,
            });
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create room: ${error}`, 400));
        }
    }
    





    static async updateRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { hotel_id, roomNumber, room_type, price, availability } = req.body;

            let errors: string[] = [];

            if (hotel_id !== undefined && (typeof hotel_id !== 'number' || hotel_id <= 0)) errors.push('Hotel ID must be a positive number');
            if (roomNumber !== undefined && (typeof roomNumber !== 'number' || roomNumber <= 0)) errors.push('Room number must be a positive number');
            if (room_type !== undefined && typeof room_type !== 'string') errors.push('Room type must be a string');
            if (price !== undefined && (typeof price !== 'number' || price < 0)) errors.push('Price must be a positive number');
            if (availability !== undefined && typeof availability !== 'boolean') errors.push('Availability must be a boolean');

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            
            const existingRoom = await client.room.findUnique({
                where: { id: idNumber },
            });

            if (!existingRoom) {
                return next(new ErrorHandler('Room not found', 404));
            }

         
            const updatedData: Partial<room> = {
                hotel_id: hotel_id !== undefined ? hotel_id : existingRoom.hotel_id,
                roomNumber: roomNumber !== undefined ? roomNumber : existingRoom.roomNumber,
                room_type: room_type !== undefined ? room_type : existingRoom.room_type,
                price: price !== undefined ? price : existingRoom.price,
                availability: availability !== undefined ? availability : existingRoom.availability,
            };

        
            const updatedRoom = await client.room.update({
                where: { id: idNumber },
                data: updatedData,
            });

            res.status(200).json({
                success: true,
                message: "Room updated successfully",
                data: updatedRoom,
            });
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update room: ${error}`, 500));
        }
    }

    static async deleteRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

           
            const existingRoom = await client.room.findUnique({
                where: { id: idNumber },
            });

            if (!existingRoom) {
                return next(new ErrorHandler('Room not found', 404));
            }

            
            await client.room.delete({
                where: { id: idNumber },
            });

            res.status(200).json({
                success: true,
                message: "Room deleted successfully",
            });
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete room: ${error}`, 500));
        }
    }
}
