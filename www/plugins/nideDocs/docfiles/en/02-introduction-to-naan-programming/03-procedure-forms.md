Procedures
-----
This guide describes procedures: functions, closures, and macros.

### Overview

Naan provides 6 procedure types ("special forms" in LISP):

- `function`
- `let`
- `closure`
- `macro`
- `function&`
- `let&`

Each of these forms can have a name, a parameter list, a local variables list, and a procedure body. Depnding on the form, the parameters and local variables utilize either lexical or dynamic binding, and either fixed or variable arguments. The following paragraphs describe the details.

### Functions

Functions are the most commonly used procedure type in Naan. Closures and macros are variations of functions, so much of this section applies to them as well.

A function definition comprises the symbol `function` followed by the name, arguments, and function body describing what the function actually does:

```
function example(param1, param2, local loc1, loc2) {
	// function body
}
```
A function is invoked with zero or more arguments, which are each evaluated and assigned to the function's parameters in left-to-right order. If there are more arguments than parameters the extra arguments are evaluated but ignored. If there are more parameters than arguments the remaining parameters are set to false.

After the parameters are initialized, local variables are assigned the value `false` and execution begins evaluating the function body. When body evaluation completes the the function returns the value of the last expression evaluated. If an exception occurs then the function never returns, and execution proceeds with the next try-catch handler on the call stack.

Functions employ lexical binding, so their parameters and local variables are only available to the code defined within the function itself. A symbol with the same name appearing in a different scope is a different symbol despite looking the same.
Functions may freely use global variables, i.e. those symbols that are not defined within the function and its parents.

Recursion is freely permitted. When a function is called recursively then the existing values of the parameters and local variables are saved, the new values assigned, and execution proceeds. Upon completion of that call then the previous values are restored to the parameters and local variables.

Naan implements proper [tail-call optimization](https://en.wikipedia.org/wiki/Tail_call) to minimize stack depth requirements.

#### Nested functions

Function definitions may be nested, in which case the inner function inherits the parameter and local variable symbols of its parent(s). The names of functions nested within a single parent must be unique.

The scope of the name of a nested procedure is the same as scope of the parameters and local variables of its parent: accessible within the parent and within its child procedures.

#### Lambda (anonymous) functions

It's useful for functions to have names because they can be called by name. However it's possible to omit the name and call the function by reference. Such functions are called _lambda_ functions, from the [Lambda Calculus](https://en.wikipedia.org/wiki/Lambda_calculus).

```
function(param1, param2, local loc1, loc2) {
	// function body
}
```
In Naan such functions do, in fact, have a name: `lambda`.

#### Variable arguments

The function definition syntax shown above requires that each potential argument have a corresponding parameter to capture its value. However it is sometimes necessary to allow a variable number of arguments, which is enabled by the following variation:

```
function example arguments {
	// function body
}
```
When this function is invoked, the arguments, if any, are accumulated into a tuple and bound to the parameter named `arguments`. Any number of arguments are accomodated. No local variables are allowed, so this may initially seem inconvenent. However the normal idiom is to include a nested function that does the actual work and has a fixed calling style. This enables any calling convention to be used.

For example, the following function accepts one fixed argument, _nth_, and a variable number of subsequent arguments. It returns the nth even number from the arguments.

```
Play-lng> function nthEven arguments {     // nthEven(nth, <numbers>...)
    function (nth, local trav) {           // return the nth even number
        for trav in arguments
            if trav.even && nth-- == 0
                return (trav)
        false
    } (pop(arguments))
}

Play-lng> nthEven(2, 6, 5, 2, 9, 4, 3, 8)
$: 4
```

#### Function references

A named function definition evaluates to the name of the function, and can be invoked by using that name in a calling context like `name()`.

A lambda function definition evaluates to itself, i.e. the S-expression tuple, and can be invoked by using that _value_ in a calling context.

A symbol that has no procedure binding can be used in a calling context, and the function to invoke is sought in the value of the that symbol, iterating until a function to invoke is found. This symbol is being used as a function pointer.

A function can be defined as data in a dictionary literal, in which case its definition is used whether or not named.

```
Play-lng> function v1() { 1 }
$: v1                                    // v1 is a named function

Play-lng> v2 = function() { 2 }
$: function () {                         // the value of v2 is a lambda function
    2
}
Play-lng> v3=v1                          // v3 has no function binding
$: v1

Play-lng> v1()                           // invoke v1
$: 1

Play-lng> v2()                           // invoke v2
$: 2

Play-lng> v3()                           // invoke v1
$: 1

Play-lng> fd = { v5: function() { 5 } }
$: {                                     // fd.v5 is a lambda function
    v5: function () {
        5
    } }

Play-lng> fd = { v5: function v5() { 5 } }
$: {                                     // fd.v5 is the v5 function definition
    v5: function v5() {
        5
    } }
```

### Let

Short functions are easier to test and debug, so in an ideal world there would never be a problem with defining all of a function's local variables at the top of the definition. However in the real world it is sometimes necessary to have large enough functions that defining all the related variables in one place becomes ugly. A _let_ form (or "let block") allows allocating local variables for only a subset of the function.

Let looks similar to an anonymous function with no parameters:

```
let (loc1, loc2) {
	// let body
}()
```
Evaluating a let sets its local variables to false and then evaluates the let body.

One important feature of let is that a `return` within a let passes through it to the enclosing function, closure, or macro. Let blocks are used to implement the `for`-`in` collection iterator where you would expect this from a nested return.

Note the vestigial `()` on the end that actually invokes the let. This will not be required in the next vesion of Lingo, which will also eliminate references to unexecuted let blocks--an experimental capability that did not prove useful. Also on the Lingo roadmap are explicit initializers for local variables.

### Closures

Closures provide a mechanism for unique and persistent context. The keyword `closure` introduces a procedure that creates instances when invoked. Each instance has its own copy of all parameters and local variables, including those of nested functions. Naan closures are explicit, in contrast to JavaScript where closures are created implicitly whenever nested functions are defined.

A common use of closures is to maintain context for callback functions, but they can also be useful for creating generators (aka "factory functions".) The following example is a factory. Calling `GenerateRooter` creates a rooter function that will compute square roots to a given tolerance using Newton's method.

```
Play-lng> closure GenerateRooter(tolerance, local rounder) {
    if !tolerance || tolerance < Number.EPSILON
        tolerance = Number.EPSILON                 // set floor on tolerance
    rounder = 1.0
    while rounder < tolerance
        rounder *= 10                              // round to fewer digits
    while rounder > tolerance
        rounder /= 10                              // round to more digits
    function rooter(n, local x, root) {
        x = n
        loop {                                     // square root by Newton's method
            root = 0.5 * (x + (n / x))
            if (Math.abs(root - x) < tolerance)
                break
            x = root
        }
        Math.round(root / rounder) * rounder       // reduce significant figures
    }
}
$: GenerateRooter

Play-lng> rt = GenerateRooter(0.01);;              // create a rooter, but don't print it
Play-lng> rt(5)
$: 2.24
Play-lng> $*$
$: 5.017600000000001
Play-lng> rt(1024*1024)
$: 1024.0

Play-lng> rc = GenerateRooter(100);;              // create a coarse rooter
Play-lng> rc(1024*1024)
$: 1000.0                                         // fast, if inaccurate
```
The GenerateRooter function above computes the necessary rounding factor only once when the rooter is generated. After that the rooter function is executed with only minimal calculations required. This is an example of "factoring out" processing with factories.

Please also see [Async & Concurrency](4. Async & Concurrency.md) for more examples of using closures.

### Macros

Naan macros are used as call-by-name functions that operate on the arguments without evaluation. Naan macros are hygienic, meaning that the parameter names within the macro do not conflict with the names passed to the macro.

(In LISP dialects, macros are used to extend the language. Naan has a different mechanism for that called _Dialects_ that helps resolve the challenge of incompatible syntax variations arising from custom macros.)

While macros are not widely used they can be very convenient, especially for instrumenting code. The following macro computes the time required to evaluate an expression:

```
Play-lng> macro time(expr, local start, value) {
    start = milliseconds()
    value = eval(expr)
    start = milliseconds() - start
    start /= 1000.0
    printline("time: evaluation required ", start.toFixed(3), " seconds")
    value
}
$: time

Play-lng: time(rt(5.0e+300))                      // rt is 0.01 rooter from above
time: evaluation required 0.001 seconds
$: 2.2360679774997896e+150

Play-lng> time(sleep(500))
time: evaluation required 0.504 seconds           // ~3 msec scheduling latency
$: true
```
In the example above, `expr` is the _unevaluated_ expression that is to be timed. The inbuilt `eval` function evaluates it according to normal Naan rules, in this case calling the `rt()` function.

### function& and let&

The `function` and `let` forms use lexical binding, so parameters and local variables are private to the function and any nested children. These `function&` and `let&` forms use dynamic binding instead.

With dynamic binding, the parameter symbols are shared with the surrounding environment. For the outermost function these are always global variables. While a `function&` is executing its shared parameters take on new values, and any function it calls will inherit those values _even if there is no lexical relationship between them._

Please consider these examples:

```
Play-lng> gg = 3
$: 3

Play-lng> function rando() {
    Math.random().toFixed(gg)                     // gg digits of random
}
$: rando

Play-lng> rando()                                 // 3-digit random number
$: "0.938"

Play-lng> function& long_rando(local gg) { gg = 6, rando() }
$: long_rando                                     // override gg while executing

Play-lng> long_rando()
$: "0.400855"                                     // 6-digit random number
```

Dynamic binding can be very useful in experimental programming when an algorithm's parameters are global variables that can be modified on the fly by other functions. It can also become a maintenance nightmare if these globals are widely referenced because the modifications are not lexically related.

In Naan one of the better use cases is nesting a dynamic`function&` inside of a normal lexically-bound function. This can be used to "inherit" values in a leaf function deep inside the call stack without requiring that every value be passed as an argument through all the intermediate functions. For example, in a tree traversal, each time a certain "container" node is encountered, recursive traversal can proceed through a `function&` that sets the context for transitive children. The resulting code can be considerably simplified, reducing maintenance effort.

The following contrived example can be coded other ways, but the benefit only increases with more parameters and node types.

```
// maxLayerDepth
//
// Given a tree with some nodes marked as "layers", compute the maximum depth
// of any non-layer node within its own layer.
//
function maxLayerDepth(root, local node, maxDepthThisLayer, maxDepthAnyLayer) {
    maxDepthAnyLayer = 0

    // Process a layer node and children with its own maxDepthThisLayer
    function& layerNode(node, local maxDepthThisLayer) {    // note the "&"
        maxDepthThisLayer = 0                         // now in new layer
        recurNode(node, 0)                            // traverse children and sublayers
        if maxDepthAnyLayer < maxDepthThisLayer
            maxDepthAnyLayer = maxDepthThisLayer
    }

    // Process a node of unknown type
    function recurNode(node, depth, local child) {
        if node.layer
            layerNode(node)                           // new layer below us
        else {
            if maxDepthThisLayer < depth              // inherited variable reference
                maxDepthThisLayer = depth
            for child in node
                recurNode(child, depth+1)
        }
    } (root, 0)                                       // <-- start tree traverse here
    maxDepthAnyLayer                                  // return our result
}
```
In the code above, `maxLayerDepth()` specifies `node` as a local variable so that `layerNode()` references that locally. Otherwise it would use the global `node`, which can lead to conflicts.
