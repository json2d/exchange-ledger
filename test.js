var ExchangeLedger = require('./index.js');

var balance = {
  usd: 90,
  mxn: 0,
  //jpy: undefined
}

var trades = [
  {
    from:"mxn",
    to:"usd",
    rate: .9,
    amount: 100
  }
]

var ledger = new ExchangeLedger({balance,trades})

var assert = require('assert');
describe('ExchangeLedger', function() {

  describe('#constructor()', function() {
    it('should deep clone args', function() {
      assert.notEqual(ledger.balance, balance)
      assert.notEqual(ledger.trades[0], trades[0])
    });

    it('should throw an error when called with malformed args', function() {
      assert.throws(() => new ExchangeLedger(), Error)
      assert.throws(() => new ExchangeLedger({balance:{}}), Error)
      assert.throws(() => new ExchangeLedger({trades:[]}), Error)
    });
  });

  describe('#trade()', function() {

    var USD_MXN = {
      from:"usd",
      to:"mxn",
      rate: 20, // how much 1 usd is in mxn, or usd/cow
      amount: 50 // amount of usd exchanged
    }


    it('should deep clone args', function() {
      // trade some usd for mxn
      ledger.trade(USD_MXN);

      assert.notEqual(ledger.lastTrade(), USD_MXN)
    });


    it('should throw an error when called with malformed args', function() {
      assert.throws(() => ledger.trade({from:'usd'}), Error)
      assert.throws(() => ledger.trade({to:'usd'}), Error)
      assert.throws(() => ledger.trade({from:'usd',to:'mxn'}), Error)
      assert.throws(() => ledger.trade({from:'usd',amount:10}), Error)
    });

    it('should update balance of "from" currency', function() {
      assert.equal(ledger.balance.usd,40);
    });

    it('should update balance of "to" currency with default fee of 0', function() {
      assert.equal(ledger.balance.mxn,1000);
    });

    it('should update balance of "to" currency with specified fee', function() {

      var MXN_USD = {
        from:"mxn",
        to:"usd",
        fee: .25,
        rate: .4,
        amount: 500
      }

      // trade back some mxn for usd
      ledger.trade(MXN_USD);

      assert.equal(ledger.balance.usd,190);
    });

    it('should add currency to balance if it has not yet been defined', function() {

      var USD_JPY = {
        from:"usd",
        to:"jpy",
        fee: .1,
        rate: 120,
        amount: 50
      }

      // trade some usd for jpy
      ledger.trade(USD_JPY);

      assert.equal(ledger.balance.jpy,5400);

    });

    it('should store all trades in an array', function() {
      assert.equal(ledger.trades.length,4);
    });


  });


  describe('#liquidityTo()', function() {
    it('should return liquid value of "to" currency without actually changing the ledger', function() {
    // get liquidity for specific currency, at specified exchange rates and fees
      var usdCurrent = ledger.balance.usd
      var usdLiquity = ledger.getLiquidatedTo('usd', {mxn: {rate:.5}, jpy:{rate:1, fee: 0}})
      assert.equal(usdLiquity,5790);
      assert.equal(usdCurrent,ledger.balance.usd);

    });
  });

  describe('#liquidateTo()', function() {
    var opts = {mxn: {rate:.5}, jpy:{rate:1, fee: 0}}

    it('should convert entire balance into the "to" currency', function() {

      var usdLiquity = ledger.liquidateTo('usd', opts)
      assert.equal(ledger.balance.usd,5790);
      assert.equal(ledger.balance.mxn,0);
      assert.equal(ledger.balance.jpy,0);

    });

    it('should deep clone args, so args is not muted', function() {
      var a = ledger.lastTrade(), b = opts['jpy']
      assert.notEqual(a, b)
      assert.strictEqual(b.amount,undefined)
    });

  });


});




// list all trades made
