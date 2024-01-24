
export class Reporter {

	src: string;
	hadError: boolean;

	constructor(src: string) {
		this.src = src;
		this.hadError = false;
	}

	error(message: string, position: number) { // todo: cleanup
		this.hadError = true;

		let line = 1;
		for (let i = 0; i < this.src.length; i++) {
			if (this.src[i] == '\n') line++
			if (i == position) break;
		}

		let str = `${message} (line ${line})`;
		let startPos = 0;
		{
			let curLine = 0;
			let i = 0;
			for (; i < this.src.length; i++) {
				if (curLine == line - 1) break;
				if (this.src[i] == '\n') curLine++;
			}
			startPos = i;
			for (; i < this.src.length; i++) {
				if (curLine == line) break;
				if (this.src[i] == '\n') curLine++;
			}
			str += '\n    ' + this.src.substring(startPos, i - 1);
		}

		{
			let spacing = '';
			for (let i = 0; i < position - startPos; i++)
				spacing += ' ';
			str += `\n    ${spacing}^ here`
		}

		console.error(str);
	}
	
}

