import Decimal from "big.js";

import {
    error
} from "xverr";

import { seq, _first, isSeq, toSeq, _isEmptySeq, _isNode, _isEmptyNode } from "frink";

// TODO complete math (e.g. type checks for idiv and friends)

// one big pile
export const operatorMap = {
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

class Integer extends Decimal {
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

// TODO decimal opt-in/out
const zeroInt = () => new Decimal(0);
const zero = () => Number(0);
const emptyString = () => String();

// TODO create from Type classes
export function decimal($a) {
    // type test
    if ($a === undefined) return ;
    return cast($a, Decimal, zeroInt);
}

export function integer($a) {
    return cast($a, Integer, zeroÌnt);
}

export function string($a) {
    // type test
    return isSeq($a) || _isNode($a) ? data($a) : cast($a, String, emptyString);
}

export function number($a) {
    // type test
    return cast($a, Number, zero);
}

export function float($a) {
    // type test
    return cast($a, Float, zero);
}

export function double($a) {
    // type test
    return cast($a, Number, zero);
}

export function boolean($a) {
    // type test
    try {
        return _boolean($a);
    } catch (e) {
        return e;
    }
}

export function cast($a, $b) {
    if(isSeq($a)) return op($a,_cast, $b);
    return _cast($a);
}

function _convert(a, type) {
    if (a !== undefined && a.constructor !== type) {
        return _cast(a, type);
    }
    return a;
}

function _cast(a, b) {
    if (a.constructor !== b) a = new b(a.toString());
    return a;
}

export function to($a, $b) {
    let a = _first($a);
    let b = _first($b);
    a = a !== undefined ? +a.valueOf() : 0;
    b = b !== undefined ? +b.valueOf() : 0;
    return range(a, b + 1);
}

export function indexOf($a, $b) {
    $a = item($a);
    $b = item($b);
    return $a.findKeys(function(i) {
        return _boolean($b.op("equals", i));
    });
}

export function call(...a) {
    let $f = item(a[0]);
    let args = a.slice(1);
    return $f.map(function(f) {
        if (isList(f)) {
            return f.get(_first(a[1]) - 1);
        } else if (isMap(f)) {
            var key = _first(a[1]);
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
            if (!numbertest(a)) return error("err:XPTY0004", a.constructor.name + "(" + a + ") can not be operand for " + op);
            if (!numbertest(b)) return error("err:XPTY0004", b.constructor.name + "(" + b + ") can not be operand for " + op);
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
            throw new Error("Operator " + op + " not implemented for " + a + " (" + (a.constructor.name) + ")");
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
        if (c == Integer || c == Decimal || c == Float || c == UntypedAtomic) {
            a = +a.toString();
            c = Number;
        }
        if (d == Integer || d == Decimal || d == Float || d == UntypedAtomic) {
            b = +b.toString();
            d = Number;
        }
    }
    if (c == Integer || d == Integer) {
        if (c == Decimal || c == UntypedAtomic) {
            a = c == UntypedAtomic ? new Integer(a.toString()) : a;
            c = Integer;
        }
        if (d == Decimal || d == UntypedAtomic) {
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
        return error("err:XPTY0004", "Cannot compare operands: " + c.name + " and " + d.name);
    }
    return [a, b];
}

function _opReducer(iterable, opfn, other, general) {
    var otherIsSeq = isSeq(other);
    if (general) {
        return seq(foldLeft(iterable,function(acc, v) {
            return acc || (otherIsSeq ? foldLeft(other,function(pre, cur) {
                return pre || opfn(v, cur);
            }, false) : opfn(v, other));
        }, false));
    } else if (iterable.size == 1) {
        let b = otherIsSeq ? first(other) : other;
        return seq(opfn(first(iterable), b));
    } else {
        return forEach(iterable,function(v) {
            return otherIsSeq ? foldLeft(other,function(pre, cur) {
                return pre || opfn(v, cur);
            }, false) : opfn(v, other);
        });
    }
}

// TODO without eval!
function _isNodeSeq($a) {
    return node(first($a));
}

// FIXME the unmarshalling of seqs is probably more efficient than anything else...
// EXCEPT a filter + a lazy foldRight maybe
export function _boolean($a) {
    if (_isEmpty($a)) return false;
    var a = _first($a);
    if ($a.size > 1 && !_isNode(a)) {
        throw error("err:FORG0006");
    }
    return !!a.valueOf();
}

export const logic = {
    and: function and($a, $b) {
        return _boolean($a) && _boolean($b);
    },
    or: function or($a, $b) {
        return _boolean($a) || _boolean($b);
    },
    not: function not($a) {
        return !_first($a);
    }
};

const opinv = {
    ne: true,
    '!=': true
};
export function op($a, operator, $b) {
    var invert = false,
        comp = false,
        general = false;
    var opfn;
    if (typeof operator == "string") {
        invert = opinv[operator];
        let operatorName = operator in operatorMap ? operatorMap[operator] : operator;
        if (logic[operatorName]) {
            return logic[operatorName]($a, $b);
        } else {
            comp = compProto.hasOwnProperty(operatorName);
            general = comp && !compProto.hasOwnProperty(operator);
            opfn = comp ? _comp.bind(null, operatorName, invert) : _op.bind(null, operatorName, invert);
        }
        if (comp) {
            $a = data($a);
            $b = data($b);
        }
        if (!general) {
            if (_isEmpty($a)) return $a;
            if (_isEmpty($b)) return $b;
            // FIXME NOT! allow arithmetic on sequences (why not?)...
            // FIXME reduce when comp result is seq of booleans
            if ($b.size > 1) return error("err:XPTY0004");
        }
    } else if (typeof operator == "function") {
        opfn = operator;
    } else {
        return error("xxx", "No such operator");
    }
    return _opReducer($a, opfn, $b, general);
}

export function data($a) {
    return dataImpl($a);
}

function dataImpl(node, fltr = false) {
    var ret;
    if (isSeq(node)) {
        if (_isEmptyNode(node)) return node;
        //ret = node.map(_ => dataImpl(_, fltr)).filter(_ => _ !== undefined);
        var a = filter(node,_ => undefined !== dataImpl(_, fltr));
        if (!a.size) {
            ret = seq(new UntypedAtomic(""));
        } else {
            ret = a;
        }
        return ret;
    }
    if (!_isNode(node) || _isEmptyNode(node)) return node;
    var type = node.type;
    if (fltr && fltr === type) return undefined;
    if (type === 1) {
        ret = node.map(_ => dataImpl(_, 2)).filter(_ => _ !== undefined);
    } else {
        ret = node.value;
        if (typeof ret == "string") {
            ret = !ret ? undefined : _cast(ret, UntypedAtomic);
        }
    }
    return ret;
}

export function instanceOf($a, $b) {
    let a = _first($a);
    let b = _first($b);
    var t = a === undefined || b === undefined ? false : a.constructor === b.constructor;
    return t;
}

export function minus($a) {
    var a = _first($a);
    if (typeof a.neg == "function") return a.neg();
    return -a;
}
