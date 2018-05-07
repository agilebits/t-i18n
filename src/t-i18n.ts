import { IcuReplacements, Messages, MFunc, SetupOptions, AnyReplacements } from "./types";
import createCachedFormatter, { CachedFormatter, numberFormatOptions, dateTimeFormatOptions} from "./format";
import { generator, assign, splitReplacements } from "./helpers";
import parseIcu from "./icu";
import parseXml from "./xml";

/**
 * T-i18n - lightweight localization
 * v0.3.1
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
	(message: string, replacements?: IcuReplacements, id?: string): string;
	lookup: (id: string, replacements?: IcuReplacements, defaultMessage?:string) => string
	setup: (options?: SetupOptions) => any;
	date: (value: any, formatName?: string, locale?: string) => string;
	number: (value: any, formatName?: string, locale?: string) => string;
	$: <X>(message: string, replacements?: AnyReplacements<X>, id?: string) => (X | string)[];
	_i18nInstance?: I18n;
}

export const defaultLanguage = "en";

export class I18n {
	locale: string = "en";
	messages: Messages = {};
	idGenerator: (message: string) => string = generator.hyphens;
	dateFormatter: CachedFormatter;
	numberFormatter: CachedFormatter;

	static defaultSetup: SetupOptions = {
		messages: {},
		locale: defaultLanguage,
		idGenerator: generator.hyphens
	}

	constructor(options?: SetupOptions) {
		this.setup({...I18n.defaultSetup, ...options});

		this.dateFormatter = createCachedFormatter(Intl.DateTimeFormat);
		this.numberFormatter= createCachedFormatter(Intl.NumberFormat);
	}

	format(type: string, value: number|Date, formatStyle?: string, locale: string = this.locale) {
		const options = (type === "date") ? dateTimeFormatOptions : numberFormatOptions;
		const formatter = (type === "date") ? this.dateFormatter : this.numberFormatter;
		const optionsForFormatStyle = formatStyle ? (options[formatStyle] || options.default) : options.default;

		return formatter.call(this, locale, optionsForFormatStyle).format(value);
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

		return "";
	}

	generateId(message: string): string {
		return this.idGenerator(message);
	}

	lookup(id: string, replacements: IcuReplacements = {}, defaultMessage = ""):string {
		const translation = this.getKey(id, this.locale) || defaultMessage || id;
		if (typeof translation === "string") {
			return parseIcu(translation, replacements);
		}

		return (<MFunc>translation)(replacements);
	}

	setup(options: SetupOptions = {}): SetupOptions {
		const { locale, idGenerator, messages } = options;
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
	const T = (message: string, replacements?: IcuReplacements, id?: string): string => {
		if (!id) id = context.generateId(message);
		return context.lookup(id, replacements, message);
	}
	const properties = {
		_i18nInstance: context,
		setup: context.setup.bind(context),
		lookup: context.lookup.bind(context),
		date: context.format.bind(context, "date"),
		number: context.format.bind(context, "number"),
		$: <X>(message: string, replacements: AnyReplacements<X> = {}, id?: string): (X | string)[] => {
			const [icu, xml] = splitReplacements(replacements);
			const translatedMessage = T(message, icu, id);
			return parseXml(translatedMessage, xml);
		},
	};

	return assign(T, properties);
}

export function i18nNamespace(): TFunc  {
	let i18nInstance: I18n = new I18n();

	return createT(i18nInstance);
}

// singleton (T)
export default i18nNamespace();

// or roll your own
export const makeT = i18nNamespace;