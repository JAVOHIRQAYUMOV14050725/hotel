import { Request, Response, NextFunction } from "express";
import { PrismaClient, reservation } from "@prisma/client";
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

export class ReservationController {
    static async getAllReservations(req: Request, res: Response, next: NextFunction) {
        try {
            const reservations: reservation[] = await client.reservation.findMany({
                include: {
                    room: true,
                    services: true,
                    payment_records: true,
                },
            });
            sendResponse(res, 200, true, "Reservations fetched successfully", reservations);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch reservations: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async createReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id, room_id, check_in_date, check_out_date, status, ...extraFields } = req.body;

            const requiredFields = ['user_id', 'room_id', 'check_in_date', 'check_out_date', 'status'];
            const missingFields = requiredFields.filter(field => req.body[field] === undefined);
            const unexpectedFields = Object.keys(extraFields);

            if (missingFields.length > 0) {
                return next(new ErrorHandler(`Missing required fields: ${missingFields.join(', ')}`, 400));
            }
            
            if (unexpectedFields.length > 0) {
                return next(new ErrorHandler(`Unexpected fields provided: ${unexpectedFields.join(', ')}`, 400));
            }

            const checkInDate = new Date(check_in_date);
            const checkOutDate = new Date(check_out_date);
            if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
                return next(new ErrorHandler('Invalid date format. Should be in YYYY-MM-DD format.', 400));
            }

            const existingUser = await client.user.findUnique({
                where: { id: user_id },
            });
            if (!existingUser) {
                return next(new ErrorHandler('User not found', 404));
            }

            const existingRoom = await client.room.findUnique({
                where: { id: room_id },
            });
            if (!existingRoom) {
                return next(new ErrorHandler('Room not found', 404));
            }

            const existingReservation = await client.reservation.findFirst({
                where: {
                    user_id,
                    room_id,
                    check_in_date: checkInDate,
                    check_out_date: checkOutDate,
                    status,
                },
            });
            if (existingReservation) {
                return next(new ErrorHandler('A reservation already exists with the same details.', 400));
            }

            const newReservation = await client.reservation.create({
                data: { 
                    user_id, 
                    room_id, 
                    check_in_date: checkInDate, 
                    check_out_date: checkOutDate, 
                    status 
                },
            });

            sendResponse(res, 201, true, "Reservation created successfully", newReservation);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create reservation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async updateReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { user_id, room_id, check_in_date, check_out_date, status, ...extraFields }: Partial<reservation> = req.body;

            let errors: string[] = [];
            if (user_id !== undefined && typeof user_id !== 'number') errors.push('user_id must be a number');
            if (room_id !== undefined && typeof room_id !== 'number') errors.push('room_id must be a number');
            if (check_in_date !== undefined && isNaN(new Date(check_in_date).getTime())) errors.push('check_in_date must be a valid date');
            if (check_out_date !== undefined && isNaN(new Date(check_out_date).getTime())) errors.push('check_out_date must be a valid date');
            if (status !== undefined && typeof status !== 'string') errors.push('status must be a string');

            const unexpectedFields = Object.keys(extraFields);
            if (unexpectedFields.length > 0) {
                errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
            }

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            const existingReservation = await client.reservation.findUnique({
                where: { id: idNumber },
            });

            if (!existingReservation) {
                return next(new ErrorHandler('Reservation not found', 404));
            }

            if (user_id !== undefined) {
                const existingUser = await client.user.findUnique({
                    where: { id: user_id },
                });
                if (!existingUser) {
                    return next(new ErrorHandler('User not found', 404));
                }
            }

            if (room_id !== undefined) {
                const existingRoom = await client.room.findUnique({
                    where: { id: room_id },
                });
                if (!existingRoom) {
                    return next(new ErrorHandler('Room not found', 404));
                }
            }

            const conflictingReservation = await client.reservation.findFirst({
                where: {
                    user_id: user_id !== undefined ? user_id : existingReservation.user_id,
                    room_id: room_id !== undefined ? room_id : existingReservation.room_id,
                    check_in_date: check_in_date !== undefined ? new Date(check_in_date) : existingReservation.check_in_date,
                    check_out_date: check_out_date !== undefined ? new Date(check_out_date) : existingReservation.check_out_date,
                    status: status !== undefined ? status : existingReservation.status,
                    NOT: { id: idNumber },
                },
            });

            if (conflictingReservation) {
                return next(new ErrorHandler('A reservation already exists with the same details.', 400));
            }

            const updatedData: Partial<reservation> = {
                user_id: user_id !== undefined ? user_id : existingReservation.user_id,
                room_id: room_id !== undefined ? room_id : existingReservation.room_id,
                check_in_date: check_in_date !== undefined ? new Date(check_in_date) : existingReservation.check_in_date,
                check_out_date: check_out_date !== undefined ? new Date(check_out_date) : existingReservation.check_out_date,
                status: status !== undefined ? status : existingReservation.status,
            };

            const updatedReservation = await client.reservation.update({
                where: { id: idNumber },
                data: updatedData,
            });

            sendResponse(res, 200, true, "Reservation updated successfully", updatedReservation);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update reservation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async deleteReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingReservation = await client.reservation.findUnique({
                where: { id: idNumber },
            });

            if (!existingReservation) {
                return next(new ErrorHandler('Reservation not found', 404));
            }

            await client.reservation.delete({
                where: { id: idNumber },
            });

            sendResponse(res, 200, true, "Reservation deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete reservation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
