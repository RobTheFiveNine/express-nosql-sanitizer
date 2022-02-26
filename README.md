# express-nosql-sanitizer
[![build and test](https://github.com/RobTheFiveNine/express-nosql-sanitizer/actions/workflows/test.yml/badge.svg)](https://github.com/RobTheFiveNine/express-nosql-sanitizer/actions/workflows/test.yml) [![Coverage Status](https://coveralls.io/repos/github/RobTheFiveNine/express-nosql-sanitizer/badge.svg?branch=develop)](https://coveralls.io/github/RobTheFiveNine/express-nosql-sanitizer?branch=develop) [![npm](https://img.shields.io/npm/v/express-nosql-sanitizer)](https://www.npmjs.com/package/express-nosql-sanitizer)

## Quick Start
Add the library to your project:

```bash
npm install express-nosql-sanitizer
```

Import the library (line 2) and `use` the middleware (line 5):

```javascript
const express = require('express');
const nosqlSanitizer = require('express-nosql-sanitizer');

const app = express();
app.use(nosqlSanitizer());

app.get('/', (req, res)  => {
  res.send('Hello world');
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000');
});
```

## What Is NoSQL Injection?
A common design pattern amongst Express applications that utilise libraries like Mongoose or the native MongoDB library is to use the body parser middleware to automatically deserialise JSON bodies into objects that are stored in `req.body` and subsequently pass this (or a child prop) as the query filter.

The problem with this, is that it is possible for a malicious user to specify something other than a valid value, and instead add JSON that will be deserialised into a [Query / Projection Operator](https://docs.mongodb.com/manual/reference/operator/query/).

A basic theoretical example of this would be, if the `username` and `pass` props of `req.body` were used as the filter for a request that processes a login attempt, like so:

```javascript
const express = require('express');
const User = require('./UserModel');

const app = express();

app.post('/login', async (req, res)  => {
  const user = await User.find({
    username: req.body.username,
    pass: req.body.pass,
  });

  if (user) {
    res.send('Logged in!');
  } else {
    res.send('Incorrect credentials');
  }
});
```

In this example, a typical request body that would be expected would be something such as :

```json
{
  "username": "robocop",
  "pass": "ocp1"
}
```

If, however, a user was to submit the following request, they could login as `robocop` without knowing the password:

```json
{
  "username": "robocop",
  "pass": {
    "$ne": ""
  }
}
```

By submitting an object with the `$ne` operator, it changes the query to be the SQL equivalent of:

```sql
SELECT * FROM users WHERE username = 'robocop' AND pass <> ''
```

As long as a value exists in the `pass` field, which it should, the attacker would successfully authenticate as `robocop`; not good.

## How This Library Helps
Although the best solution to preventing injection attacks and other vulnerabilities is to **always** validate all user input - sometimes things slip through the net. This library aims to provide a catch-all means that should help mitigate any instances where that happens.

By adding this middleware to your Express application, the `req.body` object will be checked to ensure props that are valid MongoDB operators (when in strict mode) or that look like operators (props that start with a `$`, when in normal mode) and remove them before handing over to the request handler.

If this library is used, the example from the example in the previous section would change the deserialised body from this:

```json
{
  "username": "robocop",
  "pass": {
    "$ne": ""
  }
}
```

To this:

```json
{
  "username": "robocop",
  "pass": {}
}
```

As such, the previous example would not allow the attacker to inject an operator and bypass the desired logic.

## What This Library Does Not Do
The library does not protect from injections where user input is being passed to strings that are used to construct queries. In most cases, there is no need to build queries like this, and you should either:

- Refactor your code to not do this
- Ensure that all user input passed through is sanitised appropriately

It also does not scan `req.params` - the URL parameters are never deserialised and are not susceptible to this type of attack without the developer adding code to deserialise JSON strings. In this case, again, the input must be sanitised manually and refactoring should be considered.

## Advanced Usage
The function used to create the middleware accepts an optional configuration object that contains two properties:

- `mode`: a string that sets the method used to determine which props are unsafe
- `onClean`: a callback function that is invoked every time an unsafe prop is identified and cleansed

### Specifying a Mode
The two modes available are `MODE_NORMAL` and `MODE_STRICT`.

When using the normal mode, any prop that begins with `$` will be considered dangerous and removed from the request body.

When using the strict mode, only props that are included in the export of [operators.js](src/lib/operators.js) are considered dangerous.

By default, `MODE_NORMAL` is used.

**Example:**
```javascript
const express = require('express');
const nosqlSanitizer = require('express-nosql-sanitizer');

const app = express();
app.use(nosqlSanitizer({
  mode: nosqlSanitizer.MODE_STRICT,
}));
```

### Specifying an onClean Callback
An optional function can be assigned to `onClean` which is invoked with the following arguments:

- `objectPath:string`: the path to the sanitised prop in dot notation
- `key:string`: the name of the dangerous prop
- `value:any`: the value that was assigned to the prop prior to removal

The function will be synchronously invoked every time a prop is cleansed immediately after the event.

**Example:**
```javascript
const express = require('express');
const nosqlSanitizer = require('express-nosql-sanitizer');

const app = express();
app.use(nosqlSanitizer({
  onClean: (objectPath, key, value) => {
    console.log(objectPath, key, value);
  },
}));
```

## License
This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.