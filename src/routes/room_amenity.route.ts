import { RoomAmenityController } from "@controllers";
import { Router } from "express"; 

let roomAmenityRouter = Router()

roomAmenityRouter.get("/getAll",RoomAmenityController.getAllRoomAmenities)
roomAmenityRouter.get("/get/:id",RoomAmenityController.getRoomAmenityById)
roomAmenityRouter.post("/create",RoomAmenityController.createRoomAmenity)
roomAmenityRouter.patch("/update/:id",RoomAmenityController.updateRoomAmenity)
roomAmenityRouter.delete("/delete/:id",RoomAmenityController.deleteRoomAmenity)


export {roomAmenityRouter}