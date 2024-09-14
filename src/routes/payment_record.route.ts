import { PaymentRecordController } from "@controllers";
import { Router } from "express"; 

let paymentRecordRouter = Router()

paymentRecordRouter.get("/getAll",PaymentRecordController.getAllPaymentRecords)
paymentRecordRouter.get("/get/:id",PaymentRecordController.getPaymentRecordById)
paymentRecordRouter.post("/create",PaymentRecordController.createPaymentRecord)
paymentRecordRouter.patch("/update/:id",PaymentRecordController.updatePaymentRecord)
paymentRecordRouter.delete("/delete/:id",PaymentRecordController.deletePaymentRecord)


export {paymentRecordRouter}