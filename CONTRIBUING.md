Setting Up Your Environment
===========================
There is not much that needs to be done to setup a development environment to make changes to this project. 

Ensure you branch from the `develop` branch, and follow the quick start guide in `README.md` to setup a simple sample project.

Information on how malicious payloads are formed can be found in `README.md` and used to test the library.

Code Guidelines
===============
If you are using vscode, you should receieve warnings from `eslint` if any code changes are not following the style guidelines. If not, you should run eslint manually via yarn (`yarn eslint`).

The library interface should maintain backwards compatability. Any additions to the interface should be documented both in `src/lib/express-nosql-sanitizer.d.ts` and in the examples found in `README.md`.

Opening Pull Requests
=====================
Pull requests should be made against the `develop` branch, the `stable` branch is used to track the latest stable release that is published via NPM.

Ensure your pull request has sufficient information in order to test the bug fix or feature that is being added and contains the latest commit to `develop` that is upstream to minimise the need to resolve any merge conflicts.