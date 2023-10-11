const mongoose = require("mongoose");

const { Schema } = mongoose;
const { ObjectId } = Schema;
// const { Types: { ObjectId } } = Schema;

const chatSchema = new Schema({
  room: {
    type: ObjectId, // 방의 id
    required: true,
    ref: "Room", // roomSchema랑 연결.
  },
  user: {
    type: String,
    required: true,
  },
  chat: String,
  gif: String, // 사진
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Chat", chatSchema);
