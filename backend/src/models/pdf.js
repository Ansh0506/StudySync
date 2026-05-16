import mongoose from "mongoose";

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
    }
  },
  { timestamps: true }
);

const Pdf = mongoose.model("Pdf", pdfSchema);
export default Pdf;
