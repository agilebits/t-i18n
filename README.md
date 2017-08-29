# T-i18n

Simple, standards-based localization. Just one `T` away.

### Get started

Just wrap your user-facing strings in `T`. Don't worry about IDs.

```js
// Import T as a singleton
import {T} from "t-i18n"

T("Hello world")
```

Extract the strings from your code:

`extract-strings ./src/**.ts messages.en.json`

Translate the JSON files:

```js
// messages.es.json
{
    "hello-world": "Hola mundo"
}
```

Then pass the translations to `T` and set the locale.

```js
T.setup({
    locale: "es",
    messages: {
        en: englishJSON,
        es: spanishJSON
    }
})
```

And that's it. You're localized.

### What else you can do

```js
// Replace values
T("Hello, {name}", {name: "Jony Ive"})

// Even React components!
T.$("There's a <myButton /> in my text!", {
    myButton: <button>button</button>
})

// Pluralize
import {Plural} from "t-i18n"

T("You have " + Plural("numCats", {
    zero: "0 cats",
    one: "1 cat",
    other: "# cats",
}), {numCats: 4})

// Get a localized, formatted date
T.date(Date.now(), "short")

// Or a number
T.number(5, "currency")
```