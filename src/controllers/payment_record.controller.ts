import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { ErrorHandler } from "@errors";

const client = new PrismaClient();

// ID formatini tekshirish funksiyasi
function validateId(id: string): number {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
        throw new ErrorHandler('Invalid ID format', 400);
    }
    return idNumber;
}

// Javob yuborish funksiyasi
function sendResponse(res: Response, statusCode: number, success: boolean, message: string, data?: any) {
    res.status(statusCode).json({
        success,
        message,
        data
    });
}

// Kerakli maydonlarni tekshirish funksiyasi
function validateRequiredFields(body: any, requiredFields: string[]) {
    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === null) {
            throw new ErrorHandler(`Missing required field: ${field}`, 400);
        }
    }
}

// Qo'shimcha maydonlarni tekshirish funksiyasi
function validateNoExtraFields(body: any, validFields: string[]) {
    for (const field in body) {
        if (!validFields.includes(field)) {
            throw new ErrorHandler(`Unexpected field: ${field}`, 400);
        }
    }
}

export class PaymentRecordController {


    static async createPaymentRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const { reservation_id, amount, payment_date, payment_method } = req.body;

            validateRequiredFields(req.body, ['reservation_id', 'amount', 'payment_date', 'payment_method']);
            validateNoExtraFields(req.body, ['reservation_id', 'amount', 'payment_date', 'payment_method']);

           
            const reservation = await client.reservation.findUnique({ where: { id: reservation_id } });
            if (!reservation) {
                return next(new ErrorHandler('Reservation not found', 404));
            }

            const newPaymentRecord = await client.payment_record.create({
                data: {
                    reservation_id,
                    amount,
                    payment_date,
                    payment_method
                }
            });

            sendResponse(res, 201, true, "Payment record created successfully", newPaymentRecord);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create payment record: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getAllPaymentRecords(req: Request, res: Response, next: NextFunction) {
        try {
            const paymentRecords = await client.payment_record.findMany({
                include: { reservation: true }
            });

            if (paymentRecords.length === 0) {
                return sendResponse(res, 404, false, 'No payment records found');
            }

            sendResponse(res, 200, true, "Payment records fetched successfully", paymentRecords);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch payment records: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getPaymentRecordById(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const paymentRecord = await client.payment_record.findUnique({
                where: { id: idNumber },
                include: { reservation: true }
            });

            if (!paymentRecord) {
                return sendResponse(res, 404, false, 'Payment record not found');
            }

            sendResponse(res, 200, true, "Payment record fetched successfully", paymentRecord);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch payment record: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }


    static async updatePaymentRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { amount, payment_date, payment_method } = req.body;

            validateNoExtraFields(req.body, ['amount', 'payment_date', 'payment_method']);

            const existingPaymentRecord = await client.payment_record.findUnique({
                where: { id: idNumber },
            });

            if (!existingPaymentRecord) {
                return sendResponse(res, 404, false, 'Payment record not found');
            }

            const updatedPaymentRecord = await client.payment_record.update({
                where: { id: idNumber },
                data: {
                    amount: amount !== undefined ? amount : existingPaymentRecord.amount,
                    payment_date: payment_date !== undefined ? new Date(payment_date) : existingPaymentRecord.payment_date,
                    payment_method: payment_method !== undefined ? payment_method : existingPaymentRecord.payment_method
                }
            });

            sendResponse(res, 200, true, "Payment record updated successfully", updatedPaymentRecord);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update payment record: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

 
    static async deletePaymentRecord(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingPaymentRecord = await client.payment_record.findUnique({
                where: { id: idNumber }
            });

            if (!existingPaymentRecord) {
                return sendResponse(res, 404, false, 'Payment record not found');
            }

            await client.payment_record.delete({
                where: { id: idNumber }
            });

            sendResponse(res, 200, true, "Payment record deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete payment record: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
