# Testing

## Overview
### Definitions / Types
There's LOTS of different testing definitions but in general we use 5:
1. [small] Unit
2. [medium] Integration / Midway (How different units communicate and work together. But not necessary user facing)
3. [large] End-To-End (E2E). Aka "acceptance" or "functional"
4. Multiple Device / Browser Testing (aka "UI Testing"?)
5. [large] Performance (speed, capacity, security). Aka "nonfunctional acceptance/E2E"

### Manual vs Automated
- Automate as much as possible but some manual will be necessary (typically on UI/device testing and on acceptance testing where we get in front of real users and demo it). A last type of testing may thus be called “usability / exploratory testing” - this is manual testing and showcasing.

### Tools
- Jasmine (both for backend and frontend)
- Karma (test runner)

## Backend
### Jasmine Node
	- make sure to have the test server running

## Frontend
### Jasmine / Karma for unit & end-to-end (E2E) tests
- Gotchas:
	- for E2E tests: make sure to have the server running and set the "proxies" to the web url
	- make sure to install karma-ng-scenario NPM module (via package.json - installing globally didn't seem to work for me)
	- install PhantomJS for "headless" testing (so don't need a browser open - this makes configuration easier and is required for running tests via the command line without extra steps (i.e. via Grunt and Continuous Integration)
	- make sure your Karma (NPM) module and dependencies are up to date and matched with the proper configuration files (one config file for unit tests and one for E2E tests). See here for example working configs:
		- app/src/config
			- karma.conf.js
			- karma-e2e.conf.js
		- Gruntfile.js (in the Karma section)