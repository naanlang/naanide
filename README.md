Naanide
==========

Naanide is an IDE for the Naan software system.

#### Release:
     **Naanide for NPM** version **0.9.11+1**
     Copyright (c) 2023 Zulch Laboratories, Inc.

Features
-------
- `NaanIDE` runs in browsers and thus "anywhere"
- Inbuilt web server running in NodeJS

_Note: this is an early evaluation release with insufficient documentation. Please stand by._

Installation
-------

First make sure you have installed the latest version of [node.js](http://nodejs.org/)
(You may need to restart your computer after this step).

To install and run NaanIDE locally for evaluation, execute the following:

    mkdir naanlang
    cd naanlang
    npm install @naanlang/naanide
    npx @naanlang/naanide

You may prefer to install NaanIDE globally for use from the command lilne:

    npm install @naanlang/naanide -g
    naanide 

Using NaanIDE
-------

NaanIDE server outputs text like the following:
`server access: http://localhost:8008/nide.html?guid=5b88deb2-ab1f-452f-a7b4-fbe28c3ac62d`
If a browser does not open automatically you can access NaanIDE locally using this URL. The GUID prevents unauthorized access to the NaanIDE server API.
