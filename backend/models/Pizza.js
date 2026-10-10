import mongoose from "mongoose";

const pizzaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    isVegetarian: { type: Boolean, required: true },
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Pizza", pizzaSchema);
