import { Publisher, Subjects, TicketUpdatedEvent } from '@ehbtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
