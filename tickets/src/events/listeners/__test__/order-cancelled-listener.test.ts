import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from "@ehbtickets/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  // Create and save a ticket
  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: 'fasda',    
  });

  ticket.set({ orderId });

  await ticket.save();

  // Create the fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
        id: ticket.id
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, msg, orderId };
}

it('updates the ticket, publishes an event and acks the message', async () => {
  const { listener, ticket, data, msg, orderId } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();

  expect(msg.ack).toHaveBeenCalled();

  expect(natsWrapper.client.publish).toHaveBeenCalled();
})