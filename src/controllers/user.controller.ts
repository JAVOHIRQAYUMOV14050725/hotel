import { Request, Response, NextFunction } from "express";
import { PrismaClient, user } from "@prisma/client";
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

export class UserController {
    static async getAllUsers(req: Request, res: Response, next: NextFunction) {
        try {
            const users: user[] = await client.user.findMany({
                include: {
                    reservations: true,
                    reviews: true,
                },
            });
            sendResponse(res, 200, true, "Users fetched successfully", users);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to fetch users: ${error}`, 500));
        }
    }

    static async createUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, email, password, phone } = req.body;

            let errors: string[] = [];

            // Validate required fields
            if (!name) errors.push('Name is required');
            if (!email) errors.push('Email is required');
            if (!password) errors.push('Password is required');
            if (!phone) errors.push('Phone is required');

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            // Check if email already exists
            const existingUser = await client.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                return next(new ErrorHandler('Email already in use', 400));
            }

            // Create user
            const newUser = await client.user.create({
                data: { name, email, password, phone },
            });

            sendResponse(res, 201, true, "User created successfully", newUser);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to create user: ${error}`, 400));
        }
    }

    static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);
            const { name, email, password, phone, ...extraFields }: Partial<user> = req.body;

            let errors: string[] = [];
            let unexpectedFields: string[] = Object.keys(extraFields);

            // Validate input
            if (name !== undefined && typeof name !== 'string') errors.push('Name must be a string');
            if (email !== undefined && typeof email !== 'string') errors.push('Email must be a string');
            if (password !== undefined && typeof password !== 'string') errors.push('Password must be a string');
            if (phone !== undefined && typeof phone !== 'string') errors.push('Phone must be a string');

            if (unexpectedFields.length > 0) {
                errors.push(`Unexpected fields provided: ${unexpectedFields.join(', ')}`);
            }

            if (errors.length > 0) {
                return next(new ErrorHandler(errors.join(', '), 400));
            }

            const existingUser = await client.user.findUnique({
                where: { id: idNumber },
            });

            if (!existingUser) {
                return next(new ErrorHandler('User not found', 404));
            }

            const updatedData: Partial<user> = {
                name: name !== undefined ? name : existingUser.name,
                email: email !== undefined ? email : existingUser.email,
                password: password !== undefined ? password : existingUser.password,
                phone: phone !== undefined ? phone : existingUser.phone,
            };

            const updatedUser = await client.user.update({
                where: { id: idNumber },
                data: updatedData,
            });

            sendResponse(res, 200, true, "User updated successfully", updatedUser);
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to update user: ${error}`, 500));
        }
    }

    static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const idNumber = validateId(req.params.id);

            const existingUser = await client.user.findUnique({
                where: { id: idNumber },
            });

            if (!existingUser) {
                return next(new ErrorHandler('User not found', 404));
            }

            await client.user.delete({
                where: { id: idNumber },
            });

            sendResponse(res, 200, true, "User deleted successfully");
        } catch (error: unknown) {
            next(new ErrorHandler(`Failed to delete user: ${error}`, 500));
        }
    }
}
