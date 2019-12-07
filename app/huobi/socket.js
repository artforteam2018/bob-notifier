module.exports = class {
  constructor(socket) {
    this.date = Date.now();
    this.Huobi = require('./Huobi');
    this.init();
    this.signals = {};
    this.helper = new (require('../trades'))('huobi', socket, this.signals)
  }

  async init() {
    this.Huobi.on('market_data', data => {
      let trades = data.trade;

      trades.forEach(trade => {
        let amountBtc = trade.amount * trade.price;

        let dir = 'S';
        if (trade.direction === 'buy') {
          dir = 'B';
        }

        let V = this.helper.updateVol(dir, data.symbol, amountBtc);
        let {percent, old, type} = this.helper.updatePrice(dir, data.symbol, trade.price);

        if (!type) return;

        if (this.signals[data.symbol]) {
          this.signals[data.symbol].price = trade.price.toFixed(8);
          this.signals[data.symbol].volume = V[type].toFixed(2);
          this.signals[data.symbol].percent =  ((100 / old * trade.price) - 100).toFixed(2);
          this.helper.updateSignal(data.symbol);
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
          this.helper.signal(type, dir, data.symbol, percent, trade, old, V)
        }
      });
    })
  }

};
