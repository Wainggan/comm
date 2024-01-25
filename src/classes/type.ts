
import { Expression, Expr } from "./expression"
import { TT } from "./token"

export type Symbol = {
	declaration: Expr.Declaration
}

export type Table = Map<string, Symbol>

export class Type {
	type: string;
	constructor(type: string) {
		this.type = type;
	}

	toString() {
		return this.type
	}

	static compare(t1: Type, t2: Type) {
		return t1.type == t2.type
	}
}

export const type_defaults = {
	error: new Type('error'),
	null: new Type('null'),
	i16: new Type('i16'),
	i32: new Type('i32'),
	double: new Type('double'),
	bool: new Type('bool'),
	string: new Type('string'),
}
