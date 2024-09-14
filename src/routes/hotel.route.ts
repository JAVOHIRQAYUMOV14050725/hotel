
import { HotelController } from "@controllers";
import { Router } from "express";

let hotelRouter:Router = Router()

hotelRouter.get("/getAll",HotelController.getAllHotels)
hotelRouter.post("/create",HotelController.createHotel)
hotelRouter.patch("/update/:id",HotelController.updateHotel)
hotelRouter.delete("/delete/:id",HotelController.deleteHotel)


export {hotelRouter}