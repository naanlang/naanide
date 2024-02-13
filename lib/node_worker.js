/*
 * node_worker.js
 * naanide
 *
 *     Start a Naanide worker.
 *
 * column positioning:                          //                          //                      !
 *
 * Copyright (c) 2017-2023 by Richard C. Zulch
 *
 */

"use strict";


/*
 * Begin
 *
 */

var jspath = require("path");
var naanpath = jspath.resolve(require.resolve('@naanlang/naan'), '../../../');
var envpath = jspath.resolve(naanpath, 'lib/env_nodeworker.js');
var naanenv = require(envpath);

naanenv.NaanWorkerActivate(function(naanworker) {
    naanworker.setDirectory(__dirname);
    naanworker.setRequire(require);
    naanworker.setImport(function(m) { return (import(m)); });
    
    naanworker.textCommand(""
        + "Naan.module.defineLoc('naanlib', '" + naanpath.replace(/\\/g, "\\\\") + "');;"
        + "NaanPath = '" + naanpath.replace(/\\/g, "\\\\") + "';;"
        + "Naan.module.nodeparse('node_worker_init.nlg');;\n");
});
