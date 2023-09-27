

export enum Atoms {
	none,
	int,
	float,
	bool,
	string,
	null,
}


export class Type {
	types: Atoms[];
	constructor(...types: Atoms[]) {
		this.types = types;
	}

	prune() {

		for (let i = 0; i < this.types.length; i++) {
			const t1 = this.types[i];

			for (let j = i; j < this.types.length; j++) {
				if (i == j) continue;

				const t2 = this.types[j];

				if (t1 == t2) {
					this.types.splice(j, 1);
					j--;
				}

			}
		}

	}

	equal(other: Type): boolean {
		this.prune();
		other.prune();
		
		if (this.types.length != other.types.length) return false;

		for (let i = 0; i < this.types.length; i++) {
			if (this.types[i] != other.types[i]) return false;
		}

		return true;
	}

}

export const TypeDefs = {
	int: new Type(Atoms.int),
	float: new Type(Atoms.float),
	bool: new Type(Atoms.bool),
	string: new Type(Atoms.string),
	null: new Type(Atoms.null),
} as const;

