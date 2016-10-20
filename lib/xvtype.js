"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.array = exports.entry = exports.map = exports._isNode = exports.fromJS = exports.operatorMap = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
exports._isNodeSeq = _isNodeSeq;
exports._boolean = _boolean;
exports.data = data;

var _xvseq = require("xvseq");

Object.keys(_xvseq).forEach(function (key) {
    if (key === "default" || key === "__esModule") return;
    Object.defineProperty(exports, key, {
        enumerable: true,
        get: function get() {
            return _xvseq[key];
        }
    });
});

var _xvmap = require("xvmap");

Object.defineProperty(exports, "map", {
    enumerable: true,
    get: function get() {
        return _xvmap.map;
    }
});
Object.defineProperty(exports, "entry", {
    enumerable: true,
    get: function get() {
        return _xvmap.entry;
    }
});

var _xvarray = require("xvarray");

Object.defineProperty(exports, "array", {
    enumerable: true,
    get: function get() {
        return _xvarray.array;
    }
});

var _immutable = require("immutable");

var _decimal = require("decimal.js");

var _decimal2 = _interopRequireDefault(_decimal);

var _bignumber = require("bignumber.js");

var _bignumber2 = _interopRequireDefault(_bignumber);

var _xvnode = require("xvnode");

var _xverr = require("xverr");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// TODO complete math (e.g. type checks for idiv and friends)

// one big pile
var operatorMap = exports.operatorMap = {
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

var UntypedAtomic = function (_String) {
    _inherits(UntypedAtomic, _String);

    function UntypedAtomic(a) {
        _classCallCheck(this, UntypedAtomic);

        var _this = _possibleConstructorReturn(this, (UntypedAtomic.__proto__ || Object.getPrototypeOf(UntypedAtomic)).call(this, a));

        _this._value = a;
        return _this;
    }

    _createClass(UntypedAtomic, [{
        key: "cast",
        value: function cast(other) {
            //If the atomic value is an instance of xdt:untypedAtomic
            //and the other is an instance of a numeric type,
            //then the xdt:untypedAtomic value is cast to the type xs:double.

            //If the atomic value is an instance of xdt:untypedAtomic
            //and the other is an instance of xdt:untypedAtomic or xs:string,
            //then the xdt:untypedAtomic value is cast to the type xs:string.

            //If the atomic value is an instance of xdt:untypedAtomic
            //and the other is not an instance of xs:string, xdt:untypedAtomic, or any numeric type,
            //then the xdt:untypedAtomic value is cast to the dynamic type of the other value.
            switch (other) {
                case UntypedAtomic:
                    return String(this._value);
                case String:
                    return String(this._value);
                case _decimal2.default:
                    return Number(this._value);
                case Integer:
                    return Number(this._value);
                case Number:
                    return Number(this._value);
                default:
                    return new other(this._value);
            }
        }
    }, {
        key: "toString",
        value: function toString() {
            return this._value.toString();
        }
    },{
        key: "valueOf",
        value: function valueOf() {
            return this._value.valueOf();
        }
    }]);

    return UntypedAtomic;
}(String);

var Integer = function (_Decimal) {
    _inherits(Integer, _Decimal);

    function Integer(a) {
        _classCallCheck(this, Integer);

        var _this2 = _possibleConstructorReturn(this, (Integer.__proto__ || Object.getPrototypeOf(Integer)).call(this, a));

        _this2.floor();
        _this2.constructor = Integer;
        return _this2;
    }

    return Integer;
}(_decimal2.default);

var Float = function (_Number) {
    _inherits(Float, _Number);

    function Float(a) {
        _classCallCheck(this, Float);

        var temp = new Float32Array(1);
        temp[0] = +a;

        var _this3 = _possibleConstructorReturn(this, (Float.__proto__ || Object.getPrototypeOf(Float)).call(this, temp[0]));

        _this3._f = temp[0];
        _this3._d = a;
        return _this3;
    }

    _createClass(Float, [{
        key: "toString",
        value: function toString() {
            var temp = new Float64Array(1);
            temp[0] = +this._d;
            return temp[0].toString();
        }
    }, {
        key: "valueOf",
        value: function valueOf() {
            return this._f;
        }
    }]);

    return Float;
}(Number);

var compProto = {
    equals: function equals(other) {
        return this.valueOf() === other.valueOf();
    },
    greaterThan: function greaterThan(other) {
        return this.valueOf() > other.valueOf();
    },
    lessThan: function lessThan(other) {
        return this.valueOf() < other.valueOf();
    },
    greaterThanEquals: function greaterThanEquals(other) {
        return this.valueOf() >= other.valueOf();
    },
    lessThanEquals: function lessThanEquals(other) {
        return this.valueOf() <= other.valueOf();
    }
};

var opProto = {
    plus: function plus(other) {
        return this + other;
    },
    minus: function minus(other) {
        return this - other;
    },
    times: function times(other) {
        return this * other;
    },
    dividedBy: function dividedBy(other) {
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
    return cast($a, _decimal2.default);
}

function integer($a) {
    return cast($a, Integer);
}

function string($a) {
    if ((0, _xvseq._isSeq)($a) || (0, _xvnode._isNode)($a)) {
        return data($a);
    }
    return cast($a, String);
}

function number($a) {
    return cast($a, Number);
}

function float($a) {
    return cast($a, Float);
}

function double($a) {
    return cast($a, Number);
}

function boolean($a) {
    try {
        return (0, _xvseq.seq)(_boolean(item($a)));
    } catch (e) {
        return e;
    }
}

function cast($a, $b) {
    var a = _xvseq._first($a);
    if(a === undefined) return $a;
    return _xvseq.seq(_cast(a,_xvseq._first($b)));
    //return item($a).op(_cast, $b);
}

function _convert(a, type) {
    if (a !== undefined && a.constructor !== type) {
        return _cast(a, type);
    }
    return a;
}

function _cast(a, b) {
    a = a.toString();
    var n = b.name;
    var c = _cast.cache[n];
    if (!c[a]) {
        c[a] = new b(a);
    }
    return c[a];
}

_cast.cache = {};
_cast.cache.Decimal = {};
_cast.cache.Integer = {};
_cast.cache.String = {};
_cast.cache.Number = {};
_cast.cache.Float = {};
_cast.cache.Boolean = {};
_cast.cache.UntypedAtomic = {};

function to($a, $b) {
    var a = _cast((0, _xvseq._first)($a),Number).valueOf() || 1;
    var b = _cast((0, _xvseq._first)($b),Number).valueOf() || 1;
    //if(!a || !b) return integer(0);
    return (0, _immutable.Range)(a, b);
}

function indexOf($a, $b) {
    $a = item($a);
    $b = item($b);
    var key = $a.findKey(function (i) {
        return _boolean($b.op("equals", i));
    });
    return key !== undefined ? (0, _xvseq.seq)(key+1) : (0, _xvseq.seq)();
}

function call() {
    for (var _len = arguments.length, a = Array(_len), _key = 0; _key < _len; _key++) {
        a[_key] = arguments[_key];
    }

    var $f = item(a[0]);
    var args = a.slice(1);
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
            //console.log(op);
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
            b = +a.toString();
            d = Number;
        }
    }
    if(c == Integer || d == Integer) {
        if(c == _decimal2.default || c == UntypedAtomic) {
            a = c == UntypedAtomic ? new Integer(a.toString()) : a;
            c = Integer;
        }
        if(d == _decimal2.default || d == UntypedAtomic) {
            b = d == UntypedAtomic ? new Integer(b.toString()) : b;
            d = Integer;
        }
    }
    if(c == String || d == String) {
        if(c == UntypedAtomic) {
            a = a.toString();
            c = String;
        }
        if(d == UntypedAtomic) {
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
      var v = _xvseq._first(iterable.get(key, NOT_SET));
      return otherIsSeq ? other.reduce(function(pre,cur) {
            return pre || opfn(v,cur);
        }, false) : opfn(v, other);
    };
    seq.__iterateUncached = function (fn, reverse) {
        var seq = this,
            _i = 0,
            stopped = false,
            ret;
        return iterable.__iterate(function (v, k, c) {
            ret = otherIsSeq ? other.reduce(function(pre,cur) {
                return pre || opfn(v,cur);
            }, false) : opfn(v, other);
            stopped = fn(ret, _i++, seq) === false;
            return !stopped;
        });
    };
    return seq;
}

function strictOp(iterable, opfn, other, general) {
    var otherIsSeq = (0, _xvseq._isSeq)(other);
    var ret = [];
    iterable.map(function(v){
        ret.push(otherIsSeq ? other.reduce(function(pre,cur){
            return pre || opfn(v,cur);
        },false) : opfn(v,other));
    });
    var seq = new _xvseq.Seq(ret);
    seq._isStrict = true;
    return seq;
    /*seq.has = key => iterable.has(key);
    seq.get = (key, notSetValue) => {
      var v = _xvseq._first(iterable.get(key, NOT_SET));
      return otherIsSeq ? other.reduce(function(pre,cur) {
            return pre || opfn(v,cur);
        }, false) : opfn(v, other);
    };
    seq.__iterateUncached = function (fn, reverse) {
        var seq = this,
            _i = 0,
            stopped = false,
            ret;
        return iterable.__iterate(function (v, k, c) {
            ret = otherIsSeq ? other.reduce(function(pre,cur) {
                return pre || opfn(v,cur);
            }, false) : opfn(v, other);
            stopped = fn(ret, _i++, seq) === false;
            return !stopped;
        });
    };
    return seq;*/
}


// TODO without eval!
function _isNodeSeq($a) {
    return (0, _xvnode._isNode)(_xvseq._first($a));
}

// FIXME the unmarshalling of seqs is probably more efficient than anything else...
// EXCEPT a filter + a lazy foldRight maybe
function _boolean($a) {
    if ((0, _xvseq._isEmpty)($a)) return false;
    var a = (0, _xvseq._first)($a);
    if ($a.size > 1 && !(0, _xvnode._isNode)(a)) {
        throw (0, _xverr.error)("err:FORG0006");
    }
    return !!a;
}

var logic = {
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

var opinv  = {
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
        let operatorName = operatorMap.hasOwnProperty(operator) ? operatorMap[operator] : operator;
        if (logic[operatorName]) {
            return logic[operatorName](this, other);
        } else {
            comp = compProto.hasOwnProperty(operatorName);
            general = comp && !compProto.hasOwnProperty(operator);
            opfn = comp ? _comp.bind(null, operatorName, invert) : _op.bind(null, operatorName, invert);
        }
        if (comp) {
            $a = data($a,false);
            //if(_isNodeSeq(this)) console.log("nodeset",operator,$a.first())
            $b = data($b,false);
        }
        if (!general) {
            if ((0, _xvseq._isEmpty)($a)) return $a;
            if ((0, _xvseq._isEmpty)($b)) return $b;
            if ($a.size > 1) return (0, _xverr.error)("err:XPTY0004");
        }
    } else if (typeof operator == "function") {
        opfn = operator;
    } else {
        return (0, _xverr.error)("xxx", "No such operator");
    }
    /*var otherIsSeq = _xvseq._isSeq($b);
    return $a.map(function(v){
        v = _xvseq._first(v);
        return otherIsSeq ? $b.reduce(function(pre,cur) {
            return pre || opfn(v,cur);
        }, false) : opfn(v, $b);
    });*/
    return $a._isStrict ? strictOp($a,opfn,$b,general) : opFactory($a,opfn,$b);
};

/*
Seq.prototype.getTextNodes = function(){
	if(!_isNode(this) || this._type != 1) return seq();
	return this.filter(function(_){
		if(!_isNode(_)) error("err:XPTY0004","Sequence cannot be converted into a node set.");
		return _._type === 3;
	});
};
*/

_xvseq.Seq.prototype.data = function () {
    return dataImpl(this);
};

function data($a,asString) {
    if (!(0, _xvnode._isNode)($a)) {
        if ((0, _xvseq._isSeq)($a)) {
            return $a.map(function (_) {
                return _xvnode._isNode(_) ? dataImpl(_, asString) : _;
            });
        }
        return _xvseq.seq($a);
    }
    // node
    return dataImpl($a,asString);
}

function dataImpl(node) {
    var asString = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
    var fltr = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    // FIXME asString should be used to flag for xs/type validation
    //if(node._string) {
    //    return node._string;
    //}
    var ret;
    var type = node._type;
    if(fltr && fltr === type) return undefined;
    if (type === 1) {
        ret = node.map(function (_) {
            var ret = dataImpl2(_, asString,2);
            if (!(ret instanceof String)) asString = false;
            return ret;
        }).filter(function (_) {
            return _ !== undefined;
        });
        if (asString) ret = ret.join("");
    } else {
        return dataImpl2(node,asString);
    }
    //node._string = ret;
    return ret;
}

function dataImpl2(node,asString,fltr){
    var type = node._type;
    if(fltr && fltr === type) return undefined;
    if(type == 1) return dataImpl(node,asString,fltr);
    // FIXME should be node!
    //var ret = node._isNode ? node.value() : node.first();
    var arr = node._array || node.toArray();
    var ret = arr[0];
    ret = asString ? ret.toString() : typeof ret == "string" ? _cast(ret,UntypedAtomic) : ret;
    return ret;
}

_xvseq.Seq.prototype.deepEqual = _xvseq.Seq.prototype.equals;

exports.fromJS = _immutable.fromJS;
exports._isNode = _xvnode._isNode;
