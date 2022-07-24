Navigating the REPL
-----
This guide provides useful hints for using the Naan REPL.

### Basics

The Naan REPL (Read-Eval-Print Loop) is available in most locations where Naan is running. It starts with a banner when the interpreter first begins and then a prompt for user input:

```
Naan © 2018-2022 by Richard C. Zulch
Starting REPL for Lingo...

Play-lng>_
```

The prompt has two parts. **Play** indicates that the scope of the REPL is the _Play_ namespace. The **-lng** suffix declares that the current language is _Lingo_.

Normally the expressions you type are immediately evaluated by the Lingo parser/printer:

```
Play-lng> 6*7
$: 42
Play-lng> $*3
$: 126
```

The `$` symbol is always assigned the result of the last evaluation, and can be used in the next expression.

You may optionally end an expression with a _terminator_. The default is `;` which prints the value using Lingo. The `;;` terminator supresses any output, which can be useful for large expressions that you don't want to clog the terminal transcript.

The final terminator is `;>` which prints the expression as a language-independent [S-expression](https://en.wikipedia.org/wiki/S-expression). For example:

```
Play-lng> quote(a + b);
$: a + b
Play-lng> quote(a + b);>
$: (+ a b)
```
The inbuilt **quote** function simply returns its argument unevaluated. When used with `;` it prints as the original Lingo expression. When used with `;>` it prints as a _tuple_, which exposes the underlying representation in Naan.

### Keyboard

The Naan REPL expects a VT-100 style terminal and uses some color coding to identify the source of output:

- The copyright banner at the start is <span style="color:blue">blue</span> to tell you whether color is supported.
- Debug logging text is shown in <span style="color:green">green</span>.
- Warnings and deprecations appear in <span style="color:red">red</span>.
- Faults, which should not happen, appear in <span style="color:red">**bold red**</span>.

Keystroke meaning is largely determined by the terminal used, typically Terminal.app on Mac OS X and CMD.exe on Windows. These control characters are commonly used:

| keys       | function                                      |
| :--------: | :-------------------------------------------- |
| ↑ ↓        | Navigate history of typed commands            |
| ＾C        | Stop execution and enter debugger             |
| ＾D        | NodeJS: exit the REPL and quit Naan           |
| ⌘ K ＾K    | MacOS / Browsers: clear terminal output       |

### Executive

The Naan REPL has executive commands that bypass the REPL and provide useful functions. Just remember that you can type `/help` to see the following information:

```
Play-lng> /help
/commands:
    /ch[mod]   [<module>]          - change active module
    /d[ebug]                       - enter debugger
    /help      [<command>]         - help [command]
    /i[nfo]    <topic>             - info on topic
    /op[tions]                     - view or modify options
    /quit                          - decamp / depart / absquatulate
Play-lng> 
```

If the REPL restarts for any reason it will print a notice with the current language. The REPL is implemented by a function called `Driver`, which can be replaced, so this notice informs you that the REPL is active.

```
Play-lng> /quit
Starting REPL for Lingo...

Play-lng> 
```

When running Naan under NodeJS, its console terminal program offers its own executive with dot commands. Not all of them are useful with Naan, but these seem to work:

```
Play-lng> .help
.editor   Enter editor mode
.help     Print this help message
.load     Load JS from a file into the REPL session
```

### Navigation

The REPL operates within the context of one _module_ at a time in the Naan runtime environment. Modules can inherit symbols from other modules, but changes can only be made to symbols in the current module. All others are read-only. Most of the time modules act independently as service providers, so it can be helpful to change the context and work in a different module.

```
Play-lng> /ch
can't find  -- please select from (Naan Util Lib Lingo Lang_Lingo CLI Play)
Play-lng> /ch CLI
CLI-lng> Driver.proc
$: closure Driver(local driverob, console, ...) {
    driverob = new(object, this)
    console = new(textstream)
    driverob.console = console
```
In the example above we changed to the **CLI** module with `/ch CLI` and requested the procedure binding of the symbol Driver with `Driver.proc`.

The executive can show you the contents of any module with `/info`:

```
CLI-lng> /info module CLI
CLI
    exports:
        Utils        : closure Utils(options)
        Info         : closure Info(console)
        DriverInstall: function DriverInstall()
        DebuggerREPL : closure DebuggerREPL(debug)
    components:
        CliUtils: CliUtilsPreload, Utils, Info, CliUtilsInit
        Driver  : driver_chmods, driver_debugs, driver_helps, driver_infos,
            driver_languages, driver_list, driver_options, driver_quits,
            driverCmds, Driver, driverExec, DriverInstall, DriverInit
        Debugger: DebuggerREPL, debug_breaks, debug_exceptions, debug_execs,
            debug_evals, debug_helps, debug_infos, debug_list, debug_stacks,
            debug_quit, DebuggerInit
```
Exports are the services the module provides to others, while components provide the functionality that implements these services. Modules typically are structured to have one required component with the others being optional, loaded only when required.


