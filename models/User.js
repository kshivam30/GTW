const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    gender: {
        type: String,
        required: true,
    },
    win: {
      type: Number,
      required: true,
      default: 0,
    },
    loss: {
      type: Number,
      required: true,
      default: 0,
    },
    bestTime: {
      type: String,
      required: true,
      default: "NOTA"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = { User };