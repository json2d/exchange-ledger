# ExchangeLedger
a class for creating ledgers to manage exchange trading of currencies and other arbitrary exchangeable entities

## :star: Getting Started
Install as a dependency:
```
$ npm install exchange-ledger
```

Initialize a ledger with a starting balance:
```javascript
var ExchangeLedger = require('exchange-ledger')

var ledger = new ExchangeLedger({
    balance: {
      'usd': 100,
      'cny': 100
    }
})

```
---
### :money_with_wings: Trading
Commit a trade from one currency to another, specifying the conversion rate and the amount to be converted:
```javascript
ledger.trade({
  from: 'usd',
  to: 'cny',
  rate: 7,
  amount: 50 // trading 50 USD for 350 CNY
})
```

_(Optional)_ Apply a percent-based transaction fee to the trade, taken out of the currency being traded to:
```javascript
ledger.trade({
  from: 'usd',
  to: 'cny',
  fee: .25, // woah, 25% is alot!
  rate: 7,
  amount: 50
})
```

Trades can safely be made to currencies not yet specified on the balance:
```javascript
ledger.trade({
  from: 'cny',
  to: 'jpy', // an entry be auto generated on the balance
  rate: 16.4,
  amount: 100
})
```

The trade history will be stored on the ledger as an array:
```javascript
ledger.trades
// [ { from: 'usd', to: 'cny', rate: 7, amount: 50},
// { from: 'cny', to: 'jpy', rate: 16.4, amount: 100 } ]

```

There's also easy access to the last trade committed:
```javascript
ledger.lastTrade()
// { from: 'cny', to: 'jpy', rate: 16.4, amount: 100 }

```
---
### :book: Balance and Liquidation
Check what the current balance for all specified currencies:
```javascript
ledger.balance
// { 'usd': 0, 'cny': 512.5, 'jpy': 1640 }

ledger.balance.usd
// 0
```

Use `getLiquidatedTo` to check the liquidated value of the balance for a specific currency, by specifying the associated conversion rate(s) _(and optionally the transaction fee(s))_:  
```javascript
var currentUSD = ledger.getLiquidatedTo('usd', {
    'cny': {rate: 1},
    'jpy': {rate: 1, fee: .5}
})
// currentUSD == 1332.5
// NOTE: This command will not affect the ledger.
```

Similarly, use `liquidateTo` to actually convert the balance on the ledger to a specific currency:
```javascript
ledger.liquidateTo('usd', {
    'cny': {rate: 1},
    'jpy': {rate: 1, fee: .5}
})

var currentUSD = ledger.balance.usd
// currentUSD == 1332.5
```

### Testing
`mocha` is used for unit-testing in `test.js`.  To run these test, simply:
```
$ npm test
```
