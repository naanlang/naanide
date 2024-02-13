NaanIDE Remote Control
-----
This guide explains how to control NaanIDE from the command line.

The `naanide` command line tool launches the IDE by default. It can also be used to remote control both the NaanIDE server and the browser tabs.

#### Introduction

Launch an IDE browser tab on the NaanIDE server, then contact it and show a browser alert. The first command launches the server and browser. The second command waits for the user to dismiss the alert before continuing, if the browser tab is frontmost.

In the first terminal window:

```
naanide
```
In a different terminal window:

```
naanide -e 'App.nidecon.remote(App.nidecon.clients().0).1.evalq(js.w.alert("hi"))'
```
Here `-e` evaluates an expression, which is explained as follows:

1. `App.nidecon.clients()` returns an array of *clientID* guids. The `.0` selects the first element, which is the browser tab we just opened.
2. `App.nidecon.remote(clientID)` is a procedure that connects to a *clientID* for remotely evaluating an expression, returning a (*error*, *context*) tuple. It is defined in the `nidecon` NaanIDE CONtroller, which is available on the `App` global. The `.1` selector selects the *context* in the returned tuple.
3. *context*`.evalq(*expression*)` remotely evaluates *expression* in the context of the brower. Arguments and result are implicitly marshalled/unmarshalled across the link.
4. The expression `js.w.alert` obtains the JavaScript `alert` function, where `js` is Naan's JavaScript global, and `js.w` is the browser window object. This is applied to the argument "hi" to open the alert.

A full description of Lingo language is beyond the scope of this document. Please the Docs tab in NaanIDE for detailed information.

#### Examples

NaanIDE is installed with sample remote control scripts in its Examples folder.

For MacOS/Linux:

```
cd `npm config get prefix`/lib/node_modules/@naanlang/naanide/examples
```
For Windows:

```
cd %AppData%\npm\node_modules\@naanlang\naanide\examples
```

#### Remote control script idecon_debug

This script provides a useful testbed for writing remote control scripts. If an existing NaanIDE server is running then it will connect to it. Otherwise it will start a new server. Either way it will print a list of example expressions and then begin an interactive REPL so you can try them.

```
naanide idecon_debug.nlg
NaanIDE Server started:
{
    guid  : "edb89635-3712-4fbc-89c2-b125f7dc51dc",
    port  : 8008,
    host  : "localhost:8008",
    oururl: "http://localhost:8008/nide.html?guid=edb89635-3712-4fbc-89c2-b125f7dc51dc" }
""
Play-lingo> _
```




