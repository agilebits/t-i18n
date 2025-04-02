const XML_WRAPPER = "wrap";
let parser;
export default function parseXml(xmlString, replacements) {
    if (typeof parser === "undefined") {
        parser = new DOMParser();
    }
    const xmlDoc = parser.parseFromString(`<${XML_WRAPPER}>${xmlString}</${XML_WRAPPER}>`, "text/xml");
    if (!xmlDoc.firstChild || xmlDoc.firstChild.nodeName !== XML_WRAPPER) {
        throw new Error("Could not parse XML string");
    }
    return walk(xmlDoc.firstChild, replacements, true);
}
const NODE_TYPE_ELEMENT = 1;
const NODE_TYPE_TEXT = 3;
function walk(node, replacements, isRoot = false) {
    if (node.nodeType === NODE_TYPE_TEXT) {
        return node.nodeValue ? [node.nodeValue] : [];
    }
    else if (node.nodeType === NODE_TYPE_ELEMENT) {
        const children = Array.prototype.slice.call(node.childNodes);
        const replacedChildren = children.reduce((acc, child) => [...acc, ...walk(child, replacements)], []);
        return isRoot || !replacements[node.nodeName]
            ? replacedChildren
            : [replacements[node.nodeName](...replacedChildren)];
    }
    else {
        return [];
    }
}
