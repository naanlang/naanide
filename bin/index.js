#!/usr/bin/env node
/*
 * index.js
 * NaanIDE
 *
 *     NaanIDE command line.
 *
 * column positioning:                          //                          //                      !
 *
 * Copyright (c) 2021-2024 by Richard C. Zulch
 *
 */

"use strict";

/*
 * imports & environment
 *
 */

var jspath = require("path");
var fs = require("fs");
var os = require("os");
var naanOptions = {};
var naanpath = jspath.resolve(require.resolve('@naanlang/naan'), '../../../');
var rootpath = jspath.join(__dirname, "/..");
var envpath = jspath.resolve(naanpath, 'lib/env_node.js');
var NaanNodeREPL = require(envpath);
var naanrepl;
var statePath;
var stateKey;

/*
 * Process command-line arguments
 *
 */

var start_params = {
    naanpath: naanpath.replace(/\\/g, "\\\\"),
    guid: process.env.NAANIDE_SERVER_GUID
};

var cmd_text = ""
    + `App.naanpath = '${ naanpath.replace(/\\/g, "\\\\") }';;`             // path/to/our naan library
    + `App.rootpath = '${ rootpath.replace(/\\/g, "\\\\") }';;`             // path/to/our package.json
    + "Naan.module.defineLoc('naanlib', App.naanpath);;"                    // defines "naanlib:" prefix for require
    + "Naan.module.nodeparse('lib/node_server_init.nlg');;\n";              // Naan initialization

var server_port;
var cmd_mod;
var eval_text;
var list_commands;
var do_interactive;

process.argv.every((val, index) => {
    if (index < 2)
        return (true);
    if (val == "--port") {
        server_port = "-";
        return (true);
    }
    if (server_port == "-" && val.substring(0,1) == "-")
        return (false);
    if (val == "-e") {
        eval_text = 1;
        return (true);
    }
    if (val == "--list") {
        list_commands = true;
        return (true);
    }
    if (eval_text == 1 && val.substring(0,1) == "-")
        return (false);
    if (val == "-h" || val == "--help") {
        console.log(
            "Usage: naanide [options] [command] [command-arguments]\n\n" +
            "Options:\n" +
            "  --port <port>        use the specified port\n" +
            "  -e <expression>      evaluate an expression\n" +
            "  --list               list available commands\n" +
            "  --version            print the NaanIDE version\n" +
            "  --buildno            print the version and build\n" +
            "  -h, --help           print this usage information\n" +
            "\n" +
            "Environment variables:\n" +
            "  NAANIDE_SERVER_PORT  default server port\n" +
            "  NAANIDE_SERVER_GUID  static server secret\n"
        );
        process.exit(0);
    }
    if (val == "--version") {
        console.log("0.9.26");
        process.exit(0);
    }
    if (val == "--buildno") {
        console.log("0.9.26+1");
        process.exit(0);
    }
    if (val.substring(0,1) == "-") {
        console.log("naanide: bad option: " + val);
        process.exit(9);
    }
    if (server_port == "-") {
        server_port = parseInt(val);
        if (typeof(server_port) != "number") {
            console.log("naanide: invalid port: " + server_port);
            process.exit(9);
        }
        return (true);
    }
    if (eval_text == 1) {
        eval_text = val + '\n';
        return (true);
    }
    cmd_mod = val;
    start_params.cmd_args = process.argv.slice(index+1);
    return (false);
});

if (server_port == "-") {
    console.log("naanide: --port requires an argument");
    process.exit(9);
}
if (server_port > 0)
    start_params.serverPort = server_port;
else if (process.env.NAANIDE_SERVER_PORT)
    start_params.serverPort = process.env.NAANIDE_SERVER_PORT;

if (list_commands) {
    var files1 = fs.readdirSync(jspath.join(__dirname, "../nidecom"));
    var files2 = fs.readdirSync(jspath.join(os.homedir(), ".naanlang/nidecom"));
    console.log("naanide: commands:", files1.concat(files2).join(", "));
    process.exit(0);
}

if (eval_text == 1) {
    console.log("naanide: -e requires an argument");
    process.exit(9);
}

if (cmd_mod) {
    var path = jspath.resolve(__dirname, "../nidecom", cmd_mod);
    if (fs.existsSync(path))
        ;
    else {
        path = jspath.resolve(os.homedir(), ".naanlang/nidecom", cmd_mod);
        if (!fs.existsSync(path)) {
            console.log(`naanide: command not found: ${cmd_mod}`);
            process.exit(1);
        }
    }
    start_params.cmd_mod = cmd_mod;
    start_params.cmd_path = path;
}

if (eval_text) {
    naanOptions.noWelcome = true;
    naanOptions.cmd = "Naan.runtimelib.curdriver().setOptions({prompt:false});;\n";
    cmd_text = cmd_text.concat("\n" +
        "closure NodeREPL(local input, error, expr) {\n" +
        "   input = new(textstream, js.expr)\n" +
        "   try {\n" +
        "       loop {\n" +
        "           `(error, expr) = Dialect.parse(input)\n" +
        "           if error {\n" +
        "               printline(' ==> parse error: ', Dialect.parseErrorString(error.0))\n" +
        "               break\n" +
        "           } else\n" +

        "           {\n" +
        "               $(evalactive(expr))\n" +
        "               if input.tokenlast().atom == `;; || $ === Naan.local.mu\n" +
        "                   { }\n" +
        "               else if input.tokenlast().atom == `;>\n" +
        "                   printline($)\n" +
        "               else\n" +
        "                   printline(Dialect.print($))\n" +
        "           }\n" +

        "       }\n" +
        "   } catch {\n" +
        "       if true {\n" +
        "           if exception != `(internal, 'end-of-file')\n" +
        "               printline(' ==> exception: ', error = exception)\n" +
        "       }\n" +
        "   } finally {\n" +

        "       if App.api || !js.expr\n" +
	    "           Naan.runtimelib.curdriver().setOptions({prompt:true})\n" +
	    "       else\n" +
        "           App.nidecon.quit(if error 1 else 0)\n" +

        "   }\n" +
        "}();;\n");
}


/*
 * State management
 *
 * Save and load our state for faster startup. Note that js.t.Working() must be called at some point 
 * for state to be saved. This prevents us from saving bad state.
 *
 */

// loadState
//
// Attempt to load our state, but leave statePath/stateKey set in any case.
//
function loadState() {
    stateKey = "Zulch Laboratories, Inc.-0.9.26+1";
    statePath = jspath.join(os.homedir(), `.naanlang/session.state`);
    try {
        var sessions = fs.readFileSync(statePath);
        sessions = JSON.parse(sessions);
        naanOptions.state = sessions.states[stateKey];
    } catch (e) {
    }
}

// replaceState
//
// Trim extra states and then add our specified one to the sessions object.
//
function replaceState(sessions, stateKey, state) {
    if (!sessions || !sessions.states || !sessions.lru)
        return;
    sessions.lru = sessions.lru.filter(function(key) {
        return (key != stateKey);
    });
    while (sessions.lru.length >= 3) {
        var key = sessions.lru.pop();
        delete sessions.states[key];
    }
    if (state) {
        sessions.states[stateKey] = state;
        sessions.lru.unshift(stateKey);
    } else
        delete sessions.states[stateKey];
}

// saveState
//
// Save our state to disk.
//
function saveState() {
    var sessions;
    try {
        sessions = fs.readFileSync(statePath);                              // read again; may have changed
        sessions = JSON.parse(sessions);
    } catch (e) {
    }
    var state = naanrepl.MakeState();
    if (!sessions) {
        if (!state)
            return;                                                         // no state yet
        sessions = {
            lru: [],                                                        // most recent at front
            states: {}                                                      // keyed by licensee/version
        };
    }
    if (state) {
        try {
            replaceState(sessions, stateKey, state);
            fs.writeFileSync(statePath, JSON.stringify(sessions));
        } catch (e) {
            console.log("NaanIDE: state save failed,", e);
        }
    } else {
        console.log("NaanIDE: failed startup - removed saved state")
        replaceState(sessions, stateKey);                                   // remove failed state
        fs.writeFileSync(statePath, JSON.stringify(sessions));
    }
}

// save state on exit
//
// process.on("exit", saveState);                                           // need to ensure it's in good place


/*
 * Execute Naan
 *
 * This defines the Naan symbol NaanStartParams as:
 *  {
 *      naanpath: <string>                      // path to the naan library
 *      serverPort: <integer>                   // defined if the command line specified a port
 *  }
 *
 */

if (!process.stdin.isTTY)
    naanOptions.replDisable = true;                                         // REPL terminates immediately
naanOptions.require = require;
naanOptions.import = function(m) { return (import(m)); };
loadState();
var naanrepl = new NaanNodeREPL(naanOptions);
naanrepl.setDirectory(rootpath);
naanrepl.setGlobal("save", saveState);                                      // set js.save
if (eval_text)
    naanrepl.setGlobal("expr", eval_text + "\n");                           // set js.expr

cmd_text = "NaanStartParams = " + JSON.stringify(start_params) + ";;" + cmd_text;
naanrepl.textCommand(cmd_text);
