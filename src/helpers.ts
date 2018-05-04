import { AnyReplacements, IcuReplacements, Mutable, XmlReplacements } from "./types";

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

export const splitReplacements = <T>(replacements: AnyReplacements<T>): [IcuReplacements, XmlReplacements<T>] => {
	const icu: Mutable<IcuReplacements> = {};
	const xml: Mutable<XmlReplacements<T>> = {};
	for (const key in replacements) {
		if (replacements.hasOwnProperty(key)) {
			const value = replacements[key];
			if (typeof value === "function") {
				xml[key] = value;
			} else {
				icu[key] = value;
			}
		}
	}
	return [icu, xml];
}

// Based on the Object.assign polyfill at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
export const assign = <T, U>(target: T, source: U): T & U => {
	const to = Object(target);
	for (const nextKey in source) {
		// Avoid bugs when hasOwnProperty is shadowed
		if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
			to[nextKey] = source[nextKey];
		}
	}
	return to;
};