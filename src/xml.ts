import { XmlReplacements } from "./types";

// Use a node name that someone else won't pick accidentally
const XML_WRAPPER = "xml_wrapper_faeqcd"
let parser: DOMParser;

export default function parseXml<X>(xmlString: string, replacements: XmlReplacements<X>): (X | string)[] {
	if (typeof parser === 'undefined') {
		parser = new DOMParser();
	}

	const xmlDoc = parser.parseFromString(
		`<${XML_WRAPPER}>${xmlString}</${XML_WRAPPER}>`,
		"text/xml"
	);

	if (!xmlDoc.firstChild || xmlDoc.firstChild.nodeName !== XML_WRAPPER) {
		throw new Error("Could not parse XML string")
	}

	return walk(xmlDoc.firstChild, replacements);
}

function walk<X>(node: Node, replacements: XmlReplacements<X>): (X | string)[] {
	// node has no children
	if (!node.childNodes || node.childNodes.length === 0) {
		return (
			replacements[node.nodeName]
			// node is a self-closing tag
			? [replacements[node.nodeName]()]
			// node is a string
			: [node.nodeValue || ""]
		);
	}
	// node is a tag with children
	const children: Node[] = Array.prototype.slice.call(node.childNodes);
	const replacedChildren = children.reduce<(X | string)[]>(
		(acc, child) => [...acc, ...walk(child, replacements)],
		[]
	);

	return replaceFunction(node.nodeName, replacedChildren, replacements)
}

function replaceFunction<X>(name: string, children: (X | string)[], replacements: XmlReplacements<X>): (X | string)[] {
	return (
		replacements[name]
		? [replacements[name](...children)]
		: children
	);
}
