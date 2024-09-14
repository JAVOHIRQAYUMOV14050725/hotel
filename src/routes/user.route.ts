
import { UserController } from "@controllers";
import { Router } from "express";

let userRouter:Router = Router()

userRouter.get("/getAll",UserController.getAllUsers)
userRouter.post("/create",UserController.createUser)
userRouter.patch("/update/:id",UserController.updateUser)
userRouter.delete("/delete/:id",UserController.deleteUser)


export {userRouter}