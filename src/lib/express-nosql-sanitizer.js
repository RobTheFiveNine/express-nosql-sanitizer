/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

const operators = require('./operators');

const MODE_NORMAL = 'normal';
const MODE_STRICT = 'strict';

function checkIsDangerous(key, mode) {
  if (mode === MODE_STRICT) {
    return operators.includes(key.toLowerCase());
  }

  return key[0] === '$';
}

function cleanObject(obj, parentKey, mode, onClean) {
  if ((obj !== null) && (typeof obj === 'object')) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const objectPath = `${parentKey}.${key}`;

      if (checkIsDangerous(key, mode)) {
        const value = obj[key];

        // eslint-disable-next-line no-param-reassign
        delete obj[key];

        if (onClean) {
          onClean(objectPath, key, value);
        }
      }

      cleanObject(obj[key], objectPath, mode, onClean);
    }
  }
}

function createMiddleware({ mode, onClean } = {}) {
  return (req, res, next) => {
    if (typeof req.body === 'object') {
      cleanObject(
        req.body,
        'req.body',
        mode || MODE_NORMAL,
        onClean,
      );

      cleanObject(
        req.query,
        'req.query',
        mode || MODE_NORMAL,
        onClean,
      );
    }

    next();
  };
}

createMiddleware.MODE_NORMAL = MODE_NORMAL;
createMiddleware.MODE_STRICT = MODE_STRICT;

module.exports = createMiddleware;
