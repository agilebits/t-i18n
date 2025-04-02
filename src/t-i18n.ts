import {
	IcuReplacements,
	Messages,
	MFunc,
	Config,
	AnyReplacements,
} from "./types";
import createCachedFormatter, {
	numberFormats,
	dateTimeFormats,
} from "./format";
import { generator, assign, splitAndEscapeReplacements } from "./helpers";
import parseIcu from "./icu";
import parseXml from "./xml";

/**
 * T-i18n - lightweight localization
 * v0.6.2
 *
 * T-i18n defers to standards to do the hard work of localization. The browser Intl API is use to format
 * dates and numbers. Messages are provided as functions rather than strings, so they can be compiled at build time.
 *
 *
 * Made by Mitch Cohen and Rob Yoder
 * First released on July 31, 2017
 */
export interface BasicTFunc {
	(message: string, replacements?: IcuReplacements, id?: string): string;
	$: <X>(
		message: string,
		replacements?: AnyReplacements<X>,
		id?: string,
	) => (X | string)[];
	generateId: (message: string) => string;
	locale: () => string;
	lookup: (
		id: string,
		replacements?: IcuReplacements,
		defaultMessage?: string,
	) => string;
	set: (options?: Partial<Config>) => Config;
}

export interface IntlFormatters {
	date: (
		value: Date | number,
		formatName?: keyof typeof dateTimeFormats,
		locale?: string,
	) => string;
	number: (
		value: number,
		formatName?: keyof typeof numberFormats,
		locale?: string,
	) => string;
}
export type TFunc = BasicTFunc & IntlFormatters;

const defaultLanguage = "en";

const getKey = (
	allMessages: Messages,
	locale: string,
	key: string,
): MFunc | string => {
	const messages = allMessages[locale];
	const defaultMessages = allMessages[defaultLanguage];

	if (messages && messages[key]) {
		return messages[key];
	}
	if (defaultMessages && defaultMessages[key]) {
		return defaultMessages[key];
	}

	return "";
};

const makeIntlFormatters = (locale: () => string): IntlFormatters => {
	if (typeof Intl === "undefined") {
		const error = () => {
			throw new Error("Missing Intl");
		};
		return { date: error, number: error };
	}

	// HACK: See https://bugs.chromium.org/p/chromium/issues/detail?id=811403
	const getDateTimeFormat = () => {
		const delegate = Intl.DateTimeFormat;
		function DateTimeFormat(this: any) {
			const args = Array.prototype.slice.apply(arguments);
			const lang = typeof args?.[0] === "string" ? args[0] : "en-US";
			const timeZone =
				typeof args?.[1]?.timeZone === "string"
					? args[1].timeZone
					: "America/Toronto";
			return delegate.apply(this, [lang, timeZone]);
		}
		DateTimeFormat.prototype = delegate.prototype;
		return DateTimeFormat;
	};

	try {
		Intl.DateTimeFormat();
		new Date().toLocaleString();
		new Date().toLocaleDateString();
		new Date().toLocaleTimeString();
	} catch (err) {
		Date.prototype.toLocaleString = Date.prototype.toString;
		Date.prototype.toLocaleDateString = Date.prototype.toDateString;
		Date.prototype.toLocaleTimeString = Date.prototype.toTimeString;
		Intl.DateTimeFormat = getDateTimeFormat() as any;
	}
	// HACK: end

	const dateFormatter = createCachedFormatter<Intl.DateTimeFormat>(
		Intl.DateTimeFormat,
	);
	const numberFormatter = createCachedFormatter<Intl.NumberFormat>(
		Intl.NumberFormat,
	);

	const date = (
		value: Date | number,
		style: keyof typeof dateTimeFormats = "long",
		dateLocale = locale(),
	) => {
		const format = dateTimeFormats[style] || dateTimeFormats.long;
		return dateFormatter(dateLocale, format).format(value);
	};

	const number = (
		value: number,
		style: keyof typeof numberFormats = "decimal",
		numberLocale = locale(),
	) => {
		const format = numberFormats[style] || numberFormats.decimal;
		return numberFormatter(numberLocale, format).format(value);
	};

	return { date, number };
};

export const makeBasicT = (): BasicTFunc => {
	let messages: Messages = {};
	let locale = defaultLanguage;
	let idGenerator = generator.hyphens;

	const set = (options: Partial<Config> = {}): Config => {
		messages = options.messages || messages;
		locale = options.locale || locale;
		idGenerator = options.idGenerator || idGenerator;

		return { messages, locale, idGenerator };
	};

	const generateId = (message: string) => idGenerator(message);

	const lookup = (
		id: string,
		replacements: IcuReplacements = {},
		defaultMessage = "",
	): string => {
		const translation = getKey(messages, locale, id) || defaultMessage || id;
		if (typeof translation === "string") {
			return parseIcu(translation, replacements);
		}

		return translation(replacements);
	};

	const T = (
		message: string,
		replacements: IcuReplacements = {},
		id = "",
	): string => {
		return lookup(id || generateId(message), replacements, message);
	};

	const $ = <X>(
		message: string,
		replacements: AnyReplacements<X> = {},
		id = "",
	): (X | string)[] => {
		const [icu, xml] = splitAndEscapeReplacements(replacements);
		const translatedMessage = T(message, icu, id);
		return parseXml(translatedMessage, xml);
	};

	const properties = {
		$,
		generateId,
		locale: () => locale,
		lookup,
		set,
	};

	return assign(T, properties);
};

export const makeT = (): TFunc => {
	const T = makeBasicT();
	const formatters = makeIntlFormatters(T.locale);
	return assign(T, formatters);
};

/**
 * Create a version of `T` that only errors.
 *
 * This is useful if you need to enforce a certain way of loading strings,
 * such as with React's Context Providers.
 */
export const makeErrorBasicT = (message: string): BasicTFunc => {
	const errorFn = () => {
		throw new Error(message);
	};

	return assign(errorFn, {
		$: errorFn,
		generateId: errorFn,
		locale: errorFn,
		lookup: errorFn,
		set: errorFn,
	});
};

/**
 * Create a version of `T` that only errors.
 *
 * This is useful if you need to enforce a certain way of loading strings,
 * such as with React's Context Providers.
 */
export const makeErrorT = (message: string): TFunc => {
	const errorFn = () => {
		throw new Error(message);
	};

	return assign(errorFn, {
		$: errorFn,
		generateId: errorFn,
		locale: errorFn,
		lookup: errorFn,
		set: errorFn,
		date: errorFn,
		number: errorFn,
	});
};

// singleton (T)
export default makeT();
