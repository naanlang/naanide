NaanIDE
==========

NaanIDE is an Integrated Development Environment for the NaaN software platform.

#### Release:
     **Naanide for NPM** version **0.10.1+1**  
     Copyright (c) 2025 Zulch Laboratories, Inc.

#### Features

- NaanIDE runs in web browsers.
- The inbuilt web server runs in NodeJS, which provides access to git and the local filesystem.
- Supported platforms are MacOS, Windows, and Linux (including Chromebook, Raspberry Pi, etc.)

## Installation instructions

Please ensure you have a recent version of node.js. The minimum is v20.10.0  
To check your NodeJS version, open a terminal window and issue the following command:

```
node --version
```

Updates are available at [node.js](http://nodejs.org/).

#### Standard installation

Execute the following to install NaanIDE globally for use from the command line. For Windows, omit the `sudo`.

    sudo npm install @naanlang/naanide -g
    naanide

The following will *update* NaanIDE globally. For Windows, omit the `sudo`.

    sudo npm update @naanlang/naanide -g

#### Local folder installation

Alternatively you can install NaanIDE in a local folder at the cost of a more complex start command:

    mkdir NaanIDE
    cd NaanIDE
    npm install @naanlang/naanide
    npm start --prefix node_modules/@naanlang/naanide

The following will *update* NaanIDE in the local folder:

    cd NaanIDE
    npm update

### Supporting Tools for Windows

NaanIDE currently uses `git` for source control, `grep` for searching, and `bash` for shell escapes. These come preinstalled on Linux and MacOS but may need to be installed on Microsoft Windows.

We have tested the following procedures on Windows 10 and 11. Please see [these instructions](https://docs.microsoft.com/en-us/windows/package-manager/winget/) if `winget` is not installed on your system.

#### Install git

```
winget install --id Git.Git -e --source winget
```
Additional instructions are available on the [git website](https://git-scm.com/download/win).

#### Install grep

```
winget install --id GnuWin32.Grep -e --source winget
setx path "%path%;C:\Program Files (x86)\GnuWin32\bin"
```
The commands above permanently add the GnuWin32 tools to the path environmental variable of the logged-in user. You can view and modify the path using from the UI located here: **Windows Control Panel** / **System** / **Advanced System Settings** / **Environment Variables**.

#### Install WSL

NaanIDE offers the ability to execute shell escapes inside its REPL with the `!` prefix. For this to work on Windows you need to have WSL installed to make the `bash` executable available. WSL installation instructions are available [here](https://learn.microsoft.com/en-us/windows/wsl/install).

## Command line execution

With no arguments`naanide` starts a new local server at an available port and launches the IDE in a web page.

##### Command line options

    naanide [options] [source file] [arguments]

    --port <port>               override the IP port
    -e <expression>             evaluate an expression
    --list                      list available commands
    --version                   print NaaN version
    --buildno                   print NaaN version with build number
    -h, --help                  print usage information

##### Command line control

NaanIDE is scriptable, so the server and each browser tab can be controlled from the command line. The inbuilt `workspace` script opens the projects you specify in separate browser tabs in the same window, to create a workspace. The inbuilt `make` command builds the specified projects and stages, simplifying integration with other editors and IDEs.

	naanide workspace Backend WebApp    # open the Backend and WebApp projects
	naanide make naan.dev naanide.dev   # build the dev stage of the naan and naanide projects
	naanide --list                      # list available commands

NaanIDE manages ports and link security automatically for simple cases, but it is fully configurable using files, environmental variables, and command line arguments. Please see the **Docs** tab in the IDE for advanced configuration and customization.

You can also write your own automation scripts. The following are quick "one liners", but please see the inbuilt scripts for practical examples.


    # display server information:
    naanide -e App.nidecon.net
    {
        guid  : "55491048-1014-45f5-9af5-a2f674af8d94",
        port  : 8008,
        host  : "localhost:8008",
        oururl: "http://localhost:8008/nide.html?guid=55491048-1014-45f5-9af5-a2f674af8d94" }

    # display an alert in the browser from the command line:
    naanide -e 'App.nidecon.remote(App.nidecon.clients().0).1.evalq(js.w.alert("Hello, NaanIDE User!"))'

    # list currently open projects in browser tabs:
    naanide -e 'body (for id in App.nidecon.clients() \
        printline(App.nidecon.remote(id).1.evalq(App.model.project.active.name()).1));;'
    naanide
    naanlib

## In Case of Difficulty

This sections lists problems you may encounter running NaanIDE, with possible solutions.

**NaanIDE does not run properly, and reloading the web page doesn't help.** NaanIDE saves its state across executions, and if the state is bad then it won't run properly. In browsers the `restart` query expression will prevent using the saved state, e.g. `http://localhost:8008/nide.html?restart`. For the server, delete the `.naanlang/session.state` file in your home folder.

**Spawned browser tabs don't run properly.** This can occur when the browser's service worker gets confused and does not respond properly. With Chrome, open the [chrome://serviceworker-internals/](chrome://serviceworker-internals/) page and click **Unregister** below the offending instances. Reload NaanIDE to recreate the service worker.

## Next Steps

Please explore. For example, the **Docs** tab has reference information.  
[www.naanlang.org](https://www.naanlang.org) has tutorials, explanations, and how-to articles.  
Feel free to contact [Richard Zulch](mailto:naanlang@zulchlabs.com) with questions and comments.
