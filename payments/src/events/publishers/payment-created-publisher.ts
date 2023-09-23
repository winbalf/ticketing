import { Subjects, Publisher, PaymentCreatedEvent } from "@ehbtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}