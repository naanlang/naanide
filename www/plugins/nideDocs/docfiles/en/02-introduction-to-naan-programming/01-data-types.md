Naan Data Types
-----
This guide introduces the fundamental Naan datatypes.

### Scalar Types

#### Numerics

Naan integers and floats are distinct data types, unlike JavaScript. The main reason for keeping them separate is that integers are exact and have no fixed size limit, while floats are approximate and have a large, but limited range of values. Integers are best for digital semantics like counting discrete objects, while floats are ideal for analog semantics like generating graphics or recording values that arise in the real world. Using floats where integers are needed is a fertile source of defects in computers software.

Both integers and floats can use JavaScript class and instance methods, such as `.isNaN()` and `.isSafeInteger()`. One can list available methods with the key-enumeration operator `.*`:

```
Play-lng> Number.*
$: ("length", "name", "prototype", "isFinite", "isInteger", "isNaN",
    "isSafeInteger", "parseFloat", "parseInt", "MAX_VALUE", "MIN_VALUE",
    "NaN", "NEGATIVE_INFINITY", "POSITIVE_INFINITY", "MAX_SAFE_INTEGER",
    "MIN_SAFE_INTEGER", "EPSILON")
   
Play-lng> Number.prototype.*
$: ("constructor", "toExponential", "toFixed", "toPrecision", "toString",
    "valueOf", "toLocaleString")
```
The `Math` operators are also available, such as `Math.abs(x)` and `Math.cos(x)`

#### integer

Naan integers use unlimited-precision signed bigint arithmetic. The usual inbuilt arithmetic is available including bitwise operations. Like all Naan scalars, integers are immutable.

Naan uses [Euclidean division](https://en.wikipedia.org/wiki/Euclidean_division) and modulo, so the result of `modulo(dividend, divisor)` is always positive and periodic through zero.

Division by zero throws an exception. Arithmetic operations on non-numeric data return false, though hooks are available for custom processing of non-scalar data types.

Integer constants may be specified as decimal, in the current radix of a `textstream`, or as hexadecimal constants of arbitrary length with a `0x` prefix. Integer constants must not include a `.0` suffix or they will become a float.

#### float

Naan floats are just JavaScript numbers. Arithmetic operations combining floats and integers result in a float, even if it overflows to Infinity. Float constants can use any format supported by JavaScript, however there must be a digit after the decimal point:

```
1				// valid integer
3333			// valid integer
1.0				// valid float
3.333			// valid float
1.				// invalid

```

#### string

Naan strings are just JavaScript strings. All of the usual `String` class and instance methods are available:

```
Play-lng> String.*
$: ("length", "name", "prototype", "fromCharCode", "fromCodePoint", "raw")

Play-lng> String.prototype.*
$: ("length", "constructor", "anchor", "big", "blink", "bold", "charAt",
    "charCodeAt", "codePointAt", "concat", "endsWith", "fontcolor",
    "fontsize", "fixed", "includes", "indexOf", "italics", "lastIndexOf",
    "link", "localeCompare", "match", "matchAll", "normalize", "padEnd",
    "padStart", "repeat", "replace", "replaceAll", "search", "slice", 
    "small", "split", "strike", "sub", "substr", "substring", "sup", 
    "startsWith", "toString", "trim", "trimStart", "trimLeft", "trimEnd",
    "trimRight", "toLocaleLowerCase", "toLocaleUpperCase", "toLowerCase",
    "toUpperCase", "valueOf", "at")
```
String constants allow either `'` or `"` delimiters. Adjacent string constants will be automatically coalesced into a single string, but you must use `\` to combine strings across newlines. _Note: the `\` escape for newlines between strings is not currently enforced by Lingo, but it will be soon._

Please see [JavaScript Interoperability](#javascript-interoperability) below an example of Regular Expressions.

### symbol

A Symbol (aka "variable" in many languages) is a named identifier having associated data cells, which are mutable unless otherwise noted:

- A _value_ that defaults to the symbol itself,
- A _procedure_ that is used when the symbol appears in a call context,
- _Annotations_, which are key/value pairs for that specific symbol,
- An immutable _print name_, which is how the symbol is typed and printed, and
- An immutable namespace reference described later.

#### symbol values

Evaluating a symbol returns the contents of its value cell:

```
Play-lng> a
$: a

Play-lng> a = 3
$: 3

Play-lng> a
$: 3

Play-lng> a = `a
$: a

```
The Naan _quote_ character \` suppresses evaluation of its argument, so instead of getting the value of `a`, you get `a` itself.

#### named procedures

Executing a named procedure uses the procedure cell of the symbol:

```
Play-lng> a = 5
$: 5

Play-lng> function a(x) { x * 2 }
$: a

Play-lng> a(4)
$: 8

Play-lng> a
$: 5

Play-lng> a.proc
$: false

Play-lng> `a.proc
$: function a(x) {
    x * 2
}
```
The expression `a.proc` evaluates `a` and then retrieves the procedure cell from the resulting symbol. In this case the symbol has a value, so this attempted to retrieve a procedure cell from the integer `5`. The second attempt quotes `a` to retrieve the procedure cell from the symbol itself. Please see [Dereference Operators](2. Dereference Operators.md) for further information.

Because Naan allows symbols to have separate value and procedure cells, it is possible to use common identifiers like `length` as both a variable and as a function name `length(x)` without conflict.

#### symbol annotations

Symbols (and some collections) can be _annotated_ with additional information in the form of an annotation dictionary. This is similar to a LISP _property list_. Please see Annotations Operators in [Dereference Operators](2. Dereference Operators.md) for further information.

#### typing symbols

When typed, symbols are automatically delimited by a set of _break characters_ such as spaces and punctuation. Break characters make it possible to type expressions without spaces. For example, `a+b` is the three symbols: `a`, `+`, and `b`.

The default set of breaking characters is the following, plus space and newline. Note that `$` (dollar-sign) and `_` (underscore) are not a breaking characters.

```
    ! @ ^ & * ( ) + - = { } [ ] | \ : ; ' < > ? , . / ~ ` %
```

The special nature of a character may be suppressed by prefixing it with the `\` (backslash) character. For example, one can type `a\+b` for the single symbol `a+b`. The `#` (hash) character is not a breaking character but it also supresses breaking of the next character while remaining part of the symbol. It is used for constants like `#e` and `#pi`, and for references like `operator#+`. 

Certain predefined combinations of punctuation are used together and form a single symbol that breaks from prior or subsequent characters. The following are the default set of combinations:

```
    ::   ++   --   ~=   ..   ->   ==   !=   <=   >=   =?   =!
    +=   -=   *=   /=   %=   /.   ||   &&   ^^   >>   <<   **
    .*   @[   @*   ;;   ;>   ===  !==  ...  ..<  <=>
```

### Collections

Naan provides a variety of collection types as described in the following paragraphs.

#### tuple

Naan tuples are collections of any kind of object, like the list structures of LISP. Naan tuples are immutable, acyclic, and can share common sub-expressions. Because tuples are DAGs it is relatively easy to write algorithms to traverse them, e.g. without the risk of infinite recursion.

A frequent use of tuples in Naan is as S-expressions, which are evaluated by the Naan interpreter. Expressions such as function calls and procedures are represented by tuples. For example, a function to double the size of its argument has two representations, the source expression and the S-expression:

```
Play-lng> function f(x) { x * 2 };		// type the source code
$: f

Play-lng> f.proc;
$: function f(x) {                      // print the source code
    x * 2
}

Play-lng> f.proc;>
$: (function f (x) (* x 2))				// print the S-expression
```

Evaluation is well-defined for every possible tuple, but of course that doesn’t mean that every possible tuple is useful when evaluated.

Like LISP lists, Naan tuples are comprised of ordered pairs, comprising a `car` cell and a `cdr` cell. A sequential list is constructed from the end, so that the car cell of each pair is the value of that element in the list, and the cdr cell points to the next pair, until the end of the list. Anything that is not one of these ordered pairs is called an _atom_. Tuples end when the cdr cell point to an atom. Normally that atom is `false` and the list just ends. But you can also end with another atom, forming a dotted pair. This capability is rarely used in Naan.

_Important: A valid tuple has at least one element. If you remove the last element from a tuple it becomes false._

Tuples are constructed with similar functions to LISP. For example:

```
Play-lng> cons(1)
$: (1)

Play-lng> cons(2,$)
$: (2, 1)

Play-lng> cons(5, `(4,3), $)
$: (5, (4, 3), 2, 1)

Play-lng> list(1, `(2,3), 4, 5)
$: (1, (2, 3), 4, 5)

Play-lng> `(a, (b, c), d)
$: (a, (b, c), d)

```
Naan also has functions to select within tuples:

```
Play-lng> tulip = `(a, (b, c), d)
$: (a, (b, c), d)

Play-lng> cdr($)
$: ((b, c), d)

Play-lng> car($)
$: (b, c)

Play-lng> tulip.1.1
$: c
```
The `tuple.1.1` expression demonstrates _dereferencing_ a tuple, where the indexes start from zero. Each `.1` term scans along the tuple returning the _nth_ element, evaluated left to right.

Treating a tuple as a DAG, each node in the DAG has a unique corresponding path from the root where the path is a series of integers. The advanced Naan function `tuplepath` computes the path between a given node and root, which can be used to identify peer nodes in homeomorphic graphs.

#### array

Naan arrays are effectively the same as JavaScript arrays, except that Naan arrays can contain both Naan and native JavaScript data types. All of the `Array` instance methods are available for Naan arrays, such as `.sort()` and `.concat()`.

```
Play-lng> [1, 9, 4, 2, 3].sort()
$: [1, 2, 3, 4, 9]

Play-lng> [1, 9, 4, 2, 3].sort(function(a, b){ -(a <=> b) })
$: [9, 4, 3, 2, 1]

Play-lng> [a,b,c].concat([3,4,5])
$: [a, b, c, 3, 4, 5]

Play-lng> $.length
$: 6
```

#### dictionary

Naan dictionaries are hash tables based on JavaScript objects, however they do not have any inheritance and there are no pre-defined keys. Each dictionary stands alone. Keys are strings, so although you can specify integers or floats, they are converted to strings.

Important functions are dictionaries include the following:

```
Play-lng> dd = {a:3, b:4}
$: { a: 3, b: 4 }

Play-lng> length(dd)
$: 2

Play-lng> keys(dd)
$: ("a", "b")

Play-lng> dd.*
$: ("a", "b")

Play-lng> ee = new(dd)						// make a new copy
$: { a: 3, b: 4 }

Play-lng> ee.c = 5
$: 5

Play-lng> ee
$: { a: 3, b: 4, c: 5 }

Play-lng> dd
$: { a: 3, b: 4 }
```
Dictionaries also support annotations, and namespace-based write protection as described below.

#### object

Naan objects are a specialized variant of dictionaries with additional capabilities:

- objects can have inheritance chains from parent objects
- objects can delegate undefined keys to a meta-object and its parents
- you can define an unknown key handler for an object
- you can define property setters and getters on an object
- an object can have an associated closure for OOP

#### nonce

Naan's nonce datatype provides core functionality for managing concurrency. A nonce provides:

- a condition variable that can be waited and signaled
- communications with futures
- transient storage for Naan's persistent execution

A nonce is allocated with `new(nonce)` or implicitly returned when a future is created. A nonce is a Naan dictionary, so the participant code can store any additional information needed for communication.

For details about the nonce data type, please see the document [Async & Concurrency](3. Async & Concurrency.md)

#### weakmap

The Naan weakmap type is identical to the JavaScript WeakMap. It is a set of key/value pairs where the key and value are arbitrary Naan objects. This differs from Naan objects and dictionaries which use a string as the key. Weakmap keys can be objects that can be garbage collected if no other references exist.

When a value `v` is stored under a key `k` then that value can only be retrieved with an identical key. For example:

```
Play-lng> wm = new(weakmap)
$: [object WeakMap]

Play-lng> tt = `(a,b,c)
$: (a, b, c)

Play-lng> wm[tt] = 4
$: 4

Play-lng> wm[tt]
$: 4                                    // found

Play-lng> wm[`(a,b,c)]
$: false                                // not found

Play-lng> tt == `(a,b,c)
$: true                                 // they look the same

Play-lng> tt === `(a,b,c)
$: false                                // not strictly equal
```
As seen above, `false` is returned when a key is not defined in a weakmap. The keys of a weakmap cannot be enumerated.

#### namespace

Naan namespaces provide isolation between unrelated modules while still allowing them to cooperate within a running Naan instance. Key namespace principles include:

- Minimize the number of reserved symbol names
- Optionally inherit symbols from other namespaces
- Execute code within the namespace of its definition
- Prevent code from modifying other namespaces
- Share data structures as writable or read-only to other namespaces
- Create and delete namespaces

Each namespace has an arbitrary string or numeric identifier, but there is no inbuilt hierarchy or guarantee of unique names. The inbuilt Naan module system is built on namespaces and imposes its own organization with a single array of unique names, but other namespaces exist separately.

The Naan interpreter and its runtime library define namespaces **core** and **root**. The namespace **Play** is provided as a starting point for additional definitions. The normal _Play_ configuration is to inherit from _core_ and utilize _root_ inbuilt functions by reference.

For example, the `car` and `cdr` functions introduced earlier are defined in _root_ and can be accessed from any namespace without inheritance, or freely redefined within each namespace. In contrast the `function` symbol is defined within _root_ and must be inherited to be used, because the interpreter uses this to identify executable code. It cannot be redefined.

Namespaces can be created at any time and persist until explicitly deleted. For example:

```
Play-lng> abc=123                       // assign variable in namespace Play
$: 123

Play-lng> new(namespace, "green")       // create new active namespace
$: Namespace<green>

green-lng> abc                          // prompt shows active namespace
$: 123                                  // abc inherited from Play

green-lng> abc=456                      // assign variable in Play
==> error: can't modify Play::abc from green

green-lng> def=123                      // assign variable in green
$: 123

green-lng> nsactive()                   // tuple of active namespaces
$: (Namespace<green>, Namespace<Play>, Namespace<NaanCore>)

green-lng> delete($.0)                  // delete first member of tuple
$: false

Play-lng> nsactive()                    // green no longer exists
$: (Namespace<Play>, Namespace<NaanCore>)
```

### JavaScript Interoperability

Naan has nearly transparent interoperability with native JavaScript types. All JavaScript datatypes may be imported to Naan with full fidelity using either conversion or encapsulation. However, some Naan datatypes cannot be losslessly exported to JavaScript. Naan's frameworks include packaging features to maintain Naan semantics during communication and storage.

#### Well-known JavaScript Objects

Naan has special support for the following well-known JavaScript Objects. These are global symbols within Naan and have the same functionality in Naan as in JavaScript. Note that `new` is not required with these objects.

* `Math`
* `Number`
* `String`
* `Date`
* `RegExp`
* `Array`
* `Promise`

Equivalent types are automatically converted between the environments. JavaScript integers become Naan integers, and other numeric JavaScript values become Naan floats. Strings are identical in both environments. For example:

```
Play-lng> Math.cos(0.0)
$: 1

Play-lng> typeof($)
$: integer

Play-lng> Math.log(0) 
$: -Infinity

Play-lng> typeof($)
$: float
```
JavaScript objects that have no local equivalent are encapsulated within Naan to preserve full fidelity while still allowing free creation and manipulation. For example:

```
Play-lng> Date()                        // new is not used
$: [Date Sat Jul 30 2022 16:37:46 GMT-0700 (Pacific Daylight Time)]

Play-lng> Date.parse("2/15/2019")
$: 1550217600000                        // integer milliseconds

Play-lng> RegExp("a(.*)b","g")
$: [RegExp /a(.*)b/g]

Play-lng> $.exec("a234b")
$: [Array a234b,234]
```

#### xobject (encapsulated JavaScript objects)

Encapsulated JavaScript datatypes have the Naan type `xobject` and are printed in the REPL as [_type_, _value_] as shown in the following example:

```
Play-lng> String("my text")
$: [String: my text]                    // encapsulated JavaScript string

Play-lng> typeof($)
$: xobject                              // encapsulated e[x]ternal[object]

Play-lng> Array(3,4,5)
$: [Array 3,4,5]                        // encapsulated JavaScript array

Play-lng> [3,4,5]
$: [3, 4, 5]                            // native Naan array

```

Imported JavaScript data is not automatically converted to Naan's native formats to avoid unnecessary overhead. The `new` builtin function can be used when deep import conversion is desired:

```
Play-lng> jsob = xnew({a:3,b:4})        // new JS object
$: [object Object]                      // contents encapsulated

Play-lng> jsob.*                        // list the keys
$: ("a", "b")

Play-lng> new(jsob)                     // deep import as a Naan dictionary
$: { a: 3, b: 4 }
```

#### JavaScript Globals

Naan does not automatically import JavaScript globals, but the Naan global `js` provides access to the JavaScript world from within the Naan environment.

_Browser Example:_

```
Play-lng> js.w
$: [object Window]

Play-lng> js.g
$: undefined
```

_Node Example:_

```
Play-lng> js.w
$: undefined

Play-lng> js.g
$: [object global]
```
In the examples above, `undefined` is returned for unknown keys because `js` is a JavaScript object. Naan dictionaries return `false` for undefined keys.

JavaScript global constructors often require `new` to create an object of the applicable type. Naan provides a special function `xnew` for this purpose:

```
Play-lng> xnew(js.w.Uint8Array, [3,4,5]) 
$: [Uint8Array 3,4,5]
```

#### Functions

Naan functions can be exported as callback function arguments to JavaScript methods, and JavaScript functions may be passed to and called directly from Naan. For example:

```
Play-lng> [3,4,5].map(function(item){ print(item) })
345
$: [3, 4, 5]

Play-lng> js.w.setTimeout(function(){printline("done")},1000);
$: 7598
Play-lng> done

Play-lng> jseval = js.w.eval
$: [Function eval]

Play-lng> jseval("4+3")
$: 7
```
