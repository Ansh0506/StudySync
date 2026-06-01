import mongoose from "mongoose";

// Stores the collaborative room, membership, ownership, and selected PDF state.
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
    // Permanent owner who can delete the room globally.
    master: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    // Temporary owner used if the permanent owner leaves but the room continues.
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
