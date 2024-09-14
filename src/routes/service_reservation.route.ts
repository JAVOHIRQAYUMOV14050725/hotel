import { ServiceReservationController } from "@controllers";
import { Router } from "express"; 

let service_reservationRouter = Router()

service_reservationRouter.get("/getAll",ServiceReservationController.getAllServiceReservations)
service_reservationRouter.get("/get/:id",ServiceReservationController.getServiceReservationById)
service_reservationRouter.post("/create",ServiceReservationController.createServiceReservation)
service_reservationRouter.patch("/update/:id",ServiceReservationController.updateServiceReservation)
service_reservationRouter.delete("/delete/:id",ServiceReservationController.deleteServiceReservation)


export {service_reservationRouter}