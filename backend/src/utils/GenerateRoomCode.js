// Generates the short uppercase room code users share to invite classmates.
const generateRoomCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default generateRoomCode;
