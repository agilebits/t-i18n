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
    "hello-world": "Hola mundo"
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

Formatting is provided courtesy of the [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API built in to modern browsers.

```
// Get a localized, formatted date
T.date(Date.now(), "short")

// Or a number
T.number(5, "currency")
```

Formatters cache themselves automatically, so you don't have to.

### Replacements and pluralization

`T` accepts a second parameter for replacements, but it doesn't anything with them by default. You can either pass a `compiler` function to `T.setup`, or, preferably, [precompile your translations](https://messageformat.github.io/build/). This will make your bundle much smaller and more performant.

Assuming your messages are compiled with an [ICU](https://formatjs.io/guides/message-syntax/)-compliant tool:

```js
// Replace values
T("Hello, {name}", {name: "Jony Ive"})

// Pluralize
import {Plural} from "t-i18n"

T("You have " + Plural("numCats", {
    zero: "0 cats",
    one: "1 cat",
    other: "# cats",
}), {numCats: 4})
```

### Speak React

`T.$`replaces React components in your translations, denoted by XML placeholders. It returns an array of React components which you can use inside any other component.

```js
    render() (
        <div>
        {
            T.$("There's a <myButton /> in my text!", {
                myButton: <button>button</button>
            })
        }    
        </div>
    )

```

If your React components have string children, you can even translate them inline. In your replacements, pass an array with a [React factory](https://facebook.github.io/react/docs/react-api.html#createfactory) and optional props.

```js
T.$("This is a <strong>very important</strong> message.", {
    strong: [React.createFactory("strong")]
});

// With props
T.$("<link>Visit your profile</link> to change your profile picture.", {
    link: [React.createFactory("a"), { href: "/user/" + user.uuid }]
})
```

The best part? `T-i18n` does all this without having _any React dependencies_ aside from typings.
