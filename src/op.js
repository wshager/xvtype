import { item } from "./xvtype";

export function eq($a,$b){
	return item($a).op("eq",$b);
}

export function ne($a,$b){
	return item($a).op("ne",$b,true);
}

export function gt($a,$b){
	return item($a).op("gt",$b);
}

export function lt($a,$b){
	return item($a).op("lt",$b);
}

export function ge($a,$b){
	return item($a).op("ge",$b);
}

export function le($a,$b){
	return item($a).op("le",$b);
}

export function geq($a,$b){
	return item($a).op("=",$b);
}

export function gne($a,$b){
	return item($a).op("!=",$b);
}

export function ggt($a,$b){
	return item($a).op(">",$b);
}

export function glt($a,$b){
	return item($a).op("<",$b);
}

export function gge($a,$b){
	return item($a).op(">=",$b);
}

export function gle($a,$b){
	return item($a).op("<=",$b);
}

export function add($a,$b){
	return item($a).op("+",$b);
}

export function subtract($a,$b){
	return item($a).op("-",$b);
}

export function multiply($a,$b){
	return item($a).op("*",$b);
}

export function div($a,$b){
	return item($a).op("/",$b);
}

export function idiv($a,$b){
	return item($a).op("idiv",$b);
}
