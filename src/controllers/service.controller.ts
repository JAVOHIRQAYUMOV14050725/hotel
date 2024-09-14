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

export class ServiceController {

    static async createService(req: Request, res: Response, next: NextFunction) {
        try {
            const { hotel_id, service_type, price } = req.body;

            // Validate required fields
            if (!hotel_id || !service_type || !price) {
                return next(new ErrorHandler('Missing required fields: hotel_id, service_type, or price', 400));
            }

            const hotel = await client.hotel.findUnique({
                where: { id: hotel_id }
            });
            if (!hotel) {
                return next(new ErrorHandler('Hotel not found', 404));
            }

            const newService = await client.service.create({
                data: {
                    hotel_id,
                    service_type,
                    price,
                }
            });

            sendResponse(res, 201, true, "Service created successfully", newService);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create service: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getAllServices(req: Request, res: Response, next: NextFunction) {
        try {
            const services = await client.service.findMany({
                include: { hotel: true },
            });
            sendResponse(res, 200, true, "Services fetched successfully", services);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch services: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getServiceById(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const service = await client.service.findUnique({
                where: { id: idNumber },
                include: { hotel: true },
            });

            if (!service) {
                return next(new ErrorHandler('Service not found', 404));
            }

            sendResponse(res, 200, true, "Service fetched successfully", service);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch service: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async updateService(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { hotel_id, service_type, price } = req.body;

            const existingService = await client.service.findUnique({
                where: { id: idNumber },
            });

            if (!existingService) {
                return next(new ErrorHandler('Service not found', 404));
            }

            if (
                existingService.hotel_id === hotel_id &&
                existingService.service_type === service_type &&
                existingService.price === price
            ) {
                return next(new ErrorHandler('No changes detected: The service already has identical data', 400));
            }

            const updatedService = await client.service.update({
                where: { id: idNumber },
                data: {
                    hotel_id: hotel_id !== undefined ? hotel_id : existingService.hotel_id,
                    service_type: service_type !== undefined ? service_type : existingService.service_type,
                    price: price !== undefined ? price : existingService.price,
                },
            });

            sendResponse(res, 200, true, "Service updated successfully", updatedService);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update service: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async deleteService(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingService = await client.service.findUnique({
                where: { id: idNumber },
            });

            if (!existingService) {
                return next(new ErrorHandler('Service not found', 404));
            }

            await client.service.delete({
                where: { id: idNumber },
            });

            sendResponse(res, 200, true, "Service deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete service: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
