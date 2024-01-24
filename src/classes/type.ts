
import { Expression, Expr } from "./expression"
import { TT } from "./token"

export type Symbol = {
	declaration: Expr.Declaration
}

export type Table = Map<string, Symbol>

export enum BaseTypes {
	null,
	int,
	float,
	double,
	string,
	bool,
	error
}

export class Type {
	type: BaseTypes;
	constructor(type: BaseTypes) {
		this.type = type;
	}

	toString() {
		return BaseTypes[this.type]
	}

	static compare(t1: Type, t2: Type) {
		return t1.type == t2.type
	}
}

export const type_defaults = {
	error: new Type(BaseTypes.error),
	null: new Type(BaseTypes.null),
	int: new Type(BaseTypes.int),
	double: new Type(BaseTypes.double),
	bool: new Type(BaseTypes.bool),
	string: new Type(BaseTypes.string),
}
