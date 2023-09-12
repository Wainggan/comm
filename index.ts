
import { vm, OP } from "./src/vm";

import { lexer } from "./src/lexer";
import { Reporter } from "./src/error";

const src = `1 + 1 print table - 2`

const reporter = new Reporter(src);

console.log(lexer(src, reporter).map(i => i.toString()))

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


