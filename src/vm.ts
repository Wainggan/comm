
export enum OP {
	number = 0,
	pop,

	store,
	load,

	add,
	negate,

	print,
	nop,
}

export const ASM = {

	// stack manipulation

	i32: 	0x00,
	i16: 	0x01,
	f32: 	0x02,
	pop: 	0x0f,

	// math ~ int

	add_int:	0x10,
	mult_int:	0x11,
	neg_int:	0x12,

	// math ~ float

	add_float:	0x20,
	mult_float: 0x11,
	div_float: 	0x12,
	neg_float:	0x13,

	// memory

	store:	0x30,
	load:	0x31,

} as const;

export const vm = (bin: number[]) => {

	return;
	
	const memory = new Map<number, number>();
	const stack: number[] = [];
	let pc = 0;

	const atEnd = () => pc >= bin.length;
	const advance = (): number => {
		if (!atEnd()) return bin[pc++];
		return OP.nop;
	};

	const push = (value: number) => stack.push(value);
	const pop = (): number => stack.pop()!;
	const peek = (amount: number = 0): number => stack[stack.length - 1 - amount];
	
	while (!atEnd()) {

		const c = advance();

		switch (c) {
			
			case OP.number: {
				push(advance());
				break;
			}

			case OP.pop: {
				pop();
				break;
			}

			case OP.store: {
				const address = pop();
				const num = pop();

				memory.set(address, num);
				break;
			}

			case OP.load: {
				const address = pop();
				push(memory.get(address)!);
				break;
			}

			case OP.add: {
				const num2 = pop();
				const num1 = pop();
				push(num1 + num2);
				break;
			}

			case OP.negate: {
				const num = pop();
				push(-num);
				break;
			}

			case OP.print: {
				const num = peek();
				console.log(num);
				break;
			}

			case OP.nop: {
				break;
			}

		}

	}

	return [stack, memory];

}

