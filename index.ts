
import { vm, OP, ASM } from "./src/vm";

import { lexer } from "./src/lexer";
import { parse } from "./src/parser";
import { bind } from "./src/bind";
import { check } from "./src/resolver";

import { Reporter } from "./src/classes/error";

const src = `
let test = 10
test = tet
`

function run(src: string) {
	const reporter = new Reporter(src);

	const tokens = lexer(src, reporter);
	
	if (reporter.hadError) return;
	console.log(tokens.map(i => i.toString()))

	const ast = parse(tokens, reporter);
	
	if (reporter.hadError) return;
	console.log(ast);

	bind(ast, reporter);

	if (reporter.hadError) return;
	
	check(ast, reporter)

	console.log('compiled without errors')
	
}

run(src)



type operation = { instruction: OP, value: any };

const op = (instruction: OP, value: any = null): operation => {
	return { instruction, value };
};

const instructions: operation[] = [
	op(OP.number, 2),
	op(OP.number, 20),
	op(OP.add),
	
	op(OP.number, 0),
	op(OP.store),
	
	op(OP.number, 0),
	op(OP.load),

	op(OP.print),
];

const bufferize = (instructions: operation[]) => {

	const buffer_1float = new Float32Array(1);
	const buffer_1float_convert = new Uint8Array(buffer_1float.buffer);

	const asm = [];

	for (let i = 0; i < instructions.length; i++) {

		const c: operation = instructions[i];

		switch (c.instruction) {
			case OP.number: {
				asm.push(ASM.f32, c.value);
				break;
			}
			case OP.add: {
				asm.push(ASM.add_float);
			}
		}

	}



}



