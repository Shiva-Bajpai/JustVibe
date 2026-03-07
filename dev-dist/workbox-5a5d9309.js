define(['exports'], (function (exports) { 'use strict';

    // @ts-ignore
    try {
      self['workbox:core:7.3.0'] && _();
    } catch (e) {}

    /*
      Copyright 2019 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    /**
     * Claim any currently available clients once the service worker
     * becomes active. This is normally used in conjunction with `skipWaiting()`.
     *
     * @memberof workbox-core
     */
    function clientsClaim() {
      self.addEventListener('activate', () => self.clients.claim());
    }

    /*
      Copyright 2019 Google LLC
      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    const logger = (() => {
      // Don't overwrite this value if it's already set.
      // See https://github.com/GoogleChrome/workbox/pull/2284#issuecomment-560470923
      if (!('__WB_DISABLE_DEV_LOGS' in globalThis)) {
        self.__WB_DISABLE_DEV_LOGS = false;
      }
      let inGroup = false;
      const methodToColorMap = {
        debug: `#7f8c8d`,
        log: `#2ecc71`,
        warn: `#f39c12`,
        error: `#c0392b`,
        groupCollapsed: `#3498db`,
        groupEnd: null // No colored prefix on groupEnd
      };
      const print = function (method, args) {
        if (self.__WB_DISABLE_DEV_LOGS) {
          return;
        }
        if (method === 'groupCollapsed') {
          // Safari doesn't print all console.groupCollapsed() arguments:
          // https://bugs.webkit.org/show_bug.cgi?id=182754
          if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
            console[method](...args);
            return;
          }
        }
        const styles = [`background: ${methodToColorMap[method]}`, `border-radius: 0.5em`, `color: white`, `font-weight: bold`, `padding: 2px 0.5em`];
        // When in a group, the workbox prefix is not displayed.
        const logPrefix = inGroup ? [] : ['%cworkbox', styles.join(';')];
        console[method](...logPrefix, ...args);
        if (method === 'groupCollapsed') {
          inGroup = true;
        }
        if (method === 'groupEnd') {
          inGroup = false;
        }
      };
      // eslint-disable-next-line @typescript-eslint/ban-types
      const api = {};
      const loggerMethods = Object.keys(methodToColorMap);
      for (const key of loggerMethods) {
        const method = key;
        api[method] = (...args) => {
          print(method, args);
        };
      }
      return api;
    })();

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    const messages = {
      'invalid-value': ({
        paramName,
        validValueDescription,
        value
      }) => {
        if (!paramName || !validValueDescription) {
          throw new Error(`Unexpected input to 'invalid-value' error.`);
        }
        return `The '${paramName}' parameter was given a value with an ` + `unexpected value. ${validValueDescription} Received a value of ` + `${JSON.stringify(value)}.`;
      },
      'not-an-array': ({
        moduleName,
        className,
        funcName,
        paramName
      }) => {
        if (!moduleName || !className || !funcName || !paramName) {
          throw new Error(`Unexpected input to 'not-an-array' error.`);
        }
        return `The parameter '${paramName}' passed into ` + `'${moduleName}.${className}.${funcName}()' must be an array.`;
      },
      'incorrect-type': ({
        expectedType,
        paramName,
        moduleName,
        className,
        funcName
      }) => {
        if (!expectedType || !paramName || !moduleName || !funcName) {
          throw new Error(`Unexpected input to 'incorrect-type' error.`);
        }
        const classNameStr = className ? `${className}.` : '';
        return `The parameter '${paramName}' passed into ` + `'${moduleName}.${classNameStr}` + `${funcName}()' must be of type ${expectedType}.`;
      },
      'incorrect-class': ({
        expectedClassName,
        paramName,
        moduleName,
        className,
        funcName,
        isReturnValueProblem
      }) => {
        if (!expectedClassName || !moduleName || !funcName) {
          throw new Error(`Unexpected input to 'incorrect-class' error.`);
        }
        const classNameStr = className ? `${className}.` : '';
        if (isReturnValueProblem) {
          return `The return value from ` + `'${moduleName}.${classNameStr}${funcName}()' ` + `must be an instance of class ${expectedClassName}.`;
        }
        return `The parameter '${paramName}' passed into ` + `'${moduleName}.${classNameStr}${funcName}()' ` + `must be an instance of class ${expectedClassName}.`;
      },
      'missing-a-method': ({
        expectedMethod,
        paramName,
        moduleName,
        className,
        funcName
      }) => {
        if (!expectedMethod || !paramName || !moduleName || !className || !funcName) {
          throw new Error(`Unexpected input to 'missing-a-method' error.`);
        }
        return `${moduleName}.${className}.${funcName}() expected the ` + `'${paramName}' parameter to expose a '${expectedMethod}' method.`;
      },
      'add-to-cache-list-unexpected-type': ({
        entry
      }) => {
        return `An unexpected entry was passed to ` + `'workbox-precaching.PrecacheController.addToCacheList()' The entry ` + `'${JSON.stringify(entry)}' isn't supported. You must supply an array of ` + `strings with one or more characters, objects with a url property or ` + `Request objects.`;
      },
      'add-to-cache-list-conflicting-entries': ({
        firstEntry,
        secondEntry
      }) => {
        if (!firstEntry || !secondEntry) {
          throw new Error(`Unexpected input to ` + `'add-to-cache-list-duplicate-entries' error.`);
        }
        return `Two of the entries passed to ` + `'workbox-precaching.PrecacheController.addToCacheList()' had the URL ` + `${firstEntry} but different revision details. Workbox is ` + `unable to cache and version the asset correctly. Please remove one ` + `of the entries.`;
      },
      'plugin-error-request-will-fetch': ({
        thrownErrorMessage
      }) => {
        if (!thrownErrorMessage) {
          throw new Error(`Unexpected input to ` + `'plugin-error-request-will-fetch', error.`);
        }
        return `An error was thrown by a plugins 'requestWillFetch()' method. ` + `The thrown error message was: '${thrownErrorMessage}'.`;
      },
      'invalid-cache-name': ({
        cacheNameId,
        value
      }) => {
        if (!cacheNameId) {
          throw new Error(`Expected a 'cacheNameId' for error 'invalid-cache-name'`);
        }
        return `You must provide a name containing at least one character for ` + `setCacheDetails({${cacheNameId}: '...'}). Received a value of ` + `'${JSON.stringify(value)}'`;
      },
      'unregister-route-but-not-found-with-method': ({
        method
      }) => {
        if (!method) {
          throw new Error(`Unexpected input to ` + `'unregister-route-but-not-found-with-method' error.`);
        }
        return `The route you're trying to unregister was not  previously ` + `registered for the method type '${method}'.`;
      },
      'unregister-route-route-not-registered': () => {
        return `The route you're trying to unregister was not previously ` + `registered.`;
      },
      'queue-replay-failed': ({
        name
      }) => {
        return `Replaying the background sync queue '${name}' failed.`;
      },
      'duplicate-queue-name': ({
        name
      }) => {
        return `The Queue name '${name}' is already being used. ` + `All instances of backgroundSync.Queue must be given unique names.`;
      },
      'expired-test-without-max-age': ({
        methodName,
        paramName
      }) => {
        return `The '${methodName}()' method can only be used when the ` + `'${paramName}' is used in the constructor.`;
      },
      'unsupported-route-type': ({
        moduleName,
        className,
        funcName,
        paramName
      }) => {
        return `The supplied '${paramName}' parameter was an unsupported type. ` + `Please check the docs for ${moduleName}.${className}.${funcName} for ` + `valid input types.`;
      },
      'not-array-of-class': ({
        value,
        expectedClass,
        moduleName,
        className,
        funcName,
        paramName
      }) => {
        return `The supplied '${paramName}' parameter must be an array of ` + `'${expectedClass}' objects. Received '${JSON.stringify(value)},'. ` + `Please check the call to ${moduleName}.${className}.${funcName}() ` + `to fix the issue.`;
      },
      'max-entries-or-age-required': ({
        moduleName,
        className,
        funcName
      }) => {
        return `You must define either config.maxEntries or config.maxAgeSeconds` + `in ${moduleName}.${className}.${funcName}`;
      },
      'statuses-or-headers-required': ({
        moduleName,
        className,
        funcName
      }) => {
        return `You must define either config.statuses or config.headers` + `in ${moduleName}.${className}.${funcName}`;
      },
      'invalid-string': ({
        moduleName,
        funcName,
        paramName
      }) => {
        if (!paramName || !moduleName || !funcName) {
          throw new Error(`Unexpected input to 'invalid-string' error.`);
        }
        return `When using strings, the '${paramName}' parameter must start with ` + `'http' (for cross-origin matches) or '/' (for same-origin matches). ` + `Please see the docs for ${moduleName}.${funcName}() for ` + `more info.`;
      },
      'channel-name-required': () => {
        return `You must provide a channelName to construct a ` + `BroadcastCacheUpdate instance.`;
      },
      'invalid-responses-are-same-args': () => {
        return `The arguments passed into responsesAreSame() appear to be ` + `invalid. Please ensure valid Responses are used.`;
      },
      'expire-custom-caches-only': () => {
        return `You must provide a 'cacheName' property when using the ` + `expiration plugin with a runtime caching strategy.`;
      },
      'unit-must-be-bytes': ({
        normalizedRangeHeader
      }) => {
        if (!normalizedRangeHeader) {
          throw new Error(`Unexpected input to 'unit-must-be-bytes' error.`);
        }
        return `The 'unit' portion of the Range header must be set to 'bytes'. ` + `The Range header provided was "${normalizedRangeHeader}"`;
      },
      'single-range-only': ({
        normalizedRangeHeader
      }) => {
        if (!normalizedRangeHeader) {
          throw new Error(`Unexpected input to 'single-range-only' error.`);
        }
        return `Multiple ranges are not supported. Please use a  single start ` + `value, and optional end value. The Range header provided was ` + `"${normalizedRangeHeader}"`;
      },
      'invalid-range-values': ({
        normalizedRangeHeader
      }) => {
        if (!normalizedRangeHeader) {
          throw new Error(`Unexpected input to 'invalid-range-values' error.`);
        }
        return `The Range header is missing both start and end values. At least ` + `one of those values is needed. The Range header provided was ` + `"${normalizedRangeHeader}"`;
      },
      'no-range-header': () => {
        return `No Range header was found in the Request provided.`;
      },
      'range-not-satisfiable': ({
        size,
        start,
        end
      }) => {
        return `The start (${start}) and end (${end}) values in the Range are ` + `not satisfiable by the cached response, which is ${size} bytes.`;
      },
      'attempt-to-cache-non-get-request': ({
        url,
        method
      }) => {
        return `Unable to cache '${url}' because it is a '${method}' request and ` + `only 'GET' requests can be cached.`;
      },
      'cache-put-with-no-response': ({
        url
      }) => {
        return `There was an attempt to cache '${url}' but the response was not ` + `defined.`;
      },
      'no-response': ({
        url,
        error
      }) => {
        let message = `The strategy could not generate a response for '${url}'.`;
        if (error) {
          message += ` The underlying error is ${error}.`;
        }
        return message;
      },
      'bad-precaching-response': ({
        url,
        status
      }) => {
        return `The precaching request for '${url}' failed` + (status ? ` with an HTTP status of ${status}.` : `.`);
      },
      'non-precached-url': ({
        url
      }) => {
        return `createHandlerBoundToURL('${url}') was called, but that URL is ` + `not precached. Please pass in a URL that is precached instead.`;
      },
      'add-to-cache-list-conflicting-integrities': ({
        url
      }) => {
        return `Two of the entries passed to ` + `'workbox-precaching.PrecacheController.addToCacheList()' had the URL ` + `${url} with different integrity values. Please remove one of them.`;
      },
      'missing-precache-entry': ({
        cacheName,
        url
      }) => {
        return `Unable to find a precached response in ${cacheName} for ${url}.`;
      },
      'cross-origin-copy-response': ({
        origin
      }) => {
        return `workbox-core.copyResponse() can only be used with same-origin ` + `responses. It was passed a response with origin ${origin}.`;
      },
      'opaque-streams-source': ({
        type
      }) => {
        const message = `One of the workbox-streams sources resulted in an ` + `'${type}' response.`;
        if (type === 'opaqueredirect') {
          return `${message} Please do not use a navigation request that results ` + `in a redirect as a source.`;
        }
        return `${message} Please ensure your sources are CORS-enabled.`;
      }
    };

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    const generatorFunction = (code, details = {}) => {
      const message = messages[code];
      if (!message) {
        throw new Error(`Unable to find message for code '${code}'.`);
      }
      return message(details);
    };
    const messageGenerator = generatorFunction;

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    /**
     * Workbox errors should be thrown with this class.
     * This allows use to ensure the type easily in tests,
     * helps developers identify errors from workbox
     * easily and allows use to optimise error
     * messages correctly.
     *
     * @private
     */
    class WorkboxError extends Error {
      /**
       *
       * @param {string} errorCode The error code that
       * identifies this particular error.
       * @param {Object=} details Any relevant arguments
       * that will help developers identify issues should
       * be added as a key on the context object.
       */
      constructor(errorCode, details) {
        const message = messageGenerator(errorCode, details);
        super(message);
        this.name = errorCode;
        this.details = details;
      }
    }

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    /*
     * This method throws if the supplied value is not an array.
     * The destructed values are required to produce a meaningful error for users.
     * The destructed and restructured object is so it's clear what is
     * needed.
     */
    const isArray = (value, details) => {
      if (!Array.isArray(value)) {
        throw new WorkboxError('not-an-array', details);
      }
    };
    const hasMethod = (object, expectedMethod, details) => {
      const type = typeof object[expectedMethod];
      if (type !== 'function') {
        details['expectedMethod'] = expectedMethod;
        throw new WorkboxError('missing-a-method', details);
      }
    };
    const isType = (object, expectedType, details) => {
      if (typeof object !== expectedType) {
        details['expectedType'] = expectedType;
        throw new WorkboxError('incorrect-type', details);
      }
    };
    const isInstance = (object,
    // Need the general type to do the check later.
    // eslint-disable-next-line @typescript-eslint/ban-types
    expectedClass, details) => {
      if (!(object instanceof expectedClass)) {
        details['expectedClassName'] = expectedClass.name;
        throw new WorkboxError('incorrect-class', details);
      }
    };
    const isOneOf = (value, validValues, details) => {
      if (!validValues.includes(value)) {
        details['validValueDescription'] = `Valid values are ${JSON.stringify(validValues)}.`;
        throw new WorkboxError('invalid-value', details);
      }
    };
    const isArrayOfClass = (value,
    // Need general type to do check later.
    expectedClass,
    // eslint-disable-line
    details) => {
      const error = new WorkboxError('not-array-of-class', details);
      if (!Array.isArray(value)) {
        throw error;
      }
      for (const item of value) {
        if (!(item instanceof expectedClass)) {
          throw error;
        }
      }
    };
    const finalAssertExports = {
      hasMethod,
      isArray,
      isInstance,
      isOneOf,
      isType,
      isArrayOfClass
    };

    // @ts-ignore
    try {
      self['workbox:routing:7.3.0'] && _();
    } catch (e) {}

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    /**
     * The default HTTP method, 'GET', used when there's no specific method
     * configured for a route.
     *
     * @type {string}
     *
     * @private
     */
    const defaultMethod = 'GET';
    /**
     * The list of valid HTTP methods associated with requests that could be routed.
     *
     * @type {Array<string>}
     *
     * @private
     */
    const validMethods = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT'];

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    /**
     * @param {function()|Object} handler Either a function, or an object with a
     * 'handle' method.
     * @return {Object} An object with a handle method.
     *
     * @private
     */
    const normalizeHandler = handler => {
      if (handler && typeof handler === 'object') {
        {
          finalAssertExports.hasMethod(handler, 'handle', {
            moduleName: 'workbox-routing',
            className: 'Route',
            funcName: 'constructor',
            paramName: 'handler'
          });
        }
        return handler;
      } else {
        {
          finalAssertExports.isType(handler, 'function', {
            moduleName: 'workbox-routing',
            className: 'Route',
            funcName: 'constructor',
            paramName: 'handler'
          });
        }
        return {
          handle: handler
        };
      }
    };

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    /**
     * A `Route` consists of a pair of callback functions, "match" and "handler".
     * The "match" callback determine if a route should be used to "handle" a
     * request by returning a non-falsy value if it can. The "handler" callback
     * is called when there is a match and should return a Promise that resolves
     * to a `Response`.
     *
     * @memberof workbox-routing
     */
    class Route {
      /**
       * Constructor for Route class.
       *
       * @param {workbox-routing~matchCallback} match
       * A callback function that determines whether the route matches a given
       * `fetch` event by returning a non-falsy value.
       * @param {workbox-routing~handlerCallback} handler A callback
       * function that returns a Promise resolving to a Response.
       * @param {string} [method='GET'] The HTTP method to match the Route
       * against.
       */
      constructor(match, handler, method = defaultMethod) {
        {
          finalAssertExports.isType(match, 'function', {
            moduleName: 'workbox-routing',
            className: 'Route',
            funcName: 'constructor',
            paramName: 'match'
          });
          if (method) {
            finalAssertExports.isOneOf(method, validMethods, {
              paramName: 'method'
            });
          }
        }
        // These values are referenced directly by Router so cannot be
        // altered by minificaton.
        this.handler = normalizeHandler(handler);
        this.match = match;
        this.method = method;
      }
      /**
       *
       * @param {workbox-routing-handlerCallback} handler A callback
       * function that returns a Promise resolving to a Response
       */
      setCatchHandler(handler) {
        this.catchHandler = normalizeHandler(handler);
      }
    }

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    /**
     * RegExpRoute makes it easy to create a regular expression based
     * {@link workbox-routing.Route}.
     *
     * For same-origin requests the RegExp only needs to match part of the URL. For
     * requests against third-party servers, you must define a RegExp that matches
     * the start of the URL.
     *
     * @memberof workbox-routing
     * @extends workbox-routing.Route
     */
    class RegExpRoute extends Route {
      /**
       * If the regular expression contains
       * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
       * the captured values will be passed to the
       * {@link workbox-routing~handlerCallback} `params`
       * argument.
       *
       * @param {RegExp} regExp The regular expression to match against URLs.
       * @param {workbox-routing~handlerCallback} handler A callback
       * function that returns a Promise resulting in a Response.
       * @param {string} [method='GET'] The HTTP method to match the Route
       * against.
       */
      constructor(regExp, handler, method) {
        {
          finalAssertExports.isInstance(regExp, RegExp, {
            moduleName: 'workbox-routing',
            className: 'RegExpRoute',
            funcName: 'constructor',
            paramName: 'pattern'
          });
        }
        const match = ({
          url
        }) => {
          const result = regExp.exec(url.href);
          // Return immediately if there's no match.
          if (!result) {
            return;
          }
          // Require that the match start at the first character in the URL string
          // if it's a cross-origin request.
          // See https://github.com/GoogleChrome/workbox/issues/281 for the context
          // behind this behavior.
          if (url.origin !== location.origin && result.index !== 0) {
            {
              logger.debug(`The regular expression '${regExp.toString()}' only partially matched ` + `against the cross-origin URL '${url.toString()}'. RegExpRoute's will only ` + `handle cross-origin requests if they match the entire URL.`);
            }
            return;
          }
          // If the route matches, but there aren't any capture groups defined, then
          // this will return [], which is truthy and therefore sufficient to
          // indicate a match.
          // If there are capture groups, then it will return their values.
          return result.slice(1);
        };
        super(match, handler, method);
      }
    }

    /*
      Copyright 2018 Google LLC

      Use of this source code is governed by an MIT-style
      license that can be found in the LICENSE file or at
      https://opensource.org/licenses/MIT.
    */
    const getFriendlyURL = url => {
      const urlObj = new URL(String(url), location.href);
      // See https://github.com/GoogleChrome/workbox/issues/2323
