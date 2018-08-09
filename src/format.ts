// Format functions accept both date and number formatters
export type IntlFormat = Intl.DateTimeFormat|Intl.NumberFormat;
export type IntlFormatType<T extends IntlFormat> = T extends Intl.DateTimeFormat ? typeof Intl.DateTimeFormat : typeof Intl.NumberFormat;
export type IntlFormatOptions<T extends IntlFormat> = T extends Intl.DateTimeFormat ? Intl.DateTimeFormatOptions : Intl.NumberFormatOptions;
export type CachedFormatter<T extends IntlFormat> = (locale: string, formatOptions?: IntlFormatOptions<T>) => T;

export const dateTimeFormats = {
	short: {
		month: "short",
		day: "numeric",
		year: "numeric"
	},
	long: {
		month: "long",
		day: "numeric",
		year: "numeric"
	},
	dateTime: {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "numeric"
	}
};

export const numberFormats = {
	currency: {
		style: "currency",
		currency: "USD"
	},
	decimal: {
		style: "decimal"
	},
	percent: {
		style: "percent"
	}
}

// Create cached versions of Intl.DateTimeFormat and Intl.NumberFormat
export default function createCachedFormatter<T extends IntlFormat>(intlFormat: IntlFormatType<T>): CachedFormatter<T> {
	let cache: any = {};

	return function (locale: string, formatOptions?: IntlFormatOptions<T>): T {
		const args = Array.prototype.slice.call(arguments);
		const id = locale + "-" + JSON.stringify(formatOptions);
		if (id in cache) return cache[id];

		const formatter: T = new (Function.prototype.bind.call(
			intlFormat, null, ...args
		));

		cache[id] = formatter;
		return formatter;
	}
}