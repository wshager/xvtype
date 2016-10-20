import { fromJS, Range } from "immutable";
import Decimal from "decimal.js";
import BigNumber from "bignumber.js";

import { _isNode } from "xvnode";

import { error } from "xverr";

import { Seq, seq, _first, _isSeq, toSeq, _isEmpty } from "xvseq";

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
    constructor(a){
        super(a);
        this._value = a;
    }
    cast(other){
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
    toString(){
        return this._value.toString();
    }
    valueOf() {
        return this._value.valueOf();
    }
}

class Integer extends Decimal {
    constructor(a){
        super(a);
        this.floor();
        this.constructor = Integer;
    }
}

class Float extends Number {
    constructor(a){
        var temp = new Float32Array(1);
        temp[0] = +a;
        super(temp[0]);
        this._f = temp[0];
        this._d = a;
    }
    toString(){
        var temp = new Float64Array(1);
        temp[0] = +this._d;
        return temp[0].toString();
    }
    valueOf(){
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
    plus(other){
        return this + other;
    },
    minus(other) {
        return this - other;
    },
    times(other){
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
export function item($a) {
	return seq($a);
}

// TODO create from Type classes
export function decimal($a){
	return cast($a,Decimal);
}

export function integer($a){
	return cast($a,Integer);
}

export function string($a){
    if(_isSeq($a) || _isNode($a)) return data($a);
	return cast($a,String);
}

export function number($a){
	return cast($a,Number);
}

export function float($a){
    return cast($a,Float);
}

export function double($a){
	return cast($a,Number);
}

export function boolean($a){
    try {
        return seq(_boolean(item($a)));
    } catch(e) {
        return e;
    }
}

export function cast($a,$b){
    /* ALT
    var a = _first($a);
    if(a === undefined) return $a;
    return seq(_cast(a,_first($b)));
    */
    return item($a).op(_cast,$b);
}

function _convert(a,type){
    if(a !== undefined && a.constructor !== type){
        return _cast(a,type);
    }
    return a;
}

function _cast(a,b){
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


export function to($a,$b){
    let a = _first($a);
    let b = _first($b);
    try {
        a = a.valueOf() | 1;
        b = b.valueOf() | 1;
    } catch(e) {}
    return Range(a,b);
}

export function indexOf($a,$b) {
    $a = item($a);
    $b = item($b);
    var key = $a.findKey(function (i) {
        return _boolean($b.op("equals", i));
    });
    return key !== undefined ? seq(key+1) : seq();
}

export function call(... a) {
    let $f = item(a[0]);
    let args = a.slice(1);
    return $f.map(function(f){
        if(isList(f)) {
    		return f.get(_first(a[1]) - 1);
    	} else if(isMap(f)) {
            var key = _first(a[1]);
            return f.get(key);
    	} else {
    		return f.apply(this,args);
    	}
    });
}

function numbertest(a){
    var c = a.constructor;
    if(c == String || c == Boolean) return;
    return true;
}

function _op(op,invert,a,b){
    var ret;
    if(a !== undefined) {
        if(typeof a[op] == "function") {
            if(!numbertest(a)) return error("err:XPTY0004",a.constructor.name +"("+a+") can not be operand for "+op);
            if(!numbertest(b)) return error("err:XPTY0004",b.constructor.name +"("+b+") can not be operand for "+op);
            var ab = _promote(a,b);
            if(ab instanceof Error) {
                return ab;
            }
            a = ab[0];
            b = ab[1];
            ret = a[op](b);
        } else {
            throw new Error("Operator "+op+" not implemented");
        }
	}
    return invert ? !ret : ret;
}

function _comp(op,invert,a,b){
    var ret;
    if(a !== undefined) {
        if(typeof a[op] == "function") {
            var ab = _promote(a,b);
            if(ab instanceof Error) {
                return ab;
            }
            a = ab[0];
            b = ab[1];
            ret = a[op](b);
        } else {
            throw new Error("Operator "+op+" not implemented for "+a+" ("+(a.constructor.name)+")");
        }
	}
    //console.log(a,b,op,ret);

    return invert ? !ret : ret;
}

function _promote(a,b) {
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
            b = +a.toString();
            d = Number;
        }
    }
    if(c == Integer || d == Integer) {
        if(c == Decimal || c == UntypedAtomic) {
            a = c == UntypedAtomic ? new Integer(a.toString()) : a;
            c = Integer;
        }
        if(d == Decimal || d == UntypedAtomic) {
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
        return error("err:XPTY0004", "Cannot compare operands: " + c.name + " and " + d.name);
    }
    return [a, b];
}

var NOT_SET = {};
function opFactory(iterable, opfn, other) {
    var seq = Object.create(Seq.prototype);
    seq.size = iterable.size;
    var otherIsSeq = _isSeq(other);
    seq.has = key => iterable.has(key);
    seq.get = (key, notSetValue) => {
      var v = _first(iterable.get(key, NOT_SET));
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
    var otherIsSeq = _isSeq(other);
    var ret = [];
    iterable.map(function(v){
        ret.push(otherIsSeq ? other.reduce(function(pre,cur){
            return pre || opfn(v,cur);
        },false) : opfn(v,other));
    });
    var seq = new Seq(ret);
    seq._isStrict = true;
    return seq;
}

// TODO without eval!
function _isNodeSeq($a) {
    return _isNode(_first($a));
}

// FIXME the unmarshalling of seqs is probably more efficient than anything else...
// EXCEPT a filter + a lazy foldRight maybe
export function _boolean($a) {
    if (_isEmpty($a)) return false;
    var a = _first($a);
    if ($a.size > 1 && !_isNode(a)) {
        throw error("err:FORG0006");
    }
    return !!a;
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

const opinv  = {
    ne: true,
    '!=': true
};
Seq.prototype.op = function (operator, other) {
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
            $a = data($a,false);
            //if(_isNodeSeq(this)) console.log("nodeset",operator,$a.first())
            $b = data($b,false);
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

Seq.prototype.data = function (asString) {
    return dataImpl(this,asString);
};

export function data($a,asString) {
    if (!_isNode($a)) {
        if (_isSeq($a)) {
            return $a.map(function (_) {
                return _isNode(_) ? dataImpl(_, asString) : _;
            });
        }
        return seq($a);
    }
    // node
    return dataImpl($a,asString);
}

function dataImpl(node,asString=true,fltr=false) {
    // FIXME asString should be used to flag for xs/type validation
    //if(node._string) {
    //    return node._string;
    //}
    var ret;
    var type = node._type;
    if(fltr && fltr === type) return undefined;
    if (type === 1) {
        ret = node.map(function (_) {
            var ret = dataImpl(_, asString,2);
            if (!(ret instanceof String)) asString = false;
            return ret;
        }).filter(function (_) {
            return _ !== undefined;
        });
        if (asString) ret = ret.join("");
    } else {
        ret = _.value();
        ret = asString ? ret.toString() : typeof ret == "string" ? _cast(ret,UntypedAtomic) : ret;
    }
    return ret;
}

/*
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
}*/

Seq.prototype.deepEqual = Seq.prototype.equals;

export {  fromJS, _isNode };
export * from "xvseq";
export { map, entry } from "xvmap";
export { array } from "xvarray";
