"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.eq = eq;
exports.ne = ne;
exports.gt = gt;
exports.lt = lt;
exports.ge = ge;
exports.le = le;
exports.geq = geq;
exports.gne = gne;
exports.ggt = ggt;
exports.glt = glt;
exports.gge = gge;
exports.gle = gle;
exports.add = add;
exports.subtract = subtract;
exports.multiply = multiply;
exports.div = div;
exports.idiv = idiv;

var _xvtype = require("./xvtype");

function eq($a, $b) {
	return (0, _xvtype.item)($a).op("eq", $b);
}

function ne($a, $b) {
	return (0, _xvtype.item)($a).op("ne", $b, true);
}

function gt($a, $b) {
	return (0, _xvtype.item)($a).op("gt", $b);
}

function lt($a, $b) {
	return (0, _xvtype.item)($a).op("lt", $b);
}

function ge($a, $b) {
	return (0, _xvtype.item)($a).op("ge", $b);
}

function le($a, $b) {
	return (0, _xvtype.item)($a).op("le", $b);
}

function geq($a, $b) {
	return (0, _xvtype.item)($a).op("=", $b);
}

function gne($a, $b) {
	return (0, _xvtype.item)($a).op("!=", $b);
}

function ggt($a, $b) {
	return (0, _xvtype.item)($a).op(">", $b);
}

function glt($a, $b) {
	return (0, _xvtype.item)($a).op("<", $b);
}

function gge($a, $b) {
	return (0, _xvtype.item)($a).op(">=", $b);
}

function gle($a, $b) {
	return (0, _xvtype.item)($a).op("<=", $b);
}

function add($a, $b) {
	return (0, _xvtype.item)($a).op("+", $b);
}

function subtract($a, $b) {
	return (0, _xvtype.item)($a).op("-", $b);
}

function multiply($a, $b) {
	return (0, _xvtype.item)($a).op("*", $b);
}

function div($a, $b) {
	return (0, _xvtype.item)($a).op("/", $b);
}

function idiv($a, $b) {
	return (0, _xvtype.item)($a).op("idiv", $b);
}