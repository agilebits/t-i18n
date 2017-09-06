import { Replacements, Messages, MFunc, SetupOptions, ReactReplacements } from "./types";
import createCachedFormatter, { CachedFormatter, numberFormatOptions, dateTimeFormatOptions} from "./format";
import { Plural, generator } from "./helpers";
import parseICU from "./icu";
import parseReact from "./react";

/**
 * T-i18n - lightweight localization
 * v0.2
 *
 * T-i18n defers to standards to do the hard work of localization. The browser Intl API is use to format
 * dates and numbers. Messages are provided as functions rather than strings, so they can be compiled at build time.
 * 
 *
 * Cobbled together by Mitch Cohen on July 31, 2017
 */

// T is exported instead of the underlying instance to allow calls to T("Message to translate")
//
export interface TFunc {
	(message: string, replacements?: Replacements, id?: string): string;
	lookup?: (id: string, replacements?: Replacements, defaultMessage?:string) => string 
	setup?: (options?: SetupOptions) => any;
	date?: (value: any, formatName?: string, locale?: string) => string;
	number?: (value: any, formatName?: string, locale?: string) => string;
	$?: (message: string, replacements?: ReactReplacements, id?: string) => React.ReactNode[];
	_i18nInstance?: I18n;
}

export const defaultLanguage = "en";

export class I18n {
	locale: string;	
	messages: Messages;
	idGenerator: (message: string) => any;
	dateFormatter: CachedFormatter;
	numberFormatter: CachedFormatter;
	
	static defaultSetup: SetupOptions = {
		messages: {},
		locale: defaultLanguage,
		idGenerator: generator.hyphens
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

	getKey(key: string, locale: string = this.locale):MFunc|String {
		const messages = this.messages[locale];
		const defaultMessages = this.messages[defaultLanguage];

		if (messages && messages[key]) {
			return messages[key];
		}
		if (defaultMessages && defaultMessages[key]) {
			return defaultMessages[key];
		}

		return;
	}

	generateId(message: string) {
		return this.idGenerator(message);
	}
	
	lookup(id: string, replacements: Replacements = null, defaultMessage:string = null):string {
		const translation = this.getKey(id, this.locale) || defaultMessage || id;
		if (typeof translation === "string") {
			return parseICU(translation, replacements);
		}

		return (<MFunc>translation)(replacements);
	}
	
	setup(options: SetupOptions = {}): SetupOptions {
		const {locale, idGenerator, messages, compiler} = options;
		if (idGenerator) this.idGenerator = idGenerator;
		if (locale) this.locale = locale;
		if (messages) this.messages = messages;
	
		return {
			messages: this.messages,
			locale: this.locale,
			idGenerator: this.idGenerator
		};
	}
}

function createT(context: I18n): TFunc {
	let T: TFunc = function translate(message: string, replacements?: (Replacements), id?: string): string {
		if (!id) id = context.generateId(message);
		return context.lookup(id, replacements, message);
	}
	T._i18nInstance = context;
	T.setup = context.setup.bind(T._i18nInstance);
	T.lookup = context.lookup.bind(T._i18nInstance);
	T.date = context.format.bind(T._i18nInstance, "date");
	T.number = context.format.bind(T._i18nInstance, "number");

	T.$ = function translateReact(message: string, replacements?: ReactReplacements, id?: string): React.ReactNode[] {
		const translatedMessage = T.apply(this, arguments);
		const reactElements = parseReact(translatedMessage, replacements);
		return reactElements;

	}

	return T;
}

export function i18nNamespace(): TFunc  {
	let i18nInstance: I18n = new I18n();
	
	return createT(i18nInstance);
}

// singleton (T)
export default i18nNamespace();

// or roll your own
export const makeT = i18nNamespace;