import { XmlReplacements } from "./types";
export default function parseXml<X>(xmlString: string, replacements: XmlReplacements<X>): (X | string)[];
