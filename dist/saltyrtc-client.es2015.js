/**
 * saltyrtc-client-js v0.1.7
 * SaltyRTC JavaScript implementation
 * https://github.com/saltyrtc/saltyrtc-client-js
 *
 * Copyright (C) 2016 Threema GmbH
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

!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var r;r="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,r.msgpack=t();}}(function(){return function t(r,e,n){function i(f,u){if(!e[f]){if(!r[f]){var a="function"==typeof require&&require;if(!u&&a)return a(f,!0);if(o)return o(f,!0);var s=new Error("Cannot find module '"+f+"'");throw s.code="MODULE_NOT_FOUND",s}var c=e[f]={exports:{}};r[f][0].call(c.exports,function(t){var e=r[f][1][t];return i(e?e:t)},c,c.exports,t,r,e,n);}return e[f].exports}for(var o="function"==typeof require&&require,f=0;f<n.length;f++)i(n[f]);return i}({1:[function(t,r,e){e.encode=t("./encode").encode,e.decode=t("./decode").decode,e.Encoder=t("./encoder").Encoder,e.Decoder=t("./decoder").Decoder,e.createCodec=t("./ext").createCodec,e.codec=t("./codec").codec;},{"./codec":4,"./decode":6,"./decoder":7,"./encode":9,"./encoder":10,"./ext":14}],2:[function(t,r,e){(function(Buffer){function r(t,r){for(var e=this,n=r||0,i=t.length,o=0;i>o;o++){var f=t.charCodeAt(o);128>f?e[n++]=f:2048>f?(e[n++]=192|f>>6,e[n++]=128|63&f):(e[n++]=224|f>>12,e[n++]=128|f>>6&63,e[n++]=128|63&f);}return n-r}function n(t,r){var e=this,n=t-0||0;r||(r=e.length);var i=r-t;i>h&&(i=h);for(var o=[];r>n;){for(var f=new Array(i),u=0;i>u&&r>n;){var a=e[n++];a=128>a?a:224>a?(63&a)<<6|63&e[n++]:(63&a)<<12|(63&e[n++])<<6|63&e[n++],f[u++]=a;}i>u&&(f=f.slice(0,u)),o.push(String.fromCharCode.apply("",f));}return o.length>1?o.join(""):o.length?o.shift():""}function i(t,r,e,n){var i;e||(e=0),n||0===n||(n=this.length),r||(r=0);var o=n-e;if(t===this&&r>e&&n>r)for(i=o-1;i>=0;i--)t[i+r]=this[i+e];else for(i=0;o>i;i++)t[i+r]=this[i+e];return o}function o(t,r){function e(t){r+=t.length;}function n(t){Buffer.isBuffer(t)?t.copy(o,f):i.call(t,o,f),f+=t.length;}r||(r=0,Array.prototype.forEach.call(t,e));var o=new Buffer(r),f=0;return Array.prototype.forEach.call(t,n),o}function f(t,r){new s(this,r,t);}function u(t,r){new c(this,r,t);}var a=t("int64-buffer"),s=a.Uint64BE,c=a.Int64BE,h=8192;e.writeString=r,e.readString=n,e.copy=i,e.concat=o,e.writeUint64BE=f,e.writeInt64BE=u;}).call(this,t("buffer").Buffer);},{buffer:23,"int64-buffer":27}],3:[function(t,r,e){function n(t){return this instanceof n?(this.options=t,void this.init()):new n(t)}function i(t){for(var r in t)n.prototype[r]=o(n.prototype[r],t[r]);}function o(t,r){function e(){return t.apply(this,arguments),r.apply(this,arguments)}return t&&r?e:t||r}function f(t){function r(t,r){return r(t)}return t=t.slice(),function(e){return t.reduce(r,e)}}function u(t){return s(t)?f(t):t}function a(t){return new n(t)}var s=t("isarray");e.createCodec=a,e.install=i,e.filter=u,n.prototype.init=function(){return this},e.preset=a({preset:!0});},{isarray:28}],4:[function(t,r,e){t("./read-core"),t("./write-core"),e.codec={preset:t("./codec-base").preset};},{"./codec-base":3,"./read-core":16,"./write-core":19}],5:[function(t,r,e){function n(t){return this instanceof n?void(t&&(this.options=t,t.codec&&(this.codec=t.codec))):new n(t)}e.DecodeBuffer=n;var i=t("./read-core").preset,o=t("./flex-buffer").FlexDecoder;o.mixin(n.prototype),n.prototype.codec=i,n.prototype.fetch=function(){return this.codec.decode(this)};},{"./flex-buffer":15,"./read-core":16}],6:[function(t,r,e){function n(t,r){var e=new i(r);return e.write(t),e.read()}e.decode=n;var i=t("./decode-buffer").DecodeBuffer;},{"./decode-buffer":5}],7:[function(t,r,e){function n(t){return this instanceof n?void o.call(this,t):new n(t)}e.Decoder=n;var i=t("event-lite"),o=t("./decode-buffer").DecodeBuffer;n.prototype=new o,i.mixin(n.prototype),n.prototype.decode=function(t){arguments.length&&this.write(t),this.flush();},n.prototype.push=function(t){this.emit("data",t);},n.prototype.end=function(t){this.decode(t),this.emit("end");};},{"./decode-buffer":5,"event-lite":25}],8:[function(t,r,e){function n(t){return this instanceof n?void(t&&(this.options=t,t.codec&&(this.codec=t.codec))):new n(t)}e.EncodeBuffer=n;var i=t("./write-core").preset,o=t("./flex-buffer").FlexEncoder;o.mixin(n.prototype),n.prototype.codec=i,n.prototype.write=function(t){this.codec.encode(this,t);};},{"./flex-buffer":15,"./write-core":19}],9:[function(t,r,e){function n(t,r){var e=new i(r);return e.write(t),e.read()}e.encode=n;var i=t("./encode-buffer").EncodeBuffer;},{"./encode-buffer":8}],10:[function(t,r,e){function n(t){return this instanceof n?void o.call(this,t):new n(t)}e.Encoder=n;var i=t("event-lite"),o=t("./encode-buffer").EncodeBuffer;n.prototype=new o,i.mixin(n.prototype),n.prototype.encode=function(t){this.write(t),this.emit("data",this.read());},n.prototype.end=function(t){arguments.length&&this.encode(t),this.flush(),this.emit("end");};},{"./encode-buffer":8,"event-lite":25}],11:[function(t,r,e){function n(t,r){return this instanceof n?(this.buffer=t,void(this.type=r)):new n(t,r)}e.ExtBuffer=n;},{}],12:[function(t,r,e){(function(Buffer){function r(t){t.addExtPacker(14,Error,[u,n]),t.addExtPacker(1,EvalError,[u,n]),t.addExtPacker(2,RangeError,[u,n]),t.addExtPacker(3,ReferenceError,[u,n]),t.addExtPacker(4,SyntaxError,[u,n]),t.addExtPacker(5,TypeError,[u,n]),t.addExtPacker(6,URIError,[u,n]),t.addExtPacker(10,RegExp,[f,n]),t.addExtPacker(11,Boolean,[o,n]),t.addExtPacker(12,String,[o,n]),t.addExtPacker(13,Date,[Number,n]),t.addExtPacker(15,Number,[o,n]),"undefined"!=typeof Uint8Array&&(t.addExtPacker(17,Int8Array,i),t.addExtPacker(18,Uint8Array,i),t.addExtPacker(19,Int16Array,a),t.addExtPacker(20,Uint16Array,a),t.addExtPacker(21,Int32Array,a),t.addExtPacker(22,Uint32Array,a),t.addExtPacker(23,Float32Array,a),"undefined"!=typeof Float64Array&&t.addExtPacker(24,Float64Array,a),"undefined"!=typeof Uint8ClampedArray&&t.addExtPacker(25,Uint8ClampedArray,i),t.addExtPacker(26,ArrayBuffer,s),t.addExtPacker(29,DataView,a)),t.addExtPacker(27,Buffer,i);}function n(r){return c||(c=t("./encode").encode),c(r)}function i(t){return new Buffer(t)}function o(t){return t.valueOf()}function f(t){t=RegExp.prototype.toString.call(t).split("/"),t.shift();var r=[t.pop()];return r.unshift(t.join("/")),r}function u(t){var r={};for(var e in h)r[e]=t[e];return r}function a(t){return new Buffer(new Uint8Array(t.buffer))}function s(t){return new Buffer(new Uint8Array(t))}e.setExtPackers=r;var c,h={name:1,message:1,stack:1,columnNumber:1,fileName:1,lineNumber:1};}).call(this,t("buffer").Buffer);},{"./encode":9,buffer:23}],13:[function(t,r,e){(function(Buffer){function r(t){t.addExtUnpacker(14,[n,o(Error)]),t.addExtUnpacker(1,[n,o(EvalError)]),t.addExtUnpacker(2,[n,o(RangeError)]),t.addExtUnpacker(3,[n,o(ReferenceError)]),t.addExtUnpacker(4,[n,o(SyntaxError)]),t.addExtUnpacker(5,[n,o(TypeError)]),t.addExtUnpacker(6,[n,o(URIError)]),t.addExtUnpacker(10,[n,i]),t.addExtUnpacker(11,[n,f(Boolean)]),t.addExtUnpacker(12,[n,f(String)]),t.addExtUnpacker(13,[n,f(Date)]),t.addExtUnpacker(15,[n,f(Number)]),"undefined"!=typeof Uint8Array&&(t.addExtUnpacker(17,f(Int8Array)),t.addExtUnpacker(18,f(Uint8Array)),t.addExtUnpacker(19,[u,f(Int16Array)]),t.addExtUnpacker(20,[u,f(Uint16Array)]),t.addExtUnpacker(21,[u,f(Int32Array)]),t.addExtUnpacker(22,[u,f(Uint32Array)]),t.addExtUnpacker(23,[u,f(Float32Array)]),"undefined"!=typeof Float64Array&&t.addExtUnpacker(24,[u,f(Float64Array)]),"undefined"!=typeof Uint8ClampedArray&&t.addExtUnpacker(25,f(Uint8ClampedArray)),t.addExtUnpacker(26,u),t.addExtUnpacker(29,[u,f(DataView)])),t.addExtUnpacker(27,f(Buffer));}function n(r){return a||(a=t("./decode").decode),a(r)}function i(t){return RegExp.apply(null,t)}function o(t){return function(r){var e=new t;for(var n in s)e[n]=r[n];return e}}function f(t){return function(r){return new t(r)}}function u(t){return new Uint8Array(t).buffer}e.setExtUnpackers=r;var a,s={name:1,message:1,stack:1,columnNumber:1,fileName:1,lineNumber:1};}).call(this,t("buffer").Buffer);},{"./decode":6,buffer:23}],14:[function(t,r,e){t("./read-core"),t("./write-core"),e.createCodec=t("./codec-base").createCodec;},{"./codec-base":3,"./read-core":16,"./write-core":19}],15:[function(t,r,e){(function(Buffer){function r(){return this instanceof r?void 0:new r}function n(){return this instanceof n?void 0:new n}function i(){function t(t){var r=this.offset?this.buffer.slice(this.offset):this.buffer;this.buffer=r?t?p.concat([r,t]):r:t,this.offset=0;}function r(){for(;this.offset<this.buffer.length;){var t,r=this.offset;try{t=this.fetch();}catch(e){if(e!==y)throw e;this.offset=r;break}this.push(t);}}function e(t){var r=this.offset,e=r+t;if(e>this.buffer.length)throw y;return this.offset=e,r}return{write:t,fetch:u,flush:r,push:s,pull:c,read:a,reserve:e,offset:0}}function o(){function t(){var t=this.start;if(t<this.offset){var r=this.start=this.offset;return this.buffer.slice(t,r)}}function r(){for(;this.start<this.offset;){var t=this.fetch();t&&this.push(t);}}function e(){var t=this.buffers||(this.buffers=[]),r=t.length>1?p.concat(t):t[0];return t.length=0,r}function n(t){var r=0|t;if(this.buffer){var e=this.buffer.length,n=0|this.offset,i=n+r;if(e>i)return this.offset=i,n;this.flush(),t=Math.max(t,Math.min(2*e,this.maxBufferSize));}return t=Math.max(t,this.minBufferSize),this.buffer=new Buffer(t),this.start=0,this.offset=r,0}function i(t){var r=this.offset+t.length;r<this.buffer.length?(Buffer.isBuffer(t)&&Buffer.isBuffer(this.buffer)?t.copy(this.buffer,this.offset):p.copy.call(t,this.buffer,this.offset),this.offset=r):(this.flush(),this.push(t));}return{write:f,fetch:t,flush:r,push:s,pull:e,read:a,reserve:n,send:i,maxBufferSize:d,minBufferSize:l,offset:0,start:0}}function f(){throw new Error("method not implemented: write()")}function u(){throw new Error("method not implemented: fetch()")}function a(){var t=this.buffers&&this.buffers.length;return t?(this.flush(),this.pull()):this.fetch()}function s(t){var r=this.buffers||(this.buffers=[]);r.push(t);}function c(){var t=this.buffers||(this.buffers=[]);return t.shift()}function h(t){function r(r){for(var e in t)r[e]=t[e];return r}return r}var p=t("./buffer-lite");e.FlexDecoder=r,e.FlexEncoder=n;var l=2048,d=65536,y=new Error("BUFFER_SHORTAGE");r.mixin=h(i()),r.mixin(r.prototype),n.mixin=h(o()),n.mixin(n.prototype);}).call(this,t("buffer").Buffer);},{"./buffer-lite":2,buffer:23}],16:[function(t,r,e){function n(t){function r(t){var r=s(t),n=e[r];if(!n)throw new Error("Invalid type: "+(r?"0x"+r.toString(16):r));return n(t)}var e=c.getReadToken(t);return r}function i(){var t=this.options;return this.decode=n(t),t&&t.preset&&a.setExtUnpackers(this),this}function o(t,r){var e=this.extUnpackers||(this.extUnpackers=[]);e[t]=h.filter(r);}function f(t){function r(r){return new u(r,t)}var e=this.extUnpackers||(this.extUnpackers=[]);return e[t]||r}var u=t("./ext-buffer").ExtBuffer,a=t("./ext-unpacker"),s=t("./read-format").readUint8,c=t("./read-token"),h=t("./codec-base");h.install({addExtUnpacker:o,getExtUnpacker:f,init:i}),e.preset=i.call(h.preset);},{"./codec-base":3,"./ext-buffer":11,"./ext-unpacker":13,"./read-format":17,"./read-token":18}],17:[function(t,r,e){(function(Buffer){function r(t){var r=U&&t&&t.binarraybuffer,e={map:n,array:i,str:o,bin:r?u:f,ext:a,uint8:s,uint16:c,uint32:h(4,Buffer.prototype.readUInt32BE),uint64:h(8,p),int8:h(1,Buffer.prototype.readInt8),int16:h(2,Buffer.prototype.readInt16BE),int32:h(4,Buffer.prototype.readInt32BE),int64:h(8,l),float32:h(4,v),float64:h(8,g)};return t&&t.int64&&(e.uint64=h(8,d),e.int64=h(8,y)),e}function n(t,r){var e,n={},i=new Array(r),o=new Array(r),f=t.codec.decode;for(e=0;r>e;e++)i[e]=f(t),o[e]=f(t);for(e=0;r>e;e++)n[i[e]]=o[e];return n}function i(t,r){for(var e=new Array(r),n=t.codec.decode,i=0;r>i;i++)e[i]=n(t);return e}function o(t,r){var e=t.reserve(r),n=e+r,i=t.buffer;return B||!Buffer.isBuffer(i)?x.readString.call(i,e,n):i.toString("utf-8",e,n)}function f(t,r){var e=t.reserve(r),n=e+r;return w.call(t.buffer,e,n)}function u(t,r){var e=t.reserve(r),n=e+r,i=new Uint8Array(r);return x.copy.call(t.buffer,i,0,e,n),i.buffer}function a(t,r){var e=t.reserve(r),n=t.buffer[e++],i=e+r,o=t.codec.getExtUnpacker(n);if(!o)throw new Error("Invalid ext type: "+(n?"0x"+n.toString(16):n));var f=w.call(t.buffer,e,i);return o(f)}function s(t){var r=t.reserve(1);return t.buffer[r]}function c(t){var r=t.reserve(2),e=t.buffer;return e[r++]<<8|e[r]}function h(t,r){return function(e){var n=e.reserve(t);return r.call(e.buffer,n,P)}}function p(t){return new A(this,t).toNumber()}function l(t){return new m(this,t).toNumber()}function d(t){return new A(this,t)}function y(t){return new m(this,t)}function v(t){return this.readFloatBE?this.readFloatBE(t):E.read(this,t,!1,23,4)}function g(t){return this.readDoubleBE?this.readDoubleBE(t):E.read(this,t,!1,52,8)}function w(t,r){var e=this.slice||Array.prototype.slice,n=e.call(this,t,r);return Buffer.isBuffer(n)||(n=Buffer(n)),n}var E=t("ieee754"),b=t("int64-buffer"),A=b.Uint64BE,m=b.Int64BE;e.getReadFormat=r,e.readUint8=s;var x=t("./buffer-lite"),B="TYPED_ARRAY_SUPPORT"in Buffer,U="undefined"!=typeof Uint8Array,P=!0;}).call(this,t("buffer").Buffer);},{"./buffer-lite":2,buffer:23,ieee754:26,"int64-buffer":27}],18:[function(t,r,e){function n(t){var r=s.getReadFormat(t);return t&&t.useraw?o(r):i(r)}function i(t){var r,e=new Array(256);for(r=0;127>=r;r++)e[r]=f(r);for(r=128;143>=r;r++)e[r]=a(r-128,t.map);for(r=144;159>=r;r++)e[r]=a(r-144,t.array);for(r=160;191>=r;r++)e[r]=a(r-160,t.str);for(e[192]=f(null),e[193]=null,e[194]=f(!1),e[195]=f(!0),e[196]=u(t.uint8,t.bin),e[197]=u(t.uint16,t.bin),e[198]=u(t.uint32,t.bin),e[199]=u(t.uint8,t.ext),e[200]=u(t.uint16,t.ext),e[201]=u(t.uint32,t.ext),e[202]=t.float32,e[203]=t.float64,e[204]=t.uint8,e[205]=t.uint16,e[206]=t.uint32,e[207]=t.uint64,e[208]=t.int8,e[209]=t.int16,e[210]=t.int32,e[211]=t.int64,e[212]=a(1,t.ext),e[213]=a(2,t.ext),e[214]=a(4,t.ext),e[215]=a(8,t.ext),e[216]=a(16,t.ext),e[217]=u(t.uint8,t.str),e[218]=u(t.uint16,t.str),e[219]=u(t.uint32,t.str),e[220]=u(t.uint16,t.array),e[221]=u(t.uint32,t.array),e[222]=u(t.uint16,t.map),e[223]=u(t.uint32,t.map),r=224;255>=r;r++)e[r]=f(r-256);return e}function o(t){var r,e=n(t).slice();for(e[217]=e[196],e[218]=e[197],e[219]=e[198],r=160;191>=r;r++)e[r]=a(r-160,t.bin);return e}function f(t){return function(){return t}}function u(t,r){return function(e){var n=t(e);return r(e,n)}}function a(t,r){return function(e){return r(e,t)}}var s=t("./read-format");e.getReadToken=n;},{"./read-format":17}],19:[function(t,r,e){function n(t){function r(t,r){var n=e[typeof r];if(!n)throw new Error('Unsupported type "'+typeof r+'": '+r);n(t,r);}var e=s.getWriteType(t);return r}function i(){var t=this.options;return this.encode=n(t),t&&t.preset&&a.setExtPackers(this),this}function o(t,r,e){function n(r){var n=e(r);return new u(n,t)}e=c.filter(e);var i=r.name;if(i&&"Object"!==i){var o=this.extPackers||(this.extPackers={});o[i]=n;}else{var f=this.extEncoderList||(this.extEncoderList=[]);f.unshift([r,n]);}}function f(t){var r=this.extPackers||(this.extPackers={}),e=t.constructor,n=e&&e.name&&r[e.name];if(n)return n;for(var i=this.extEncoderList||(this.extEncoderList=[]),o=i.length,f=0;o>f;f++){var u=i[f];if(e===u[0])return u[1]}}var u=t("./ext-buffer").ExtBuffer,a=t("./ext-packer"),s=t("./write-type"),c=t("./codec-base");c.install({addExtPacker:o,getExtPacker:f,init:i}),e.preset=i.call(c.preset);},{"./codec-base":3,"./ext-buffer":11,"./ext-packer":12,"./write-type":21}],20:[function(t,r,e){(function(Buffer){function r(t){return p||t&&t.safe?i():n()}function n(){var t=c.slice();return t[196]=o(196),t[197]=f(197),t[198]=u(198),t[199]=o(199),t[200]=f(200),t[201]=u(201),t[202]=a(202,4,Buffer.prototype.writeFloatBE,!0),t[203]=a(203,8,Buffer.prototype.writeDoubleBE,!0),t[204]=o(204),t[205]=f(205),t[206]=u(206),t[207]=a(207,8,s.writeUint64BE),t[208]=o(208),t[209]=f(209),t[210]=u(210),t[211]=a(211,8,s.writeUint64BE),t[217]=o(217),t[218]=f(218),t[219]=u(219),t[220]=f(220),t[221]=u(221),t[222]=f(222),t[223]=u(223),t}function i(){var t=c.slice();return t[196]=a(196,1,Buffer.prototype.writeUInt8),t[197]=a(197,2,Buffer.prototype.writeUInt16BE),t[198]=a(198,4,Buffer.prototype.writeUInt32BE),t[199]=a(199,1,Buffer.prototype.writeUInt8),t[200]=a(200,2,Buffer.prototype.writeUInt16BE),t[201]=a(201,4,Buffer.prototype.writeUInt32BE),t[202]=a(202,4,Buffer.prototype.writeFloatBE),t[203]=a(203,8,Buffer.prototype.writeDoubleBE),t[204]=a(204,1,Buffer.prototype.writeUInt8),t[205]=a(205,2,Buffer.prototype.writeUInt16BE),t[206]=a(206,4,Buffer.prototype.writeUInt32BE),t[207]=a(207,8,s.writeUint64BE),t[208]=a(208,1,Buffer.prototype.writeInt8),t[209]=a(209,2,Buffer.prototype.writeInt16BE),t[210]=a(210,4,Buffer.prototype.writeInt32BE),t[211]=a(211,8,s.writeUint64BE),t[217]=a(217,1,Buffer.prototype.writeUInt8),t[218]=a(218,2,Buffer.prototype.writeUInt16BE),t[219]=a(219,4,Buffer.prototype.writeUInt32BE),t[220]=a(220,2,Buffer.prototype.writeUInt16BE),t[221]=a(221,4,Buffer.prototype.writeUInt32BE),t[222]=a(222,2,Buffer.prototype.writeUInt16BE),t[223]=a(223,4,Buffer.prototype.writeUInt32BE),t}function o(t){return function(r,e){var n=r.reserve(2),i=r.buffer;i[n++]=t,i[n]=e;}}function f(t){return function(r,e){var n=r.reserve(3),i=r.buffer;i[n++]=t,i[n++]=e>>>8,i[n]=e;}}function u(t){return function(r,e){var n=r.reserve(5),i=r.buffer;i[n++]=t,i[n++]=e>>>24,i[n++]=e>>>16,i[n++]=e>>>8,i[n]=e;}}function a(t,r,e,n){return function(i,o){var f=i.reserve(r+1);i.buffer[f++]=t,e.call(i.buffer,o,f,n);}}var s=t("./buffer-lite"),c=t("./write-uint8").uint8,h="TYPED_ARRAY_SUPPORT"in Buffer,p=h&&!Buffer.TYPED_ARRAY_SUPPORT;e.getWriteToken=r;}).call(this,t("buffer").Buffer);},{"./buffer-lite":2,"./write-uint8":22,buffer:23}],21:[function(t,r,e){(function(Buffer){function r(t){function r(t){return t instanceof ArrayBuffer}function e(t,r){var e=r?195:194;k[e](t,r);}function i(t,r){var e,n=0|r;return r!==n?(e=203,void k[e](t,r)):(e=n>=-32&&127>=n?255&n:n>=0?255>=n?204:65535>=n?205:206:n>=-128?208:n>=-32768?209:210,void k[e](t,n))}function d(t,r){var e=207;k[e](t,r.toArray());}function y(t,r){var e=211;k[e](t,r.toArray());}function v(t){return 32>t?1:255>=t?2:65535>=t?3:5}function g(t){return 32>t?1:65535>=t?3:5}function w(t){function r(r,e){var n=e.length,i=5+3*n;r.offset=r.reserve(i);var o=r.buffer,f=t(n),a=r.offset+f;n=u.writeString.call(o,e,a);var s=t(n);if(f!==s){var c=a+s-f,p=a+n;!h&&Buffer.isBuffer(o)?o.copy(o,c,a,p):u.copy.call(o,o,c,a,p);}var l=1===s?160+n:3>=s?215+s:219;k[l](r,n),r.offset+=n;}return r}function E(t,r){if(null===r)return A(t,r);if(T(r))return S(t,r);if(n(r))return m(t,r);if(o.isUint64BE(r))return d(t,r);if(f.isInt64BE(r))return y(t,r);var e=t.codec.getExtPacker(r);return e&&(r=e(r)),r instanceof c?U(t,r):void P(t,r)}function b(t,r){return T(r)?R(t,r):void E(t,r)}function A(t,r){var e=192;k[e](t,r);}function m(t,r){var e=r.length,n=16>e?144+e:65535>=e?220:221;k[n](t,e);for(var i=t.codec.encode,o=0;e>o;o++)i(t,r[o]);}function x(t,r){var e=r.length,n=255>e?196:65535>=e?197:198;k[n](t,e),t.send(r);}function B(t,r){x(t,new Uint8Array(r));}function U(t,r){var e=r.buffer,n=e.length,i=l[n]||(255>n?199:65535>=n?200:201);k[i](t,n),s[r.type](t),t.send(e);}function P(t,r){var e=Object.keys(r),n=e.length,i=16>n?128+n:65535>=n?222:223;k[i](t,n);var o=t.codec.encode;e.forEach(function(e){o(t,e),o(t,r[e]);});}function R(t,r){var e=r.length,n=32>e?160+e:65535>=e?218:219;k[n](t,e),t.send(r);}var k=a.getWriteToken(t),_=t&&t.useraw,I=p&&t&&t.binarraybuffer,T=I?r:Buffer.isBuffer,S=I?B:x,Y={"boolean":e,"function":A,number:i,object:_?b:E,string:w(_?g:v),symbol:A,undefined:A};return Y}var n=t("isarray"),i=t("int64-buffer"),o=i.Uint64BE,f=i.Int64BE,u=t("./buffer-lite"),a=t("./write-token"),s=t("./write-uint8").uint8,c=t("./ext-buffer").ExtBuffer,h="TYPED_ARRAY_SUPPORT"in Buffer,p="undefined"!=typeof Uint8Array,l=[];l[1]=212,l[2]=213,l[4]=214,l[8]=215,l[16]=216,e.getWriteType=r;}).call(this,t("buffer").Buffer);},{"./buffer-lite":2,"./ext-buffer":11,"./write-token":20,"./write-uint8":22,buffer:23,"int64-buffer":27,isarray:28}],22:[function(t,r,e){function n(t){return function(r){var e=r.reserve(1);r.buffer[e]=t;}}for(var i=e.uint8=new Array(256),o=0;255>=o;o++)i[o]=n(o);},{}],23:[function(t,r,e){(function(r){"use strict";function n(){try{var t=new Uint8Array(1);return t.foo=function(){return 42},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(r){return!1}}function i(){return Buffer.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function o(t,r){if(i()<r)throw new RangeError("Invalid typed array length");return Buffer.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(r),t.__proto__=Buffer.prototype):(null===t&&(t=new Buffer(r)),t.length=r),t}function Buffer(t,r,e){if(!(Buffer.TYPED_ARRAY_SUPPORT||this instanceof Buffer))return new Buffer(t,r,e);if("number"==typeof t){if("string"==typeof r)throw new Error("If encoding is specified then the first argument must be a string");return s(this,t)}return f(this,t,r,e)}function f(t,r,e,n){if("number"==typeof r)throw new TypeError('"value" argument must not be a number');return"undefined"!=typeof ArrayBuffer&&r instanceof ArrayBuffer?p(t,r,e,n):"string"==typeof r?c(t,r,e):l(t,r)}function u(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number')}function a(t,r,e,n){return u(r),0>=r?o(t,r):void 0!==e?"string"==typeof n?o(t,r).fill(e,n):o(t,r).fill(e):o(t,r)}function s(t,r){if(u(r),t=o(t,0>r?0:0|d(r)),!Buffer.TYPED_ARRAY_SUPPORT)for(var e=0;r>e;e++)t[e]=0;return t}function c(t,r,e){if("string"==typeof e&&""!==e||(e="utf8"),!Buffer.isEncoding(e))throw new TypeError('"encoding" must be a valid string encoding');var n=0|v(r,e);return t=o(t,n),t.write(r,e),t}function h(t,r){var e=0|d(r.length);t=o(t,e);for(var n=0;e>n;n+=1)t[n]=255&r[n];return t}function p(t,r,e,n){if(r.byteLength,0>e||r.byteLength<e)throw new RangeError("'offset' is out of bounds");if(r.byteLength<e+(n||0))throw new RangeError("'length' is out of bounds");return r=void 0===n?new Uint8Array(r,e):new Uint8Array(r,e,n),Buffer.TYPED_ARRAY_SUPPORT?(t=r,t.__proto__=Buffer.prototype):t=h(t,r),t}function l(t,r){if(Buffer.isBuffer(r)){var e=0|d(r.length);return t=o(t,e),0===t.length?t:(r.copy(t,0,0,e),t)}if(r){if("undefined"!=typeof ArrayBuffer&&r.buffer instanceof ArrayBuffer||"length"in r)return"number"!=typeof r.length||G(r.length)?o(t,0):h(t,r);if("Buffer"===r.type&&K(r.data))return h(t,r.data)}throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}function d(t){if(t>=i())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+i().toString(16)+" bytes");return 0|t}function y(t){return+t!=t&&(t=0),Buffer.alloc(+t)}function v(t,r){if(Buffer.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var e=t.length;if(0===e)return 0;for(var n=!1;;)switch(r){case"ascii":case"binary":case"raw":case"raws":return e;case"utf8":case"utf-8":case void 0:return q(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*e;case"hex":return e>>>1;case"base64":return J(t).length;default:if(n)return q(t).length;r=(""+r).toLowerCase(),n=!0;}}function g(t,r,e){var n=!1;if((void 0===r||0>r)&&(r=0),r>this.length)return"";if((void 0===e||e>this.length)&&(e=this.length),0>=e)return"";if(e>>>=0,r>>>=0,r>=e)return"";for(t||(t="utf8");;)switch(t){case"hex":return T(this,r,e);case"utf8":case"utf-8":return R(this,r,e);case"ascii":return _(this,r,e);case"binary":return I(this,r,e);case"base64":return P(this,r,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return S(this,r,e);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0;}}function w(t,r,e){var n=t[r];t[r]=t[e],t[e]=n;}function E(t,r,e,n){function i(t,r){return 1===o?t[r]:t.readUInt16BE(r*o)}var o=1,f=t.length,u=r.length;if(void 0!==n&&(n=String(n).toLowerCase(),"ucs2"===n||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||r.length<2)return-1;o=2,f/=2,u/=2,e/=2;}for(var a=-1,s=0;f>e+s;s++)if(i(t,e+s)===i(r,-1===a?0:s-a)){if(-1===a&&(a=s),s-a+1===u)return(e+a)*o}else-1!==a&&(s-=s-a),a=-1;return-1}function b(t,r,e,n){e=Number(e)||0;var i=t.length-e;n?(n=Number(n),n>i&&(n=i)):n=i;var o=r.length;if(o%2!==0)throw new Error("Invalid hex string");n>o/2&&(n=o/2);for(var f=0;n>f;f++){var u=parseInt(r.substr(2*f,2),16);if(isNaN(u))return f;t[e+f]=u;}return f}function A(t,r,e,n){return X(q(r,t.length-e),t,e,n)}function m(t,r,e,n){return X(V(r),t,e,n)}function x(t,r,e,n){return m(t,r,e,n)}function B(t,r,e,n){return X(J(r),t,e,n)}function U(t,r,e,n){return X(W(r,t.length-e),t,e,n)}function P(t,r,e){return 0===r&&e===t.length?H.fromByteArray(t):H.fromByteArray(t.slice(r,e))}function R(t,r,e){e=Math.min(t.length,e);for(var n=[],i=r;e>i;){var o=t[i],f=null,u=o>239?4:o>223?3:o>191?2:1;if(e>=i+u){var a,s,c,h;switch(u){case 1:128>o&&(f=o);break;case 2:a=t[i+1],128===(192&a)&&(h=(31&o)<<6|63&a,h>127&&(f=h));break;case 3:a=t[i+1],s=t[i+2],128===(192&a)&&128===(192&s)&&(h=(15&o)<<12|(63&a)<<6|63&s,h>2047&&(55296>h||h>57343)&&(f=h));break;case 4:a=t[i+1],s=t[i+2],c=t[i+3],128===(192&a)&&128===(192&s)&&128===(192&c)&&(h=(15&o)<<18|(63&a)<<12|(63&s)<<6|63&c,h>65535&&1114112>h&&(f=h));}}null===f?(f=65533,u=1):f>65535&&(f-=65536,n.push(f>>>10&1023|55296),f=56320|1023&f),n.push(f),i+=u;}return k(n)}function k(t){var r=t.length;if(Q>=r)return String.fromCharCode.apply(String,t);for(var e="",n=0;r>n;)e+=String.fromCharCode.apply(String,t.slice(n,n+=Q));return e}function _(t,r,e){var n="";e=Math.min(t.length,e);for(var i=r;e>i;i++)n+=String.fromCharCode(127&t[i]);return n}function I(t,r,e){var n="";e=Math.min(t.length,e);for(var i=r;e>i;i++)n+=String.fromCharCode(t[i]);return n}function T(t,r,e){var n=t.length;(!r||0>r)&&(r=0),(!e||0>e||e>n)&&(e=n);for(var i="",o=r;e>o;o++)i+=z(t[o]);return i}function S(t,r,e){for(var n=t.slice(r,e),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function Y(t,r,e){if(t%1!==0||0>t)throw new RangeError("offset is not uint");if(t+r>e)throw new RangeError("Trying to access beyond buffer length")}function D(t,r,e,n,i,o){if(!Buffer.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(r>i||o>r)throw new RangeError('"value" argument is out of bounds');if(e+n>t.length)throw new RangeError("Index out of range")}function C(t,r,e,n){0>r&&(r=65535+r+1);for(var i=0,o=Math.min(t.length-e,2);o>i;i++)t[e+i]=(r&255<<8*(n?i:1-i))>>>8*(n?i:1-i);}function O(t,r,e,n){0>r&&(r=4294967295+r+1);for(var i=0,o=Math.min(t.length-e,4);o>i;i++)t[e+i]=r>>>8*(n?i:3-i)&255;}function M(t,r,e,n,i,o){if(e+n>t.length)throw new RangeError("Index out of range");if(0>e)throw new RangeError("Index out of range")}function L(t,r,e,n,i){return i||M(t,r,e,4,3.4028234663852886e38,-3.4028234663852886e38),Z.write(t,r,e,n,23,4),e+4}function N(t,r,e,n,i){return i||M(t,r,e,8,1.7976931348623157e308,-1.7976931348623157e308),Z.write(t,r,e,n,52,8),e+8}function F(t){if(t=j(t).replace($,""),t.length<2)return"";for(;t.length%4!==0;)t+="=";return t}function j(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function z(t){return 16>t?"0"+t.toString(16):t.toString(16)}function q(t,r){r=r||1/0;for(var e,n=t.length,i=null,o=[],f=0;n>f;f++){if(e=t.charCodeAt(f),e>55295&&57344>e){if(!i){if(e>56319){(r-=3)>-1&&o.push(239,191,189);continue}if(f+1===n){(r-=3)>-1&&o.push(239,191,189);continue}i=e;continue}if(56320>e){(r-=3)>-1&&o.push(239,191,189),i=e;continue}e=(i-55296<<10|e-56320)+65536;}else i&&(r-=3)>-1&&o.push(239,191,189);if(i=null,128>e){if((r-=1)<0)break;o.push(e);}else if(2048>e){if((r-=2)<0)break;o.push(e>>6|192,63&e|128);}else if(65536>e){if((r-=3)<0)break;o.push(e>>12|224,e>>6&63|128,63&e|128);}else{if(!(1114112>e))throw new Error("Invalid code point");if((r-=4)<0)break;o.push(e>>18|240,e>>12&63|128,e>>6&63|128,63&e|128);}}return o}function V(t){for(var r=[],e=0;e<t.length;e++)r.push(255&t.charCodeAt(e));return r}function W(t,r){for(var e,n,i,o=[],f=0;f<t.length&&!((r-=2)<0);f++)e=t.charCodeAt(f),n=e>>8,i=e%256,o.push(i),o.push(n);return o}function J(t){return H.toByteArray(F(t))}function X(t,r,e,n){for(var i=0;n>i&&!(i+e>=r.length||i>=t.length);i++)r[i+e]=t[i];return i}function G(t){return t!==t}var H=t("base64-js"),Z=t("ieee754"),K=t("isarray");e.Buffer=Buffer,e.SlowBuffer=y,e.INSPECT_MAX_BYTES=50,Buffer.TYPED_ARRAY_SUPPORT=void 0!==r.TYPED_ARRAY_SUPPORT?r.TYPED_ARRAY_SUPPORT:n(),e.kMaxLength=i(),Buffer.poolSize=8192,Buffer._augment=function(t){return t.__proto__=Buffer.prototype,t},Buffer.from=function(t,r,e){return f(null,t,r,e)},Buffer.TYPED_ARRAY_SUPPORT&&(Buffer.prototype.__proto__=Uint8Array.prototype,Buffer.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&Buffer[Symbol.species]===Buffer&&Object.defineProperty(Buffer,Symbol.species,{value:null,configurable:!0})),Buffer.alloc=function(t,r,e){return a(null,t,r,e)},Buffer.allocUnsafe=function(t){return s(null,t)},Buffer.allocUnsafeSlow=function(t){return s(null,t)},Buffer.isBuffer=function(t){return!(null==t||!t._isBuffer)},Buffer.compare=function(t,r){if(!Buffer.isBuffer(t)||!Buffer.isBuffer(r))throw new TypeError("Arguments must be Buffers");if(t===r)return 0;for(var e=t.length,n=r.length,i=0,o=Math.min(e,n);o>i;++i)if(t[i]!==r[i]){e=t[i],n=r[i];break}return n>e?-1:e>n?1:0},Buffer.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"binary":case"base64":case"raw":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return!0;default:return!1}},Buffer.concat=function(t,r){if(!K(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return Buffer.alloc(0);var e;if(void 0===r)for(r=0,e=0;e<t.length;e++)r+=t[e].length;var n=Buffer.allocUnsafe(r),i=0;for(e=0;e<t.length;e++){var o=t[e];if(!Buffer.isBuffer(o))throw new TypeError('"list" argument must be an Array of Buffers');o.copy(n,i),i+=o.length;}return n},Buffer.byteLength=v,Buffer.prototype._isBuffer=!0,Buffer.prototype.swap16=function(){var t=this.length;if(t%2!==0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var r=0;t>r;r+=2)w(this,r,r+1);return this},Buffer.prototype.swap32=function(){var t=this.length;if(t%4!==0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var r=0;t>r;r+=4)w(this,r,r+3),w(this,r+1,r+2);return this},Buffer.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?R(this,0,t):g.apply(this,arguments)},Buffer.prototype.equals=function(t){if(!Buffer.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t?!0:0===Buffer.compare(this,t)},Buffer.prototype.inspect=function(){var t="",r=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(t+=" ... ")),"<Buffer "+t+">"},Buffer.prototype.compare=function(t,r,e,n,i){if(!Buffer.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===r&&(r=0),void 0===e&&(e=t?t.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),0>r||e>t.length||0>n||i>this.length)throw new RangeError("out of range index");if(n>=i&&r>=e)return 0;if(n>=i)return-1;if(r>=e)return 1;if(r>>>=0,e>>>=0,n>>>=0,i>>>=0,this===t)return 0;for(var o=i-n,f=e-r,u=Math.min(o,f),a=this.slice(n,i),s=t.slice(r,e),c=0;u>c;++c)if(a[c]!==s[c]){o=a[c],f=s[c];break}return f>o?-1:o>f?1:0},Buffer.prototype.indexOf=function(t,r,e){if("string"==typeof r?(e=r,r=0):r>2147483647?r=2147483647:-2147483648>r&&(r=-2147483648),r>>=0,0===this.length)return-1;if(r>=this.length)return-1;if(0>r&&(r=Math.max(this.length+r,0)),"string"==typeof t&&(t=Buffer.from(t,e)),Buffer.isBuffer(t))return 0===t.length?-1:E(this,t,r,e);if("number"==typeof t)return Buffer.TYPED_ARRAY_SUPPORT&&"function"===Uint8Array.prototype.indexOf?Uint8Array.prototype.indexOf.call(this,t,r):E(this,[t],r,e);throw new TypeError("val must be string, number or Buffer")},Buffer.prototype.includes=function(t,r,e){return-1!==this.indexOf(t,r,e)},Buffer.prototype.write=function(t,r,e,n){if(void 0===r)n="utf8",e=this.length,
r=0;else if(void 0===e&&"string"==typeof r)n=r,e=this.length,r=0;else{if(!isFinite(r))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");r=0|r,isFinite(e)?(e=0|e,void 0===n&&(n="utf8")):(n=e,e=void 0);}var i=this.length-r;if((void 0===e||e>i)&&(e=i),t.length>0&&(0>e||0>r)||r>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return b(this,t,r,e);case"utf8":case"utf-8":return A(this,t,r,e);case"ascii":return m(this,t,r,e);case"binary":return x(this,t,r,e);case"base64":return B(this,t,r,e);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return U(this,t,r,e);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0;}},Buffer.prototype.toJSON=function(){return{type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};var Q=4096;Buffer.prototype.slice=function(t,r){var e=this.length;t=~~t,r=void 0===r?e:~~r,0>t?(t+=e,0>t&&(t=0)):t>e&&(t=e),0>r?(r+=e,0>r&&(r=0)):r>e&&(r=e),t>r&&(r=t);var n;if(Buffer.TYPED_ARRAY_SUPPORT)n=this.subarray(t,r),n.__proto__=Buffer.prototype;else{var i=r-t;n=new Buffer(i,void 0);for(var o=0;i>o;o++)n[o]=this[o+t];}return n},Buffer.prototype.readUIntLE=function(t,r,e){t=0|t,r=0|r,e||Y(t,r,this.length);for(var n=this[t],i=1,o=0;++o<r&&(i*=256);)n+=this[t+o]*i;return n},Buffer.prototype.readUIntBE=function(t,r,e){t=0|t,r=0|r,e||Y(t,r,this.length);for(var n=this[t+--r],i=1;r>0&&(i*=256);)n+=this[t+--r]*i;return n},Buffer.prototype.readUInt8=function(t,r){return r||Y(t,1,this.length),this[t]},Buffer.prototype.readUInt16LE=function(t,r){return r||Y(t,2,this.length),this[t]|this[t+1]<<8},Buffer.prototype.readUInt16BE=function(t,r){return r||Y(t,2,this.length),this[t]<<8|this[t+1]},Buffer.prototype.readUInt32LE=function(t,r){return r||Y(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},Buffer.prototype.readUInt32BE=function(t,r){return r||Y(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},Buffer.prototype.readIntLE=function(t,r,e){t=0|t,r=0|r,e||Y(t,r,this.length);for(var n=this[t],i=1,o=0;++o<r&&(i*=256);)n+=this[t+o]*i;return i*=128,n>=i&&(n-=Math.pow(2,8*r)),n},Buffer.prototype.readIntBE=function(t,r,e){t=0|t,r=0|r,e||Y(t,r,this.length);for(var n=r,i=1,o=this[t+--n];n>0&&(i*=256);)o+=this[t+--n]*i;return i*=128,o>=i&&(o-=Math.pow(2,8*r)),o},Buffer.prototype.readInt8=function(t,r){return r||Y(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},Buffer.prototype.readInt16LE=function(t,r){r||Y(t,2,this.length);var e=this[t]|this[t+1]<<8;return 32768&e?4294901760|e:e},Buffer.prototype.readInt16BE=function(t,r){r||Y(t,2,this.length);var e=this[t+1]|this[t]<<8;return 32768&e?4294901760|e:e},Buffer.prototype.readInt32LE=function(t,r){return r||Y(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},Buffer.prototype.readInt32BE=function(t,r){return r||Y(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},Buffer.prototype.readFloatLE=function(t,r){return r||Y(t,4,this.length),Z.read(this,t,!0,23,4)},Buffer.prototype.readFloatBE=function(t,r){return r||Y(t,4,this.length),Z.read(this,t,!1,23,4)},Buffer.prototype.readDoubleLE=function(t,r){return r||Y(t,8,this.length),Z.read(this,t,!0,52,8)},Buffer.prototype.readDoubleBE=function(t,r){return r||Y(t,8,this.length),Z.read(this,t,!1,52,8)},Buffer.prototype.writeUIntLE=function(t,r,e,n){if(t=+t,r=0|r,e=0|e,!n){var i=Math.pow(2,8*e)-1;D(this,t,r,e,i,0);}var o=1,f=0;for(this[r]=255&t;++f<e&&(o*=256);)this[r+f]=t/o&255;return r+e},Buffer.prototype.writeUIntBE=function(t,r,e,n){if(t=+t,r=0|r,e=0|e,!n){var i=Math.pow(2,8*e)-1;D(this,t,r,e,i,0);}var o=e-1,f=1;for(this[r+o]=255&t;--o>=0&&(f*=256);)this[r+o]=t/f&255;return r+e},Buffer.prototype.writeUInt8=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,1,255,0),Buffer.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[r]=255&t,r+1},Buffer.prototype.writeUInt16LE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,2,65535,0),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8):C(this,t,r,!0),r+2},Buffer.prototype.writeUInt16BE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,2,65535,0),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=t>>>8,this[r+1]=255&t):C(this,t,r,!1),r+2},Buffer.prototype.writeUInt32LE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,4,4294967295,0),Buffer.TYPED_ARRAY_SUPPORT?(this[r+3]=t>>>24,this[r+2]=t>>>16,this[r+1]=t>>>8,this[r]=255&t):O(this,t,r,!0),r+4},Buffer.prototype.writeUInt32BE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,4,4294967295,0),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t):O(this,t,r,!1),r+4},Buffer.prototype.writeIntLE=function(t,r,e,n){if(t=+t,r=0|r,!n){var i=Math.pow(2,8*e-1);D(this,t,r,e,i-1,-i);}var o=0,f=1,u=0;for(this[r]=255&t;++o<e&&(f*=256);)0>t&&0===u&&0!==this[r+o-1]&&(u=1),this[r+o]=(t/f>>0)-u&255;return r+e},Buffer.prototype.writeIntBE=function(t,r,e,n){if(t=+t,r=0|r,!n){var i=Math.pow(2,8*e-1);D(this,t,r,e,i-1,-i);}var o=e-1,f=1,u=0;for(this[r+o]=255&t;--o>=0&&(f*=256);)0>t&&0===u&&0!==this[r+o+1]&&(u=1),this[r+o]=(t/f>>0)-u&255;return r+e},Buffer.prototype.writeInt8=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,1,127,-128),Buffer.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),0>t&&(t=255+t+1),this[r]=255&t,r+1},Buffer.prototype.writeInt16LE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,2,32767,-32768),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8):C(this,t,r,!0),r+2},Buffer.prototype.writeInt16BE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,2,32767,-32768),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=t>>>8,this[r+1]=255&t):C(this,t,r,!1),r+2},Buffer.prototype.writeInt32LE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,4,2147483647,-2147483648),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=255&t,this[r+1]=t>>>8,this[r+2]=t>>>16,this[r+3]=t>>>24):O(this,t,r,!0),r+4},Buffer.prototype.writeInt32BE=function(t,r,e){return t=+t,r=0|r,e||D(this,t,r,4,2147483647,-2147483648),0>t&&(t=4294967295+t+1),Buffer.TYPED_ARRAY_SUPPORT?(this[r]=t>>>24,this[r+1]=t>>>16,this[r+2]=t>>>8,this[r+3]=255&t):O(this,t,r,!1),r+4},Buffer.prototype.writeFloatLE=function(t,r,e){return L(this,t,r,!0,e)},Buffer.prototype.writeFloatBE=function(t,r,e){return L(this,t,r,!1,e)},Buffer.prototype.writeDoubleLE=function(t,r,e){return N(this,t,r,!0,e)},Buffer.prototype.writeDoubleBE=function(t,r,e){return N(this,t,r,!1,e)},Buffer.prototype.copy=function(t,r,e,n){if(e||(e=0),n||0===n||(n=this.length),r>=t.length&&(r=t.length),r||(r=0),n>0&&e>n&&(n=e),n===e)return 0;if(0===t.length||0===this.length)return 0;if(0>r)throw new RangeError("targetStart out of bounds");if(0>e||e>=this.length)throw new RangeError("sourceStart out of bounds");if(0>n)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-r<n-e&&(n=t.length-r+e);var i,o=n-e;if(this===t&&r>e&&n>r)for(i=o-1;i>=0;i--)t[i+r]=this[i+e];else if(1e3>o||!Buffer.TYPED_ARRAY_SUPPORT)for(i=0;o>i;i++)t[i+r]=this[i+e];else Uint8Array.prototype.set.call(t,this.subarray(e,e+o),r);return o},Buffer.prototype.fill=function(t,r,e,n){if("string"==typeof t){if("string"==typeof r?(n=r,r=0,e=this.length):"string"==typeof e&&(n=e,e=this.length),1===t.length){var i=t.charCodeAt(0);256>i&&(t=i);}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!Buffer.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else"number"==typeof t&&(t=255&t);if(0>r||this.length<r||this.length<e)throw new RangeError("Out of range index");if(r>=e)return this;r>>>=0,e=void 0===e?this.length:e>>>0,t||(t=0);var o;if("number"==typeof t)for(o=r;e>o;o++)this[o]=t;else{var f=Buffer.isBuffer(t)?t:q(new Buffer(t,n).toString()),u=f.length;for(o=0;e-r>o;o++)this[o+r]=f[o%u];}return this};var $=/[^+\/0-9A-Za-z-_]/g;}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});},{"base64-js":24,ieee754:26,isarray:28}],24:[function(t,r,e){"use strict";function n(){for(var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",r=0,e=t.length;e>r;++r)a[r]=t[r],s[t.charCodeAt(r)]=r;s["-".charCodeAt(0)]=62,s["_".charCodeAt(0)]=63;}function i(t){var r,e,n,i,o,f,u=t.length;if(u%4>0)throw new Error("Invalid string. Length must be a multiple of 4");o="="===t[u-2]?2:"="===t[u-1]?1:0,f=new c(3*u/4-o),n=o>0?u-4:u;var a=0;for(r=0,e=0;n>r;r+=4,e+=3)i=s[t.charCodeAt(r)]<<18|s[t.charCodeAt(r+1)]<<12|s[t.charCodeAt(r+2)]<<6|s[t.charCodeAt(r+3)],f[a++]=i>>16&255,f[a++]=i>>8&255,f[a++]=255&i;return 2===o?(i=s[t.charCodeAt(r)]<<2|s[t.charCodeAt(r+1)]>>4,f[a++]=255&i):1===o&&(i=s[t.charCodeAt(r)]<<10|s[t.charCodeAt(r+1)]<<4|s[t.charCodeAt(r+2)]>>2,f[a++]=i>>8&255,f[a++]=255&i),f}function o(t){return a[t>>18&63]+a[t>>12&63]+a[t>>6&63]+a[63&t]}function f(t,r,e){for(var n,i=[],f=r;e>f;f+=3)n=(t[f]<<16)+(t[f+1]<<8)+t[f+2],i.push(o(n));return i.join("")}function u(t){for(var r,e=t.length,n=e%3,i="",o=[],u=16383,s=0,c=e-n;c>s;s+=u)o.push(f(t,s,s+u>c?c:s+u));return 1===n?(r=t[e-1],i+=a[r>>2],i+=a[r<<4&63],i+="=="):2===n&&(r=(t[e-2]<<8)+t[e-1],i+=a[r>>10],i+=a[r>>4&63],i+=a[r<<2&63],i+="="),o.push(i),o.join("")}e.toByteArray=i,e.fromByteArray=u;var a=[],s=[],c="undefined"!=typeof Uint8Array?Uint8Array:Array;n();},{}],25:[function(t,r,e){function n(){return this instanceof n?void 0:new n}!function(t){function e(t){for(var r in s)t[r]=s[r];return t}function n(t,r){return u(this,t).push(r),this}function i(t,r){function e(){o.call(n,t,e),r.apply(this,arguments);}var n=this;return e.originalListener=r,u(n,t).push(e),n}function o(t,r){function e(t){return t!==r&&t.originalListener!==r}var n,i=this;if(arguments.length){if(r){if(n=u(i,t,!0)){if(n=n.filter(e),!n.length)return o.call(i,t);i[a][t]=n;}}else if(n=i[a],n&&(delete n[t],!Object.keys(n).length))return o.call(i)}else delete i[a];return i}function f(t,r){function e(t){t.call(o);}function n(t){t.call(o,r);}function i(t){t.apply(o,s);}var o=this,f=u(o,t,!0);if(!f)return!1;var a=arguments.length;if(1===a)f.forEach(e);else if(2===a)f.forEach(n);else{var s=Array.prototype.slice.call(arguments,1);f.forEach(i);}return!!f.length}function u(t,r,e){if(!e||t[a]){var n=t[a]||(t[a]={});return n[r]||(n[r]=[])}}"undefined"!=typeof r&&(r.exports=t);var a="listeners",s={on:n,once:i,off:o,emit:f};e(t.prototype),t.mixin=e;}(n);},{}],26:[function(t,r,e){e.read=function(t,r,e,n,i){var o,f,u=8*i-n-1,a=(1<<u)-1,s=a>>1,c=-7,h=e?i-1:0,p=e?-1:1,l=t[r+h];for(h+=p,o=l&(1<<-c)-1,l>>=-c,c+=u;c>0;o=256*o+t[r+h],h+=p,c-=8);for(f=o&(1<<-c)-1,o>>=-c,c+=n;c>0;f=256*f+t[r+h],h+=p,c-=8);if(0===o)o=1-s;else{if(o===a)return f?NaN:(l?-1:1)*(1/0);f+=Math.pow(2,n),o-=s;}return(l?-1:1)*f*Math.pow(2,o-n)},e.write=function(t,r,e,n,i,o){var f,u,a,s=8*o-i-1,c=(1<<s)-1,h=c>>1,p=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,l=n?0:o-1,d=n?1:-1,y=0>r||0===r&&0>1/r?1:0;for(r=Math.abs(r),isNaN(r)||r===1/0?(u=isNaN(r)?1:0,f=c):(f=Math.floor(Math.log(r)/Math.LN2),r*(a=Math.pow(2,-f))<1&&(f--,a*=2),r+=f+h>=1?p/a:p*Math.pow(2,1-h),r*a>=2&&(f++,a/=2),f+h>=c?(u=0,f=c):f+h>=1?(u=(r*a-1)*Math.pow(2,i),f+=h):(u=r*Math.pow(2,h-1)*Math.pow(2,i),f=0));i>=8;t[e+l]=255&u,l+=d,u/=256,i-=8);for(f=f<<i|u,s+=i;s>0;t[e+l]=255&f,l+=d,f/=256,s-=8);t[e+l-d]|=128*y;};},{}],27:[function(t,r,e){(function(Buffer){var t,r;!function(e){function n(t,r,e,n,u){if(A&&m&&(r instanceof m&&(r=new A(r)),n instanceof m&&(n=new A(n))),!(r||e||n||d))return void(t.buffer=a(x,0));if(!i(r,e)){var s=d||Array;u=e,n=r,e=0,r=new s(8);}t.buffer=r,t.offset=e|=0,"undefined"!=typeof n&&("string"==typeof n?f(r,e,n,u||10):i(n,u)?o(r,e,n,u):"number"==typeof u?(c(r,e,n),c(r,e+4,u)):n>0?h(r,e,n):0>n?p(r,e,n):o(r,e,x,0));}function i(t,r){var e=t&&t.length;return r|=0,e&&e>=r+8&&"string"!=typeof t[r]}function o(t,r,e,n){r|=0,n|=0;for(var i=0;8>i;i++)t[r++]=255&e[n++];}function f(t,r,e,n){var i=0,o=e.length,f=0,u=0;"-"===e[0]&&i++;for(var a=i;o>i;){var s=parseInt(e[i++],n);if(!(s>=0))break;u=u*n+s,f=f*n+Math.floor(u/U),u%=U;}a&&(f=~f,u?u=U-u:f++),c(t,r,f),c(t,r+4,u);}function u(t,r,e,n){var i="",o=s(t,r),f=s(t,r+4),u=n&&2147483648&o;for(u&&(o=~o,f=U-f),e=e||10;;){var a=o%e*U+f;if(o=Math.floor(o/e),f=Math.floor(a/e),i=(a%e).toString(e)+i,!o&&!f)break}return u&&(i="-"+i),i}function a(t,r){return Array.prototype.slice.call(t,r,r+8)}function s(t,r){return t[r++]*P+(t[r++]<<16)+(t[r++]<<8)+t[r]}function c(t,r,e){t[r+3]=255&e,e>>=8,t[r+2]=255&e,e>>=8,t[r+1]=255&e,e>>=8,t[r]=255&e;}function h(t,r,e){for(var n=r+7;n>=r;n--)t[n]=255&e,e/=256;}function p(t,r,e){e++;for(var n=r+7;n>=r;n--)t[n]=255&-e^255,e/=256;}function l(t){return!!t&&"[object Array]"==Object.prototype.toString.call(t)}var d,y=e.Uint64BE=t=function(r,e,i,o){return this instanceof t?n(this,r,e,i,o):new t(r,e,i,o)},v=e.Int64BE=r=function(t,e,i,o){return this instanceof r?n(this,t,e,i,o):new r(t,e,i,o)},g=y.prototype,w=v.prototype,E="undefined",b=E!==typeof Buffer&&Buffer,A=E!==typeof Uint8Array&&Uint8Array,m=E!==typeof ArrayBuffer&&ArrayBuffer,x=[0,0,0,0,0,0,0,0],B=Array.isArray||l,U=4294967296,P=16777216;g.buffer=w.buffer=void 0,g.offset=w.offset=0,g._isUint64BE=w._isInt64BE=!0,y.isUint64BE=function(t){return!(!t||!t._isUint64BE)},v.isInt64BE=function(t){return!(!t||!t._isInt64BE)},g.toNumber=function(){var t=this.buffer,r=this.offset,e=s(t,r),n=s(t,r+4);return e?e*U+n:n},w.toNumber=function(){var t=this.buffer,r=this.offset,e=0|s(t,r),n=s(t,r+4);return e?e*U+n:n},g.toArray=w.toArray=function(t){var r=this.buffer,e=this.offset;return d=null,t!==!1&&0===e&&8===r.length&&B(r)?r:a(r,e)},b&&(g.toBuffer=w.toBuffer=function(t){var r=this.buffer,e=this.offset;if(d=b,t!==!1&&0===e&&8===r.length&&Buffer.isBuffer(r))return r;var n=new b(8);return o(n,0,r,e),n}),A&&(g.toArrayBuffer=w.toArrayBuffer=function(t){var r=this.buffer,e=this.offset,n=r.buffer;if(d=A,t!==!1&&0===e&&n instanceof m&&8===n.byteLength)return n;var i=new A(8);return o(i,0,r,e),i.buffer}),w.toString=function(t){return u(this.buffer,this.offset,t,!0)},g.toString=function(t){return u(this.buffer,this.offset,t,!1)},g.toJSON=g.toNumber,w.toJSON=w.toNumber;}("object"==typeof e&&"string"!=typeof e.nodeName?e:this||{});}).call(this,t("buffer").Buffer);},{buffer:23}],28:[function(t,r,e){var n={}.toString;r.exports=Array.isArray||function(t){return"[object Array]"==n.call(t)};},{}]},{},[1])(1)});

function u8aToHex(array) {
    const results = [];
    for (let arrayByte of array) {
        results.push(arrayByte.toString(16).replace(/^([\da-f])$/, '0$1'));
    }
    return results.join('');
}

function byteToHex(value) {
    return '0x' + ('00' + value.toString(16)).substr(-2);
}

function randomUint32() {
    const crypto = window.crypto || window.msCrypto;
    return crypto.getRandomValues(new Uint32Array(1))[0];
}
function concat(...arrays) {
    let totalLength = 0;
    for (let arr of arrays) {
        totalLength += arr.length;
    }
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (let arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}
function waitFor(test, delay_ms, retries, success, error) {
    if (test() === false) {
        if (retries === 1) {
            error();
        }
        else {
            setTimeout(() => waitFor(test, delay_ms, retries - 1, success, error), delay_ms);
        }
        return;
    }
    success();
}

class Box {
    constructor(nonce, data, nonceLength) {
        this._nonce = nonce;
        this._nonceLength = nonceLength;
        this._data = data;
    }
    get length() {
        return this._nonce.length + this._data.length;
    }
    get data() {
        return this._data;
    }
    get nonce() {
        return this._nonce;
    }
    static fromUint8Array(array, nonceLength) {
        if (nonceLength === undefined) {
            throw new Error('nonceLength parameter not specified');
        }
        if (array.byteLength <= nonceLength) {
            throw 'bad-message-length';
        }
        const nonce = array.slice(0, nonceLength);
        const data = array.slice(nonceLength);
        return new Box(nonce, data, nonceLength);
    }
    toUint8Array() {
        const box = new Uint8Array(this.length);
        box.set(this._nonce);
        box.set(this._data, this._nonceLength);
        return box;
    }
}
class KeyStore {
    constructor(publicKey, secretKey) {
        if (publicKey === undefined || secretKey === undefined) {
            this._keyPair = nacl.box.keyPair();
            console.debug('KeyStore: New public key:', u8aToHex(this._keyPair.publicKey));
        }
        else {
            this._keyPair = {
                publicKey: publicKey,
                secretKey: secretKey,
            };
            console.debug('KeyStore: Restored public key:', u8aToHex(this._keyPair.publicKey));
        }
    }
    get publicKeyHex() { return u8aToHex(this._keyPair.publicKey); }
    get publicKeyBytes() { return this._keyPair.publicKey; }
    get secretKeyHex() { return u8aToHex(this._keyPair.secretKey); }
    get secretKeyBytes() { return this._keyPair.secretKey; }
    get keypair() {
        return this._keyPair;
    }
    encrypt(bytes, nonce, otherKey) {
        const encrypted = nacl.box(bytes, nonce, otherKey, this._keyPair.secretKey);
        return new Box(nonce, encrypted, nacl.box.nonceLength);
    }
    decrypt(box, otherKey) {
        const data = nacl.box.open(box.data, box.nonce, otherKey, this._keyPair.secretKey);
        if (data === false) {
            throw 'decryption-failed';
        }
        return data;
    }
}
class AuthToken {
    constructor(bytes) {
        this._authToken = null;
        if (typeof bytes === 'undefined') {
            this._authToken = nacl.randomBytes(nacl.secretbox.keyLength);
            console.debug('AuthToken: Generated auth token');
        }
        else {
            if (bytes.byteLength != nacl.secretbox.keyLength) {
                console.error('Auth token must be', nacl.secretbox.keyLength, 'bytes long.');
                throw 'bad-token-length';
            }
            this._authToken = bytes;
            console.debug('AuthToken: Initialized auth token');
        }
    }
    get keyBytes() { return this._authToken; }
    get keyHex() { return u8aToHex(this._authToken); }
    encrypt(bytes, nonce) {
        const encrypted = nacl.secretbox(bytes, nonce, this._authToken);
        return new Box(nonce, encrypted, nacl.secretbox.nonceLength);
    }
    decrypt(box) {
        const data = nacl.secretbox.open(box.data, box.nonce, this._authToken);
        if (data === false) {
            throw 'decryption-failed';
        }
        return data;
    }
}

class Cookie {
    constructor(bytes) {
        if (typeof bytes !== 'undefined') {
            if (bytes.length !== 16) {
                throw 'bad-cookie-length';
            }
            this.bytes = bytes;
        }
        else {
            this.bytes = nacl.randomBytes(Cookie.COOKIE_LENGTH);
        }
    }
    static fromArrayBuffer(buffer) {
        return new Cookie(new Uint8Array(buffer));
    }
    asArrayBuffer() {
        return this.bytes.buffer.slice(this.bytes.byteOffset, this.bytes.byteLength);
    }
    equals(otherCookie) {
        if (otherCookie.bytes === this.bytes)
            return true;
        if (otherCookie.bytes == null || this.bytes == null)
            return false;
        if (otherCookie.bytes.byteLength != this.bytes.byteLength)
            return false;
        for (var i = 0; i < this.bytes.byteLength; i++) {
            if (otherCookie.bytes[i] != this.bytes[i])
                return false;
        }
        return true;
    }
}
Cookie.COOKIE_LENGTH = 16;
class CookiePair {
    constructor(ours, theirs) {
        this.ours = null;
        this.theirs = null;
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            this.ours = ours;
            this.theirs = theirs;
        }
        else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this.ours = new Cookie();
        }
        else {
            throw new Error('Either both or no cookies must be specified');
        }
    }
}

class Nonce {
    constructor(cookie, overflow, sequenceNumber, source, destination) {
        this._cookie = cookie;
        this._overflow = overflow;
        this._sequenceNumber = sequenceNumber;
        this._source = source;
        this._destination = destination;
    }
    get cookie() { return this._cookie; }
    get overflow() { return this._overflow; }
    get sequenceNumber() { return this._sequenceNumber; }
    get combinedSequenceNumber() { return (this._overflow << 32) + this._sequenceNumber; }
    get source() { return this._source; }
    get destination() { return this._destination; }
    static fromArrayBuffer(packet) {
        if (packet.byteLength != this.TOTAL_LENGTH) {
            throw 'bad-packet-length';
        }
        const view = new DataView(packet);
        const cookie = new Cookie(new Uint8Array(packet, 0, 16));
        const source = view.getUint8(16);
        const destination = view.getUint8(17);
        const overflow = view.getUint16(18);
        const sequenceNumber = view.getUint32(20);
        return new Nonce(cookie, overflow, sequenceNumber, source, destination);
    }
    toArrayBuffer() {
        const buf = new ArrayBuffer(Nonce.TOTAL_LENGTH);
        const uint8view = new Uint8Array(buf);
        uint8view.set(this._cookie.bytes);
        const view = new DataView(buf);
        view.setUint8(16, this._source);
        view.setUint8(17, this._destination);
        view.setUint16(18, this._overflow);
        view.setUint32(20, this._sequenceNumber);
        return buf;
    }
}
Nonce.TOTAL_LENGTH = 24;

class CombinedSequence {
    constructor() {
        this.sequenceNumber = randomUint32();
        this.overflow = 0;
    }
    next() {
        if (this.sequenceNumber + 1 >= CombinedSequence.SEQUENCE_NUMBER_MAX) {
            this.sequenceNumber = 0;
            this.overflow += 1;
            if (this.overflow >= CombinedSequence.OVERFLOW_MAX) {
                console.error('Overflow number just overflowed!');
                throw new Error('overflow-overflow');
            }
        }
        else {
            this.sequenceNumber += 1;
        }
        return {
            sequenceNumber: this.sequenceNumber,
            overflow: this.overflow,
        };
    }
}
CombinedSequence.SEQUENCE_NUMBER_MAX = 0x100000000;
CombinedSequence.OVERFLOW_MAX = 0x100000;
class CombinedSequencePair {
    constructor(ours, theirs) {
        this.ours = null;
        this.theirs = null;
        if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
            this.ours = ours;
            this.theirs = theirs;
        }
        else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
            this.ours = new CombinedSequence();
        }
        else {
            throw new Error('Either both or no combined sequences must be specified');
        }
    }
}

var CloseCode;
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
})(CloseCode || (CloseCode = {}));
function explainCloseCode(code) {
    switch (code) {
        case CloseCode.ClosingNormal:
            return 'Normal closing';
        case CloseCode.GoingAway:
            return 'The endpoint is going away';
        case CloseCode.NoSharedSubprotocol:
            return 'No shared subprotocol could be found';
        case CloseCode.PathFull:
            return 'No free responder byte';
        case CloseCode.ProtocolError:
            return 'Protocol error';
        case CloseCode.InternalError:
            return 'Internal error';
        case CloseCode.Handover:
            return 'Handover finished';
        case CloseCode.DroppedByInitiator:
            return 'Dropped by initiator';
        case CloseCode.InitiatorCouldNotDecrypt:
            return 'Initiator could not decrypt a message';
        case CloseCode.NoSharedTask:
            return 'No shared task was found';
        default:
            return 'Unknown';
    }
}

function InternalError(message) {
    this.message = message;
    if ('captureStackTrace' in Error) {
        Error.captureStackTrace(this, InternalError);
    }
    else {
        this.stack = (new Error()).stack;
    }
}
InternalError.prototype = Object.create(Error.prototype);
InternalError.prototype.name = 'InternalError';
InternalError.prototype.constructor = InternalError;
class SignalingError extends Error {
    constructor(closeCode, message) {
        super(message);
        this.message = message;
        this.closeCode = closeCode;
        this.name = 'SignalingError';
    }
}
class ProtocolError extends SignalingError {
    constructor(message) {
        super(CloseCode.ProtocolError, message);
    }
}
class ConnectionError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = 'ConnectionError';
    }
}
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.message = message;
        this.name = 'ValidationError';
    }
}

function decryptKeystore(box, keyStore, otherKey, msgType) {
    try {
        return keyStore.decrypt(box, otherKey);
    }
    catch (e) {
        if (e === 'decryption-failed') {
            throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt ' + msgType + ' message.');
        }
        else {
            throw e;
        }
    }
}

function isResponderId(receiver) {
    return receiver >= 0x02 && receiver <= 0xff;
}

class Signaling {
    constructor(client, host, port, tasks, permanentKey, peerTrustedKey) {
        this.protocol = 'wss';
        this.ws = null;
        this.msgpackOptions = {
            codec: msgpack.createCodec({ binarraybuffer: true }),
        };
        this.state = 'new';
        this.serverHandshakeState = 'new';
        this.handoverState = {
            local: false,
            peer: false,
        };
        this.task = null;
        this.serverKey = null;
        this.sessionKey = null;
        this.authToken = null;
        this.peerTrustedKey = null;
        this.role = null;
        this.logTag = 'Signaling:';
        this.address = Signaling.SALTYRTC_ADDR_UNKNOWN;
        this.cookiePair = null;
        this.serverCsn = new CombinedSequence();
        this.onOpen = (ev) => {
            console.info(this.logTag, 'Opened connection');
            this.setState('server-handshake');
        };
        this.onError = (ev) => {
            console.error(this.logTag, 'General WebSocket error', ev);
            this.client.emit({ type: 'connection-error', data: ev });
        };
        this.onClose = (ev) => {
            if (ev.code === CloseCode.Handover) {
                console.info(this.logTag, 'Closed WebSocket connection due to handover');
            }
            else {
                console.info(this.logTag, 'Closed WebSocket connection');
                this.setState('closed');
                const log = (reason) => console.error(this.logTag, 'Server closed connection:', reason);
                switch (ev.code) {
                    case CloseCode.GoingAway:
                        log('Server is being shut down');
                        break;
                    case CloseCode.NoSharedSubprotocol:
                        log('No shared sub-protocol could be found');
                        break;
                    case CloseCode.PathFull:
                        log('Path full (no free responder byte)');
                        break;
                    case CloseCode.ProtocolError:
                        log('Protocol error');
                        break;
                    case CloseCode.InternalError:
                        log('Internal server error');
                        break;
                    case CloseCode.DroppedByInitiator:
                        log('Dropped by initiator');
                        break;
                }
                this.client.emit({ type: 'connection-closed', data: ev });
            }
        };
        this.onMessage = (ev) => {
            console.debug(this.logTag, 'New ws message (' + ev.data.byteLength + ' bytes)');
            try {
                const box = Box.fromUint8Array(new Uint8Array(ev.data), Nonce.TOTAL_LENGTH);
                const nonce = Nonce.fromArrayBuffer(box.nonce.buffer);
                switch (this.getState()) {
                    case 'server-handshake':
                        this.onServerHandshakeMessage(box, nonce);
                        break;
                    case 'peer-handshake':
                        this.onPeerHandshakeMessage(box, nonce);
                        break;
                    case 'task':
                        this.onSignalingMessage(box, nonce);
                        break;
                    default:
                        console.warn(this.logTag, 'Received message in', this.getState(), 'signaling state. Ignoring.');
                }
            }
            catch (e) {
                if (e instanceof SignalingError) {
                    console.error(this.logTag, 'Signaling error: ' + explainCloseCode(e.closeCode));
                    if (this.state === 'task') {
                        this.sendClose(e.closeCode);
                    }
                    this.resetConnection(e.closeCode);
                }
                else if (e instanceof ConnectionError) {
                    console.warn(this.logTag, 'Connection error. Resetting connection.');
                    this.resetConnection(CloseCode.InternalError);
                }
                throw e;
            }
        };
        this.client = client;
        this.permanentKey = permanentKey;
        this.host = host;
        this.port = port;
        this.tasks = tasks;
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
    }
    setState(newState) {
        this.state = newState;
        this.client.emit({ type: 'state-change', data: newState });
        this.client.emit({ type: 'state-change:' + newState });
    }
    getState() {
        return this.state;
    }
    get permanentKeyBytes() {
        return this.permanentKey.publicKeyBytes;
    }
    get authTokenBytes() {
        if (this.authToken !== null) {
            return this.authToken.keyBytes;
        }
        return null;
    }
    get peerPermanentKeyBytes() {
        return this.getPeerPermanentKey();
    }
    msgpackEncode(data) {
        return msgpack.encode(data, this.msgpackOptions);
    }
    msgpackDecode(data) {
        return msgpack.decode(data, this.msgpackOptions);
    }
    connect() {
        this.resetConnection();
        this.initWebsocket();
    }
    disconnect() {
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket');
            this.ws.close();
        }
        this.ws = null;
        this.setState('closed');
    }
    initWebsocket() {
        const url = this.protocol + '://' + this.host + ':' + this.port + '/';
        const path = this.getWebsocketPath();
        this.ws = new WebSocket(url + path, Signaling.SALTYRTC_SUBPROTOCOL);
        this.ws.binaryType = 'arraybuffer';
        this.ws.addEventListener('open', this.onOpen);
        this.ws.addEventListener('error', this.onError);
        this.ws.addEventListener('close', this.onClose);
        this.ws.addEventListener('message', this.onMessage);
        this.setState('ws-connecting');
        console.debug(this.logTag, 'Opening WebSocket connection to', url + path);
    }
    onServerHandshakeMessage(box, nonce) {
        let payload;
        if (this.serverHandshakeState === 'new') {
            payload = box.data;
        }
        else {
            payload = this.permanentKey.decrypt(box, this.serverKey);
        }
        const msg = this.decodeMessage(payload, 'server handshake');
        switch (this.serverHandshakeState) {
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
                throw new SignalingError(CloseCode.InternalError, 'Received server handshake message even though server handshake state is set to \'done\'');
            default:
                throw new SignalingError(CloseCode.InternalError, 'Unknown server handshake state: ' + this.serverHandshakeState);
        }
        if (this.serverHandshakeState === 'done') {
            this.setState('peer-handshake');
            console.debug(this.logTag, 'Server handshake done');
            this.initPeerHandshake();
        }
    }
    onSignalingMessage(box, nonce) {
        console.debug('Message received');
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            this.onSignalingServerMessage(box);
        }
        else {
            let decrypted;
            try {
                decrypted = this.decryptFromPeer(box);
            }
            catch (e) {
                if (e === 'decryption-failed') {
                    console.warn(this.logTag, 'Could not decrypt peer message from', byteToHex(nonce.source));
                    return;
                }
                else {
                    throw e;
                }
            }
            this.onSignalingPeerMessage(decrypted);
        }
    }
    onSignalingServerMessage(box) {
        const msg = this.decryptServerMessage(box);
        if (msg.type === 'send-error') {
            this.handleSendError(msg);
        }
        else {
            console.warn(this.logTag, 'Invalid server message type:', msg.type);
        }
    }
    onSignalingPeerMessage(decrypted) {
        let msg = this.decodeMessage(decrypted);
        if (msg.type === 'close') {
            console.debug('Received close');
        }
        else if (msg.type === 'data') {
            console.debug(this.logTag, 'Received data');
            this.handleData(msg);
        }
        else if (msg.type === 'restart') {
            console.debug(this.logTag, 'Received restart');
            this.handleRestart(msg);
        }
        else if (this.task !== null && this.task.getSupportedMessageTypes().indexOf(msg.type) !== -1) {
            console.debug(this.logTag, 'Received', msg.type, '[' + this.task.getName() + ']');
            this.task.onTaskMessage(msg);
        }
        else {
            console.warn(this.logTag, 'Received message with invalid type from peer:', msg.type);
        }
    }
    handleServerHello(msg, nonce) {
        this.serverKey = new Uint8Array(msg.key);
        let cookie;
        do {
            cookie = new Cookie();
        } while (cookie.equals(nonce.cookie));
        this.cookiePair = new CookiePair(cookie, nonce.cookie);
    }
    sendClientAuth() {
        const message = {
            type: 'client-auth',
            your_cookie: this.cookiePair.theirs.asArrayBuffer(),
            subprotocols: [Signaling.SALTYRTC_SUBPROTOCOL],
        };
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
        console.debug(this.logTag, 'Sending client-auth');
        this.ws.send(packet);
        this.serverHandshakeState = 'auth-sent';
    }
    handleData(msg) {
        this.client.emit({ type: 'data', data: msg.data });
        if (typeof msg.data_type === 'string') {
            this.client.emit({ type: 'data:' + msg.data_type, data: msg.data });
        }
    }
    handleRestart(msg) {
        throw new ProtocolError('Restart messages not yet implemented');
    }
    handleSendError(msg) {
        throw new ProtocolError('Send error messages not yet implemented');
    }
    validateNonce(nonce, destination, source) {
        if (destination !== undefined && nonce.destination !== destination) {
            console.error(this.logTag, 'Nonce destination is', nonce.destination, 'but we\'re', this.address);
            throw 'bad-nonce-destination';
        }
        if (source !== undefined && nonce.source !== source) {
            console.error(this.logTag, 'Nonce source is', nonce.source, 'but should be', source);
            throw 'bad-nonce-source';
        }
    }
    validateRepeatedCookie(msg) {
        const repeatedCookie = Cookie.fromArrayBuffer(msg.your_cookie);
        if (!repeatedCookie.equals(this.cookiePair.ours)) {
            console.debug(this.logTag, 'Their cookie:', repeatedCookie.bytes);
            console.debug(this.logTag, 'Our cookie:', this.cookiePair.ours.bytes);
            throw new ProtocolError('Peer repeated cookie does not match our cookie');
        }
    }
    decodeMessage(data, expectedType, enforce = false) {
        const msg = this.msgpackDecode(data);
        if (msg.type === undefined) {
            throw new ProtocolError('Malformed ' + expectedType + ' message: Failed to decode msgpack data.');
        }
        if (enforce && expectedType !== undefined && msg.type !== expectedType) {
            throw new ProtocolError('Invalid ' + expectedType + ' message, bad type: ' + msg);
        }
        return msg;
    }
    buildPacket(message, receiver, encrypt = true) {
        const csn = this.getNextCsn(receiver);
        const nonce = new Nonce(this.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver);
        const nonceBytes = new Uint8Array(nonce.toArrayBuffer());
        const data = this.msgpackEncode(message);
        if (encrypt === false) {
            return concat(nonceBytes, data);
        }
        let box;
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            box = this.encryptHandshakeDataForServer(data, nonceBytes);
        }
        else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR || isResponderId(receiver)) {
            box = this.encryptHandshakeDataForPeer(receiver, message.type, data, nonceBytes);
        }
        else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
        return box.toUint8Array();
    }
    encryptHandshakeDataForServer(payload, nonceBytes) {
        return this.permanentKey.encrypt(payload, nonceBytes, this.serverKey);
    }
    decryptData(box) {
        const decryptedBytes = this.sessionKey.decrypt(box, this.getPeerSessionKey());
        const start = decryptedBytes.byteOffset;
        const end = start + decryptedBytes.byteLength;
        return decryptedBytes.buffer.slice(start, end);
    }
    resetConnection(closeCode = CloseCode.ClosingNormal) {
        this.setState('new');
        this.serverCsn = new CombinedSequence();
        if (this.ws !== null) {
            console.debug(this.logTag, 'Disconnecting WebSocket (close code ' + closeCode + ')');
            this.ws.close(closeCode);
        }
        this.ws = null;
    }
    initTask(task, data) {
        try {
            task.init(this, data);
        }
        catch (e) {
            if (e instanceof ValidationError) {
                throw new ProtocolError("Peer sent invalid task data");
            }
            throw e;
        }
        this.task = task;
    }
    decryptPeerMessage(box, convertErrors = true) {
        try {
            const decrypted = this.sessionKey.decrypt(box, this.getPeerSessionKey());
            return this.decodeMessage(decrypted, 'peer');
        }
        catch (e) {
            if (convertErrors === true && e === 'decryption-failed') {
                const nonce = Nonce.fromArrayBuffer(box.nonce.buffer);
                throw new ProtocolError('Could not decrypt peer message from ' + byteToHex(nonce.source));
            }
            else {
                throw e;
            }
        }
    }
    decryptServerMessage(box) {
        try {
            const decrypted = this.permanentKey.decrypt(box, this.serverKey);
            return this.decodeMessage(decrypted, 'server');
        }
        catch (e) {
            if (e === 'decryption-failed') {
                throw new ProtocolError('Could not decrypt server message');
            }
            else {
                throw e;
            }
        }
    }
    send(payload) {
        if (['server-handshake', 'peer-handshake', 'task'].indexOf(this.state) === -1) {
            console.error('Trying to send message, but connection state is', this.state);
            throw new ConnectionError("Bad signaling state, cannot send message");
        }
        if (this.handoverState.local === false) {
            this.ws.send(payload);
        }
        else {
        }
    }
    sendTaskMessage(msg) {
        const receiver = this.getPeerAddress();
        if (receiver === null) {
            throw new SignalingError(CloseCode.InternalError, 'No peer address could be found');
        }
        const packet = this.buildPacket(msg, receiver);
        this.send(packet);
    }
    encryptForPeer(data, nonce) {
        return this.sessionKey.encrypt(data, nonce, this.getPeerSessionKey());
    }
    decryptFromPeer(box) {
        return this.sessionKey.decrypt(box, this.getPeerSessionKey());
    }
    sendClose(reason) {
    }
}
Signaling.SALTYRTC_SUBPROTOCOL = 'v0.saltyrtc.org';
Signaling.SALTYRTC_ADDR_UNKNOWN = 0x00;
Signaling.SALTYRTC_ADDR_SERVER = 0x00;
Signaling.SALTYRTC_ADDR_INITIATOR = 0x01;

class Peer {
    constructor(permanentKey) {
        this._csn = new CombinedSequence();
        this.permanentKey = permanentKey;
    }
    get id() {
        return this._id;
    }
    get hexId() {
        return byteToHex(this._id);
    }
    get csn() {
        return this._csn;
    }
}
class Initiator extends Peer {
    constructor(permanentKey) {
        super(permanentKey);
        this.connected = false;
        this.handshakeState = 'new';
        this._id = 0x01;
    }
}
class Responder extends Peer {
    constructor(id) {
        super();
        this.keyStore = new KeyStore();
        this.handshakeState = 'new';
        this._id = id;
    }
}

class InitiatorSignaling extends Signaling {
    constructor(client, host, port, tasks, permanentKey, responderTrustedKey) {
        super(client, host, port, tasks, permanentKey, responderTrustedKey);
        this.logTag = 'Initiator:';
        this.responders = null;
        this.responder = null;
        this.role = 'initiator';
        if (responderTrustedKey === undefined) {
            this.authToken = new AuthToken();
        }
    }
    getWebsocketPath() {
        return this.permanentKey.publicKeyHex;
    }
    getNextCsn(receiver) {
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.serverCsn.next();
        }
        else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Initiator cannot send messages to initiator');
        }
        else if (isResponderId(receiver)) {
            if (this.getState() === 'task') {
                return this.responder.csn.next();
            }
            else if (this.responders.has(receiver)) {
                return this.responders.get(receiver).csn.next();
            }
            else {
                throw new ProtocolError('Unknown responder: ' + receiver);
            }
        }
        else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
    }
    encryptHandshakeDataForPeer(receiver, messageType, payload, nonceBytes) {
        if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Initiator cannot encrypt messages for initiator');
        }
        else if (!isResponderId(receiver)) {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
        let responder;
        if (this.getState() === 'task') {
            responder = this.responder;
        }
        else if (this.responders.has(receiver)) {
            responder = this.responders.get(receiver);
        }
        else {
            throw new ProtocolError('Unknown responder: ' + receiver);
        }
        switch (messageType) {
            case 'key':
                return this.permanentKey.encrypt(payload, nonceBytes, responder.permanentKey);
            default:
                return responder.keyStore.encrypt(payload, nonceBytes, responder.sessionKey);
        }
    }
    getPeerAddress() {
        if (this.responder !== null) {
            return this.responder.id;
        }
        return null;
    }
    getPeerSessionKey() {
        if (this.responder !== null) {
            return this.responder.sessionKey;
        }
        return null;
    }
    getPeerPermanentKey() {
        if (this.responder !== null) {
            return this.responder.permanentKey;
        }
        return null;
    }
    processNewResponder(responderId) {
        if (!this.responders.has(responderId)) {
            if (!isResponderId(responderId)) {
                throw new ProtocolError('Invalid responder id: ' + responderId);
            }
            const responder = new Responder(responderId);
            if (this.peerTrustedKey !== null) {
                responder.handshakeState = 'token-received';
                responder.permanentKey = this.peerTrustedKey;
            }
            this.responders.set(responderId, responder);
            this.client.emit({ type: 'new-responder', data: responderId });
        }
        else {
            console.warn(this.logTag, 'Got new-responder message for an already known responder.');
        }
    }
    onPeerHandshakeMessage(box, nonce) {
        if (nonce.destination != this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }
        let payload;
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            payload = decryptKeystore(box, this.permanentKey, this.serverKey, 'server');
            const msg = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-responder':
                    console.debug(this.logTag, 'Received new-responder');
                    this.handleNewResponder(msg);
                    break;
                default:
                    throw new ProtocolError('Received unexpected server message: ' + msg.type);
            }
        }
        else if (isResponderId(nonce.source)) {
            const responder = this.responders.get(nonce.source);
            if (responder === null) {
                throw new ProtocolError('Unknown message sender: ' + nonce.source);
            }
            let msg;
            switch (responder.handshakeState) {
                case 'new':
                    if (this.peerTrustedKey !== null) {
                        throw new SignalingError(CloseCode.InternalError, 'Handshake state is "new" even though a trusted key is available');
                    }
                    try {
                        payload = this.authToken.decrypt(box);
                    }
                    catch (e) {
                        console.warn(this.logTag, 'Could not decrypt token message: ', e);
                        this.dropResponder(responder.id);
                        return;
                    }
                    msg = this.decodeMessage(payload, 'token', true);
                    console.debug(this.logTag, 'Received token');
                    this.handleToken(msg, responder);
                    break;
                case 'token-received':
                    const peerPublicKey = this.peerTrustedKey || responder.permanentKey;
                    try {
                        payload = this.permanentKey.decrypt(box, peerPublicKey);
                    }
                    catch (e) {
                        if (this.peerTrustedKey !== null) {
                            console.warn(this.logTag, 'Could not decrypt key message');
                            this.dropResponder(responder.id);
                            return;
                        }
                        throw e;
                    }
                    msg = this.decodeMessage(payload, 'key', true);
                    console.debug(this.logTag, 'Received key');
                    this.handleKey(msg, responder);
                    this.sendKey(responder);
                    break;
                case 'key-sent':
                    payload = decryptKeystore(box, responder.keyStore, responder.sessionKey, 'auth');
                    msg = this.decodeMessage(payload, 'auth', true);
                    console.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg, responder, nonce);
                    this.sendAuth(responder, nonce);
                    this.responder = this.responders.get(responder.id);
                    this.sessionKey = responder.keyStore;
                    this.responders.delete(responder.id);
                    this.dropResponders();
                    this.setState('task');
                    console.info(this.logTag, 'Peer handshake done');
                    this.task.onPeerHandshakeDone();
                    break;
                default:
                    throw new SignalingError(CloseCode.InternalError, 'Unknown responder handshake state');
            }
        }
        else {
            throw new SignalingError(CloseCode.InternalError, 'Message source is neither the server nor a responder');
        }
    }
    sendClientHello() {
    }
    handleServerAuth(msg, nonce) {
        this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
        this.validateNonce(nonce, this.address, Signaling.SALTYRTC_ADDR_SERVER);
        this.validateRepeatedCookie(msg);
        this.responders = new Map();
        for (let id of msg.responders) {
            this.processNewResponder(id);
        }
        console.debug(this.logTag, this.responders.size, 'responders connected');
        this.serverHandshakeState = 'done';
    }
    initPeerHandshake() {
    }
    handleNewResponder(msg) {
        this.processNewResponder(msg.id);
    }
    handleToken(msg, responder) {
        responder.permanentKey = new Uint8Array(msg.key);
        responder.handshakeState = 'token-received';
    }
    handleKey(msg, responder) {
        responder.sessionKey = new Uint8Array(msg.key);
        responder.handshakeState = 'key-received';
    }
    sendKey(responder) {
        const message = {
            type: 'key',
            key: responder.keyStore.publicKeyBytes.buffer,
        };
        const packet = this.buildPacket(message, responder.id);
        console.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        responder.handshakeState = 'key-sent';
    }
    sendAuth(responder, nonce) {
        if (nonce.cookie.equals(this.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
        }
        const taskData = {};
        taskData[this.task.getName()] = this.task.getData();
        const message = {
            type: 'auth',
            your_cookie: nonce.cookie.asArrayBuffer(),
            task: this.task.getName(),
            data: taskData,
        };
        const packet = this.buildPacket(message, responder.id);
        console.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        responder.handshakeState = 'auth-sent';
    }
    handleAuth(msg, responder, nonce) {
        this.validateRepeatedCookie(msg);
        try {
            InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
        }
        catch (e) {
            if (e instanceof ValidationError) {
                throw new ProtocolError("Peer sent invalid task info: " + e.message);
            }
            throw e;
        }
        const task = InitiatorSignaling.chooseCommonTask(this.tasks, msg.tasks);
        if (task === null) {
            throw new SignalingError(CloseCode.NoSharedTask, "No shared task could be found");
        }
        else {
            console.log(this.logTag, "Task", task.getName(), "has been selected");
        }
        this.initTask(task, msg.data[task.getName()]);
        console.debug(this.logTag, 'Responder', responder.hexId, 'authenticated');
        if (nonce.cookie.equals(this.cookiePair.ours)) {
            throw new ProtocolError('Local and remote cookies are equal');
        }
        responder.cookie = nonce.cookie;
        responder.handshakeState = 'auth-received';
    }
    static validateTaskInfo(names, data) {
        if (names.length < 1) {
            throw new ValidationError("Task names must not be empty");
        }
        if (Object.keys(data).length < 1) {
            throw new ValidationError("Task data must not be empty");
        }
        if (names.length != Object.keys(data).length) {
            throw new ValidationError("Task data must contain an entry for every task");
        }
        for (let task of names) {
            if (!data.hasOwnProperty(task)) {
                throw new ValidationError("Task data must contain an entry for every task");
            }
        }
    }
    static chooseCommonTask(ourTasks, theirTasks) {
        for (let task of ourTasks) {
            if (theirTasks.indexOf(task.getName()) !== -1) {
                return task;
            }
        }
        return null;
    }
    dropResponders() {
        console.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
        for (let id of this.responders.keys()) {
            this.dropResponder(id);
        }
    }
    dropResponder(responderId) {
        const message = {
            type: 'drop-responder',
            id: responderId,
        };
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
        console.debug(this.logTag, 'Sending drop-responder', byteToHex(responderId));
        this.ws.send(packet);
        this.responders.delete(responderId);
    }
}

class ResponderSignaling extends Signaling {
    constructor(client, host, port, tasks, permanentKey, initiatorPubKey, authToken) {
        super(client, host, port, tasks, permanentKey, authToken === undefined ? initiatorPubKey : undefined);
        this.logTag = 'Responder:';
        this.initiator = null;
        this.role = 'responder';
        this.initiator = new Initiator(initiatorPubKey);
        if (authToken !== undefined) {
            this.authToken = authToken;
        }
        else {
            this.initiator.handshakeState = 'token-sent';
        }
    }
    getWebsocketPath() {
        return u8aToHex(this.initiator.permanentKey);
    }
    getNextCsn(receiver) {
        if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
            return this.serverCsn.next();
        }
        else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
            return this.initiator.csn.next();
        }
        else if (isResponderId(receiver)) {
            throw new ProtocolError('Responder may not send messages to other responders: ' + receiver);
        }
        else {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
    }
    encryptHandshakeDataForPeer(receiver, messageType, payload, nonceBytes) {
        if (isResponderId(receiver)) {
            throw new ProtocolError('Responder may not encrypt messages for other responders: ' + receiver);
        }
        else if (receiver !== Signaling.SALTYRTC_ADDR_INITIATOR) {
            throw new ProtocolError('Bad receiver byte: ' + receiver);
        }
        switch (messageType) {
            case 'token':
                return this.authToken.encrypt(payload, nonceBytes);
            case 'key':
                return this.permanentKey.encrypt(payload, nonceBytes, this.initiator.permanentKey);
            default:
                const peerSessionKey = this.getPeerSessionKey();
                if (peerSessionKey === null) {
                    throw new ProtocolError('Trying to encrypt for peer using session key, but session key is null');
                }
                return this.sessionKey.encrypt(payload, nonceBytes, peerSessionKey);
        }
    }
    getPeerAddress() {
        if (this.initiator !== null) {
            return this.initiator.id;
        }
        return null;
    }
    getPeerSessionKey() {
        if (this.initiator !== null) {
            return this.initiator.sessionKey;
        }
        return null;
    }
    getPeerPermanentKey() {
        if (this.initiator !== null) {
            return this.initiator.permanentKey;
        }
        return null;
    }
    onPeerHandshakeMessage(box, nonce) {
        if (nonce.destination != this.address) {
            throw new ProtocolError('Message destination does not match our address');
        }
        let payload;
        if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
            payload = decryptKeystore(box, this.permanentKey, this.serverKey, 'server');
            const msg = this.decodeMessage(payload, 'server');
            switch (msg.type) {
                case 'new-initiator':
                    console.debug(this.logTag, 'Received new-initiator');
                    this.handleNewInitiator(msg);
                    break;
                default:
                    throw new ProtocolError('Received unexpected server message: ' + msg.type);
            }
        }
        else if (nonce.source === Signaling.SALTYRTC_ADDR_INITIATOR) {
            payload = this.decryptInitiatorMessage(box);
            let msg;
            switch (this.initiator.handshakeState) {
                case 'new':
                    throw new ProtocolError('Unexpected peer handshake message');
                case 'key-sent':
                    msg = this.decodeMessage(payload, 'key', true);
                    console.debug(this.logTag, 'Received key');
                    this.handleKey(msg);
                    this.sendAuth(nonce);
                    break;
                case 'auth-sent':
                    msg = this.decodeMessage(payload, 'auth', true);
                    console.debug(this.logTag, 'Received auth');
                    this.handleAuth(msg, nonce);
                    this.setState('task');
                    console.info(this.logTag, 'Peer handshake done');
                    break;
                default:
                    throw new SignalingError(CloseCode.InternalError, 'Unknown initiator handshake state');
            }
        }
        else {
            throw new SignalingError(CloseCode.InternalError, 'Message source is neither the server nor the initiator');
        }
    }
    decryptInitiatorMessage(box) {
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
    sendClientHello() {
        const message = {
            type: 'client-hello',
            key: this.permanentKey.publicKeyBytes.buffer,
        };
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER, false);
        console.debug(this.logTag, 'Sending client-hello');
        this.ws.send(packet);
        this.serverHandshakeState = 'hello-sent';
    }
    handleServerAuth(msg, nonce) {
        this.validateNonce(nonce, undefined, Signaling.SALTYRTC_ADDR_SERVER);
        if (nonce.destination > 0xff || nonce.destination < 0x02) {
            console.error(this.logTag, 'Invalid nonce destination:', nonce.destination);
            throw 'bad-nonce-destination';
        }
        this.address = nonce.destination;
        console.debug(this.logTag, 'Server assigned address', byteToHex(this.address));
        this.logTag = 'Responder[' + byteToHex(this.address) + ']:';
        this.validateRepeatedCookie(msg);
        this.initiator.connected = msg.initiator_connected;
        console.debug(this.logTag, 'Initiator', this.initiator.connected ? '' : 'not', 'connected');
        this.serverHandshakeState = 'done';
    }
    handleNewInitiator(msg) {
        this.initiator.connected = true;
        this.initPeerHandshake();
    }
    initPeerHandshake() {
        if (this.initiator.connected) {
            if (this.peerTrustedKey === null) {
                this.sendToken();
            }
            this.sendKey();
        }
    }
    sendToken() {
        const message = {
            type: 'token',
            key: this.permanentKey.publicKeyBytes.buffer,
        };
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending token');
        this.ws.send(packet);
        this.initiator.handshakeState = 'token-sent';
    }
    sendKey() {
        this.sessionKey = new KeyStore();
        const replyMessage = {
            type: 'key',
            key: this.sessionKey.publicKeyBytes.buffer,
        };
        const packet = this.buildPacket(replyMessage, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending key');
        this.ws.send(packet);
        this.initiator.handshakeState = 'key-sent';
    }
    handleKey(msg) {
        this.initiator.sessionKey = new Uint8Array(msg.key);
        this.initiator.handshakeState = 'key-received';
    }
    sendAuth(nonce) {
        if (nonce.cookie.equals(this.cookiePair.ours)) {
            throw new ProtocolError('Their cookie and our cookie are the same.');
        }
        const taskData = {};
        for (let task of this.tasks) {
            taskData[task.getName()] = task.getData();
        }
        const taskNames = this.tasks.map((task) => task.getName());
        const message = {
            type: 'auth',
            your_cookie: nonce.cookie.asArrayBuffer(),
            tasks: taskNames,
            data: taskData,
        };
        const packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
        console.debug(this.logTag, 'Sending auth');
        this.ws.send(packet);
        this.initiator.handshakeState = 'auth-sent';
    }
    handleAuth(msg, nonce) {
        this.validateRepeatedCookie(msg);
        try {
            ResponderSignaling.validateTaskInfo(msg.task, msg.data);
        }
        catch (e) {
            if (e instanceof ValidationError) {
                throw new ProtocolError("Peer sent invalid task info: " + e.message);
            }
            throw e;
        }
        let selectedTask = null;
        for (let task of this.tasks) {
            if (task.getName() === msg.task) {
                selectedTask = task;
                console.info(this.logTag, "Task", msg.task, "has been selected");
                break;
            }
        }
        if (selectedTask === null) {
            throw new SignalingError(CloseCode.ProtocolError, "Initiator selected unknown task");
        }
        else {
            this.initTask(selectedTask, msg.data[selectedTask.getName()]);
        }
        console.debug(this.logTag, 'Initiator authenticated');
        this.initiator.cookie = nonce.cookie;
        this.initiator.handshakeState = 'auth-received';
    }
    static validateTaskInfo(name, data) {
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
}

class EventRegistry {
    constructor() {
        this.map = new Map();
    }
    register(eventType, handler) {
        if (typeof eventType === 'string') {
            this.set(eventType, handler);
        }
        else {
            for (let et of eventType) {
                this.set(et, handler);
            }
        }
    }
    unregister(eventType, handler) {
        if (typeof eventType === 'string') {
            if (!this.map.has(eventType)) {
                return;
            }
            if (typeof handler === 'undefined') {
                this.map.delete(eventType);
            }
            else {
                const list = this.map.get(eventType);
                const index = list.indexOf(handler);
                if (index !== -1) {
                    list.splice(index, 1);
                }
            }
        }
        else {
            for (let et of eventType) {
                this.unregister(et, handler);
            }
        }
    }
    set(key, value) {
        if (this.map.has(key)) {
            const list = this.map.get(key);
            if (list.indexOf(value) === -1) {
                list.push(value);
            }
        }
        else {
            this.map.set(key, [value]);
        }
    }
    get(eventType) {
        const handlers = [];
        if (typeof eventType === 'string') {
            if (this.map.has(eventType)) {
                handlers.push.apply(handlers, this.map.get(eventType));
            }
        }
        else {
            for (let et of eventType) {
                for (let handler of this.get(et)) {
                    if (handlers.indexOf(handler) === -1) {
                        handlers.push(handler);
                    }
                }
            }
        }
        return handlers;
    }
}

class SaltyRTCBuilder {
    constructor() {
        this.hasConnectionInfo = false;
        this.hasKeyStore = false;
        this.hasInitiatorInfo = false;
        this.hasTrustedPeerKey = false;
        this.hasTasks = false;
    }
    validateHost(host) {
        if (host.endsWith('/')) {
            throw new Error('SaltyRTC host may not end with a slash');
        }
        if (host.indexOf('//') !== -1) {
            throw new Error('SaltyRTC host should not contain protocol');
        }
    }
    requireKeyStore() {
        if (!this.hasKeyStore) {
            throw new Error("Keys not set yet. Please call .withKeyStore method first.");
        }
    }
    requireConnectionInfo() {
        if (!this.hasConnectionInfo) {
            throw new Error("Connection info not set yet. Please call .connectTo method first.");
        }
    }
    requireTasks() {
        if (!this.hasTasks) {
            throw new Error("Tasks not set yet. Please call .usingTasks method first.");
        }
    }
    requireInitiatorInfo() {
        if (!this.hasInitiatorInfo) {
            throw new Error("Initiator info not set yet. Please call .initiatorInfo method first.");
        }
    }
    connectTo(host, port = 8765) {
        this.validateHost(host);
        this.host = host;
        this.port = port;
        this.hasConnectionInfo = true;
        return this;
    }
    withKeyStore(keyStore) {
        this.keyStore = keyStore;
        this.hasKeyStore = true;
        return this;
    }
    withTrustedPeerKey(peerTrustedKey) {
        this.peerTrustedKey = peerTrustedKey;
        this.hasTrustedPeerKey = true;
        return this;
    }
    usingTasks(tasks) {
        if (tasks.length < 1) {
            throw new Error("You must specify at least 1 task");
        }
        this.tasks = tasks;
        this.hasTasks = true;
        return this;
    }
    initiatorInfo(initiatorPublicKey, authToken) {
        this.initiatorPublicKey = initiatorPublicKey;
        this.authToken = authToken;
        this.hasInitiatorInfo = true;
        return this;
    }
    asInitiator() {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasTrustedPeerKey) {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks, this.peerTrustedKey)
                .asInitiator();
        }
        else {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks)
                .asInitiator();
        }
    }
    asResponder() {
        this.requireConnectionInfo();
        this.requireKeyStore();
        this.requireTasks();
        if (this.hasTrustedPeerKey) {
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks, this.peerTrustedKey)
                .asResponder();
        }
        else {
            this.requireInitiatorInfo();
            return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks)
                .asResponder(this.initiatorPublicKey, this.authToken);
        }
    }
}
class SaltyRTC {
    constructor(permanentKey, host, port, tasks, peerTrustedKey) {
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
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
        this.eventRegistry = new EventRegistry();
    }
    asInitiator() {
        if (this.peerTrustedKey !== null) {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.tasks, this.permanentKey, this.peerTrustedKey);
        }
        else {
            this._signaling = new InitiatorSignaling(this, this.host, this.port, this.tasks, this.permanentKey);
        }
        return this;
    }
    asResponder(initiatorPubKey, authToken) {
        if (this.peerTrustedKey !== null) {
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.tasks, this.permanentKey, this.peerTrustedKey);
        }
        else {
            const token = new AuthToken(authToken);
            this._signaling = new ResponderSignaling(this, this.host, this.port, this.tasks, this.permanentKey, initiatorPubKey, token);
        }
        return this;
    }
    get signaling() {
        if (this._signaling === null) {
            throw Error('SaltyRTC instance not initialized. Use .asInitiator() or .asResponder().');
        }
        return this._signaling;
    }
    get state() {
        return this.signaling.getState();
    }
    get keyStore() {
        return this.permanentKey;
    }
    get permanentKeyBytes() {
        return this.signaling.permanentKeyBytes;
    }
    get permanentKeyHex() {
        return u8aToHex(this.signaling.permanentKeyBytes);
    }
    get authTokenBytes() {
        return this.signaling.authTokenBytes;
    }
    get authTokenHex() {
        return u8aToHex(this.signaling.authTokenBytes);
    }
    get peerPermanentKeyBytes() {
        return this.signaling.peerPermanentKeyBytes;
    }
    get peerPermanentKeyHex() {
        return u8aToHex(this.signaling.peerPermanentKeyBytes);
    }
    getTask() {
        return this.signaling.task;
    }
    connect() {
        this.signaling.connect();
    }
    disconnect() {
        this.signaling.disconnect();
    }
    on(event, handler) {
        this.eventRegistry.register(event, handler);
    }
    once(event, handler) {
        const onceHandler = (ev) => {
            try {
                handler(ev);
            }
            catch (e) {
                this.off(ev.type, onceHandler);
                throw e;
            }
            this.off(ev.type, onceHandler);
        };
        this.eventRegistry.register(event, onceHandler);
    }
    off(event, handler) {
        this.eventRegistry.unregister(event, handler);
    }
    emit(event) {
        console.debug('SaltyRTC: New event:', event.type);
        const handlers = this.eventRegistry.get(event.type);
        for (let handler of handlers) {
            try {
                this.callHandler(handler, event);
            }
            catch (e) {
                console.error('SaltyRTC: Unhandled exception in', event.type, 'handler:', e);
            }
        }
    }
    callHandler(handler, event) {
        const response = handler(event);
        if (response === false) {
            this.eventRegistry.unregister(event.type, handler);
        }
    }
}

export { SaltyRTCBuilder, KeyStore, Box, Cookie, CookiePair, CombinedSequence, CombinedSequencePair, EventRegistry };
