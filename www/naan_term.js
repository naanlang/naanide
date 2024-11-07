/*
 * node_term.js
 *
 *     Support for a Naan REPL terminal running in its own window in a web browser.
 *
 * column positioning:                          //                          //                      !
 *
 * Copyright (c) 2017-2021 by Richard C. Zulch
 *
 */

(function(exports){

exports.NaanTerminal = function() {

    "use strict";
    /*jshint -W024 */
    var undefined;                                                          // should be a keyword
 
    //
    // Environment
    //
  
    var instance;                                                           // controller for our Naan instance
    if (window && window.opener)
        instance = window.opener.Naanlang.naancon;
    if (!instance)
        return;                                                             // no point in continuing


    //
    // locals
    //
 
    var termSelf = this;


    //
    // Initialize
    //

    // first, let's get the height right, addressing a defect in webkit (Chrome/Safari)
    var replstate = instance.StateGet();
    if (replstate && replstate.termwin && replstate.termwin.innerHeight != window.innerHeight) {
        var vdiff = replstate.termwin.innerHeight - window.innerHeight;
        var outh = window.outerWidth;
        var outv = window.outerHeight;
        window.resizeTo(outh, outv+vdiff);                                  // in the pious hope that the inner/outer difference is consistent
    }

    window.naanTerminal = this;
    var replDiv = document.getElementById('NaanREPL');
    var repl = new Naanlang.NaanREPL(replDiv, function(){
        document.getElementById('NaanTermLoading').style.display = "none";
        replstate = instance.StateGet();
        if (replstate)
            repl.StateLoad(replstate);
        instance.Attach(termSelf);
    });
    
    this.termwin = true;                                                    // separate terminal window
 
    repl.On("interrupt", function() {
        instance.Interrupt(termSelf);
    });

    repl.On("return", function() {
        instance.Return(repl.TakeText(), termSelf);
    });


    //
    // OnMessage
    //
    // Messages from the interpreter instance.
    //
    
    this.OnMessage = function OnMessage(msg) {
        switch (msg.id)
        {
        case "textout":
            repl.Write(msg.text.replace(/\n/g, "\r\n"));
            break;
        case "debugtext":
            debugWrite(msg.text, msg.level);
            break;
        }
    };

    //
    // Interpreter's debug output
    //

    function debugWrite(text, level) {
        if (level >= 5)
            repl.WriteLn(text, repl.Cyan);                                  // cyan for builtin logging
        else if (level >= 4)
            repl.WriteLn(text, repl.Blue);                                  // blue for Naan function logging
        else if (level >= 3)
            repl.WriteLn(text, repl.Red);                                   // light read for warnings
        else if (level >= 2)
            repl.WriteLn(text, repl.Green);                                 // green for Naan.debug.debuglog logging
        else
            repl.WriteLn(text, repl.Red+repl.Bold);                         // heavy red for errors
    }

 
    //
    // State management
    //
    
    function termWinState() {
        var termwin = {
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
            top: window.screenY,
            left: window.screenX
        };
        return (termwin);
    }

    window.addEventListener("pagehide", function (e) {
        instance.Detach(termSelf);
    });
 
    window.addEventListener("beforeunload", function (e) {                  // only event fired on page reload
    });

    this.StateSave = function StateSave() {
        var state = repl.StateSave();
        state.termwin = termWinState();
        return (state);
    };
};

})(typeof exports === 'undefined' ? (this.Naanlang?this.Naanlang:this.Naanlang={}) : exports);

new Naanlang.NaanTerminal();

