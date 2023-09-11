# Capstone Backend
This is my RESTFUL JSON API. Within this directory (backend), there are helper function files, test files, config files, and more. Please read the config file, the sql functions use variables from them.

# Users in Seed File
These are for developer purposes. They will not work when trying to login with their credentials because they are not secured with bcrypt. To create users to use for developer purposes, send a request to the register route.

## Running Tests
Make sure the Postgresql server is running, but the app server does not have to be running. Then navigate to the directory the test file is in, and run:
```
npm run test file_name
```
Or, from the command line, in the directory, backend, run:
```
npm test
```

# API and App Keys
This app uses JSON Web Tokens so make sure to make your own keys!