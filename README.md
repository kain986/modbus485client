# modbus485client
modbus 485 client with ELECTRON

this Project is a simply modbus485 comunication client, i've searched a lot for a free to0l like this but didnt find anything free and simple
so i decided to create my own.

some of the code came out directly from gemini

actual supported features

- modbus 485 RTU only (connection parameter fully editable)
- single register write/read ( register address can be HEX or Dec)
- editable parameter table ( you can associate a label to each register to simplify param. management)
- save and load table cfg ( a compiled table can be saved in json format to store parameter files )

## Prerequisites

Before you can run or develop this application, you will need the following software installed on your system:

* **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine. npm is distributed with Node.js, so installing Node.js will also install npm. You can download it from [https://nodejs.org/](https://nodejs.org/).
* **npm (Node Package Manager):** The package manager for JavaScript and the world's largest software registry. It is used to install and manage the project's dependencies. Usually installed automatically with Node.js. You can verify your installation by running `npm -v` in your terminal.
* **Electron:** A framework for building native desktop applications with web technologies like JavaScript, HTML, and CSS. It is used to run the application during development and is also used by the build process to create the final executable. You will typically install Electron as a development dependency for your project using npm.


------------------------------------------------------------------------------------------------------
instruction - lauch on electron (Development Mode)
------------------------------------------------------------------------------------------------------
To run the application in development mode (requires Node.js and npm installed):

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd 485-drive-explorer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the application:**
    ```bash
    npm start
    ```

This command will launch the Electron application.

------------------------------------------------------------------------------------------------------
instruction - build portable
------------------------------------------------------------------------------------------------------

If you want to build the application's executable yourself (requires Node.js and npm installed, as well as native build tools):

1.  **Clone the repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd 485-drive-explorer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Build the executable:**
    ```bash
    npm run build
    ```

    The executable will be created in the `dist` folder. This might be an installer (`.exe` if you configured NSIS) or a portable file (`.exe` if you configured the `portable` target).


    --------------------------------------------------------------------------------------------
    ## client screen
    --------------------------------------------------------------------------------------------

    ![image](https://github.com/user-attachments/assets/a38ecc90-2e0c-4a18-b343-58e80cae81c1)

![image](https://github.com/user-attachments/assets/1c25fd5a-4682-43ba-8edf-92fd5c7ba19e)


