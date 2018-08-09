import { IcuReplacements, Messages, MFunc, SetupOptions, AnyReplacements } from "./types";
import createCachedFormatter, { numberFormats, dateTimeFormats} from "./format";
import { generator, assign, splitAndEscapeReplacements } from "./helpers";
import parseIcu from "./icu";
import parseXml from "./xml";

/**
 * T-i18n - lightweight localization
 * v0.6.0
 *
 * T-i18n defers to standards to do the hard work of localization. The browser Intl API is use to format
 * dates and numbers. Messages are provided as functions rather than strings, so they can be compiled at build time.
 */

export interface TFunc {
	(message: string, replacements?: IcuReplacements, id?: string): string;
	generateId: (message: string) => string;
	locale: () => string;
	lookup: (id: string, replacements?: IcuReplacements, defaultMessage?:string) => string
	setup: (options?: SetupOptions) => any;
	date: (value: any, formatName?: keyof typeof dateTimeFormats, locale?: string) => string;
	number: (value: any, formatName?: keyof typeof numberFormats, locale?: string) => string;
	$: <X>(message: string, replacements?: AnyReplacements<X>, id?: string) => (X | string)[];
}

const defaultLanguage = "en";

const getKey = (allMessages: Messages, locale: string, key: string): MFunc | string => {
	const messages = allMessages[locale];
	const defaultMessages = allMessages[defaultLanguage];

	if (messages && messages[key]) {
		return messages[key];
	}
	if (defaultMessages && defaultMessages[key]) {
		return defaultMessages[key];
	}

	return "";
}

export const makeT = (): TFunc => {
	const dateFormatter = createCachedFormatter<Intl.DateTimeFormat>(Intl.DateTimeFormat);
	const numberFormatter = createCachedFormatter<Intl.NumberFormat>(Intl.NumberFormat);

	let messages: Messages = {};
	let locale = defaultLanguage;
	let idGenerator = generator.hyphens;

	const setup = (options: SetupOptions = {}): SetupOptions => {
		messages = options.messages || messages;
		locale = options.locale || locale;
		idGenerator = options.idGenerator || idGenerator;

		return { messages, locale, idGenerator };
	}

	const date = (value: Date, style: keyof typeof dateTimeFormats = "long", dateLocale = locale) => {
		const format = dateTimeFormats[style] || dateTimeFormats.long;
		return dateFormatter(dateLocale, format).format(value);
	}

	const number = (value: number, style: keyof typeof numberFormats = "decimal", numberLocale = locale) => {
		const format = numberFormats[style] || numberFormats.decimal;
		return numberFormatter(numberLocale, format).format(value);
	}

	const generateId = (message: string) => idGenerator(message);

	const lookup = (id: string, replacements: IcuReplacements = {}, defaultMessage = ""): string => {
		const translation = getKey(messages, locale, id) || defaultMessage || id;
		if (typeof translation === "string") {
			return parseIcu(translation, replacements);
		}

		return translation(replacements);
	}

	const T = (message: string, replacements: IcuReplacements = {}, id = ""): string => {
		return lookup(id || generateId(message), replacements, message);
	}

	const $ = <X>(message: string, replacements: AnyReplacements<X> = {}, id = ""): (X | string)[] => {
		const [icu, xml] = splitAndEscapeReplacements(replacements);
		const translatedMessage = T(message, icu, id);
		return parseXml(translatedMessage, xml);
	}

	const properties = {
		$,
		date,
		generateId,
		locale: () => locale,
		lookup,
		number,
		setup,
	};

	return assign(T, properties);
}

// singleton (T)
export default makeT();
