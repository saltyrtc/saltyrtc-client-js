/**
 * saltyrtc-client-js v0.9.0
 * SaltyRTC JavaScript implementation
 * https://github.com/saltyrtc/saltyrtc-client-js
 *
 * Copyright (C) 2016-2017 Threema GmbH
 *
 * This software may be modified and distributed under the terms
 * of the MIT license:
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

(function (exports,msgpack) {
'use strict';

(function (CloseCode) {
    CloseCode[CloseCode["ClosingNormal"] = 1000] = "ClosingNormal";
    CloseCode[CloseCode["GoingAway"] = 1001] = "GoingAway";
    CloseCode[CloseCode["NoSharedSubprotocol"] = 1002] = "NoSharedSubprotocol";
    CloseCode[CloseCode["PathFull"] = 3000] = "PathFull";
    CloseCode[CloseCode["ProtocolError"] = 3001] = "ProtocolError";
    CloseCode[CloseCode["InternalError"] = 3002] = "InternalError";
    CloseCode[CloseCode["Handover"] = 3003] = "Handover";
    CloseCode[CloseCode["DroppedByInitiator"] = 3004] = "DroppedByInitiator";
    CloseCode[CloseCode["InitiatorCouldNotDecrypt"] = 3005] = "InitiatorCouldNotDecrypt";
    CloseCode[CloseCode["NoSharedTask"] = 3006] = "NoSharedTask";
    CloseCode[CloseCode["InvalidKey"] = 3007] = "InvalidKey";
})(exports.CloseCode || (exports.CloseCode = {}));
function explainCloseCode(code) {
    switch (code) {
        case exports.CloseCode.ClosingNormal:
            return 'Normal closing';
        case exports.CloseCode.GoingAway:
            return 'The endpoint is going away';
        case exports.CloseCode.NoSharedSubprotocol:
            return 'No shared subprotocol could be found';
        case exports.CloseCode.PathFull:
            return 'No free responder byte';
        case exports.CloseCode.ProtocolError:
            return 'Protocol error';
        case exports.CloseCode.InternalError:
            return 'Internal error';
        case exports.CloseCode.Handover:
            return 'Handover finished';
        case exports.CloseCode.DroppedByInitiator:
            return 'Dropped by initiator';
        case exports.CloseCode.InitiatorCouldNotDecrypt:
            return 'Initiator could not decrypt a message';
        case exports.CloseCode.NoSharedTask:
            return 'No shared task was found';
        case exports.CloseCode.InvalidKey:
            return 'Invalid key';
        default:
            return 'Unknown';
    }
}

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get$1 = function get$1(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$1(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



var set$1 = function set$1(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$1(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

function InternalError(message) {
    this.message = message;
    if ('captureStackTrace' in Error) {
        Error.captureStackTrace(this, InternalError);
    } else {
        this.stack = new Error().stack;
    }
}
InternalError.prototype = Object.create(Error.prototype);
InternalError.prototype.name = 'InternalError';
InternalError.prototype.constructor = InternalError;

var SignalingError = function (_Error) {
    inherits(SignalingError, _Error);

    function SignalingError(closeCode, message) {
        classCallCheck(this, SignalingError);

        var _this = possibleConstructorReturn(this, (SignalingError.__proto__ || Object.getPrototypeOf(SignalingError)).call(this, message));

        _this.message = message;
        _this.closeCode = closeCode;
        _this.name = 'SignalingError';
        return _this;
    }

    return SignalingError;
}(Error);

var ProtocolError = function (_SignalingError) {
    inherits(ProtocolError, _SignalingError);

    function ProtocolError(message) {
        classCallCheck(this, ProtocolError);
        return possibleConstructorReturn(this, (ProtocolError.__proto__ || Object.getPrototypeOf(ProtocolError)).call(this, exports.CloseCode.ProtocolError, message));
    }

    return ProtocolError;
}(SignalingError);

var ConnectionError = function (_Error2) {
    inherits(ConnectionError, _Error2);

    function ConnectionError(message) {
        classCallCheck(this, ConnectionError);

        var _this3 = possibleConstructorReturn(this, (ConnectionError.__proto__ || Object.getPrototypeOf(ConnectionError)).call(this, message));

        _this3.message = message;
        _this3.name = 'ConnectionError';
        return _this3;
    }

    return ConnectionError;
}(Error);

var ValidationError = function (_Error3) {
    inherits(ValidationError, _Error3);

    function ValidationError(message) {
        classCallCheck(this, ValidationError);

        var _this4 = possibleConstructorReturn(this, (ValidationError.__proto__ || Object.getPrototypeOf(ValidationError)).call(this, message));

        _this4.message = message;
        _this4.name = 'ValidationError';
        return _this4;
    }

    return ValidationError;
}(Error);

function u8aToHex(array) {
    var results = [];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var arrayByte = _step.value;

            results.push(arrayByte.toString(16).replace(/^([\da-f])$/, '0$1'));
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return results.join('');
}
function hexToU8a(hexstring) {
    var array = void 0,
        i = void 0,
        j = void 0,
        k = void 0,
        ref = void 0;
    j = 0;
    if (hexstring.length % 2 == 1) {
        hexstring = '0' + hexstring;
    }
    array = new Uint8Array(hexstring.length / 2);
    for (i = k = 0, ref = hexstring.length; k <= ref; i = k += 2) {
        array[j++] = parseInt(hexstring.substr(i, 2), 16);
    }
    return array;
}
function byteToHex(value) {
    return '0x' + ('00' + value.toString(16)).substr(-2);
}

function randomUint32() {
    var crypto = window.crypto || window.msCrypto;
    return crypto.getRandomValues(new Uint32Array(1))[0];
}
function concat() {
    var totalLength = 0;

    for (var _len = arguments.length, arrays = Array(_len), _key = 0; _key < _len; _key++) {
        arrays[_key] = arguments[_key];
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = arrays[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var arr = _step2.value;

            totalLength += arr.length;
        }
    } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
            }
        } finally {
            if (_didIteratorError2) {
                throw _iteratorError2;
            }
        }
    }

    var result = new Uint8Array(totalLength);
    var offset = 0;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = arrays[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _arr = _step3.value;

            result.set(_arr, offset);
            offset += _arr.length;
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return result;
}
function waitFor(test, delay_ms, retries, success, error) {
    if (test() === false) {
        if (retries === 1) {
            error();
        } else {
            setTimeout(function () {
                return waitFor(test, delay_ms, retries - 1, success, error);
            }, delay_ms);
        }
        return;
    }
    success();
}
function isString(value) {
    return typeof value === 'string' || value instanceof String;
}
function validateKey(key) {
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "Key";

    var out = void 0;
    if (isString(key)) {
        out = hexToU8a(key);
    } else if (key instanceof Uint8Array) {
        out = key;
    } else {
        throw new ValidationError(name + " must be an Uint8Array or a hex string");
    }
    if (out.byteLength != 32) {
        throw new ValidationError(name + " must be 32 bytes long");
    }
    return out;
}
function arraysAreEqual(a1, a2) {
    if (a1.length != a2.length) {
        return false;
    }
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) {
            return false;
        }
    }
    return true;
}

var Box = function () {
    function Box(nonce, data, nonceLength) {
        classCallCheck(this, Box);

        this._nonce = nonce;
        this._nonceLength = nonceLength;
        this._data = data;
    }

    createClass(Box, [{
        key: 'toUint8Array',
        value: function toUint8Array() {
            var box = new Uint8Array(this.length);
            box.set(this._nonce);
            box.set(this._data, this._nonceLength);
            return box;
        }
    }, {
        key: 'length',
        get: function get() {
            return this._nonce.length + this._data.length;
        }
    }, {
        key: 'data',
        get: function get() {
            return this._data;
        }
    }, {
        key: 'nonce',
        get: function get() {
            return this._nonce;
        }
    }], [{
        key: 'fromUint8Array',
        value: function fromUint8Array(array, nonceLength) {
            if (nonceLength === undefined) {
                throw new Error('nonceLength parameter not specified');
            }
            if (array.byteLength <= nonceLength) {
                throw 'bad-message-length';
            }
            var nonce = array.slice(0, nonceLength);
            var data = array.slice(nonceLength);
            return new Box(nonce, data, nonceLength);
        }
    }]);
    return Box;
}();

var KeyStore = function () {
    function KeyStore(privateKey) {
        classCallCheck(this, KeyStore);

        if (arguments.length > 1) {
            throw new Error('Too many arguments in KeyStore constructor');
        }
        if (privateKey === undefined) {
            this._keyPair = nacl.box.keyPair();
            console.debug('KeyStore: New public key:', u8aToHex(this._keyPair.publicKey));
        } else {
            this._keyPair = nacl.box.keyPair.fromSecretKey(validateKey(privateKey, "Private key"));
            console.debug('KeyStore: Restored public key:', u8aToHex(this._keyPair.publicKey));
        }
    }

    createClass(KeyStore, [{
        key: 'encrypt',
        value: function encrypt(bytes, nonce, otherKey) {
            var encrypted = nacl.box(bytes, nonce, otherKey, this._keyPair.secretKey);
            return new Box(nonce, encrypted, nacl.box.nonceLength);
        }
    }, {
        key: 'decrypt',
        value: function decrypt(box, otherKey) {
            var data = nacl.box.open(box.data, box.nonce, otherKey, this._keyPair.secretKey);
            if (data === false) {
                throw 'decryption-failed';
            }
            return data;
        }
    }, {
        key: 'publicKeyHex',
        get: function get() {
            return u8aToHex(this._keyPair.publicKey);
        }
    }, {
        key: 'publicKeyBytes',
        get: function get() {
            return this._keyPair.publicKey;
        }
    }, {
        key: 'secretKeyHex',
        get: function get() {
            return u8aToHex(this._keyPair.secretKey);
        }
    }, {
        key: 'secretKeyBytes',
        get: function get() {
            return this._keyPair.secretKey;
        }
    }, {
        key: 'keypair',
        get: function get() {
            return this._keyPair;
        }
    }]);
    return KeyStore;
}();

var AuthToken = function () {
    function AuthToken(bytes) {
        classCallCheck(this, AuthToken);

        this._authToken = null;
        if (typeof bytes === 'undefined') {
            this._authToken = nacl.randomBytes(nacl.secretbox.keyLength);
            console.debug('AuthToken: Generated auth token');
        } else {
            if (bytes.byteLength != nacl.secretbox.keyLength) {
                console.error('Auth token must be', nacl.secretbox.keyLength, 'bytes long.');
                throw 'bad-token-length';
            }
            this._authToken = bytes;
            console.debug('AuthToken: Initialized auth token');
        }
    }

    createClass(AuthToken, [{
        key: 'encrypt',
        value: function encrypt(bytes, nonce) {
            var encrypted = nacl.secretbox(bytes, nonce, this._authToken);
            return new Box(nonce, encrypted, nacl.secretbox.nonceLength);
        }
    }, {
        key: 'decrypt',
        value: function decrypt(box) {
            var data = nacl.secretbox.open(box.data, box.nonce, this._authToken);
            if (data === false) {
                throw 'decryption-failed';
            }
            return data;
        }
    }, {
        key: 'keyBytes',
        get: function get() {
            return this._authToken;
        }
    }, {
        key: 'keyHex',
        get: function get() {
            return u8aToHex(this._authToken);
        }
    }]);
    return AuthToken;
}();

var Cookie = function () {
    function Cookie(bytes) {
        classCallCheck(this, Cookie);

        if (typeof bytes !== 'undefined') {
            if (bytes.length !== 16) {
                throw 'bad-cookie-length';
            }
            this.bytes = bytes;
        } else {
            this.bytes = nacl.randomBytes(Cookie.COOKIE_LENGTH);
        }
    }

    createClass(Cookie, [{
        key: 'asArrayBuffer',
        value: function asArrayBuffer() {
            return this.bytes.buffer.slice(this.bytes.byteOffset, this.bytes.byteLength);
        }
    }, {
        key: 'equals',
        value: function equals(otherCookie) {
            if (otherCookie.bytes === this.bytes) return true;
            if (otherCookie.bytes == null || this.bytes == null) return false;
            if (otherCookie.bytes.byteLength != this.bytes.byteLength) return false;
            for (var i = 0; i < this.bytes.byteLength; i++) {
                if (otherCookie.bytes[i] != this.bytes[i]) return false;
            }
            return true;
        }
    }], [{
        key: 'fromArrayBuffer',
        value: function fromArrayBuffer(buffer) {
            return new Cookie(new Uint8Array(buffer));
        }
    }]);
    return Cookie;
}();

Cookie.COOKIE_LENGTH = 16;

var CookiePair = function () {
    function CookiePair(ours, theirs) {
        classCallCheck(this, CookiePair);

        this._ours = null;
        this._theirs = null;
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            if (theirs.equals(ours)) {
                throw new ProtocolError("Their cookie matches our cookie");
            }
            this._ours = ours;
            this._theirs = theirs;
        } else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this._ours = new Cookie();
        } else {
            throw new Error('Either both or no cookies must be specified');
        }
    }

    createClass(CookiePair, [{
        key: 'ours',
        get: function get() {
            return this._ours;
        }
    }, {
        key: 'theirs',
        get: function get() {
            return this._theirs;
        },
        set: function set(cookie) {
            if (cookie.equals(this._ours)) {
                throw new ProtocolError("Their cookie matches our cookie");
            }
            this._theirs = cookie;
        }
    }], [{
        key: 'fromTheirs',
        value: function fromTheirs(theirs) {
            var ours = void 0;
            do {
                ours = new Cookie();
            } while (ours.equals(theirs));
            return new CookiePair(ours, theirs);
        }
    }]);
    return CookiePair;
}();

var Nonce = function () {
    function Nonce(cookie, overflow, sequenceNumber, source, destination) {
        classCallCheck(this, Nonce);

        this._cookie = cookie;
        this._overflow = overflow;
        this._sequenceNumber = sequenceNumber;
        this._source = source;
        this._destination = destination;
    }

    createClass(Nonce, [{
        key: 'toArrayBuffer',
        value: function toArrayBuffer() {
            var buf = new ArrayBuffer(Nonce.TOTAL_LENGTH);
            var uint8view = new Uint8Array(buf);
            uint8view.set(this._cookie.bytes);
            var view = new DataView(buf);
            view.setUint8(16, this._source);
            view.setUint8(17, this._destination);
            view.setUint16(18, this._overflow);
            view.setUint32(20, this._sequenceNumber);
            return buf;
        }
    }, {
        key: 'cookie',
        get: function get() {
            return this._cookie;
        }
    }, {
        key: 'overflow',
        get: function get() {
            return this._overflow;
        }
    }, {
        key: 'sequenceNumber',
        get: function get() {
            return this._sequenceNumber;
        }
    }, {
        key: 'combinedSequenceNumber',
        get: function get() {
            return (this._overflow << 32) + this._sequenceNumber;
        }
    }, {
        key: 'source',
        get: function get() {
            return this._source;
        }
    }, {
        key: 'destination',
        get: function get() {
            return this._destination;
        }
    }], [{
        key: 'fromArrayBuffer',
        value: function fromArrayBuffer(packet) {
            if (packet.byteLength != this.TOTAL_LENGTH) {
                throw 'bad-packet-length';
            }
            var view = new DataView(packet);
            var cookie = new Cookie(new Uint8Array(packet, 0, 16));
            var source = view.getUint8(16);
            var destination = view.getUint8(17);
            var overflow = view.getUint16(18);
            var sequenceNumber = view.getUint32(20);
            return new Nonce(cookie, overflow, sequenceNumber, source, destination);
        }
    }]);
    return Nonce;
}();

Nonce.TOTAL_LENGTH = 24;

function decryptKeystore(box, keyStore, otherKey, msgType) {
    try {
        return keyStore.decrypt(box, otherKey);
    } catch (e) {
        if (e === 'decryption-failed') {
            throw new SignalingError(exports.CloseCode.ProtocolError, 'Could not decrypt ' + msgType + ' message.');
        } else {
            throw e;
        }
    }
}

function isResponderId(id) {
    return id >= 0x02 && id <= 0xff;
}

var HandoverState = function () {
    function HandoverState() {
        classCallCheck(this, HandoverState);

        this.reset();
    }

    createClass(HandoverState, [{
        key: 'reset',
        value: function reset() {
            this._local = false;
            this._peer = false;
        }
    }, {
        key: 'local',
        get: function get() {
            return this._local;
        },
        set: function set(state) {
            var wasBoth = this.both;
            this._local = state;
            if (!wasBoth && this.both && this.onBoth !== undefined) {
                this.onBoth();
            }
        }
    }, {
        key: 'peer',
        get: function get() {
            return this._peer;
        },
        set: function set(state) {
            var wasBoth = this.both;
            this._peer = state;
            if (!wasBoth && this.both && this.onBoth !== undefined) {
                this.onBoth();
            }
        }
    }, {
        key: 'both',
        get: function get() {
            return this._local === true && this._peer === true;
        }
    }, {
        key: 'any',
        get: function get() {
            return this._local === true || this._peer === true;
        }
    }]);
    return HandoverState;
}();

var CombinedSequence = function () {
    function CombinedSequence() {
        classCallCheck(this, CombinedSequence);

        this.sequenceNumber = randomUint32();
        this.overflow = 0;
    }

    createClass(CombinedSequence, [{
        key: 'next',
        value: function next() {
            if (this.sequenceNumber + 1 >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
                this.sequenceNumber = 0;
                this.overflow += 1;
                if (this.overflow >= CombinedSequence.OVERFLOW_MAX) {
                    console.error('Overflow number just overflowed!');
                    throw new Error('overflow-overflow');
                }
            } else {
                this.sequenceNumber += 1;
            }
            return {
                sequenceNumber: this.sequenceNumber,
                overflow: this.overflow
            };
        }
    }]);
    return CombinedSequence;
}();

CombinedSequence.SEQUENCE_NUMBER_MAX = 0x100000000;
CombinedSequence.OVERFLOW_MAX = 0x100000;

var CombinedSequencePair = function CombinedSequencePair(ours, theirs) {
    classCallCheck(this, CombinedSequencePair);

    this.ours = null;
    this.theirs = null;
    if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
        this.ours = ours;
        this.theirs = theirs;
    } else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
        this.ours = new CombinedSequence();
    } else {
        throw new Error('Either both or no combined sequences must be specified');
    }
};

var Peer = function () {
    function Peer(id, cookiePair) {
        classCallCheck(this, Peer);

        this._csnPair = new CombinedSequencePair();
        this._id = id;
        if (cookiePair === undefined) {
            this._cookiePair = new CookiePair();
        } else {
            this._cookiePair = cookiePair;
        }
    }

    createClass(Peer, [{
        key: "id",
        get: function get() {
            return this._id;
        }
    }, {
        key: "hexId",
        get: function get() {
            return byteToHex(this._id);
        }
    }, {
        key: "csnPair",
        get: function get() {
            return this._csnPair;
        }
    }, {
        key: "cookiePair",
        get: function get() {
            return this._cookiePair;
        }
    }, {
        key: "name",
        get: function get() {}
    }]);
    return Peer;
}();

var Initiator = function (_Peer) {
    inherits(Initiator, _Peer);

    function Initiator(permanentKey) {
        classCallCheck(this, Initiator);

        var _this = possibleConstructorReturn(this, (Initiator.__proto__ || Object.getPrototypeOf(Initiator)).call(this, Initiator.ID));

        _this.connected = false;
        _this.handshakeState = 'new';
        _this.permanentKey = permanentKey;
        return _this;
    }

    createClass(Initiator, [{
        key: "name",
        get: function get() {
            return "Initiator";
        }
    }]);
    return Initiator;
}(Peer);

Initiator.ID = 0x01;

var Responder = function (_Peer2) {
    inherits(Responder, _Peer2);

    function Responder(id, counter) {
        classCallCheck(this, Responder);

        var _this2 = possibleConstructorReturn(this, (Responder.__proto__ || Object.getPrototypeOf(Responder)).call(this, id));

        _this2.keyStore = new KeyStore();
        _this2.handshakeState = 'new';
        _this2._counter = counter;
        return _this2;
    }

    createClass(Responder, [{
        key: "name",
        get: function get() {
            return "Responder " + this.id;
        }
    }, {
        key: "counter",
        get: function get() {
            return this._counter;
        }
    }]);
    return Responder;
}(Peer);

var Server = function (_Peer3) {
    inherits(Server, _Peer3);

    function Server() {
        classCallCheck(this, Server);

        var _this3 = possibleConstructorReturn(this, (Server.__proto__ || Object.getPrototypeOf(Server)).call(this, Server.ID));

        _this3.handshakeState = 'new';
        return _this3;
    }

    createClass(Server, [{
        key: "name",
        get: function get() {
            return "Server";
        }
    }]);
    return Server;
}(Peer);

Server.ID = 0x00;

var Signaling = function () {
    function Signaling(client, host, port, serverKey, tasks, pingInterval, permanentKey, peerTrustedKey) {
        var _this = this;

        classCallCheck(this, Signaling);

        this.protocol = 'wss';
        this.ws = null;
        this.msgpackOptions = {
            codec: msgpack.createCodec({ binarraybuffer: true })
        };
        this.state = 'new';
        this.handoverState = new HandoverState();
        this.task = null;
        this.server = new Server();
        this.sessionKey = null;
        this.peerTrustedKey = null;
        this.authToken = null;
        this.serverPublicKey = null;
        this.role = null;
        this.logTag = 'Signaling:';
        this.address = Signaling.SALTYRTC_ADDR_UNKNOWN;
        this.onOpen = function (ev) {
            console.info(_this.logTag, 'Opened connection');
            _this.setState('server-handshake');
        };
        this.onError = function (ev) {
            console.error(_this.logTag, 'General WebSocket error', ev);
            _this.client.emit({ type: 'connection-error' });
        };
        this.onClose = function (ev) {
            if (ev.code === exports.CloseCode.Handover) {
                console.info(_this.logTag, 'Closed WebSocket connection due to handover');
            } else {
                console.info(_this.logTag, 'Closed WebSocket connection');
                _this.setState('closed');
                _this.client.emit({ type: 'connection-closed', data: ev.code });
                var log = function log(reason) {
                    return console.error(_this.logTag, 'Websocket close reason:', reason);
                };
                switch (ev.code) {
                    case exports.CloseCode.GoingAway:
                        log('Server is being shut down');
                        break;
                    case exports.CloseCode.NoSharedSubprotocol:
                        log('No shared sub-protocol could be found');
                        break;
                    case exports.CloseCode.PathFull:
                        log('Path full (no free responder byte)');
                        break;
                    case exports.CloseCode.ProtocolError:
                        log('Protocol error');
                        break;
                    case exports.CloseCode.InternalError:
                        log('Internal server error');
                        break;
                    case exports.CloseCode.DroppedByInitiator:
                        log('Dropped by initiator');
                        break;
                    case exports.CloseCode.InvalidKey:
                        log('Invalid server key');
                        break;
                }
            }
        };
        this.onMessage = function (ev) {
            console.debug(_this.logTag, 'New ws message (' + ev.data.byteLength + ' bytes)');
            if (_this.handoverState.peer) {
                console.error(_this.logTag, 'Protocol error: Received WebSocket message from peer ' + 'even though it has already handed over to task.');
                _this.resetConnection(exports.CloseCode.ProtocolError);
                return;
            }
            var nonce = void 0;
            try {
                var box = Box.fromUint8Array(new Uint8Array(ev.data), Nonce.TOTAL_LENGTH);
                nonce = Nonce.fromArrayBuffer(box.nonce.buffer);
                try {
                    _this.validateNonce(nonce);
                } catch (e) {
                    if (e.name === 'ValidationError') {
                        throw new ProtocolError('Invalid nonce: ' + e);
                    } else {
                        throw e;
                    }
                }
                switch (_this.getState()) {
                    case 'server-handshake':
                        _this.onServerHandshakeMessage(box, nonce);
                        break;
                    case 'peer-handshake':
                        _this.onPeerHandshakeMessage(box, nonce);
                        break;
                    case 'task':
                        _this.onSignalingMessage(box, nonce);
                        break;
                    default:
                        console.warn(_this.logTag, 'Received message in', _this.getState(), 'signaling state. Ignoring.');
                }
            } catch (e) {
                if (e.name === 'SignalingError' || e.name === 'ProtocolError') {
                    var errmsg = 'Signaling error: ' + explainCloseCode(e.closeCode);
                    if (e.message) {
                        errmsg += ' (' + e.message + ')';
                    }
                    console.error(_this.logTag, errmsg);
                    switch (_this.state) {
                        case 'new':
                        case 'ws-connecting':
                        case 'server-handshake':
                            _this.resetConnection(e.closeCode);
                            break;
                        case 'peer-handshake':
                            _this.handlePeerHandshakeSignalingError(e, nonce === undefined ? null : nonce.source);
                            break;
                        case 'task':
                            _this.sendClose(e.closeCode);
                            _this.resetConnection(exports.CloseCode.ClosingNormal);
                            break;
                        case 'closing':
                        case 'closed':
                            break;
                    }
                } else if (e.name === 'ConnectionError') {
                    console.warn(_this.logTag, 'Connection error. Resetting connection.');
                    _this.resetConnection(exports.CloseCode.InternalError);
                } else {
                    if (e.hasOwnProperty('stack')) {
                        console.error("An unknown error occurred:");
                        console.error(e.stack);
                    }
                    throw e;
                }
            }
        };
        this.client = client;
        this.permanentKey = permanentKey;
        this.host = host;
        this.port = port;
        this.tasks = tasks;
        this.pingInterval = pingInterval;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
        if (serverKey !== undefined) {
            this.serverPublicKey = serverKey;
        }
        this.handoverState.onBoth = function () {
            _this.client.emit({ type: 'handover' });
            _this.ws.close(exports.CloseCode.Handover);
        };
    }

    createClass(Signaling, [{
        key: "setState",
        value: function setState(newState) {
            this.state = newState;
            this.client.emit({ type: 'state-change', data: newState });
            this.client.emit({ type: 'state-change:' + newState });
        }
    }, {
        key: "getState",
        value: function getState() {
            return this.state;
        }
    }, {
        key: "msgpackEncode",
        value: function msgpackEncode(data) {
            return msgpack.encode(data, this.msgpackOptions);
        }
    }, {
        key: "msgpackDecode",
        value: function msgpackDecode(data) {
            return msgpack.decode(data, this.msgpackOptions);
        }
    }, {
        key: "connect",
        value: function connect() {
            this.resetConnection();
            this.initWebsocket();
        }
    }, {
        key: "disconnect",
        value: function disconnect() {
            var reason = exports.CloseCode.ClosingNormal;
            this.setState('closing');
            if (this.state === 'task') {
                this.sendClose(reason);
            }
            if (this.ws !== null) {
                console.debug(this.logTag, 'Disconnecting WebSocket');
                this.ws.close(reason);
            }
            this.ws = null;
            if (this.task !== null) {
                console.debug(this.logTag, 'Closing task connections');
                this.task.close(reason);
            }
            this.setState('closed');
        }
    }, {
        key: "initWebsocket",
        value: function initWebsocket() {
            var url = this.protocol + '://' + this.host + ':' + this.port + '/';
            var path = this.getWebsocketPath();
            this.ws = new WebSocket(url + path, Signaling.SALTYRTC_SUBPROTOCOL);
            this.ws.binaryType = 'arraybuffer';
            this.ws.addEventListener('open', this.onOpen);
            this.ws.addEventListener('error', this.onError);
            this.ws.addEventListener('close', this.onClose);
            this.ws.addEventListener('message', this.onMessage);
            this.setState('ws-connecting');
            console.debug(this.logTag, 'Opening WebSocket connection to', url + path);
        }
    }, {
        key: "onServerHandshakeMessage",
        value: function onServerHandshakeMessage(box, nonce) {
            var payload = void 0;
            if (this.server.handshakeState === 'new') {
                payload = box.data;
            } else {
                payload = this.permanentKey.decrypt(box, this.server.sessionKey);
            }
            var msg = this.decodeMessage(payload, 'server handshake');
            switch (this.server.handshakeState) {
                case 'new':
                    if (msg.type !== 'server-hello') {
                        throw new ProtocolError('Expected server-hello message, but got ' + msg.type);
                    }
                    console.debug(this.logTag, 'Received server-hello');
                    this.handleServerHello(msg, nonce);
                    this.sendClientHello();
                    this.sendClientAuth();
                    break;
                case 'hello-sent':
                    throw new ProtocolError('Received ' + msg.type + ' message before sending client-auth');
                case 'auth-sent':
                    if (msg.type !== 'server-auth') {
                        throw new ProtocolError('Expected server-auth message, but got ' + msg.type);
                    }
                    console.debug(this.logTag, "Received server-auth");
                    this.handleServerAuth(msg, nonce);
                    break;
                case 'done':
                    throw new SignalingError(exports.CloseCode.InternalError, 'Received server handshake message even though server handshake state is set to \'done\'');
                default:
                    throw new SignalingError(exports.CloseCode.InternalError, 'Unknown server handshake state: ' + this.server.handshakeState);
            }
            if (this.server.handshakeState === 'done') {
                this.setState('peer-handshake');
                console.debug(this.logTag, 'Server handshake done');
                this.initPeerHandshake();
            }
        }
    }, {
        key: "onSignalingMessage",
        value: function onSignalingMessage(box, nonce) {
            console.debug('Message received');
            if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
                this.onSignalingServerMessage(box);
            } else {
                var decrypted = this.sessionKey.decrypt(box, this.getPeerSessionKey());
                this.onSignalingPeerMessage(decrypted);
            }
        }
    }, {
        key: "onSignalingServerMessage",
        value: function onSignalingServerMessage(box) {
            var msg = this.decryptServerMessage(box);
            if (msg.type === 'send-error') {
                this.handleSendError(msg);
            } else {
                console.warn(this.logTag, 'Invalid server message type:', msg.type);
            }
        }
    }, {
        key: "onSignalingPeerMessage",
        value: function onSignalingPeerMessage(decrypted) {
            var msg = this.decodeMessage(decrypted);
            if (msg.type === 'close') {
                console.debug('Received close');
                this.handleClose(msg);
            } else if (msg.type === 'application') {
                console.debug(this.logTag, 'Received application message');
                this.handleApplication(msg);
            } else if (this.task !== null && this.task.getSupportedMessageTypes().indexOf(msg.type) !== -1) {
                console.debug(this.logTag, 'Received', msg.type, '[' + this.task.getName() + ']');
                this.task.onTaskMessage(msg);
            } else {
                console.warn(this.logTag, 'Received message with invalid type from peer:', msg.type);
            }
        }
    }, {
        key: "handleServerHello",
        value: function handleServerHello(msg, nonce) {
            this.server.sessionKey = new Uint8Array(msg.key);
            this.server.cookiePair.theirs = nonce.cookie;
        }
    }, {
        key: "sendClientAuth",
        value: function sendClientAuth() {
            var message = {
                type: 'client-auth',
                your_cookie: this.server.cookiePair.theirs.asArrayBuffer(),
                subprotocols: [Signaling.SALTYRTC_SUBPROTOCOL],
                ping_interval: this.pingInterval
            };
            if (this.serverPublicKey !== null) {
                var start = this.serverPublicKey.byteOffset;
                var end = start + this.serverPublicKey.byteLength;
                message.your_key = this.serverPublicKey.buffer.slice(start, end);
            }
            var packet = this.buildPacket(message, this.server);
            console.debug(this.logTag, 'Sending client-auth');
            this.ws.send(packet);
            this.server.handshakeState = 'auth-sent';
        }
    }, {
        key: "handleSendError",
        value: function handleSendError(msg) {
            var id = new DataView(msg.id);
            var idString = u8aToHex(new Uint8Array(msg.id));
            var source = id.getUint8(0);
            var destination = id.getUint8(1);
            if (source != this.address) {
                throw new ProtocolError("Received send-error message for a message not sent by us!");
            }
            console.warn(this.logTag, "SendError: Could not send unknown message:", idString);
            this._handleSendError(destination);
        }
    }, {
        key: "handleApplication",
        value: function handleApplication(msg) {
            this.client.emit({ type: 'application', data: msg.data });
        }
    }, {
        key: "sendClose",
        value: function sendClose(reason) {
            var message = {
                type: 'close',
                reason: reason
            };
            console.debug(this.logTag, 'Sending close');
            if (this.handoverState.local === true) {
                this.task.sendSignalingMessage(this.msgpackEncode(message));
            } else {
                var packet = this.buildPacket(message, this.getPeer());
                this.ws.send(packet);
            }
        }
    }, {
        key: "handleClose",
        value: function handleClose(msg) {
            console.warn(this.logTag, 'Received close message. Reason:', msg.reason, '(' + explainCloseCode(msg.reason) + ')');
            this.task.close(msg.reason);
            this.resetConnection(exports.CloseCode.GoingAway);
        }
    }, {
        key: "validateNonce",
        value: function validateNonce(nonce) {
            this.validateNonceSource(nonce);
            this.validateNonceDestination(nonce);
            this.validateNonceCsn(nonce);
            this.validateNonceCookie(nonce);
        }
    }, {
        key: "validateNonceSource",
        value: function validateNonceSource(nonce) {
            switch (this.state) {
                case 'server-handshake':
                    if (nonce.source !== Signaling.SALTYRTC_ADDR_SERVER) {
                        throw new ValidationError("Received message during server handshake " + "with invalid sender address (" + nonce.source + " != " + Signaling.SALTYRTC_ADDR_SERVER + ")");
                    }
                    break;
                case 'peer-handshake':
                    if (nonce.source !== Signaling.SALTYRTC_ADDR_SERVER) {
                        if (this.role === 'initiator' && !isResponderId(nonce.source)) {
                            throw new ValidationError("Initiator peer message does not come from " + "a valid responder address: " + nonce.source);
                        } else if (this.role === 'responder' && nonce.source != Signaling.SALTYRTC_ADDR_INITIATOR) {
                            throw new ValidationError("Responder peer message does not come from " + "intitiator (" + Signaling.SALTYRTC_ADDR_INITIATOR + "), " + "but from " + nonce.source);
                        }
                    }
                    break;
                case 'task':
                    if (nonce.source !== this.getPeer().id) {
                        throw new ValidationError("Received message after handshake with invalid sender address (" + nonce.source + " != " + this.getPeer().id + ")");
                    }
                    break;
                default:
                    throw new ProtocolError('Cannot validate message nonce in signaling state ' + this.state);
            }
        }
    }, {
        key: "validateNonceDestination",
        value: function validateNonceDestination(nonce) {
            var expected = null;
            if (this.state === 'server-handshake') {
                switch (this.server.handshakeState) {
                    case 'new':
                    case 'hello-sent':
                        expected = Signaling.SALTYRTC_ADDR_UNKNOWN;
                        break;
                    case 'auth-sent':
                        if (this.role === 'initiator') {
                            expected = Signaling.SALTYRTC_ADDR_INITIATOR;
                        } else {
                            if (!isResponderId(nonce.destination)) {
                                throw new ValidationError("Received message during server handshake with invalid " + "receiver address (" + nonce.destination + " is not a valid responder id)");
                            }
                        }
                        break;
                    case 'done':
                        expected = this.address;
                        break;
                }
            } else if (this.state === 'peer-handshake' || this.state === 'task') {
                expected = this.address;
            } else {
                throw new ValidationError("Cannot validate message nonce in signaling state " + this.state);
            }
            if (expected !== null && nonce.destination !== expected) {
                throw new ValidationError("Received message with invalid destination (" + nonce.destination + " != " + expected + ")");
            }
        }
    }, {
        key: "validateNonceCsn",
        value: function validateNonceCsn(nonce) {
            var peer = this.getPeerWithId(nonce.source);
            if (peer === null) {
                throw new ProtocolError("Could not find peer " + nonce.source);
            }
            if (peer.csnPair.theirs === null) {
                if (nonce.overflow !== 0) {
                    throw new ValidationError("First message from " + peer.name + " must have set the overflow number to 0");
                }
                peer.csnPair.theirs = nonce.combinedSequenceNumber;
            } else {
                var previous = peer.csnPair.theirs;
                var current = nonce.combinedSequenceNumber;
                if (current < previous) {
                    throw new ValidationError(peer.name + " CSN is lower than last time");
                } else if (current === previous) {
                    throw new ValidationError(peer.name + " CSN hasn't been incremented");
                } else {
                    peer.csnPair.theirs = current;
                }
            }
        }
    }, {
        key: "validateNonceCookie",
        value: function validateNonceCookie(nonce) {
            var peer = this.getPeerWithId(nonce.source);
            if (peer !== null && peer.cookiePair.theirs !== null) {
                if (!nonce.cookie.equals(peer.cookiePair.theirs)) {
                    throw new ValidationError(peer.name + " cookie changed");
                }
            }
        }
    }, {
        key: "validateRepeatedCookie",
        value: function validateRepeatedCookie(peer, repeatedCookieBytes) {
            var repeatedCookie = Cookie.fromArrayBuffer(repeatedCookieBytes);
            if (!repeatedCookie.equals(peer.cookiePair.ours)) {
                console.debug(this.logTag, 'Their cookie:', repeatedCookie.bytes);
                console.debug(this.logTag, 'Our cookie:', peer.cookiePair.ours.bytes);
                throw new ProtocolError('Peer repeated cookie does not match our cookie');
            }
        }
    }, {
        key: "validateSignedKeys",
        value: function validateSignedKeys(signed_keys, nonce, serverPublicKey) {
            if (signed_keys === null || signed_keys === undefined) {
                throw new ValidationError("Server did not send signed_keys in server-auth message");
            }
            var box = new Box(new Uint8Array(nonce.toArrayBuffer()), new Uint8Array(signed_keys), nacl.box.nonceLength);
            console.debug(this.logTag, "Expected server public permanent key is", u8aToHex(serverPublicKey));
            console.debug(this.logTag, "Server public session key is", u8aToHex(this.server.sessionKey));
            var decrypted = void 0;
            try {
                decrypted = this.permanentKey.decrypt(box, serverPublicKey);
            } catch (e) {
                if (e === 'decryption-failed') {
                    throw new ValidationError("Could not decrypt signed_keys in server_auth message");
                }
                throw e;
            }
            var expected = concat(this.server.sessionKey, this.permanentKey.publicKeyBytes);
            if (!arraysAreEqual(decrypted, expected)) {
                throw new ValidationError("Decrypted signed_keys in server-auth message is invalid");
            }
        }
    }, {
        key: "decodeMessage",
        value: function decodeMessage(data, expectedType) {
            var enforce = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var msg = this.msgpackDecode(data);
            if (msg.type === undefined) {
                throw new ProtocolError('Malformed ' + expectedType + ' message: Failed to decode msgpack data.');
            }
            if (enforce && expectedType !== undefined && msg.type !== expectedType) {
                throw new ProtocolError('Invalid ' + expectedType + ' message, bad type: ' + msg);
            }
            return msg;
        }
    }, {
        key: "buildPacket",
        value: function buildPacket(message, receiver) {
            var encrypt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var csn = void 0;
            try {
                csn = receiver.csnPair.ours.next();
            } catch (e) {
                throw new ProtocolError("CSN overflow: " + e.message);
            }
            var nonce = new Nonce(receiver.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver.id);
            var nonceBytes = new Uint8Array(nonce.toArrayBuffer());
            var data = this.msgpackEncode(message);
            if (encrypt === false) {
                return concat(nonceBytes, data);
            }
            var box = void 0;
            if (receiver.id === Signaling.SALTYRTC_ADDR_SERVER) {
                box = this.encryptHandshakeDataForServer(data, nonceBytes);
            } else if (receiver.id === Signaling.SALTYRTC_ADDR_INITIATOR || isResponderId(receiver.id)) {
                box = this.encryptHandshakeDataForPeer(receiver.id, message.type, data, nonceBytes);
            } else {
                throw new ProtocolError('Bad receiver byte: ' + receiver);
            }
            return box.toUint8Array();
        }
    }, {
        key: "encryptHandshakeDataForServer",
        value: function encryptHandshakeDataForServer(payload, nonceBytes) {
            return this.permanentKey.encrypt(payload, nonceBytes, this.server.sessionKey);
        }
    }, {
        key: "decryptData",
        value: function decryptData(box) {
            var decryptedBytes = this.sessionKey.decrypt(box, this.getPeerSessionKey());
            var start = decryptedBytes.byteOffset;
            var end = start + decryptedBytes.byteLength;
            return decryptedBytes.buffer.slice(start, end);
        }
    }, {
        key: "resetConnection",
        value: function resetConnection(reason) {
            if (this.ws !== null) {
                console.debug(this.logTag, 'Disconnecting WebSocket (close code ' + reason + ')');
                if (reason == exports.CloseCode.GoingAway) {
                    this.ws.close();
                } else {
                    this.ws.close(reason);
                }
            }
            this.ws = null;
            this.server = new Server();
            this.handoverState.reset();
            this.setState('new');
            if (reason !== undefined) {
                console.debug(this.logTag, 'Connection reset');
            }
        }
    }, {
        key: "initTask",
        value: function initTask(task, data) {
            try {
                task.init(this, data);
            } catch (e) {
                if (e.name === 'ValidationError') {
                    throw new ProtocolError("Peer sent invalid task data");
                }
                throw e;
            }
            this.task = task;
        }
    }, {
        key: "decryptPeerMessage",
        value: function decryptPeerMessage(box) {
            var convertErrors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            try {
                var decrypted = this.sessionKey.decrypt(box, this.getPeerSessionKey());
                return this.decodeMessage(decrypted, 'peer');
            } catch (e) {
                if (convertErrors === true && e === 'decryption-failed') {
                    var nonce = Nonce.fromArrayBuffer(box.nonce.buffer);
                    throw new ProtocolError('Could not decrypt peer message from ' + byteToHex(nonce.source));
                } else {
                    throw e;
                }
            }
        }
    }, {
        key: "decryptServerMessage",
        value: function decryptServerMessage(box) {
            try {
                var decrypted = this.permanentKey.decrypt(box, this.server.sessionKey);
                return this.decodeMessage(decrypted, 'server');
            } catch (e) {
                if (e === 'decryption-failed') {
                    throw new ProtocolError('Could not decrypt server message');
                } else {
                    throw e;
                }
            }
        }
    }, {
        key: "sendApplication",
        value: function sendApplication(msg) {
            this.sendPostClientHandshakeMessage(msg, 'application');
        }
    }, {
        key: "sendTaskMessage",
        value: function sendTaskMessage(msg) {
            this.sendPostClientHandshakeMessage(msg, 'task');
        }
    }, {
        key: "sendPostClientHandshakeMessage",
        value: function sendPostClientHandshakeMessage(msg, name) {
            if (this.state !== 'task') {
                throw new SignalingError(exports.CloseCode.ProtocolError, 'Cannot send ' + name + ' message in "' + this.state + '" state');
            }
            var receiver = this.getPeer();
            if (receiver === null) {
                throw new SignalingError(exports.CloseCode.InternalError, 'No peer address could be found');
            }
            console.debug('Sending', name, 'message');
            if (this.handoverState.local === true) {
                this.task.sendSignalingMessage(this.msgpackEncode(msg));
            } else {
                var packet = this.buildPacket(msg, receiver);
                this.ws.send(packet);
            }
        }
    }, {
        key: "encryptForPeer",
        value: function encryptForPeer(data, nonce) {
            return this.sessionKey.encrypt(data, nonce, this.getPeerSessionKey());
        }
    }, {
        key: "decryptFromPeer",
        value: function decryptFromPeer(box) {
            try {
                return this.sessionKey.decrypt(box, this.getPeerSessionKey());
            } catch (e) {
                if (e === 'decryption-failed') {
                    if (this.state === 'task') {
                        this.sendClose(exports.CloseCode.InternalError);
                    }
                    this.resetConnection(exports.CloseCode.InternalError);
                    throw new SignalingError(exports.CloseCode.InternalError, "Decryption of peer message failed. This should not happen.");
                } else {
                    throw e;
                }
            }
        }
    }, {
        key: "permanentKeyBytes",
        get: function get() {
            return this.permanentKey.publicKeyBytes;
        }
    }, {
        key: "authTokenBytes",
        get: function get() {
            if (this.authToken !== null) {
                return this.authToken.keyBytes;
            }
            return null;
        }
    }, {
        key: "peerPermanentKeyBytes",
        get: function get() {
            return this.getPeerPermanentKey();
        }
    }]);
    return Signaling;
}();

Signaling.SALTYRTC_SUBPROTOCOL = 'v1.saltyrtc.org';
Signaling.SALTYRTC_ADDR_UNKNOWN = 0x00;
Signaling.SALTYRTC_ADDR_SERVER = 0x00;
Signaling.SALTYRTC_ADDR_INITIATOR = 0x01;

var InitiatorSignaling = function (_Signaling) {
    inherits(InitiatorSignaling, _Signaling);

    function InitiatorSignaling(client, host, port, serverKey, tasks, pingInterval, permanentKey, responderTrustedKey) {
        classCallCheck(this, InitiatorSignaling);

        var _this = possibleConstructorReturn(this, (InitiatorSignaling.__proto__ || Object.getPrototypeOf(InitiatorSignaling)).call(this, client, host, port, serverKey, tasks, pingInterval, permanentKey, responderTrustedKey));

        _this.logTag = 'Initiator:';
        _this.responderCounter = 0;
        _this.responders = null;
        _this.responder = null;
        _this.role = 'initiator';
        if (responderTrustedKey === undefined) {
            _this.authToken = new AuthToken();
        }
        return _this;
    }

    createClass(InitiatorSignaling, [{
        key: "getWebsocketPath",
        value: function getWebsocketPath() {
            return this.permanentKey.publicKeyHex;
        }
    }, {
        key: "encryptHandshakeDataForPeer",
        value: function encryptHandshakeDataForPeer(receiver, messageType, payload, nonceBytes) {
            if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
                throw new ProtocolError('Initiator cannot encrypt messages for initiator');
            } else if (!isResponderId(receiver)) {
                throw new ProtocolError('Bad receiver byte: ' + receiver);
            }
            var responder = void 0;
            if (this.getState() === 'task') {
                responder = this.responder;
            } else if (this.responders.has(receiver)) {
                responder = this.responders.get(receiver);
            } else {
                throw new ProtocolError('Unknown responder: ' + receiver);
            }
            switch (messageType) {
                case 'key':
                    return this.permanentKey.encrypt(payload, nonceBytes, responder.permanentKey);
                default:
                    return responder.keyStore.encrypt(payload, nonceBytes, responder.sessionKey);
            }
        }
    }, {
        key: "getPeer",
        value: function getPeer() {
            if (this.responder !== null) {
                return this.responder;
            }
            return null;
        }
    }, {
        key: "getPeerSessionKey",
        value: function getPeerSessionKey() {
            if (this.responder !== null) {
                return this.responder.sessionKey;
            }
            return null;
        }
    }, {
        key: "getPeerPermanentKey",
        value: function getPeerPermanentKey() {
            if (this.responder !== null) {
                return this.responder.permanentKey;
            }
            return null;
        }
    }, {
        key: "getPeerWithId",
        value: function getPeerWithId(id) {
            if (id === Signaling.SALTYRTC_ADDR_SERVER) {
                return this.server;
            } else if (isResponderId(id)) {
                if (this.state === 'task' && this.responder !== null && this.responder.id === id) {
                    return this.responder;
                } else if (this.responders.has(id)) {
                    return this.responders.get(id);
                }
                return null;
            } else {
                throw new ProtocolError("Invalid peer id: " + id);
            }
        }
    }, {
        key: "handlePeerHandshakeSignalingError",
        value: function handlePeerHandshakeSignalingError(e, source) {
            if (source !== null) {
                this.dropResponder(source, e.closeCode);
            }
        }
    }, {
        key: "processNewResponder",
        value: function processNewResponder(responderId) {
            if (this.responders.has(responderId)) {
                this.responders.delete(responderId);
            }
            var responder = new Responder(responderId, this.responderCounter++);
            if (this.peerTrustedKey !== null) {
                responder.handshakeState = 'token-received';
                responder.permanentKey = this.peerTrustedKey;
            }
            this.responders.set(responderId, responder);
            if (this.responders.size > 252) {
                this.dropOldestInactiveResponder();
            }
            this.client.emit({ type: 'new-responder', data: responderId });
        }
    }, {
        key: "dropOldestInactiveResponder",
        value: function dropOldestInactiveResponder() {
            console.warn(this.logTag, "Dropping oldest inactive responder");
            var drop = null;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.responders.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var r = _step.value;

                    if (r.handshakeState == 'new') {
                        if (drop === null) {
                            drop = r;
                        } else if (r.counter < drop.counter) {
                            drop = r;
                        }
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (drop !== null) {
                this.dropResponder(drop.id, exports.CloseCode.DroppedByInitiator);
            }
        }
    }, {
        key: "onPeerHandshakeMessage",
        value: function onPeerHandshakeMessage(box, nonce) {
            if (nonce.destination != this.address) {
                throw new ProtocolError('Message destination does not match our address');
            }
            var payload = void 0;
            if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
                payload = decryptKeystore(box, this.permanentKey, this.server.sessionKey, 'server');
                var msg = this.decodeMessage(payload, 'server');
                switch (msg.type) {
                    case 'new-responder':
                        console.debug(this.logTag, 'Received new-responder', byteToHex(msg.id));
                        this.handleNewResponder(msg);
                        break;
                    case 'send-error':
                        console.debug(this.logTag, 'Received send-error');
                        this.handleSendError(msg);
                        break;
                    default:
                        throw new ProtocolError('Received unexpected server message: ' + msg.type);
                }
            } else if (isResponderId(nonce.source)) {
                var responder = this.responders.get(nonce.source);
                if (responder === null) {
                    throw new ProtocolError('Unknown message source: ' + nonce.source);
                }
                var _msg = void 0;
                switch (responder.handshakeState) {
                    case 'new':
                        if (this.peerTrustedKey !== null) {
                            throw new SignalingError(exports.CloseCode.InternalError, 'Handshake state is "new" even though a trusted key is available');
                        }
                        try {
                            payload = this.authToken.decrypt(box);
                        } catch (e) {
                            console.warn(this.logTag, 'Could not decrypt token message: ', e);
                            this.dropResponder(responder.id, exports.CloseCode.InitiatorCouldNotDecrypt);
                            return;
                        }
                        _msg = this.decodeMessage(payload, 'token', true);
                        console.debug(this.logTag, 'Received token');
                        this.handleToken(_msg, responder);
                        break;
                    case 'token-received':
                        var peerPublicKey = this.peerTrustedKey || responder.permanentKey;
                        try {
                            payload = this.permanentKey.decrypt(box, peerPublicKey);
                        } catch (e) {
                            if (this.peerTrustedKey !== null) {
                                console.warn(this.logTag, 'Could not decrypt key message');
                                this.dropResponder(responder.id, exports.CloseCode.InitiatorCouldNotDecrypt);
                                return;
                            }
                            throw e;
                        }
                        _msg = this.decodeMessage(payload, 'key', true);
                        console.debug(this.logTag, 'Received key');
                        this.handleKey(_msg, responder);
                        this.sendKey(responder);
                        break;
                    case 'key-sent':
                        payload = decryptKeystore(box, responder.keyStore, responder.sessionKey, 'auth');
                        _msg = this.decodeMessage(payload, 'auth', true);
                        console.debug(this.logTag, 'Received auth');
                        this.handleAuth(_msg, responder, nonce);
                        this.sendAuth(responder, nonce);
                        this.responder = this.responders.get(responder.id);
                        this.sessionKey = responder.keyStore;
                        this.responders.delete(responder.id);
                        this.dropResponders(exports.CloseCode.DroppedByInitiator);
                        this.setState('task');
                        console.info(this.logTag, 'Peer handshake done');
                        this.task.onPeerHandshakeDone();
                        break;
                    default:
                        throw new SignalingError(exports.CloseCode.InternalError, 'Unknown responder handshake state');
                }
            } else {
                throw new SignalingError(exports.CloseCode.InternalError, 'Message source is neither the server nor a responder');
            }
        }
    }, {
        key: "sendClientHello",
        value: function sendClientHello() {}
    }, {
        key: "handleServerAuth",
        value: function handleServerAuth(msg, nonce) {
            this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
            this.validateRepeatedCookie(this.server, msg.your_cookie);
            if (this.serverPublicKey != null) {
                try {
                    this.validateSignedKeys(msg.signed_keys, nonce, this.serverPublicKey);
                } catch (e) {
                    if (e.name === 'ValidationError') {
                        throw new ProtocolError("Verification of signed_keys failed: " + e.message);
                    }
                    throw e;
                }
            } else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
                console.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
            }
            this.responders = new Map();
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = msg.responders[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var id = _step2.value;

                    if (!isResponderId(id)) {
                        throw new ProtocolError("Responder id " + id + " must be in the range 0x02-0xff");
                    }
                    this.processNewResponder(id);
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            console.debug(this.logTag, this.responders.size, 'responders connected');
            this.server.handshakeState = 'done';
        }
    }, {
        key: "initPeerHandshake",
        value: function initPeerHandshake() {}
    }, {
        key: "handleNewResponder",
        value: function handleNewResponder(msg) {
            if (!isResponderId(msg.id)) {
                throw new ProtocolError("Responder id " + msg.id + " must be in the range 0x02-0xff");
            }
            this.processNewResponder(msg.id);
        }
    }, {
        key: "handleToken",
        value: function handleToken(msg, responder) {
            responder.permanentKey = new Uint8Array(msg.key);
            responder.handshakeState = 'token-received';
        }
    }, {
        key: "handleKey",
        value: function handleKey(msg, responder) {
            responder.sessionKey = new Uint8Array(msg.key);
            responder.handshakeState = 'key-received';
        }
    }, {
        key: "sendKey",
        value: function sendKey(responder) {
            var message = {
                type: 'key',
                key: responder.keyStore.publicKeyBytes.buffer
            };
            var packet = this.buildPacket(message, responder);
            console.debug(this.logTag, 'Sending key');
            this.ws.send(packet);
            responder.handshakeState = 'key-sent';
        }
    }, {
        key: "sendAuth",
        value: function sendAuth(responder, nonce) {
            if (nonce.cookie.equals(responder.cookiePair.ours)) {
                throw new ProtocolError('Their cookie and our cookie are the same.');
            }
            var taskData = {};
            taskData[this.task.getName()] = this.task.getData();
            var message = {
                type: 'auth',
                your_cookie: nonce.cookie.asArrayBuffer(),
                task: this.task.getName(),
                data: taskData
            };
            var packet = this.buildPacket(message, responder);
            console.debug(this.logTag, 'Sending auth');
            this.ws.send(packet);
            responder.handshakeState = 'auth-sent';
        }
    }, {
        key: "handleAuth",
        value: function handleAuth(msg, responder, nonce) {
            this.validateRepeatedCookie(responder, msg.your_cookie);
            try {
                InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
            } catch (e) {
                if (e.name === 'ValidationError') {
                    throw new ProtocolError("Peer sent invalid task info: " + e.message);
                }
                throw e;
            }
            var task = InitiatorSignaling.chooseCommonTask(this.tasks, msg.tasks);
            if (task === null) {
                throw new SignalingError(exports.CloseCode.NoSharedTask, "No shared task could be found");
            } else {
                console.log(this.logTag, "Task", task.getName(), "has been selected");
            }
            this.initTask(task, msg.data[task.getName()]);
            console.debug(this.logTag, 'Responder', responder.hexId, 'authenticated');
            responder.cookiePair.theirs = nonce.cookie;
            responder.handshakeState = 'auth-received';
        }
    }, {
        key: "_handleSendError",
        value: function _handleSendError(receiver) {
            if (!isResponderId(receiver)) {
                throw new ProtocolError("Outgoing c2c messages must have been sent to a responder");
            }
            var notify = false;
            if (this.responder === null) {
                var responder = this.responders.get(receiver);
                if (responder === null || responder === undefined) {
                    console.warn(this.logTag, "Got send-error message for unknown responder", receiver);
                } else {
                    notify = true;
                    this.responders.delete(receiver);
                }
            } else {
                if (this.responder.id === receiver) {
                    notify = true;
                    this.resetConnection(exports.CloseCode.ProtocolError);
                } else {
                    console.warn(this.logTag, "Got send-error message for unknown responder", receiver);
                }
            }
            if (notify === true) {
                this.client.emit({ type: "signaling-connection-lost", data: receiver });
            }
        }
    }, {
        key: "dropResponders",
        value: function dropResponders(reason) {
            console.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.responders.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var id = _step3.value;

                    this.dropResponder(id, reason);
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }, {
        key: "dropResponder",
        value: function dropResponder(responderId, reason) {
            var message = {
                type: 'drop-responder',
                id: responderId,
                reason: reason
            };
            var packet = this.buildPacket(message, this.server);
            console.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
            this.ws.send(packet);
            this.responders.delete(responderId);
        }
    }], [{
        key: "validateTaskInfo",
        value: function validateTaskInfo(names, data) {
            if (names.length < 1) {
                throw new ValidationError("Task names must not be empty");
            }
            if (Object.keys(data).length < 1) {
                throw new ValidationError("Task data must not be empty");
            }
            if (names.length != Object.keys(data).length) {
                throw new ValidationError("Task data must contain an entry for every task");
            }
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = names[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var task = _step4.value;

                    if (!data.hasOwnProperty(task)) {
                        throw new ValidationError("Task data must contain an entry for every task");
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4.return) {
                        _iterator4.return();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }
        }
    }, {
        key: "chooseCommonTask",
        value: function chooseCommonTask(ourTasks, theirTasks) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
                for (var _iterator5 = ourTasks[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                    var task = _step5.value;

                    if (theirTasks.indexOf(task.getName()) !== -1) {
                        return task;
                    }
                }
            } catch (err) {
                _didIteratorError5 = true;
                _iteratorError5 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion5 && _iterator5.return) {
                        _iterator5.return();
                    }
                } finally {
                    if (_didIteratorError5) {
                        throw _iteratorError5;
                    }
                }
            }

            return null;
        }
    }]);
    return InitiatorSignaling;
}(Signaling);

var ResponderSignaling = function (_Signaling) {
    inherits(ResponderSignaling, _Signaling);

    function ResponderSignaling(client, host, port, serverKey, tasks, pingInterval, permanentKey, initiatorPubKey, authToken) {
        classCallCheck(this, ResponderSignaling);

        var _this = possibleConstructorReturn(this, (ResponderSignaling.__proto__ || Object.getPrototypeOf(ResponderSignaling)).call(this, client, host, port, serverKey, tasks, pingInterval, permanentKey, authToken === undefined ? initiatorPubKey : undefined));

        _this.logTag = 'Responder:';
        _this.initiator = null;
        _this.role = 'responder';
        _this.initiator = new Initiator(initiatorPubKey);
        if (authToken !== undefined) {
            _this.authToken = authToken;
        } else {
            _this.initiator.handshakeState = 'token-sent';
        }
        return _this;
    }

    createClass(ResponderSignaling, [{
        key: "getWebsocketPath",
        value: function getWebsocketPath() {
            return u8aToHex(this.initiator.permanentKey);
        }
    }, {
        key: "encryptHandshakeDataForPeer",
        value: function encryptHandshakeDataForPeer(receiver, messageType, payload, nonceBytes) {
            if (isResponderId(receiver)) {
                throw new ProtocolError('Responder may not encrypt messages for other responders: ' + receiver);
            } else if (receiver !== Signaling.SALTYRTC_ADDR_INITIATOR) {
                throw new ProtocolError('Bad receiver byte: ' + receiver);
            }
            switch (messageType) {
                case 'token':
                    return this.authToken.encrypt(payload, nonceBytes);
                case 'key':
                    return this.permanentKey.encrypt(payload, nonceBytes, this.initiator.permanentKey);
                default:
                    var peerSessionKey = this.getPeerSessionKey();
                    if (peerSessionKey === null) {
                        throw new ProtocolError('Trying to encrypt for peer using session key, but session key is null');
                    }
                    return this.sessionKey.encrypt(payload, nonceBytes, peerSessionKey);
            }
        }
    }, {
        key: "getPeer",
        value: function getPeer() {
            if (this.initiator !== null) {
                return this.initiator;
            }
            return null;
        }
    }, {
        key: "getPeerSessionKey",
        value: function getPeerSessionKey() {
            if (this.initiator !== null) {
                return this.initiator.sessionKey;
            }
            return null;
        }
    }, {
        key: "getPeerPermanentKey",
        value: function getPeerPermanentKey() {
            if (this.initiator !== null) {
                return this.initiator.permanentKey;
            }
            return null;
        }
    }, {
        key: "getPeerWithId",
        value: function getPeerWithId(id) {
            if (id === Signaling.SALTYRTC_ADDR_SERVER) {
                return this.server;
            } else if (id === Signaling.SALTYRTC_ADDR_INITIATOR) {
                return this.initiator;
            } else {
                throw new ProtocolError("Invalid peer id: " + id);
            }
        }
    }, {
        key: "handlePeerHandshakeSignalingError",
        value: function handlePeerHandshakeSignalingError(e, source) {
            this.resetConnection(e.closeCode);
        }
    }, {
        key: "onPeerHandshakeMessage",
        value: function onPeerHandshakeMessage(box, nonce) {
            if (nonce.destination != this.address) {
                throw new ProtocolError('Message destination does not match our address');
            }
            var payload = void 0;
            if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
                payload = decryptKeystore(box, this.permanentKey, this.server.sessionKey, 'server');
                var msg = this.decodeMessage(payload, 'server');
                switch (msg.type) {
                    case 'new-initiator':
                        console.debug(this.logTag, 'Received new-initiator');
                        this.handleNewInitiator(msg);
                        break;
                    case 'send-error':
                        console.debug(this.logTag, 'Received send-error');
                        this.handleSendError(msg);
                        break;
                    default:
                        throw new ProtocolError('Received unexpected server message: ' + msg.type);
                }
            } else if (nonce.source === Signaling.SALTYRTC_ADDR_INITIATOR) {
                payload = this.decryptInitiatorMessage(box);
                var _msg = void 0;
                switch (this.initiator.handshakeState) {
                    case 'new':
                        throw new ProtocolError('Unexpected peer handshake message');
                    case 'key-sent':
                        _msg = this.decodeMessage(payload, 'key', true);
                        console.debug(this.logTag, 'Received key');
                        this.handleKey(_msg);
                        this.sendAuth(nonce);
                        break;
                    case 'auth-sent':
                        _msg = this.decodeMessage(payload, 'auth', true);
                        console.debug(this.logTag, 'Received auth');
                        this.handleAuth(_msg, nonce);
                        this.setState('task');
                        console.info(this.logTag, 'Peer handshake done');
                        break;
                    default:
                        throw new SignalingError(exports.CloseCode.InternalError, 'Unknown initiator handshake state');
                }
            } else {
                throw new SignalingError(exports.CloseCode.InternalError, 'Message source is neither the server nor the initiator');
            }
        }
    }, {
        key: "decryptInitiatorMessage",
        value: function decryptInitiatorMessage(box) {
            switch (this.initiator.handshakeState) {
                case 'new':
                case 'token-sent':
                case 'key-received':
                    throw new ProtocolError('Received message in ' + this.initiator.handshakeState + ' state.');
                case 'key-sent':
                    return decryptKeystore(box, this.permanentKey, this.initiator.permanentKey, 'key');
                case 'auth-sent':
                case 'auth-received':
                    return decryptKeystore(box, this.sessionKey, this.initiator.sessionKey, 'initiator session');
                default:
                    throw new ProtocolError('Invalid handshake state: ' + this.initiator.handshakeState);
            }
        }
    }, {
        key: "sendClientHello",
        value: function sendClientHello() {
            var message = {
                type: 'client-hello',
                key: this.permanentKey.publicKeyBytes.buffer
            };
            var packet = this.buildPacket(message, this.server, false);
            console.debug(this.logTag, 'Sending client-hello');
            this.ws.send(packet);
            this.server.handshakeState = 'hello-sent';
        }
    }, {
        key: "handleServerAuth",
        value: function handleServerAuth(msg, nonce) {
            if (nonce.destination > 0xff || nonce.destination < 0x02) {
                console.error(this.logTag, 'Invalid nonce destination:', nonce.destination);
                throw 'bad-nonce-destination';
            }
            this.address = nonce.destination;
            console.debug(this.logTag, 'Server assigned address', byteToHex(this.address));
            this.logTag = 'Responder[' + byteToHex(this.address) + ']:';
            this.validateRepeatedCookie(this.server, msg.your_cookie);
            if (this.serverPublicKey != null) {
                try {
                    this.validateSignedKeys(msg.signed_keys, nonce, this.serverPublicKey);
                } catch (e) {
                    if (e.name === 'ValidationError') {
                        throw new ProtocolError("Verification of signed_keys failed: " + e.message);
                    }
                    throw e;
                }
            } else if (msg.signed_keys !== null && msg.signed_keys !== undefined) {
                console.warn(this.logTag, "Server sent signed keys, but we're not verifying them.");
            }
            this.initiator.connected = msg.initiator_connected;
            console.debug(this.logTag, 'Initiator', this.initiator.connected ? '' : 'not', 'connected');
            this.server.handshakeState = 'done';
        }
    }, {
        key: "handleNewInitiator",
        value: function handleNewInitiator(msg) {
            this.initiator = new Initiator(this.initiator.permanentKey);
            this.initiator.connected = true;
            this.initPeerHandshake();
        }
    }, {
        key: "initPeerHandshake",
        value: function initPeerHandshake() {
            if (this.initiator.connected) {
                if (this.peerTrustedKey === null) {
                    this.sendToken();
                }
                this.sendKey();
            }
        }
    }, {
        key: "sendToken",
        value: function sendToken() {
            var message = {
                type: 'token',
                key: this.permanentKey.publicKeyBytes.buffer
            };
            var packet = this.buildPacket(message, this.initiator);
            console.debug(this.logTag, 'Sending token');
            this.ws.send(packet);
            this.initiator.handshakeState = 'token-sent';
        }
    }, {
        key: "sendKey",
        value: function sendKey() {
            this.sessionKey = new KeyStore();
            var replyMessage = {
                type: 'key',
                key: this.sessionKey.publicKeyBytes.buffer
            };
            var packet = this.buildPacket(replyMessage, this.initiator);
            console.debug(this.logTag, 'Sending key');
            this.ws.send(packet);
            this.initiator.handshakeState = 'key-sent';
        }
    }, {
        key: "handleKey",
        value: function handleKey(msg) {
            this.initiator.sessionKey = new Uint8Array(msg.key);
            this.initiator.handshakeState = 'key-received';
        }
    }, {
        key: "sendAuth",
        value: function sendAuth(nonce) {
            if (nonce.cookie.equals(this.initiator.cookiePair.ours)) {
                throw new ProtocolError('Their cookie and our cookie are the same.');
            }
            var taskData = {};
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.tasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var task = _step.value;

                    taskData[task.getName()] = task.getData();
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            var taskNames = this.tasks.map(function (task) {
                return task.getName();
            });
            var message = {
                type: 'auth',
                your_cookie: nonce.cookie.asArrayBuffer(),
                tasks: taskNames,
                data: taskData
            };
            var packet = this.buildPacket(message, this.initiator);
            console.debug(this.logTag, 'Sending auth');
            this.ws.send(packet);
            this.initiator.handshakeState = 'auth-sent';
        }
    }, {
        key: "handleAuth",
        value: function handleAuth(msg, nonce) {
            this.validateRepeatedCookie(this.initiator, msg.your_cookie);
            try {
                ResponderSignaling.validateTaskInfo(msg.task, msg.data);
            } catch (e) {
                if (e.name === 'ValidationError') {
                    throw new ProtocolError("Peer sent invalid task info: " + e.message);
                }
                throw e;
            }
            var selectedTask = null;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.tasks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var task = _step2.value;

                    if (task.getName() === msg.task) {
                        selectedTask = task;
                        console.info(this.logTag, "Task", msg.task, "has been selected");
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            if (selectedTask === null) {
                throw new SignalingError(exports.CloseCode.ProtocolError, "Initiator selected unknown task");
            } else {
                this.initTask(selectedTask, msg.data[selectedTask.getName()]);
            }
            console.debug(this.logTag, 'Initiator authenticated');
            this.initiator.cookiePair.theirs = nonce.cookie;
            this.initiator.handshakeState = 'auth-received';
        }
    }, {
        key: "_handleSendError",
        value: function _handleSendError(receiver) {
            if (receiver != Signaling.SALTYRTC_ADDR_INITIATOR) {
                throw new ProtocolError("Outgoing c2c messages must have been sent to the initiator");
            }
            this.client.emit({ type: "signaling-connection-lost", data: receiver });
            this.resetConnection(exports.CloseCode.ProtocolError);
        }
    }], [{
        key: "validateTaskInfo",
        value: function validateTaskInfo(name, data) {
            if (name.length == 0) {
                throw new ValidationError("Task name must not be empty");
            }
            if (Object.keys(data).length < 1) {
                throw new ValidationError("Task data must not be empty");
            }
            if (Object.keys(data).length > 1) {
                throw new ValidationError("Task data must contain exactly 1 key");
            }
            if (!data.hasOwnProperty(name)) {
                throw new ValidationError("Task data must contain an entry for the chosen task");
            }
        }
    }]);
    return ResponderSignaling;
}(Signaling);

var EventRegistry = function () {
    function EventRegistry() {
        classCallCheck(this, EventRegistry);

        this.map = new Map();
    }

    createClass(EventRegistry, [{
        key: 'register',
        value: function register(eventType, handler) {
            if (typeof eventType === 'string') {
                this.set(eventType, handler);
            } else {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = eventType[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var et = _step.value;

                        this.set(et, handler);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }
    }, {
        key: 'unregister',
        value: function unregister(eventType, handler) {
            if (typeof eventType === 'string') {
                if (!this.map.has(eventType)) {
                    return;
                }
                if (typeof handler === 'undefined') {
                    this.map.delete(eventType);
                } else {
                    var list = this.map.get(eventType);
                    var index = list.indexOf(handler);
                    if (index !== -1) {
                        list.splice(index, 1);
                    }
                }
            } else {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = eventType[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var et = _step2.value;

                        this.unregister(et, handler);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        }
    }, {
        key: 'set',
        value: function set(key, value) {
            if (this.map.has(key)) {
                var list = this.map.get(key);
                if (list.indexOf(value) === -1) {
                    list.push(value);
                }
            } else {
                this.map.set(key, [value]);
            }
        }
    }, {
        key: 'get',
        value: function get(eventType) {
            var handlers = [];
            if (typeof eventType === 'string') {
                if (this.map.has(eventType)) {
                    handlers.push.apply(handlers, this.map.get(eventType));
                }
            } else {
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = eventType[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var et = _step3.value;
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = this.get(et)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var handler = _step4.value;

                                if (handlers.indexOf(handler) === -1) {
                                    handlers.push(handler);
                                }
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                    _iterator4.return();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }
            }
            return handlers;
        }
    }]);
    return EventRegistry;
}();

var SaltyRTCBuilder = function () {
    function SaltyRTCBuilder() {
        classCallCheck(this, SaltyRTCBuilder);

        this.hasConnectionInfo = false;
        this.hasKeyStore = false;
        this.hasInitiatorInfo = false;
        this.hasTrustedPeerKey = false;
        this.hasTasks = false;
        this.serverInfoFactory = null;
        this.pingInterval = 0;
    }

    createClass(SaltyRTCBuilder, [{
        key: "validateHost",
        value: function validateHost(host) {
            if (host.endsWith('/')) {
                throw new Error('SaltyRTC host may not end with a slash');
            }
            if (host.indexOf('//') !== -1) {
                throw new Error('SaltyRTC host should not contain protocol');
            }
        }
    }, {
        key: "requireKeyStore",
        value: function requireKeyStore() {
            if (!this.hasKeyStore) {
                throw new Error("Keys not set yet. Please call .withKeyStore method first.");
            }
        }
    }, {
        key: "requireConnectionInfo",
        value: function requireConnectionInfo() {
            if (!this.hasConnectionInfo) {
                throw new Error("Connection info not set yet. Please call .connectTo method first.");
            }
        }
    }, {
        key: "requireTasks",
        value: function requireTasks() {
            if (!this.hasTasks) {
                throw new Error("Tasks not set yet. Please call .usingTasks method first.");
            }
        }
    }, {
        key: "requireInitiatorInfo",
        value: function requireInitiatorInfo() {
            if (!this.hasInitiatorInfo) {
                throw new Error("Initiator info not set yet. Please call .initiatorInfo method first.");
            }
        }
    }, {
        key: "connectTo",
        value: function connectTo(host) {
            var port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8765;

            this.validateHost(host);
            this.host = host;
            this.port = port;
            this.hasConnectionInfo = true;
            return this;
        }
    }, {
        key: "connectWith",
        value: function connectWith(serverInfoFactory) {
            this.serverInfoFactory = serverInfoFactory;
            this.hasConnectionInfo = true;
            return this;
        }
    }, {
        key: "withKeyStore",
        value: function withKeyStore(keyStore) {
            this.keyStore = keyStore;
            this.hasKeyStore = true;
            return this;
        }
    }, {
        key: "withTrustedPeerKey",
        value: function withTrustedPeerKey(peerTrustedKey) {
            this.peerTrustedKey = validateKey(peerTrustedKey, "Peer key");
            this.hasTrustedPeerKey = true;
            return this;
        }
    }, {
        key: "usingTasks",
        value: function usingTasks(tasks) {
            if (tasks.length < 1) {
                throw new Error("You must specify at least 1 task");
            }
            this.tasks = tasks;
            this.hasTasks = true;
            return this;
        }
    }, {
        key: "withPingInterval",
        value: function withPingInterval(interval) {
            if (interval < 0) {
                throw new Error("Ping interval may not be negative");
            }
            this.pingInterval = interval;
            return this;
        }
    }, {
        key: "withServerKey",
        value: function withServerKey(serverKey) {
            this.serverPublicKey = validateKey(serverKey, "Server public key");
            return this;
        }
    }, {
        key: "initiatorInfo",
        value: function initiatorInfo(initiatorPublicKey, authToken) {
            this.initiatorPublicKey = validateKey(initiatorPublicKey, "Initiator public key");
            this.authToken = validateKey(authToken, "Auth token");
            this.hasInitiatorInfo = true;
            return this;
        }
    }, {
        key: "processServerInfo",
        value: function processServerInfo(factory, publicKey) {
            var publicKeyHex = u8aToHex(publicKey);
            var data = factory(publicKeyHex);
            this.host = data.host;
            this.port = data.port;
        }
    }, {
        key: "asInitiator",
        value: function asInitiator() {
            this.requireConnectionInfo();
            this.requireKeyStore();
            this.requireTasks();
            if (this.hasInitiatorInfo) {
                throw new Error('Cannot initialize as initiator if .initiatorInfo(...) has been used');
            }
            if (this.serverInfoFactory !== null) {
                this.processServerInfo(this.serverInfoFactory, this.keyStore.publicKeyBytes);
            }
            if (this.hasTrustedPeerKey) {
                return new SaltyRTC(this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.peerTrustedKey).asInitiator();
            } else {
                return new SaltyRTC(this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval).asInitiator();
            }
        }
    }, {
        key: "asResponder",
        value: function asResponder() {
            this.requireConnectionInfo();
            this.requireKeyStore();
            this.requireTasks();
            if (this.hasTrustedPeerKey) {
                if (this.serverInfoFactory !== null) {
                    this.processServerInfo(this.serverInfoFactory, this.peerTrustedKey);
                }
                return new SaltyRTC(this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.peerTrustedKey).asResponder();
            } else {
                this.requireInitiatorInfo();
                if (this.serverInfoFactory !== null) {
                    this.processServerInfo(this.serverInfoFactory, this.initiatorPublicKey);
                }
                return new SaltyRTC(this.keyStore, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval).asResponder(this.initiatorPublicKey, this.authToken);
            }
        }
    }]);
    return SaltyRTCBuilder;
}();

var SaltyRTC = function () {
    function SaltyRTC(permanentKey, host, port, serverKey, tasks, pingInterval, peerTrustedKey) {
        classCallCheck(this, SaltyRTC);

        this.peerTrustedKey = null;
        this._signaling = null;
        if (permanentKey === undefined) {
            throw new Error('SaltyRTC must be initialized with a permanent key');
        }
        if (host === undefined) {
            throw new Error('SaltyRTC must be initialized with a target host');
        }
        if (tasks === undefined || tasks.length == 0) {
            throw new Error('SaltyRTC must be initialized with at least 1 task');
        }
        this.host = host;
        this.port = port;
        this.permanentKey = permanentKey;
        this.tasks = tasks;
        this.pingInterval = pingInterval;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
        if (serverKey !== undefined) {
            this.serverPublicKey = serverKey;
        }
        this.eventRegistry = new EventRegistry();
    }

    createClass(SaltyRTC, [{
        key: "asInitiator",
        value: function asInitiator() {
            if (this.peerTrustedKey !== null) {
                this._signaling = new InitiatorSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, this.peerTrustedKey);
            } else {
                this._signaling = new InitiatorSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey);
            }
            return this;
        }
    }, {
        key: "asResponder",
        value: function asResponder(initiatorPubKey, authToken) {
            if (this.peerTrustedKey !== null) {
                this._signaling = new ResponderSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, this.peerTrustedKey);
            } else {
                var token = new AuthToken(authToken);
                this._signaling = new ResponderSignaling(this, this.host, this.port, this.serverPublicKey, this.tasks, this.pingInterval, this.permanentKey, initiatorPubKey, token);
            }
            return this;
        }
    }, {
        key: "getTask",
        value: function getTask() {
            return this.signaling.task;
        }
    }, {
        key: "connect",
        value: function connect() {
            this.signaling.connect();
        }
    }, {
        key: "disconnect",
        value: function disconnect() {
            this.signaling.disconnect();
        }
    }, {
        key: "on",
        value: function on(event, handler) {
            this.eventRegistry.register(event, handler);
        }
    }, {
        key: "once",
        value: function once(event, handler) {
            var _this = this;

            var onceHandler = function onceHandler(ev) {
                try {
                    handler(ev);
                } catch (e) {
                    _this.off(ev.type, onceHandler);
                    throw e;
                }
                _this.off(ev.type, onceHandler);
            };
            this.eventRegistry.register(event, onceHandler);
        }
    }, {
        key: "off",
        value: function off(event, handler) {
            this.eventRegistry.unregister(event, handler);
        }
    }, {
        key: "emit",
        value: function emit(event) {
            console.debug('SaltyRTC: New event:', event.type);
            var handlers = this.eventRegistry.get(event.type);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = handlers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var handler = _step.value;

                    try {
                        this.callHandler(handler, event);
                    } catch (e) {
                        console.error('SaltyRTC: Unhandled exception in', event.type, 'handler:', e);
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }
    }, {
        key: "sendApplicationMessage",
        value: function sendApplicationMessage(data) {
            this.signaling.sendApplication({
                type: 'application',
                data: data
            });
        }
    }, {
        key: "callHandler",
        value: function callHandler(handler, event) {
            var response = handler(event);
            if (response === false) {
                this.eventRegistry.unregister(event.type, handler);
            }
        }
    }, {
        key: "signaling",
        get: function get() {
            if (this._signaling === null) {
                throw Error('SaltyRTC instance not initialized. Use .asInitiator() or .asResponder().');
            }
            return this._signaling;
        }
    }, {
        key: "state",
        get: function get() {
            return this.signaling.getState();
        }
    }, {
        key: "keyStore",
        get: function get() {
            return this.permanentKey;
        }
    }, {
        key: "permanentKeyBytes",
        get: function get() {
            return this.signaling.permanentKeyBytes;
        }
    }, {
        key: "permanentKeyHex",
        get: function get() {
            return u8aToHex(this.signaling.permanentKeyBytes);
        }
    }, {
        key: "authTokenBytes",
        get: function get() {
            return this.signaling.authTokenBytes;
        }
    }, {
        key: "authTokenHex",
        get: function get() {
            return u8aToHex(this.signaling.authTokenBytes);
        }
    }, {
        key: "peerPermanentKeyBytes",
        get: function get() {
            return this.signaling.peerPermanentKeyBytes;
        }
    }, {
        key: "peerPermanentKeyHex",
        get: function get() {
            return u8aToHex(this.signaling.peerPermanentKeyBytes);
        }
    }]);
    return SaltyRTC;
}();

exports.SaltyRTCBuilder = SaltyRTCBuilder;
exports.KeyStore = KeyStore;
exports.Box = Box;
exports.Cookie = Cookie;
exports.CookiePair = CookiePair;
exports.CombinedSequence = CombinedSequence;
exports.CombinedSequencePair = CombinedSequencePair;
exports.EventRegistry = EventRegistry;
exports.explainCloseCode = explainCloseCode;
exports.SignalingError = SignalingError;
exports.ConnectionError = ConnectionError;

}((this.saltyrtcClient = this.saltyrtcClient || {}),msgpack));
