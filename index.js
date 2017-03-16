"use-strict";

function ExchangeLedger(opts){

  // 🚦 validate opts
  var isValid =
    opts!==undefined &&
    opts.balance!==undefined &&
    Object.keys(opts.balance).length>0;

  if(!isValid) {
    throw new Error("balance was not specificed for new ExchangeLedger")
  }

  // 🐑 clone args
  opts = JSON.parse(JSON.stringify(opts))

  this.balance = opts.balance
  this.trades = opts.trades || []
}

ExchangeLedger.prototype.trade = function(opts) {

  // 🚦 validate opts
  var isValid =
    opts!==undefined &&
    opts.from!==undefined &&
    opts.to!==undefined &&
    opts.amount!==undefined;

  if(!isValid) {
    throw new Error("trade args malformed")
  }
  // 🐑 clone args
  opts = JSON.parse(JSON.stringify(opts))

  // if 'to' balance does not exist yet, set to 0
  if(this.balance[opts.from]===undefined) this.balance[opts.from] = 0

  // update 'from' balance
  this.balance[opts.from] -= opts.amount

  // if 'to' balance does not exist yet, set to 0
  if(this.balance[opts.to]===undefined) this.balance[opts.to] = 0

  // default fee to 0
  if(opts.fee===undefined) opts.fee = 0

  // ⚠️ default rate to 1
  if(opts.rate===undefined) opts.rate = 1

  // update 'to' balance, applying optional fee
  this.balance[opts.to] += opts.amount * opts.rate * (1.0 - opts.fee)

  this.trades.push(opts)

}

ExchangeLedger.prototype.lastTrade = function() {
  return this.trades[this.trades.length-1]
}

ExchangeLedger.prototype.liquidateTo = function(to,opts) {

  // 🐑 clone args
  opts = JSON.parse(JSON.stringify(opts))

  // 👓 usage -> ledger.liquidateTo('usd', {mxn: {rate:.4, fee:.25}, jpy:{rate:.1, fee:.1}})
  for(var from in opts) {
    var amount = this.balance[from];

    // trade entire balance of "from" currency
    var t = Object.assign(opts[from],{from,to,amount})
    this.trade(t)
  }
}

ExchangeLedger.prototype.getLiquidatedTo = function(to,opts) {

  // 🐑 clone ledger balance to work with, ignoring trades
  var test = new ExchangeLedger({balance:this.balance});

  test.liquidateTo(to,opts) // reuse method
  return test.balance[to];
}

module.exports = ExchangeLedger;
