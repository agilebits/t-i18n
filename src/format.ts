// Format functions accept both date and number formatters
export type IntlFormat = Intl.DateTimeFormat|Intl.NumberFormat;
export type IntlFormatType<X extends IntlFormat> = X extends Intl.DateTimeFormat ? typeof Intl.DateTimeFormat : typeof Intl.NumberFormat;
export type IntlFormatOptions<X extends IntlFormat> = X extends Intl.DateTimeFormat ? Intl.DateTimeFormatOptions : Intl.NumberFormatOptions;
export type CachedFormatter<X extends IntlFormat> = (locale: string, formatOptions?: IntlFormatOptions<X>) => X;

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
export default function createCachedFormatter<X extends IntlFormat>(intlFormat: IntlFormatType<X>): CachedFormatter<X> {
	let cache: any = {};

	return function (locale: string, formatOptions?: IntlFormatOptions<X>): X {
		const args = Array.prototype.slice.call(arguments);
		const id = locale + "-" + JSON.stringify(formatOptions);
		if (id in cache) return cache[id];

		const formatter: X = new (Function.prototype.bind.call(
			intlFormat, null, ...args
		));

		cache[id] = formatter;
		return formatter;
	}
}