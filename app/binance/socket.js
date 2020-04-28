module.exports = class {
  constructor(socket) {
    this.socket = socket;
    this.date = Date.now();
    this.Binance = require('binance-api-node').default;
    this.init();
    this.signals = {};
    this.helper = new (require('../trades'))('binance', socket, this.signals)
  }

  async init() {
    const client = this.Binance({
    });

    this.symbols = Object.keys(await client.allBookTickers()).filter(curr => curr.match(/.*(BTC)|(USDT)$/g));
    this.helper.sendSymbols('binance', this.symbols);

    client.ws.trades(this.symbols, trade => {
      this.helper.sendTrade('binance', trade);
      let amountBtc = trade.quantity * trade.price;

      let dir = trade.maker ? 'S' : 'B';

      let V = this.helper.updateVol(dir, trade.symbol, amountBtc);
      let {percent, old, type} = this.helper.updatePrice(dir, trade.symbol, trade.price);

      if (!type) return;

      if (this.signals[trade.symbol]) {
        this.signals[trade.symbol].price = (+trade.price).toFixed(8);
        this.signals[trade.symbol].volume = V[type].toFixed(2);
        this.signals[trade.symbol].percent = ((100 / old * trade.price) - 100).toFixed(2);
        this.helper.updateSignal( trade.symbol);
        return;
      }

      let sig = false;

      if (type === 3 && V[type] > 0.1 && percent > 2 && dir === 'B') {
        sig = true;
      }

      if (type === 3 && V[type] > 0.5 && percent < -5 && dir === 'S') {
        sig = true;
      }

      if (type === 10 && V[type] > 0.3 && percent > 2 && dir === 'B') {
        sig = true;
      }

      if (type === 10 && V[type] > 1 && percent < -5 && dir === 'S') {
        sig = true;
      }

      if (sig) {
        this.helper.signal( type, dir, trade.symbol, percent, trade, old, V)
      }
    })
  }
};
