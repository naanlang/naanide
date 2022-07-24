The Namespace Datatype
-----

Naan namespaces provide isolation between unrelated modules while still allowing them to cooperate within a running Naan instance. Key goals for namespaces include:

- Minimize the number of reserved symbol names
- Optionally inherit symbols from other namespaces
- Execute code within the namespace of its definition
- Prevent code from modifying other namespaces
- Share data strucures as writable or read-only to other namespaces
- Create and delete namespaces

Each namespace has an arbitrary string or numeric identifier, but there is no inbuilt hierarchy or guarantee of unique names. The inbuilt Naan module system is built on namespaces and imposes its own organization with a single array of unique names, but other namespaces exist separately.

The Naan interpreter and its runtime library utilize two namespaces, **core** and **root**. The namespace **Play** is provided as a starting point for additional definitions.

### core namespace

The _core_ namespace comprises some 65 symbols including constants, type names, special forms, JavaScript types, and various literal aliases. In some cases the interpreter requires a core symbol to access corresponding functionality. For example, only the core symbol `false` evaluates to a boolean false. Creating a symbol with the same name will evaluate non-false.

```
Play-lng> !false
$: true                                 // negate false

Play-lng> myfalse = unintern("false");
$: false                                // looks false

Play-lng> !myfalse
$: false                                // negation is false

Play-lng> myfalse
$: false                                // still looks false
```

### root namespace

The _root_ namespace comprises some 180 symbols that are mostly inbuilt functions forming the building blocks of additional software. For example, like most LISP dialects Naan has `car` and `cdr` functions to access the elements in a tuple pair, as well as the concatenations of these like `cadr` (which returns the second element of a tuple-based list.)

In general, _core_ symbols may not be modified in a namespace, while _root_ symbols acquire the default functionality but may also be overridden if desired.
