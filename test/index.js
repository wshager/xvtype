var xs = require("../lib/xvtype");
var n = require("xvnode");
const assert = require("assert");
var a = xs.integer(2);
var b = xs.integer(4);

function assertEq(a,b){
	assert.equal(a.toJS().toString(),b.toJS().toString(),`${a} not equal to ${b}`);
}

var node = n.element("root",xs.seq(n.element("a",n.text("bla")),n.element("b","bli")));

//const Decimal = require("decimal.js");
//console.log(new Decimal(2).dividedBy(new Decimal(3)).times(new Decimal(3)).valueOf());
//console.log(xs.float(xs.float(4.1).op("-",xs.float(0.01))));

assertEq(a.op("+",b),xs.integer(6));
assertEq(a.op("eq",b),xs.boolean(false));
assertEq(a.op("ne",b),xs.boolean(true));
assertEq(a.op("/",b),xs.double(0.5));
assertEq(xs.double("2.1").op("-",xs.decimal("0.01")),xs.double(2.0900000000000003));
assert.throws($ => assert.ifError(a.op("eq",xs.string("bla")),xs.boolean(true)));
assertEq(xs.number("bla"),xs.seq(NaN));
console.log("All tests passed");
