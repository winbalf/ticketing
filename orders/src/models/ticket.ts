import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order";

// An interface that describe the properties
// that are required to create a new Ticket
interface TicketAttrs {
  id:     string;
  title:  string;
  price:  number;  
}

// An interface that describe the properties 
// that a Ticket Document has
export interface TicketDoc extends mongoose.Document {  
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

// An interface that describes the properties
// that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true, 
    min: 0   
  }  
}, {
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
    }

  }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.findByEvent = (event: { id: string, version: number}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  });
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

ticketSchema.methods.isReserved = async function() {
  // this ==- the ticket document that we just called 'isReserved' on

  // Run query to look at all orders. Find an order where the ticket
  // is the ticke twe just found *and* the orders status is *not* cancelled.
  // If we find an order from that means the ticket *is* reserved
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ],
    },
  });

  return !!existingOrder;
}


const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
