import { XmlReplacements } from "./types";

const XML_WRAPPER = "wrap";
let parser: DOMParser;

export default function parseXml<X>(
	xmlString: string,
	replacements: XmlReplacements<X>,
): (X | string)[] {
	if (typeof parser === "undefined") {
		parser = new DOMParser();
	}

	const xmlDoc = parser.parseFromString(
		`<${XML_WRAPPER}>${xmlString}</${XML_WRAPPER}>`,
		"text/xml",
	);

	if (!xmlDoc.firstChild || xmlDoc.firstChild.nodeName !== XML_WRAPPER) {
		throw new Error("Could not parse XML string");
	}

	return walk(xmlDoc.firstChild, replacements, true);
}

// https://dom.spec.whatwg.org/#dom-node-nodetype
const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;

function walk<X>(
	node: Node,
	replacements: XmlReplacements<X>,
	isRoot = false,
): (X | string)[] {
	if (node.nodeType === NODE_TYPE_TEXT) {
		return node.nodeValue ? [node.nodeValue] : [];
	} else if (node.nodeType === NODE_TYPE_ELEMENT) {
		const children: Node[] = Array.prototype.slice.call(node.childNodes);
		const replacedChildren = children.reduce<(X | string)[]>(
			(acc, child) => [...acc, ...walk(child, replacements)],
			[],
		);

		return isRoot || !replacements[node.nodeName]
			? replacedChildren
			: [replacements[node.nodeName](...replacedChildren)];
	} else {
		// Ignore all other node types
		return [];
	}
}
