module.exports = class Huobi{
  constructor(socket) {
    this.socket = new (require('./socket.js'))(socket);
  }
};
