Installing Naan
-----
This guide explains how to install the Naan package using NodeJS.

### Install

The first step is to install NodeJS, or ensure that you are using a recent version. Open a terminal window on your OS and issue the following command:

```
node --version
```

If you get an error, or the version is older than `v14.14.0` then you will need to [install NodeJS](https://nodejs.org/en/). You may need to restart your computer after this step.

Use Node's NPM to install Naan globally as a command line app:

```
npm install @naanlang/naan -g

```

### Command line execution

Naan can run in several different modes as a command line tool:
- As an expression evaluator with `naan -e <expression>`
- To evaluate and print expressions from a text file: `naan -i <filepath>`
- For an interactive REPL use just `naan`
- To execute a Naan program from a text file: `naan <filepath>`

```
% naan --help
Usage: naan [options] [source file] [arguments]

Options:
  -e <expression>      evaluate an expression
  -i, --interactive    use REPL with -e or [source file]
  --version            print the Naan version
  --buildno            print the version and build
  -h, --help           print this usage information

```

#### Examples
```shell
C:\projects\onramp> naan -e 6*7
42
C:\projects\onramp>
```
```shell
C:\projects\onramp> naan
Naan © 2018-2022 by Richard C. Zulch
Starting REPL for Lingo...

Play-lng> 6*7
$: 42
Play-lng>
```
To exit the REPL, type `^D` (Control-D)

_Important: When using -e <expr> on Microsoft Windows, do not use single quotes around the expression. Use double quotes if needed._


#### Shell scripting

When installed globally, Naan can be used for shell scripts with the [Shebang](https://en.wikipedia.org/wiki/Shebang_(Unix))
mechanism. For example, copy the following text to a file named helloworld:

    #!/usr/bin/env naan
    printline("Hello World")

Now make it executable with chmod:

    chmod a+x helloworld

### Install for programmatic use

```
cd myproject
npm install @naanlang/naan
```
This will install Naan as a dependency of `myproject`, that can be accessed using NodeJS require. There is also a minimized version of the code for browsers in the Naan package's `dist` directory.
