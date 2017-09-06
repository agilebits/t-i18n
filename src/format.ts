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
		style: 'currency',
		currency: "USD"
	},
	decimal: {
		style: 'decimal'
	},
	percent: {
		style: 'percent'
	}
}
numberFormatOptions.default = numberFormatOptions.decimal;

// Create cached versions of Intl.DateTimeFormat and Intl.NumberFormat
export default function createCachedFormatter(intlFormat: (IntlFormatType)): CachedFormatter {
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