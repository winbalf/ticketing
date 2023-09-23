import { Publisher, OrderCancelledEvent, Subjects } from "@ehbtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
