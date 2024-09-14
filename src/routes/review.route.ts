
import { ReviewController } from "@controllers";
import { Router } from "express";

let reviewRouter:Router = Router()

reviewRouter.get("/getAll",ReviewController.getAllReviews)
reviewRouter.get("/get/:id",ReviewController.getReviewById)
reviewRouter.post("/create",ReviewController.createReview)
reviewRouter.patch("/update/:id",ReviewController.updateReview)
reviewRouter.delete("/delete/:id",ReviewController.deleteReview)


export {reviewRouter}