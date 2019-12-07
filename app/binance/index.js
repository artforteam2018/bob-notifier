module.exports = class Binance{
  constructor(socket) {
    this.socket = new (require('./socket.js'))(socket);
  }
};
