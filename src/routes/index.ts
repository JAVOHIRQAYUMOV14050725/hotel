
import { Router } from "express";
import { hotelRouter } from "./hotel.route";
import { roomRouter } from "./room.route";
import { reservationRouter } from "./reservation.route";
import { userRouter } from "./user.route";
import { serviceRouter } from "./service.route";
import { reviewRouter } from "./review.route";

import { service_reservationRouter } from "./service_reservation.route";
import { paymentRecordRouter } from "./payment_record.route";
import { promotionRouter } from "./promotion.route";
import { roomAmenityRouter } from "./room_amenity.route";

let router:Router = Router()

router.use("/hotels",hotelRouter)
router.use("/rooms",roomRouter)
router.use("/reviews",reviewRouter)
router.use("/users",userRouter)
router.use("/room_amenity",roomAmenityRouter)
router.use("/promotions",promotionRouter)
router.use("/payment_record",paymentRecordRouter)
router.use("/services",serviceRouter)
router.use("/reservations",reservationRouter)
router.use("/service_reservation",service_reservationRouter)

export {router}