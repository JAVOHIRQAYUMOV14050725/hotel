import { RoomController } from "@controllers";
import { Router } from "express"; 

let roomRouter = Router()

roomRouter.get("/getAll",RoomController.getAllRooms)
roomRouter.post("/create",RoomController.createRoom)
roomRouter.patch("/update/:id",RoomController.updateRoom)
roomRouter.delete("/delete/:id",RoomController.deleteRoom)


export {roomRouter}