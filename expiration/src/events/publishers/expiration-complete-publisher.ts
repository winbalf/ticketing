import { Publisher, ExpirationCompleteEvent, Subjects } from "@ehbtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;  
}
