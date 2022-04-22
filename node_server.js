/*
 * node_server.js
 * naanide
 *
 *     Start the Naanide server, which launches the IDE.
 *
 * column positioning:                          //                          //                      !
 *
 * Copyright (c) 2017-2021 by Richard C. Zulch
 *
 */

"use strict";


/*
 * Begin
 *
 */

var jspath = require("path");
var naanpath = jspath.resolve(require.resolve('@naanlang/naan'), '../../../');
var envpath = jspath.resolve(naanpath, 'lib/env_node.js');
var NaanNodeREPL = require(envpath);

var naanrepl = new NaanNodeREPL({
    replDisable: false
});

naanrepl.setDirectory(__dirname);
naanrepl.setRequire(require);

naanrepl.textCommand(""
    + "Naan.module.defineLoc('naanlib', '" + naanpath.replace(/\\/g, "\\\\") + "');;"
    + "NaanPath = '" + naanpath.replace(/\\/g, "\\\\") + "';;"
    + "Naan.module.nodeparse('node_server_init.nlg');;\n");
