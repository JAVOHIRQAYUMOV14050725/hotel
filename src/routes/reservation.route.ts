import { reservation } from '@prisma/client';


import { ReservationController } from "@controllers";
import { Router } from "express";

let reservationRouter:Router = Router()

reservationRouter.get("/getAll",ReservationController.getAllReservations)
reservationRouter.post("/create",ReservationController.createReservation)
reservationRouter.patch("/update/:id",ReservationController.updateReservation)
reservationRouter.delete("/delete/:id",ReservationController.deleteReservation)


export {reservationRouter}