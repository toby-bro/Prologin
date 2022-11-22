(()=>{var __webpack_modules__=({"./node_modules/axios/index.js":/*!*************************************!*\
!*** ./node_modules/axios/index.js ***!
\*************************************/((module,__unused_webpack_exports,__webpack_require__)=>{eval("module.exports = __webpack_require__(/*! ./lib/axios */ \"./node_modules/axios/lib/axios.js\");

//# sourceURL=webpack://game/./node_modules/axios/index.js?");}),"./node_modules/axios/lib/adapters/xhr.js":/*!************************************************!*\
!*** ./node_modules/axios/lib/adapters/xhr.js ***!
\************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");
var settle = __webpack_require__(/*! ./../core/settle */ \"./node_modules/axios/lib/core/settle.js\");
var cookies = __webpack_require__(/*! ./../helpers/cookies */ \"./node_modules/axios/lib/helpers/cookies.js\");
var buildURL = __webpack_require__(/*! ./../helpers/buildURL */ \"./node_modules/axios/lib/helpers/buildURL.js\");
var buildFullPath = __webpack_require__(/*! ../core/buildFullPath */ \"./node_modules/axios/lib/core/buildFullPath.js\");
var parseHeaders = __webpack_require__(/*! ./../helpers/parseHeaders */ \"./node_modules/axios/lib/helpers/parseHeaders.js\");
var isURLSameOrigin = __webpack_require__(/*! ./../helpers/isURLSameOrigin */ \"./node_modules/axios/lib/helpers/isURLSameOrigin.js\");
var transitionalDefaults = __webpack_require__(/*! ../defaults/transitional */ \"./node_modules/axios/lib/defaults/transitional.js\");
var AxiosError = __webpack_require__(/*! ../core/AxiosError */ \"./node_modules/axios/lib/core/AxiosError.js\");
var CanceledError = __webpack_require__(/*! ../cancel/CanceledError */ \"./node_modules/axios/lib/cancel/CanceledError.js\");
var parseProtocol = __webpack_require__(/*! ../helpers/parseProtocol */ \"./node_modules/axios/lib/helpers/parseProtocol.js\");

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;
    var responseType = config.responseType;
    var onCanceled;
    function done() {
      if (config.cancelToken) {
        config.cancelToken.unsubscribe(onCanceled);
      }

      if (config.signal) {
        config.signal.removeEventListener('abort', onCanceled);
      }
    }

    if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);

    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    function onloadend() {
      if (!request) {
        return;
      }
      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !responseType || responseType === 'text' ||  responseType === 'json' ?
        request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(function _resolve(value) {
        resolve(value);
        done();
      }, function _reject(err) {
        reject(err);
        done();
      }, response);

      // Clean up request
      request = null;
    }

    if ('onloadend' in request) {
      // Use onloadend if available
      request.onloadend = onloadend;
    } else {
      // Listen for ready state to emulate onloadend
      request.onreadystatechange = function handleLoad() {
        if (!request || request.readyState !== 4) {
          return;
        }

        // The request errored out and we didn't get a response, this will be
        // handled by onerror instead
        // With one exception: request that using file: protocol, most browsers
        // will return status as 0 even though it's a successful request
        if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
          return;
        }
        // readystate handler is calling before onerror or ontimeout handlers,
        // so we should call onloadend on the next 'tick'
        setTimeout(onloadend);
      };
    }

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(new AxiosError('Request aborted', AxiosError.ECONNABORTED, config, request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, request, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = config.timeout ? 'timeout of ' + config.timeout + 'ms exceeded' : 'timeout exceeded';
      var transitional = config.transitional || transitionalDefaults;
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(new AxiosError(
        timeoutErrorMessage,
        transitional.clarifyTimeoutError ? AxiosError.ETIMEDOUT : AxiosError.ECONNABORTED,
        config,
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (responseType && responseType !== 'json') {
      request.responseType = config.responseType;
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken || config.signal) {
      // Handle cancellation
      // eslint-disable-next-line func-names
      onCanceled = function(cancel) {
        if (!request) {
          return;
        }
        reject(!cancel || (cancel && cancel.type) ? new CanceledError() : cancel);
        request.abort();
        request = null;
      };

      config.cancelToken && config.cancelToken.subscribe(onCanceled);
      if (config.signal) {
        config.signal.aborted ? onCanceled() : config.signal.addEventListener('abort', onCanceled);
      }
    }

    if (!requestData) {
      requestData = null;
    }

    var protocol = parseProtocol(fullPath);

    if (protocol && [ 'http', 'https', 'file' ].indexOf(protocol) === -1) {
      reject(new AxiosError('Unsupported protocol ' + protocol + ':', AxiosError.ERR_BAD_REQUEST, config));
      return;
    }


    // Send the request
    request.send(requestData);
  });
};


//# sourceURL=webpack://game/./node_modules/axios/lib/adapters/xhr.js?");}),"./node_modules/axios/lib/axios.js":/*!*****************************************!*\
!*** ./node_modules/axios/lib/axios.js ***!
\*****************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./utils */ \"./node_modules/axios/lib/utils.js\");
var bind = __webpack_require__(/*! ./helpers/bind */ \"./node_modules/axios/lib/helpers/bind.js\");
var Axios = __webpack_require__(/*! ./core/Axios */ \"./node_modules/axios/lib/core/Axios.js\");
var mergeConfig = __webpack_require__(/*! ./core/mergeConfig */ \"./node_modules/axios/lib/core/mergeConfig.js\");
var defaults = __webpack_require__(/*! ./defaults */ \"./node_modules/axios/lib/defaults/index.js\");

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  // Factory for creating new instances
  instance.create = function create(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Expose Cancel & CancelToken
axios.CanceledError = __webpack_require__(/*! ./cancel/CanceledError */ \"./node_modules/axios/lib/cancel/CanceledError.js\");
axios.CancelToken = __webpack_require__(/*! ./cancel/CancelToken */ \"./node_modules/axios/lib/cancel/CancelToken.js\");
axios.isCancel = __webpack_require__(/*! ./cancel/isCancel */ \"./node_modules/axios/lib/cancel/isCancel.js\");
axios.VERSION = (__webpack_require__(/*! ./env/data */ \"./node_modules/axios/lib/env/data.js\").version);
axios.toFormData = __webpack_require__(/*! ./helpers/toFormData */ \"./node_modules/axios/lib/helpers/toFormData.js\");

// Expose AxiosError class
axios.AxiosError = __webpack_require__(/*! ../lib/core/AxiosError */ \"./node_modules/axios/lib/core/AxiosError.js\");

// alias for CanceledError for backward compatibility
axios.Cancel = axios.CanceledError;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(/*! ./helpers/spread */ \"./node_modules/axios/lib/helpers/spread.js\");

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(/*! ./helpers/isAxiosError */ \"./node_modules/axios/lib/helpers/isAxiosError.js\");

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports[\"default\"] = axios;


//# sourceURL=webpack://game/./node_modules/axios/lib/axios.js?");}),"./node_modules/axios/lib/cancel/CancelToken.js":/*!******************************************************!*\
!*** ./node_modules/axios/lib/cancel/CancelToken.js ***!
\******************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var CanceledError = __webpack_require__(/*! ./CanceledError */ \"./node_modules/axios/lib/cancel/CanceledError.js\");

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;

  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;

  // eslint-disable-next-line func-names
  this.promise.then(function(cancel) {
    if (!token._listeners) return;

    var i;
    var l = token._listeners.length;

    for (i = 0; i < l; i++) {
      token._listeners[i](cancel);
    }
    token._listeners = null;
  });

  // eslint-disable-next-line func-names
  this.promise.then = function(onfulfilled) {
    var _resolve;
    // eslint-disable-next-line func-names
    var promise = new Promise(function(resolve) {
      token.subscribe(resolve);
      _resolve = resolve;
    }).then(onfulfilled);

    promise.cancel = function reject() {
      token.unsubscribe(_resolve);
    };

    return promise;
  };

  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new CanceledError(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Subscribe to the cancel signal
 */

CancelToken.prototype.subscribe = function subscribe(listener) {
  if (this.reason) {
    listener(this.reason);
    return;
  }

  if (this._listeners) {
    this._listeners.push(listener);
  } else {
    this._listeners = [listener];
  }
};

/**
 * Unsubscribe from the cancel signal
 */

CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
  if (!this._listeners) {
    return;
  }
  var index = this._listeners.indexOf(listener);
  if (index !== -1) {
    this._listeners.splice(index, 1);
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


//# sourceURL=webpack://game/./node_modules/axios/lib/cancel/CancelToken.js?");}),"./node_modules/axios/lib/cancel/CanceledError.js":/*!********************************************************!*\
!*** ./node_modules/axios/lib/cancel/CanceledError.js ***!
\********************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var AxiosError = __webpack_require__(/*! ../core/AxiosError */ \"./node_modules/axios/lib/core/AxiosError.js\");
var utils = __webpack_require__(/*! ../utils */ \"./node_modules/axios/lib/utils.js\");

/**
 * A `CanceledError` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function CanceledError(message) {
  // eslint-disable-next-line no-eq-null,eqeqeq
  AxiosError.call(this, message == null ? 'canceled' : message, AxiosError.ERR_CANCELED);
  this.name = 'CanceledError';
}

utils.inherits(CanceledError, AxiosError, {
  __CANCEL__: true
});

module.exports = CanceledError;


//# sourceURL=webpack://game/./node_modules/axios/lib/cancel/CanceledError.js?");}),"./node_modules/axios/lib/cancel/isCancel.js":/*!***************************************************!*\
!*** ./node_modules/axios/lib/cancel/isCancel.js ***!
\***************************************************/((module)=>{"use strict";eval("

module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


//# sourceURL=webpack://game/./node_modules/axios/lib/cancel/isCancel.js?");}),"./node_modules/axios/lib/core/Axios.js":/*!**********************************************!*\
!*** ./node_modules/axios/lib/core/Axios.js ***!
\**********************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");
var buildURL = __webpack_require__(/*! ../helpers/buildURL */ \"./node_modules/axios/lib/helpers/buildURL.js\");
var InterceptorManager = __webpack_require__(/*! ./InterceptorManager */ \"./node_modules/axios/lib/core/InterceptorManager.js\");
var dispatchRequest = __webpack_require__(/*! ./dispatchRequest */ \"./node_modules/axios/lib/core/dispatchRequest.js\");
var mergeConfig = __webpack_require__(/*! ./mergeConfig */ \"./node_modules/axios/lib/core/mergeConfig.js\");
var buildFullPath = __webpack_require__(/*! ./buildFullPath */ \"./node_modules/axios/lib/core/buildFullPath.js\");
var validator = __webpack_require__(/*! ../helpers/validator */ \"./node_modules/axios/lib/helpers/validator.js\");

var validators = validator.validators;
/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(configOrUrl, config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof configOrUrl === 'string') {
    config = config || {};
    config.url = configOrUrl;
  } else {
    config = configOrUrl || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  var transitional = config.transitional;

  if (transitional !== undefined) {
    validator.assertOptions(transitional, {
      silentJSONParsing: validators.transitional(validators.boolean),
      forcedJSONParsing: validators.transitional(validators.boolean),
      clarifyTimeoutError: validators.transitional(validators.boolean)
    }, false);
  }

  // filter out skipped interceptors
  var requestInterceptorChain = [];
  var synchronousRequestInterceptors = true;
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
      return;
    }

    synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

    requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  var responseInterceptorChain = [];
  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
  });

  var promise;

  if (!synchronousRequestInterceptors) {
    var chain = [dispatchRequest, undefined];

    Array.prototype.unshift.apply(chain, requestInterceptorChain);
    chain = chain.concat(responseInterceptorChain);

    promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift());
    }

    return promise;
  }


  var newConfig = config;
  while (requestInterceptorChain.length) {
    var onFulfilled = requestInterceptorChain.shift();
    var onRejected = requestInterceptorChain.shift();
    try {
      newConfig = onFulfilled(newConfig);
    } catch (error) {
      onRejected(error);
      break;
    }
  }

  try {
    promise = dispatchRequest(newConfig);
  } catch (error) {
    return Promise.reject(error);
  }

  while (responseInterceptorChain.length) {
    promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  var fullPath = buildFullPath(config.baseURL, config.url);
  return buildURL(fullPath, config.params, config.paramsSerializer);
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/

  function generateHTTPMethod(isForm) {
    return function httpMethod(url, data, config) {
      return this.request(mergeConfig(config || {}, {
        method: method,
        headers: isForm ? {
          'Content-Type': 'multipart/form-data'
        } : {},
        url: url,
        data: data
      }));
    };
  }

  Axios.prototype[method] = generateHTTPMethod();

  Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
});

module.exports = Axios;


//# sourceURL=webpack://game/./node_modules/axios/lib/core/Axios.js?");}),"./node_modules/axios/lib/core/AxiosError.js":/*!***************************************************!*\
!*** ./node_modules/axios/lib/core/AxiosError.js ***!
\***************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ../utils */ \"./node_modules/axios/lib/utils.js\");

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [config] The config.
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function AxiosError(message, code, config, request, response) {
  Error.call(this);
  this.message = message;
  this.name = 'AxiosError';
  code && (this.code = code);
  config && (this.config = config);
  request && (this.request = request);
  response && (this.response = response);
}

utils.inherits(AxiosError, Error, {
  toJSON: function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code,
      status: this.response && this.response.status ? this.response.status : null
    };
  }
});

var prototype = AxiosError.prototype;
var descriptors = {};

[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED'
// eslint-disable-next-line func-names
].forEach(function(code) {
  descriptors[code] = {value: code};
});

Object.defineProperties(AxiosError, descriptors);
Object.defineProperty(prototype, 'isAxiosError', {value: true});

// eslint-disable-next-line func-names
AxiosError.from = function(error, code, config, request, response, customProps) {
  var axiosError = Object.create(prototype);

  utils.toFlatObject(error, axiosError, function filter(obj) {
    return obj !== Error.prototype;
  });

  AxiosError.call(axiosError, error.message, code, config, request, response);

  axiosError.name = error.name;

  customProps && Object.assign(axiosError, customProps);

  return axiosError;
};

module.exports = AxiosError;


//# sourceURL=webpack://game/./node_modules/axios/lib/core/AxiosError.js?");}),"./node_modules/axios/lib/core/InterceptorManager.js":/*!***********************************************************!*\
!*** ./node_modules/axios/lib/core/InterceptorManager.js ***!
\***********************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected,
    synchronous: options ? options.synchronous : false,
    runWhen: options ? options.runWhen : null
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


//# sourceURL=webpack://game/./node_modules/axios/lib/core/InterceptorManager.js?");}),"./node_modules/axios/lib/core/buildFullPath.js":/*!******************************************************!*\
!*** ./node_modules/axios/lib/core/buildFullPath.js ***!
\******************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var isAbsoluteURL = __webpack_require__(/*! ../helpers/isAbsoluteURL */ \"./node_modules/axios/lib/helpers/isAbsoluteURL.js\");
var combineURLs = __webpack_require__(/*! ../helpers/combineURLs */ \"./node_modules/axios/lib/helpers/combineURLs.js\");

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


//# sourceURL=webpack://game/./node_modules/axios/lib/core/buildFullPath.js?");}),"./node_modules/axios/lib/core/dispatchRequest.js":/*!********************************************************!*\
!*** ./node_modules/axios/lib/core/dispatchRequest.js ***!
\********************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");
var transformData = __webpack_require__(/*! ./transformData */ \"./node_modules/axios/lib/core/transformData.js\");
var isCancel = __webpack_require__(/*! ../cancel/isCancel */ \"./node_modules/axios/lib/cancel/isCancel.js\");
var defaults = __webpack_require__(/*! ../defaults */ \"./node_modules/axios/lib/defaults/index.js\");
var CanceledError = __webpack_require__(/*! ../cancel/CanceledError */ \"./node_modules/axios/lib/cancel/CanceledError.js\");

/**
 * Throws a `CanceledError` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }

  if (config.signal && config.signal.aborted) {
    throw new CanceledError();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData.call(
    config,
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData.call(
      config,
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData.call(
          config,
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


//# sourceURL=webpack://game/./node_modules/axios/lib/core/dispatchRequest.js?");}),"./node_modules/axios/lib/core/mergeConfig.js":/*!****************************************************!*\
!*** ./node_modules/axios/lib/core/mergeConfig.js ***!
\****************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ../utils */ \"./node_modules/axios/lib/utils.js\");

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  // eslint-disable-next-line consistent-return
  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      return getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  // eslint-disable-next-line consistent-return
  function mergeDirectKeys(prop) {
    if (prop in config2) {
      return getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      return getMergedValue(undefined, config1[prop]);
    }
  }

  var mergeMap = {
    'url': valueFromConfig2,
    'method': valueFromConfig2,
    'data': valueFromConfig2,
    'baseURL': defaultToConfig2,
    'transformRequest': defaultToConfig2,
    'transformResponse': defaultToConfig2,
    'paramsSerializer': defaultToConfig2,
    'timeout': defaultToConfig2,
    'timeoutMessage': defaultToConfig2,
    'withCredentials': defaultToConfig2,
    'adapter': defaultToConfig2,
    'responseType': defaultToConfig2,
    'xsrfCookieName': defaultToConfig2,
    'xsrfHeaderName': defaultToConfig2,
    'onUploadProgress': defaultToConfig2,
    'onDownloadProgress': defaultToConfig2,
    'decompress': defaultToConfig2,
    'maxContentLength': defaultToConfig2,
    'maxBodyLength': defaultToConfig2,
    'beforeRedirect': defaultToConfig2,
    'transport': defaultToConfig2,
    'httpAgent': defaultToConfig2,
    'httpsAgent': defaultToConfig2,
    'cancelToken': defaultToConfig2,
    'socketPath': defaultToConfig2,
    'responseEncoding': defaultToConfig2,
    'validateStatus': mergeDirectKeys
  };

  utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
    var merge = mergeMap[prop] || mergeDeepProperties;
    var configValue = merge(prop);
    (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
  });

  return config;
};


//# sourceURL=webpack://game/./node_modules/axios/lib/core/mergeConfig.js?");}),"./node_modules/axios/lib/core/settle.js":/*!***********************************************!*\
!*** ./node_modules/axios/lib/core/settle.js ***!
\***********************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var AxiosError = __webpack_require__(/*! ./AxiosError */ \"./node_modules/axios/lib/core/AxiosError.js\");

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError(
      'Request failed with status code ' + response.status,
      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
};


//# sourceURL=webpack://game/./node_modules/axios/lib/core/settle.js?");}),"./node_modules/axios/lib/core/transformData.js":/*!******************************************************!*\
!*** ./node_modules/axios/lib/core/transformData.js ***!
\******************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");
var defaults = __webpack_require__(/*! ../defaults */ \"./node_modules/axios/lib/defaults/index.js\");

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  var context = this || defaults;
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn.call(context, data, headers);
  });

  return data;
};


//# sourceURL=webpack://game/./node_modules/axios/lib/core/transformData.js?");}),"./node_modules/axios/lib/defaults/index.js":/*!**************************************************!*\
!*** ./node_modules/axios/lib/defaults/index.js ***!
\**************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ../utils */ \"./node_modules/axios/lib/utils.js\");
var normalizeHeaderName = __webpack_require__(/*! ../helpers/normalizeHeaderName */ \"./node_modules/axios/lib/helpers/normalizeHeaderName.js\");
var AxiosError = __webpack_require__(/*! ../core/AxiosError */ \"./node_modules/axios/lib/core/AxiosError.js\");
var transitionalDefaults = __webpack_require__(/*! ./transitional */ \"./node_modules/axios/lib/defaults/transitional.js\");
var toFormData = __webpack_require__(/*! ../helpers/toFormData */ \"./node_modules/axios/lib/helpers/toFormData.js\");

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(/*! ../adapters/xhr */ \"./node_modules/axios/lib/adapters/xhr.js\");
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(/*! ../adapters/http */ \"./node_modules/axios/lib/adapters/xhr.js\");
  }
  return adapter;
}

function stringifySafely(rawValue, parser, encoder) {
  if (utils.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils.trim(rawValue);
    } catch (e) {
      if (e.name !== 'SyntaxError') {
        throw e;
      }
    }
  }

  return (encoder || JSON.stringify)(rawValue);
}

var defaults = {

  transitional: transitionalDefaults,

  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');

    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }

    var isObjectPayload = utils.isObject(data);
    var contentType = headers && headers['Content-Type'];

    var isFileList;

    if ((isFileList = utils.isFileList(data)) || (isObjectPayload && contentType === 'multipart/form-data')) {
      var _FormData = this.env && this.env.FormData;
      return toFormData(isFileList ? {'files[]': data} : data, _FormData && new _FormData());
    } else if (isObjectPayload || contentType === 'application/json') {
      setContentTypeIfUnset(headers, 'application/json');
      return stringifySafely(data);
    }

    return data;
  }],

  transformResponse: [function transformResponse(data) {
    var transitional = this.transitional || defaults.transitional;
    var silentJSONParsing = transitional && transitional.silentJSONParsing;
    var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
    var strictJSONParsing = !silentJSONParsing && this.responseType === 'json';

    if (strictJSONParsing || (forcedJSONParsing && utils.isString(data) && data.length)) {
      try {
        return JSON.parse(data);
      } catch (e) {
        if (strictJSONParsing) {
          if (e.name === 'SyntaxError') {
            throw AxiosError.from(e, AxiosError.ERR_BAD_RESPONSE, this, null, this.response);
          }
          throw e;
        }
      }
    }

    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  env: {
    FormData: __webpack_require__(/*! ./env/FormData */ \"./node_modules/axios/lib/helpers/null.js\")
  },

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  },

  headers: {
    common: {
      'Accept': 'application/json, text/plain, */*'
    }
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


//# sourceURL=webpack://game/./node_modules/axios/lib/defaults/index.js?");}),"./node_modules/axios/lib/defaults/transitional.js":/*!*********************************************************!*\
!*** ./node_modules/axios/lib/defaults/transitional.js ***!
\*********************************************************/((module)=>{"use strict";eval("

module.exports = {
  silentJSONParsing: true,
  forcedJSONParsing: true,
  clarifyTimeoutError: false
};


//# sourceURL=webpack://game/./node_modules/axios/lib/defaults/transitional.js?");}),"./node_modules/axios/lib/env/data.js":/*!********************************************!*\
!*** ./node_modules/axios/lib/env/data.js ***!
\********************************************/((module)=>{eval("module.exports = {
  \"version\": \"0.27.2\"
};

//# sourceURL=webpack://game/./node_modules/axios/lib/env/data.js?");}),"./node_modules/axios/lib/helpers/bind.js":/*!************************************************!*\
!*** ./node_modules/axios/lib/helpers/bind.js ***!
\************************************************/((module)=>{"use strict";eval("

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/bind.js?");}),"./node_modules/axios/lib/helpers/buildURL.js":/*!****************************************************!*\
!*** ./node_modules/axios/lib/helpers/buildURL.js ***!
\****************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/buildURL.js?");}),"./node_modules/axios/lib/helpers/combineURLs.js":/*!*******************************************************!*\
!*** ./node_modules/axios/lib/helpers/combineURLs.js ***!
\*******************************************************/((module)=>{"use strict";eval("

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\\/+$/, '') + '/' + relativeURL.replace(/^\\/+/, '')
    : baseURL;
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/combineURLs.js?");}),"./node_modules/axios/lib/helpers/cookies.js":/*!***************************************************!*\
!*** ./node_modules/axios/lib/helpers/cookies.js ***!
\***************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/cookies.js?");}),"./node_modules/axios/lib/helpers/isAbsoluteURL.js":/*!*********************************************************!*\
!*** ./node_modules/axios/lib/helpers/isAbsoluteURL.js ***!
\*********************************************************/((module)=>{"use strict";eval("

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with \"<scheme>://\" or \"//\" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\\d+\\-.]*:)?\\/\\//i.test(url);
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/isAbsoluteURL.js?");}),"./node_modules/axios/lib/helpers/isAxiosError.js":/*!********************************************************!*\
!*** ./node_modules/axios/lib/helpers/isAxiosError.js ***!
\********************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");

/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return utils.isObject(payload) && (payload.isAxiosError === true);
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/isAxiosError.js?");}),"./node_modules/axios/lib/helpers/isURLSameOrigin.js":/*!***********************************************************!*\
!*** ./node_modules/axios/lib/helpers/isURLSameOrigin.js ***!
\***********************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/isURLSameOrigin.js?");}),"./node_modules/axios/lib/helpers/normalizeHeaderName.js":/*!***************************************************************!*\
!*** ./node_modules/axios/lib/helpers/normalizeHeaderName.js ***!
\***************************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ../utils */ \"./node_modules/axios/lib/utils.js\");

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/normalizeHeaderName.js?");}),"./node_modules/axios/lib/helpers/null.js":/*!************************************************!*\
!*** ./node_modules/axios/lib/helpers/null.js ***!
\************************************************/((module)=>{eval("// eslint-disable-next-line strict
module.exports = null;


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/null.js?");}),"./node_modules/axios/lib/helpers/parseHeaders.js":/*!********************************************************!*\
!*** ./node_modules/axios/lib/helpers/parseHeaders.js ***!
\********************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ./../utils */ \"./node_modules/axios/lib/utils.js\");

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\
'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/parseHeaders.js?");}),"./node_modules/axios/lib/helpers/parseProtocol.js":/*!*********************************************************!*\
!*** ./node_modules/axios/lib/helpers/parseProtocol.js ***!
\*********************************************************/((module)=>{"use strict";eval("

module.exports = function parseProtocol(url) {
  var match = /^([-+\\w]{1,25})(:?\\/\\/|:)/.exec(url);
  return match && match[1] || '';
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/parseProtocol.js?");}),"./node_modules/axios/lib/helpers/spread.js":/*!**************************************************!*\
!*** ./node_modules/axios/lib/helpers/spread.js ***!
\**************************************************/((module)=>{"use strict";eval("

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/spread.js?");}),"./node_modules/axios/lib/helpers/toFormData.js":/*!******************************************************!*\
!*** ./node_modules/axios/lib/helpers/toFormData.js ***!
\******************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var utils = __webpack_require__(/*! ../utils */ \"./node_modules/axios/lib/utils.js\");

/**
 * Convert a data object to FormData
 * @param {Object} obj
 * @param {?Object} [formData]
 * @returns {Object}
 **/

function toFormData(obj, formData) {
  // eslint-disable-next-line no-param-reassign
  formData = formData || new FormData();

  var stack = [];

  function convertValue(value) {
    if (value === null) return '';

    if (utils.isDate(value)) {
      return value.toISOString();
    }

    if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
      return typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
    }

    return value;
  }

  function build(data, parentKey) {
    if (utils.isPlainObject(data) || utils.isArray(data)) {
      if (stack.indexOf(data) !== -1) {
        throw Error('Circular reference detected in ' + parentKey);
      }

      stack.push(data);

      utils.forEach(data, function each(value, key) {
        if (utils.isUndefined(value)) return;
        var fullKey = parentKey ? parentKey + '.' + key : key;
        var arr;

        if (value && !parentKey && typeof value === 'object') {
          if (utils.endsWith(key, '{}')) {
            // eslint-disable-next-line no-param-reassign
            value = JSON.stringify(value);
          } else if (utils.endsWith(key, '[]') && (arr = utils.toArray(value))) {
            // eslint-disable-next-line func-names
            arr.forEach(function(el) {
              !utils.isUndefined(el) && formData.append(fullKey, convertValue(el));
            });
            return;
          }
        }

        build(value, fullKey);
      });

      stack.pop();
    } else {
      formData.append(parentKey, convertValue(data));
    }
  }

  build(obj);

  return formData;
}

module.exports = toFormData;


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/toFormData.js?");}),"./node_modules/axios/lib/helpers/validator.js":/*!*****************************************************!*\
!*** ./node_modules/axios/lib/helpers/validator.js ***!
\*****************************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var VERSION = (__webpack_require__(/*! ../env/data */ \"./node_modules/axios/lib/env/data.js\").version);
var AxiosError = __webpack_require__(/*! ../core/AxiosError */ \"./node_modules/axios/lib/core/AxiosError.js\");

var validators = {};

// eslint-disable-next-line func-names
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
  validators[type] = function validator(thing) {
    return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
  };
});

var deprecatedWarnings = {};

/**
 * Transitional option validator
 * @param {function|boolean?} validator - set to false if the transitional option has been removed
 * @param {string?} version - deprecated version / removed since version
 * @param {string?} message - some message with additional info
 * @returns {function}
 */
validators.transitional = function transitional(validator, version, message) {
  function formatMessage(opt, desc) {
    return '[Axios v' + VERSION + '] Transitional option \\'' + opt + '\\'' + desc + (message ? '. ' + message : '');
  }

  // eslint-disable-next-line func-names
  return function(value, opt, opts) {
    if (validator === false) {
      throw new AxiosError(
        formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
        AxiosError.ERR_DEPRECATED
      );
    }

    if (version && !deprecatedWarnings[opt]) {
      deprecatedWarnings[opt] = true;
      // eslint-disable-next-line no-console
      console.warn(
        formatMessage(
          opt,
          ' has been deprecated since v' + version + ' and will be removed in the near future'
        )
      );
    }

    return validator ? validator(value, opt, opts) : true;
  };
};

/**
 * Assert object's properties type
 * @param {object} options
 * @param {object} schema
 * @param {boolean?} allowUnknown
 */

function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== 'object') {
    throw new AxiosError('options must be an object', AxiosError.ERR_BAD_OPTION_VALUE);
  }
  var keys = Object.keys(options);
  var i = keys.length;
  while (i-- > 0) {
    var opt = keys[i];
    var validator = schema[opt];
    if (validator) {
      var value = options[opt];
      var result = value === undefined || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError('option ' + opt + ' must be ' + result, AxiosError.ERR_BAD_OPTION_VALUE);
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError('Unknown option ' + opt, AxiosError.ERR_BAD_OPTION);
    }
  }
}

module.exports = {
  assertOptions: assertOptions,
  validators: validators
};


//# sourceURL=webpack://game/./node_modules/axios/lib/helpers/validator.js?");}),"./node_modules/axios/lib/utils.js":/*!*****************************************!*\
!*** ./node_modules/axios/lib/utils.js ***!
\*****************************************/((module,__unused_webpack_exports,__webpack_require__)=>{"use strict";eval("

var bind = __webpack_require__(/*! ./helpers/bind */ \"./node_modules/axios/lib/helpers/bind.js\");

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

// eslint-disable-next-line func-names
var kindOf = (function(cache) {
  // eslint-disable-next-line func-names
  return function(thing) {
    var str = toString.call(thing);
    return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
  };
})(Object.create(null));

function kindOfTest(type) {
  type = type.toLowerCase();
  return function isKindOf(thing) {
    return kindOf(thing) === type;
  };
}

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return Array.isArray(val);
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
var isArrayBuffer = kindOfTest('ArrayBuffer');


/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (isArrayBuffer(val.buffer));
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (kindOf(val) !== 'object') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
var isDate = kindOfTest('Date');

/**
 * Determine if a value is a File
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
var isFile = kindOfTest('File');

/**
 * Determine if a value is a Blob
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
var isBlob = kindOfTest('Blob');

/**
 * Determine if a value is a FileList
 *
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
var isFileList = kindOfTest('FileList');

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} thing The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(thing) {
  var pattern = '[object FormData]';
  return thing && (
    (typeof FormData === 'function' && thing instanceof FormData) ||
    toString.call(thing) === pattern ||
    (isFunction(thing.toString) && thing.toString() === pattern)
  );
}

/**
 * Determine if a value is a URLSearchParams object
 * @function
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
var isURLSearchParams = kindOfTest('URLSearchParams');

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\\s+|\\s+$/g, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

/**
 * Inherit the prototype methods from one constructor into another
 * @param {function} constructor
 * @param {function} superConstructor
 * @param {object} [props]
 * @param {object} [descriptors]
 */

function inherits(constructor, superConstructor, props, descriptors) {
  constructor.prototype = Object.create(superConstructor.prototype, descriptors);
  constructor.prototype.constructor = constructor;
  props && Object.assign(constructor.prototype, props);
}

/**
 * Resolve object with deep prototype chain to a flat object
 * @param {Object} sourceObj source object
 * @param {Object} [destObj]
 * @param {Function} [filter]
 * @returns {Object}
 */

function toFlatObject(sourceObj, destObj, filter) {
  var props;
  var i;
  var prop;
  var merged = {};

  destObj = destObj || {};

  do {
    props = Object.getOwnPropertyNames(sourceObj);
    i = props.length;
    while (i-- > 0) {
      prop = props[i];
      if (!merged[prop]) {
        destObj[prop] = sourceObj[prop];
        merged[prop] = true;
      }
    }
    sourceObj = Object.getPrototypeOf(sourceObj);
  } while (sourceObj && (!filter || filter(sourceObj, destObj)) && sourceObj !== Object.prototype);

  return destObj;
}

/*
 * determines whether a string ends with the characters of a specified string
 * @param {String} str
 * @param {String} searchString
 * @param {Number} [position= 0]
 * @returns {boolean}
 */
function endsWith(str, searchString, position) {
  str = String(str);
  if (position === undefined || position > str.length) {
    position = str.length;
  }
  position -= searchString.length;
  var lastIndex = str.indexOf(searchString, position);
  return lastIndex !== -1 && lastIndex === position;
}


/**
 * Returns new array from array like object
 * @param {*} [thing]
 * @returns {Array}
 */
function toArray(thing) {
  if (!thing) return null;
  var i = thing.length;
  if (isUndefined(i)) return null;
  var arr = new Array(i);
  while (i-- > 0) {
    arr[i] = thing[i];
  }
  return arr;
}

// eslint-disable-next-line func-names
var isTypedArray = (function(TypedArray) {
  // eslint-disable-next-line func-names
  return function(thing) {
    return TypedArray && thing instanceof TypedArray;
  };
})(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM,
  inherits: inherits,
  toFlatObject: toFlatObject,
  kindOf: kindOf,
  kindOfTest: kindOfTest,
  endsWith: endsWith,
  toArray: toArray,
  isTypedArray: isTypedArray,
  isFileList: isFileList
};


//# sourceURL=webpack://game/./node_modules/axios/lib/utils.js?");}),"./src/game.js":/*!*********************!*\
!*** ./src/game.js ***!
\*********************/((__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";eval("__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   \"Game\": () => (/* binding */ Game),
/* harmony export */   \"STATUS_IDLE\": () => (/* binding */ STATUS_IDLE),
/* harmony export */   \"STATUS_PROMPTING\": () => (/* binding */ STATUS_PROMPTING),
/* harmony export */   \"STATUS_SPEAKING\": () => (/* binding */ STATUS_SPEAKING)
/* harmony export */ });
/* harmony import */ var _textField__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./textField */ \"./src/textField.js\");
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./player */ \"./src/player.js\");
/* harmony import */ var _interact__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./interact */ \"./src/interact.js\");
/* harmony import */ var _scene__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./scene */ \"./src/scene.js\");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! axios */ \"./node_modules/axios/index.js\");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_4__);






const root = document.querySelector(\"#game\")
const playerNode = root.querySelector(\"#player\")
const textField = new _textField__WEBPACK_IMPORTED_MODULE_0__[\"default\"](root.querySelector(\"#prompt\"))
const marreo = root.querySelector(\"#marreo\");

const SUBMIT_URL = \"/password\"

async function getKey() {
    return axios__WEBPACK_IMPORTED_MODULE_4___default().get(SUBMIT_URL, {
        headers: {
            \"Content-Type\": \"application/json\"
        }
    }).catch(err => {
        return err.message
    }).then(res => res.data)
}

textField.onSubmit = (key) => {
    if(key.length < 32) {
        console.error(\"La clÃ© doit faire au moins 32 caractÃ¨res !\")
        let remaining = 32 - key.length
        for (let i = 0; i < remaining; i++)
            key += '0'
    }
    const iv = key.slice(0, 32)
    const ciphertext = key.slice(32, key.length)
    return axios__WEBPACK_IMPORTED_MODULE_4___default().post(SUBMIT_URL, {
        iv,
        ciphertext
    },{
        headers: {
            \"Content-Type\": \"application/json\"
        }
    })
}

const overlap = root.querySelector(\"#overlap\")

const bg_1 = \"/assets/room_1_bg.png\"
const bg_2 = \"/assets/room_2_bg.png\"

const overlap_1 = \"/assets/room_1_overlap.png\"
const overlap_2 = \"/assets/room_2_overlap.png\"

overlap.src = overlap_1

// Map of room1

const map1 = new _scene__WEBPACK_IMPORTED_MODULE_3__.Map(
    [
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,\"cat\",1,1,1,1,1,1,1],
        [1,2,1,1,0,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,\"door1\"],
        [1,0,1,1,1,1,1,0,0,1],
        [1,0,1,1,1,1,1,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ],
    {
        \"door1\": {
            \"type\": \"door\",
            \"scene_id\": \"room2\",
            \"spawn\": {
                x: 1,
                y: 4
            }
        },
        \"cat\": {
            type: \"npc\",
            oninteract: ((game) => {}),
            image: \"/assets/cat\",
            image_hl: \"/assets/cat_0.png\",
            frameCount: 4,
            node: document.querySelector(\"#cat\")
        }
    }
)



// Map of room2
const map2 = new _scene__WEBPACK_IMPORTED_MODULE_3__.Map(
    [
        [1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,0,\"padding\",1,1,0,1],
        [\"door1\",0,0,1,0,0,1,1,0,1],
        [1,0,0,1,0,0,1,1,0,1],
        [1,0,0,1,0,0,1,1,0,1],
        [1,0,0,1,0,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1]
    ], {
        \"door1\": {
            type: \"door\",
            scene_id: \"room1\",
            spawn: {
                x: 8,
                y: 4
            }
        },
        padding: {
            type: \"npc\",
            oninteract: ((game) => {
                game.displayText(\"Je suis le grand oracle du rembourrage !\", false, \"/assets/mareo.png\")
                game.displayText(\"Je vois que tu t'es fait avoir. Montre moi tes donnÃ©es, je verrai ce que je peux en faire...\", true, \"/assets/mareo.png\")
            }),
            image: \"/assets/mareo.png\",
            image_hl: \"/assets/mareo_hl.png\",
            frameCount: 0,
            node: marreo
        }
    }
)

const map_test = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

function changeBackground(image, ol) {
    root.style.backgroundImage = `url(${image})`
    overlap.src = ol
}


const STATUS_PROMPTING = 0
const STATUS_SPEAKING = 1
const STATUS_IDLE = 2

class Game {

    options

    #currentScene = null
    moveVector = {x: 0, y: 0}
    /// the length and height of the canvas
    canvasBounds; 
    playerStep;
    playerNode = undefined

    /// the delay between each loop iteration
    #gameLoopDelay = 10

    player = undefined
    #canvas = undefined
    #textField = undefined
    status = STATUS_IDLE

    scenes = []

    // Current room npcs = []

    constructor(canvas, textField, options = {}) {
        const {height, width} = canvas.getBoundingClientRect()
        this.playerStep = {x: 1.5 / width, y: 1.5 / height}
        this.canvasBounds = {height, width}
        this.#canvas = canvas
        this.#textField = textField
        this.options = options
    }

    changeRoom(scene_id, spawnPoint)
    {
        const matchingScenes = this.scenes.filter(s => s.id === scene_id)
        if(matchingScenes.length <= 0)
            return

        this.#canvas.classList.add(\"transition\")

        const scene = matchingScenes[0]
        setTimeout(() => {
            this.loadScene(scene, spawnPoint)
            this.#canvas.classList.remove(\"transition\")
        }, 300)
    }

    loadScene(scene, spawnPoint) {

        if(this.#currentScene != undefined)
            this.#currentScene.unloadScene()
        this.player.bounds.x = spawnPoint.x
        this.player.bounds.y = spawnPoint.y
        this.#currentScene = scene
        scene.loadScene()
        changeBackground(scene.bgImage, scene.overlap)
    }


    get entities() {
        if(this.#currentScene == undefined)
            return []
        return this.#currentScene.entities
    }


    async start() {
        this.scenes.forEach(sc => sc.unloadScene())
        this.loadScene(this.scenes[0], this.scenes[0].position)

        textField.enqueueText({
            text: \"........\",
            image: \"/assets/computer0.png\"
        })

        textField.enqueueText(
            {
                text: \"Mouhahahah, tu as perdu toutes tes donnÃ©es !\",
                image: \"/assets/computer1.png\"
            })

        try {

            const msg = await getKey()
            const t = msg.iv + msg.ciphertext
            const container = document.createElement(\"span\")
            container.classList.add(\"key\")
            container.innerText = \"(cliquer pour copier la cle)\"
            container.setAttribute(\"onclick\", \"navigator.clipboard.writeText(\\\"\" + t + \"\\\").then(\" +
                \"alert(\\\"La clÃ© a Ã©tÃ© copiÃ©e !\\\"))\")

            textField.enqueueText({
                text: \"Le seul moyen de les dÃ©chiffrer \" + 
                \"est Ã  l'aide de cette clÃ© : \" + container.outerHTML
            })
        } catch (err) {
            console.error(err)
        }

        textField.enqueueText({
            text: \"Si tu veux dÃ©chiffrer le contenu de la clÃ©, envoie-moi 42,000,000&euro;\"
        })
        this.status = STATUS_SPEAKING
        document.addEventListener('keyup', ev => {
            if(this.status === STATUS_IDLE)
                this.#playerKeyupListener(ev)
        })

        document.addEventListener('keydown', ev => {
            if(this.status === STATUS_IDLE)
                this.#playerKeydownListener(ev)
            else if(this.status === STATUS_SPEAKING)
                this.#speakingKeydownListener(ev)
        })

        this.player.active = true

        setInterval(() => this.loop(), this.delay)
    }

    loop() {
        this.player.update()
    }

    #render(entity, node) {
        const {x, y} = entity.position
        node.style.top = `${y * this.canvasBounds.height}px`
        node.style.left = `${x * this.canvasBounds.width}px`
    }

    displayText(text, prompt=undefined, image=null) {
        this.#textField.enqueueText({text, image, prompt})
        this.status = STATUS_SPEAKING
    }

    get delay() {
        return this.#gameLoopDelay
    }

    get canvas() {
        return this.#canvas
    }

    #playerKeyupListener(ev) {

        let used = true;

        switch(ev.key) {
            case \"ArrowUp\":
                if(this.moveVector.y > 0)
                    this.moveVector.y = 0;
                break
            case \"ArrowDown\":
                if(this.moveVector.y < 0)
                    this.moveVector.y = 0;
                break
            case \"ArrowLeft\":
                if(this.moveVector.x < 0)
                    this.moveVector.x = 0
                break
            case \"ArrowRight\":
                if(this.moveVector.x > 0)
                    this.moveVector.x = 0
                break
            default:
                used = false;


        }

        if(!used) {
            return;
        }
        ev.preventDefault()
    }

    #playerKeydownListener(ev) {

        let used = true;

        switch(ev.key) {
            case \"ArrowUp\":
                this.moveVector.y = 1;
                break
            case \"ArrowDown\":
                this.moveVector.y = -1;
                break
            case \"ArrowLeft\":
                this.moveVector.x = -1
                break
            case \"ArrowRight\":
                this.moveVector.x = 1
                break
            case \"Enter\":
                if(this.status === STATUS_IDLE)
                    this.player.interact()
                break
            default:
                used = false;
        }
        if(!used) {
            return;
        }
        ev.preventDefault()
    }

    #speakingKeydownListener(ev) {
        let used = false
        if(ev.key === \"Enter\") {
            used = true
            this.#textField.next()
            if(!this.#textField.visible)
                this.status = STATUS_IDLE
            else
                this.status = STATUS_SPEAKING
        }
        if(!used)
            return
        ev.preventDefault()
    }
}

const game = new Game(root, textField)
window.game = game
game.playerNode = playerNode
const player = new _player__WEBPACK_IMPORTED_MODULE_1__[\"default\"](game)
window.player = player
game.player = player
const scene1 = new _scene__WEBPACK_IMPORTED_MODULE_3__[\"default\"](game, \"room1\")
scene1.map = map1
scene1.bgImage = bg_1
scene1.overlap = overlap_1
const scene2 = new _scene__WEBPACK_IMPORTED_MODULE_3__[\"default\"](game, \"room2\")
scene2.map = map2
scene2.bgImage = bg_2
scene2.overlap = overlap_2
game.scenes.push(scene1, scene2)
game.start()
game.options = {debug: false}



//# sourceURL=webpack://game/./src/game.js?");}),"./src/interact.js":/*!*************************!*\
!*** ./src/interact.js ***!
\*************************/((__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";eval("__webpack_require__.r(__webpack_exports__);/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   \"Door\": () => (/* binding */ Door),
/* harmony export */   \"default\": () => (/* binding */ NPC)
/* harmony export */ });
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player */ \"./src/player.js\");


class Door extends _player__WEBPACK_IMPORTED_MODULE_0__.Entity
{

    spawnPoint = null
    constructor(game, bounds, {scene_id, spawnPoint})
    {
        super(game, bounds, scene_id)
        this.spawnPoint = spawnPoint
    }

    loadRoom()
    {
        this.game.changeRoom(this.scene_id, this.spawnPoint)
    }

    get type() {
        return \"door\"
    }
}

function _get_bounds(node, game) {
    const {width, height, x: x1, y: y1} = node.getBoundingClientRect()
    const {x: x2, y: y2} = game.getBoundingClientRect()

    return {
        width,
        height,
        x: x1 - x2,
        y: y1 - y2
    }
}

class NPC extends _player__WEBPACK_IMPORTED_MODULE_0__.MovableEntity
{
    #interactable = false;
    #wasTalkedWith = false;

    #img = \"\";
    #img_hl = \"\";
    oninteract = null;

    frameCount = 0;
    currentFrame = 0;

    constructor(node, game, bounds, scene_id, img, img_hl)
    {
        super(game, node, scene_id, bounds)
        this.#img = img
        this.#img_hl = img_hl
        this.node.style.top = `${this.bounds.ystart * this.game.canvasBounds.height}px`
        this.node.style.left = `${this.bounds.xstart * this.game.canvasBounds.width}px`
        this.node.src = this.#img

        this.currentFrame = 0
        setInterval(() => this.#animNPC(), 400)
    }

    onPlayerCollide(exited=false) {
        this.node.src = exited ? this.#img : this.#img_hl
        this.#interactable = !exited
        if(exited)
            this.#wasTalkedWith = false
    }

    #animNPC() {
        if (this.frameCount == 0)
            return

        var suffix = \"_\" + this.currentFrame + \".png\"
        this.node.src = this.#img + suffix
        this.currentFrame = (this.currentFrame + 1) % this.frameCount
    }

    get type() {
        return \"NPC\"
        }

    oncollide(ent) {
        if(!super.active)
            return

        switch(ent.type) {
            case \"player\":
                this.#interactable = true
                this.node.src = this.#img_hl
                break;
        }
    }

    interact()
    {
        if (!this.#interactable || this.#wasTalkedWith || !this.oninteract)
            return
        this.oninteract(this.game)

    }
}


//# sourceURL=webpack://game/./src/interact.js?");}),"./src/player.js":/*!***********************!*\
!*** ./src/player.js ***!
\***********************/((__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";eval("__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   \"Bounds\": () => (/* binding */ Bounds),
/* harmony export */   \"Entity\": () => (/* binding */ Entity),
/* harmony export */   \"MovableEntity\": () => (/* binding */ MovableEntity),
/* harmony export */   \"Position\": () => (/* binding */ Position),
/* harmony export */   \"default\": () => (/* binding */ Player)
/* harmony export */ });
/* harmony import */ var _game_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game.js */ \"./src/game.js\");

/**
 *\tthe position of an entity
 *\t:param x: float -> a float [0; 1] representing the position in x
 *\t:param y: float -> a float [0; 1] representing the position in y
 */
class Position {
    x;
    y;
}

class Bounds {
    xstart;
    xend;
    ystart;
    yend;
    active = true

    constructor(xstart, xend, ystart, yend) {
        if(xstart > xend) {
            let buffer = xstart
            xstart = xend
            xend = buffer
        }
        this.xstart = xstart
        this.xend = xend

        if(ystart > yend) {
            let buffer = ystart
            ystart = yend
            yend = buffer
        }
        this.ystart = ystart
        this.yend = yend
    }

    isCollidingLeft(other)\t{
        return other.xstart < this.xstart &&
            other.xend >= this.xstart &&
            other.xend <= this.xend &&
            this.#isCollidingY(other)
    }

    isCollidingRight (other){
        return other.isCollidingLeft(this)
    }

    isCollidingTop(other) {
        return other.ystart <= this.ystart &&
            other.yend >= this.ystart &&
            other.yend <= this.yend &&
            this.#isCollidingX(other)
    }

    isCollidingBottom(other) {
        return other.isCollidingTop(this)
    }

    #isCollidingX(other) {
        return this.xstart <= other.xstart && this.xend >= other.xstart ||
            other.xstart <= this.xstart && other.xend >= this.xstart
    }

    #isCollidingY(other) {
        return this.ystart <= other.ystart && this.yend >= other.ystart ||
            other.ystart <= this.ystart && other.yend >= this.ystart
    }

    isColliding(other) {
        return this.#isCollidingY(other) && this.#isCollidingX(other)
    }

    getCollisions(other) {
        const bounds = {}
        if(this.isCollidingTop(other))
            bounds.top = true
        if(this.isCollidingBottom(other))
            bounds.bottom = true
        if(this.isCollidingLeft(other))
            bounds.left = true
        if(this.isCollidingRight(other))
            bounds.right = true

        if(Object.keys(bounds).length == 0 && this.isColliding(other))
            bounds.intricate = true

        return bounds
    }

    moveX(delta) {
        this.xstart += delta
        this.xend += delta
    }

    set x(value) {
        this.xend = this.xend - this.xstart + value
        this.xstart = value
    }

    set y(value) {
        this.yend = this.yend - this.ystart + value
        this.ystart = value
    }

    moveY(delta) {
        this.ystart += delta
        this.yend += delta
    }

    get width() {
        return this.xend - this.xstart
    }

    set width(width) {
        this.xend = this.xstart + width;
    }

    get height() {
        return this.yend - this.ystart
    }

    set height(height) {
        this.yend = this.ystart + height
    }
}

class Entity {

    static count = 0
    #id = 0;
    bounds;
    game = undefined
    scene_id = null
    node = null

    constructor(game, bounds, scene_id) {
        this.game = game
        this.bounds = bounds
        this.scene_id = scene_id
        this.#id = Entity.count++
    }

    get id() {
        return this.#id
    }

    get position() {
        return {x: this.bounds.xstart, y: this.bounds.ystart}
    }

    get type() {
        return \"entity\"
    }

    set position(pos) {
        var w = this.bounds.width
        var h = this.bounds.height
        this.bounds.xstart = pos.x;
        this.bounds.xend = pos.x + w;
        this.bounds.ystart = pos.y;
        this.bounds.yend = pos.y + h;
    }
}

function _get_bounds(node, game) {
    const {width, height, x: x1, y: y1} = node.getBoundingClientRect()
    const {x: x2, y: y2} = game.getBoundingClientRect()

    return {
        width,
        height,
        x: x1 - x2,
        y: y1 - y2
    }
}


class MovableEntity extends Entity {

    moving = false
    #active = false
    node = undefined

    // the float delta to change when moving
    #moveStep = undefined
    #detectInterval = undefined
    #collidedEntities = []

    #boundsRenderer = undefined

    constructor(game, node, scene_id, bounds = null, moveStep = null) {
        super(game, bounds, scene_id)
        this.node = node
        if(this.bounds === null)
            this.bounds = this.calculateBounds()
        if(moveStep === null) {
            moveStep = this.game.playerStep
        }

        this.#moveStep = moveStep
        this.render()
    }

    calculateBounds() {
        const {x, y, width: w, height: h} =
            _get_bounds(this.node, this.game.canvas)
        const {height, width} = this.game.canvasBounds
        const bounds =  new Bounds(x / width, (x + w) / width,
            y / height, (y + h) / height)

        return bounds
    }

    #drawBounds() {
        if(!this.game.options.debug) {
            this.#hideBounds()
            return
        } else if(this.#boundsRenderer === undefined) {
            this.#boundsRenderer = document.createElement(\"div\")
            this.game.canvas.appendChild(this.#boundsRenderer)
            this.#boundsRenderer.classList.add(\"bounds-renderer\")
        }

        this.#boundsRenderer.classList.remove(\"hidden\")
        const x = this.bounds.xstart * this.game.canvasBounds.width
        const y = this.bounds.ystart * this.game.canvasBounds.height
        this.#boundsRenderer.style.top =
            `${y}px`

        this.#boundsRenderer.style.left =
            `${x}px`

        const width = this.bounds.width * this.game.canvasBounds.width
        this.#boundsRenderer.style.width = 
            `${width}px`

        const height = this.bounds.height * this.game.canvasBounds.height
        this.#boundsRenderer.style.height = 
            `${height}px`
    }

    #hideBounds() {
        if(this.#boundsRenderer === undefined)
            return
        this.#boundsRenderer.classList.add(\"hidden\")
    }

    #onmove() {
        this.#drawBounds()
        const tmp = []
        for(let ent of this.#collidedEntities) {
            const collision = this.bounds.getCollisions(ent.bounds)
            if(Object.keys(collision).length === 0) {
                this.onCollideExit(ent)
            } else {
                tmp.push(ent)
            }
        }

        this.moving = true
        this.#collidedEntities = tmp
    }

    set active(active) {
        this.#active = active
        if(!this.node)
            return
        if(active) {
            this.node.classList.remove(\"hidden\")
            this.bounds = this.calculateBounds()
            this.render()
            this.#drawBounds()
        }
        else {
            this.node.classList.add(\"hidden\")
            this.#hideBounds()
        }
    }

    get active() {
        return this.#active
    }

    render() {
        const {x, y, width, height} = _get_bounds(this.node, this.game.canvas)
        const position = {
            top: this.bounds.yend * this.game.canvasBounds.height - height,
            left: this.bounds.xstart * this.game.canvasBounds.width
        }
        this.node.style.top = `${position.top}px`
        this.node.style.left = `${position.left}px`

    }

    get type() {
        return \"movable_entity\"
    }

    onCollide(entity) {
    }

    onCollideExit(ent) {
    }

    #move(movefunc, size, colDirection) {
        let moved = true
        let reverted = false
        movefunc(size)
        for(let ent of this.game.entities) {
            const collisions = this.bounds.getCollisions(ent.bounds)
            if(Object.keys(collisions).length > 0) {
                if(collisions[colDirection]) {
                    moved &= !this.bounds.active
                    if(!moved && !reverted) {
                        reverted = true
                        movefunc(-size)
                    }
                }
                if(!this.#collidedEntities.includes(ent)) {
                    this.onCollide(ent)
                    this.#collidedEntities.push(ent)
                }
            }
        }
        if(moved) 
            this.#onmove()
    }

    moveLeft() {
        this.#move((v) => this.bounds.moveX(v), -this.#moveStep.x, \"left\")
    }

    moveRight() {
        this.#move((v) => this.bounds.moveX(v), this.#moveStep.x, \"right\")
    }

    moveUp() {
        this.#move((v) => this.bounds.moveY(v), -this.#moveStep.y, \"top\")
    }

    moveDown() {
        this.#move((v) => this.bounds.moveY(v), this.#moveStep.y, \"bottom\")
    }
}

const PLAYER_BOUNDS = new Bounds(0.1, 0.1, 0.1, 0.1)

class Player extends MovableEntity {

    #currentFrame = 0
    #direction = \"down\"

    npcs = []
    constructor(game) {
        super(game, game.playerNode, null)
        game.playerNode.src = \"/assets/player_idle_down.png\"
        setInterval(() => this.#animPlayer(), 200)
    }

    onPlayerStop() {
        this.moving = false
    }

    onChangeDirection(x, y) {
        if (x < 0)
            this.#direction = \"left\"
        else if (x > 0)
            this.#direction = \"right\"

        if (y < 0)
            this.#direction = \"down\"
        else if (y > 0)
            this.#direction = \"up\"
    }

    #animPlayer() {
        if (!this.moving)
        {
            this.node.src = \"/assets/player_idle_\" + this.#direction + \".png\"
        }
        else
        {
            this.node.src = \"/assets/player_walk_\" +
                this.#direction + \"_\" + this.#currentFrame + \".png\"
            this.#currentFrame = (this.#currentFrame + 1) % 4
        }
    }

    update() {

        const {x, y} = this.game.moveVector
        if(this.game.status === _game_js__WEBPACK_IMPORTED_MODULE_0__.STATUS_IDLE) {
            if(x < 0)
                this.moveLeft()
            else if(x > 0)
                this.moveRight()
            if(y < 0)
                this.moveDown()
            else if(y > 0)
                this.moveUp()
        }

        if (x === 0 && y === 0)
            this.onPlayerStop()

        this.onChangeDirection(x, y)

        this.render()
    }


    calculateBounds() {
        const {x, y, width: w, height: h} =
            _get_bounds(this.node, this.game.canvas)
        const {height, width} = this.game.canvasBounds
        const bounds =  new Bounds(x / width, (x + w) / width,
            y / height, (y + h / 3) / height)

        return bounds
    }

    onCollide(ent) {
        switch(ent.type) {
            case \"door\":
                ent.loadRoom()
                break;
            case \"NPC\":
                ent.onPlayerCollide()
                this.npcs.push(ent)
                break;
        }
    }

    onCollideExit(ent) {
        switch(ent.type) {
            case \"NPC\":
                ent.onPlayerCollide(true)
                this.npcs = 
                    this.npcs.filter(e => e !== ent)
                break;
        }
    }

    get type() {
        return \"player\"
    }

    interact() {
        this.npcs.forEach(ent => ent.interact())
    }
}


//# sourceURL=webpack://game/./src/player.js?");}),"./src/scene.js":/*!**********************!*\
!*** ./src/scene.js ***!
\**********************/((__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";eval("__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   \"Map\": () => (/* binding */ Map),
/* harmony export */   \"SCENE_HEIGHT\": () => (/* binding */ SCENE_HEIGHT),
/* harmony export */   \"SCENE_WIDTH\": () => (/* binding */ SCENE_WIDTH),
/* harmony export */   \"SceneObjectInfo\": () => (/* binding */ SceneObjectInfo),
/* harmony export */   \"default\": () => (/* binding */ Scene)
/* harmony export */ });
/* harmony import */ var _player__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./player */ \"./src/player.js\");
/* harmony import */ var _interact__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./interact */ \"./src/interact.js\");




class Map {
    layout = []
    entities = {}

    constructor(layout, entities) {
        this.layout = layout
        this.entities = entities
    }
}

class SceneObjectInfo {
    id = 0
    type = null
    info = null

    constructor(id, type, info) {
        this.id = id
        this.type = type
        this.info = info
    }
}

const SCENE_HEIGHT = 10
const SCENE_WIDTH = 10

class Scene {

    id = null;

    /// the bound game.
    game = undefined

    /// the player spawn
    position = {}

    /// the list of bound npcs
    npcs = []
    /// multidimensional array containing the bounds
    #map = null
    /// the background image
    bgImage = null
    /// the overlap image
    overlap = null

    /// the loaded entities.
    #entities = []

    constructor(game, id) {
        this.game = game
        this.id = id
    }

    set map(map) {
        this.#map = map
        this.refreshEntities()
    }

    get layout() {
        return this.#map.layout
    }

    loadScene() {
        this.movableEntities.forEach(ent => ent.active = true)
    }

    unloadScene() {
        this.#cleanEntities()
    }

    get entities() {
        return this.#entities
    }

    get movableEntities() {
        return this.#entities.filter(ent => [\"NPC\"].includes(ent.type))
    }

    #cleanEntities() {
        this.movableEntities.forEach(ent => ent.active = false)
    }

    refreshEntities() {

        this.#cleanEntities()

        const top = new _player__WEBPACK_IMPORTED_MODULE_0__.Entity(this, new _player__WEBPACK_IMPORTED_MODULE_0__.Bounds(0, 1, 0, this.game.playerStep.y))
        const bottom = new _player__WEBPACK_IMPORTED_MODULE_0__.Entity(this, new _player__WEBPACK_IMPORTED_MODULE_0__.Bounds(0, 1, 1 - this.game.playerStep.y, 1))
        const right = new _player__WEBPACK_IMPORTED_MODULE_0__.Entity(this, new _player__WEBPACK_IMPORTED_MODULE_0__.Bounds(1 - this.game.playerStep.x, 1, 0, 1))
        const left = new _player__WEBPACK_IMPORTED_MODULE_0__.Entity(this, new _player__WEBPACK_IMPORTED_MODULE_0__.Bounds(0, this.game.playerStep.x, 0, 1))
        this.#entities.push(top, bottom, right, left)

        // Add map walls to entities
        for(let x = 0; x < SCENE_WIDTH; x++) {
            for(let y = 0; y < SCENE_HEIGHT; y++) {
                let index = this.layout[y][x]

                if(index === 1) {

                    const bounds = 
                        new _player__WEBPACK_IMPORTED_MODULE_0__.Bounds(x / 10.0, (x + 1) / 10.0,
                            y / 10.0, (y + 1) / 10.0);
                    const wall = new _player__WEBPACK_IMPORTED_MODULE_0__.Entity(this.game, bounds);
                    this.#entities.push(wall)
                }else if (index === 2){
                    this.position = {x: x / 10.0, y: y / 10.0}
                } else if(index !== 0) {

                    const objInfo = this.#map.entities[index];
                    if(objInfo.type === \"door\") {

                        const bounds = new _player__WEBPACK_IMPORTED_MODULE_0__.Bounds(x / 10.0,
                            (x + 1) / 10.0,
                            y / 10.0,
                            (y + 1) / 10.0)
                        const spawn = {
                            x: (objInfo.spawn.x + 0.1) / 10.0,
                            y: (objInfo.spawn.y + 0.1) / 10.0
                        }

                        const door = new _interact__WEBPACK_IMPORTED_MODULE_1__.Door(this.game,bounds,
                            {
                                scene_id: objInfo.scene_id,
                                spawnPoint: spawn
                            }

                        )

                        this.#entities.push(door)
                    } else if(objInfo.type === \"npc\") {
                        let {node, image, image_hl, bounds} = objInfo
                        if(bounds === undefined) {
                            bounds = null
                        }
                        const npc = new _interact__WEBPACK_IMPORTED_MODULE_1__[\"default\"](objInfo.node,
                            this.game,
                            bounds,
                            this.id,
                            image,
                            image_hl
                        )
                        npc.oninteract = objInfo.oninteract
                        npc.frameCount = objInfo.frameCount
                        npc.currentFrame = 0
                        this.#entities.push(npc)
                    }
                }
            }
        }
    }
}


//# sourceURL=webpack://game/./src/scene.js?");}),"./src/textField.js":/*!**************************!*\
!*** ./src/textField.js ***!
\**************************/((__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";eval("__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   \"default\": () => (/* binding */ TextField)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ \"./src/utils.js\");


const PROMPT_HIDDEN = 0
const PROMPT_IDLE = 1
const PROMPT_RUNNING = 2

class TextField {

    #state = PROMPT_HIDDEN;
    #interval = null;
    #textQueue = new _utils__WEBPACK_IMPORTED_MODULE_0__.Queue()
    #text = \"\"
    #visible = false;
    #node = undefined
    #textField = undefined
\t#prompt = undefined
\t#onSubmit = undefined
    #showPrompt = false

    constructor(node) {
        this.#node = node
        this.#textField = this.#node.querySelector(\".text\")
\t\tthis.#prompt = this.#node.querySelector(\"#msgForm\")
        this.promptVisible = false
\t\tthis.#prompt.onsubmit = (e) => {
\t\t\te.preventDefault()
\t\t\te.stopPropagation()
            return
\t\t}
    }

    next() {

        if(this.#state === PROMPT_HIDDEN)
            return false;

        if(this.#state === PROMPT_RUNNING) {
            clearInterval(this.#interval)
            this.#interval = null
            this.#state = PROMPT_IDLE
            this.#textField.innerHTML = this.#text
        } else if(this.#state === PROMPT_IDLE) {
            const field = this.#prompt.children[0]
            if(this.#showPrompt) {
                const value = this.#prompt.children[0].value 
                this.#prompt.children[0].value = null
                this.promptVisible = false
                if(this.#onSubmit) {
                    this.#onSubmit(value).then(res => {
                        this.enqueueText({
                            text: res.data.error,
                            prompt: false
                        })
                        this.next()
                    })
                }
            } else {
                if(this.#textQueue.length > 0) {
                    this.#text = this.#textQueue.dequeue()
                    this.showText(this.#text)
                } else {
                    this.#textField.innerHTML = \"\"
                    this.visible = false;
                    this.#state = PROMPT_HIDDEN;
                    return false
                }
            }
        }

        return true
    }

    showText({text, image, prompt}) {
        this.#state = PROMPT_RUNNING
        this.#text = text
        this.visible = true;
        if(image != undefined)
            this.imagePath = image
        if(prompt !== undefined)
            this.promptVisible = prompt
        this.#textField.innerHTML = null
        let i = 0
        this.#interval = setInterval(() => {
            if(i >= text.length) {
                clearInterval(this.#interval)
                this.#state = PROMPT_IDLE
                return;
            }
            this.#textField.innerHTML = text.slice(0, ++i)

        }, 100)

    }

    enqueueText(text) {
        this.#textQueue.enqueue(text)
        if(this.#state === PROMPT_HIDDEN) {
            this.showText(this.#textQueue.dequeue())
        }
    }

    get length() {
        return this.#textQueue.length
    }

    set promptVisible(visible) {
        this.#showPrompt = visible
        if(!visible)
            this.#prompt.classList.add(\"hidden\")
        else {
            this.#prompt.classList.remove(\"hidden\")
            this.#prompt.querySelector(\"input[type=\\'text\\']\").focus()
        }
    }

    set visible(visible) {
        this.#visible = visible
        if(visible)
            this.#node.classList.remove(\"hidden\")
        else
            this.#node.classList.add(\"hidden\")
    }

    set onSubmit(onSubmit) {
        this.#onSubmit = onSubmit
    }

    get visible() {
        return this.#visible;
    }

    set imagePath(path) {
        this.#node.querySelector(\"img\").src = path
    }

}


//# sourceURL=webpack://game/./src/textField.js?");}),"./src/utils.js":/*!**********************!*\
!*** ./src/utils.js ***!
\**********************/((__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{"use strict";eval("__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   \"Queue\": () => (/* binding */ Queue)
/* harmony export */ });

class Queue {
    #elements;
    #head = 0
    #tail = 0
    constructor() {
        this.#elements = {}
    }

    enqueue(element) {
        this.#elements[this.#tail] = element
        this.#tail++
    }

    dequeue() {
        const item = this.#elements[this.#head]
        delete this.#elements[this.#head]
        this.#head++
        return item
    }

    peek () {
        return this.#elements[this.#head]
    }

    get length() {
        return this.#tail - this.#head
    }

    get isEmpty() {
        return this.length === 0
    }
}


//# sourceURL=webpack://game/./src/utils.js?");})});var __webpack_module_cache__={};function __webpack_require__(moduleId){var cachedModule=__webpack_module_cache__[moduleId];if(cachedModule!==undefined){return cachedModule.exports;}
var module=__webpack_module_cache__[moduleId]={exports:{}};__webpack_modules__[moduleId](module,module.exports,__webpack_require__);return module.exports;}
(()=>{__webpack_require__.n=(module)=>{var getter=module&&module.__esModule?()=>(module['default']):()=>(module);__webpack_require__.d(getter,{a:getter});return getter;};})();(()=>{__webpack_require__.d=(exports,definition)=>{for(var key in definition){if(__webpack_require__.o(definition,key)&&!__webpack_require__.o(exports,key)){Object.defineProperty(exports,key,{enumerable:true,get:definition[key]});}}};})();(()=>{__webpack_require__.o=(obj,prop)=>(Object.prototype.hasOwnProperty.call(obj,prop))})();(()=>{__webpack_require__.r=(exports)=>{if(typeof Symbol!=='undefined'&&Symbol.toStringTag){Object.defineProperty(exports,Symbol.toStringTag,{value:'Module'});}
Object.defineProperty(exports,'__esModule',{value:true});};})();var __webpack_exports__=__webpack_require__("./src/game.js");})();

