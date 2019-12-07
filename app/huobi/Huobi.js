module.exports = new class extends EventEmitter{
  constructor() {
    super();
    this.init();
    this.symbols = [];
    this.wss = '';
  }

  async init() {
    this.symbols = await this.getSymbols();
    this.marketData();
  }

  async getSymbols() {
    let res = await axios.get('https://api.huobi.pro/market/tickers');
    let data = getVal(res, 'data.data');
    if (!data) return;

    data = data.filter(curr => curr.symbol.match(/.*btc$/g));
    return data;
  }

  marketData() {
    this.wss = new WebSocket('wss://api.huobi.pro/ws');

    this.wss.on('open', () => {
      this.symbols.forEach(symbol => {
        this.wss.send(this.wstr({
          "sub": `market.${symbol.symbol}.trade.detail`,
          "id": Math.random()
        }));
      });
    });

    this.wss.on('message', (data) => {
      this.parseData(data);
    });

    this.wss.on('close', () => {
      console.log('disconnect')
      this.marketData();
    })
  }

  parseData(data) {
    zlib.unzip(data, (err, buffer) => {
      if (!err) {
        let data = JSON.parse(buffer.toString());
        if (data.ping) {
          this.wss.send(this.wstr({'pong': data.ping}));
        } else if (data.ch) {
          this.emit('market_data', {symbol: data.ch.match(/market\.(.*?)\./)[1], trade: data.tick.data})
        }
      }
    });
  }

  wstr(data) {
    return JSON.stringify(data);
  }
};
