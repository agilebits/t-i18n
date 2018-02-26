export interface PluralOptions {
	other: string;	
	one?: string;
	zero?: string;
}

const spaceRegex = /\s/g;
const nonWordRegex = /\W/g;

export const generator = {
	plain(message: string): string {		
		return message;
	},
	hyphens(message: string):string {
		const hyphenated = message.trim().replace(spaceRegex, "-").replace(nonWordRegex, '-');
		return hyphenated;
	}
}

export function Plural(pluralizeFor: string, options: PluralOptions): string {
	const {zero, one, other} = options;
	return "{" + pluralizeFor + ", plural,\n" +
			(zero ? "\t=0{" + zero + "}\n" : "") +
			(one ? "\tone{" + one + "}\n" : "") +
			("\tother{" + other + "}}");
}