// Messages functions have replacement/pluralization logic baked in
// Use a tool like MessageFormat to generate these from strings
//
// const mFunc = (name) => "Hello, " + name
// mFunc("Mitch") // "Hello, Mitch"
//
export type MFunc =  (replacements?: Replacements) => string;
// Function to compile strings into message functions during runtime
export type Compiler = (message: string) => MFunc;



// Message functions are grouped by locale and keyed to IDs
//
// {
// 	 en: {
//		 "greeting": (name) => "Hello, " + name
//	 }
// }
//
export interface Messages {
	[s: string]: {[s: string]: string|MFunc}
}

export interface SetupOptions {
	messages?: Messages;
	locale?: string;
	idGenerator?: (message: string) => string;
	compiler?: Compiler;
}

// { name: "Mitch", age: 10 }
export interface ReplacementsMap {
	[s: string]: string|number
}

export type Replacements = ReplacementsMap | null;

// React
export type ReactFactory = [React.Factory<any>, React.Props<any>];

export interface ReactReplacementsMap {
    [s: string]: ReactFactory | React.ReactNode | JSX.Element | string | number
}

export type ReactReplacements = ReactReplacementsMap | null;