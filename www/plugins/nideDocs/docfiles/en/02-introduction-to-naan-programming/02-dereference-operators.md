Dereference Operators
-----
This guide introduces the dereference operators that are essential using Naan data types.

### Dot and Subscript Operators `.` and `[]`

Dot and subscript retrieve a value from the _target_ on the left side using the _selector_ on the right side. They can be used with every Naan data type, though scalar types rarely use subscript.

Selectors can be integers, strings, or anything that evaluates to one of these. For example, when you provide a symbol as a selector its name is used as a string. Selectors in dictionaries are key strings, while selectors in arrays and tuples are index integers starting from zero.

The difference between the dot and subscript operators is that dot evaluates only the left (target) side, while subscript evaluates both the target and selector.

Here are some examples:

```
Play-lng> dd = { a:3, b: 4}
$: { a: 3, b: 4 }

Play-lng> dd.a
$: 3

Play-lng> dd.b
$: 4

Play-lng> dd.c                // the dictionary has no member with key "c"
$: false

Play-lng> s = "b"
$: "b"

Play-lng> dd.s                // the dictionary has no member with key "s"
$: false

Play-lng> dd[s]               // evaluating s gives us "b", which is a valid key
$: 4

Play-lng> aa = [1, 2, 3, 4, 5]
$: [1, 2, 3, 4, 5]

Play-lng> aa.1
$: 2

Play-lng> aa[dd.a]           // use value of "a" in dd as selector for array aa
$: 4
```
#### Listing Available Selectors

To list the keys of a dictionary, object, or nonce one can use the special `.*` operator. When applied to a dictionary-like object it returns a tuple containing all of the keys defined on that object. For example:

```
Play-lng> Naan.*
$: ("exec", "info", "symbol", "tuple", "number", "string", "array", "dictionary",
    "local", "host", "stdio", "external", "debug", "module", "runtimelib")

Play-lng>  Naan.info.*
$: ("procedure", "eq", "equal", "length", "not", "typeof") 
```
The global **Naan** dictionary is the "table of contents" that lists all available inbuilt functions. The Naan global is a dictionary of named categories. Within each named category are named functions.


#### Dictionary Lookups

Dereference operators only access data through selectors, and selectors are unique in all collections. To find data by value, one must utilize the appropriate technique for the specific collection type.

Finding a first datum in the top level of an array or tuple is simple with the inbuilt JavaScript array function _indexOf()_:

```
Play-lng> [1,2,3,4].indexOf(3)
$: 2

Play-lng> `(1,2,3,4).toarray.indexOf(3)
$: 2
```
It is slightly more complex to find the key for a datum within a dictionary. The following uses the inbuilt JavaScript array function _find()_ to perform a linear search over the list of keys in a dictionary:

```
Play-lng> function datalookup(dict, data) {
    dict.*.toarray.find(function(key) {
		dict[key] === data
    })
}
$: datalookup

Play-lng> datalookup({a:3,b:4}, 3)
$: "a"
```
#### Use with Naan Data Types

The dot and subscript operators work with all Naan datatypes. Here is an overview:

| data type           | functionality                                               |
| :------------------ | :---------------------------------------------------------- |
| integer             | JavaScript Number methods like `.toExponential()` `.isSafeInteger()` <br> Naan methods like `.negate` `.tofloat` `.integer` (`integer@*` gives a list)             |
| float               | JavaScript Number methods like `.isFinite()` `.isNaN()` `.isSafeInteger()` <br> Naan methods like `.negate` `.tofloat` `.integer` (`float@*` gives a list)          |
| string              | JavaScript string methods like `.concat()` `.split()` `.indexOf()` etc.<br> Naan methods like `.length`, `.unicode` `.append()` (`string@* gives a list`)        |
| tuple               | select _nth_ member for _n_ >= 0 or _rest_ after _n_ members for _n_ < 0<br>Naan methods like `.reverse` `.member()` and `.map()` (`tuple@*` gives a list) |
| array               | select the _nth_ element, or `false` for _n_ < 0, _n_ >= _length_ <br> JavaScript array methods like `.map()` `.concat()` and `.indexOf()` |
| dictionary<br>object<br>nonce<br>weekmap| return data element with specified key, or `false`            |

In most cases dereferencing a datatype with an undefined selector returns false. However dereferencing a numeric type with a numeric subscript throws an exception.

#### Use with JavaScript Data Types

These operators can also be used with JavaScript xobjects and their well-known globals:

| data type           | functionality                                               |
| :------------------ | :---------------------------------------------------------- |
| xobject    | follows JavaScript rules for subscripts and members<br> fields and methods for the specific object and its class/parent |
| Number.\*<br>Math.* | JavaScript numeric class methods like `Number.MAX_VALUE` and `Math.cos()`|
| String.\*           | JavaScript string class methods like `String.fromCharCode()` and `String.fromCodePoint()`|
| Date.\*             | JavaScript date class methods like `Date.now()` and `Date.parse()`|
| _date_.\*           | JavaScript Date instance methods like `toDateString()` and `getUTCDate()`|
|                     | All other JavaScript objects and arrays|

#### Symbols and the dot operator

When using the dot or subscript operators with symbols, it's usually advisable to quote the symbol so that the symbol value does not interfere with access. For example:

```
Play-lng> function f() { printline("hello world") }
$: f

Play-lng> f.proc                    // retrieve procedure binding
$: function f() {
    printline("hello world")
}

Play-lng> f = 5                     // f gets a value
$: 5

Play-lng> f.proc                    // trying to get procedure binding of 5
$: false

Play-lng> `f.proc                   // get procedure binding of f
$: function f() {
    printline("hello world")
}

```
#### Lookup, Assignment, and Execution

We have seen that dot and subscript can be used to look up selector values on targets, but they can also be used to assign values, and to execute procedures. For example:

```
Play-lng> ww= { f: function(x) { printline("racer ", x) }, v: 42 };
$: {
    f: function (x) {
        printline("racer ", x)
    },
    v: 42 }

Play-lng> ww.f(5)
racer 5
$: 5

Play-lng> ww.v = 6
$: 6

Play-lng> ww
$: {
    f: function (x) {
        printline("racer ", x)
    },
    v: 6 }
``` 
#### Naan System Selectors

Naan uses selectors (keys) starting with `.` for its own internal operations. For example, an Naan object's parent is stored in the object under the selector `.parent`. These are intentionally awkward keys to type because of the embedded `.` character, and it is advisable to avoid inventing similar names yourself.

### Annotation Operator @ ("at")

Symbols, collections (other than tuples), and xobjects can be _annotated_ with additional information in the form of an annotation dictionary. This is similar to a "property list" in LISP. Access annotations using the at operator with a selector just as a dictionary is accessed. Here are some examples:

```
Play-lng> dd = { a:3, b: 4}
$: { a: 3, b: 4 }

Play-lng> dd@joe = 5
$: 5

Play-lng> dd@joe
$: 5

Play-lng> dd@bob = 6
$: 6

Play-lng> dd@*
$: ("joe", "bob")
```
Although not often needed, you can use evaluated subscripts with annotations:

```
Play-lng> dd@him = "bob";
$: "bob"

Play-lng> dd@[dd@him];
$: 6
```

#### Naan's Internal use of Annotations

Naan uses symbol annotations extensively to keep track of the relationships between parent and child procedures, between closures and objects, etc. As with dictionaries, Naan-defined selectors begin with a `.` so please avoid creating names like this yourself.

Annotations are used to store information about procedures that is not executable but is relevant to how the procedure is used. In the following example the function `initialize()` should be called when the code is first loaded. Naan neeeds to record that fact for future loads. This is not strictly part of the procedure itself, so annotations provide a convenient place to track it.

```
Play-lng> function selfrun() {
	myglobal = 0
	printline("hi")
}()                                 // () immediately calls the definition
hi
$: "hi"

Play-lng> selfrun@*                 // list annotations
$: (".lingoInit", ".sourcemap")

Play-lng> selfrun@\.selfrun			// the \ turns . into an ordinary character
$: true
```

#### Utility of Dictionary Annotations

One might wonder about the utility, the purpose, of having annotations for dictionaries and objects. Why not store everything in the dictionary itself? An important use for dictionaries is managing external data using uncontrolled keys. For example, you might record every word from an input text stream into a dictionary with an associated count. You might also wish to store metadata with the dictionary, but there is no naming convention that would allow you to safely store it as a key without potentially conflicting with the unrestricted input stream. Absent annotations, how would you implement this?

- Use a fixed prefix to distinguish the external data, encapsulating all access inside of accessors, but this adds complexity. It also might make it more difficult to use general-purpose library routines. For example, iterating over the keyspace will return both data and metadata.
- Store the metadata adjacent to the dictionary and pass these around together as you use them. But this prevents use of a general-purpose library that doesn't know about your metadata. A callback specifying the dictionary will not include the metadata.
- Create an object that encapsulates both the dictionary and the metadata, with appropriate methods to mediate access to both. Or, in a statically typed language, create an object design that allows the library to work on a dictionary while your code works on a derived type of meta-dictionary. This is complex and not easily generalizable without generics, which makes it even more complex.

Or you can just use annotations for the metadata, which is more in line with the Naan goals of simplicity and dynamic, malleable design.

