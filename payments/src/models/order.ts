import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { OrderStatus } from "@ehbtickets/common";


export { OrderStatus };

// An interface that describe the properties
// that are required to create a new Order
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;  
}

// An interface that describe the properties 
// that a Order Document has
interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// An interface that describes the properties
// that a Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },  
}, {
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
      // delete ret.__v;
    }

  }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status
  });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
