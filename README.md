Naanide
==========

Naanide is an IDE for the Naan software system.

#### Release:
     Naanide for NPM version 0.9.1-1
     Copyright (c) 2022 Zulch Laboratories, Inc.

Features
-------
- `NaanIDE` runs in browsers and thus "anywhere"
- Inbuilt web server running in NodeJS

_Note: this is an early test release with insufficient documentation. Please stand by._

Installation
-------

First make sure you have installed the latest version of [node.js](http://nodejs.org/)
(You may need to restart your computer after this step).

After you download the NaanIDE package, the following commands will load the dependencies for your OS, start the NaanIDE web server, and open a browser upon it:

    cd NaanIDE
    npm install
    npm start

Using NaanIDE
-------

NaanIDE server outputs text like the following:
`server access: http://localhost:8008/nide.html?guid=5b88deb2-ab1f-452f-a7b4-fbe28c3ac62d`
If a browser does not open automatically you can access NaanIDE locally using this URL. The GUID prevents unauthorized access to the NaanIDE server API.
