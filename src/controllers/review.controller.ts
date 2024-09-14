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


export class ReviewController {

    // CREATE (Yangi sharh yaratish)
    static async createReview(req: Request, res: Response, next: NextFunction) {
        try {
            const { user_id, hotel_id, rating, comment, review_date } = req.body;

       
            validateRequiredFields(req.body, ['user_id', 'hotel_id', 'rating', 'comment', 'review_date']);
            validateNoExtraFields(req.body, ['user_id', 'hotel_id', 'rating', 'comment', 'review_date']);

        
            const user = await client.user.findUnique({ where: { id: user_id } });
            if (!user) {
                return next(new ErrorHandler('User not found', 404));
            }

            const hotel = await client.hotel.findUnique({ where: { id: hotel_id } });
            if (!hotel) {
                return next(new ErrorHandler('Hotel not found', 404));
            }

           
            if (rating < 0 || rating > 5) {
                return next(new ErrorHandler('Rating must be between 0 and 5', 400));
            }

     
            const existingReview = await client.review.findFirst({
                where: {
                    user_id,
                    hotel_id
                }
            });

            if (existingReview) {
                return next(new ErrorHandler('Review already exists for this user and hotel', 400));
            }

            
            const newReview = await client.review.create({
                data: {
                    user_id,
                    hotel_id,
                    rating,
                    comment,
                    review_date: new Date(review_date),
                }
            });

            sendResponse(res, 201, true, "Review created successfully", newReview);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create review: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getAllReviews(req: Request, res: Response, next: NextFunction) {
        try {
            const reviews = await client.review.findMany({
                include: { user: true, hotel: true }
            });

       
            if (reviews.length === 0) {
                return next(new ErrorHandler('No reviews found', 404));
            }

            sendResponse(res, 200, true, "Reviews fetched successfully", reviews);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch reviews: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async getReviewById(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const review = await client.review.findUnique({
                where: { id: idNumber },
                include: { user: true, hotel: true }
            });

         
            if (!review) {
                return next(new ErrorHandler('Review not found', 404));
            }

            sendResponse(res, 200, true, "Review fetched successfully", review);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch review: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async updateReview(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { rating, comment, review_date } = req.body;

         
            validateNoExtraFields(req.body, ['rating', 'comment', 'review_date']);

           
            const existingReview = await client.review.findUnique({
                where: { id: idNumber },
            });

            
            if (!existingReview) {
                return next(new ErrorHandler('Review not found', 404));
            }

          
            if (rating !== undefined && (rating < 0 || rating > 5)) {
                return next(new ErrorHandler('Rating must be between 0 and 5', 400));
            }

            
            const updatedReview = await client.review.update({
                where: { id: idNumber },
                data: {
                    rating: rating !== undefined ? rating : existingReview.rating,
                    comment: comment !== undefined ? comment : existingReview.comment,
                    review_date: review_date !== undefined ? new Date(review_date) : existingReview.review_date,
                },
            });

            sendResponse(res, 200, true, "Review updated successfully", updatedReview);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update review: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }

    static async deleteReview(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingReview = await client.review.findUnique({
                where: { id: idNumber },
            });

            
            if (!existingReview) {
                return next(new ErrorHandler('Review not found', 404));
            }

            
            await client.review.delete({
                where: { id: idNumber },
            });

            sendResponse(res, 200, true, "Review deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete review: ${error instanceof Error ? error.message : 'Unknown error'}`, 500));
        }
    }
}
