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

`extract-strings --outfile=messages.en.json ./src/**/*.ts`

Translate the JSON files:

```js
// messages.es.json
{
    "Hello-world": "Hola mundo"
}
```

Then load the translations, pass them to `T` and set the locale.

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

### Dates, times, and numbers

Formatting is provided courtesy of the [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API built into modern browsers.

```js
// Get a localized, formatted date
T.date(Date.now(), "short")

// Or a number
T.number(5, "currency")
```

Formatters cache themselves automatically, so you don't have to.

### Replacements

Basic values are easy to replace.

```js
// "First name: Wendy"
T("First name: {userName}", { userName: "Wendy"})
```

Non-string values (like React components) can be interpolated using an XML syntax.

```jsx
// ["There's a ", <button>button</button>, " in my text!"]
T.$("There's a <myButton /> in my text!", {
     myButton: () => <button>button</button>
})
```

If your components have string children, you can translate them inline.

```jsx
// [
//     <a href={"/user/" + user.uuid}>Visit your <strong>profile</strong></a>,
//     " to change your profile picture."
// ]
T.$("<link>Visit your <strong>profile</strong></link> to change your profile picture.", {
    link: (...children) => <a href={"/user/" + user.uuid}>{...children}</a>,
    strong: (...children) => <strong>{...children}</strong>,
})
```

## Pluralization and advanced ICU syntax

To get locale-aware pluralization, you should [precompile your translations](https://messageformat.github.io/build/) using an ICU-compliant tool. Then pass the compiled messages to `T.setup` instead of strings.

```js
// Pluralization with ICU syntax
T("You have { plural, numCats, =0 {0 cats} other {# cats} }", {numCats: 4})
```