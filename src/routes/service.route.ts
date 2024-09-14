
import { ServiceController } from "@controllers";
import { Router } from "express";

let serviceRouter:Router = Router()

serviceRouter.get("/getAll",ServiceController.getAllServices)
serviceRouter.get("/get/:id",ServiceController.getServiceById)
serviceRouter.post("/create",ServiceController.createService)
serviceRouter.patch("/update/:id",ServiceController.updateService)
serviceRouter.delete("/delete/:id",ServiceController.deleteService)


export {serviceRouter}