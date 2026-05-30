import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // The original creator (permanent master) - never changes
    master: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Temporary master when the original master leaves
    tempMaster: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    activePdf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pdf",
      default: null
    }
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

export default Room;
