import { PromotionController } from "@controllers";
import { Router } from "express"; 

let promotionRouter = Router()

promotionRouter.get("/getAll",PromotionController.getAllPromotions)
promotionRouter.get("/get/:id",PromotionController.getPromotionById)
promotionRouter.post("/create",PromotionController.createPromotion)
promotionRouter.patch("/update/:id",PromotionController.updatePromotion)
promotionRouter.delete("/delete/:id",PromotionController.deletePromotion)


export {promotionRouter}