/*
 * naan_repl.js
 *
 *     REPL support for Naan running in a web browser.
 *
 * column positioning:                          //                          //                      !
 *
 * Copyright (c) 2017-2021 by Richard C. Zulch
 *
 */

(function(exports){
    
    "use strict";
    
    var NaanREPL_shared = {};

exports.NaanREPL = function(replDiv, readyCallback) {
 
    //
    // locals
    //
 
    var replSelf = this;
    var eventList = {};
    var saveBuffer = "";
    var writeReady = false;                                                 // true when we are ready to write to terminal
    var width, height;
    var line;                                                               // instance of Readliner
    var term;                                                               // instance of hterm

    //
    // Readliner
    //
    //     This is a libelous approximation of a UNIX readline. But it's 10 o'clock at night in the
    // middle of a storm, running on a generator, and I'm going to move on to more urgent things.
    // Update: it's a beautiful day and I'm inside staring at a screen trying to resolve the challenges
    // from VT-100 soft-wrap, which prevented blank lines from appearing on full-length output. The
    // answer turns out to be monitoring the cursor position when printing. If the current column
    // position plus the string being printed would put you past the final column, the next character
    // may or may not cause the terminal to auto-wrap. The resolution is to output a <space>CR in this
    // case, where the space will auto-wrap and possibly put you in the second column, but the CR will
    // return you to the leftmost. See:
    // https://stackoverflow.com/questions/31360385/an-obscure-one-documented-vt100-soft-wrap-escape-sequence
    //
    //
 
    function Readliner()
    {
        var backCode = String.fromCharCode(0x08);
        var typeahead = "";
        var tacursor = 0;                                                   // cursor position in typeahead buffer
        
        //
        // line editing
        //
 
        function backdel() {                                                // delete one character before cursor
            if (linecount(typeahead) > 1)
                return;                                                     // can't modify pasted text
            if (tacursor > 0)
            {
                typeahead = typeahead.substr(0, tacursor-1) + typeahead.substr(tacursor);
                var rewrite = typeahead.substr(tacursor-1) + " ";
                cursorMove(-1);
                cursorPrint(rewrite);
                cursorMove(-rewrite.length);
            }
        }
        
        function forwardel() {
            if (linecount(typeahead) > 1)
                return;                                                     // can't modify pasted text
            if (tacursor < typeahead.length)
            {
                typeahead = typeahead.substr(0, tacursor) + typeahead.substr(tacursor+1);
                var rewrite = typeahead.substr(tacursor) + " ";
                cursorPrint(rewrite);
                cursorMove(-rewrite.length);
            }
        }
  
        function inschar(char) {                                            // insert one character at cursor
            if (char === "\r")
            {
                typeahead += char;
                cursorPrint(char);
            }
            else
            {
                var rewrite = char + typeahead.substr(tacursor);
                typeahead = typeahead.substr(0, tacursor) + rewrite;
                cursorPrint(rewrite);
                cursorMove(-rewrite.length+char.length);
            }
        }
        
        function linecount(text) {
            return(text.split("\r").length);
        }
        
        function linetext(text) {
            var nlines = linecount(text);
            if (nlines > 1)
            {
                var excerpt = text.substring(0,30).replace(/\r\n?/g, " ␍ ");
                if (excerpt.length > 20)
                    excerpt = excerpt.substring(0,20) + " … ";
                return ('[' + nlines + ' pasted lines: "' + excerpt + '"]');
            }
            else
                return (text);
        }
        
        function linelength(text) {
            return (linetext(text).length);
        }
 
        function resetline() {                                              // reset after input line
            typeahead = "";
            tacursor = 0;
        }

        function clearline() {                                              // discard all typed characters
            var len = linelength(typeahead);
            cursorMove(len - tacursor);                                     // make sure we're at end of text
            cursorMove(-len, true);
            resetline();
        }
 
        function setline(text) {                                            // set line to text with cursor at end
            clearline();
            if (text.charCodeAt(text.length-1) == 0x0d)
                text = text.substring(0, text.length-1);                    // remove line ending from buffer
            typeahead = text;
            cursorPrint(linetext(text));
        }

        // cursorPrint on-screen, advancing typeahead buffer
        
        function cursorPrint(text) {
            var curcol = term.getCursorColumn();
            term.io.print(text);
            tacursor += text.length;
            if (curcol+text.length == width)
                term.io.print(" \r");                                       // advance past VT100 "soft-wrap"
        }

        // cursorMove on-screen within typeahead buffer
 
        function cursorMove(direction, clearline) {
            var hcol = term.getCursorColumn();
            while (direction > 0)
            {                                                               // move one position right
                if (tacursor >= typeahead.length)
                    return;
                if (hcol == width-1)
                {                                                           // at end of line
                    term.io.print("\r\n");                                  // move cursor return+linefeed
                    hcol = 0;
                }
                else
                {
                    term.io.print("\x1b[C");                                // move cursor right
                    ++hcol;
                }
                ++tacursor;
                --direction;
            }
            while (direction < 0)
            {                                                               // move one position left
                if (tacursor <= 0)
                    return;
                if (hcol === 0)
                {                                                           // at start of line
                    if (clearline)
                        term.io.print("\x1b[K");                            // clear to end of line before we go up
                    term.io.print("\x1b[A");                                // move cursor up
                    term.io.print("\x1b[".concat(width-1,"C"));             // move cursor right to last column
                    hcol = width-1;
                }
                else
                {
                    term.io.print("\x1b[D");                                // move left
                    --hcol;
                }
                --tacursor;
                ++direction;
                if (clearline && direction === 0)
                    term.io.print("\x1b[K");                                // clear to end of line
            }
        }

        //
        // command history
        //

        const kMaxCommands = 100;
        var commandMemory = [];
        var commandIndex = 0;
        var commandCount = 0;

        function historySetLatest() {
            commandIndex = commandCount;                                    // move history to latest item
        }
        
        function historyAddItem() {
            commandIndex = commandCount;
            if (typeahead.length > 1 && (commandCount === 0 || commandMemory[commandCount-1] != typeahead))
            {                                                               // add new unique entry from typeahead
                commandMemory[commandCount++] = typeahead;
                if (commandCount > kMaxCommands)
                {                                                           // remove oldest command when we fill up
                    commandMemory.splice(0,commandCount-kMaxCommands);
                    commandCount = kMaxCommands;
                }
                commandIndex = commandCount;
            }
        }

        function historyMove(direction) {
			if (commandIndex == commandCount)
				commandMemory[commandIndex] = typeahead;
			if (direction < 0)
			{                                                               // key-up, previous
				if (commandIndex > 0)
				{
					--commandIndex;
					setline(commandMemory[commandIndex]);
				}
			}
			else if (direction > 0)
			{
				if (commandIndex < commandMemory.length-1)
				{
					++commandIndex;
					setline(commandMemory[commandIndex]);
				}
			}
        }
        
        function historyMoveEnd() {
			if (commandIndex < commandMemory.length-1)
			{
			    commandIndex = commandMemory.length-1;
				setline(commandMemory[commandIndex]);
			}
        }
        
        //
        // clearScreen
        //
        // Clear the screen and reset with just the last prompt line visible.
        //
        
        function clearScreen()
        {
            var keeptext;
            term.wipeContents();                                            // clear all terminal contents
            term.scrollHome();                                              // you'd think this would be redundant, but clears the vertical scrollbar
//          term.setCursorVisible(false);                                   // hterm currently does not move the cursor until you wiggle it
//          term.setCursorVisible(true);
            keeptext = /\n([^\n]+)$/.exec(saveBuffer);                      // everything after the last newline
            if (keeptext && keeptext[1])
                saveBuffer = keeptext[1];
            else
                saveBuffer = "";                                            // nothing to keep evidently
            term.io.print(saveBuffer);                                      // display our buffer
            tacursor = 0;                                                   // restore the typeahead
            cursorPrint(typeahead);
        }
        
        //
        // addChar
        //
        // Interpret character sequences and add character.
        //
        
        function addChar(char)
        {
            var code = char.charCodeAt(0);
            if (code === 0x7f)
                backdel();                                                  // delete key
            else if (code === 0x03)
            {                                                               // Control-C interrupt
                /*jshint sub:true */
                if (eventList.hasOwnProperty("interrupt"))
                    eventList["interrupt"](replSelf, code);
            }
            else if (code === 0x15)
                clearline();                                                // Control-U line erase
            else if (code === 0x1b)
            {                                                               // escape sequence
                code = char.charCodeAt(1);
                if (char.length == 1)
                    ;                                                       // escape key by itself
                else
                {                                                           // arrows & positioning
                    switch (char.substr(1))
                    {
                    case "[D":                                              // left-arrow
                        if (linecount(typeahead) <= 1)
                            cursorMove(-1);
                        break;
                    case "[C":                                              // right-arrow
                        if (linecount(typeahead) <= 1)
                            cursorMove(1);
                        break;
                    case "[B":                                              // down-arrow
                        historyMove(1);
                        break;
                    case "[A":                                              // up-arrow
                        historyMove(-1);
                        break;
                    case "[3~":                                             // forward-delete
                        forwardel();
                        break;
                    case "[5~":                                             // page-up
                        break;
                    case "[6~":                                             // page-down
                        break;
                    case "[H":                                              // home
                        break;
                    case "[F":                                              // ###???
                        break;
                    case "OP":                                              // F-key 1
                        break;
                    case "OQ":                                              // F-key 2
                        break;
                    case "OR":                                              // F-key 3
                        break;
                    case "OS":                                              // F-key 4
                        break;
                    case "[15~":                                            // F-key 5
                        break;
                    case "[17~":                                            // F-key 6
                        break;
                    case "[18~":                                            // F-key 7
                        break;
                    case "[19~":                                            // F-key 8
                        break;
                    case "[24~":                                            // F-key 12
                        break;
                    case "k":                                               // clear screen
                        clearScreen();
                        break;
                    default:
                        console.log("Unknown ESC sequence: " + char.substr(1));
                        break;
                    }
                }
            }
            else
            {                                                               // not a keyboard sequence
                if (linecount(typeahead) > 1)
                    historyMoveEnd();
                inschar(char);
                historySetLatest();
            }
        }

        //
        // this.PutChar
        //
        // Called with a single character string for keystrokes, or a string of any size if a paste
        // is ocurring. This interprets keystrokes for meaning but longer strings are passed directly
        // to the application and recorded as a single history item.
        //

        this.PutChar = function PutChar(char) {
            if (char.indexOf("\r") > 0)
            {                                                               // must be a paste
                setline(char);
                char = "\r";
                inschar(char);
            }
            else
                addChar(char);
            if (char === "\r")
            {
                historyAddItem();
                term.io.print("\n");
                saveBuffer += typeahead + "\n";
                /*jshint sub:true */
                if (eventList.hasOwnProperty("return"))
                    eventList["return"](replSelf);
                resetline();
            }
        };
 
        this.Avail = function Avail() {
            return (typeahead.length);
        };
 
        this.TakeText = function TakeText() {
            var text = typeahead;
            typeahead = "";
            return (text);
        };
 
        
        /*
         * Reset
         *
         *     Reset the readline to default state with empty screen.
         *
         */
        
        this.Reset = function Reset() {
            commandMemory = [];
            commandIndex = 0;
            commandCount = 0;
            resetline();
        };

        //
        // StateSave
        //
        //     Save the readline state into a new object
        //
     
        this.StateSave = function StateSave() {
            var rstate = {};
            rstate.cmds = commandMemory;
            rstate.cmdx = commandIndex;
            rstate.ncmd = commandCount;
            return (rstate);
        };
 
        //
        // StateLoad
        //
        //     Load the REPL state from a previously-saved object
        //

        this.StateLoad = function StateLoad(rstate) {
            if (!rstate || !rstate.cmds || !rstate.cmdx || !rstate.ncmd)
                return (false);
            commandMemory = rstate.cmds;
            commandIndex = rstate.cmdx;
            commandCount = rstate.ncmd;
            if (commandIndex == commandCount)
            {
                typeahead = commandMemory[commandIndex];
                if (!typeahead)
                    typeahead = "";
            }
            resetline();
            return (true);
        };

    }


    //
    // newTerminal
    //
    //     Create a new terminal instance, but this is allowed only after lib.init has completed and called
    // back, and it can only be called after the page is loaded.
    //
    
    function newTerminal() {
        term = new hterm.Terminal();
        term.decorate(replDiv);                                             // place to put the terminal
     
        term.onTerminalReady = function() {                                 // this function needs to fire before writing
            term.installKeyboard(replDiv);                                  // keys focus to keyboard; moved to onTerminalReady because Firefox 66.0.4 needed delay
            term.reset();                                                   // make cursor visible, among other things
            width = term.screenSize.width;
            height = term.screenSize.height;
            line = new Readliner();
            var io = term.io.push();
    
            io.onVTKeystroke = function(str) {
                // Do something useful with str here.
                // For example, Secure Shell forwards the string onto the NaCl plugin.
                line.PutChar(str);
            };
    
            io.sendString = function(str) {
                // Just like a keystroke, except str was generated by the
                // terminal itself.
                // Most likely you'll do the same this as onVTKeystroke.
                line.PutChar(str);
            };
    
            io.onTerminalResize = function(columns, rows) {
                /*jshint sub:true */
                width = columns;
                height = rows;
                if (eventList.hasOwnProperty("resize"))
                    eventList["resize"](this, columns, rows);               // terminal size has changed
                if (!writeReady)
                {
                    writeReady = true;
                    term.io.print(saveBuffer);
                }
            };

            term.prefs_.set('page-keys-scroll', true);

            readyCallback(replSelf);
        };
    }

    //
    // initialize hterm
    //
    //     Since we may have more than one terminal instance in the application, we queue the startup 
    // requests and run them all when lib.init is good and ready. NaanREPL may be called before the
    // window is loaded, after it is loaded but before lib.init was called, after lib.init was called
    // but before it has completed, or after everything is one. The twisted logic below handles these
    // cases for you.
    //
    //
 
    function termInitAfterWindowLoad() {
        lib.init(function() {
            newTerminal();
            var waiting;
            while (NaanREPL_shared.initqueue && NaanREPL_shared.initqueue.length > 0)
                (NaanREPL_shared.initqueue.pop())();                        // call the waiting function(s)
            delete NaanREPL_shared.initqueue;
        });
    }

    if (!hterm.defaultStorage)
    {                                                                       // this instance of NaanREPL is first to want hterm
        hterm.defaultStorage = new lib.Storage.Memory();                    // transient storage of hterm options
        NaanREPL_shared.initqueue = [];                                     // this queue will catch those coming in before lib.init completes
        if (document.readyState === "complete")
            termInitAfterWindowLoad();                                      // window already loaded
        else
            window.addEventListener("load", function () {
                termInitAfterWindowLoad();                                  // initialize term after window loads
            }
        );
    }
    else if (NaanREPL_shared.initqueue)
    {                                                                       // lib.init hasn't yet been called (and maybe the window isn't loaded)
        NaanREPL_shared.initqueue.push(function() {
            newTerminal();
        });
    }
    else
        newTerminal();                                                      // everything is initialized
    
 
    /*
     * Colors & Attributes
     *
     *     Supported VT100 colors and atributes
     *
     */
 
    // attributes
    this.Clear      = "\x1b[0m";                                            // all attributes off
    this.Bold       = "\x1b[1m";                                            // heavy
    this.BoldOff    = "\x1b[21m";                                           // heavy off
    this.Under      = "\x1b[4m";                                            // underline
    this.UnderOff   = "\x1b[24m";                                           // underline off
    this.Blink      = "\x1b[5m";                                            // blink
    this.BlinkOff   = "\x1b[25m";                                           // blink off
 
    // foreground colors
    this.Red        = "\x1b[31m";                                           // red
    this.Green      = "\x1b[32m";                                           // green
    this.Yellow     = "\x1b[33m";                                           // yellow
    this.Blue       = "\x1b[34m";                                           // blue
    this.Magenta    = "\x1b[35m";                                           // magenta
    this.Cyan       = "\x1b[36m";                                           // cyan
    this.White      = "\x1b[37m";                                           // white
    this.DefColor   = "\x1b[39m";                                           // default color
    this.LtGray     = "\x1b[90m";                                           // light grey
    this.LtRed      = "\x1b[91m";                                           // light red
    this.LtGreen    = "\x1b[92m";                                           // light green
    this.LtYellow   = "\x1b[93m";                                           // light yellow
    this.LtBlue     = "\x1b[94m";                                           // light blue
    this.LtMagenta  = "\x1b[95m";                                           // light magenta
    this.LtCyan     = "\x1b[96m";                                           // light cyan
    this.LtWhite    = "\x1b[97m";                                           // light white
 
    /*
     * On
     *
     *     Call the specified function on an interrupt.
     *
     */
 
    this.On = function On(event, code) {
        eventList[event] = code;                                            // well-known event name
    };

    /*
     * Write
     *
     */
 
    this.Write = function Write(text, color) {
        if (typeof(color) !== "undefined")
            text = color + text + "\x1b[0m";
        if (writeReady)
            term.io.print(text);
        saveBuffer += text;
    };
 
    /*
     * WriteLn
     *
     */
 
    this.WriteLn = function WriteLn(text, color) {
        if (typeof(color) !== "undefined")
            text = color + text + "\x1b[0m";
        text = text + "\r\n";
        if (writeReady)
            term.io.print(text);
        saveBuffer += text;
    };
 
    /*
     * WriteDebug
     *
     */
    
   function writeDebug(text, level) {
        if (level >= 5)
            replSelf.WriteLn(text, replSelf.Cyan);                          // cyan for builtin logging
        else if (level >= 4)
            replSelf.WriteLn(text, replSelf.Blue);                          // blue for Naan function logging
        else if (level >= 3)
            replSelf.WriteLn(text, replSelf.Red);                           // light red for warnings
        else if (level >= 2)
            replSelf.WriteLn(text, replSelf.Green);                         // green for Naan.debug.debuglog logging
        else
            replSelf.WriteLn(text, replSelf.Red+replSelf.Bold);             // heavy red for errors
    }
     
    //
    // OnMessage
    //
    //     Process the specified undecoded message.

    this.OnMessage = function OnMessage(msg) {
        if (msg.id == "textout")
            replSelf.Write(msg.text.replace(/\n/g, "\r\n"));
        else if (msg.id == "debugtext")
            writeDebug(msg.text, msg.level);
    };

    /*
     * Avail
     *
     *     Number of keyboard characters available.
     *
     */
 
    this.Avail = function Avail() {
        return (line.Avail());
    };
 
    /*
     * TakeText
     *
     *     Return available keyboard characters and reset the buffer.
     *
     */
 
    this.TakeText = function TakeText() {
        return (line.TakeText());
    };
            
    /*
     * Focus
     *
     *     Make the terminal be the current keyboard focus.
     *
     */
    
    this.Focus = function Focus() {
        term.focus();
    };

    /*
     * Reset
     *
     *     Reset the REPL to default state with empty screen.
     *
     */
    
    this.Reset = function Reset() {
        term.reset();                                                       // reset terminal settings
        term.wipeContents();                                                // clear all terminal contents
        term.scrollHome();                                                  // you'd think this would be redundant, but clears the vertical scrollbar
        line.Reset();
        saveBuffer = "";
    };
 
    /*
     * StateSave
     *
     *     Save the REPL state into a new object.
     *
     */
 
    this.StateSave = function StateSave() {
        var rstate = {};
        rstate.readline = line.StateSave();
        rstate.buffer = saveBuffer;
        return (rstate);
    };
 
    /*
     * StateLoad
     *
     *     Load the REPL state from a previously-saved object.
     *
     */

    this.StateLoad = function StateLoad(rstate) {
        if (!rstate || !rstate.readline || !rstate.buffer)
            return (false);
        this.Reset();
        line.StateLoad(rstate.readline);
        saveBuffer = rstate.buffer;
        if (writeReady)
            term.io.print(saveBuffer);                                      // write now
        return (true);
    };

};

})(typeof exports === 'undefined'?(this.Naanlang?this.Naanlang:this.Naanlang={}) : exports);
