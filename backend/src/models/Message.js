import mongoose from "mongoose";

// Stores persisted room chat messages; realtime delivery happens through sockets.
const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    senderName: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
