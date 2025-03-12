import { IcuReplacements } from "./types";

const TOKEN = {
	OPEN: "{",
	CLOSE: "}",
};

// ICU grammar (basic value replacement only)
//
// message: (STRING | replacement)*
// replacement: OPEN value CLOSE
// value: STRING

export default function parseIcu(
	icuString: string,
	replacements: IcuReplacements,
): string {
	if (!replacements) return icuString;

	let currentToken = "";
	let elements = [];
	for (let i = 0; i < icuString.length; i++) {
		switch (icuString.charAt(i)) {
			case TOKEN.OPEN:
				elements.push(currentToken);
				currentToken = "";
				break;
			case TOKEN.CLOSE:
				elements.push(replacements[currentToken]);
				currentToken = "";
				break;
			default:
				currentToken += icuString.charAt(i);
		}
	}
	elements.push(currentToken);
	return elements.join("");
}
