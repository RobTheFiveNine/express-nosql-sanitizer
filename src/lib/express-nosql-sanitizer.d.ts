/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export = createMiddleware;

/**
 * Create the middleware to be used with Express.js.
 * @param config Optional configuration options.
 */
declare function createMiddleware(config?: {
  /**
   * Defines the method used to determine unsafe props
   * sent in the request body. See MODE_NORMAL and MODE_STRICT
   * 
   * Default: MODE_NORMAL
   */
  mode: String;

  /**
   * A callback function invoked every time a prop is sanitized
   * The function is invoked with the args:
   * objectPath, key, value.
   */
  onClean: Function;
}): (req: any, res: any, next: Function) => void;

declare namespace createMiddleware {
  export { MODE_NORMAL };
  export { MODE_STRICT };
}

/**
 * The mode used to filter any prop that starts with $.
 */
declare const MODE_NORMAL: "normal";

/**
 * The mode used to filter a strict list of MongoDB operators without the use of wildcards.
 */
declare const MODE_STRICT: "strict";
