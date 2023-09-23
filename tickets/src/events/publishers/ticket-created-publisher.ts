import { Publisher, Subjects, TicketCreatedEvent } from '@ehbtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}

// new TicketCreatedPublisher(client).publish(ticket);