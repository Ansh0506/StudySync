import mongoose from "mongoose";

// Stores uploaded PDF metadata; the actual file is saved on disk.
const pdfSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    deletedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
  },
  { timestamps: true }
);

const Pdf = mongoose.model("Pdf", pdfSchema);
export default Pdf;
