"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports._isNode = exports.fromJS = exports.attribute = exports.element = exports.logic = exports.operatorMap = undefined;
exports.item = item;
exports.decimal = decimal;
exports.integer = integer;
exports.string = string;
exports.number = number;
exports.float = float;
exports.double = double;
exports.boolean = boolean;
exports.cast = cast;
exports.to = to;
exports.indexOf = indexOf;
exports.call = call;
exports._boolean = _boolean;
exports.data = data;
exports.instanceOf = instanceOf;
exports.minus = minus;
exports.text = text;
var _xvseq = require("xvseq");

Object.keys(_xvseq).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function () {
            return _xvseq[key];
        }
    });
});

var _immutable = require("immutable");

var _decimal = require("decimal.js");

var _decimal2 = _interopRequireDefault(_decimal);

var _bignumber = require("bignumber.js");

var _bignumber2 = _interopRequireDefault(_bignumber);

var _xvnode = require("xvnode");
exports.QName = function(uri,name) {
    return new _xvnode.QName(uri,name);
};
var xvnode = _interopRequireWildcard(_xvnode);

var _xverr = require("xverr");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const _isNode = xvnode._isNode;

// TODO complete math (e.g. type checks for idiv and friends)

// one big pile
const operatorMap = exports.operatorMap = {
    "+": "plus",
    "-": "minus",
    "*": "times",
    "div": "dividedBy",
    "/": "dividedBy",
    "idiv": "dividedBy",
    ">": "greaterThan",
    "<": "lessThan",
    ">=": "greaterThanEquals",
    "<=": "lessThanEquals",
    "=": "equals",
    "!=": "equals",
    "eq": "equals",
    "ne": "equals",
    "gt": "greaterThan",
    "lt": "lessThan",
    "ge": "greaterThanEquals",
    "le": "lessThanEquals",
    "&&": "and",
    "||": "or",
    "!": "not"
};

class UntypedAtomic extends String {
    constructor(a) {
        super(a);
        this._value = a;
    }
    cast(other) {
        //If the atomic value is an instance of xdt:untypedAtomic
        //and the other is an instance of a numeric type,
        //then the xdt:untypedAtomic value is cast to the type xs:double.

        //If the atomic value is an instance of xdt:untypedAtomic
        //and the other is an instance of xdt:untypedAtomic or xs:string,
        //then the xdt:untypedAtomic value is cast to the type xs:string.

        //If the atomic value is an instance of xdt:untypedAtomic
        //and the other is not an instance of xs:string, xdt:untypedAtomic, or any numeric type,
        //then the xdt:untypedAtomic value is cast to the dynamic type of the other value.

        // NO-OP, moved elsewhere
    }
    toString() {
        return this._value.toString();
    }
    valueOf() {
        return this._value.valueOf();
    }
}

class Integer extends _decimal2.default {
    constructor(a) {
        super(a);
        this.floor();
        this.constructor = Integer;
    }
}

class Float extends Number {
    constructor(a) {
        var temp = new Float32Array(1);
        temp[0] = +a;
        super(temp[0]);
        this._f = temp[0];
        this._d = a;
    }
    toString() {
        var temp = new Float64Array(1);
        temp[0] = +this._d;
        return temp[0].toString();
    }
    valueOf() {
        return this._f;
    }
}

const compProto = {
    equals(other) {
        return this.valueOf() === other.valueOf();
    },
    greaterThan(other) {
        return this.valueOf() > other.valueOf();
    },
    lessThan(other) {
        return this.valueOf() < other.valueOf();
    },
    greaterThanEquals(other) {
        return this.valueOf() >= other.valueOf();
    },
    lessThanEquals(other) {
        return this.valueOf() <= other.valueOf();
    }
};

const opProto = {
    plus(other) {
        return this + other;
    },
    minus(other) {
        return this - other;
    },
    times(other) {
        return this * other;
    },
    dividedBy(other) {
        return this / other;
    }
};

// mixin comparators
Object.assign(String.prototype, compProto);

Object.assign(Float.prototype, compProto, opProto);

Object.assign(Number.prototype, compProto, opProto);

Object.assign(Boolean.prototype, compProto);

// everything is at least an item
function item($a) {
    return (0, _xvseq.seq)($a);
}

// TODO create from Type classes
function decimal($a) {
    // type test
    if ($a === undefined) return item(new _decimal2.default(0));
    return cast($a, _decimal2.default);
}

function integer($a) {
    return cast($a, Integer);
}

function string($a) {
    // type test
    if ($a === undefined) return item(String(""));
    if ((0, _xvseq._isSeq)($a) || _isNode($a)) {
        $a = data($a);
    }
    //if($a === "") console.log(cast($a, String) === undefined);
    return cast($a, String);
}

function number($a) {
    // type test
    if ($a === undefined) return item(Number(0));
    return cast($a, Number);
}

function float($a) {
    // type test
    if ($a === undefined) return item(new Float(0));
    return cast($a, Float);
}

function double($a) {
    // type test
    if ($a === undefined) return item(Number(0));
    return cast($a, Number);
}

function boolean($a) {
    // type test
    if ($a === undefined) return item(Boolean());
    try {
        return (0, _xvseq.seq)(_boolean(item($a)));
    } catch (e) {
        return e;
    }
}

function cast($a, $b) {
    /* ALT
    var a = _first($a);
    if(a === undefined) return $a;
    return seq(_cast(a,_first($b)));
    */
    return item($a).op(_cast, $b);
}

function _convert(a, type) {
    if (a !== undefined && a.constructor !== type) {
        return _cast(a, type);
    }
    return a;
}

function _cast(a, b) {
    if(a.constructor !== b) a = new b(a.toString());
    return a;
    /*var n = b.name;
    var c = _cast.cache[n];
    if (!c[a]) {
        c[a] = new b(a);
    }
    return c[a];*/
}
/*
_cast.cache = {};
_cast.cache.Decimal = {};
_cast.cache.Integer = {};
_cast.cache.String = {};
_cast.cache.Number = {};
_cast.cache.Float = {};
_cast.cache.Boolean = {};
_cast.cache.UntypedAtomic = {};
*/
function to($a, $b) {
    let a = (0, _xvseq._first)($a);
    let b = (0, _xvseq._first)($b);
    a = a !== undefined ? +a.valueOf() : 0;
    b = b !== undefined ? +b.valueOf() : 0;
    return new _xvseq.Seq((0, _immutable.Range)(a, b + 1).map(_ => integer(_)).toArray());
}

function indexOf($a, $b) {
    $a = item($a);
    $b = item($b);
    return $a.findKeys(function (i) {
        return _boolean($b.op("equals", i));
    });
}

function call(...a) {
    let $f = item(a[0]);
    let args = a.slice(1);
    return $f.map(function (f) {
        if (isList(f)) {
            return f.get((0, _xvseq._first)(a[1]) - 1);
        } else if (isMap(f)) {
            var key = (0, _xvseq._first)(a[1]);
            return f.get(key);
        } else {
            return f.apply(this, args);
        }
    });
}

function numbertest(a) {
    var c = a.constructor;
    if (c == String || c == Boolean) return;
    return true;
}

function _op(op, invert, a, b) {
    var ret;
    if (a !== undefined) {
        if (typeof a[op] == "function") {
            if (!numbertest(a)) return (0, _xverr.error)("err:XPTY0004", a.constructor.name + "(" + a + ") can not be operand for " + op);
            if (!numbertest(b)) return (0, _xverr.error)("err:XPTY0004", b.constructor.name + "(" + b + ") can not be operand for " + op);
            var ab = _promote(a, b);
            if (ab instanceof Error) {
                return ab;
            }
            a = ab[0];
            b = ab[1];
            ret = a[op](b);
        } else {
            throw new Error("Operator " + op + " not implemented");
        }
    }
    return invert ? !ret : ret;
}

function _comp(op, invert, a, b) {
    var ret;
    if (a !== undefined) {
        if (typeof a[op] == "function") {
            var ab = _promote(a, b);
            if (ab instanceof Error) {
                return ab;
            }
            a = ab[0];
            b = ab[1];
            ret = a[op](b);
        } else {
            throw new Error("Operator " + op + " not implemented for " + a + " (" + a.constructor.name + ")");
        }
    }
    //console.log(a,b,op,ret);

    return invert ? !ret : ret;
}

function _promote(a, b) {
    // TODO FIXME use JS type casting! 1 == "1"
    //If each operand is an instance of one of the types xs:string or xs:anyURI, then both operands are cast to type xs:string.
    //If each operand is an instance of one of the types xs:decimal or xs:float, then both operands are cast to type xs:float.
    //If each operand is an instance of one of the types xs:decimal, xs:float, or xs:double, then both operands are cast to type xs:double.
    var c = a.constructor,
        d = b.constructor;
    if (c == Number || d == Number) {
        if (c == Integer || c == _decimal2.default || c == Float || c == UntypedAtomic) {
            a = +a.toString();
            c = Number;
        }
        if (d == Integer || d == _decimal2.default || d == Float || d == UntypedAtomic) {
            b = +b.toString();
            d = Number;
        }
    }
    if (c == Integer || d == Integer) {
        if (c == _decimal2.default || c == UntypedAtomic) {
            a = c == UntypedAtomic ? new Integer(a.toString()) : a;
            c = Integer;
        }
        if (d == _decimal2.default || d == UntypedAtomic) {
            b = d == UntypedAtomic ? new Integer(b.toString()) : b;
            d = Integer;
        }
    }
    if (c == String || d == String) {
        if (c == UntypedAtomic) {
            a = a.toString();
            c = String;
        }
        if (d == UntypedAtomic) {
            b = a.toString();
            d = String;
        }
    }
    if (c != d) {
        //throw new Error("Cannot compare operands: " + c.name + " and " + d.name);
        return (0, _xverr.error)("err:XPTY0004", "Cannot compare operands: " + c.name + " and " + d.name);
    }
    return [a, b];
}

var NOT_SET = {};
function opFactory(iterable, opfn, other) {
    var seq = Object.create(_xvseq.Seq.prototype);
    seq.size = iterable.size;
    var otherIsSeq = (0, _xvseq._isSeq)(other);
    seq.has = key => iterable.has(key);
    seq.get = (key, notSetValue) => {
        var v = (0, _xvseq._first)(iterable.get(key, NOT_SET));
        return otherIsSeq ? other.reduce(function (pre, cur) {
            return pre || opfn(v, cur);
        }, false) : opfn(v, other);
    };
    seq.__iterateUncached = function (fn, reverse) {
        var seq = this,
            _i = 0,
            stopped = false,
            ret;
        return iterable.__iterate(function (v, k, c) {
            ret = otherIsSeq ? other.reduce(function (pre, cur) {
                return pre || opfn(v, cur);
            }, false) : opfn(v, other);
            stopped = fn(ret, _i++, seq) === false;
            return !stopped;
        });
    };
    return seq;
}

function strictOp(iterable, opfn, other, general) {
    var otherIsSeq = (0, _xvseq._isSeq)(other);
    if (general) {
        return (0, _xvseq.seq)(iterable.reduce(function (acc, v) {
            return acc || (otherIsSeq ? other.reduce(function (pre, cur) {
                return pre || opfn(v, cur);
            }, false) : opfn(v, other));
        }, false));
    } else if(iterable.size == 1){
        let b = otherIsSeq ? other.first() : other;
        return _xvseq.seq(opfn(iterable.first(),b));
    } else {
        return iterable.map(function (v) {
            return otherIsSeq ? other.reduce(function (pre, cur) {
                return pre || opfn(v, cur);
            }, false) : opfn(v, other);
        });
    }
}

// TODO without eval!
function _isNodeSeq($a) {
    return _isNode((0, _xvseq._first)($a));
}

// FIXME the unmarshalling of seqs is probably more efficient than anything else...
// EXCEPT a filter + a lazy foldRight maybe
function _boolean($a) {
    if ((0, _xvseq._isEmpty)($a)) return false;
    var a = (0, _xvseq._first)($a);
    if ($a.size > 1 && !_isNode(a)) {
        throw (0, _xverr.error)("err:FORG0006");
    }
    //if(_isNode(a)) console.log(a.toString())
    return !!a.valueOf();
}

const logic = exports.logic = {
    and: function and($a, $b) {
        return _boolean($a) && _boolean($b);
    },
    or: function or($a, $b) {
        return _boolean($a) || _boolean($b);
    },
    not: function not($a) {
        return !(0, _xvseq._first)($a);
    }
};

const opinv = {
    ne: true,
    '!=': true
};
_xvseq.Seq.prototype.op = function (operator, other) {
    var invert = false,
        comp = false,
        general = false;
    var $a = this,
        $b = other,
        opfn;
    if (typeof operator == "string") {
        invert = opinv[operator];
        let operatorName = operator in operatorMap ? operatorMap[operator] : operator;
        if (logic[operatorName]) {
            return logic[operatorName](this, other);
        } else {
            comp = compProto.hasOwnProperty(operatorName);
            general = comp && !compProto.hasOwnProperty(operator);
            opfn = comp ? _comp.bind(null, operatorName, invert) : _op.bind(null, operatorName, invert);
        }
        if (comp) {
            $a = data($a);
            //if(_isNodeSeq(this)) console.log("nodeset",operator,$a.first())
            $b = data($b);
        }
        if (!general) {
            if ((0, _xvseq._isEmpty)($a)) return $a;
            if ((0, _xvseq._isEmpty)($b)) return $b;
            // FIXME NOT! allow arithmetic on sequences (why not?)...
            // FIXME reduce when comp result is seq of booleans
            if ($b.size > 1) return (0, _xverr.error)("err:XPTY0004");
        }
    } else if (typeof operator == "function") {
        opfn = operator;
    } else {
        return (0, _xverr.error)("xxx", "No such operator");
    }
    return $a._isStrict ? strictOp($a, opfn, $b, general) : opFactory($a, opfn, $b);
};

_xvseq.Seq.prototype.getTextNodes = function () {
    if ((0, _xvseq._isSeq)(this)) return this.map(_ => _.getTextNodes());
    if (!_isNode(this) || this._type != 1) return (0, _xvseq.seq)();
    return this.filter(function (_) {
        if (!_isNode(_)) {
            console.log(_);
            (0, _xverr.error)("err:XPTY0004", "Sequence cannot be converted into a node set.");
        }
        return _._type === 3 && !!_.value().toString();
    });
};

_xvseq.Seq.prototype.data = function () {
    return dataImpl(this);
};

function data($a) {
    return dataImpl($a);
}

function dataImpl(node, fltr = false) {
    var ret;
    if ((0, _xvseq._isSeq)(node)) {
        if(node.isEmpty()) return node;
        //ret = node.map(_ => dataImpl(_, fltr)).filter(_ => _ !== undefined);
        var a = [];
        node.forEach(function(_){
            var r = dataImpl(_, fltr);
            if(r !== undefined) a.push(r);
        });
        if(!a.length){
            ret = _xvseq.seq(new UntypedAtomic(""));
        } else {
            ret = _xvseq.toSeq(a);
        }
        return ret;
    }
    if (!_isNode(node) || node.isEmpty()) return node;
    //if(node._string) {
    //    return node._string;
    //}
    var type = node._type;
    if (fltr && fltr === type) return undefined;
    if (type === 1) {
        var tn = node.getTextNodes();
        ret = node.map(_ => dataImpl(_, 2)).filter(_ => _ !== undefined);
    } else {
        ret = node.value();
        if (typeof ret == "string") {
            ret = !ret ? undefined : _cast(ret, UntypedAtomic);
        }
    }
    return ret;
}

function instanceOf($a, $b) {
    let a = (0, _xvseq._first)($a);
    let b = (0, _xvseq._first)($b);
    var t = a === undefined || b === undefined ? false : a.constructor === b.constructor;
    return (0, _xvseq.seq)(t);
}

// TODO rename to neg, add to ops (b undefined)
function minus($a) {
    var a = (0, _xvseq._first)($a);
    if (typeof a.neg == "function") return (0, _xvseq.seq)(a.neg());
    return (0, _xvseq.seq)(-a);
}

function text($a) {
    let a = (0, _xvseq._first)($a);
    // this is for type testing
    if (a === undefined) return xvnode.text("");
    if (_isNode(a)) return $a.getTextNodes();
    return xvnode.text($a);
}

// TODO export element + attribute and friends as functions with type tests
const element = exports.element = xvnode.element;
const attribute = exports.attribute = xvnode.attribute;

_xvseq.Seq.prototype.deepEqual = _xvseq.Seq.prototype.equals;

exports.fromJS = _immutable.fromJS;
exports._isNode = _isNode;
