import { Message } from 'node-nats-streaming';
import mongoose, { mongo } from "mongoose";
import { TicketUpdatedEvent } from "@ehbtickets/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  // create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  // create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'New Concert',
    price: 111,
    userId: 'asfsdwqd'
  }
  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  // return all of this stuff
  return { msg, data, ticket, listener };
};

it('finds, updates, and saves a ticket', async () => {
  const { msg, data, ticket, listener  } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created!
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);

});

it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call act if the event has a skipped version number', async () => {
  const { msg, data, listener, ticket } = await setup();

  data.version = 10;

  try{
    await listener.onMessage(data, msg);
  } catch (err) {

  }

  expect(msg.ack).not.toHaveBeenCalled();
});