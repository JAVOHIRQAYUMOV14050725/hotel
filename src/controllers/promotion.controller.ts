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
    res.status(statusCode).json({ success, message, data });
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

export class PromotionController {

    static async createPromotion(req: Request, res: Response, next: NextFunction) {
        try {
            const { hotel_id, promotion_type, discount_percentage, start_date, end_date } = req.body;

            validateRequiredFields(req.body, ['hotel_id', 'promotion_type', 'discount_percentage', 'start_date', 'end_date']);
            validateNoExtraFields(req.body, ['hotel_id', 'promotion_type', 'discount_percentage', 'start_date', 'end_date']);

            const hotel = await client.hotel.findUnique({ where: { id: hotel_id } });
            if (!hotel) {
                return next(new ErrorHandler('Hotel not found', 404));
            }

            if (discount_percentage <= 0 || discount_percentage > 100) {
                return next(new ErrorHandler('Discount percentage must be between 0 and 100', 400));
            }

            const existingPromotion = await client.promotion.findFirst({
                where: { hotel_id, promotion_type, start_date, end_date }
            });

            if (existingPromotion) {
                return next(new ErrorHandler('Promotion already exists with this hotel_id, promotion_type, start_date, and end_date', 400));
            }

            const newPromotion = await client.promotion.create({
                data: {
                    hotel_id,
                    promotion_type,
                    discount_percentage,
                    start_date,
                    end_date
                }
            });

            sendResponse(res, 201, true, "Promotion created successfully", newPromotion);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create promotion: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getAllPromotions(req: Request, res: Response, next: NextFunction) {
        try {
            const promotions = await client.promotion.findMany({
                include: { hotel: true }
            });

            if (promotions.length === 0) {
                return sendResponse(res, 404, false, 'No promotions found');
            }

            sendResponse(res, 200, true, "Promotions fetched successfully", promotions);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch promotions: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getPromotionById(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const promotion = await client.promotion.findUnique({
                where: { id: idNumber },
                include: { hotel: true }
            });

            if (!promotion) {
                return sendResponse(res, 404, false, 'Promotion not found');
            }

            sendResponse(res, 200, true, "Promotion fetched successfully", promotion);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch promotion: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async updatePromotion(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { promotion_type, discount_percentage, start_date, end_date } = req.body;

            validateNoExtraFields(req.body, ['promotion_type', 'discount_percentage', 'start_date', 'end_date']);

            const existingPromotion = await client.promotion.findUnique({
                where: { id: idNumber },
            });

            if (!existingPromotion) {
                return sendResponse(res, 404, false, 'Promotion not found');
            }

            if (discount_percentage !== undefined && (discount_percentage < 0 || discount_percentage > 100)) {
                return sendResponse(res, 400, false, 'Discount percentage must be between 0 and 100');
            }

            if (start_date !== undefined && end_date !== undefined && new Date(start_date) > new Date(end_date)) {
                return sendResponse(res, 400, false, 'Start date cannot be after end date');
            }

            const updatedPromotion = await client.promotion.update({
                where: { id: idNumber },
                data: {
                    promotion_type: promotion_type !== undefined ? promotion_type : existingPromotion.promotion_type,
                    discount_percentage: discount_percentage !== undefined ? discount_percentage : existingPromotion.discount_percentage,
                    start_date: start_date !== undefined ? new Date(start_date) : existingPromotion.start_date,
                    end_date: end_date !== undefined ? new Date(end_date) : existingPromotion.end_date,
                },
            });

            sendResponse(res, 200, true, "Promotion updated successfully", updatedPromotion);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update promotion: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async deletePromotion(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingPromotion = await client.promotion.findUnique({
                where: { id: idNumber }
            });

            if (!existingPromotion) {
                return sendResponse(res, 404, false, 'Promotion not found');
            }

            await client.promotion.delete({
                where: { id: idNumber }
            });

            sendResponse(res, 200, true, "Promotion deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete promotion: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
