#!/usr/bin/env node
/*
 * index.js
 * NaanIDE
 *
 *     NaanIDE command line.
 *
 * column positioning:                          //                          //                      !
 *
 * Copyright (c) 2021-2023 by Richard C. Zulch
 *
 */

"use strict";

/*
 * imports
 *
 */

var jspath = require("path");
var fs = require("fs");
var naanpath = jspath.resolve(require.resolve('@naanlang/naan'), '../../../');
var envpath = jspath.resolve(naanpath, 'lib/env_node.js');
var NaanNodeREPL = require(envpath);

var server_port;

/*
 * Process command-line arguments
 *
 */

var port;
var cmd_text = ""
    + "Naan.module.defineLoc('naanlib', '" + naanpath.replace(/\\/g, "\\\\") + "');;"
    + "NaanPath = '" + naanpath.replace(/\\/g, "\\\\") + "';;"
    + "Naan.module.nodeparse('node_server_init.nlg');;\n";

process.argv.every((val, index) => {
    if (index < 2)
        return (true);
    if (val == "--port") {
        server_port = "-";
        return (true);
    }
    if (server_port == "-" && val.substring(0,1) == "-")
        return (false);
    if (val == "-h" || val == "--help") {
        console.log(
            "Usage: naanide [options] [source file] [arguments]\n\n" +
            "Options:\n" +
            "  --port <port>        use the specified port\n" +
            "  --version            print the NaanIDE version\n" +
            "  --buildno            print the version and build\n" +
            "  -h, --help           print this usage information\n"
        );
        process.exit(0);
    }
    if (val == "--version") {
        console.log("0.9.15");
        process.exit(0);
    }
    if (val == "--buildno") {
        console.log("0.9.15+1");
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
    // ignore extra arguments
    return (true);
});

if (server_port == "-") {
    console.log("naan: --port requires an argument");
    process.exit(9);
}
if (server_port > 0)
    cmd_text = "NaanServerPort = " + server_port + ";;" + cmd_text;


/*
 * Execute Naan
 *
 */

var naanrepl = new NaanNodeREPL({
    replDisable: false
});
naanrepl.setDirectory(jspath.join(__dirname, "../lib/"));
naanrepl.setRequire(require);

naanrepl.textCommand(cmd_text);
