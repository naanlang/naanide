NaanIDE Installation
-----
This guide explains how to install and configure NaanIDE.

#### Installation Overview:

1. [Install or update NodeJS](#install-nodejs)
2. [Install Naan and NaanIDE](#install-naan-naanide)
3. [Install supporting tools (Windows)](#install-support-tools)
4. [Optional advanced configuration](#advanced-config)

#### <a name="install-nodejs"></a> Install or Update NodeJS

The first step is to install NodeJS, or ensure that you are using a recent version. Open a terminal window on your OS and issue the following command:

```
node --version
```

If you get an error, or the version is older than `v14.14.0` then you will need to install a current version.

##### NodeJS on MacOS / Linux / Windows

Download and run the [current LTS installer](https://nodejs.org/en/). 

##### NodeJS on Chromebooks

NaanIDE runs very well on Chromebooks with Linux enabled. Use the following commands in the Linux terminal to [update the OS](https://linuxhandbook.com/update-debian/) and then install NodeJS.

```
sudo apt update && sudo apt upgrade
sudo apt-get install nodejs
sudo apt-get install npm
```

#### <a name="install-naan-naanide"></a> Install Naan and NaanIDE

After NodeJS is installed, open a terminal window and issue the following commands. Omit `sudo` for Windows.

```
sudo npm install @naanlang/naan -g
sudo npm install @naanlang/naanide -g
```

After installation the `naanide` command will start the NaanIDE server and open the UI in the browser.

#### <a name="install-support-tools"></a> Install Supporting Tools (Windows)

NaanIDE currently uses external `git` and `grep` tools for source control and searching respectively. These come preinstalled on Linux and MacOS but may need to be installed on Microsoft Windows.

We have tested the following procedures on Windows 10. Please see [these instructions](https://docs.microsoft.com/en-us/windows/package-manager/winget/) if `winget` is not installed on your system.

##### Install git on Windows

```
winget install --id Git.Git -e --source winget
```
Additional instructions are available on the [git website](https://git-scm.com/download/win).

##### Install grep on Windows

```
winget install --id GnuWin32.Grep -e --source winget
setx path "%path%;C:\Program Files (x86)\GnuWin32\bin"
```
The commands above permanently add the GnuWin32 tools to the path environmental variable of the logged-in user. You can view and modify the path using from the **Windows Control Panel** / **System** / **Advanced System Settings** / **Environment Variables**.

#### <a name="advanced-config"></a> Optional advanced configuration

Normally NaanIDE does not require any special configuration, but these instructions may be useful for advanced requirements.

##### Server Port
When NaanIDE is launched it normally starts a local web server and then opens a browser tab with the UI. By default this searches for the first open port starting with 8008. Alternatively the port can be specified in the command line:

```
naanide --port 8020
```

##### Shared Secret
NaanIDE uses a secret guid for secure access to its API, shared among the server, browser tabs, and remote control programs. Upon startup, NaanIDE Server shows the URL in the console. For example:

```
server access: http://localhost:8008/nide.html?guid=5b88deb2-ab1f-452f-a7b4-fbe28c3ac62d
```

Normally this secret is managed automatically without user intervention. When NaanIDE Server first starts it creates a new secret, and then launches the browser with the secret in the URL. This is removed from the address bar when the browser tab opens. New tabs do not need the secret because they get it from local storage. When NaanIDE Server restarts it reloads state from files in the `~/.naanlang/` folder, so original the secret is preserved.

##### Static Secrets and Ports

Sometimes it is desirable to define a static secret or port so that tools can run independently. For example, two different instances of NaanIDE server can run simultaneously on specific ports. 

The secret can be defined in the JSON-formatted `.naanlang/naanlangrc` file in your home directory. You currently create this file manually. Here is an example:

```
% cat ~/.naanlang/naanlangrc
{
    "ideserver": {
        "guid": "mysecret"
        "baseport": 8020
    }
}
```

Another option is to define an environment variable for NaanIDE, which can also define a static port. For example, add something like the following to your `.bash_profile` on Linux or MacOS:

```
export NAANIDE_SERVER_GUID="mysecret"
export NAANIDE_SERVER_PORT=8020
```
Like the `--port` command line option, the PORT environmental variable specifies a fixed server port. The server will not start if that is not free. The naanlangrc file specifies a base port, so the server will increment that port until an available one is found.