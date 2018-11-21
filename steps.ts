const {Given, When, Then} = require('cucumber');
const assert = require('assert');

type Amount = String;
type DateWithoutTime = Date;

class Account {
    deposit(amount: Amount) {
    }

    withdraw(amount: Amount) {
    }

    printStatement() {
        return (
            '24.12.2015   +500      500' + '\n' +
            '23.8.2016    -100      400'
        );
    }
};

let account: Account;
let statement;
Given('I have opened an account', function () {
    account = new Account();
});

Given('I have deposited {int} EUR on {string}', function (amountDeposited, onDate) {
    account.deposit(amountDeposited);
});

Given('I have withdrawn {int} EUR on {string}', function (amountWithdrawn, onDate) {
    account.withdraw(amountWithdrawn);
});

When('I view my statement', function () {
    statement = account.printStatement();
});

Then('the statement should read:', function (expectedStatement) {
    assert.equal(statement, expectedStatement);
});
