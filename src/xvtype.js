import { fromJS, Range } from "immutable";
import Decimal from "decimal.js";
import BigNumber from "bignumber.js";

import { _isNode } from "xvnode";

import { error } from "xverr";

import * as op from "./op";

import { Seq, seq, _first, _isSeq, toSeq, subsequence, remove, head, tail, count, reverse, insertBefore, _isEmpty, empty, exists } from "xvseq";

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
		switch(other){
			case UntypedAtomic: return String(this._value);
			case String: return String(this._value);
			case Decimal: return Number(this._value);
			case Integer: return Number(this._value);
            case Number: return Number(this._value);
            default: return new other(this._value);
		}
	}
    toString(){
        return this._value.toString();
    }
}

class Integer extends Decimal {
    constructor(a){
        super(a);
        this.floor();
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
    return Range(a,b);
}

export function indexOf($a,$b) {
	var key = $a.findKey(function(i){
		return b.op("equals",i);
	});
	return key !== undefined ? seq(key) : seq();
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
            if(!numbertest(a) || !numbertest(b)) return error("err:XPTY0004");
            ret = a[op](_convert(b,a.constructor));
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
            var c = a.constructor;
            if(c != b.constructor) {
                // TODO FIXME use JS type casting! 1 == "1"
                //If each operand is an instance of one of the types xs:string or xs:anyURI, then both operands are cast to type xs:string.
                //If each operand is an instance of one of the types xs:decimal or xs:float, then both operands are cast to type xs:float.
                //If each operand is an instance of one of the types xs:decimal, xs:float, or xs:double, then both operands are cast to type xs:double.
                return error("err:XPTY0004","Cannot compare operands: " + c.name + " and "+b.constructor.name);
            }
            //ret = _opImpl(a,b,op);
            ret = a[op](_convert(b,c));
        } else {
            throw new Error("Operator "+op+" not implemented for "+a+" ("+(a.constructor.name)+")");
        }
	}
    //console.log(a,b,op,ret);

    return invert ? !ret : ret;
}

function opFactory(iterable,opfn,other) {
    var seq = Object.create(Seq.Indexed.prototype);
    seq.size = iterable.size;
    var otherIsSeq = _isSeq(other);
    seq.__iterateUncached = function (fn, reverse) {
        var seq = this,
            _i = 0,
            stopped = false,
            ret;
        return iterable.__iterate(function(v, k, c)  {
            ret = otherIsSeq ? other.reduce(opfn,v) : opfn(v,other);
            stopped = fn(ret, _i++, seq) === false;
            return !stopped;
        });
    };
    return seq;
}

// TODO without eval!
export function _isNodeSeq($a){
    return _isNode($a._first());
}

// FIXME the unmarshalling of seqs is probably more efficient than anything else...
// EXCEPT a filter + a lazy foldRight maybe
export function _boolean($a) {
    if(_isEmpty($a)) return false;
    var a = _first($a);
    if($a.size>1 && !_isNode(a)){
        throw error("err:FORG0006");
    }
    return !!a;
}

const logic = {
    and($a,$b){
        return _boolean($a) && _boolean($b);
    },
    or($a, $b){
        return _boolean($a) || _boolean($b);
    },
    not($a){
        return !_first($a);
    }
};

Seq.prototype.op = function(operator,other) {
    var invert = false, comp = false, general = false;
    var $a = this,
        $b = other,
        opfn;
    if(typeof operator == "string"){
        invert = /^!=|ne/.test(operator);
        operator = operatorMap.hasOwnProperty(operator) ? operatorMap[operator] : operator;
        if(/^and|or|not$/.test(operator)){
            return logic[operator](this,other);
        } else {
            comp = compProto.hasOwnProperty(operator);
            general = !comp && !opProto.hasOwnProperty(operator);
            opfn = comp ? _comp.bind(null, operator, invert) : _op.bind(null, operator, invert);
        }
        if(comp){
            $a = data($a);
            $b = data($b);
        }
        if(!general){
            if(_isEmpty($a)) return $a;
            if(_isEmpty($b)) return $b;
            if($a.size > 1) return error("err:XPTY0004");
        }
    } else if(typeof operator == "function") {
        opfn = operator;
    } else {
        return error("xxx","No such operator");
    }
    return opFactory($a,opfn,$b);
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

Seq.prototype.data = function(){
	return dataImpl(this);
};

export function data($a){
    return seq(dataImpl($a));
}

function dataImpl(node,asString=true,fltr=null) {
    // FIXME asString should be used to flag for xs/type validation
    //if(node._string) {
    //    return node._string;
    //}
    var ret;
    if(!_isNode(node)) {
        if(_isSeq(node)) return node.map(_ => dataImpl(_,asString,fltr));
        return node;
    }
	let type = node._type;
	if(fltr && type === fltr) return undefined;
	if(type===1){
		ret = node.map(function(_){
			var ret = dataImpl(_,asString,2);
            if(!(ret instanceof String)) asString = false;
            return ret;
		}).flatten(true).filter(function(_){
			return _ !== undefined;
		});
        if(asString) ret = ret.join("");
	} else {
        ret = node.get(0);
        ret = asString ? _cast(ret,String) : _cast(ret,node._dataType ? node._dataType : UntypedAtomic);
    }
    //node._string = ret;
    return ret;
}

Seq.prototype.deepEqual = Seq.prototype.equals;

export {  fromJS, _isNode, seq, _first, _isSeq, toSeq, subsequence, remove, head, tail, count, reverse, insertBefore, empty, exists };
