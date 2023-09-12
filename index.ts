
import { vm, OP } from "./src/vm";

import { lexer } from "./src/lexer";
import { parse } from "./src/parser";

import { Reporter } from "./src/error";

const src = `? 1 2 ; 3`

const reporter = new Reporter(src);

const tokens = lexer(src, reporter);

console.log(tokens.map(i => i.toString()))

const ast = parse(tokens, reporter);

console.log(ast);

const bin: number[] = [
	OP.number, 10,
	OP.number, 20,
	OP.add,

	OP.number, 0,
	OP.store,
	
	OP.number, 0,
	OP.load,
	
	OP.print,
]

console.log(vm(bin))


