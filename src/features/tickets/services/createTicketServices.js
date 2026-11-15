import Queue from "../../queues/model/queueModel.js";
import Ticket from "../model/ticketModel.js";

export const createTicketServices = async (ticketData) => {
    const data = ticketData.data;
    console.log(data);



    // UPDATE LAST TICKET NUMBER
    const updateQueue = await Queue.findOneAndUpdate(
        //id
        { _id: data.queueId },
        // increment
        { $inc: { lastTicketNumber: 1 } },
        { new: true }
    )

    //IF NOT FOUND QUEUE THROW ERROR
    if (!updateQueue) {
        throw new Error("QUEUE_NOT_FOUND");
    }
    const ticketNumber = updateQueue.lastTicketNumber;

    // SEND TICKET DATA
    const ticket = await Ticket.create({
        queueId: data.queueId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        status: data.status,
        scheduledAt: data.scheduledAt,
        dateString: data.dateString,
        ticketNumber: ticketNumber,
        tenantId: ticketData.tenantId
    })
    return ticket

}