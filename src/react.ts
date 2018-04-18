import { ReactReplacements, ReactFactory } from "./types";
import { notDeepEqual } from "assert";

function walk(node: Node, replacements: ReactReplacements   |null=null): React.ReactNode {
    const children = node.childNodes;
    // node has no children
    if (!children || children.length === 0) {
        // node is a self-closing tag or string
        if (replacements) {
            return replacements[node.nodeName] || node.nodeValue;
        } else {
            return node.nodeValue;
        }
    }
    // node is a tag with children
    const reactChildren: React.ReactNode[] = Array.prototype.slice.call(children).map((child: Node) => walk(child, replacements));
    return replaceReactFactory(node.nodeName, reactChildren, replacements)
}

function replaceReactFactory(name:string, children:React.ReactNode[], replacements: ReactReplacements|null = null) {
    if (!replacements) return null;

    const [factory, props] = replacements[name] as ReactFactory;
    return factory(props, ...children);     
}

let parser: DOMParser;
export default function parseReact(xmlString: string, replacements: ReactReplacements | null): React.ReactNode[] {
	if (typeof parser === 'undefined') {
		parser = new DOMParser();
    }
    
    const xmlDoc = parser.parseFromString("<span>" + xmlString + "</span>", "text/xml");
    
    
	if (!xmlDoc.firstChild || xmlDoc.firstChild.nodeName === "parseerror") {
		throw new Error("Could not parse XML string")
    }

    const topLevelElements = Array.prototype.slice.call(
        xmlDoc.firstChild.childNodes
    );
    return topLevelElements.map((element: Node) => walk(element, replacements))
}