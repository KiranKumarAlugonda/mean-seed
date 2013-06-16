# MEAN (Mongo Express Angular Node) stack
*MongoDB Express.js AngularJS Node.js + Grunt Jasmine*

This is project is meant to be a starting point for full stack javascript HTML5 websites and mobile apps (cross platform, responsive, can optionally be wrapped with TriggerIO, Phonegap, etc.).
- It's meant to be:
	- more specific than barebones language specific seeds such as angular-seed so you can start out with core functionality such as user login, sign up, forgot password, etc. out of the box, BUT:
	- broad and modularized enough to be used for a wide variety of applications. Angular and Node are the core technologies and Express, Mongo (using mongodb-native) and Grunt are pretty heavily integrated but all other technologies can be swapped as needed with a little bit of work.

- mongodb-native is used (rather than mongoose) as the npm plugin for the node-mongoDB interface.
- Other key technologies used:
	- Grunt.js - build tool.
	- Jasmine - testing framework - used for both frontend (with Karma) and backend (with jasmine-node) testing. Can switch in other testing frameworks in place of Jasmine if you want.
	- LESS - CSS pre-processor. Twitter Bootstrap CSS framework is currently NOT used but can be easily integrated. SASS/SCSS/Compass can be switched in instead of LESS pretty easily as well.
- For a full list of dependencies / technologies see below, though many of the non-core ones can be switched out as necessary.
	- frontend: `app/src/lib`
	- backend: `package.json`
	
Feel free to fork the project to make seeds with other default technologies (Mongoose instead of mongo-db-native, SASS instead of LESS, Mocha instead of Jasmine for backend tests, etc.).

Any suggestions for improvement welcome!

### NOTE: In general, each (major) directory should have its own README file to avoid this one from getting bloated and hard to follow. Currently there is (just) a README specific to the frontend in the `app/src` folder.

## Server Setup

1. [ONCE PER MACHINE/ENVIRONMENT] Make sure that the server environment is properly set up first. This only needs to be done once per machine. Thus, some of this may already be done and may therefore be skipped.
	- Install git, nodejs, and mongodb.
		- See other README's (i.e. `README-server_setup`) or just google search for steps on how to do this.
	- Configure git (required for pushing and pulling)
		- `git config --global user.name "<your name>"`
		- `git config --global user.email "<your email>"`
		- `git config --global --add color.ui true`
	- Install global NPM packages.
		- `sudo npm install -g grunt-cli jasmine-node less karma yuidocjs forever`
	- Clone the project to your desired folder location with git.
	
2. [ONCE PER APPLICATION - THIS SHOULD ONLY BE DONE BY THE INITIAL/CORE DEVELOPER ONCE. IF YOU DON'T KNOW WHAT THIS MEANS, SKIP IT] Update all default configuration properties in the following configuration files. Typical fields to update include `name` and `title`.
	- package.json
	- app/configs/config.json

3. Install `nodejs` dependencies using `npm`. This only needs to be done once initially, but must be re-run every time package.json is updated. When in doubt, run `npm install` from your project root since you can't run it too much (if you run it extra times it won't do anything).
```bash
cd /path/to/project
npm install
```
	- NOTE: If you get an EACCESS error on `npm install`, try it with `sudo` in front..
	- NOTE: If you are on Windows and get a bson error (or any errors, for that matter), try it with Cygwin. Sometimes it doesn't work on Git Bash, but it will on Cygwin due to permissions issues. See http://stackoverflow.com/questions/14100027/cant-install-js-bson for more information.

4. [PRODUCTION SERVERS ONLY - this is NOT required so you can skip this step] Install email templates. Since there are both Windows and non-Windows versions and they can create installation issues if used on the wrong machine, these cannot be included in package.json and must instead be installed manually. If on Windows, use `email-templates-windows`.
```bash
cd /path/to/project
npm install email-templates
```

5. Copy the default configuration file into the project root directory and edit as needed. This only needs to be done once, but must be updated every time the file is updated.
```bash
# in root project directory
# copy a pre-exiting config file
# OLD - copy just the core file
# mkdir configs
# cp app/configs/config.json configs/config.json
# NEW - copy the whole directory (to get alternate configs - i.e. for heroku, triggerio)
cp -R app/configs configs
# Copy test configuration (for backend tests) then update it accordingly for the test environment.
cp app/configs/config.json app/test/config.json
# Specifically, change 'db.database' and 'session.store.db' to a different testing database, such as 'test_temp'. Also change the `server.port` so that way both the test server and the non-test server can run at the same time.
```

6. Run grunt from the root project folder (the folder that has "Gruntfile.js" in it) to build all files. Grunt should be run after most file changes and prior to any commits. NOTE: there are other "quick" grunt commands and if you're just trying to run the app rather than develop on it, you can use `grunt q` instead.
```bash
grunt
```

7. Start the node server from the root project folder.
```bash
node run.js
```

8. To view the site and/or documentation, open a browser and go to the following urls. The precise urls used will depend on the domain and port specified in config.json. Assuming `localhost` and `3000`, they would be:
	- View site: `http://localhost:3000/`
	- View api docs: `http://localhost:3000/api/help`
	- View YUI auto documentation (make sure to run `grunt docs` first to generate these pages):
		- frontend: open `/docs/frontend/index.html` in a browser
		- backend: open `/docs/backend/index.html` in a browser


**NOTE: The backend and frontend are separated. Frontend files are located in the `app/src` folder. Everything else is considered the backend, with the exception of:**

1. `Gruntfile.js`. This builds files for both the backend and frontend, since you only want to have to run it once.
2. The `configs` folder. These files contain properties for both the backend and frontend.


## Documentation

### API (rpc) documentation and interactive usage

Go to [server]/api/help - for example, `http://localhost:3000/api/help`.
There are subpages for each "group" of calls. These should be documented on the main help page, but in general each namespace has its own page. For example, the `Auth` module's calls may be found at `http://localhost:3000/api/auth/help`.

NOTE: for security/authorization, all backend calls should be checked (to ensure a user is logged in and has privileges to complete the request specified). To simulate this for the api/help, type your authority keys into the URL and they'll be read at GET params. For example, either using the interative help login call OR the site itself, login. A `user_id` and `sess_id` are return; set these in the URL as GET params (i.e. `?user_id=38asdlfk3&sess_id=alkjefe3dk`) and they'll be passed back on all calls to authenticate. Note - this still will NOT give you access to ALL calls UNLESS you're a super admin. Super admins fields on the user object must be manually set in the database (to prevent other people from making themselves a super admin).

### YUIDoc auto documentation, generated by grunt

- Frontend docs are in `docs/frontend`. View them by opening `docs/frontend/index.html` with a browser.
- Backend docs are in `docs/backend`. View them by opening `docs/backend/index.html` with a browser.


## Testing (Jasmine)
- Uses jasmine-node for backend api tests.
- Uses Karma (with Jasmine) for frontend (Angular) tests.


## Grunt / build process

All files should be linted, tested, and well-documented - YUIDoc is used to auto-generate documentation for the both frontend and backend. Frontend files should additionally be concatenated and minified. Grunt is used for this purpose.

### Command-Line Usage

Run this from the root directory, where the `Gruntfile.js` is located.

```bash
grunt
```

This will auto-run tests, which will require 2 additional actions on your part. Instructions should be detailed in command line Grunt prompts, but here's a summary of what to do:

1. Backend jasmine-node tests run on a **test** configuration with a **test** database, as determined by the `app/test/config.json` configuration file. The tests make HTTP requests to the the corresponding test node server, so it must be running for these to work. Open a NEW command prompt (i.e. Terminal, Git Bash, Cygwin), then run node as usual with the following command line arugment: `config=test`.
```bash
cd /path/to/project
node run.js config=test
```

2. Frontend Karma tests require you to have a browser window open to the appropriate port, so open a new browser window (i.e. Google Chrome or Mozilla Firefox) and navigate to `http://localhost:9876`


### Command-Line Usage, for production.

This will cause minified files to be referenced in the app's `index.html` file, among other things.

```bash
grunt q --type=prod
```

### Other Command-Line Grunt Tasks
There may be more than the ones listed below, but these are the most important. See `Gruntfile.js` for the full list.

```bash
# Run a subset of grunt build tasks, for quicker execution. This skips the tests, among other things.
grunt q

# Build YUI docs
grunt docs
```

### Versioning
The manual setup tasks (such as copying and updating `configs` or running `npm install`) need to be periodically updated. To ensure each server is up to date, grunt will not run unless the versions match accordingly.
- If you change `package.json` or a `configs` file, increment the `versions` key accordingly in `app/configs/config.json` and `configs/config.json`, and also update the `curVersions` object in `Gruntfile.js` to match. This will then prevent grunt from running until the local environment is brought up to date by re-syncing config.json or running npm install.
- After pulling code: Follow the console instructions upon running `grunt` if it says your files are out of date.


## Conventions / Style guide

TODO: Add final set of compiled and merged conventions.

In general, we try to follow "standards" with regard to javascript coding conventions. NOTE: see the below conventions as they OVERWRITE anything listed in the below links.
- http://javascript.crockford.com/code.html
- https://github.com/rwldrn/idiomatic.js/ (from http://addyosmani.com/blog/javascript-style-guides-and-beautifiers/ )
- https://npmjs.org/doc/coding-style.html

Additionally, all code is linted by grunt and thus must pass linting tests. The most important thing, however, is that all code be CONSISTENT and follow the same conventions. Here are some specifics:
- TAB characters should be used to indent, not spaces. (We use 4 spaces per tab.)
- Use YUIDoc-style documentation for all files: a general description at the top plus a table of contents (@toc) that summarizes the main functions and parts of the file. Each function should have its inputs and outputs (@param) detailed, together with example usage.
- Test files should be named with a `.spec.js` suffix as per the Jasmine specification.


## Frameworks, MVC (Model View Controller) and Flow
The app (both backend and frontend) follow MVC but the file structure is modularized (so the view, controller and model are typically in the same folder) as opposed to all the controllers in one folder, all the models in one folder and all the views in one folder as may be more common. The module approach allows for easier adding, editing, and removing of components since everything the module needs is right there in the same folder. Managing dependencies and connecting modules together is easier since things are more separated.

For the backend (node), `express` is used as the (lightweight) framework with MongoDB as the database. There is NO VIEW (just controller and models) as all view code is on the frontend exclusively. The backend is slim in that the vast majority of the time it only deals with interacting with the database. The 'controllers' are just the route management and the 'models' are just the functions that do the work of CRUD (create, read, update, delete) on the database. The steps are:
1. incoming request --> controller: the controller (router) receive a request (HTTP, AJAX from frontend)
2. controller --> model: the controller calls the appropriate model function to do the actual processing (CRUD)
3. model: the model does the work and returns the result
4. model --> controller: the controller takes the result from the model (typically via a promise or other asynchronous method)
5. controller --> outgoing response: the controller sends the result back as a response
All of the above is handled in 2 files - both in the `modules/controllers` folder.


## Common / Non-modularized / Site-specific files
You'll likely have to edit these files at some point.
NOTE: frontend non-modularized files (in `src` folder) are documented in the `src` README
- `app/modules/services/security/security.js`

### `common` directory files most likely/often to be updated
- db_schema.json
- config [all config files if have to make updates]
- modules
	- services
		- security/security.js
- routes
	- api
		- index.js
		- rpc
			- api-help.html
- test
	- all.spec.js


## High-Level Directory Structure

- bin	Scripts (These are not currently used as scripts themselves, but serve as instructions for commands to run.)
- app	Holds backend AND frontend code.
	- src Frontend code. See the frontend's README file.
	- configs		Holds predefined configuration(s).
		- config.json	Example configuration(s) to be copied to the root directory and then used by the app.
		- tests
		- index.js
		- load.js
	- modules	Holds modularized code pieces. The bulk of the files are here.
		- controllers	Holds route / api controller files and their associated model files and tests. Most new files will go here.
			- [module_name]	Folder for this module (controller + model + tests)
				- [module_name].api.js		The controller/router.
				- [module_name].js		The model (where the bulk of the functions / code goes). This interacts with the database.
				- [module_name].test.js		The tests for this route/api call.
		- services	Holds libraries of common helper functions. These don't interact with api's or routes. This is only for app specific modules - ideally libraries should be built (and published) as public npm modules and referenced that way so ideally this folder should be pretty small.
	- routes
		- api	RPC api route setup
			- rpc	RPC specific files
				- api-help.html		The auto-generated, interactive help page for the api reference.
				- index.js
			- base.js
			- index.js		Main entry file and router for api. Used to set (a) new route endpoint(s).
		- index.js	This serves index.html, which in turn serves all frontend files.
	- test		The backend test core files.
		- all.spec.js		The main test file, which includes other modularized test files.
		- apiTestHelpers.js		Common functions for setup and running backend tests.
		- config.json		The configuration for use with tests. Uses a DIFFERENT database. NOTE: doesn't exist until AFTER copy it (not under version control).
	- database.js
	- db_schema.json		Used as documentation for the db schema and also by database.js to form the collections interface, for use with db.[collection].[method].
	- depdendency.js	Holds paths to backend folders so modules can be require'd in each file as needed without hardcoding "../" in each file.
	- index.js
	- server.js
- configs	Holds local copies of the configuration file(s) for this environment. This folder must be manually copied over from the default configs above. It is not tracked in version control.
- .gitignore
- Gruntfile.js	Grunt tasks. Build configuration for linting, testing, concating, minifying, generating documentation
- makefile
- package.json	Used for npm install
- README.md
- README-server_setup.md
- run.js	This is the node.js entry script. Run `node run.js` from the command line in the root app directory to start the server.
- yuidoc-backend.json	Config for YUI auto docs for backend.
- yuidoc-frontend.json	Config for YUI auto docs for frontend.

**NOTE: Copy the `/app/configs/config.json` file to `/configs/config.json` and to `/app/test/config.json` and update it for your environment. The root-level configs/config.json is the main configuration file that grunt and the server application use.**

## Code standards and expectations

All code should be:

1. Linted
2. Tested
3. Well-documented, clear, and understandable
4. Maintainable, easy to change and update. Modular.
5. Performant
6. Well designed, with good UI, UX, and aesthetics (for frontend code)


## Common actions
- Add a new api route group. To add an individual api call to an existing group, just edit the files below accordingly.
	1. Create a new folder in `app/modules/controllers` with the name of your new api endpoint namespace and fill it with the following files. In general, just copy an existing route and then edit the files to fit your new route.
		1. [your-module].api.js		The rpc route setup (endpoints, parameters, function calls)
		2. [your-module].js		The controller/model file that interacts with the database and actually does the work
		3. [your-module].test.js		Jasmine-node tests for these new routes
	2. `require` your new api file and set up the router endpoints in `app/routes/api/index.js`.
	3. Update `app/test/all.spec.js` to include and run your new tests. Typically, 3 additions need to be made:
		1. `require` [your-module].test.js file at the top.
		2. Call it in the `initModules` function. (Pass in the db, api, and any other modules you need access in your test file.)
		3. Actually run your tests. In general, these should have a `run` function that returns a promise when all tests are complete.
	4. Add an html link to `app/routes/api/rpc/api-help.html` to add your api to the reference. (The links are somewhere around line 365.)

- Add a new service or library of functions.
	1. Create a new folder in `app/modules/services` with your file.
	2. `require` your new module in `app/routes/api/index.js` and pass it in to the any controller modules that need to use it.

- Add a new database collection
	1. Update `app/db_schema.json` with the new collection. Fields are technically optional but highly recommended: we use pure mongo-db-native, so a strict schema is NOT enforced. Fields listed here are just for documentation purposes.


## Git Workflow

### General steps

1. Work locally from your own computer.
2. Use `git commit` to commit changes locally.
3. Use `git pull <remote> <branch>` to merge your changes with the remote branch in question on your local computer. (Ex: `git pull origin master`)
4. Use `git push <remote> <branch>` to update the remote branch with your newly merged changes. (Ex: `git push origin master`)


## Project Files

### Configuration

#### config.json

For a more thorough example config, see `app/configs/config.json`.

- config.env
	- The configuration environment. This is subsequently set to the `NODE_ENV` environment variable.
- config.server
	- Holds server-specific options like `port` and `domain`.
- config.db
	- MongoDB connection options.
- config.logKey
	- App log key.
- config.cookie
	- Cookie parser settings such as `secret`.
- config.session
	- Express session settings
- config.session.store
	- Session store configuration options.
- config.ssl
	- HTTPS server specific settings.

## Express Configuration

Setting                 | Value
-------                 | -----
Static Path             | set by `config.json`
//Session Store           | `connect-mongo`
//Session Authentication  | `passport`
//User Password Hashing   | `SHA512` with random salt on each password change
AngularJS Route         | `/`
API:Main Moudle Route   | `/api/`, `/api/help`


## TODO
- Use Yeoman (once it comes out of 1.0 Beta)
- modularize the non-modularized files so the configurations (all the custom code) can edited separately from the functions and generic code.
- make a Mongoose fork for people who want to use Mongoose instead of mongo-db-native as the node-mongo interface?
- make a SASS/SCSS fork for people who prefer SASS/Compass over LESS for CSS pre-processing?