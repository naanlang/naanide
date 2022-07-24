Installing NaanIDE
-----
This guide explains how to install NaanIDE.

### Install

The first step is to install NodeJS, or ensure that you are using a recent version. Open a terminal window on your OS and issue the following command:

```
node --version
```

If you get an error, or the version is older than `v14.14.0` then you will need to [install NodeJS](https://nodejs.org/en/). You may need to restart your computer after this step.

Use Node's NPM to install NaanIDE as a global command line app:

```
npm install @naanlang/naanide -g
naanide
```
Alternatively you can install NaanIDE in a local folder at the cost of a more complex start command:

```
mkdir NaanIDE
cd NaanIDE
npm install @naanlang/naanide
npm start --prefix node_modules/@naanlang/naanide
```

### Supporting Tools

NaanIDE currently uses `git` and `grep` for source control and searching respectively. These come preinstalled on Linux and MacOS but may need to be installed on Microsoft Windows.

We have tested the following procedures on Windows 10. Please see [these instructions](https://docs.microsoft.com/en-us/windows/package-manager/winget/) if `winget` is not installed on your system.

#### Install git on Windows

```
winget install --id Git.Git -e --source winget
```
Additional instructions are available on the [git website](https://git-scm.com/download/win).

#### Install grep on Windows

```
winget install --id GnuWin32.Grep -e --source winget
setx path "%path%;C:\Program Files (x86)\GnuWin32\bin"
```
The commands above permanently add the GnuWin32 tools to the path environmental variable of the logged-in user. You can view and modify the path using from the **Windows Control Panel** / **System** / **Advanced System Settings** / **Environment Variables**.
