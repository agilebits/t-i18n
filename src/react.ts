import { ReactReplacements, ReactFactory } from "./types";

function walk(node: Node, replacements: ReactReplacements): React.ReactNode {
    const children = node.childNodes;
    // node has no children
    if (!children || children.length === 0) {
        // node is a self-closing tag or string
        return replacements[node.nodeName] || node.nodeValue;
    }
    // node is a tag with children
    const reactChildren: React.ReactNode[] = Array.prototype.slice.call(children).map(child => walk(child, replacements));
    return replaceReactFactory(node.nodeName, reactChildren, replacements)
}

function replaceReactFactory(name:string, children:React.ReactNode[], replacements: ReactReplacements) {
    const [factory, props] = replacements[name] as ReactFactory;
    return factory(props, ...children);     
}

let parser: DOMParser;
export default function parseReact(xmlString: string, replacements: ReactReplacements): React.ReactNode[] {
	if (typeof parser === 'undefined') {
		parser = new DOMParser();
	}

	const xmlDoc = parser.parseFromString("<span>" + xmlString + "</span>", "text/xml");
	if (xmlDoc.firstChild.nodeName === "parseerror") {
		throw new Error("Could not parse XML string")
    }

    const topLevelElements = Array.prototype.slice.call(
        xmlDoc.firstChild.childNodes
    );
    return topLevelElements.map(element => walk(element, replacements))
}