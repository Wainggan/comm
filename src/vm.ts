
export const OP = {
	number:	0x00,
	pop:	0x01,

	store:	0x10,
	load:	0x11,

	add:	0x20,
	negate:	0x21,

	print:	0xf1,
	nop:	0xff,
} as const;


export const vm = (bin: number[]) => {

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

