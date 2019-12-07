module.exports = class {

  constructor(exchange, socket, signals) {
    this.V = {
      B: {},
      S: {}
    };
    this.VS = {
      B: {},
      S: {}
    };
    this.PR = {
      B: {},
      S: {}
    };
    this.socket = socket;
    this.exchange = exchange;
    this.signals = signals;

  }

  updatePrice(dir, symbol, price) {
    if (!this.PR[dir][symbol]) this.PR[dir][symbol] = [];

    this.PR[dir][symbol] = this.PR[dir][symbol].filter(tr => Date.now() - tr.date < 1000*60*10);

    this.PR[dir][symbol].push({price, date: Date.now()});
    let old3 = this.PR[dir][symbol].sort((a,b) => a.date < b.date ? 1 : -1)
      .find(a => Date.now() - a.date > 1000 * 60 && Date.now() - a.date < 1000 * 60 * 3);
    let old10 = this.PR[dir][symbol].sort((a,b) => a.date < b.date ? 1 : -1)
      .find(a => Date.now() - a.date > 1000 * 60 * 3);

    if (old3) return {type: 3, percent: (100 / old3.price * price) - 100, old: old3.price};
    if (old10) return {type: 10, percent: (100 / old10.price * price) - 100, old: old10.price};
    return 0
  }

  updateVol(dir, symbol, amount) {

    if (!this.V[dir][symbol]) this.V[dir][symbol] = [];
    if (!this.VS[dir][symbol]) this.VS[dir][symbol] = 0;

    this.V[dir][symbol] = this.V[dir][symbol].filter(tr => Date.now() - tr.date < 1000*60*10);

    this.V[dir][symbol].push({amount, date: Date.now()});
    this.VS[dir][symbol] = this.V[dir][symbol].filter(tr => Date.now() - tr.date < 1000*60*3).reduce((data, curr) => data + curr.amount, 0);
    const min13V = this.V[dir][symbol].filter(tr => Date.now() - tr.date < 1000*60*3).reduce((data, curr) => data + curr.amount, 0);

    return {3: min13V, 10: this.VS[dir][symbol]};
  }

  signal(type, dir, symbol, percent, trade, old, V) {
    if (!this.VS['S'][symbol]) this.VS['S'][symbol] = 0;
    if (!this.VS['B'][symbol]) this.VS['B'][symbol] = 0;
    this.signals[symbol] = {
      type,
      dir,
      symbol,
      date_start: Date.now(),
      price_start: (+trade.price).toFixed(8),
      old_start: (+old).toFixed(8),
      percent_start: (+percent).toFixed(2),
      volume_start: V[type].toFixed(2),
      price: (+trade.price).toFixed(8),
      percent: (+percent).toFixed(2),
      volumeB: this.VS['B'][symbol].toFixed(2),
      volumeS: this.VS['S'][symbol].toFixed(2),
      hide: false,
    };
    setTimeout(() => {
      this.socket.emit('remove_signal', symbol);
      delete this.signals[symbol]
    }, 1000*60*5);
    setTimeout(() => {
      this.signals[symbol].hide = true;
      this.socket.emit('update_signal', JSON.stringify({exchange: this.exchange, ...this.signals[symbol]}))
    }, 1000*60);
    this.socket.emit('add_signal', JSON.stringify({exchange: this.exchange, ...this.signals[symbol]}))
  }

  updateSignal(symbol) {
    this.signals[symbol].volumeB = this.VS['B'][symbol].toFixed(2);
    this.signals[symbol].volumeS = this.VS['S'][symbol].toFixed(2);
    this.socket.emit('update_signal', JSON.stringify({exchange: this.exchange, ...this.signals[symbol]}))
  }

  sendTrade(ex, trade) {
    this.socket.emit(`${ex}_trade`, trade)
  }

  sendSymbols(ex, symbols) {
    this.socket.emit(`${ex}_symbols`, symbols)
  }
}
