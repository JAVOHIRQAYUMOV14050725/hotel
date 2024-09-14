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

export class ServiceReservationController {


static async createServiceReservation(req: Request, res: Response, next: NextFunction) {
    try {
        const { reservation_id, service_id, quantity, price } = req.body;

        validateRequiredFields(req.body, ['reservation_id', 'service_id', 'quantity', 'price']);
        validateNoExtraFields(req.body, ['reservation_id', 'service_id', 'quantity', 'price']);

        
        const reservation = await client.reservation.findUnique({
            where: { id: reservation_id }
        });
        if (!reservation) {
            return next(new ErrorHandler('Reservation not found', 404));
        }

        const service = await client.service.findUnique({
            where: { id: service_id }
        });
        if (!service) {
            return next(new ErrorHandler('Service not found', 404));
        }

        if (quantity <= 0) {
            return next(new ErrorHandler('Quantity must be greater than zero', 400));
        }
        if (price <= 0) {
            return next(new ErrorHandler('Price must be greater than zero', 400));
        }

        
        const existingServiceReservation = await client.service_reservation.findFirst({
            where: {
                reservation_id,
                service_id
            }
        });

        if (existingServiceReservation) {
            return next(new ErrorHandler('Service reservation already exists with this reservation_id and service_id', 400));
        }

        const newServiceReservation = await client.service_reservation.create({
            data: {
                reservation_id,
                service_id,
                quantity,
                price,
            }
        });

        sendResponse(res, 201, true, "Service reservation created successfully", newServiceReservation);
    } catch (error: unknown) {
        next(new ErrorHandler(`Failed to create service reservation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
    }
}


    static async getAllServiceReservations(req: Request, res: Response, next: NextFunction) {
        try {
            const serviceReservations = await client.service_reservation.findMany({
                include: { reservation: true, service: true },
            });

            if (serviceReservations.length === 0) {
                return next(new ErrorHandler('No service reservations found', 404));
            }

            sendResponse(res, 200, true, "Service reservations fetched successfully", serviceReservations);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch service reservations: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getServiceReservationById(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const serviceReservation = await client.service_reservation.findUnique({
                where: { id: idNumber },
                include: { reservation: true, service: true },
            });

            if (!serviceReservation) {
                return next(new ErrorHandler('Service reservation not found', 404));
            }

            sendResponse(res, 200, true, "Service reservation fetched successfully", serviceReservation);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch service reservation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async updateServiceReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { reservation_id, service_id, quantity, price } = req.body;

            validateNoExtraFields(req.body, ['reservation_id', 'service_id', 'quantity', 'price']);

            const existingServiceReservation = await client.service_reservation.findUnique({
                where: { id: idNumber },
            });

            if (!existingServiceReservation) {
                return next(new ErrorHandler('Service reservation not found', 404));
            }

            if (quantity !== undefined && quantity <= 0) {
                return next(new ErrorHandler('Quantity must be greater than zero', 400));
            }
            if (price !== undefined && price <= 0) {
                return next(new ErrorHandler('Price must be greater than zero', 400));
            }

            const updatedServiceReservation = await client.service_reservation.update({
                where: { id: idNumber },
                data: {
                    reservation_id: reservation_id !== undefined ? reservation_id : existingServiceReservation.reservation_id,
                    service_id: service_id !== undefined ? service_id : existingServiceReservation.service_id,
                    quantity: quantity !== undefined ? quantity : existingServiceReservation.quantity,
                    price: price !== undefined ? price : existingServiceReservation.price,
                },
            });

            sendResponse(res, 200, true, "Service reservation updated successfully", updatedServiceReservation);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update service reservation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async deleteServiceReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            
            const existingServiceReservation = await client.service_reservation.findUnique({
                where: { id: idNumber },
            });

            if (!existingServiceReservation) {
                return next(new ErrorHandler('Service reservation not found', 404));
            }

            await client.service_reservation.delete({
                where: { id: idNumber },
            });

            sendResponse(res, 200, true, "Service reservation deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete service reservation: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
