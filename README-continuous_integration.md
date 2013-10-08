# Continuous Integration (CI)

## Overview
An "agile" process of rapid iteration and frequent commits (daily) and tests (auto-run on every commit/push) so the build is ALWAYS working and as many steps as possible are automated (i.e. you can deploy to any environment with just ONE action/command/push of a button). Testing covers various levels - from unit to end-to-end (E2E) tests and ideally multiple device testing and performance/capacity and manual user testing. So you KNOW that when something has made it through all those steps (again ideally as automated and quickly as possible) that it's high quality and good to know. No more "endless Q&A" and bugs that pop up days, weeks, or months later.

- Resources / links
	- http://www.martinfowler.com/articles/originalContinuousIntegration.html
	- Google Image search 'continuous integration' or 'continuous integration diagram' to see examples. Basically the "steps" are:
		1. write code
		2. check code into version control (i.e. Github)
		3. build code (compile and package into final assets - concat, minify, etc.)
		4. run automated tests
			1. [small] unit
			2. [medium] integration
			3. [large] end-to-end (E2E)
			4. [large] multi platform (browser/UI/device testing)
			5. [large] performance (speed, capacity, security), aka "nonfunctional testing"
		5. generate reports and notify / rollback on error. Fix then re-deploy (go back to step 1 until success)
			1. code coverage
		6. on success, deploy to production (environment / server - the tests and CI should be run on a mock/staging server that's as similar to production as possible but not the same since it can fail; only SUCCESSFUL builds get deployed)
		7. run manual customer/user acceptance tests / collect feedback, aka "usability / exploratory testing"
		NOTE: as many steps as possible should be AUTOMATED - especially steps 3, 4, and 5 (and 6). It should only take ONE manual action/command to do everything - which should be the commiting to version control; that should automatically kick off the build, testing, report/notification generating and deploying to production (on success).
		
		Other items that are nice:
		- monitoring: server monitoring, alerting
		- feature flipper system / automation (i.e. rolling out features to different users, A/B testing)

- Grunt (+ (Git) Web Hook) vs CI
	- Grunt does / can do 90% of Continuous Integration - you can automate your builds and run your tests already so the only things you really need to do on top of that are:
		- auto run on remote servers the following:
			- `npm install`
			- `grunt`
		- you can do this with a Github "Webhook" which basically auto pings your server after a Git push so you can then run these scripts and "auto-deploy" remotely on every Git push. So you ONE command to deploy (build, run tests, etc.) just becomes 'git push [remote] [branch]'
			- http://stackoverflow.com/questions/9132144/how-can-i-automatically-deploy-my-app-after-a-git-push-github-and-node-js
			- http://fideloper.com/node-github-autodeploy
			- basically there's 'pre-commit', 'post-commit', etc. files that you can run (shell) commands from before/after certain git actions so you can just have those run your scripts/grunt and you're all set (without any additional tools)
		- so the only thing that a 'Continuous Integration tool' does for you is provide a web interface (and notifications on failures) to display the output/results (for tracking and public viewing by your entire team so they can see if/when it fails) of the deploys and to setup that Git webhook for you. While it can do more, with Grunt, it really just provides visibility/tracking; Grunt + Github can do all the actual work already without any Continuous Integration tool at all. And this fits with the saying that "continuous integration is a mindset and workflow more than a tool". At least as far as I'm aware..

## Tools (to get that last 10% more easily)
- There are many. The most popular ones are Jenkins, TravisCI (and maybe TeamCity) though as we're a node.js app, we'd like something node.js based and simple to setup. The 2 most popular ones seem to be:
	- StriderCD - more popular, better maintained, more robust and feature rich BUT not working..
		- Windows installation issues - need some hard core building stuff so have to install a bunch of stuff.. (works fine on Mac OS X and Linux though as these tools come pre-installed)
			- https://github.com/ncb000gt/node.bcrypt.js#dependencies
				- I installed the HUGE 4.5GB Windows Visual Studio 2012 Express AND Win OpenSSL and that go through SOME errors but still have some..
			- npm install pty.js failing now..
		- not working - even after just installing remotely on Linux and got it to launch, the builds would just run forever and wouldn't actually output anything or succeed..
			- it's possible my config was wrong the first time but as there's no way to cancel a build, my later attempts never ran so I couldn't see if it would eventually work.. so gave up for now after some detailed Googling to find solutions..
	- Concrete
		- much simpler, smaller, and installs fine on Windows
		- the regular one is good but doesn't seem to have auto Git web hooks built in so I used this fork instead:
			- https://github.com/edy/concrete
		- NOTE: you MUST be the appropriate Linux/Ubuntu user with the GitHub credentials set up (via git config I believe?) otherwise it won't work and won't fail gracefully - it will just have a blank commit (since it couldn't pull anything due to lack of authorization) and give a breaking syntax error in git.js on commit[2].split line that cannot call method 'split' of undefined..