/// <reference path="../node_modules/@types/react/index.d.ts" />

/**
 * T.js - lightweight localization
 * v0.1
 *
 * T.js defers to standards to do the hard work of localization. The browser Intl API is use to format
 * dates and numbers. Messages are provided as functions rather than strings, so they can be compiled at build time.
 * 
 *
 * Cobbled together by Mitch Cohen on July 31, 2017
 */

// Messages functions have replacement/pluralization logic baked in
// Use a tool like MessageFormat to generate these from strings
//
// const mFunc = (name) => "Hello, " + name
// mFunc("Mitch") // "Hello, Mitch"
//
export type MFunc =  (replacements?: Replacements) => string;
// Function to compile strings into message functions during runtime
export type Compiler = (message: string) => MFunc;

// { name: "Mitch", age: 10 }
export interface Replacements {
	[s: string]: any
}

// Message functions are grouped by locale and keyed to IDs
//
// {
// 	 en: {
//		 "greeting": (name) => "Hello, " + name
//	 }
// }
//
export interface Messages {
	[s: string]: {[s: string]: string|MFunc}
}

export interface SetupOptions {
	messages?: Messages;
	locale?: string;
	idGenerator?: (message: string) => string;
	compiler?: Compiler;
}

export interface PluralOptions {
	other: string;	
	one?: string;
	zero?: string;
}

// T is exported instead of the underlying instance to allow calls to T("Message to translate")
//
export interface TFunc {
	(message: string, replacements?: Replacements, id?: string): string;
	lookup?: (id: string, replacements?: Replacements, defaultMFunc?:MFunc) => string 
	setup?: (options?: SetupOptions) => any;
	date?: (value: any, formatName?: string, locale?: string) => string;
	number?: (value: any, formatName?: string, locale?: string) => string;
	$?: (message: string, replacements?: any, id?: string) => any[];
	_i18nInstance?: I18n;
}


// Format functions accept both date and number formatters
export type IntlFormat = Intl.DateTimeFormat|Intl.NumberFormat;
export type IntlFormatType = (typeof Intl.DateTimeFormat | typeof Intl.NumberFormat )
export type IntlFormatOptions = Intl.DateTimeFormatOptions | Intl.NumberFormatOptions;
export type CachedFormatter = (locale: string, formatOptions?: IntlFormatOptions) => IntlFormat;

export let dateTimeFormatOptions: {[s: string]: Intl.DateTimeFormatOptions} = {
	short: {
		month: 'short',
		day: 'numeric',
		year: "numeric"
	},
	long: {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	},
	dateTime: {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric'
	}
};
dateTimeFormatOptions.default = dateTimeFormatOptions.long;

export let numberFormatOptions: {[s: string]: Intl.NumberFormatOptions} = {
	currency: {
		style: 'currency'
	},
	decimal: {
		style: 'decimal'
	},
	percent: {
		style: 'percent'
	}
}
numberFormatOptions.default = numberFormatOptions.decimal;

export const collationTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
export const defaultLanguage = "en";

const spaceRegex = /\s/g;
const nonWordRegex = /\W/g;

export const generator = {
	plain(message: string): string {		
		return message;
	},
	hyphens(message: string):string {
		const hyphenated = message.toLowerCase().trim().replace(spaceRegex, "-").replace(nonWordRegex, '-');
		return hyphenated;
	}
}

// helper function to produce a pluralized string
export function Plural(pluralizeFor: string, options: PluralOptions): string {
	const {zero, one, other} = options;
	return "{" + pluralizeFor + ", plural,\n" +
			(zero ? "\t=0{" + zero + "}\n" : "") +
			(one ? "\tone{" + one + "}\n" : "") +
			("\tother{" + other + "}}");
}

// Create cached versions of Intl.DateTimeFormat and Intl.NumberFormat
export function createCachedFormatter(intlFormat: (IntlFormatType)): CachedFormatter {
	let cache:any = {};

	return function (locale: string, formatOptions?: IntlFormatOptions): IntlFormat {
		const args = Array.prototype.slice.call(arguments);
		const id = locale + "-" + JSON.stringify(formatOptions);
		if (id in cache) return cache[id];

		const formatter: IntlFormat = new (Function.prototype.bind.call(
			intlFormat, null, ...args
		));

		cache[id] = formatter;		
		return formatter;
	}
}

export class I18n {
	locale: string;	
	messages: Messages;
	idGenerator: (message: string) => any;
	dateFormatter: CachedFormatter;
	numberFormatter: CachedFormatter;
	compiler: Compiler;
	
	static defaultSetup: SetupOptions = {
		messages: {},
		locale: defaultLanguage,
		idGenerator: generator.hyphens,
		compiler: (message: string) => () => message
	}
	
	constructor(options: SetupOptions = null) {
		this.setup({...I18n.defaultSetup, ...options});

		this.dateFormatter = createCachedFormatter(Intl.DateTimeFormat);
		this.numberFormatter= createCachedFormatter(Intl.NumberFormat);
	}

	format(type: string, value: number|Date, formatStyle?: string, locale: string = this.locale) {
		const options = (type === "date") ? dateTimeFormatOptions : numberFormatOptions;
		const formatter = (type === "date") ? this.dateFormatter : this.numberFormatter;
		
		return formatter.call(this, locale, (options[formatStyle] || options.default)).format(value);
	}

	mFuncForKey(key: string, locale: string = this.locale):MFunc {
		const d = this.messages[locale];
		if (!d || !d[key]) return;
		if (typeof d[key] === "string") return this.compiler(<string>d[key]);
		return <MFunc>d[key];
	}

	generateId(message: string) {
		return this.idGenerator(message);
	}
	
	lookup(id: string, replacements: Replacements = null, defaultMFunc?:MFunc):string {
		if (!defaultMFunc) defaultMFunc = () => id;

		let mFunc = this.mFuncForKey(id, this.locale) || this.mFuncForKey(id, defaultLanguage);
		if (!mFunc) mFunc = defaultMFunc;
		return mFunc(replacements);
	}
	
	setup(options: SetupOptions = {}): SetupOptions {
		const {locale, idGenerator, messages, compiler} = options;
		if (idGenerator) this.idGenerator = idGenerator;
		if (locale) this.locale = locale;
		if (messages) this.messages = messages;
		if (compiler) this.compiler = compiler;
	
		return {
			messages: this.messages,
			locale: this.locale,
			idGenerator: this.idGenerator,
			compiler: this.compiler
		};
	}
}

let parser: DOMParser;
function parseXML(xmlString: string, replacements: any[]) {
	if (typeof parser === 'undefined') {
		parser = new DOMParser();
	}

	const xmlDoc = parser.parseFromString("<span>" + xmlString + "</span>", "text/xml");
	const firstNode = xmlDoc.firstChild.firstChild;
	if (firstNode.nodeName === "parseerror") {
		throw new Error("Could not parse XML string: " + firstNode.textContent)
	}

	const nodes = xmlDoc.firstChild.childNodes;	
	let elements = [];
	let factory: React.Factory<any>;
	let props: React.Props<any>;
	for (let i = 0; i < nodes.length; i++) {
		let {nodeName, nodeType, textContent} = nodes[i];
		if (nodeType === Node.ELEMENT_NODE) {
			let reactComponent =  replacements[nodeName];
			if (Array.isArray(reactComponent)) {
				[factory, props] = reactComponent;
				elements.push(factory(props, textContent));
			} else {
				elements.push(reactComponent);
			}
		} else {
			elements.push(textContent);
		}
	}
	return elements;
}

function createT(context: I18n): TFunc {
	let T: TFunc = function translate(message: string, replacements?: (Replacements), id?: string): string {
		if (!id) id = context.generateId(message);

		let defaultMFunc = context.mFuncForKey(id, defaultLanguage);
		if (!defaultMFunc) defaultMFunc = () => message;
		return context.lookup(id, replacements, defaultMFunc)
	}
	T._i18nInstance = context;
	T.setup = context.setup.bind(T._i18nInstance);
	T.lookup = context.lookup.bind(T._i18nInstance);
	T.date = context.format.bind(T._i18nInstance, "date");
	T.number = context.format.bind(T._i18nInstance, "number");

	T.$ = function translateReact(message: string, replacements?: any[], id?: string): React.ReactElement<any>[] {
		const translatedMessage = T.apply(this, arguments);
		const reactElements = parseXML(translatedMessage, replacements);
		return reactElements;

	}

	return T;
}

export function i18nNamespace(): TFunc  {
	let i18nInstance: I18n = new I18n();
	
	return createT(i18nInstance);

}

// singleton
export const T = i18nNamespace();

// or roll your own
export const makeI18n = i18nNamespace;