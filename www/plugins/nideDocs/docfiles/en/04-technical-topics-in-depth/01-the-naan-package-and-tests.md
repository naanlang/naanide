Naan package - tests & anatomy
-----
The Naan NPM package includes over 1500 unit tests of the interpreter and its inbuilt core runtime functions. This guide explains how to run these tests, the anatomy of the Naan packaage, and how to view the source code for the tests.

### Running the tests

We will install a copy of Naan from the NPM registry into a testing folder and run tests there. This makes its path easy to find and allows us to make changes without affecting the shared global package.

Execute the following commands on Windows:

```
C:\projects\onramp> mkdir testing
C:\projects\onramp> cd testing
C:\projects\onramp> npm install @naanlang/naan
```
You should see in response:

```
added 1 package, and audited 2 packages in 1s
found 0 vulnerabilities
```

Now start the tests with:

```
C:\projects\onramp\testing> npm test --prefix node_modules\@naanlang\naan

> @naanlang/naan@1.0.2 test
> node test/node_test.js

Running Naan unit test suite
============================
              core: 512 of 512 tests ran successfully in 2.137 seconds
           context: 169 of 169 tests ran successfully in 1.677 seconds
         JSinterop:  58 of  58 tests ran successfully in 0.348 seconds
          numerics: 302 of 302 tests ran successfully in 1.213 seconds
           strings:  24 of  24 tests ran successfully in 0.096 seconds
       Lingo parse: 172 of 172 tests ran successfully in 0.990 seconds
             Lingo: 323 of 323 tests ran successfully in 1.364 seconds
============================
 1560 tests in 7.825 seconds
 1560 succeeded
    0 failed
```

### Anatomy of the Naan package

Change the current working directory to the package root:

```
C:\projects\onramp\testing> cd node_modules\@naanlang\naan\
C:\projects\onramp\...\node_modules\@naanlang\naan> dir

04/11/2022  05:13 PM    <DIR>          bin
04/11/2022  05:13 PM    <DIR>          dist
04/11/2022  05:13 PM    <DIR>          frameworks
04/11/2022  05:13 PM    <DIR>          lib
04/11/2022  05:13 PM             1,137 LICENSE.md
04/11/2022  05:13 PM               399 package.json
04/11/2022  05:13 PM    <DIR>          plugins
04/11/2022  05:13 PM             2,789 README.md
04/11/2022  05:13 PM    <DIR>          test

```
Here is a brief description of the top-level directories:

| folder     | purpose                               |
| :--------- | :------------------------------------ |
| bin        | NodeJS-resident Naan startup code     |
| dist       | Browser-resident Naan startup code    |
| frameworks | Naan inbuilt frameworks               |
| lib        | JavaScript and Naan core runtime code |
| plugins    | optional services and integrations    |
| test       | core unit tests                       |


### Unit test source code

Change the current working directory to test:

```
C:\projects\onramp\...\node_modules\@naanlang\naan> cd test
C:\projects\onramp\...\node_modules\@naanlang\naan\test> dir

04/11/2022  05:13 PM             9,377 harness.nlg
04/11/2022  05:13 PM               587 node_test.js
04/11/2022  05:13 PM            28,766 test_01_core.nlg
04/11/2022  05:13 PM            15,494 test_02_context.nlg
04/11/2022  05:13 PM             5,482 test_03_jsinterop.nlg
04/11/2022  05:13 PM            12,535 test_04_numerics.nlg
04/11/2022  05:13 PM             1,699 test_05_strings.nlg
04/11/2022  05:13 PM            21,758 test_06_lingoparse.nlg
04/11/2022  05:13 PM            24,774 test_07_lingo.nlg

```
Node begins execution of the tests with `node_test.js`, which instantiates the Naan interpreter and has it execute the code in `harness.nlg` that actually runs the tests and keeps track of failures.

The tests are divided into suites cover different aspects of Naan operation.

The **Core** suite covers:

- basic constants like `true`, `false`, and `undefined` with `and`/`or`
- _tuples_ ("lists" in LISP), dotted pairs, and their accessors, e.g. the famed `car` and `cdr`
- delta adjustments to numeric variables, supporting `+=` and `--` operators
- special operators like _quote_, _apply_, _cond_, and _body_
- _symbol_ features like annotations ("properties" in LISP)
- _function_ definitions and nested functions
- _object_ and _array_ datatypes
- other builtin functions not covered elsewhere

The **Context** suite covers:

- _namespace_ operations and access rights
- tail call optimization
- _closure_ instances and _object_ integration

The **jsinterop** suite covers integration between Naan and JavaScript, including:

- external objects and data conversion
- debugging hooks

The **numerics** suite covers:

- numeric representation
- bigint arithmetic: add, subtract, multiply, divide, modulo
- float arithmetic
- bigint / javascript buffer conversions
- bitwise logical operators: and, or, xor, not, shiftleft, shiftright
- JavaScript Number operations like isNaN and toPrecision
- numeric comparisons

The **strings** suite covers:

- string literals
- Naan string builtinds
- JavaScript string native functions

The **lingoparse** suite covers just the **Lingo** language parser. This converts Lingo's algol-like syntax to LISP S-expressions. Virtually all Naan code written so far is in Lingo. This suite was essential during the first bootstrap of the language, but is largely supplanted by the next suite.

The **lingo** suite covers the **Lingo** language semantics. Major sections include:

- coalescing adjacent strings and repeated logical operators
- object and dictionary operations
- weakmaps
- `!`, `===`, `!==`, and `<=>` operators
- annotations (like LISP properties)
- tuples, objects, and arrays
- ``+=`, `*=`, `-=`, `/=`, and both pre- and post- `++` and `--`
- `if`, `else if`, `else`, `cond`, `try`, `catch`, `finally`
- `while` and `for` loops
- procedure types `function`, `closure`, and `macro`
- control operators `return`, `break`, and `continue`
- unparsing S-expressions back into Lingo syntax
- method hooks
- dialects





