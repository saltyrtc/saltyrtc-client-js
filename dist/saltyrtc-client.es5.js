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

this.saltyrtc = this.saltyrtc || {};
(function (exports) {
'use strict';

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r);}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function (global){
"use strict";

_dereq_(295);

_dereq_(296);

_dereq_(2);

if (global._babelPolyfill) {
  throw new Error("only one instance of babel-polyfill is allowed");
}
global._babelPolyfill = true;

var DEFINE_PROPERTY = "defineProperty";
function define(O, key, value) {
  O[key] || Object[DEFINE_PROPERTY](O, key, {
    writable: true,
    configurable: true,
    value: value
  });
}

define(String.prototype, "padLeft", "".padStart);
define(String.prototype, "padRight", "".padEnd);

"pop,reverse,shift,keys,values,entries,indexOf,every,some,forEach,map,filter,find,findIndex,includes,join,slice,concat,push,splice,unshift,sort,lastIndexOf,reduce,reduceRight,copyWithin,fill".split(",").forEach(function (key) {
  [][key] && define(Array, key, Function.call.bind([][key]));
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
},{"2":2,"295":295,"296":296}],2:[function(_dereq_,module,exports){
_dereq_(119);
module.exports = _dereq_(23).RegExp.escape;
},{"119":119,"23":23}],3:[function(_dereq_,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],4:[function(_dereq_,module,exports){
var cof = _dereq_(18);
module.exports = function(it, msg){
  if(typeof it != 'number' && cof(it) != 'Number')throw TypeError(msg);
  return +it;
};
},{"18":18}],5:[function(_dereq_,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _dereq_(117)('unscopables')
  , ArrayProto  = Array.prototype;
if(ArrayProto[UNSCOPABLES] == undefined)_dereq_(40)(ArrayProto, UNSCOPABLES, {});
module.exports = function(key){
  ArrayProto[UNSCOPABLES][key] = true;
};
},{"117":117,"40":40}],6:[function(_dereq_,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],7:[function(_dereq_,module,exports){
var isObject = _dereq_(49);
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"49":49}],8:[function(_dereq_,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
'use strict';
var toObject = _dereq_(109)
  , toIndex  = _dereq_(105)
  , toLength = _dereq_(108);

module.exports = [].copyWithin || function copyWithin(target/*= 0*/, start/*= 0, end = @length*/){
  var O     = toObject(this)
    , len   = toLength(O.length)
    , to    = toIndex(target, len)
    , from  = toIndex(start, len)
    , end   = arguments.length > 2 ? arguments[2] : undefined
    , count = Math.min((end === undefined ? len : toIndex(end, len)) - from, len - to)
    , inc   = 1;
  if(from < to && to < from + count){
    inc  = -1;
    from += count - 1;
    to   += count - 1;
  }
  while(count-- > 0){
    if(from in O)O[to] = O[from];
    else delete O[to];
    to   += inc;
    from += inc;
  } return O;
};
},{"105":105,"108":108,"109":109}],9:[function(_dereq_,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
'use strict';
var toObject = _dereq_(109)
  , toIndex  = _dereq_(105)
  , toLength = _dereq_(108);
module.exports = function fill(value /*, start = 0, end = @length */){
  var O      = toObject(this)
    , length = toLength(O.length)
    , aLen   = arguments.length
    , index  = toIndex(aLen > 1 ? arguments[1] : undefined, length)
    , end    = aLen > 2 ? arguments[2] : undefined
    , endPos = end === undefined ? length : toIndex(end, length);
  while(endPos > index)O[index++] = value;
  return O;
};
},{"105":105,"108":108,"109":109}],10:[function(_dereq_,module,exports){
var forOf = _dereq_(37);

module.exports = function(iter, ITERATOR){
  var result = [];
  forOf(iter, false, result.push, result, ITERATOR);
  return result;
};

},{"37":37}],11:[function(_dereq_,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = _dereq_(107)
  , toLength  = _dereq_(108)
  , toIndex   = _dereq_(105);
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"105":105,"107":107,"108":108}],12:[function(_dereq_,module,exports){
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var ctx      = _dereq_(25)
  , IObject  = _dereq_(45)
  , toObject = _dereq_(109)
  , toLength = _dereq_(108)
  , asc      = _dereq_(15);
module.exports = function(TYPE, $create){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
    , create        = $create || asc;
  return function($this, callbackfn, that){
    var O      = toObject($this)
      , self   = IObject(O)
      , f      = ctx(callbackfn, that, 3)
      , length = toLength(self.length)
      , index  = 0
      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"108":108,"109":109,"15":15,"25":25,"45":45}],13:[function(_dereq_,module,exports){
var aFunction = _dereq_(3)
  , toObject  = _dereq_(109)
  , IObject   = _dereq_(45)
  , toLength  = _dereq_(108);

module.exports = function(that, callbackfn, aLen, memo, isRight){
  aFunction(callbackfn);
  var O      = toObject(that)
    , self   = IObject(O)
    , length = toLength(O.length)
    , index  = isRight ? length - 1 : 0
    , i      = isRight ? -1 : 1;
  if(aLen < 2)for(;;){
    if(index in self){
      memo = self[index];
      index += i;
      break;
    }
    index += i;
    if(isRight ? index < 0 : length <= index){
      throw TypeError('Reduce of empty array with no initial value');
    }
  }
  for(;isRight ? index >= 0 : length > index; index += i)if(index in self){
    memo = callbackfn(memo, self[index], index, O);
  }
  return memo;
};
},{"108":108,"109":109,"3":3,"45":45}],14:[function(_dereq_,module,exports){
var isObject = _dereq_(49)
  , isArray  = _dereq_(47)
  , SPECIES  = _dereq_(117)('species');

module.exports = function(original){
  var C;
  if(isArray(original)){
    C = original.constructor;
    // cross-realm fallback
    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
    if(isObject(C)){
      C = C[SPECIES];
      if(C === null)C = undefined;
    }
  } return C === undefined ? Array : C;
};
},{"117":117,"47":47,"49":49}],15:[function(_dereq_,module,exports){
// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
var speciesConstructor = _dereq_(14);

module.exports = function(original, length){
  return new (speciesConstructor(original))(length);
};
},{"14":14}],16:[function(_dereq_,module,exports){
'use strict';
var aFunction  = _dereq_(3)
  , isObject   = _dereq_(49)
  , invoke     = _dereq_(44)
  , arraySlice = [].slice
  , factories  = {};

var construct = function(F, len, args){
  if(!(len in factories)){
    for(var n = [], i = 0; i < len; i++)n[i] = 'a[' + i + ']';
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  } return factories[len](F, args);
};

module.exports = Function.bind || function bind(that /*, args... */){
  var fn       = aFunction(this)
    , partArgs = arraySlice.call(arguments, 1);
  var bound = function(/* args... */){
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : invoke(fn, args, that);
  };
  if(isObject(fn.prototype))bound.prototype = fn.prototype;
  return bound;
};
},{"3":3,"44":44,"49":49}],17:[function(_dereq_,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = _dereq_(18)
  , TAG = _dereq_(117)('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"117":117,"18":18}],18:[function(_dereq_,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],19:[function(_dereq_,module,exports){
'use strict';
var dP          = _dereq_(67).f
  , create      = _dereq_(66)
  , redefineAll = _dereq_(86)
  , ctx         = _dereq_(25)
  , anInstance  = _dereq_(6)
  , defined     = _dereq_(27)
  , forOf       = _dereq_(37)
  , $iterDefine = _dereq_(53)
  , step        = _dereq_(55)
  , setSpecies  = _dereq_(91)
  , DESCRIPTORS = _dereq_(28)
  , fastKey     = _dereq_(62).fastKey
  , SIZE        = DESCRIPTORS ? '_s' : 'size';

var getEntry = function(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index !== 'F')return that._i[index];
  // frozen object case
  for(entry = that._f; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = create(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear(){
        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that._f == entry)that._f = next;
          if(that._l == entry)that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /*, that = undefined */){
        anInstance(this, C, 'forEach');
        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
          , entry;
        while(entry = entry ? entry.n : this._f){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key){
        return !!getEntry(this, key);
      }
    });
    if(DESCRIPTORS)dP(C.prototype, 'size', {
      get: function(){
        return defined(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that._f)that._f = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index !== 'F')that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function(C, NAME, IS_MAP){
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    $iterDefine(C, NAME, function(iterated, kind){
      this._t = iterated;  // target
      this._k = kind;      // kind
      this._l = undefined; // previous
    }, function(){
      var that  = this
        , kind  = that._k
        , entry = that._l;
      // revert to the last existing entry
      while(entry && entry.r)entry = entry.p;
      // get next entry
      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
        // or finish the iteration
        that._t = undefined;
        return step(1);
      }
      // return step by kind
      if(kind == 'keys'  )return step(0, entry.k);
      if(kind == 'values')return step(0, entry.v);
      return step(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(NAME);
  }
};
},{"25":25,"27":27,"28":28,"37":37,"53":53,"55":55,"6":6,"62":62,"66":66,"67":67,"86":86,"91":91}],20:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var classof = _dereq_(17)
  , from    = _dereq_(10);
module.exports = function(NAME){
  return function toJSON(){
    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
    return from(this);
  };
};
},{"10":10,"17":17}],21:[function(_dereq_,module,exports){
'use strict';
var redefineAll       = _dereq_(86)
  , getWeak           = _dereq_(62).getWeak
  , anObject          = _dereq_(7)
  , isObject          = _dereq_(49)
  , anInstance        = _dereq_(6)
  , forOf             = _dereq_(37)
  , createArrayMethod = _dereq_(12)
  , $has              = _dereq_(39)
  , arrayFind         = createArrayMethod(5)
  , arrayFindIndex    = createArrayMethod(6)
  , id                = 0;

// fallback for uncaught frozen keys
var uncaughtFrozenStore = function(that){
  return that._l || (that._l = new UncaughtFrozenStore);
};
var UncaughtFrozenStore = function(){
  this.a = [];
};
var findUncaughtFrozen = function(store, key){
  return arrayFind(store.a, function(it){
    return it[0] === key;
  });
};
UncaughtFrozenStore.prototype = {
  get: function(key){
    var entry = findUncaughtFrozen(this, key);
    if(entry)return entry[1];
  },
  has: function(key){
    return !!findUncaughtFrozen(this, key);
  },
  set: function(key, value){
    var entry = findUncaughtFrozen(this, key);
    if(entry)entry[1] = value;
    else this.a.push([key, value]);
  },
  'delete': function(key){
    var index = arrayFindIndex(this.a, function(it){
      return it[0] === key;
    });
    if(~index)this.a.splice(index, 1);
    return !!~index;
  }
};

module.exports = {
  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
    var C = wrapper(function(that, iterable){
      anInstance(that, C, NAME, '_i');
      that._i = id++;      // collection id
      that._l = undefined; // leak store for uncaught frozen objects
      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
    });
    redefineAll(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this)['delete'](key);
        return data && $has(data, this._i) && delete data[this._i];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function has(key){
        if(!isObject(key))return false;
        var data = getWeak(key);
        if(data === true)return uncaughtFrozenStore(this).has(key);
        return data && $has(data, this._i);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var data = getWeak(anObject(key), true);
    if(data === true)uncaughtFrozenStore(that).set(key, value);
    else data[that._i] = value;
    return that;
  },
  ufstore: uncaughtFrozenStore
};
},{"12":12,"37":37,"39":39,"49":49,"6":6,"62":62,"7":7,"86":86}],22:[function(_dereq_,module,exports){
'use strict';
var global            = _dereq_(38)
  , $export           = _dereq_(32)
  , redefine          = _dereq_(87)
  , redefineAll       = _dereq_(86)
  , meta              = _dereq_(62)
  , forOf             = _dereq_(37)
  , anInstance        = _dereq_(6)
  , isObject          = _dereq_(49)
  , fails             = _dereq_(34)
  , $iterDetect       = _dereq_(54)
  , setToStringTag    = _dereq_(92)
  , inheritIfRequired = _dereq_(43);

module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
  var Base  = global[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  var fixMethod = function(KEY){
    var fn = proto[KEY];
    redefine(proto, KEY,
      KEY == 'delete' ? function(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a){
        return IS_WEAK && !isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a){
        return IS_WEAK && !isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a){ fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b){ fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if(typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
    new C().entries().next();
  }))){
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    redefineAll(C.prototype, methods);
    meta.NEED = true;
  } else {
    var instance             = new C
      // early implementations not supports chaining
      , HASNT_CHAINING       = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance
      // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
      , THROWS_ON_PRIMITIVES = fails(function(){ instance.has(1); })
      // most early implementations doesn't supports iterables, most modern - not close it correctly
      , ACCEPT_ITERABLES     = $iterDetect(function(iter){ new C(iter); }) // eslint-disable-line no-new
      // for early implementations -0 and +0 not the same
      , BUGGY_ZERO = !IS_WEAK && fails(function(){
        // V8 ~ Chromium 42- fails only with 5+ elements
        var $instance = new C()
          , index     = 5;
        while(index--)$instance[ADDER](index, index);
        return !$instance.has(-0);
      });
    if(!ACCEPT_ITERABLES){ 
      C = wrapper(function(target, iterable){
        anInstance(target, C, NAME);
        var that = inheritIfRequired(new Base, target, C);
        if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if(THROWS_ON_PRIMITIVES || BUGGY_ZERO){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if(BUGGY_ZERO || HASNT_CHAINING)fixMethod(ADDER);
    // weak collections should not contains .clear method
    if(IS_WEAK && proto.clear)delete proto.clear;
  }

  setToStringTag(C, NAME);

  O[NAME] = C;
  $export($export.G + $export.W + $export.F * (C != Base), O);

  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

  return C;
};
},{"32":32,"34":34,"37":37,"38":38,"43":43,"49":49,"54":54,"6":6,"62":62,"86":86,"87":87,"92":92}],23:[function(_dereq_,module,exports){
var core = module.exports = {version: '2.4.0'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],24:[function(_dereq_,module,exports){
'use strict';
var $defineProperty = _dereq_(67)
  , createDesc      = _dereq_(85);

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"67":67,"85":85}],25:[function(_dereq_,module,exports){
// optional / simple context binding
var aFunction = _dereq_(3);
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"3":3}],26:[function(_dereq_,module,exports){
'use strict';
var anObject    = _dereq_(7)
  , toPrimitive = _dereq_(110)
  , NUMBER      = 'number';

module.exports = function(hint){
  if(hint !== 'string' && hint !== NUMBER && hint !== 'default')throw TypeError('Incorrect hint');
  return toPrimitive(anObject(this), hint != NUMBER);
};
},{"110":110,"7":7}],27:[function(_dereq_,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],28:[function(_dereq_,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !_dereq_(34)(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"34":34}],29:[function(_dereq_,module,exports){
var isObject = _dereq_(49)
  , document = _dereq_(38).document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"38":38,"49":49}],30:[function(_dereq_,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],31:[function(_dereq_,module,exports){
// all enumerable object keys, includes symbols
var getKeys = _dereq_(76)
  , gOPS    = _dereq_(73)
  , pIE     = _dereq_(77);
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"73":73,"76":76,"77":77}],32:[function(_dereq_,module,exports){
var global    = _dereq_(38)
  , core      = _dereq_(23)
  , hide      = _dereq_(40)
  , redefine  = _dereq_(87)
  , ctx       = _dereq_(25)
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE]
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE] || (exports[PROTOTYPE] = {})
    , key, own, out, exp;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if(target)redefine(target, key, out, type & $export.U);
    // export
    if(exports[key] != out)hide(exports, key, exp);
    if(IS_PROTO && expProto[key] != out)expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"23":23,"25":25,"38":38,"40":40,"87":87}],33:[function(_dereq_,module,exports){
var MATCH = _dereq_(117)('match');
module.exports = function(KEY){
  var re = /./;
  try {
    '/./'[KEY](re);
  } catch(e){
    try {
      re[MATCH] = false;
      return !'/./'[KEY](re);
    } catch(f){ /* empty */ }
  } return true;
};
},{"117":117}],34:[function(_dereq_,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],35:[function(_dereq_,module,exports){
'use strict';
var hide     = _dereq_(40)
  , redefine = _dereq_(87)
  , fails    = _dereq_(34)
  , defined  = _dereq_(27)
  , wks      = _dereq_(117);

module.exports = function(KEY, length, exec){
  var SYMBOL   = wks(KEY)
    , fns      = exec(defined, SYMBOL, ''[KEY])
    , strfn    = fns[0]
    , rxfn     = fns[1];
  if(fails(function(){
    var O = {};
    O[SYMBOL] = function(){ return 7; };
    return ''[KEY](O) != 7;
  })){
    redefine(String.prototype, KEY, strfn);
    hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function(string, arg){ return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function(string){ return rxfn.call(string, this); }
    );
  }
};
},{"117":117,"27":27,"34":34,"40":40,"87":87}],36:[function(_dereq_,module,exports){
'use strict';
// 21.2.5.3 get RegExp.prototype.flags
var anObject = _dereq_(7);
module.exports = function(){
  var that   = anObject(this)
    , result = '';
  if(that.global)     result += 'g';
  if(that.ignoreCase) result += 'i';
  if(that.multiline)  result += 'm';
  if(that.unicode)    result += 'u';
  if(that.sticky)     result += 'y';
  return result;
};
},{"7":7}],37:[function(_dereq_,module,exports){
var ctx         = _dereq_(25)
  , call        = _dereq_(51)
  , isArrayIter = _dereq_(46)
  , anObject    = _dereq_(7)
  , toLength    = _dereq_(108)
  , getIterFn   = _dereq_(118)
  , BREAK       = {}
  , RETURN      = {};
var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator, result;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if(result === BREAK || result === RETURN)return result;
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    result = call(iterator, f, step.value, entries);
    if(result === BREAK || result === RETURN)return result;
  }
};
exports.BREAK  = BREAK;
exports.RETURN = RETURN;
},{"108":108,"118":118,"25":25,"46":46,"51":51,"7":7}],38:[function(_dereq_,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],39:[function(_dereq_,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],40:[function(_dereq_,module,exports){
var dP         = _dereq_(67)
  , createDesc = _dereq_(85);
module.exports = _dereq_(28) ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"28":28,"67":67,"85":85}],41:[function(_dereq_,module,exports){
module.exports = _dereq_(38).document && document.documentElement;
},{"38":38}],42:[function(_dereq_,module,exports){
module.exports = !_dereq_(28) && !_dereq_(34)(function(){
  return Object.defineProperty(_dereq_(29)('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"28":28,"29":29,"34":34}],43:[function(_dereq_,module,exports){
var isObject       = _dereq_(49)
  , setPrototypeOf = _dereq_(90).set;
module.exports = function(that, target, C){
  var P, S = target.constructor;
  if(S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && isObject(P) && setPrototypeOf){
    setPrototypeOf(that, P);
  } return that;
};
},{"49":49,"90":90}],44:[function(_dereq_,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],45:[function(_dereq_,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = _dereq_(18);
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"18":18}],46:[function(_dereq_,module,exports){
// check on default Array iterator
var Iterators  = _dereq_(56)
  , ITERATOR   = _dereq_(117)('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"117":117,"56":56}],47:[function(_dereq_,module,exports){
// 7.2.2 IsArray(argument)
var cof = _dereq_(18);
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"18":18}],48:[function(_dereq_,module,exports){
// 20.1.2.3 Number.isInteger(number)
var isObject = _dereq_(49)
  , floor    = Math.floor;
module.exports = function isInteger(it){
  return !isObject(it) && isFinite(it) && floor(it) === it;
};
},{"49":49}],49:[function(_dereq_,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],50:[function(_dereq_,module,exports){
// 7.2.8 IsRegExp(argument)
var isObject = _dereq_(49)
  , cof      = _dereq_(18)
  , MATCH    = _dereq_(117)('match');
module.exports = function(it){
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : cof(it) == 'RegExp');
};
},{"117":117,"18":18,"49":49}],51:[function(_dereq_,module,exports){
// call something on iterator step with safe closing on error
var anObject = _dereq_(7);
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"7":7}],52:[function(_dereq_,module,exports){
'use strict';
var create         = _dereq_(66)
  , descriptor     = _dereq_(85)
  , setToStringTag = _dereq_(92)
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_dereq_(40)(IteratorPrototype, _dereq_(117)('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"117":117,"40":40,"66":66,"85":85,"92":92}],53:[function(_dereq_,module,exports){
'use strict';
var LIBRARY        = _dereq_(58)
  , $export        = _dereq_(32)
  , redefine       = _dereq_(87)
  , hide           = _dereq_(40)
  , has            = _dereq_(39)
  , Iterators      = _dereq_(56)
  , $iterCreate    = _dereq_(52)
  , setToStringTag = _dereq_(92)
  , getPrototypeOf = _dereq_(74)
  , ITERATOR       = _dereq_(117)('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"117":117,"32":32,"39":39,"40":40,"52":52,"56":56,"58":58,"74":74,"87":87,"92":92}],54:[function(_dereq_,module,exports){
var ITERATOR     = _dereq_(117)('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"117":117}],55:[function(_dereq_,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],56:[function(_dereq_,module,exports){
module.exports = {};
},{}],57:[function(_dereq_,module,exports){
var getKeys   = _dereq_(76)
  , toIObject = _dereq_(107);
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"107":107,"76":76}],58:[function(_dereq_,module,exports){
module.exports = false;
},{}],59:[function(_dereq_,module,exports){
// 20.2.2.14 Math.expm1(x)
var $expm1 = Math.expm1;
module.exports = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
} : $expm1;
},{}],60:[function(_dereq_,module,exports){
// 20.2.2.20 Math.log1p(x)
module.exports = Math.log1p || function log1p(x){
  return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : Math.log(1 + x);
};
},{}],61:[function(_dereq_,module,exports){
// 20.2.2.28 Math.sign(x)
module.exports = Math.sign || function sign(x){
  return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
};
},{}],62:[function(_dereq_,module,exports){
var META     = _dereq_(114)('meta')
  , isObject = _dereq_(49)
  , has      = _dereq_(39)
  , setDesc  = _dereq_(67).f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !_dereq_(34)(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"114":114,"34":34,"39":39,"49":49,"67":67}],63:[function(_dereq_,module,exports){
var Map     = _dereq_(149)
  , $export = _dereq_(32)
  , shared  = _dereq_(94)('metadata')
  , store   = shared.store || (shared.store = new (_dereq_(255)));

var getOrCreateMetadataMap = function(target, targetKey, create){
  var targetMetadata = store.get(target);
  if(!targetMetadata){
    if(!create)return undefined;
    store.set(target, targetMetadata = new Map);
  }
  var keyMetadata = targetMetadata.get(targetKey);
  if(!keyMetadata){
    if(!create)return undefined;
    targetMetadata.set(targetKey, keyMetadata = new Map);
  } return keyMetadata;
};
var ordinaryHasOwnMetadata = function(MetadataKey, O, P){
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? false : metadataMap.has(MetadataKey);
};
var ordinaryGetOwnMetadata = function(MetadataKey, O, P){
  var metadataMap = getOrCreateMetadataMap(O, P, false);
  return metadataMap === undefined ? undefined : metadataMap.get(MetadataKey);
};
var ordinaryDefineOwnMetadata = function(MetadataKey, MetadataValue, O, P){
  getOrCreateMetadataMap(O, P, true).set(MetadataKey, MetadataValue);
};
var ordinaryOwnMetadataKeys = function(target, targetKey){
  var metadataMap = getOrCreateMetadataMap(target, targetKey, false)
    , keys        = [];
  if(metadataMap)metadataMap.forEach(function(_, key){ keys.push(key); });
  return keys;
};
var toMetaKey = function(it){
  return it === undefined || typeof it == 'symbol' ? it : String(it);
};
var exp = function(O){
  $export($export.S, 'Reflect', O);
};

module.exports = {
  store: store,
  map: getOrCreateMetadataMap,
  has: ordinaryHasOwnMetadata,
  get: ordinaryGetOwnMetadata,
  set: ordinaryDefineOwnMetadata,
  keys: ordinaryOwnMetadataKeys,
  key: toMetaKey,
  exp: exp
};
},{"149":149,"255":255,"32":32,"94":94}],64:[function(_dereq_,module,exports){
var global    = _dereq_(38)
  , macrotask = _dereq_(104).set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = _dereq_(18)(process) == 'process';

module.exports = function(){
  var head, last, notify;

  var flush = function(){
    var parent, fn;
    if(isNode && (parent = process.domain))parent.exit();
    while(head){
      fn   = head.fn;
      head = head.next;
      try {
        fn();
      } catch(e){
        if(head)notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if(parent)parent.enter();
  };

  // Node.js
  if(isNode){
    notify = function(){
      process.nextTick(flush);
    };
  // browsers with MutationObserver
  } else if(Observer){
    var toggle = true
      , node   = document.createTextNode('');
    new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
    notify = function(){
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if(Promise && Promise.resolve){
    var promise = Promise.resolve();
    notify = function(){
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function(){
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function(fn){
    var task = {fn: fn, next: undefined};
    if(last)last.next = task;
    if(!head){
      head = task;
      notify();
    } last = task;
  };
};
},{"104":104,"18":18,"38":38}],65:[function(_dereq_,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = _dereq_(76)
  , gOPS     = _dereq_(73)
  , pIE      = _dereq_(77)
  , toObject = _dereq_(109)
  , IObject  = _dereq_(45)
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || _dereq_(34)(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"109":109,"34":34,"45":45,"73":73,"76":76,"77":77}],66:[function(_dereq_,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = _dereq_(7)
  , dPs         = _dereq_(68)
  , enumBugKeys = _dereq_(30)
  , IE_PROTO    = _dereq_(93)('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _dereq_(29)('iframe')
    , i      = enumBugKeys.length
    , lt     = '<'
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  _dereq_(41).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};

},{"29":29,"30":30,"41":41,"68":68,"7":7,"93":93}],67:[function(_dereq_,module,exports){
var anObject       = _dereq_(7)
  , IE8_DOM_DEFINE = _dereq_(42)
  , toPrimitive    = _dereq_(110)
  , dP             = Object.defineProperty;

exports.f = _dereq_(28) ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"110":110,"28":28,"42":42,"7":7}],68:[function(_dereq_,module,exports){
var dP       = _dereq_(67)
  , anObject = _dereq_(7)
  , getKeys  = _dereq_(76);

module.exports = _dereq_(28) ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"28":28,"67":67,"7":7,"76":76}],69:[function(_dereq_,module,exports){
// Forced replacement prototype accessors methods
module.exports = _dereq_(58)|| !_dereq_(34)(function(){
  var K = Math.random();
  // In FF throws only define methods
  __defineSetter__.call(null, K, function(){ /* empty */});
  delete _dereq_(38)[K];
});
},{"34":34,"38":38,"58":58}],70:[function(_dereq_,module,exports){
var pIE            = _dereq_(77)
  , createDesc     = _dereq_(85)
  , toIObject      = _dereq_(107)
  , toPrimitive    = _dereq_(110)
  , has            = _dereq_(39)
  , IE8_DOM_DEFINE = _dereq_(42)
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = _dereq_(28) ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"107":107,"110":110,"28":28,"39":39,"42":42,"77":77,"85":85}],71:[function(_dereq_,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = _dereq_(107)
  , gOPN      = _dereq_(72).f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"107":107,"72":72}],72:[function(_dereq_,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = _dereq_(75)
  , hiddenKeys = _dereq_(30).concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"30":30,"75":75}],73:[function(_dereq_,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],74:[function(_dereq_,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = _dereq_(39)
  , toObject    = _dereq_(109)
  , IE_PROTO    = _dereq_(93)('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"109":109,"39":39,"93":93}],75:[function(_dereq_,module,exports){
var has          = _dereq_(39)
  , toIObject    = _dereq_(107)
  , arrayIndexOf = _dereq_(11)(false)
  , IE_PROTO     = _dereq_(93)('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"107":107,"11":11,"39":39,"93":93}],76:[function(_dereq_,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = _dereq_(75)
  , enumBugKeys = _dereq_(30);

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"30":30,"75":75}],77:[function(_dereq_,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],78:[function(_dereq_,module,exports){
// most Object methods by ES6 should accept primitives
var $export = _dereq_(32)
  , core    = _dereq_(23)
  , fails   = _dereq_(34);
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"23":23,"32":32,"34":34}],79:[function(_dereq_,module,exports){
var getKeys   = _dereq_(76)
  , toIObject = _dereq_(107)
  , isEnum    = _dereq_(77).f;
module.exports = function(isEntries){
  return function(it){
    var O      = toIObject(it)
      , keys   = getKeys(O)
      , length = keys.length
      , i      = 0
      , result = []
      , key;
    while(length > i)if(isEnum.call(O, key = keys[i++])){
      result.push(isEntries ? [key, O[key]] : O[key]);
    } return result;
  };
};
},{"107":107,"76":76,"77":77}],80:[function(_dereq_,module,exports){
// all object keys, includes non-enumerable and symbols
var gOPN     = _dereq_(72)
  , gOPS     = _dereq_(73)
  , anObject = _dereq_(7)
  , Reflect  = _dereq_(38).Reflect;
module.exports = Reflect && Reflect.ownKeys || function ownKeys(it){
  var keys       = gOPN.f(anObject(it))
    , getSymbols = gOPS.f;
  return getSymbols ? keys.concat(getSymbols(it)) : keys;
};
},{"38":38,"7":7,"72":72,"73":73}],81:[function(_dereq_,module,exports){
var $parseFloat = _dereq_(38).parseFloat
  , $trim       = _dereq_(102).trim;

module.exports = 1 / $parseFloat(_dereq_(103) + '-0') !== -Infinity ? function parseFloat(str){
  var string = $trim(String(str), 3)
    , result = $parseFloat(string);
  return result === 0 && string.charAt(0) == '-' ? -0 : result;
} : $parseFloat;
},{"102":102,"103":103,"38":38}],82:[function(_dereq_,module,exports){
var $parseInt = _dereq_(38).parseInt
  , $trim     = _dereq_(102).trim
  , ws        = _dereq_(103)
  , hex       = /^[\-+]?0[xX]/;

module.exports = $parseInt(ws + '08') !== 8 || $parseInt(ws + '0x16') !== 22 ? function parseInt(str, radix){
  var string = $trim(String(str), 3);
  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
} : $parseInt;
},{"102":102,"103":103,"38":38}],83:[function(_dereq_,module,exports){
'use strict';
var path      = _dereq_(84)
  , invoke    = _dereq_(44)
  , aFunction = _dereq_(3);
module.exports = function(/* ...pargs */){
  var fn     = aFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that = this
      , aLen = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !aLen)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(aLen > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"3":3,"44":44,"84":84}],84:[function(_dereq_,module,exports){
module.exports = _dereq_(38);
},{"38":38}],85:[function(_dereq_,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],86:[function(_dereq_,module,exports){
var redefine = _dereq_(87);
module.exports = function(target, src, safe){
  for(var key in src)redefine(target, key, src[key], safe);
  return target;
};
},{"87":87}],87:[function(_dereq_,module,exports){
var global    = _dereq_(38)
  , hide      = _dereq_(40)
  , has       = _dereq_(39)
  , SRC       = _dereq_(114)('src')
  , TO_STRING = 'toString'
  , $toString = Function[TO_STRING]
  , TPL       = ('' + $toString).split(TO_STRING);

_dereq_(23).inspectSource = function(it){
  return $toString.call(it);
};

(module.exports = function(O, key, val, safe){
  var isFunction = typeof val == 'function';
  if(isFunction)has(val, 'name') || hide(val, 'name', key);
  if(O[key] === val)return;
  if(isFunction)has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if(O === global){
    O[key] = val;
  } else {
    if(!safe){
      delete O[key];
      hide(O, key, val);
    } else {
      if(O[key])O[key] = val;
      else hide(O, key, val);
    }
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString(){
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});
},{"114":114,"23":23,"38":38,"39":39,"40":40}],88:[function(_dereq_,module,exports){
module.exports = function(regExp, replace){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(it).replace(regExp, replacer);
  };
};
},{}],89:[function(_dereq_,module,exports){
// 7.2.9 SameValue(x, y)
module.exports = Object.is || function is(x, y){
  return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
};
},{}],90:[function(_dereq_,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = _dereq_(49)
  , anObject = _dereq_(7);
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = _dereq_(25)(Function.call, _dereq_(70).f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"25":25,"49":49,"7":7,"70":70}],91:[function(_dereq_,module,exports){
'use strict';
var global      = _dereq_(38)
  , dP          = _dereq_(67)
  , DESCRIPTORS = _dereq_(28)
  , SPECIES     = _dereq_(117)('species');

module.exports = function(KEY){
  var C = global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"117":117,"28":28,"38":38,"67":67}],92:[function(_dereq_,module,exports){
var def = _dereq_(67).f
  , has = _dereq_(39)
  , TAG = _dereq_(117)('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"117":117,"39":39,"67":67}],93:[function(_dereq_,module,exports){
var shared = _dereq_(94)('keys')
  , uid    = _dereq_(114);
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"114":114,"94":94}],94:[function(_dereq_,module,exports){
var global = _dereq_(38)
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"38":38}],95:[function(_dereq_,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = _dereq_(7)
  , aFunction = _dereq_(3)
  , SPECIES   = _dereq_(117)('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"117":117,"3":3,"7":7}],96:[function(_dereq_,module,exports){
var fails = _dereq_(34);

module.exports = function(method, arg){
  return !!method && fails(function(){
    arg ? method.call(null, function(){}, 1) : method.call(null);
  });
};
},{"34":34}],97:[function(_dereq_,module,exports){
var toInteger = _dereq_(106)
  , defined   = _dereq_(27);
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"106":106,"27":27}],98:[function(_dereq_,module,exports){
// helper for String#{startsWith, endsWith, includes}
var isRegExp = _dereq_(50)
  , defined  = _dereq_(27);

module.exports = function(that, searchString, NAME){
  if(isRegExp(searchString))throw TypeError('String#' + NAME + " doesn't accept regex!");
  return String(defined(that));
};
},{"27":27,"50":50}],99:[function(_dereq_,module,exports){
var $export = _dereq_(32)
  , fails   = _dereq_(34)
  , defined = _dereq_(27)
  , quot    = /"/g;
// B.2.3.2.1 CreateHTML(string, tag, attribute, value)
var createHTML = function(string, tag, attribute, value) {
  var S  = String(defined(string))
    , p1 = '<' + tag;
  if(attribute !== '')p1 += ' ' + attribute + '="' + String(value).replace(quot, '&quot;') + '"';
  return p1 + '>' + S + '</' + tag + '>';
};
module.exports = function(NAME, exec){
  var O = {};
  O[NAME] = exec(createHTML);
  $export($export.P + $export.F * fails(function(){
    var test = ''[NAME]('"');
    return test !== test.toLowerCase() || test.split('"').length > 3;
  }), 'String', O);
};
},{"27":27,"32":32,"34":34}],100:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-string-pad-start-end
var toLength = _dereq_(108)
  , repeat   = _dereq_(101)
  , defined  = _dereq_(27);

module.exports = function(that, maxLength, fillString, left){
  var S            = String(defined(that))
    , stringLength = S.length
    , fillStr      = fillString === undefined ? ' ' : String(fillString)
    , intMaxLength = toLength(maxLength);
  if(intMaxLength <= stringLength || fillStr == '')return S;
  var fillLen = intMaxLength - stringLength
    , stringFiller = repeat.call(fillStr, Math.ceil(fillLen / fillStr.length));
  if(stringFiller.length > fillLen)stringFiller = stringFiller.slice(0, fillLen);
  return left ? stringFiller + S : S + stringFiller;
};

},{"101":101,"108":108,"27":27}],101:[function(_dereq_,module,exports){
'use strict';
var toInteger = _dereq_(106)
  , defined   = _dereq_(27);

module.exports = function repeat(count){
  var str = String(defined(this))
    , res = ''
    , n   = toInteger(count);
  if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
  for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
  return res;
};
},{"106":106,"27":27}],102:[function(_dereq_,module,exports){
var $export = _dereq_(32)
  , defined = _dereq_(27)
  , fails   = _dereq_(34)
  , spaces  = _dereq_(103)
  , space   = '[' + spaces + ']'
  , non     = '\u200b\u0085'
  , ltrim   = RegExp('^' + space + space + '*')
  , rtrim   = RegExp(space + space + '*$');

var exporter = function(KEY, exec, ALIAS){
  var exp   = {};
  var FORCE = fails(function(){
    return !!spaces[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : spaces[KEY];
  if(ALIAS)exp[ALIAS] = fn;
  $export($export.P + $export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function(string, TYPE){
  string = String(defined(string));
  if(TYPE & 1)string = string.replace(ltrim, '');
  if(TYPE & 2)string = string.replace(rtrim, '');
  return string;
};

module.exports = exporter;
},{"103":103,"27":27,"32":32,"34":34}],103:[function(_dereq_,module,exports){
module.exports = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
},{}],104:[function(_dereq_,module,exports){
var ctx                = _dereq_(25)
  , invoke             = _dereq_(44)
  , html               = _dereq_(41)
  , cel                = _dereq_(29)
  , global             = _dereq_(38)
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(_dereq_(18)(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"18":18,"25":25,"29":29,"38":38,"41":41,"44":44}],105:[function(_dereq_,module,exports){
var toInteger = _dereq_(106)
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"106":106}],106:[function(_dereq_,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],107:[function(_dereq_,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = _dereq_(45)
  , defined = _dereq_(27);
module.exports = function(it){
  return IObject(defined(it));
};
},{"27":27,"45":45}],108:[function(_dereq_,module,exports){
// 7.1.15 ToLength
var toInteger = _dereq_(106)
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"106":106}],109:[function(_dereq_,module,exports){
// 7.1.13 ToObject(argument)
var defined = _dereq_(27);
module.exports = function(it){
  return Object(defined(it));
};
},{"27":27}],110:[function(_dereq_,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = _dereq_(49);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"49":49}],111:[function(_dereq_,module,exports){
'use strict';
if(_dereq_(28)){
  var LIBRARY             = _dereq_(58)
    , global              = _dereq_(38)
    , fails               = _dereq_(34)
    , $export             = _dereq_(32)
    , $typed              = _dereq_(113)
    , $buffer             = _dereq_(112)
    , ctx                 = _dereq_(25)
    , anInstance          = _dereq_(6)
    , propertyDesc        = _dereq_(85)
    , hide                = _dereq_(40)
    , redefineAll         = _dereq_(86)
    , toInteger           = _dereq_(106)
    , toLength            = _dereq_(108)
    , toIndex             = _dereq_(105)
    , toPrimitive         = _dereq_(110)
    , has                 = _dereq_(39)
    , same                = _dereq_(89)
    , classof             = _dereq_(17)
    , isObject            = _dereq_(49)
    , toObject            = _dereq_(109)
    , isArrayIter         = _dereq_(46)
    , create              = _dereq_(66)
    , getPrototypeOf      = _dereq_(74)
    , gOPN                = _dereq_(72).f
    , getIterFn           = _dereq_(118)
    , uid                 = _dereq_(114)
    , wks                 = _dereq_(117)
    , createArrayMethod   = _dereq_(12)
    , createArrayIncludes = _dereq_(11)
    , speciesConstructor  = _dereq_(95)
    , ArrayIterators      = _dereq_(130)
    , Iterators           = _dereq_(56)
    , $iterDetect         = _dereq_(54)
    , setSpecies          = _dereq_(91)
    , arrayFill           = _dereq_(9)
    , arrayCopyWithin     = _dereq_(8)
    , $DP                 = _dereq_(67)
    , $GOPD               = _dereq_(70)
    , dP                  = $DP.f
    , gOPD                = $GOPD.f
    , RangeError          = global.RangeError
    , TypeError           = global.TypeError
    , Uint8Array          = global.Uint8Array
    , ARRAY_BUFFER        = 'ArrayBuffer'
    , SHARED_BUFFER       = 'Shared' + ARRAY_BUFFER
    , BYTES_PER_ELEMENT   = 'BYTES_PER_ELEMENT'
    , PROTOTYPE           = 'prototype'
    , ArrayProto          = Array[PROTOTYPE]
    , $ArrayBuffer        = $buffer.ArrayBuffer
    , $DataView           = $buffer.DataView
    , arrayForEach        = createArrayMethod(0)
    , arrayFilter         = createArrayMethod(2)
    , arraySome           = createArrayMethod(3)
    , arrayEvery          = createArrayMethod(4)
    , arrayFind           = createArrayMethod(5)
    , arrayFindIndex      = createArrayMethod(6)
    , arrayIncludes       = createArrayIncludes(true)
    , arrayIndexOf        = createArrayIncludes(false)
    , arrayValues         = ArrayIterators.values
    , arrayKeys           = ArrayIterators.keys
    , arrayEntries        = ArrayIterators.entries
    , arrayLastIndexOf    = ArrayProto.lastIndexOf
    , arrayReduce         = ArrayProto.reduce
    , arrayReduceRight    = ArrayProto.reduceRight
    , arrayJoin           = ArrayProto.join
    , arraySort           = ArrayProto.sort
    , arraySlice          = ArrayProto.slice
    , arrayToString       = ArrayProto.toString
    , arrayToLocaleString = ArrayProto.toLocaleString
    , ITERATOR            = wks('iterator')
    , TAG                 = wks('toStringTag')
    , TYPED_CONSTRUCTOR   = uid('typed_constructor')
    , DEF_CONSTRUCTOR     = uid('def_constructor')
    , ALL_CONSTRUCTORS    = $typed.CONSTR
    , TYPED_ARRAY         = $typed.TYPED
    , VIEW                = $typed.VIEW
    , WRONG_LENGTH        = 'Wrong length!';

  var $map = createArrayMethod(1, function(O, length){
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });

  var LITTLE_ENDIAN = fails(function(){
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function(){
    new Uint8Array(1).set({});
  });

  var strictToLength = function(it, SAME){
    if(it === undefined)throw TypeError(WRONG_LENGTH);
    var number = +it
      , length = toLength(it);
    if(SAME && !same(number, length))throw RangeError(WRONG_LENGTH);
    return length;
  };

  var toOffset = function(it, BYTES){
    var offset = toInteger(it);
    if(offset < 0 || offset % BYTES)throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function(it){
    if(isObject(it) && TYPED_ARRAY in it)return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function(C, length){
    if(!(isObject(C) && TYPED_CONSTRUCTOR in C)){
      throw TypeError('It is not a typed array constructor!');
    } return new C(length);
  };

  var speciesFromList = function(O, list){
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function(C, list){
    var index  = 0
      , length = list.length
      , result = allocate(C, length);
    while(length > index)result[index] = list[index++];
    return result;
  };

  var addGetter = function(it, key, internal){
    dP(it, key, {get: function(){ return this._d[internal]; }});
  };

  var $from = function from(source /*, mapfn, thisArg */){
    var O       = toObject(source)
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , iterFn  = getIterFn(O)
      , i, length, values, result, step, iterator;
    if(iterFn != undefined && !isArrayIter(iterFn)){
      for(iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++){
        values.push(step.value);
      } O = values;
    }
    if(mapping && aLen > 2)mapfn = ctx(mapfn, arguments[2], 2);
    for(i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++){
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var $of = function of(/*...items*/){
    var index  = 0
      , length = arguments.length
      , result = allocate(this, length);
    while(length > index)result[index] = arguments[index++];
    return result;
  };

  // iOS Safari 6.x fails here
  var TO_LOCALE_BUG = !!Uint8Array && fails(function(){ arrayToLocaleString.call(new Uint8Array(1)); });

  var $toLocaleString = function toLocaleString(){
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start /*, end */){
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn /*, thisArg */){
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value /*, start, end */){ // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn /*, thisArg */){
      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
        arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate /*, thisArg */){
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate /*, thisArg */){
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn /*, thisArg */){
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement /*, fromIndex */){
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement /*, fromIndex */){
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator){ // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement /*, fromIndex */){ // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn /*, thisArg */){
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn /*, initialValue */){ // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse(){
      var that   = this
        , length = validate(that).length
        , middle = Math.floor(length / 2)
        , index  = 0
        , value;
      while(index < middle){
        value         = that[index];
        that[index++] = that[--length];
        that[length]  = value;
      } return that;
    },
    some: function some(callbackfn /*, thisArg */){
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn){
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end){
      var O      = validate(this)
        , length = O.length
        , $begin = toIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
        O.buffer,
        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toIndex(end, length)) - $begin)
      );
    }
  };

  var $slice = function slice(start, end){
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike /*, offset */){
    validate(this);
    var offset = toOffset(arguments[1], 1)
      , length = this.length
      , src    = toObject(arrayLike)
      , len    = toLength(src.length)
      , index  = 0;
    if(len + offset > length)throw RangeError(WRONG_LENGTH);
    while(index < len)this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries(){
      return arrayEntries.call(validate(this));
    },
    keys: function keys(){
      return arrayKeys.call(validate(this));
    },
    values: function values(){
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function(target, key){
    return isObject(target)
      && target[TYPED_ARRAY]
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var $getDesc = function getOwnPropertyDescriptor(target, key){
    return isTAIndex(target, key = toPrimitive(key, true))
      ? propertyDesc(2, target[key])
      : gOPD(target, key);
  };
  var $setDesc = function defineProperty(target, key, desc){
    if(isTAIndex(target, key = toPrimitive(key, true))
      && isObject(desc)
      && has(desc, 'value')
      && !has(desc, 'get')
      && !has(desc, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable
      && (!has(desc, 'writable') || desc.writable)
      && (!has(desc, 'enumerable') || desc.enumerable)
    ){
      target[key] = desc.value;
      return target;
    } else return dP(target, key, desc);
  };

  if(!ALL_CONSTRUCTORS){
    $GOPD.f = $getDesc;
    $DP.f   = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty:           $setDesc
  });

  if(fails(function(){ arrayToString.call({}); })){
    arrayToString = arrayToLocaleString = function toString(){
      return arrayJoin.call(this);
    };
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice:          $slice,
    set:            $set,
    constructor:    function(){ /* noop */ },
    toString:       arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function(){ return this[TYPED_ARRAY]; }
  });

  module.exports = function(KEY, BYTES, wrapper, CLAMPED){
    CLAMPED = !!CLAMPED;
    var NAME       = KEY + (CLAMPED ? 'Clamped' : '') + 'Array'
      , ISNT_UINT8 = NAME != 'Uint8Array'
      , GETTER     = 'get' + KEY
      , SETTER     = 'set' + KEY
      , TypedArray = global[NAME]
      , Base       = TypedArray || {}
      , TAC        = TypedArray && getPrototypeOf(TypedArray)
      , FORCED     = !TypedArray || !$typed.ABV
      , O          = {}
      , TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function(that, index){
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };
    var setter = function(that, index, value){
      var data = that._d;
      if(CLAMPED)value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };
    var addElement = function(that, index){
      dP(that, index, {
        get: function(){
          return getter(this, index);
        },
        set: function(value){
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if(FORCED){
      TypedArray = wrapper(function(that, data, $offset, $length){
        anInstance(that, TypedArray, NAME, '_d');
        var index  = 0
          , offset = 0
          , buffer, byteLength, length, klass;
        if(!isObject(data)){
          length     = strictToLength(data, true);
          byteLength = length * BYTES;
          buffer     = new $ArrayBuffer(byteLength);
        } else if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;
          if($length === undefined){
            if($len % BYTES)throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if(byteLength < 0)throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if(byteLength + offset > $len)throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if(TYPED_ARRAY in data){
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }
        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });
        while(index < length)addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if(!$iterDetect(function(iter){
      // V8 works with iterators, but fails in many other cases
      // https://code.google.com/p/v8/issues/detail?id=4552
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(iter); // eslint-disable-line no-new
    }, true)){
      TypedArray = wrapper(function(that, data, $offset, $length){
        anInstance(that, TypedArray, NAME);
        var klass;
        // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645
        if(!isObject(data))return new Base(strictToLength(data, ISNT_UINT8));
        if(data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER){
          return $length !== undefined
            ? new Base(data, toOffset($offset, BYTES), $length)
            : $offset !== undefined
              ? new Base(data, toOffset($offset, BYTES))
              : new Base(data);
        }
        if(TYPED_ARRAY in data)return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function(key){
        if(!(key in TypedArray))hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if(!LIBRARY)TypedArrayPrototype.constructor = TypedArray;
    }
    var $nativeIterator   = TypedArrayPrototype[ITERATOR]
      , CORRECT_ITER_NAME = !!$nativeIterator && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined)
      , $iterator         = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if(CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)){
      dP(TypedArrayPrototype, TAG, {
        get: function(){ return NAME; }
      });
    }

    O[NAME] = TypedArray;

    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES,
      from: $from,
      of: $of
    });

    if(!(BYTES_PER_ELEMENT in TypedArrayPrototype))hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    $export($export.P, NAME, proto);

    setSpecies(NAME);

    $export($export.P + $export.F * FORCED_SET, NAME, {set: $set});

    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

    $export($export.P + $export.F * (TypedArrayPrototype.toString != arrayToString), NAME, {toString: arrayToString});

    $export($export.P + $export.F * fails(function(){
      new TypedArray(1).slice();
    }), NAME, {slice: $slice});

    $export($export.P + $export.F * (fails(function(){
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString()
    }) || !fails(function(){
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, {toLocaleString: $toLocaleString});

    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if(!LIBRARY && !CORRECT_ITER_NAME)hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function(){ /* empty */ };
},{"105":105,"106":106,"108":108,"109":109,"11":11,"110":110,"112":112,"113":113,"114":114,"117":117,"118":118,"12":12,"130":130,"17":17,"25":25,"28":28,"32":32,"34":34,"38":38,"39":39,"40":40,"46":46,"49":49,"54":54,"56":56,"58":58,"6":6,"66":66,"67":67,"70":70,"72":72,"74":74,"8":8,"85":85,"86":86,"89":89,"9":9,"91":91,"95":95}],112:[function(_dereq_,module,exports){
'use strict';
var global         = _dereq_(38)
  , DESCRIPTORS    = _dereq_(28)
  , LIBRARY        = _dereq_(58)
  , $typed         = _dereq_(113)
  , hide           = _dereq_(40)
  , redefineAll    = _dereq_(86)
  , fails          = _dereq_(34)
  , anInstance     = _dereq_(6)
  , toInteger      = _dereq_(106)
  , toLength       = _dereq_(108)
  , gOPN           = _dereq_(72).f
  , dP             = _dereq_(67).f
  , arrayFill      = _dereq_(9)
  , setToStringTag = _dereq_(92)
  , ARRAY_BUFFER   = 'ArrayBuffer'
  , DATA_VIEW      = 'DataView'
  , PROTOTYPE      = 'prototype'
  , WRONG_LENGTH   = 'Wrong length!'
  , WRONG_INDEX    = 'Wrong index!'
  , $ArrayBuffer   = global[ARRAY_BUFFER]
  , $DataView      = global[DATA_VIEW]
  , Math           = global.Math
  , RangeError     = global.RangeError
  , Infinity       = global.Infinity
  , BaseBuffer     = $ArrayBuffer
  , abs            = Math.abs
  , pow            = Math.pow
  , floor          = Math.floor
  , log            = Math.log
  , LN2            = Math.LN2
  , BUFFER         = 'buffer'
  , BYTE_LENGTH    = 'byteLength'
  , BYTE_OFFSET    = 'byteOffset'
  , $BUFFER        = DESCRIPTORS ? '_b' : BUFFER
  , $LENGTH        = DESCRIPTORS ? '_l' : BYTE_LENGTH
  , $OFFSET        = DESCRIPTORS ? '_o' : BYTE_OFFSET;

// IEEE754 conversions based on https://github.com/feross/ieee754
var packIEEE754 = function(value, mLen, nBytes){
  var buffer = Array(nBytes)
    , eLen   = nBytes * 8 - mLen - 1
    , eMax   = (1 << eLen) - 1
    , eBias  = eMax >> 1
    , rt     = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0
    , i      = 0
    , s      = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0
    , e, m, c;
  value = abs(value);
  if(value != value || value === Infinity){
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);
    if(value * (c = pow(2, -e)) < 1){
      e--;
      c *= 2;
    }
    if(e + eBias >= 1){
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }
    if(value * c >= 2){
      e++;
      c /= 2;
    }
    if(e + eBias >= eMax){
      m = 0;
      e = eMax;
    } else if(e + eBias >= 1){
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }
  for(; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
  e = e << mLen | m;
  eLen += mLen;
  for(; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
  buffer[--i] |= s * 128;
  return buffer;
};
var unpackIEEE754 = function(buffer, mLen, nBytes){
  var eLen  = nBytes * 8 - mLen - 1
    , eMax  = (1 << eLen) - 1
    , eBias = eMax >> 1
    , nBits = eLen - 7
    , i     = nBytes - 1
    , s     = buffer[i--]
    , e     = s & 127
    , m;
  s >>= 7;
  for(; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for(; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
  if(e === 0){
    e = 1 - eBias;
  } else if(e === eMax){
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  } return (s ? -1 : 1) * m * pow(2, e - mLen);
};

var unpackI32 = function(bytes){
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
};
var packI8 = function(it){
  return [it & 0xff];
};
var packI16 = function(it){
  return [it & 0xff, it >> 8 & 0xff];
};
var packI32 = function(it){
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
};
var packF64 = function(it){
  return packIEEE754(it, 52, 8);
};
var packF32 = function(it){
  return packIEEE754(it, 23, 4);
};

var addGetter = function(C, key, internal){
  dP(C[PROTOTYPE], key, {get: function(){ return this[internal]; }});
};

var get = function(view, bytes, index, isLittleEndian){
  var numIndex = +index
    , intIndex = toInteger(numIndex);
  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b
    , start = intIndex + view[$OFFSET]
    , pack  = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
};
var set = function(view, bytes, index, conversion, value, isLittleEndian){
  var numIndex = +index
    , intIndex = toInteger(numIndex);
  if(numIndex != intIndex || intIndex < 0 || intIndex + bytes > view[$LENGTH])throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b
    , start = intIndex + view[$OFFSET]
    , pack  = conversion(+value);
  for(var i = 0; i < bytes; i++)store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
};

var validateArrayBufferArguments = function(that, length){
  anInstance(that, $ArrayBuffer, ARRAY_BUFFER);
  var numberLength = +length
    , byteLength   = toLength(numberLength);
  if(numberLength != byteLength)throw RangeError(WRONG_LENGTH);
  return byteLength;
};

if(!$typed.ABV){
  $ArrayBuffer = function ArrayBuffer(length){
    var byteLength = validateArrayBufferArguments(this, length);
    this._b       = arrayFill.call(Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength){
    anInstance(this, $DataView, DATA_VIEW);
    anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH]
      , offset       = toInteger(byteOffset);
    if(offset < 0 || offset > bufferLength)throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
    if(offset + byteLength > bufferLength)throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if(DESCRIPTORS){
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset){
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset){
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /*, littleEndian */){
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /*, littleEndian */){
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /*, littleEndian */){
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset /*, littleEndian */){
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /*, littleEndian */){
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset /*, littleEndian */){
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value){
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value){
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value /*, littleEndian */){
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value /*, littleEndian */){
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value /*, littleEndian */){
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value /*, littleEndian */){
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if(!fails(function(){
    new $ArrayBuffer;     // eslint-disable-line no-new
  }) || !fails(function(){
    new $ArrayBuffer(.5); // eslint-disable-line no-new
  })){
    $ArrayBuffer = function ArrayBuffer(length){
      return new BaseBuffer(validateArrayBufferArguments(this, length));
    };
    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
    for(var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j; ){
      if(!((key = keys[j++]) in $ArrayBuffer))hide($ArrayBuffer, key, BaseBuffer[key]);
    }
    if(!LIBRARY)ArrayBufferProto.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var view = new $DataView(new $ArrayBuffer(2))
    , $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if(view.getInt8(0) || !view.getInt8(1))redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value){
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value){
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}
setToStringTag($ArrayBuffer, ARRAY_BUFFER);
setToStringTag($DataView, DATA_VIEW);
hide($DataView[PROTOTYPE], $typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;
},{"106":106,"108":108,"113":113,"28":28,"34":34,"38":38,"40":40,"58":58,"6":6,"67":67,"72":72,"86":86,"9":9,"92":92}],113:[function(_dereq_,module,exports){
var global = _dereq_(38)
  , hide   = _dereq_(40)
  , uid    = _dereq_(114)
  , TYPED  = uid('typed_array')
  , VIEW   = uid('view')
  , ABV    = !!(global.ArrayBuffer && global.DataView)
  , CONSTR = ABV
  , i = 0, l = 9, Typed;

var TypedArrayConstructors = (
  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
).split(',');

while(i < l){
  if(Typed = global[TypedArrayConstructors[i++]]){
    hide(Typed.prototype, TYPED, true);
    hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

module.exports = {
  ABV:    ABV,
  CONSTR: CONSTR,
  TYPED:  TYPED,
  VIEW:   VIEW
};
},{"114":114,"38":38,"40":40}],114:[function(_dereq_,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],115:[function(_dereq_,module,exports){
var global         = _dereq_(38)
  , core           = _dereq_(23)
  , LIBRARY        = _dereq_(58)
  , wksExt         = _dereq_(116)
  , defineProperty = _dereq_(67).f;
module.exports = function(name){
  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
};
},{"116":116,"23":23,"38":38,"58":58,"67":67}],116:[function(_dereq_,module,exports){
exports.f = _dereq_(117);
},{"117":117}],117:[function(_dereq_,module,exports){
var store      = _dereq_(94)('wks')
  , uid        = _dereq_(114)
  , Symbol     = _dereq_(38).Symbol
  , USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;
},{"114":114,"38":38,"94":94}],118:[function(_dereq_,module,exports){
var classof   = _dereq_(17)
  , ITERATOR  = _dereq_(117)('iterator')
  , Iterators = _dereq_(56);
module.exports = _dereq_(23).getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"117":117,"17":17,"23":23,"56":56}],119:[function(_dereq_,module,exports){
// https://github.com/benjamingr/RexExp.escape
var $export = _dereq_(32)
  , $re     = _dereq_(88)(/[\\^$*+?.()|[\]{}]/g, '\\$&');

$export($export.S, 'RegExp', {escape: function escape(it){ return $re(it); }});

},{"32":32,"88":88}],120:[function(_dereq_,module,exports){
// 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
var $export = _dereq_(32);

$export($export.P, 'Array', {copyWithin: _dereq_(8)});

_dereq_(5)('copyWithin');
},{"32":32,"5":5,"8":8}],121:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $every  = _dereq_(12)(4);

$export($export.P + $export.F * !_dereq_(96)([].every, true), 'Array', {
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: function every(callbackfn /* , thisArg */){
    return $every(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],122:[function(_dereq_,module,exports){
// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
var $export = _dereq_(32);

$export($export.P, 'Array', {fill: _dereq_(9)});

_dereq_(5)('fill');
},{"32":32,"5":5,"9":9}],123:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $filter = _dereq_(12)(2);

$export($export.P + $export.F * !_dereq_(96)([].filter, true), 'Array', {
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: function filter(callbackfn /* , thisArg */){
    return $filter(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],124:[function(_dereq_,module,exports){
'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var $export = _dereq_(32)
  , $find   = _dereq_(12)(6)
  , KEY     = 'findIndex'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  findIndex: function findIndex(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
_dereq_(5)(KEY);
},{"12":12,"32":32,"5":5}],125:[function(_dereq_,module,exports){
'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var $export = _dereq_(32)
  , $find   = _dereq_(12)(5)
  , KEY     = 'find'
  , forced  = true;
// Shouldn't skip holes
if(KEY in [])Array(1)[KEY](function(){ forced = false; });
$export($export.P + $export.F * forced, 'Array', {
  find: function find(callbackfn/*, that = undefined */){
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});
_dereq_(5)(KEY);
},{"12":12,"32":32,"5":5}],126:[function(_dereq_,module,exports){
'use strict';
var $export  = _dereq_(32)
  , $forEach = _dereq_(12)(0)
  , STRICT   = _dereq_(96)([].forEach, true);

$export($export.P + $export.F * !STRICT, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: function forEach(callbackfn /* , thisArg */){
    return $forEach(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],127:[function(_dereq_,module,exports){
'use strict';
var ctx            = _dereq_(25)
  , $export        = _dereq_(32)
  , toObject       = _dereq_(109)
  , call           = _dereq_(51)
  , isArrayIter    = _dereq_(46)
  , toLength       = _dereq_(108)
  , createProperty = _dereq_(24)
  , getIterFn      = _dereq_(118);

$export($export.S + $export.F * !_dereq_(54)(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"108":108,"109":109,"118":118,"24":24,"25":25,"32":32,"46":46,"51":51,"54":54}],128:[function(_dereq_,module,exports){
'use strict';
var $export       = _dereq_(32)
  , $indexOf      = _dereq_(11)(false)
  , $native       = [].indexOf
  , NEGATIVE_ZERO = !!$native && 1 / [1].indexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !_dereq_(96)($native)), 'Array', {
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: function indexOf(searchElement /*, fromIndex = 0 */){
    return NEGATIVE_ZERO
      // convert -0 to +0
      ? $native.apply(this, arguments) || 0
      : $indexOf(this, searchElement, arguments[1]);
  }
});
},{"11":11,"32":32,"96":96}],129:[function(_dereq_,module,exports){
// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
var $export = _dereq_(32);

$export($export.S, 'Array', {isArray: _dereq_(47)});
},{"32":32,"47":47}],130:[function(_dereq_,module,exports){
'use strict';
var addToUnscopables = _dereq_(5)
  , step             = _dereq_(55)
  , Iterators        = _dereq_(56)
  , toIObject        = _dereq_(107);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = _dereq_(53)(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"107":107,"5":5,"53":53,"55":55,"56":56}],131:[function(_dereq_,module,exports){
'use strict';
// 22.1.3.13 Array.prototype.join(separator)
var $export   = _dereq_(32)
  , toIObject = _dereq_(107)
  , arrayJoin = [].join;

// fallback for not array-like strings
$export($export.P + $export.F * (_dereq_(45) != Object || !_dereq_(96)(arrayJoin)), 'Array', {
  join: function join(separator){
    return arrayJoin.call(toIObject(this), separator === undefined ? ',' : separator);
  }
});
},{"107":107,"32":32,"45":45,"96":96}],132:[function(_dereq_,module,exports){
'use strict';
var $export       = _dereq_(32)
  , toIObject     = _dereq_(107)
  , toInteger     = _dereq_(106)
  , toLength      = _dereq_(108)
  , $native       = [].lastIndexOf
  , NEGATIVE_ZERO = !!$native && 1 / [1].lastIndexOf(1, -0) < 0;

$export($export.P + $export.F * (NEGATIVE_ZERO || !_dereq_(96)($native)), 'Array', {
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function lastIndexOf(searchElement /*, fromIndex = @[*-1] */){
    // convert -0 to +0
    if(NEGATIVE_ZERO)return $native.apply(this, arguments) || 0;
    var O      = toIObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, toInteger(arguments[1]));
    if(index < 0)index = length + index;
    for(;index >= 0; index--)if(index in O)if(O[index] === searchElement)return index || 0;
    return -1;
  }
});
},{"106":106,"107":107,"108":108,"32":32,"96":96}],133:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $map    = _dereq_(12)(1);

$export($export.P + $export.F * !_dereq_(96)([].map, true), 'Array', {
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: function map(callbackfn /* , thisArg */){
    return $map(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],134:[function(_dereq_,module,exports){
'use strict';
var $export        = _dereq_(32)
  , createProperty = _dereq_(24);

// WebKit Array.of isn't generic
$export($export.S + $export.F * _dereq_(34)(function(){
  function F(){}
  return !(Array.of.call(F) instanceof F);
}), 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function of(/* ...args */){
    var index  = 0
      , aLen   = arguments.length
      , result = new (typeof this == 'function' ? this : Array)(aLen);
    while(aLen > index)createProperty(result, index, arguments[index++]);
    result.length = aLen;
    return result;
  }
});
},{"24":24,"32":32,"34":34}],135:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $reduce = _dereq_(13);

$export($export.P + $export.F * !_dereq_(96)([].reduceRight, true), 'Array', {
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: function reduceRight(callbackfn /* , initialValue */){
    return $reduce(this, callbackfn, arguments.length, arguments[1], true);
  }
});
},{"13":13,"32":32,"96":96}],136:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $reduce = _dereq_(13);

$export($export.P + $export.F * !_dereq_(96)([].reduce, true), 'Array', {
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: function reduce(callbackfn /* , initialValue */){
    return $reduce(this, callbackfn, arguments.length, arguments[1], false);
  }
});
},{"13":13,"32":32,"96":96}],137:[function(_dereq_,module,exports){
'use strict';
var $export    = _dereq_(32)
  , html       = _dereq_(41)
  , cof        = _dereq_(18)
  , toIndex    = _dereq_(105)
  , toLength   = _dereq_(108)
  , arraySlice = [].slice;

// fallback for not array-like ES3 strings and DOM objects
$export($export.P + $export.F * _dereq_(34)(function(){
  if(html)arraySlice.call(html);
}), 'Array', {
  slice: function slice(begin, end){
    var len   = toLength(this.length)
      , klass = cof(this);
    end = end === undefined ? len : end;
    if(klass == 'Array')return arraySlice.call(this, begin, end);
    var start  = toIndex(begin, len)
      , upTo   = toIndex(end, len)
      , size   = toLength(upTo - start)
      , cloned = Array(size)
      , i      = 0;
    for(; i < size; i++)cloned[i] = klass == 'String'
      ? this.charAt(start + i)
      : this[start + i];
    return cloned;
  }
});
},{"105":105,"108":108,"18":18,"32":32,"34":34,"41":41}],138:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $some   = _dereq_(12)(3);

$export($export.P + $export.F * !_dereq_(96)([].some, true), 'Array', {
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: function some(callbackfn /* , thisArg */){
    return $some(this, callbackfn, arguments[1]);
  }
});
},{"12":12,"32":32,"96":96}],139:[function(_dereq_,module,exports){
'use strict';
var $export   = _dereq_(32)
  , aFunction = _dereq_(3)
  , toObject  = _dereq_(109)
  , fails     = _dereq_(34)
  , $sort     = [].sort
  , test      = [1, 2, 3];

$export($export.P + $export.F * (fails(function(){
  // IE8-
  test.sort(undefined);
}) || !fails(function(){
  // V8 bug
  test.sort(null);
  // Old WebKit
}) || !_dereq_(96)($sort)), 'Array', {
  // 22.1.3.25 Array.prototype.sort(comparefn)
  sort: function sort(comparefn){
    return comparefn === undefined
      ? $sort.call(toObject(this))
      : $sort.call(toObject(this), aFunction(comparefn));
  }
});
},{"109":109,"3":3,"32":32,"34":34,"96":96}],140:[function(_dereq_,module,exports){
_dereq_(91)('Array');
},{"91":91}],141:[function(_dereq_,module,exports){
// 20.3.3.1 / 15.9.4.4 Date.now()
var $export = _dereq_(32);

$export($export.S, 'Date', {now: function(){ return new Date().getTime(); }});
},{"32":32}],142:[function(_dereq_,module,exports){
'use strict';
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
var $export = _dereq_(32)
  , fails   = _dereq_(34)
  , getTime = Date.prototype.getTime;

var lz = function(num){
  return num > 9 ? num : '0' + num;
};

// PhantomJS / old WebKit has a broken implementations
$export($export.P + $export.F * (fails(function(){
  return new Date(-5e13 - 1).toISOString() != '0385-07-25T07:06:39.999Z';
}) || !fails(function(){
  new Date(NaN).toISOString();
})), 'Date', {
  toISOString: function toISOString(){
    if(!isFinite(getTime.call(this)))throw RangeError('Invalid time value');
    var d = this
      , y = d.getUTCFullYear()
      , m = d.getUTCMilliseconds()
      , s = y < 0 ? '-' : y > 9999 ? '+' : '';
    return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
      '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
      'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
      ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
  }
});
},{"32":32,"34":34}],143:[function(_dereq_,module,exports){
'use strict';
var $export     = _dereq_(32)
  , toObject    = _dereq_(109)
  , toPrimitive = _dereq_(110);

$export($export.P + $export.F * _dereq_(34)(function(){
  return new Date(NaN).toJSON() !== null || Date.prototype.toJSON.call({toISOString: function(){ return 1; }}) !== 1;
}), 'Date', {
  toJSON: function toJSON(key){
    var O  = toObject(this)
      , pv = toPrimitive(O);
    return typeof pv == 'number' && !isFinite(pv) ? null : O.toISOString();
  }
});
},{"109":109,"110":110,"32":32,"34":34}],144:[function(_dereq_,module,exports){
var TO_PRIMITIVE = _dereq_(117)('toPrimitive')
  , proto        = Date.prototype;

if(!(TO_PRIMITIVE in proto))_dereq_(40)(proto, TO_PRIMITIVE, _dereq_(26));
},{"117":117,"26":26,"40":40}],145:[function(_dereq_,module,exports){
var DateProto    = Date.prototype
  , INVALID_DATE = 'Invalid Date'
  , TO_STRING    = 'toString'
  , $toString    = DateProto[TO_STRING]
  , getTime      = DateProto.getTime;
if(new Date(NaN) + '' != INVALID_DATE){
  _dereq_(87)(DateProto, TO_STRING, function toString(){
    var value = getTime.call(this);
    return value === value ? $toString.call(this) : INVALID_DATE;
  });
}
},{"87":87}],146:[function(_dereq_,module,exports){
// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
var $export = _dereq_(32);

$export($export.P, 'Function', {bind: _dereq_(16)});
},{"16":16,"32":32}],147:[function(_dereq_,module,exports){
'use strict';
var isObject       = _dereq_(49)
  , getPrototypeOf = _dereq_(74)
  , HAS_INSTANCE   = _dereq_(117)('hasInstance')
  , FunctionProto  = Function.prototype;
// 19.2.3.6 Function.prototype[@@hasInstance](V)
if(!(HAS_INSTANCE in FunctionProto))_dereq_(67).f(FunctionProto, HAS_INSTANCE, {value: function(O){
  if(typeof this != 'function' || !isObject(O))return false;
  if(!isObject(this.prototype))return O instanceof this;
  // for environment w/o native `@@hasInstance` logic enough `instanceof`, but add this:
  while(O = getPrototypeOf(O))if(this.prototype === O)return true;
  return false;
}});
},{"117":117,"49":49,"67":67,"74":74}],148:[function(_dereq_,module,exports){
var dP         = _dereq_(67).f
  , createDesc = _dereq_(85)
  , has        = _dereq_(39)
  , FProto     = Function.prototype
  , nameRE     = /^\s*function ([^ (]*)/
  , NAME       = 'name';

var isExtensible = Object.isExtensible || function(){
  return true;
};

// 19.2.4.2 name
NAME in FProto || _dereq_(28) && dP(FProto, NAME, {
  configurable: true,
  get: function(){
    try {
      var that = this
        , name = ('' + that).match(nameRE)[1];
      has(that, NAME) || !isExtensible(that) || dP(that, NAME, createDesc(5, name));
      return name;
    } catch(e){
      return '';
    }
  }
});
},{"28":28,"39":39,"67":67,"85":85}],149:[function(_dereq_,module,exports){
'use strict';
var strong = _dereq_(19);

// 23.1 Map Objects
module.exports = _dereq_(22)('Map', function(get){
  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.1.3.6 Map.prototype.get(key)
  get: function get(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function set(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"19":19,"22":22}],150:[function(_dereq_,module,exports){
// 20.2.2.3 Math.acosh(x)
var $export = _dereq_(32)
  , log1p   = _dereq_(60)
  , sqrt    = Math.sqrt
  , $acosh  = Math.acosh;

$export($export.S + $export.F * !($acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  && Math.floor($acosh(Number.MAX_VALUE)) == 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN 
  && $acosh(Infinity) == Infinity
), 'Math', {
  acosh: function acosh(x){
    return (x = +x) < 1 ? NaN : x > 94906265.62425156
      ? Math.log(x) + Math.LN2
      : log1p(x - 1 + sqrt(x - 1) * sqrt(x + 1));
  }
});
},{"32":32,"60":60}],151:[function(_dereq_,module,exports){
// 20.2.2.5 Math.asinh(x)
var $export = _dereq_(32)
  , $asinh  = Math.asinh;

function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : Math.log(x + Math.sqrt(x * x + 1));
}

// Tor Browser bug: Math.asinh(0) -> -0 
$export($export.S + $export.F * !($asinh && 1 / $asinh(0) > 0), 'Math', {asinh: asinh});
},{"32":32}],152:[function(_dereq_,module,exports){
// 20.2.2.7 Math.atanh(x)
var $export = _dereq_(32)
  , $atanh  = Math.atanh;

// Tor Browser bug: Math.atanh(-0) -> 0 
$export($export.S + $export.F * !($atanh && 1 / $atanh(-0) < 0), 'Math', {
  atanh: function atanh(x){
    return (x = +x) == 0 ? x : Math.log((1 + x) / (1 - x)) / 2;
  }
});
},{"32":32}],153:[function(_dereq_,module,exports){
// 20.2.2.9 Math.cbrt(x)
var $export = _dereq_(32)
  , sign    = _dereq_(61);

$export($export.S, 'Math', {
  cbrt: function cbrt(x){
    return sign(x = +x) * Math.pow(Math.abs(x), 1 / 3);
  }
});
},{"32":32,"61":61}],154:[function(_dereq_,module,exports){
// 20.2.2.11 Math.clz32(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {
  clz32: function clz32(x){
    return (x >>>= 0) ? 31 - Math.floor(Math.log(x + 0.5) * Math.LOG2E) : 32;
  }
});
},{"32":32}],155:[function(_dereq_,module,exports){
// 20.2.2.12 Math.cosh(x)
var $export = _dereq_(32)
  , exp     = Math.exp;

$export($export.S, 'Math', {
  cosh: function cosh(x){
    return (exp(x = +x) + exp(-x)) / 2;
  }
});
},{"32":32}],156:[function(_dereq_,module,exports){
// 20.2.2.14 Math.expm1(x)
var $export = _dereq_(32)
  , $expm1  = _dereq_(59);

$export($export.S + $export.F * ($expm1 != Math.expm1), 'Math', {expm1: $expm1});
},{"32":32,"59":59}],157:[function(_dereq_,module,exports){
// 20.2.2.16 Math.fround(x)
var $export   = _dereq_(32)
  , sign      = _dereq_(61)
  , pow       = Math.pow
  , EPSILON   = pow(2, -52)
  , EPSILON32 = pow(2, -23)
  , MAX32     = pow(2, 127) * (2 - EPSILON32)
  , MIN32     = pow(2, -126);

var roundTiesToEven = function(n){
  return n + 1 / EPSILON - 1 / EPSILON;
};


$export($export.S, 'Math', {
  fround: function fround(x){
    var $abs  = Math.abs(x)
      , $sign = sign(x)
      , a, result;
    if($abs < MIN32)return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
    a = (1 + EPSILON32 / EPSILON) * $abs;
    result = a - (a - $abs);
    if(result > MAX32 || result != result)return $sign * Infinity;
    return $sign * result;
  }
});
},{"32":32,"61":61}],158:[function(_dereq_,module,exports){
// 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
var $export = _dereq_(32)
  , abs     = Math.abs;

$export($export.S, 'Math', {
  hypot: function hypot(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , i    = 0
      , aLen = arguments.length
      , larg = 0
      , arg, div;
    while(i < aLen){
      arg = abs(arguments[i++]);
      if(larg < arg){
        div  = larg / arg;
        sum  = sum * div * div + 1;
        larg = arg;
      } else if(arg > 0){
        div  = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
  }
});
},{"32":32}],159:[function(_dereq_,module,exports){
// 20.2.2.18 Math.imul(x, y)
var $export = _dereq_(32)
  , $imul   = Math.imul;

// some WebKit versions fails with big numbers, some has wrong arity
$export($export.S + $export.F * _dereq_(34)(function(){
  return $imul(0xffffffff, 5) != -5 || $imul.length != 2;
}), 'Math', {
  imul: function imul(x, y){
    var UINT16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UINT16 & xn
      , yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});
},{"32":32,"34":34}],160:[function(_dereq_,module,exports){
// 20.2.2.21 Math.log10(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {
  log10: function log10(x){
    return Math.log(x) / Math.LN10;
  }
});
},{"32":32}],161:[function(_dereq_,module,exports){
// 20.2.2.20 Math.log1p(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {log1p: _dereq_(60)});
},{"32":32,"60":60}],162:[function(_dereq_,module,exports){
// 20.2.2.22 Math.log2(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {
  log2: function log2(x){
    return Math.log(x) / Math.LN2;
  }
});
},{"32":32}],163:[function(_dereq_,module,exports){
// 20.2.2.28 Math.sign(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {sign: _dereq_(61)});
},{"32":32,"61":61}],164:[function(_dereq_,module,exports){
// 20.2.2.30 Math.sinh(x)
var $export = _dereq_(32)
  , expm1   = _dereq_(59)
  , exp     = Math.exp;

// V8 near Chromium 38 has a problem with very small numbers
$export($export.S + $export.F * _dereq_(34)(function(){
  return !Math.sinh(-2e-17) != -2e-17;
}), 'Math', {
  sinh: function sinh(x){
    return Math.abs(x = +x) < 1
      ? (expm1(x) - expm1(-x)) / 2
      : (exp(x - 1) - exp(-x - 1)) * (Math.E / 2);
  }
});
},{"32":32,"34":34,"59":59}],165:[function(_dereq_,module,exports){
// 20.2.2.33 Math.tanh(x)
var $export = _dereq_(32)
  , expm1   = _dereq_(59)
  , exp     = Math.exp;

$export($export.S, 'Math', {
  tanh: function tanh(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});
},{"32":32,"59":59}],166:[function(_dereq_,module,exports){
// 20.2.2.34 Math.trunc(x)
var $export = _dereq_(32);

$export($export.S, 'Math', {
  trunc: function trunc(it){
    return (it > 0 ? Math.floor : Math.ceil)(it);
  }
});
},{"32":32}],167:[function(_dereq_,module,exports){
'use strict';
var global            = _dereq_(38)
  , has               = _dereq_(39)
  , cof               = _dereq_(18)
  , inheritIfRequired = _dereq_(43)
  , toPrimitive       = _dereq_(110)
  , fails             = _dereq_(34)
  , gOPN              = _dereq_(72).f
  , gOPD              = _dereq_(70).f
  , dP                = _dereq_(67).f
  , $trim             = _dereq_(102).trim
  , NUMBER            = 'Number'
  , $Number           = global[NUMBER]
  , Base              = $Number
  , proto             = $Number.prototype
  // Opera ~12 has broken Object#toString
  , BROKEN_COF        = cof(_dereq_(66)(proto)) == NUMBER
  , TRIM              = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function(argument){
  var it = toPrimitive(argument, false);
  if(typeof it == 'string' && it.length > 2){
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0)
      , third, radix, maxCode;
    if(first === 43 || first === 45){
      third = it.charCodeAt(2);
      if(third === 88 || third === 120)return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if(first === 48){
      switch(it.charCodeAt(1)){
        case 66 : case 98  : radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79 : case 111 : radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default : return +it;
      }
      for(var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++){
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if(code < 48 || code > maxCode)return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if(!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')){
  $Number = function Number(value){
    var it = arguments.length < 1 ? 0 : value
      , that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function(){ proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for(var keys = _dereq_(28) ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key; keys.length > j; j++){
    if(has(Base, key = keys[j]) && !has($Number, key)){
      dP($Number, key, gOPD(Base, key));
    }
  }
  $Number.prototype = proto;
  proto.constructor = $Number;
  _dereq_(87)(global, NUMBER, $Number);
}
},{"102":102,"110":110,"18":18,"28":28,"34":34,"38":38,"39":39,"43":43,"66":66,"67":67,"70":70,"72":72,"87":87}],168:[function(_dereq_,module,exports){
// 20.1.2.1 Number.EPSILON
var $export = _dereq_(32);

$export($export.S, 'Number', {EPSILON: Math.pow(2, -52)});
},{"32":32}],169:[function(_dereq_,module,exports){
// 20.1.2.2 Number.isFinite(number)
var $export   = _dereq_(32)
  , _isFinite = _dereq_(38).isFinite;

$export($export.S, 'Number', {
  isFinite: function isFinite(it){
    return typeof it == 'number' && _isFinite(it);
  }
});
},{"32":32,"38":38}],170:[function(_dereq_,module,exports){
// 20.1.2.3 Number.isInteger(number)
var $export = _dereq_(32);

$export($export.S, 'Number', {isInteger: _dereq_(48)});
},{"32":32,"48":48}],171:[function(_dereq_,module,exports){
// 20.1.2.4 Number.isNaN(number)
var $export = _dereq_(32);

$export($export.S, 'Number', {
  isNaN: function isNaN(number){
    return number != number;
  }
});
},{"32":32}],172:[function(_dereq_,module,exports){
// 20.1.2.5 Number.isSafeInteger(number)
var $export   = _dereq_(32)
  , isInteger = _dereq_(48)
  , abs       = Math.abs;

$export($export.S, 'Number', {
  isSafeInteger: function isSafeInteger(number){
    return isInteger(number) && abs(number) <= 0x1fffffffffffff;
  }
});
},{"32":32,"48":48}],173:[function(_dereq_,module,exports){
// 20.1.2.6 Number.MAX_SAFE_INTEGER
var $export = _dereq_(32);

$export($export.S, 'Number', {MAX_SAFE_INTEGER: 0x1fffffffffffff});
},{"32":32}],174:[function(_dereq_,module,exports){
// 20.1.2.10 Number.MIN_SAFE_INTEGER
var $export = _dereq_(32);

$export($export.S, 'Number', {MIN_SAFE_INTEGER: -0x1fffffffffffff});
},{"32":32}],175:[function(_dereq_,module,exports){
var $export     = _dereq_(32)
  , $parseFloat = _dereq_(81);
// 20.1.2.12 Number.parseFloat(string)
$export($export.S + $export.F * (Number.parseFloat != $parseFloat), 'Number', {parseFloat: $parseFloat});
},{"32":32,"81":81}],176:[function(_dereq_,module,exports){
var $export   = _dereq_(32)
  , $parseInt = _dereq_(82);
// 20.1.2.13 Number.parseInt(string, radix)
$export($export.S + $export.F * (Number.parseInt != $parseInt), 'Number', {parseInt: $parseInt});
},{"32":32,"82":82}],177:[function(_dereq_,module,exports){
'use strict';
var $export      = _dereq_(32)
  , toInteger    = _dereq_(106)
  , aNumberValue = _dereq_(4)
  , repeat       = _dereq_(101)
  , $toFixed     = 1..toFixed
  , floor        = Math.floor
  , data         = [0, 0, 0, 0, 0, 0]
  , ERROR        = 'Number.toFixed: incorrect invocation!'
  , ZERO         = '0';

var multiply = function(n, c){
  var i  = -1
    , c2 = c;
  while(++i < 6){
    c2 += n * data[i];
    data[i] = c2 % 1e7;
    c2 = floor(c2 / 1e7);
  }
};
var divide = function(n){
  var i = 6
    , c = 0;
  while(--i >= 0){
    c += data[i];
    data[i] = floor(c / n);
    c = (c % n) * 1e7;
  }
};
var numToString = function(){
  var i = 6
    , s = '';
  while(--i >= 0){
    if(s !== '' || i === 0 || data[i] !== 0){
      var t = String(data[i]);
      s = s === '' ? t : s + repeat.call(ZERO, 7 - t.length) + t;
    }
  } return s;
};
var pow = function(x, n, acc){
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};
var log = function(x){
  var n  = 0
    , x2 = x;
  while(x2 >= 4096){
    n += 12;
    x2 /= 4096;
  }
  while(x2 >= 2){
    n  += 1;
    x2 /= 2;
  } return n;
};

$export($export.P + $export.F * (!!$toFixed && (
  0.00008.toFixed(3) !== '0.000' ||
  0.9.toFixed(0) !== '1' ||
  1.255.toFixed(2) !== '1.25' ||
  1000000000000000128..toFixed(0) !== '1000000000000000128'
) || !_dereq_(34)(function(){
  // V8 ~ Android 4.3-
  $toFixed.call({});
})), 'Number', {
  toFixed: function toFixed(fractionDigits){
    var x = aNumberValue(this, ERROR)
      , f = toInteger(fractionDigits)
      , s = ''
      , m = ZERO
      , e, z, j, k;
    if(f < 0 || f > 20)throw RangeError(ERROR);
    if(x != x)return 'NaN';
    if(x <= -1e21 || x >= 1e21)return String(x);
    if(x < 0){
      s = '-';
      x = -x;
    }
    if(x > 1e-21){
      e = log(x * pow(2, 69, 1)) - 69;
      z = e < 0 ? x * pow(2, -e, 1) : x / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if(e > 0){
        multiply(0, z);
        j = f;
        while(j >= 7){
          multiply(1e7, 0);
          j -= 7;
        }
        multiply(pow(10, j, 1), 0);
        j = e - 1;
        while(j >= 23){
          divide(1 << 23);
          j -= 23;
        }
        divide(1 << j);
        multiply(1, 1);
        divide(2);
        m = numToString();
      } else {
        multiply(0, z);
        multiply(1 << -e, 0);
        m = numToString() + repeat.call(ZERO, f);
      }
    }
    if(f > 0){
      k = m.length;
      m = s + (k <= f ? '0.' + repeat.call(ZERO, f - k) + m : m.slice(0, k - f) + '.' + m.slice(k - f));
    } else {
      m = s + m;
    } return m;
  }
});
},{"101":101,"106":106,"32":32,"34":34,"4":4}],178:[function(_dereq_,module,exports){
'use strict';
var $export      = _dereq_(32)
  , $fails       = _dereq_(34)
  , aNumberValue = _dereq_(4)
  , $toPrecision = 1..toPrecision;

$export($export.P + $export.F * ($fails(function(){
  // IE7-
  return $toPrecision.call(1, undefined) !== '1';
}) || !$fails(function(){
  // V8 ~ Android 4.3-
  $toPrecision.call({});
})), 'Number', {
  toPrecision: function toPrecision(precision){
    var that = aNumberValue(this, 'Number#toPrecision: incorrect invocation!');
    return precision === undefined ? $toPrecision.call(that) : $toPrecision.call(that, precision); 
  }
});
},{"32":32,"34":34,"4":4}],179:[function(_dereq_,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = _dereq_(32);

$export($export.S + $export.F, 'Object', {assign: _dereq_(65)});
},{"32":32,"65":65}],180:[function(_dereq_,module,exports){
var $export = _dereq_(32);
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: _dereq_(66)});
},{"32":32,"66":66}],181:[function(_dereq_,module,exports){
var $export = _dereq_(32);
// 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
$export($export.S + $export.F * !_dereq_(28), 'Object', {defineProperties: _dereq_(68)});
},{"28":28,"32":32,"68":68}],182:[function(_dereq_,module,exports){
var $export = _dereq_(32);
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !_dereq_(28), 'Object', {defineProperty: _dereq_(67).f});
},{"28":28,"32":32,"67":67}],183:[function(_dereq_,module,exports){
// 19.1.2.5 Object.freeze(O)
var isObject = _dereq_(49)
  , meta     = _dereq_(62).onFreeze;

_dereq_(78)('freeze', function($freeze){
  return function freeze(it){
    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
  };
});
},{"49":49,"62":62,"78":78}],184:[function(_dereq_,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject                 = _dereq_(107)
  , $getOwnPropertyDescriptor = _dereq_(70).f;

_dereq_(78)('getOwnPropertyDescriptor', function(){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"107":107,"70":70,"78":78}],185:[function(_dereq_,module,exports){
// 19.1.2.7 Object.getOwnPropertyNames(O)
_dereq_(78)('getOwnPropertyNames', function(){
  return _dereq_(71).f;
});
},{"71":71,"78":78}],186:[function(_dereq_,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = _dereq_(109)
  , $getPrototypeOf = _dereq_(74);

_dereq_(78)('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"109":109,"74":74,"78":78}],187:[function(_dereq_,module,exports){
// 19.1.2.11 Object.isExtensible(O)
var isObject = _dereq_(49);

_dereq_(78)('isExtensible', function($isExtensible){
  return function isExtensible(it){
    return isObject(it) ? $isExtensible ? $isExtensible(it) : true : false;
  };
});
},{"49":49,"78":78}],188:[function(_dereq_,module,exports){
// 19.1.2.12 Object.isFrozen(O)
var isObject = _dereq_(49);

_dereq_(78)('isFrozen', function($isFrozen){
  return function isFrozen(it){
    return isObject(it) ? $isFrozen ? $isFrozen(it) : false : true;
  };
});
},{"49":49,"78":78}],189:[function(_dereq_,module,exports){
// 19.1.2.13 Object.isSealed(O)
var isObject = _dereq_(49);

_dereq_(78)('isSealed', function($isSealed){
  return function isSealed(it){
    return isObject(it) ? $isSealed ? $isSealed(it) : false : true;
  };
});
},{"49":49,"78":78}],190:[function(_dereq_,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $export = _dereq_(32);
$export($export.S, 'Object', {is: _dereq_(89)});
},{"32":32,"89":89}],191:[function(_dereq_,module,exports){
// 19.1.2.14 Object.keys(O)
var toObject = _dereq_(109)
  , $keys    = _dereq_(76);

_dereq_(78)('keys', function(){
  return function keys(it){
    return $keys(toObject(it));
  };
});
},{"109":109,"76":76,"78":78}],192:[function(_dereq_,module,exports){
// 19.1.2.15 Object.preventExtensions(O)
var isObject = _dereq_(49)
  , meta     = _dereq_(62).onFreeze;

_dereq_(78)('preventExtensions', function($preventExtensions){
  return function preventExtensions(it){
    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
  };
});
},{"49":49,"62":62,"78":78}],193:[function(_dereq_,module,exports){
// 19.1.2.17 Object.seal(O)
var isObject = _dereq_(49)
  , meta     = _dereq_(62).onFreeze;

_dereq_(78)('seal', function($seal){
  return function seal(it){
    return $seal && isObject(it) ? $seal(meta(it)) : it;
  };
});
},{"49":49,"62":62,"78":78}],194:[function(_dereq_,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = _dereq_(32);
$export($export.S, 'Object', {setPrototypeOf: _dereq_(90).set});
},{"32":32,"90":90}],195:[function(_dereq_,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var classof = _dereq_(17)
  , test    = {};
test[_dereq_(117)('toStringTag')] = 'z';
if(test + '' != '[object z]'){
  _dereq_(87)(Object.prototype, 'toString', function toString(){
    return '[object ' + classof(this) + ']';
  }, true);
}
},{"117":117,"17":17,"87":87}],196:[function(_dereq_,module,exports){
var $export     = _dereq_(32)
  , $parseFloat = _dereq_(81);
// 18.2.4 parseFloat(string)
$export($export.G + $export.F * (parseFloat != $parseFloat), {parseFloat: $parseFloat});
},{"32":32,"81":81}],197:[function(_dereq_,module,exports){
var $export   = _dereq_(32)
  , $parseInt = _dereq_(82);
// 18.2.5 parseInt(string, radix)
$export($export.G + $export.F * (parseInt != $parseInt), {parseInt: $parseInt});
},{"32":32,"82":82}],198:[function(_dereq_,module,exports){
'use strict';
var LIBRARY            = _dereq_(58)
  , global             = _dereq_(38)
  , ctx                = _dereq_(25)
  , classof            = _dereq_(17)
  , $export            = _dereq_(32)
  , isObject           = _dereq_(49)
  , aFunction          = _dereq_(3)
  , anInstance         = _dereq_(6)
  , forOf              = _dereq_(37)
  , speciesConstructor = _dereq_(95)
  , task               = _dereq_(104).set
  , microtask          = _dereq_(64)()
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[_dereq_(117)('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = _dereq_(86)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
_dereq_(92)($Promise, PROMISE);
_dereq_(91)(PROMISE);
Wrapper = _dereq_(23)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && _dereq_(54)(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"104":104,"117":117,"17":17,"23":23,"25":25,"3":3,"32":32,"37":37,"38":38,"49":49,"54":54,"58":58,"6":6,"64":64,"86":86,"91":91,"92":92,"95":95}],199:[function(_dereq_,module,exports){
// 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
var $export   = _dereq_(32)
  , aFunction = _dereq_(3)
  , anObject  = _dereq_(7)
  , rApply    = (_dereq_(38).Reflect || {}).apply
  , fApply    = Function.apply;
// MS Edge argumentsList argument is optional
$export($export.S + $export.F * !_dereq_(34)(function(){
  rApply(function(){});
}), 'Reflect', {
  apply: function apply(target, thisArgument, argumentsList){
    var T = aFunction(target)
      , L = anObject(argumentsList);
    return rApply ? rApply(T, thisArgument, L) : fApply.call(T, thisArgument, L);
  }
});
},{"3":3,"32":32,"34":34,"38":38,"7":7}],200:[function(_dereq_,module,exports){
// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
var $export    = _dereq_(32)
  , create     = _dereq_(66)
  , aFunction  = _dereq_(3)
  , anObject   = _dereq_(7)
  , isObject   = _dereq_(49)
  , fails      = _dereq_(34)
  , bind       = _dereq_(16)
  , rConstruct = (_dereq_(38).Reflect || {}).construct;

// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = fails(function(){
  function F(){}
  return !(rConstruct(function(){}, [], F) instanceof F);
});
var ARGS_BUG = !fails(function(){
  rConstruct(function(){});
});

$export($export.S + $export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args /*, newTarget*/){
    aFunction(Target);
    anObject(args);
    var newTarget = arguments.length < 3 ? Target : aFunction(arguments[2]);
    if(ARGS_BUG && !NEW_TARGET_BUG)return rConstruct(Target, args, newTarget);
    if(Target == newTarget){
      // w/o altered newTarget, optimization for 0-4 arguments
      switch(args.length){
        case 0: return new Target;
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (bind.apply(Target, $args));
    }
    // with altered newTarget, not support built-in constructors
    var proto    = newTarget.prototype
      , instance = create(isObject(proto) ? proto : Object.prototype)
      , result   = Function.apply.call(Target, instance, args);
    return isObject(result) ? result : instance;
  }
});
},{"16":16,"3":3,"32":32,"34":34,"38":38,"49":49,"66":66,"7":7}],201:[function(_dereq_,module,exports){
// 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
var dP          = _dereq_(67)
  , $export     = _dereq_(32)
  , anObject    = _dereq_(7)
  , toPrimitive = _dereq_(110);

// MS Edge has broken Reflect.defineProperty - throwing instead of returning false
$export($export.S + $export.F * _dereq_(34)(function(){
  Reflect.defineProperty(dP.f({}, 1, {value: 1}), 1, {value: 2});
}), 'Reflect', {
  defineProperty: function defineProperty(target, propertyKey, attributes){
    anObject(target);
    propertyKey = toPrimitive(propertyKey, true);
    anObject(attributes);
    try {
      dP.f(target, propertyKey, attributes);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"110":110,"32":32,"34":34,"67":67,"7":7}],202:[function(_dereq_,module,exports){
// 26.1.4 Reflect.deleteProperty(target, propertyKey)
var $export  = _dereq_(32)
  , gOPD     = _dereq_(70).f
  , anObject = _dereq_(7);

$export($export.S, 'Reflect', {
  deleteProperty: function deleteProperty(target, propertyKey){
    var desc = gOPD(anObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  }
});
},{"32":32,"7":7,"70":70}],203:[function(_dereq_,module,exports){
'use strict';
// 26.1.5 Reflect.enumerate(target)
var $export  = _dereq_(32)
  , anObject = _dereq_(7);
var Enumerate = function(iterated){
  this._t = anObject(iterated); // target
  this._i = 0;                  // next index
  var keys = this._k = []       // keys
    , key;
  for(key in iterated)keys.push(key);
};
_dereq_(52)(Enumerate, 'Object', function(){
  var that = this
    , keys = that._k
    , key;
  do {
    if(that._i >= keys.length)return {value: undefined, done: true};
  } while(!((key = keys[that._i++]) in that._t));
  return {value: key, done: false};
});

$export($export.S, 'Reflect', {
  enumerate: function enumerate(target){
    return new Enumerate(target);
  }
});
},{"32":32,"52":52,"7":7}],204:[function(_dereq_,module,exports){
// 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
var gOPD     = _dereq_(70)
  , $export  = _dereq_(32)
  , anObject = _dereq_(7);

$export($export.S, 'Reflect', {
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, propertyKey){
    return gOPD.f(anObject(target), propertyKey);
  }
});
},{"32":32,"7":7,"70":70}],205:[function(_dereq_,module,exports){
// 26.1.8 Reflect.getPrototypeOf(target)
var $export  = _dereq_(32)
  , getProto = _dereq_(74)
  , anObject = _dereq_(7);

$export($export.S, 'Reflect', {
  getPrototypeOf: function getPrototypeOf(target){
    return getProto(anObject(target));
  }
});
},{"32":32,"7":7,"74":74}],206:[function(_dereq_,module,exports){
// 26.1.6 Reflect.get(target, propertyKey [, receiver])
var gOPD           = _dereq_(70)
  , getPrototypeOf = _dereq_(74)
  , has            = _dereq_(39)
  , $export        = _dereq_(32)
  , isObject       = _dereq_(49)
  , anObject       = _dereq_(7);

function get(target, propertyKey/*, receiver*/){
  var receiver = arguments.length < 3 ? target : arguments[2]
    , desc, proto;
  if(anObject(target) === receiver)return target[propertyKey];
  if(desc = gOPD.f(target, propertyKey))return has(desc, 'value')
    ? desc.value
    : desc.get !== undefined
      ? desc.get.call(receiver)
      : undefined;
  if(isObject(proto = getPrototypeOf(target)))return get(proto, propertyKey, receiver);
}

$export($export.S, 'Reflect', {get: get});
},{"32":32,"39":39,"49":49,"7":7,"70":70,"74":74}],207:[function(_dereq_,module,exports){
// 26.1.9 Reflect.has(target, propertyKey)
var $export = _dereq_(32);

$export($export.S, 'Reflect', {
  has: function has(target, propertyKey){
    return propertyKey in target;
  }
});
},{"32":32}],208:[function(_dereq_,module,exports){
// 26.1.10 Reflect.isExtensible(target)
var $export       = _dereq_(32)
  , anObject      = _dereq_(7)
  , $isExtensible = Object.isExtensible;

$export($export.S, 'Reflect', {
  isExtensible: function isExtensible(target){
    anObject(target);
    return $isExtensible ? $isExtensible(target) : true;
  }
});
},{"32":32,"7":7}],209:[function(_dereq_,module,exports){
// 26.1.11 Reflect.ownKeys(target)
var $export = _dereq_(32);

$export($export.S, 'Reflect', {ownKeys: _dereq_(80)});
},{"32":32,"80":80}],210:[function(_dereq_,module,exports){
// 26.1.12 Reflect.preventExtensions(target)
var $export            = _dereq_(32)
  , anObject           = _dereq_(7)
  , $preventExtensions = Object.preventExtensions;

$export($export.S, 'Reflect', {
  preventExtensions: function preventExtensions(target){
    anObject(target);
    try {
      if($preventExtensions)$preventExtensions(target);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"32":32,"7":7}],211:[function(_dereq_,module,exports){
// 26.1.14 Reflect.setPrototypeOf(target, proto)
var $export  = _dereq_(32)
  , setProto = _dereq_(90);

if(setProto)$export($export.S, 'Reflect', {
  setPrototypeOf: function setPrototypeOf(target, proto){
    setProto.check(target, proto);
    try {
      setProto.set(target, proto);
      return true;
    } catch(e){
      return false;
    }
  }
});
},{"32":32,"90":90}],212:[function(_dereq_,module,exports){
// 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
var dP             = _dereq_(67)
  , gOPD           = _dereq_(70)
  , getPrototypeOf = _dereq_(74)
  , has            = _dereq_(39)
  , $export        = _dereq_(32)
  , createDesc     = _dereq_(85)
  , anObject       = _dereq_(7)
  , isObject       = _dereq_(49);

function set(target, propertyKey, V/*, receiver*/){
  var receiver = arguments.length < 4 ? target : arguments[3]
    , ownDesc  = gOPD.f(anObject(target), propertyKey)
    , existingDescriptor, proto;
  if(!ownDesc){
    if(isObject(proto = getPrototypeOf(target))){
      return set(proto, propertyKey, V, receiver);
    }
    ownDesc = createDesc(0);
  }
  if(has(ownDesc, 'value')){
    if(ownDesc.writable === false || !isObject(receiver))return false;
    existingDescriptor = gOPD.f(receiver, propertyKey) || createDesc(0);
    existingDescriptor.value = V;
    dP.f(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

$export($export.S, 'Reflect', {set: set});
},{"32":32,"39":39,"49":49,"67":67,"7":7,"70":70,"74":74,"85":85}],213:[function(_dereq_,module,exports){
var global            = _dereq_(38)
  , inheritIfRequired = _dereq_(43)
  , dP                = _dereq_(67).f
  , gOPN              = _dereq_(72).f
  , isRegExp          = _dereq_(50)
  , $flags            = _dereq_(36)
  , $RegExp           = global.RegExp
  , Base              = $RegExp
  , proto             = $RegExp.prototype
  , re1               = /a/g
  , re2               = /a/g
  // "new" creates a new object, old webkit buggy here
  , CORRECT_NEW       = new $RegExp(re1) !== re1;

if(_dereq_(28) && (!CORRECT_NEW || _dereq_(34)(function(){
  re2[_dereq_(117)('match')] = false;
  // RegExp constructor can alter flags and IsRegExp works correct with @@match
  return $RegExp(re1) != re1 || $RegExp(re2) == re2 || $RegExp(re1, 'i') != '/a/i';
}))){
  $RegExp = function RegExp(p, f){
    var tiRE = this instanceof $RegExp
      , piRE = isRegExp(p)
      , fiU  = f === undefined;
    return !tiRE && piRE && p.constructor === $RegExp && fiU ? p
      : inheritIfRequired(CORRECT_NEW
        ? new Base(piRE && !fiU ? p.source : p, f)
        : Base((piRE = p instanceof $RegExp) ? p.source : p, piRE && fiU ? $flags.call(p) : f)
      , tiRE ? this : proto, $RegExp);
  };
  var proxy = function(key){
    key in $RegExp || dP($RegExp, key, {
      configurable: true,
      get: function(){ return Base[key]; },
      set: function(it){ Base[key] = it; }
    });
  };
  for(var keys = gOPN(Base), i = 0; keys.length > i; )proxy(keys[i++]);
  proto.constructor = $RegExp;
  $RegExp.prototype = proto;
  _dereq_(87)(global, 'RegExp', $RegExp);
}

_dereq_(91)('RegExp');
},{"117":117,"28":28,"34":34,"36":36,"38":38,"43":43,"50":50,"67":67,"72":72,"87":87,"91":91}],214:[function(_dereq_,module,exports){
// 21.2.5.3 get RegExp.prototype.flags()
if(_dereq_(28) && /./g.flags != 'g')_dereq_(67).f(RegExp.prototype, 'flags', {
  configurable: true,
  get: _dereq_(36)
});
},{"28":28,"36":36,"67":67}],215:[function(_dereq_,module,exports){
// @@match logic
_dereq_(35)('match', 1, function(defined, MATCH, $match){
  // 21.1.3.11 String.prototype.match(regexp)
  return [function match(regexp){
    'use strict';
    var O  = defined(this)
      , fn = regexp == undefined ? undefined : regexp[MATCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
  }, $match];
});
},{"35":35}],216:[function(_dereq_,module,exports){
// @@replace logic
_dereq_(35)('replace', 2, function(defined, REPLACE, $replace){
  // 21.1.3.14 String.prototype.replace(searchValue, replaceValue)
  return [function replace(searchValue, replaceValue){
    'use strict';
    var O  = defined(this)
      , fn = searchValue == undefined ? undefined : searchValue[REPLACE];
    return fn !== undefined
      ? fn.call(searchValue, O, replaceValue)
      : $replace.call(String(O), searchValue, replaceValue);
  }, $replace];
});
},{"35":35}],217:[function(_dereq_,module,exports){
// @@search logic
_dereq_(35)('search', 1, function(defined, SEARCH, $search){
  // 21.1.3.15 String.prototype.search(regexp)
  return [function search(regexp){
    'use strict';
    var O  = defined(this)
      , fn = regexp == undefined ? undefined : regexp[SEARCH];
    return fn !== undefined ? fn.call(regexp, O) : new RegExp(regexp)[SEARCH](String(O));
  }, $search];
});
},{"35":35}],218:[function(_dereq_,module,exports){
// @@split logic
_dereq_(35)('split', 2, function(defined, SPLIT, $split){
  'use strict';
  var isRegExp   = _dereq_(50)
    , _split     = $split
    , $push      = [].push
    , $SPLIT     = 'split'
    , LENGTH     = 'length'
    , LAST_INDEX = 'lastIndex';
  if(
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ){
    var NPCG = /()??/.exec('')[1] === undefined; // nonparticipating capturing group
    // based on es5-shim implementation, need to rework it
    $split = function(separator, limit){
      var string = String(this);
      if(separator === undefined && limit === 0)return [];
      // If `separator` is not a regex, use native split
      if(!isRegExp(separator))return _split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? 4294967295 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var separator2, match, lastIndex, lastLength, i;
      // Doesn't need flags gy, but they don't hurt
      if(!NPCG)separator2 = new RegExp('^' + separatorCopy.source + '$(?!\\s)', flags);
      while(match = separatorCopy.exec(string)){
        // `separatorCopy.lastIndex` is not reliable cross-browser
        lastIndex = match.index + match[0][LENGTH];
        if(lastIndex > lastLastIndex){
          output.push(string.slice(lastLastIndex, match.index));
          // Fix browsers whose `exec` methods don't consistently return `undefined` for NPCG
          if(!NPCG && match[LENGTH] > 1)match[0].replace(separator2, function(){
            for(i = 1; i < arguments[LENGTH] - 2; i++)if(arguments[i] === undefined)match[i] = undefined;
          });
          if(match[LENGTH] > 1 && match.index < string[LENGTH])$push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if(output[LENGTH] >= splitLimit)break;
        }
        if(separatorCopy[LAST_INDEX] === match.index)separatorCopy[LAST_INDEX]++; // Avoid an infinite loop
      }
      if(lastLastIndex === string[LENGTH]){
        if(lastLength || !separatorCopy.test(''))output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if('0'[$SPLIT](undefined, 0)[LENGTH]){
    $split = function(separator, limit){
      return separator === undefined && limit === 0 ? [] : _split.call(this, separator, limit);
    };
  }
  // 21.1.3.17 String.prototype.split(separator, limit)
  return [function split(separator, limit){
    var O  = defined(this)
      , fn = separator == undefined ? undefined : separator[SPLIT];
    return fn !== undefined ? fn.call(separator, O, limit) : $split.call(String(O), separator, limit);
  }, $split];
});
},{"35":35,"50":50}],219:[function(_dereq_,module,exports){
'use strict';
_dereq_(214);
var anObject    = _dereq_(7)
  , $flags      = _dereq_(36)
  , DESCRIPTORS = _dereq_(28)
  , TO_STRING   = 'toString'
  , $toString   = /./[TO_STRING];

var define = function(fn){
  _dereq_(87)(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if(_dereq_(34)(function(){ return $toString.call({source: 'a', flags: 'b'}) != '/a/b'; })){
  define(function toString(){
    var R = anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !DESCRIPTORS && R instanceof RegExp ? $flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if($toString.name != TO_STRING){
  define(function toString(){
    return $toString.call(this);
  });
}
},{"214":214,"28":28,"34":34,"36":36,"7":7,"87":87}],220:[function(_dereq_,module,exports){
'use strict';
var strong = _dereq_(19);

// 23.2 Set Objects
module.exports = _dereq_(22)('Set', function(get){
  return function Set(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"19":19,"22":22}],221:[function(_dereq_,module,exports){
'use strict';
// B.2.3.2 String.prototype.anchor(name)
_dereq_(99)('anchor', function(createHTML){
  return function anchor(name){
    return createHTML(this, 'a', 'name', name);
  }
});
},{"99":99}],222:[function(_dereq_,module,exports){
'use strict';
// B.2.3.3 String.prototype.big()
_dereq_(99)('big', function(createHTML){
  return function big(){
    return createHTML(this, 'big', '', '');
  }
});
},{"99":99}],223:[function(_dereq_,module,exports){
'use strict';
// B.2.3.4 String.prototype.blink()
_dereq_(99)('blink', function(createHTML){
  return function blink(){
    return createHTML(this, 'blink', '', '');
  }
});
},{"99":99}],224:[function(_dereq_,module,exports){
'use strict';
// B.2.3.5 String.prototype.bold()
_dereq_(99)('bold', function(createHTML){
  return function bold(){
    return createHTML(this, 'b', '', '');
  }
});
},{"99":99}],225:[function(_dereq_,module,exports){
'use strict';
var $export = _dereq_(32)
  , $at     = _dereq_(97)(false);
$export($export.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: function codePointAt(pos){
    return $at(this, pos);
  }
});
},{"32":32,"97":97}],226:[function(_dereq_,module,exports){
// 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
'use strict';
var $export   = _dereq_(32)
  , toLength  = _dereq_(108)
  , context   = _dereq_(98)
  , ENDS_WITH = 'endsWith'
  , $endsWith = ''[ENDS_WITH];

$export($export.P + $export.F * _dereq_(33)(ENDS_WITH), 'String', {
  endsWith: function endsWith(searchString /*, endPosition = @length */){
    var that = context(this, searchString, ENDS_WITH)
      , endPosition = arguments.length > 1 ? arguments[1] : undefined
      , len    = toLength(that.length)
      , end    = endPosition === undefined ? len : Math.min(toLength(endPosition), len)
      , search = String(searchString);
    return $endsWith
      ? $endsWith.call(that, search, end)
      : that.slice(end - search.length, end) === search;
  }
});
},{"108":108,"32":32,"33":33,"98":98}],227:[function(_dereq_,module,exports){
'use strict';
// B.2.3.6 String.prototype.fixed()
_dereq_(99)('fixed', function(createHTML){
  return function fixed(){
    return createHTML(this, 'tt', '', '');
  }
});
},{"99":99}],228:[function(_dereq_,module,exports){
'use strict';
// B.2.3.7 String.prototype.fontcolor(color)
_dereq_(99)('fontcolor', function(createHTML){
  return function fontcolor(color){
    return createHTML(this, 'font', 'color', color);
  }
});
},{"99":99}],229:[function(_dereq_,module,exports){
'use strict';
// B.2.3.8 String.prototype.fontsize(size)
_dereq_(99)('fontsize', function(createHTML){
  return function fontsize(size){
    return createHTML(this, 'font', 'size', size);
  }
});
},{"99":99}],230:[function(_dereq_,module,exports){
var $export        = _dereq_(32)
  , toIndex        = _dereq_(105)
  , fromCharCode   = String.fromCharCode
  , $fromCodePoint = String.fromCodePoint;

// length should be 1, old FF problem
$export($export.S + $export.F * (!!$fromCodePoint && $fromCodePoint.length != 1), 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function fromCodePoint(x){ // eslint-disable-line no-unused-vars
    var res  = []
      , aLen = arguments.length
      , i    = 0
      , code;
    while(aLen > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"105":105,"32":32}],231:[function(_dereq_,module,exports){
// 21.1.3.7 String.prototype.includes(searchString, position = 0)
'use strict';
var $export  = _dereq_(32)
  , context  = _dereq_(98)
  , INCLUDES = 'includes';

$export($export.P + $export.F * _dereq_(33)(INCLUDES), 'String', {
  includes: function includes(searchString /*, position = 0 */){
    return !!~context(this, searchString, INCLUDES)
      .indexOf(searchString, arguments.length > 1 ? arguments[1] : undefined);
  }
});
},{"32":32,"33":33,"98":98}],232:[function(_dereq_,module,exports){
'use strict';
// B.2.3.9 String.prototype.italics()
_dereq_(99)('italics', function(createHTML){
  return function italics(){
    return createHTML(this, 'i', '', '');
  }
});
},{"99":99}],233:[function(_dereq_,module,exports){
'use strict';
var $at  = _dereq_(97)(true);

// 21.1.3.27 String.prototype[@@iterator]()
_dereq_(53)(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"53":53,"97":97}],234:[function(_dereq_,module,exports){
'use strict';
// B.2.3.10 String.prototype.link(url)
_dereq_(99)('link', function(createHTML){
  return function link(url){
    return createHTML(this, 'a', 'href', url);
  }
});
},{"99":99}],235:[function(_dereq_,module,exports){
var $export   = _dereq_(32)
  , toIObject = _dereq_(107)
  , toLength  = _dereq_(108);

$export($export.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function raw(callSite){
    var tpl  = toIObject(callSite.raw)
      , len  = toLength(tpl.length)
      , aLen = arguments.length
      , res  = []
      , i    = 0;
    while(len > i){
      res.push(String(tpl[i++]));
      if(i < aLen)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"107":107,"108":108,"32":32}],236:[function(_dereq_,module,exports){
var $export = _dereq_(32);

$export($export.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: _dereq_(101)
});
},{"101":101,"32":32}],237:[function(_dereq_,module,exports){
'use strict';
// B.2.3.11 String.prototype.small()
_dereq_(99)('small', function(createHTML){
  return function small(){
    return createHTML(this, 'small', '', '');
  }
});
},{"99":99}],238:[function(_dereq_,module,exports){
// 21.1.3.18 String.prototype.startsWith(searchString [, position ])
'use strict';
var $export     = _dereq_(32)
  , toLength    = _dereq_(108)
  , context     = _dereq_(98)
  , STARTS_WITH = 'startsWith'
  , $startsWith = ''[STARTS_WITH];

$export($export.P + $export.F * _dereq_(33)(STARTS_WITH), 'String', {
  startsWith: function startsWith(searchString /*, position = 0 */){
    var that   = context(this, searchString, STARTS_WITH)
      , index  = toLength(Math.min(arguments.length > 1 ? arguments[1] : undefined, that.length))
      , search = String(searchString);
    return $startsWith
      ? $startsWith.call(that, search, index)
      : that.slice(index, index + search.length) === search;
  }
});
},{"108":108,"32":32,"33":33,"98":98}],239:[function(_dereq_,module,exports){
'use strict';
// B.2.3.12 String.prototype.strike()
_dereq_(99)('strike', function(createHTML){
  return function strike(){
    return createHTML(this, 'strike', '', '');
  }
});
},{"99":99}],240:[function(_dereq_,module,exports){
'use strict';
// B.2.3.13 String.prototype.sub()
_dereq_(99)('sub', function(createHTML){
  return function sub(){
    return createHTML(this, 'sub', '', '');
  }
});
},{"99":99}],241:[function(_dereq_,module,exports){
'use strict';
// B.2.3.14 String.prototype.sup()
_dereq_(99)('sup', function(createHTML){
  return function sup(){
    return createHTML(this, 'sup', '', '');
  }
});
},{"99":99}],242:[function(_dereq_,module,exports){
'use strict';
// 21.1.3.25 String.prototype.trim()
_dereq_(102)('trim', function($trim){
  return function trim(){
    return $trim(this, 3);
  };
});
},{"102":102}],243:[function(_dereq_,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = _dereq_(38)
  , has            = _dereq_(39)
  , DESCRIPTORS    = _dereq_(28)
  , $export        = _dereq_(32)
  , redefine       = _dereq_(87)
  , META           = _dereq_(62).KEY
  , $fails         = _dereq_(34)
  , shared         = _dereq_(94)
  , setToStringTag = _dereq_(92)
  , uid            = _dereq_(114)
  , wks            = _dereq_(117)
  , wksExt         = _dereq_(116)
  , wksDefine      = _dereq_(115)
  , keyOf          = _dereq_(57)
  , enumKeys       = _dereq_(31)
  , isArray        = _dereq_(47)
  , anObject       = _dereq_(7)
  , toIObject      = _dereq_(107)
  , toPrimitive    = _dereq_(110)
  , createDesc     = _dereq_(85)
  , _create        = _dereq_(66)
  , gOPNExt        = _dereq_(71)
  , $GOPD          = _dereq_(70)
  , $DP            = _dereq_(67)
  , $keys          = _dereq_(76)
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , OPSymbols      = shared('op-symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;
// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  it  = toIObject(it);
  key = toPrimitive(key, true);
  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
  var D = gOPD(it, key);
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  } return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var IS_OP  = it === ObjectProto
    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i){
    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
  } return result;
};

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
    var $set = function(value){
      if(this === ObjectProto)$set.call(OPSymbols, value);
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    };
    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
    return wrap(tag);
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  _dereq_(72).f = gOPNExt.f = $getOwnPropertyNames;
  _dereq_(77).f  = $propertyIsEnumerable;
  _dereq_(73).f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !_dereq_(58)){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }

  wksExt.f = function(name){
    return wrap(wks(name));
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

for(var symbols = (
  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
})), 'JSON', {
  stringify: function stringify(it){
    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
    var args = [it]
      , i    = 1
      , replacer, $replacer;
    while(arguments.length > i)args.push(arguments[i++]);
    replacer = args[1];
    if(typeof replacer == 'function')$replacer = replacer;
    if($replacer || !isArray(replacer))replacer = function(key, value){
      if($replacer)value = $replacer.call(this, key, value);
      if(!isSymbol(value))return value;
    };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  }
});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || _dereq_(40)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"107":107,"110":110,"114":114,"115":115,"116":116,"117":117,"28":28,"31":31,"32":32,"34":34,"38":38,"39":39,"40":40,"47":47,"57":57,"58":58,"62":62,"66":66,"67":67,"7":7,"70":70,"71":71,"72":72,"73":73,"76":76,"77":77,"85":85,"87":87,"92":92,"94":94}],244:[function(_dereq_,module,exports){
'use strict';
var $export      = _dereq_(32)
  , $typed       = _dereq_(113)
  , buffer       = _dereq_(112)
  , anObject     = _dereq_(7)
  , toIndex      = _dereq_(105)
  , toLength     = _dereq_(108)
  , isObject     = _dereq_(49)
  , ArrayBuffer  = _dereq_(38).ArrayBuffer
  , speciesConstructor = _dereq_(95)
  , $ArrayBuffer = buffer.ArrayBuffer
  , $DataView    = buffer.DataView
  , $isView      = $typed.ABV && ArrayBuffer.isView
  , $slice       = $ArrayBuffer.prototype.slice
  , VIEW         = $typed.VIEW
  , ARRAY_BUFFER = 'ArrayBuffer';

$export($export.G + $export.W + $export.F * (ArrayBuffer !== $ArrayBuffer), {ArrayBuffer: $ArrayBuffer});

$export($export.S + $export.F * !$typed.CONSTR, ARRAY_BUFFER, {
  // 24.1.3.1 ArrayBuffer.isView(arg)
  isView: function isView(it){
    return $isView && $isView(it) || isObject(it) && VIEW in it;
  }
});

$export($export.P + $export.U + $export.F * _dereq_(34)(function(){
  return !new $ArrayBuffer(2).slice(1, undefined).byteLength;
}), ARRAY_BUFFER, {
  // 24.1.4.3 ArrayBuffer.prototype.slice(start, end)
  slice: function slice(start, end){
    if($slice !== undefined && end === undefined)return $slice.call(anObject(this), start); // FF fix
    var len    = anObject(this).byteLength
      , first  = toIndex(start, len)
      , final  = toIndex(end === undefined ? len : end, len)
      , result = new (speciesConstructor(this, $ArrayBuffer))(toLength(final - first))
      , viewS  = new $DataView(this)
      , viewT  = new $DataView(result)
      , index  = 0;
    while(first < final){
      viewT.setUint8(index++, viewS.getUint8(first++));
    } return result;
  }
});

_dereq_(91)(ARRAY_BUFFER);
},{"105":105,"108":108,"112":112,"113":113,"32":32,"34":34,"38":38,"49":49,"7":7,"91":91,"95":95}],245:[function(_dereq_,module,exports){
var $export = _dereq_(32);
$export($export.G + $export.W + $export.F * !_dereq_(113).ABV, {
  DataView: _dereq_(112).DataView
});
},{"112":112,"113":113,"32":32}],246:[function(_dereq_,module,exports){
_dereq_(111)('Float32', 4, function(init){
  return function Float32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],247:[function(_dereq_,module,exports){
_dereq_(111)('Float64', 8, function(init){
  return function Float64Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],248:[function(_dereq_,module,exports){
_dereq_(111)('Int16', 2, function(init){
  return function Int16Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],249:[function(_dereq_,module,exports){
_dereq_(111)('Int32', 4, function(init){
  return function Int32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],250:[function(_dereq_,module,exports){
_dereq_(111)('Int8', 1, function(init){
  return function Int8Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],251:[function(_dereq_,module,exports){
_dereq_(111)('Uint16', 2, function(init){
  return function Uint16Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],252:[function(_dereq_,module,exports){
_dereq_(111)('Uint32', 4, function(init){
  return function Uint32Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],253:[function(_dereq_,module,exports){
_dereq_(111)('Uint8', 1, function(init){
  return function Uint8Array(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
});
},{"111":111}],254:[function(_dereq_,module,exports){
_dereq_(111)('Uint8', 1, function(init){
  return function Uint8ClampedArray(data, byteOffset, length){
    return init(this, data, byteOffset, length);
  };
}, true);
},{"111":111}],255:[function(_dereq_,module,exports){
'use strict';
var each         = _dereq_(12)(0)
  , redefine     = _dereq_(87)
  , meta         = _dereq_(62)
  , assign       = _dereq_(65)
  , weak         = _dereq_(21)
  , isObject     = _dereq_(49)
  , getWeak      = meta.getWeak
  , isExtensible = Object.isExtensible
  , uncaughtFrozenStore = weak.ufstore
  , tmp          = {}
  , InternalMap;

var wrapper = function(get){
  return function WeakMap(){
    return get(this, arguments.length > 0 ? arguments[0] : undefined);
  };
};

var methods = {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function get(key){
    if(isObject(key)){
      var data = getWeak(key);
      if(data === true)return uncaughtFrozenStore(this).get(key);
      return data ? data[this._i] : undefined;
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function set(key, value){
    return weak.def(this, key, value);
  }
};

// 23.3 WeakMap Objects
var $WeakMap = module.exports = _dereq_(22)('WeakMap', wrapper, methods, weak, true, true);

// IE11 WeakMap frozen keys fix
if(new $WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  InternalMap = weak.getConstructor(wrapper);
  assign(InternalMap.prototype, methods);
  meta.NEED = true;
  each(['delete', 'has', 'get', 'set'], function(key){
    var proto  = $WeakMap.prototype
      , method = proto[key];
    redefine(proto, key, function(a, b){
      // store frozen objects on internal weakmap shim
      if(isObject(a) && !isExtensible(a)){
        if(!this._f)this._f = new InternalMap;
        var result = this._f[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    });
  });
}
},{"12":12,"21":21,"22":22,"49":49,"62":62,"65":65,"87":87}],256:[function(_dereq_,module,exports){
'use strict';
var weak = _dereq_(21);

// 23.4 WeakSet Objects
_dereq_(22)('WeakSet', function(get){
  return function WeakSet(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function add(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"21":21,"22":22}],257:[function(_dereq_,module,exports){
'use strict';
// https://github.com/tc39/Array.prototype.includes
var $export   = _dereq_(32)
  , $includes = _dereq_(11)(true);

$export($export.P, 'Array', {
  includes: function includes(el /*, fromIndex = 0 */){
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

_dereq_(5)('includes');
},{"11":11,"32":32,"5":5}],258:[function(_dereq_,module,exports){
// https://github.com/rwaldron/tc39-notes/blob/master/es6/2014-09/sept-25.md#510-globalasap-for-enqueuing-a-microtask
var $export   = _dereq_(32)
  , microtask = _dereq_(64)()
  , process   = _dereq_(38).process
  , isNode    = _dereq_(18)(process) == 'process';

$export($export.G, {
  asap: function asap(fn){
    var domain = isNode && process.domain;
    microtask(domain ? domain.bind(fn) : fn);
  }
});
},{"18":18,"32":32,"38":38,"64":64}],259:[function(_dereq_,module,exports){
// https://github.com/ljharb/proposal-is-error
var $export = _dereq_(32)
  , cof     = _dereq_(18);

$export($export.S, 'Error', {
  isError: function isError(it){
    return cof(it) === 'Error';
  }
});
},{"18":18,"32":32}],260:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = _dereq_(32);

$export($export.P + $export.R, 'Map', {toJSON: _dereq_(20)('Map')});
},{"20":20,"32":32}],261:[function(_dereq_,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = _dereq_(32);

$export($export.S, 'Math', {
  iaddh: function iaddh(x0, x1, y0, y1){
    var $x0 = x0 >>> 0
      , $x1 = x1 >>> 0
      , $y0 = y0 >>> 0;
    return $x1 + (y1 >>> 0) + (($x0 & $y0 | ($x0 | $y0) & ~($x0 + $y0 >>> 0)) >>> 31) | 0;
  }
});
},{"32":32}],262:[function(_dereq_,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = _dereq_(32);

$export($export.S, 'Math', {
  imulh: function imulh(u, v){
    var UINT16 = 0xffff
      , $u = +u
      , $v = +v
      , u0 = $u & UINT16
      , v0 = $v & UINT16
      , u1 = $u >> 16
      , v1 = $v >> 16
      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >> 16);
  }
});
},{"32":32}],263:[function(_dereq_,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = _dereq_(32);

$export($export.S, 'Math', {
  isubh: function isubh(x0, x1, y0, y1){
    var $x0 = x0 >>> 0
      , $x1 = x1 >>> 0
      , $y0 = y0 >>> 0;
    return $x1 - (y1 >>> 0) - ((~$x0 & $y0 | ~($x0 ^ $y0) & $x0 - $y0 >>> 0) >>> 31) | 0;
  }
});
},{"32":32}],264:[function(_dereq_,module,exports){
// https://gist.github.com/BrendanEich/4294d5c212a6d2254703
var $export = _dereq_(32);

$export($export.S, 'Math', {
  umulh: function umulh(u, v){
    var UINT16 = 0xffff
      , $u = +u
      , $v = +v
      , u0 = $u & UINT16
      , v0 = $v & UINT16
      , u1 = $u >>> 16
      , v1 = $v >>> 16
      , t  = (u1 * v0 >>> 0) + (u0 * v0 >>> 16);
    return u1 * v1 + (t >>> 16) + ((u0 * v1 >>> 0) + (t & UINT16) >>> 16);
  }
});
},{"32":32}],265:[function(_dereq_,module,exports){
'use strict';
var $export         = _dereq_(32)
  , toObject        = _dereq_(109)
  , aFunction       = _dereq_(3)
  , $defineProperty = _dereq_(67);

// B.2.2.2 Object.prototype.__defineGetter__(P, getter)
_dereq_(28) && $export($export.P + _dereq_(69), 'Object', {
  __defineGetter__: function __defineGetter__(P, getter){
    $defineProperty.f(toObject(this), P, {get: aFunction(getter), enumerable: true, configurable: true});
  }
});
},{"109":109,"28":28,"3":3,"32":32,"67":67,"69":69}],266:[function(_dereq_,module,exports){
'use strict';
var $export         = _dereq_(32)
  , toObject        = _dereq_(109)
  , aFunction       = _dereq_(3)
  , $defineProperty = _dereq_(67);

// B.2.2.3 Object.prototype.__defineSetter__(P, setter)
_dereq_(28) && $export($export.P + _dereq_(69), 'Object', {
  __defineSetter__: function __defineSetter__(P, setter){
    $defineProperty.f(toObject(this), P, {set: aFunction(setter), enumerable: true, configurable: true});
  }
});
},{"109":109,"28":28,"3":3,"32":32,"67":67,"69":69}],267:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export  = _dereq_(32)
  , $entries = _dereq_(79)(true);

$export($export.S, 'Object', {
  entries: function entries(it){
    return $entries(it);
  }
});
},{"32":32,"79":79}],268:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-object-getownpropertydescriptors
var $export        = _dereq_(32)
  , ownKeys        = _dereq_(80)
  , toIObject      = _dereq_(107)
  , gOPD           = _dereq_(70)
  , createProperty = _dereq_(24);

$export($export.S, 'Object', {
  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
    var O       = toIObject(object)
      , getDesc = gOPD.f
      , keys    = ownKeys(O)
      , result  = {}
      , i       = 0
      , key;
    while(keys.length > i)createProperty(result, key = keys[i++], getDesc(O, key));
    return result;
  }
});
},{"107":107,"24":24,"32":32,"70":70,"80":80}],269:[function(_dereq_,module,exports){
'use strict';
var $export                  = _dereq_(32)
  , toObject                 = _dereq_(109)
  , toPrimitive              = _dereq_(110)
  , getPrototypeOf           = _dereq_(74)
  , getOwnPropertyDescriptor = _dereq_(70).f;

// B.2.2.4 Object.prototype.__lookupGetter__(P)
_dereq_(28) && $export($export.P + _dereq_(69), 'Object', {
  __lookupGetter__: function __lookupGetter__(P){
    var O = toObject(this)
      , K = toPrimitive(P, true)
      , D;
    do {
      if(D = getOwnPropertyDescriptor(O, K))return D.get;
    } while(O = getPrototypeOf(O));
  }
});
},{"109":109,"110":110,"28":28,"32":32,"69":69,"70":70,"74":74}],270:[function(_dereq_,module,exports){
'use strict';
var $export                  = _dereq_(32)
  , toObject                 = _dereq_(109)
  , toPrimitive              = _dereq_(110)
  , getPrototypeOf           = _dereq_(74)
  , getOwnPropertyDescriptor = _dereq_(70).f;

// B.2.2.5 Object.prototype.__lookupSetter__(P)
_dereq_(28) && $export($export.P + _dereq_(69), 'Object', {
  __lookupSetter__: function __lookupSetter__(P){
    var O = toObject(this)
      , K = toPrimitive(P, true)
      , D;
    do {
      if(D = getOwnPropertyDescriptor(O, K))return D.set;
    } while(O = getPrototypeOf(O));
  }
});
},{"109":109,"110":110,"28":28,"32":32,"69":69,"70":70,"74":74}],271:[function(_dereq_,module,exports){
// https://github.com/tc39/proposal-object-values-entries
var $export = _dereq_(32)
  , $values = _dereq_(79)(false);

$export($export.S, 'Object', {
  values: function values(it){
    return $values(it);
  }
});
},{"32":32,"79":79}],272:[function(_dereq_,module,exports){
'use strict';
// https://github.com/zenparsing/es-observable
var $export     = _dereq_(32)
  , global      = _dereq_(38)
  , core        = _dereq_(23)
  , microtask   = _dereq_(64)()
  , OBSERVABLE  = _dereq_(117)('observable')
  , aFunction   = _dereq_(3)
  , anObject    = _dereq_(7)
  , anInstance  = _dereq_(6)
  , redefineAll = _dereq_(86)
  , hide        = _dereq_(40)
  , forOf       = _dereq_(37)
  , RETURN      = forOf.RETURN;

var getMethod = function(fn){
  return fn == null ? undefined : aFunction(fn);
};

var cleanupSubscription = function(subscription){
  var cleanup = subscription._c;
  if(cleanup){
    subscription._c = undefined;
    cleanup();
  }
};

var subscriptionClosed = function(subscription){
  return subscription._o === undefined;
};

var closeSubscription = function(subscription){
  if(!subscriptionClosed(subscription)){
    subscription._o = undefined;
    cleanupSubscription(subscription);
  }
};

var Subscription = function(observer, subscriber){
  anObject(observer);
  this._c = undefined;
  this._o = observer;
  observer = new SubscriptionObserver(this);
  try {
    var cleanup      = subscriber(observer)
      , subscription = cleanup;
    if(cleanup != null){
      if(typeof cleanup.unsubscribe === 'function')cleanup = function(){ subscription.unsubscribe(); };
      else aFunction(cleanup);
      this._c = cleanup;
    }
  } catch(e){
    observer.error(e);
    return;
  } if(subscriptionClosed(this))cleanupSubscription(this);
};

Subscription.prototype = redefineAll({}, {
  unsubscribe: function unsubscribe(){ closeSubscription(this); }
});

var SubscriptionObserver = function(subscription){
  this._s = subscription;
};

SubscriptionObserver.prototype = redefineAll({}, {
  next: function next(value){
    var subscription = this._s;
    if(!subscriptionClosed(subscription)){
      var observer = subscription._o;
      try {
        var m = getMethod(observer.next);
        if(m)return m.call(observer, value);
      } catch(e){
        try {
          closeSubscription(subscription);
        } finally {
          throw e;
        }
      }
    }
  },
  error: function error(value){
    var subscription = this._s;
    if(subscriptionClosed(subscription))throw value;
    var observer = subscription._o;
    subscription._o = undefined;
    try {
      var m = getMethod(observer.error);
      if(!m)throw value;
      value = m.call(observer, value);
    } catch(e){
      try {
        cleanupSubscription(subscription);
      } finally {
        throw e;
      }
    } cleanupSubscription(subscription);
    return value;
  },
  complete: function complete(value){
    var subscription = this._s;
    if(!subscriptionClosed(subscription)){
      var observer = subscription._o;
      subscription._o = undefined;
      try {
        var m = getMethod(observer.complete);
        value = m ? m.call(observer, value) : undefined;
      } catch(e){
        try {
          cleanupSubscription(subscription);
        } finally {
          throw e;
        }
      } cleanupSubscription(subscription);
      return value;
    }
  }
});

var $Observable = function Observable(subscriber){
  anInstance(this, $Observable, 'Observable', '_f')._f = aFunction(subscriber);
};

redefineAll($Observable.prototype, {
  subscribe: function subscribe(observer){
    return new Subscription(observer, this._f);
  },
  forEach: function forEach(fn){
    var that = this;
    return new (core.Promise || global.Promise)(function(resolve, reject){
      aFunction(fn);
      var subscription = that.subscribe({
        next : function(value){
          try {
            return fn(value);
          } catch(e){
            reject(e);
            subscription.unsubscribe();
          }
        },
        error: reject,
        complete: resolve
      });
    });
  }
});

redefineAll($Observable, {
  from: function from(x){
    var C = typeof this === 'function' ? this : $Observable;
    var method = getMethod(anObject(x)[OBSERVABLE]);
    if(method){
      var observable = anObject(method.call(x));
      return observable.constructor === C ? observable : new C(function(observer){
        return observable.subscribe(observer);
      });
    }
    return new C(function(observer){
      var done = false;
      microtask(function(){
        if(!done){
          try {
            if(forOf(x, false, function(it){
              observer.next(it);
              if(done)return RETURN;
            }) === RETURN)return;
          } catch(e){
            if(done)throw e;
            observer.error(e);
            return;
          } observer.complete();
        }
      });
      return function(){ done = true; };
    });
  },
  of: function of(){
    for(var i = 0, l = arguments.length, items = Array(l); i < l;)items[i] = arguments[i++];
    return new (typeof this === 'function' ? this : $Observable)(function(observer){
      var done = false;
      microtask(function(){
        if(!done){
          for(var i = 0; i < items.length; ++i){
            observer.next(items[i]);
            if(done)return;
          } observer.complete();
        }
      });
      return function(){ done = true; };
    });
  }
});

hide($Observable.prototype, OBSERVABLE, function(){ return this; });

$export($export.G, {Observable: $Observable});

_dereq_(91)('Observable');
},{"117":117,"23":23,"3":3,"32":32,"37":37,"38":38,"40":40,"6":6,"64":64,"7":7,"86":86,"91":91}],273:[function(_dereq_,module,exports){
var metadata                  = _dereq_(63)
  , anObject                  = _dereq_(7)
  , toMetaKey                 = metadata.key
  , ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({defineMetadata: function defineMetadata(metadataKey, metadataValue, target, targetKey){
  ordinaryDefineOwnMetadata(metadataKey, metadataValue, anObject(target), toMetaKey(targetKey));
}});
},{"63":63,"7":7}],274:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , toMetaKey              = metadata.key
  , getOrCreateMetadataMap = metadata.map
  , store                  = metadata.store;

metadata.exp({deleteMetadata: function deleteMetadata(metadataKey, target /*, targetKey */){
  var targetKey   = arguments.length < 3 ? undefined : toMetaKey(arguments[2])
    , metadataMap = getOrCreateMetadataMap(anObject(target), targetKey, false);
  if(metadataMap === undefined || !metadataMap['delete'](metadataKey))return false;
  if(metadataMap.size)return true;
  var targetMetadata = store.get(target);
  targetMetadata['delete'](targetKey);
  return !!targetMetadata.size || store['delete'](target);
}});
},{"63":63,"7":7}],275:[function(_dereq_,module,exports){
var Set                     = _dereq_(220)
  , from                    = _dereq_(10)
  , metadata                = _dereq_(63)
  , anObject                = _dereq_(7)
  , getPrototypeOf          = _dereq_(74)
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

var ordinaryMetadataKeys = function(O, P){
  var oKeys  = ordinaryOwnMetadataKeys(O, P)
    , parent = getPrototypeOf(O);
  if(parent === null)return oKeys;
  var pKeys  = ordinaryMetadataKeys(parent, P);
  return pKeys.length ? oKeys.length ? from(new Set(oKeys.concat(pKeys))) : pKeys : oKeys;
};

metadata.exp({getMetadataKeys: function getMetadataKeys(target /*, targetKey */){
  return ordinaryMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
}});
},{"10":10,"220":220,"63":63,"7":7,"74":74}],276:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , getPrototypeOf         = _dereq_(74)
  , ordinaryHasOwnMetadata = metadata.has
  , ordinaryGetOwnMetadata = metadata.get
  , toMetaKey              = metadata.key;

var ordinaryGetMetadata = function(MetadataKey, O, P){
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if(hasOwn)return ordinaryGetOwnMetadata(MetadataKey, O, P);
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryGetMetadata(MetadataKey, parent, P) : undefined;
};

metadata.exp({getMetadata: function getMetadata(metadataKey, target /*, targetKey */){
  return ordinaryGetMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"63":63,"7":7,"74":74}],277:[function(_dereq_,module,exports){
var metadata                = _dereq_(63)
  , anObject                = _dereq_(7)
  , ordinaryOwnMetadataKeys = metadata.keys
  , toMetaKey               = metadata.key;

metadata.exp({getOwnMetadataKeys: function getOwnMetadataKeys(target /*, targetKey */){
  return ordinaryOwnMetadataKeys(anObject(target), arguments.length < 2 ? undefined : toMetaKey(arguments[1]));
}});
},{"63":63,"7":7}],278:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , ordinaryGetOwnMetadata = metadata.get
  , toMetaKey              = metadata.key;

metadata.exp({getOwnMetadata: function getOwnMetadata(metadataKey, target /*, targetKey */){
  return ordinaryGetOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"63":63,"7":7}],279:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , getPrototypeOf         = _dereq_(74)
  , ordinaryHasOwnMetadata = metadata.has
  , toMetaKey              = metadata.key;

var ordinaryHasMetadata = function(MetadataKey, O, P){
  var hasOwn = ordinaryHasOwnMetadata(MetadataKey, O, P);
  if(hasOwn)return true;
  var parent = getPrototypeOf(O);
  return parent !== null ? ordinaryHasMetadata(MetadataKey, parent, P) : false;
};

metadata.exp({hasMetadata: function hasMetadata(metadataKey, target /*, targetKey */){
  return ordinaryHasMetadata(metadataKey, anObject(target), arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"63":63,"7":7,"74":74}],280:[function(_dereq_,module,exports){
var metadata               = _dereq_(63)
  , anObject               = _dereq_(7)
  , ordinaryHasOwnMetadata = metadata.has
  , toMetaKey              = metadata.key;

metadata.exp({hasOwnMetadata: function hasOwnMetadata(metadataKey, target /*, targetKey */){
  return ordinaryHasOwnMetadata(metadataKey, anObject(target)
    , arguments.length < 3 ? undefined : toMetaKey(arguments[2]));
}});
},{"63":63,"7":7}],281:[function(_dereq_,module,exports){
var metadata                  = _dereq_(63)
  , anObject                  = _dereq_(7)
  , aFunction                 = _dereq_(3)
  , toMetaKey                 = metadata.key
  , ordinaryDefineOwnMetadata = metadata.set;

metadata.exp({metadata: function metadata(metadataKey, metadataValue){
  return function decorator(target, targetKey){
    ordinaryDefineOwnMetadata(
      metadataKey, metadataValue,
      (targetKey !== undefined ? anObject : aFunction)(target),
      toMetaKey(targetKey)
    );
  };
}});
},{"3":3,"63":63,"7":7}],282:[function(_dereq_,module,exports){
// https://github.com/DavidBruant/Map-Set.prototype.toJSON
var $export  = _dereq_(32);

$export($export.P + $export.R, 'Set', {toJSON: _dereq_(20)('Set')});
},{"20":20,"32":32}],283:[function(_dereq_,module,exports){
'use strict';
// https://github.com/mathiasbynens/String.prototype.at
var $export = _dereq_(32)
  , $at     = _dereq_(97)(true);

$export($export.P, 'String', {
  at: function at(pos){
    return $at(this, pos);
  }
});
},{"32":32,"97":97}],284:[function(_dereq_,module,exports){
'use strict';
// https://tc39.github.io/String.prototype.matchAll/
var $export     = _dereq_(32)
  , defined     = _dereq_(27)
  , toLength    = _dereq_(108)
  , isRegExp    = _dereq_(50)
  , getFlags    = _dereq_(36)
  , RegExpProto = RegExp.prototype;

var $RegExpStringIterator = function(regexp, string){
  this._r = regexp;
  this._s = string;
};

_dereq_(52)($RegExpStringIterator, 'RegExp String', function next(){
  var match = this._r.exec(this._s);
  return {value: match, done: match === null};
});

$export($export.P, 'String', {
  matchAll: function matchAll(regexp){
    defined(this);
    if(!isRegExp(regexp))throw TypeError(regexp + ' is not a regexp!');
    var S     = String(this)
      , flags = 'flags' in RegExpProto ? String(regexp.flags) : getFlags.call(regexp)
      , rx    = new RegExp(regexp.source, ~flags.indexOf('g') ? flags : 'g' + flags);
    rx.lastIndex = toLength(regexp.lastIndex);
    return new $RegExpStringIterator(rx, S);
  }
});
},{"108":108,"27":27,"32":32,"36":36,"50":50,"52":52}],285:[function(_dereq_,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = _dereq_(32)
  , $pad    = _dereq_(100);

$export($export.P, 'String', {
  padEnd: function padEnd(maxLength /*, fillString = ' ' */){
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, false);
  }
});
},{"100":100,"32":32}],286:[function(_dereq_,module,exports){
'use strict';
// https://github.com/tc39/proposal-string-pad-start-end
var $export = _dereq_(32)
  , $pad    = _dereq_(100);

$export($export.P, 'String', {
  padStart: function padStart(maxLength /*, fillString = ' ' */){
    return $pad(this, maxLength, arguments.length > 1 ? arguments[1] : undefined, true);
  }
});
},{"100":100,"32":32}],287:[function(_dereq_,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
_dereq_(102)('trimLeft', function($trim){
  return function trimLeft(){
    return $trim(this, 1);
  };
}, 'trimStart');
},{"102":102}],288:[function(_dereq_,module,exports){
'use strict';
// https://github.com/sebmarkbage/ecmascript-string-left-right-trim
_dereq_(102)('trimRight', function($trim){
  return function trimRight(){
    return $trim(this, 2);
  };
}, 'trimEnd');
},{"102":102}],289:[function(_dereq_,module,exports){
_dereq_(115)('asyncIterator');
},{"115":115}],290:[function(_dereq_,module,exports){
_dereq_(115)('observable');
},{"115":115}],291:[function(_dereq_,module,exports){
// https://github.com/ljharb/proposal-global
var $export = _dereq_(32);

$export($export.S, 'System', {global: _dereq_(38)});
},{"32":32,"38":38}],292:[function(_dereq_,module,exports){
var $iterators    = _dereq_(130)
  , redefine      = _dereq_(87)
  , global        = _dereq_(38)
  , hide          = _dereq_(40)
  , Iterators     = _dereq_(56)
  , wks           = _dereq_(117)
  , ITERATOR      = wks('iterator')
  , TO_STRING_TAG = wks('toStringTag')
  , ArrayValues   = Iterators.Array;

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype
    , key;
  if(proto){
    if(!proto[ITERATOR])hide(proto, ITERATOR, ArrayValues);
    if(!proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    for(key in $iterators)if(!proto[key])redefine(proto, key, $iterators[key], true);
  }
}
},{"117":117,"130":130,"38":38,"40":40,"56":56,"87":87}],293:[function(_dereq_,module,exports){
var $export = _dereq_(32)
  , $task   = _dereq_(104);
$export($export.G + $export.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"104":104,"32":32}],294:[function(_dereq_,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var global     = _dereq_(38)
  , $export    = _dereq_(32)
  , invoke     = _dereq_(44)
  , partial    = _dereq_(83)
  , navigator  = global.navigator
  , MSIE       = !!navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
var wrap = function(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      typeof fn == 'function' ? fn : Function(fn)
    ), time);
  } : set;
};
$export($export.G + $export.B + $export.F * MSIE, {
  setTimeout:  wrap(global.setTimeout),
  setInterval: wrap(global.setInterval)
});
},{"32":32,"38":38,"44":44,"83":83}],295:[function(_dereq_,module,exports){
_dereq_(243);
_dereq_(180);
_dereq_(182);
_dereq_(181);
_dereq_(184);
_dereq_(186);
_dereq_(191);
_dereq_(185);
_dereq_(183);
_dereq_(193);
_dereq_(192);
_dereq_(188);
_dereq_(189);
_dereq_(187);
_dereq_(179);
_dereq_(190);
_dereq_(194);
_dereq_(195);
_dereq_(146);
_dereq_(148);
_dereq_(147);
_dereq_(197);
_dereq_(196);
_dereq_(167);
_dereq_(177);
_dereq_(178);
_dereq_(168);
_dereq_(169);
_dereq_(170);
_dereq_(171);
_dereq_(172);
_dereq_(173);
_dereq_(174);
_dereq_(175);
_dereq_(176);
_dereq_(150);
_dereq_(151);
_dereq_(152);
_dereq_(153);
_dereq_(154);
_dereq_(155);
_dereq_(156);
_dereq_(157);
_dereq_(158);
_dereq_(159);
_dereq_(160);
_dereq_(161);
_dereq_(162);
_dereq_(163);
_dereq_(164);
_dereq_(165);
_dereq_(166);
_dereq_(230);
_dereq_(235);
_dereq_(242);
_dereq_(233);
_dereq_(225);
_dereq_(226);
_dereq_(231);
_dereq_(236);
_dereq_(238);
_dereq_(221);
_dereq_(222);
_dereq_(223);
_dereq_(224);
_dereq_(227);
_dereq_(228);
_dereq_(229);
_dereq_(232);
_dereq_(234);
_dereq_(237);
_dereq_(239);
_dereq_(240);
_dereq_(241);
_dereq_(141);
_dereq_(143);
_dereq_(142);
_dereq_(145);
_dereq_(144);
_dereq_(129);
_dereq_(127);
_dereq_(134);
_dereq_(131);
_dereq_(137);
_dereq_(139);
_dereq_(126);
_dereq_(133);
_dereq_(123);
_dereq_(138);
_dereq_(121);
_dereq_(136);
_dereq_(135);
_dereq_(128);
_dereq_(132);
_dereq_(120);
_dereq_(122);
_dereq_(125);
_dereq_(124);
_dereq_(140);
_dereq_(130);
_dereq_(213);
_dereq_(219);
_dereq_(214);
_dereq_(215);
_dereq_(216);
_dereq_(217);
_dereq_(218);
_dereq_(198);
_dereq_(149);
_dereq_(220);
_dereq_(255);
_dereq_(256);
_dereq_(244);
_dereq_(245);
_dereq_(250);
_dereq_(253);
_dereq_(254);
_dereq_(248);
_dereq_(251);
_dereq_(249);
_dereq_(252);
_dereq_(246);
_dereq_(247);
_dereq_(199);
_dereq_(200);
_dereq_(201);
_dereq_(202);
_dereq_(203);
_dereq_(206);
_dereq_(204);
_dereq_(205);
_dereq_(207);
_dereq_(208);
_dereq_(209);
_dereq_(210);
_dereq_(212);
_dereq_(211);
_dereq_(257);
_dereq_(283);
_dereq_(286);
_dereq_(285);
_dereq_(287);
_dereq_(288);
_dereq_(284);
_dereq_(289);
_dereq_(290);
_dereq_(268);
_dereq_(271);
_dereq_(267);
_dereq_(265);
_dereq_(266);
_dereq_(269);
_dereq_(270);
_dereq_(260);
_dereq_(282);
_dereq_(291);
_dereq_(259);
_dereq_(261);
_dereq_(263);
_dereq_(262);
_dereq_(264);
_dereq_(273);
_dereq_(274);
_dereq_(276);
_dereq_(275);
_dereq_(278);
_dereq_(277);
_dereq_(279);
_dereq_(280);
_dereq_(281);
_dereq_(258);
_dereq_(272);
_dereq_(294);
_dereq_(293);
_dereq_(292);
module.exports = _dereq_(23);
},{"120":120,"121":121,"122":122,"123":123,"124":124,"125":125,"126":126,"127":127,"128":128,"129":129,"130":130,"131":131,"132":132,"133":133,"134":134,"135":135,"136":136,"137":137,"138":138,"139":139,"140":140,"141":141,"142":142,"143":143,"144":144,"145":145,"146":146,"147":147,"148":148,"149":149,"150":150,"151":151,"152":152,"153":153,"154":154,"155":155,"156":156,"157":157,"158":158,"159":159,"160":160,"161":161,"162":162,"163":163,"164":164,"165":165,"166":166,"167":167,"168":168,"169":169,"170":170,"171":171,"172":172,"173":173,"174":174,"175":175,"176":176,"177":177,"178":178,"179":179,"180":180,"181":181,"182":182,"183":183,"184":184,"185":185,"186":186,"187":187,"188":188,"189":189,"190":190,"191":191,"192":192,"193":193,"194":194,"195":195,"196":196,"197":197,"198":198,"199":199,"200":200,"201":201,"202":202,"203":203,"204":204,"205":205,"206":206,"207":207,"208":208,"209":209,"210":210,"211":211,"212":212,"213":213,"214":214,"215":215,"216":216,"217":217,"218":218,"219":219,"220":220,"221":221,"222":222,"223":223,"224":224,"225":225,"226":226,"227":227,"228":228,"229":229,"23":23,"230":230,"231":231,"232":232,"233":233,"234":234,"235":235,"236":236,"237":237,"238":238,"239":239,"240":240,"241":241,"242":242,"243":243,"244":244,"245":245,"246":246,"247":247,"248":248,"249":249,"250":250,"251":251,"252":252,"253":253,"254":254,"255":255,"256":256,"257":257,"258":258,"259":259,"260":260,"261":261,"262":262,"263":263,"264":264,"265":265,"266":266,"267":267,"268":268,"269":269,"270":270,"271":271,"272":272,"273":273,"274":274,"275":275,"276":276,"277":277,"278":278,"279":279,"280":280,"281":281,"282":282,"283":283,"284":284,"285":285,"286":286,"287":287,"288":288,"289":289,"290":290,"291":291,"292":292,"293":293,"294":294}],296:[function(_dereq_,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided, then outerFn.prototype instanceof Generator.
    var generator = Object.create((outerFn || Generator).prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `value instanceof AwaitArgument` to determine if the yielded value is
  // meant to be awaited. Some may consider the name of this method too
  // cutesy, but they are curmudgeons.
  runtime.awrap = function(arg) {
    return new AwaitArgument(arg);
  };

  function AwaitArgument(arg) {
    this.arg = arg;
  }

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value instanceof AwaitArgument) {
          return Promise.resolve(value.arg).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration. If the Promise is rejected, however, the
          // result for this iteration will be rejected with the same
          // reason. Note that rejections of yielded Promises are not
          // thrown back into the generator function, as is the case
          // when an awaited Promise is rejected. This difference in
          // behavior between yield and await is important, because it
          // allows the consumer to decide what to do with the yielded
          // rejection (swallow it and continue, manually .throw it back
          // into the generator, abandon iteration, whatever). With
          // await, by contrast, there is no opportunity to examine the
          // rejection reason outside the generator function, so the
          // only option is to throw it from the await expression, and
          // let the generator function handle the exception.
          result.value = unwrapped;
          resolve(result);
        }, reject);
      }
    }

    if (typeof process === "object" && process.domain) {
      invoke = process.domain.bind(invoke);
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return runtime.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          if (method === "return" ||
              (method === "throw" && delegate.iterator[method] === undefined)) {
            // A return or throw (when the delegate iterator has no throw
            // method) always terminates the yield* loop.
            context.delegate = null;

            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            var returnMethod = delegate.iterator["return"];
            if (returnMethod) {
              var record = tryCatch(returnMethod, delegate.iterator, arg);
              if (record.type === "throw") {
                // If the return method threw an exception, let that
                // exception prevail over the original return or throw.
                method = "throw";
                arg = record.arg;
                continue;
              }
            }

            if (method === "return") {
              // Continue with the outer return, now that the delegate
              // iterator has been terminated.
              continue;
            }
          }

          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;
            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = arg;

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(arg) call above.
          method = "throw";
          arg = record.arg;
        }
      }
    };
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp[toStringTagSymbol] = "Generator";

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window :
  typeof self === "object" ? self : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
},{}]},{},[1]);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};





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

!function (t) {
  if ("object" == (typeof exports === "undefined" ? "undefined" : _typeof(exports)) && "undefined" != typeof module) module.exports = t();else if ("function" == typeof define && define.amd) define([], t);else {
    var r;r = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, r.msgpack = t();
  }
}(function () {
  return function t(r, e, n) {
    function i(f, u) {
      if (!e[f]) {
        if (!r[f]) {
          var a = "function" == typeof require && require;if (!u && a) return a(f, !0);if (o) return o(f, !0);var s = new Error("Cannot find module '" + f + "'");throw s.code = "MODULE_NOT_FOUND", s;
        }var c = e[f] = { exports: {} };r[f][0].call(c.exports, function (t) {
          var e = r[f][1][t];return i(e ? e : t);
        }, c, c.exports, t, r, e, n);
      }return e[f].exports;
    }for (var o = "function" == typeof require && require, f = 0; f < n.length; f++) {
      i(n[f]);
    }return i;
  }({ 1: [function (t, r, e) {
      e.encode = t("./encode").encode, e.decode = t("./decode").decode, e.Encoder = t("./encoder").Encoder, e.Decoder = t("./decoder").Decoder, e.createCodec = t("./ext").createCodec, e.codec = t("./codec").codec;
    }, { "./codec": 4, "./decode": 6, "./decoder": 7, "./encode": 9, "./encoder": 10, "./ext": 14 }], 2: [function (t, r, e) {
      (function (Buffer) {
        function r(t, r) {
          for (var e = this, n = r || 0, i = t.length, o = 0; i > o; o++) {
            var f = t.charCodeAt(o);128 > f ? e[n++] = f : 2048 > f ? (e[n++] = 192 | f >> 6, e[n++] = 128 | 63 & f) : (e[n++] = 224 | f >> 12, e[n++] = 128 | f >> 6 & 63, e[n++] = 128 | 63 & f);
          }return n - r;
        }function n(t, r) {
          var e = this,
              n = t - 0 || 0;r || (r = e.length);var i = r - t;i > h && (i = h);for (var o = []; r > n;) {
            for (var f = new Array(i), u = 0; i > u && r > n;) {
              var a = e[n++];a = 128 > a ? a : 224 > a ? (63 & a) << 6 | 63 & e[n++] : (63 & a) << 12 | (63 & e[n++]) << 6 | 63 & e[n++], f[u++] = a;
            }i > u && (f = f.slice(0, u)), o.push(String.fromCharCode.apply("", f));
          }return o.length > 1 ? o.join("") : o.length ? o.shift() : "";
        }function i(t, r, e, n) {
          var i;e || (e = 0), n || 0 === n || (n = this.length), r || (r = 0);var o = n - e;if (t === this && r > e && n > r) for (i = o - 1; i >= 0; i--) {
            t[i + r] = this[i + e];
          } else for (i = 0; o > i; i++) {
            t[i + r] = this[i + e];
          }return o;
        }function o(t, r) {
          function e(t) {
            r += t.length;
          }function n(t) {
            Buffer.isBuffer(t) ? t.copy(o, f) : i.call(t, o, f), f += t.length;
          }r || (r = 0, Array.prototype.forEach.call(t, e));var o = new Buffer(r),
              f = 0;return Array.prototype.forEach.call(t, n), o;
        }function f(t, r) {
          new s(this, r, t);
        }function u(t, r) {
          new c(this, r, t);
        }var a = t("int64-buffer"),
            s = a.Uint64BE,
            c = a.Int64BE,
            h = 8192;e.writeString = r, e.readString = n, e.copy = i, e.concat = o, e.writeUint64BE = f, e.writeInt64BE = u;
      }).call(this, t("buffer").Buffer);
    }, { buffer: 23, "int64-buffer": 27 }], 3: [function (t, r, e) {
      function n(t) {
        return this instanceof n ? (this.options = t, void this.init()) : new n(t);
      }function i(t) {
        for (var r in t) {
          n.prototype[r] = o(n.prototype[r], t[r]);
        }
      }function o(t, r) {
        function e() {
          return t.apply(this, arguments), r.apply(this, arguments);
        }return t && r ? e : t || r;
      }function f(t) {
        function r(t, r) {
          return r(t);
        }return t = t.slice(), function (e) {
          return t.reduce(r, e);
        };
      }function u(t) {
        return s(t) ? f(t) : t;
      }function a(t) {
        return new n(t);
      }var s = t("isarray");e.createCodec = a, e.install = i, e.filter = u, n.prototype.init = function () {
        return this;
      }, e.preset = a({ preset: !0 });
    }, { isarray: 28 }], 4: [function (t, r, e) {
      t("./read-core"), t("./write-core"), e.codec = { preset: t("./codec-base").preset };
    }, { "./codec-base": 3, "./read-core": 16, "./write-core": 19 }], 5: [function (t, r, e) {
      function n(t) {
        return this instanceof n ? void (t && (this.options = t, t.codec && (this.codec = t.codec))) : new n(t);
      }e.DecodeBuffer = n;var i = t("./read-core").preset,
          o = t("./flex-buffer").FlexDecoder;o.mixin(n.prototype), n.prototype.codec = i, n.prototype.fetch = function () {
        return this.codec.decode(this);
      };
    }, { "./flex-buffer": 15, "./read-core": 16 }], 6: [function (t, r, e) {
      function n(t, r) {
        var e = new i(r);return e.write(t), e.read();
      }e.decode = n;var i = t("./decode-buffer").DecodeBuffer;
    }, { "./decode-buffer": 5 }], 7: [function (t, r, e) {
      function n(t) {
        return this instanceof n ? void o.call(this, t) : new n(t);
      }e.Decoder = n;var i = t("event-lite"),
          o = t("./decode-buffer").DecodeBuffer;n.prototype = new o(), i.mixin(n.prototype), n.prototype.decode = function (t) {
        arguments.length && this.write(t), this.flush();
      }, n.prototype.push = function (t) {
        this.emit("data", t);
      }, n.prototype.end = function (t) {
        this.decode(t), this.emit("end");
      };
    }, { "./decode-buffer": 5, "event-lite": 25 }], 8: [function (t, r, e) {
      function n(t) {
        return this instanceof n ? void (t && (this.options = t, t.codec && (this.codec = t.codec))) : new n(t);
      }e.EncodeBuffer = n;var i = t("./write-core").preset,
          o = t("./flex-buffer").FlexEncoder;o.mixin(n.prototype), n.prototype.codec = i, n.prototype.write = function (t) {
        this.codec.encode(this, t);
      };
    }, { "./flex-buffer": 15, "./write-core": 19 }], 9: [function (t, r, e) {
      function n(t, r) {
        var e = new i(r);return e.write(t), e.read();
      }e.encode = n;var i = t("./encode-buffer").EncodeBuffer;
    }, { "./encode-buffer": 8 }], 10: [function (t, r, e) {
      function n(t) {
        return this instanceof n ? void o.call(this, t) : new n(t);
      }e.Encoder = n;var i = t("event-lite"),
          o = t("./encode-buffer").EncodeBuffer;n.prototype = new o(), i.mixin(n.prototype), n.prototype.encode = function (t) {
        this.write(t), this.emit("data", this.read());
      }, n.prototype.end = function (t) {
        arguments.length && this.encode(t), this.flush(), this.emit("end");
      };
    }, { "./encode-buffer": 8, "event-lite": 25 }], 11: [function (t, r, e) {
      function n(t, r) {
        return this instanceof n ? (this.buffer = t, void (this.type = r)) : new n(t, r);
      }e.ExtBuffer = n;
    }, {}], 12: [function (t, r, e) {
      (function (Buffer) {
        function r(t) {
          t.addExtPacker(14, Error, [u, n]), t.addExtPacker(1, EvalError, [u, n]), t.addExtPacker(2, RangeError, [u, n]), t.addExtPacker(3, ReferenceError, [u, n]), t.addExtPacker(4, SyntaxError, [u, n]), t.addExtPacker(5, TypeError, [u, n]), t.addExtPacker(6, URIError, [u, n]), t.addExtPacker(10, RegExp, [f, n]), t.addExtPacker(11, Boolean, [o, n]), t.addExtPacker(12, String, [o, n]), t.addExtPacker(13, Date, [Number, n]), t.addExtPacker(15, Number, [o, n]), "undefined" != typeof Uint8Array && (t.addExtPacker(17, Int8Array, i), t.addExtPacker(18, Uint8Array, i), t.addExtPacker(19, Int16Array, a), t.addExtPacker(20, Uint16Array, a), t.addExtPacker(21, Int32Array, a), t.addExtPacker(22, Uint32Array, a), t.addExtPacker(23, Float32Array, a), "undefined" != typeof Float64Array && t.addExtPacker(24, Float64Array, a), "undefined" != typeof Uint8ClampedArray && t.addExtPacker(25, Uint8ClampedArray, i), t.addExtPacker(26, ArrayBuffer, s), t.addExtPacker(29, DataView, a)), t.addExtPacker(27, Buffer, i);
        }function n(r) {
          return c || (c = t("./encode").encode), c(r);
        }function i(t) {
          return new Buffer(t);
        }function o(t) {
          return t.valueOf();
        }function f(t) {
          t = RegExp.prototype.toString.call(t).split("/"), t.shift();var r = [t.pop()];return r.unshift(t.join("/")), r;
        }function u(t) {
          var r = {};for (var e in h) {
            r[e] = t[e];
          }return r;
        }function a(t) {
          return new Buffer(new Uint8Array(t.buffer));
        }function s(t) {
          return new Buffer(new Uint8Array(t));
        }e.setExtPackers = r;var c,
            h = { name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1 };
      }).call(this, t("buffer").Buffer);
    }, { "./encode": 9, buffer: 23 }], 13: [function (t, r, e) {
      (function (Buffer) {
        function r(t) {
          t.addExtUnpacker(14, [n, o(Error)]), t.addExtUnpacker(1, [n, o(EvalError)]), t.addExtUnpacker(2, [n, o(RangeError)]), t.addExtUnpacker(3, [n, o(ReferenceError)]), t.addExtUnpacker(4, [n, o(SyntaxError)]), t.addExtUnpacker(5, [n, o(TypeError)]), t.addExtUnpacker(6, [n, o(URIError)]), t.addExtUnpacker(10, [n, i]), t.addExtUnpacker(11, [n, f(Boolean)]), t.addExtUnpacker(12, [n, f(String)]), t.addExtUnpacker(13, [n, f(Date)]), t.addExtUnpacker(15, [n, f(Number)]), "undefined" != typeof Uint8Array && (t.addExtUnpacker(17, f(Int8Array)), t.addExtUnpacker(18, f(Uint8Array)), t.addExtUnpacker(19, [u, f(Int16Array)]), t.addExtUnpacker(20, [u, f(Uint16Array)]), t.addExtUnpacker(21, [u, f(Int32Array)]), t.addExtUnpacker(22, [u, f(Uint32Array)]), t.addExtUnpacker(23, [u, f(Float32Array)]), "undefined" != typeof Float64Array && t.addExtUnpacker(24, [u, f(Float64Array)]), "undefined" != typeof Uint8ClampedArray && t.addExtUnpacker(25, f(Uint8ClampedArray)), t.addExtUnpacker(26, u), t.addExtUnpacker(29, [u, f(DataView)])), t.addExtUnpacker(27, f(Buffer));
        }function n(r) {
          return a || (a = t("./decode").decode), a(r);
        }function i(t) {
          return RegExp.apply(null, t);
        }function o(t) {
          return function (r) {
            var e = new t();for (var n in s) {
              e[n] = r[n];
            }return e;
          };
        }function f(t) {
          return function (r) {
            return new t(r);
          };
        }function u(t) {
          return new Uint8Array(t).buffer;
        }e.setExtUnpackers = r;var a,
            s = { name: 1, message: 1, stack: 1, columnNumber: 1, fileName: 1, lineNumber: 1 };
      }).call(this, t("buffer").Buffer);
    }, { "./decode": 6, buffer: 23 }], 14: [function (t, r, e) {
      t("./read-core"), t("./write-core"), e.createCodec = t("./codec-base").createCodec;
    }, { "./codec-base": 3, "./read-core": 16, "./write-core": 19 }], 15: [function (t, r, e) {
      (function (Buffer) {
        function r() {
          return this instanceof r ? void 0 : new r();
        }function n() {
          return this instanceof n ? void 0 : new n();
        }function i() {
          function t(t) {
            var r = this.offset ? this.buffer.slice(this.offset) : this.buffer;this.buffer = r ? t ? p.concat([r, t]) : r : t, this.offset = 0;
          }function r() {
            for (; this.offset < this.buffer.length;) {
              var t,
                  r = this.offset;try {
                t = this.fetch();
              } catch (e) {
                if (e !== y) throw e;this.offset = r;break;
              }this.push(t);
            }
          }function e(t) {
            var r = this.offset,
                e = r + t;if (e > this.buffer.length) throw y;return this.offset = e, r;
          }return { write: t, fetch: u, flush: r, push: s, pull: c, read: a, reserve: e, offset: 0 };
        }function o() {
          function t() {
            var t = this.start;if (t < this.offset) {
              var r = this.start = this.offset;return this.buffer.slice(t, r);
            }
          }function r() {
            for (; this.start < this.offset;) {
              var t = this.fetch();t && this.push(t);
            }
          }function e() {
            var t = this.buffers || (this.buffers = []),
                r = t.length > 1 ? p.concat(t) : t[0];return t.length = 0, r;
          }function n(t) {
            var r = 0 | t;if (this.buffer) {
              var e = this.buffer.length,
                  n = 0 | this.offset,
                  i = n + r;if (e > i) return this.offset = i, n;this.flush(), t = Math.max(t, Math.min(2 * e, this.maxBufferSize));
            }return t = Math.max(t, this.minBufferSize), this.buffer = new Buffer(t), this.start = 0, this.offset = r, 0;
          }function i(t) {
            var r = this.offset + t.length;r < this.buffer.length ? (Buffer.isBuffer(t) && Buffer.isBuffer(this.buffer) ? t.copy(this.buffer, this.offset) : p.copy.call(t, this.buffer, this.offset), this.offset = r) : (this.flush(), this.push(t));
          }return { write: f, fetch: t, flush: r, push: s, pull: e, read: a, reserve: n, send: i, maxBufferSize: d, minBufferSize: l, offset: 0, start: 0 };
        }function f() {
          throw new Error("method not implemented: write()");
        }function u() {
          throw new Error("method not implemented: fetch()");
        }function a() {
          var t = this.buffers && this.buffers.length;return t ? (this.flush(), this.pull()) : this.fetch();
        }function s(t) {
          var r = this.buffers || (this.buffers = []);r.push(t);
        }function c() {
          var t = this.buffers || (this.buffers = []);return t.shift();
        }function h(t) {
          function r(r) {
            for (var e in t) {
              r[e] = t[e];
            }return r;
          }return r;
        }var p = t("./buffer-lite");e.FlexDecoder = r, e.FlexEncoder = n;var l = 2048,
            d = 65536,
            y = new Error("BUFFER_SHORTAGE");r.mixin = h(i()), r.mixin(r.prototype), n.mixin = h(o()), n.mixin(n.prototype);
      }).call(this, t("buffer").Buffer);
    }, { "./buffer-lite": 2, buffer: 23 }], 16: [function (t, r, e) {
      function n(t) {
        function r(t) {
          var r = s(t),
              n = e[r];if (!n) throw new Error("Invalid type: " + (r ? "0x" + r.toString(16) : r));return n(t);
        }var e = c.getReadToken(t);return r;
      }function i() {
        var t = this.options;return this.decode = n(t), t && t.preset && a.setExtUnpackers(this), this;
      }function o(t, r) {
        var e = this.extUnpackers || (this.extUnpackers = []);e[t] = h.filter(r);
      }function f(t) {
        function r(r) {
          return new u(r, t);
        }var e = this.extUnpackers || (this.extUnpackers = []);return e[t] || r;
      }var u = t("./ext-buffer").ExtBuffer,
          a = t("./ext-unpacker"),
          s = t("./read-format").readUint8,
          c = t("./read-token"),
          h = t("./codec-base");h.install({ addExtUnpacker: o, getExtUnpacker: f, init: i }), e.preset = i.call(h.preset);
    }, { "./codec-base": 3, "./ext-buffer": 11, "./ext-unpacker": 13, "./read-format": 17, "./read-token": 18 }], 17: [function (t, r, e) {
      (function (Buffer) {
        function r(t) {
          var r = U && t && t.binarraybuffer,
              e = { map: n, array: i, str: o, bin: r ? u : f, ext: a, uint8: s, uint16: c, uint32: h(4, Buffer.prototype.readUInt32BE), uint64: h(8, p), int8: h(1, Buffer.prototype.readInt8), int16: h(2, Buffer.prototype.readInt16BE), int32: h(4, Buffer.prototype.readInt32BE), int64: h(8, l), float32: h(4, v), float64: h(8, g) };return t && t.int64 && (e.uint64 = h(8, d), e.int64 = h(8, y)), e;
        }function n(t, r) {
          var e,
              n = {},
              i = new Array(r),
              o = new Array(r),
              f = t.codec.decode;for (e = 0; r > e; e++) {
            i[e] = f(t), o[e] = f(t);
          }for (e = 0; r > e; e++) {
            n[i[e]] = o[e];
          }return n;
        }function i(t, r) {
          for (var e = new Array(r), n = t.codec.decode, i = 0; r > i; i++) {
            e[i] = n(t);
          }return e;
        }function o(t, r) {
          var e = t.reserve(r),
              n = e + r,
              i = t.buffer;return B || !Buffer.isBuffer(i) ? x.readString.call(i, e, n) : i.toString("utf-8", e, n);
        }function f(t, r) {
          var e = t.reserve(r),
              n = e + r;return w.call(t.buffer, e, n);
        }function u(t, r) {
          var e = t.reserve(r),
              n = e + r,
              i = new Uint8Array(r);return x.copy.call(t.buffer, i, 0, e, n), i.buffer;
        }function a(t, r) {
          var e = t.reserve(r),
              n = t.buffer[e++],
              i = e + r,
              o = t.codec.getExtUnpacker(n);if (!o) throw new Error("Invalid ext type: " + (n ? "0x" + n.toString(16) : n));var f = w.call(t.buffer, e, i);return o(f);
        }function s(t) {
          var r = t.reserve(1);return t.buffer[r];
        }function c(t) {
          var r = t.reserve(2),
              e = t.buffer;return e[r++] << 8 | e[r];
        }function h(t, r) {
          return function (e) {
            var n = e.reserve(t);return r.call(e.buffer, n, P);
          };
        }function p(t) {
          return new A(this, t).toNumber();
        }function l(t) {
          return new m(this, t).toNumber();
        }function d(t) {
          return new A(this, t);
        }function y(t) {
          return new m(this, t);
        }function v(t) {
          return this.readFloatBE ? this.readFloatBE(t) : E.read(this, t, !1, 23, 4);
        }function g(t) {
          return this.readDoubleBE ? this.readDoubleBE(t) : E.read(this, t, !1, 52, 8);
        }function w(t, r) {
          var e = this.slice || Array.prototype.slice,
              n = e.call(this, t, r);return Buffer.isBuffer(n) || (n = Buffer(n)), n;
        }var E = t("ieee754"),
            b = t("int64-buffer"),
            A = b.Uint64BE,
            m = b.Int64BE;e.getReadFormat = r, e.readUint8 = s;var x = t("./buffer-lite"),
            B = "TYPED_ARRAY_SUPPORT" in Buffer,
            U = "undefined" != typeof Uint8Array,
            P = !0;
      }).call(this, t("buffer").Buffer);
    }, { "./buffer-lite": 2, buffer: 23, ieee754: 26, "int64-buffer": 27 }], 18: [function (t, r, e) {
      function n(t) {
        var r = s.getReadFormat(t);return t && t.useraw ? o(r) : i(r);
      }function i(t) {
        var r,
            e = new Array(256);for (r = 0; 127 >= r; r++) {
          e[r] = f(r);
        }for (r = 128; 143 >= r; r++) {
          e[r] = a(r - 128, t.map);
        }for (r = 144; 159 >= r; r++) {
          e[r] = a(r - 144, t.array);
        }for (r = 160; 191 >= r; r++) {
          e[r] = a(r - 160, t.str);
        }for (e[192] = f(null), e[193] = null, e[194] = f(!1), e[195] = f(!0), e[196] = u(t.uint8, t.bin), e[197] = u(t.uint16, t.bin), e[198] = u(t.uint32, t.bin), e[199] = u(t.uint8, t.ext), e[200] = u(t.uint16, t.ext), e[201] = u(t.uint32, t.ext), e[202] = t.float32, e[203] = t.float64, e[204] = t.uint8, e[205] = t.uint16, e[206] = t.uint32, e[207] = t.uint64, e[208] = t.int8, e[209] = t.int16, e[210] = t.int32, e[211] = t.int64, e[212] = a(1, t.ext), e[213] = a(2, t.ext), e[214] = a(4, t.ext), e[215] = a(8, t.ext), e[216] = a(16, t.ext), e[217] = u(t.uint8, t.str), e[218] = u(t.uint16, t.str), e[219] = u(t.uint32, t.str), e[220] = u(t.uint16, t.array), e[221] = u(t.uint32, t.array), e[222] = u(t.uint16, t.map), e[223] = u(t.uint32, t.map), r = 224; 255 >= r; r++) {
          e[r] = f(r - 256);
        }return e;
      }function o(t) {
        var r,
            e = n(t).slice();for (e[217] = e[196], e[218] = e[197], e[219] = e[198], r = 160; 191 >= r; r++) {
          e[r] = a(r - 160, t.bin);
        }return e;
      }function f(t) {
        return function () {
          return t;
        };
      }function u(t, r) {
        return function (e) {
          var n = t(e);return r(e, n);
        };
      }function a(t, r) {
        return function (e) {
          return r(e, t);
        };
      }var s = t("./read-format");e.getReadToken = n;
    }, { "./read-format": 17 }], 19: [function (t, r, e) {
      function n(t) {
        function r(t, r) {
          var n = e[typeof r === "undefined" ? "undefined" : _typeof(r)];if (!n) throw new Error('Unsupported type "' + (typeof r === "undefined" ? "undefined" : _typeof(r)) + '": ' + r);n(t, r);
        }var e = s.getWriteType(t);return r;
      }function i() {
        var t = this.options;return this.encode = n(t), t && t.preset && a.setExtPackers(this), this;
      }function o(t, r, e) {
        function n(r) {
          var n = e(r);return new u(n, t);
        }e = c.filter(e);var i = r.name;if (i && "Object" !== i) {
          var o = this.extPackers || (this.extPackers = {});o[i] = n;
        } else {
          var f = this.extEncoderList || (this.extEncoderList = []);f.unshift([r, n]);
        }
      }function f(t) {
        var r = this.extPackers || (this.extPackers = {}),
            e = t.constructor,
            n = e && e.name && r[e.name];if (n) return n;for (var i = this.extEncoderList || (this.extEncoderList = []), o = i.length, f = 0; o > f; f++) {
          var u = i[f];if (e === u[0]) return u[1];
        }
      }var u = t("./ext-buffer").ExtBuffer,
          a = t("./ext-packer"),
          s = t("./write-type"),
          c = t("./codec-base");c.install({ addExtPacker: o, getExtPacker: f, init: i }), e.preset = i.call(c.preset);
    }, { "./codec-base": 3, "./ext-buffer": 11, "./ext-packer": 12, "./write-type": 21 }], 20: [function (t, r, e) {
      (function (Buffer) {
        function r(t) {
          return p || t && t.safe ? i() : n();
        }function n() {
          var t = c.slice();return t[196] = o(196), t[197] = f(197), t[198] = u(198), t[199] = o(199), t[200] = f(200), t[201] = u(201), t[202] = a(202, 4, Buffer.prototype.writeFloatBE, !0), t[203] = a(203, 8, Buffer.prototype.writeDoubleBE, !0), t[204] = o(204), t[205] = f(205), t[206] = u(206), t[207] = a(207, 8, s.writeUint64BE), t[208] = o(208), t[209] = f(209), t[210] = u(210), t[211] = a(211, 8, s.writeUint64BE), t[217] = o(217), t[218] = f(218), t[219] = u(219), t[220] = f(220), t[221] = u(221), t[222] = f(222), t[223] = u(223), t;
        }function i() {
          var t = c.slice();return t[196] = a(196, 1, Buffer.prototype.writeUInt8), t[197] = a(197, 2, Buffer.prototype.writeUInt16BE), t[198] = a(198, 4, Buffer.prototype.writeUInt32BE), t[199] = a(199, 1, Buffer.prototype.writeUInt8), t[200] = a(200, 2, Buffer.prototype.writeUInt16BE), t[201] = a(201, 4, Buffer.prototype.writeUInt32BE), t[202] = a(202, 4, Buffer.prototype.writeFloatBE), t[203] = a(203, 8, Buffer.prototype.writeDoubleBE), t[204] = a(204, 1, Buffer.prototype.writeUInt8), t[205] = a(205, 2, Buffer.prototype.writeUInt16BE), t[206] = a(206, 4, Buffer.prototype.writeUInt32BE), t[207] = a(207, 8, s.writeUint64BE), t[208] = a(208, 1, Buffer.prototype.writeInt8), t[209] = a(209, 2, Buffer.prototype.writeInt16BE), t[210] = a(210, 4, Buffer.prototype.writeInt32BE), t[211] = a(211, 8, s.writeUint64BE), t[217] = a(217, 1, Buffer.prototype.writeUInt8), t[218] = a(218, 2, Buffer.prototype.writeUInt16BE), t[219] = a(219, 4, Buffer.prototype.writeUInt32BE), t[220] = a(220, 2, Buffer.prototype.writeUInt16BE), t[221] = a(221, 4, Buffer.prototype.writeUInt32BE), t[222] = a(222, 2, Buffer.prototype.writeUInt16BE), t[223] = a(223, 4, Buffer.prototype.writeUInt32BE), t;
        }function o(t) {
          return function (r, e) {
            var n = r.reserve(2),
                i = r.buffer;i[n++] = t, i[n] = e;
          };
        }function f(t) {
          return function (r, e) {
            var n = r.reserve(3),
                i = r.buffer;i[n++] = t, i[n++] = e >>> 8, i[n] = e;
          };
        }function u(t) {
          return function (r, e) {
            var n = r.reserve(5),
                i = r.buffer;i[n++] = t, i[n++] = e >>> 24, i[n++] = e >>> 16, i[n++] = e >>> 8, i[n] = e;
          };
        }function a(t, r, e, n) {
          return function (i, o) {
            var f = i.reserve(r + 1);i.buffer[f++] = t, e.call(i.buffer, o, f, n);
          };
        }var s = t("./buffer-lite"),
            c = t("./write-uint8").uint8,
            h = "TYPED_ARRAY_SUPPORT" in Buffer,
            p = h && !Buffer.TYPED_ARRAY_SUPPORT;e.getWriteToken = r;
      }).call(this, t("buffer").Buffer);
    }, { "./buffer-lite": 2, "./write-uint8": 22, buffer: 23 }], 21: [function (t, r, e) {
      (function (Buffer) {
        function r(t) {
          function r(t) {
            return t instanceof ArrayBuffer;
          }function e(t, r) {
            var e = r ? 195 : 194;k[e](t, r);
          }function i(t, r) {
            var e,
                n = 0 | r;return r !== n ? (e = 203, void k[e](t, r)) : (e = n >= -32 && 127 >= n ? 255 & n : n >= 0 ? 255 >= n ? 204 : 65535 >= n ? 205 : 206 : n >= -128 ? 208 : n >= -32768 ? 209 : 210, void k[e](t, n));
          }function d(t, r) {
            var e = 207;k[e](t, r.toArray());
          }function y(t, r) {
            var e = 211;k[e](t, r.toArray());
          }function v(t) {
            return 32 > t ? 1 : 255 >= t ? 2 : 65535 >= t ? 3 : 5;
          }function g(t) {
            return 32 > t ? 1 : 65535 >= t ? 3 : 5;
          }function w(t) {
            function r(r, e) {
              var n = e.length,
                  i = 5 + 3 * n;r.offset = r.reserve(i);var o = r.buffer,
                  f = t(n),
                  a = r.offset + f;n = u.writeString.call(o, e, a);var s = t(n);if (f !== s) {
                var c = a + s - f,
                    p = a + n;!h && Buffer.isBuffer(o) ? o.copy(o, c, a, p) : u.copy.call(o, o, c, a, p);
              }var l = 1 === s ? 160 + n : 3 >= s ? 215 + s : 219;k[l](r, n), r.offset += n;
            }return r;
          }function E(t, r) {
            if (null === r) return A(t, r);if (T(r)) return S(t, r);if (n(r)) return m(t, r);if (o.isUint64BE(r)) return d(t, r);if (f.isInt64BE(r)) return y(t, r);var e = t.codec.getExtPacker(r);return e && (r = e(r)), r instanceof c ? U(t, r) : void P(t, r);
          }function b(t, r) {
            return T(r) ? R(t, r) : void E(t, r);
          }function A(t, r) {
            var e = 192;k[e](t, r);
          }function m(t, r) {
            var e = r.length,
                n = 16 > e ? 144 + e : 65535 >= e ? 220 : 221;k[n](t, e);for (var i = t.codec.encode, o = 0; e > o; o++) {
              i(t, r[o]);
            }
          }function x(t, r) {
            var e = r.length,
                n = 255 > e ? 196 : 65535 >= e ? 197 : 198;k[n](t, e), t.send(r);
          }function B(t, r) {
            x(t, new Uint8Array(r));
          }function U(t, r) {
            var e = r.buffer,
                n = e.length,
                i = l[n] || (255 > n ? 199 : 65535 >= n ? 200 : 201);k[i](t, n), s[r.type](t), t.send(e);
          }function P(t, r) {
            var e = Object.keys(r),
                n = e.length,
                i = 16 > n ? 128 + n : 65535 >= n ? 222 : 223;k[i](t, n);var o = t.codec.encode;e.forEach(function (e) {
              o(t, e), o(t, r[e]);
            });
          }function R(t, r) {
            var e = r.length,
                n = 32 > e ? 160 + e : 65535 >= e ? 218 : 219;k[n](t, e), t.send(r);
          }var k = a.getWriteToken(t),
              _ = t && t.useraw,
              I = p && t && t.binarraybuffer,
              T = I ? r : Buffer.isBuffer,
              S = I ? B : x,
              Y = { "boolean": e, "function": A, number: i, object: _ ? b : E, string: w(_ ? g : v), symbol: A, undefined: A };return Y;
        }var n = t("isarray"),
            i = t("int64-buffer"),
            o = i.Uint64BE,
            f = i.Int64BE,
            u = t("./buffer-lite"),
            a = t("./write-token"),
            s = t("./write-uint8").uint8,
            c = t("./ext-buffer").ExtBuffer,
            h = "TYPED_ARRAY_SUPPORT" in Buffer,
            p = "undefined" != typeof Uint8Array,
            l = [];l[1] = 212, l[2] = 213, l[4] = 214, l[8] = 215, l[16] = 216, e.getWriteType = r;
      }).call(this, t("buffer").Buffer);
    }, { "./buffer-lite": 2, "./ext-buffer": 11, "./write-token": 20, "./write-uint8": 22, buffer: 23, "int64-buffer": 27, isarray: 28 }], 22: [function (t, r, e) {
      function n(t) {
        return function (r) {
          var e = r.reserve(1);r.buffer[e] = t;
        };
      }for (var i = e.uint8 = new Array(256), o = 0; 255 >= o; o++) {
        i[o] = n(o);
      }
    }, {}], 23: [function (t, r, e) {
      (function (r) {
        "use strict";
        function n() {
          try {
            var t = new Uint8Array(1);return t.foo = function () {
              return 42;
            }, 42 === t.foo() && "function" == typeof t.subarray && 0 === t.subarray(1, 1).byteLength;
          } catch (r) {
            return !1;
          }
        }function i() {
          return Buffer.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
        }function o(t, r) {
          if (i() < r) throw new RangeError("Invalid typed array length");return Buffer.TYPED_ARRAY_SUPPORT ? (t = new Uint8Array(r), t.__proto__ = Buffer.prototype) : (null === t && (t = new Buffer(r)), t.length = r), t;
        }function Buffer(t, r, e) {
          if (!(Buffer.TYPED_ARRAY_SUPPORT || this instanceof Buffer)) return new Buffer(t, r, e);if ("number" == typeof t) {
            if ("string" == typeof r) throw new Error("If encoding is specified then the first argument must be a string");return s(this, t);
          }return f(this, t, r, e);
        }function f(t, r, e, n) {
          if ("number" == typeof r) throw new TypeError('"value" argument must not be a number');return "undefined" != typeof ArrayBuffer && r instanceof ArrayBuffer ? p(t, r, e, n) : "string" == typeof r ? c(t, r, e) : l(t, r);
        }function u(t) {
          if ("number" != typeof t) throw new TypeError('"size" argument must be a number');
        }function a(t, r, e, n) {
          return u(r), 0 >= r ? o(t, r) : void 0 !== e ? "string" == typeof n ? o(t, r).fill(e, n) : o(t, r).fill(e) : o(t, r);
        }function s(t, r) {
          if (u(r), t = o(t, 0 > r ? 0 : 0 | d(r)), !Buffer.TYPED_ARRAY_SUPPORT) for (var e = 0; r > e; e++) {
            t[e] = 0;
          }return t;
        }function c(t, r, e) {
          if ("string" == typeof e && "" !== e || (e = "utf8"), !Buffer.isEncoding(e)) throw new TypeError('"encoding" must be a valid string encoding');var n = 0 | v(r, e);return t = o(t, n), t.write(r, e), t;
        }function h(t, r) {
          var e = 0 | d(r.length);t = o(t, e);for (var n = 0; e > n; n += 1) {
            t[n] = 255 & r[n];
          }return t;
        }function p(t, r, e, n) {
          if (r.byteLength, 0 > e || r.byteLength < e) throw new RangeError("'offset' is out of bounds");if (r.byteLength < e + (n || 0)) throw new RangeError("'length' is out of bounds");return r = void 0 === n ? new Uint8Array(r, e) : new Uint8Array(r, e, n), Buffer.TYPED_ARRAY_SUPPORT ? (t = r, t.__proto__ = Buffer.prototype) : t = h(t, r), t;
        }function l(t, r) {
          if (Buffer.isBuffer(r)) {
            var e = 0 | d(r.length);return t = o(t, e), 0 === t.length ? t : (r.copy(t, 0, 0, e), t);
          }if (r) {
            if ("undefined" != typeof ArrayBuffer && r.buffer instanceof ArrayBuffer || "length" in r) return "number" != typeof r.length || G(r.length) ? o(t, 0) : h(t, r);if ("Buffer" === r.type && K(r.data)) return h(t, r.data);
          }throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
        }function d(t) {
          if (t >= i()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + i().toString(16) + " bytes");return 0 | t;
        }function y(t) {
          return +t != t && (t = 0), Buffer.alloc(+t);
        }function v(t, r) {
          if (Buffer.isBuffer(t)) return t.length;if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)) return t.byteLength;"string" != typeof t && (t = "" + t);var e = t.length;if (0 === e) return 0;for (var n = !1;;) {
            switch (r) {case "ascii":case "binary":case "raw":case "raws":
                return e;case "utf8":case "utf-8":case void 0:
                return q(t).length;case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
                return 2 * e;case "hex":
                return e >>> 1;case "base64":
                return J(t).length;default:
                if (n) return q(t).length;r = ("" + r).toLowerCase(), n = !0;}
          }
        }function g(t, r, e) {
          var n = !1;if ((void 0 === r || 0 > r) && (r = 0), r > this.length) return "";if ((void 0 === e || e > this.length) && (e = this.length), 0 >= e) return "";if (e >>>= 0, r >>>= 0, r >= e) return "";for (t || (t = "utf8");;) {
            switch (t) {case "hex":
                return T(this, r, e);case "utf8":case "utf-8":
                return R(this, r, e);case "ascii":
                return _(this, r, e);case "binary":
                return I(this, r, e);case "base64":
                return P(this, r, e);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
                return S(this, r, e);default:
                if (n) throw new TypeError("Unknown encoding: " + t);t = (t + "").toLowerCase(), n = !0;}
          }
        }function w(t, r, e) {
          var n = t[r];t[r] = t[e], t[e] = n;
        }function E(t, r, e, n) {
          function i(t, r) {
            return 1 === o ? t[r] : t.readUInt16BE(r * o);
          }var o = 1,
              f = t.length,
              u = r.length;if (void 0 !== n && (n = String(n).toLowerCase(), "ucs2" === n || "ucs-2" === n || "utf16le" === n || "utf-16le" === n)) {
            if (t.length < 2 || r.length < 2) return -1;o = 2, f /= 2, u /= 2, e /= 2;
          }for (var a = -1, s = 0; f > e + s; s++) {
            if (i(t, e + s) === i(r, -1 === a ? 0 : s - a)) {
              if (-1 === a && (a = s), s - a + 1 === u) return (e + a) * o;
            } else -1 !== a && (s -= s - a), a = -1;
          }return -1;
        }function b(t, r, e, n) {
          e = Number(e) || 0;var i = t.length - e;n ? (n = Number(n), n > i && (n = i)) : n = i;var o = r.length;if (o % 2 !== 0) throw new Error("Invalid hex string");n > o / 2 && (n = o / 2);for (var f = 0; n > f; f++) {
            var u = parseInt(r.substr(2 * f, 2), 16);if (isNaN(u)) return f;t[e + f] = u;
          }return f;
        }function A(t, r, e, n) {
          return X(q(r, t.length - e), t, e, n);
        }function m(t, r, e, n) {
          return X(V(r), t, e, n);
        }function x(t, r, e, n) {
          return m(t, r, e, n);
        }function B(t, r, e, n) {
          return X(J(r), t, e, n);
        }function U(t, r, e, n) {
          return X(W(r, t.length - e), t, e, n);
        }function P(t, r, e) {
          return 0 === r && e === t.length ? H.fromByteArray(t) : H.fromByteArray(t.slice(r, e));
        }function R(t, r, e) {
          e = Math.min(t.length, e);for (var n = [], i = r; e > i;) {
            var o = t[i],
                f = null,
                u = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;if (e >= i + u) {
              var a, s, c, h;switch (u) {case 1:
                  128 > o && (f = o);break;case 2:
                  a = t[i + 1], 128 === (192 & a) && (h = (31 & o) << 6 | 63 & a, h > 127 && (f = h));break;case 3:
                  a = t[i + 1], s = t[i + 2], 128 === (192 & a) && 128 === (192 & s) && (h = (15 & o) << 12 | (63 & a) << 6 | 63 & s, h > 2047 && (55296 > h || h > 57343) && (f = h));break;case 4:
                  a = t[i + 1], s = t[i + 2], c = t[i + 3], 128 === (192 & a) && 128 === (192 & s) && 128 === (192 & c) && (h = (15 & o) << 18 | (63 & a) << 12 | (63 & s) << 6 | 63 & c, h > 65535 && 1114112 > h && (f = h));}
            }null === f ? (f = 65533, u = 1) : f > 65535 && (f -= 65536, n.push(f >>> 10 & 1023 | 55296), f = 56320 | 1023 & f), n.push(f), i += u;
          }return k(n);
        }function k(t) {
          var r = t.length;if (Q >= r) return String.fromCharCode.apply(String, t);for (var e = "", n = 0; r > n;) {
            e += String.fromCharCode.apply(String, t.slice(n, n += Q));
          }return e;
        }function _(t, r, e) {
          var n = "";e = Math.min(t.length, e);for (var i = r; e > i; i++) {
            n += String.fromCharCode(127 & t[i]);
          }return n;
        }function I(t, r, e) {
          var n = "";e = Math.min(t.length, e);for (var i = r; e > i; i++) {
            n += String.fromCharCode(t[i]);
          }return n;
        }function T(t, r, e) {
          var n = t.length;(!r || 0 > r) && (r = 0), (!e || 0 > e || e > n) && (e = n);for (var i = "", o = r; e > o; o++) {
            i += z(t[o]);
          }return i;
        }function S(t, r, e) {
          for (var n = t.slice(r, e), i = "", o = 0; o < n.length; o += 2) {
            i += String.fromCharCode(n[o] + 256 * n[o + 1]);
          }return i;
        }function Y(t, r, e) {
          if (t % 1 !== 0 || 0 > t) throw new RangeError("offset is not uint");if (t + r > e) throw new RangeError("Trying to access beyond buffer length");
        }function D(t, r, e, n, i, o) {
          if (!Buffer.isBuffer(t)) throw new TypeError('"buffer" argument must be a Buffer instance');if (r > i || o > r) throw new RangeError('"value" argument is out of bounds');if (e + n > t.length) throw new RangeError("Index out of range");
        }function C(t, r, e, n) {
          0 > r && (r = 65535 + r + 1);for (var i = 0, o = Math.min(t.length - e, 2); o > i; i++) {
            t[e + i] = (r & 255 << 8 * (n ? i : 1 - i)) >>> 8 * (n ? i : 1 - i);
          }
        }function O(t, r, e, n) {
          0 > r && (r = 4294967295 + r + 1);for (var i = 0, o = Math.min(t.length - e, 4); o > i; i++) {
            t[e + i] = r >>> 8 * (n ? i : 3 - i) & 255;
          }
        }function M(t, r, e, n, i, o) {
          if (e + n > t.length) throw new RangeError("Index out of range");if (0 > e) throw new RangeError("Index out of range");
        }function L(t, r, e, n, i) {
          return i || M(t, r, e, 4, 3.4028234663852886e38, -3.4028234663852886e38), Z.write(t, r, e, n, 23, 4), e + 4;
        }function N(t, r, e, n, i) {
          return i || M(t, r, e, 8, 1.7976931348623157e308, -1.7976931348623157e308), Z.write(t, r, e, n, 52, 8), e + 8;
        }function F(t) {
          if (t = j(t).replace($, ""), t.length < 2) return "";for (; t.length % 4 !== 0;) {
            t += "=";
          }return t;
        }function j(t) {
          return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "");
        }function z(t) {
          return 16 > t ? "0" + t.toString(16) : t.toString(16);
        }function q(t, r) {
          r = r || 1 / 0;for (var e, n = t.length, i = null, o = [], f = 0; n > f; f++) {
            if (e = t.charCodeAt(f), e > 55295 && 57344 > e) {
              if (!i) {
                if (e > 56319) {
                  (r -= 3) > -1 && o.push(239, 191, 189);continue;
                }if (f + 1 === n) {
                  (r -= 3) > -1 && o.push(239, 191, 189);continue;
                }i = e;continue;
              }if (56320 > e) {
                (r -= 3) > -1 && o.push(239, 191, 189), i = e;continue;
              }e = (i - 55296 << 10 | e - 56320) + 65536;
            } else i && (r -= 3) > -1 && o.push(239, 191, 189);if (i = null, 128 > e) {
              if ((r -= 1) < 0) break;o.push(e);
            } else if (2048 > e) {
              if ((r -= 2) < 0) break;o.push(e >> 6 | 192, 63 & e | 128);
            } else if (65536 > e) {
              if ((r -= 3) < 0) break;o.push(e >> 12 | 224, e >> 6 & 63 | 128, 63 & e | 128);
            } else {
              if (!(1114112 > e)) throw new Error("Invalid code point");if ((r -= 4) < 0) break;o.push(e >> 18 | 240, e >> 12 & 63 | 128, e >> 6 & 63 | 128, 63 & e | 128);
            }
          }return o;
        }function V(t) {
          for (var r = [], e = 0; e < t.length; e++) {
            r.push(255 & t.charCodeAt(e));
          }return r;
        }function W(t, r) {
          for (var e, n, i, o = [], f = 0; f < t.length && !((r -= 2) < 0); f++) {
            e = t.charCodeAt(f), n = e >> 8, i = e % 256, o.push(i), o.push(n);
          }return o;
        }function J(t) {
          return H.toByteArray(F(t));
        }function X(t, r, e, n) {
          for (var i = 0; n > i && !(i + e >= r.length || i >= t.length); i++) {
            r[i + e] = t[i];
          }return i;
        }function G(t) {
          return t !== t;
        }var H = t("base64-js"),
            Z = t("ieee754"),
            K = t("isarray");e.Buffer = Buffer, e.SlowBuffer = y, e.INSPECT_MAX_BYTES = 50, Buffer.TYPED_ARRAY_SUPPORT = void 0 !== r.TYPED_ARRAY_SUPPORT ? r.TYPED_ARRAY_SUPPORT : n(), e.kMaxLength = i(), Buffer.poolSize = 8192, Buffer._augment = function (t) {
          return t.__proto__ = Buffer.prototype, t;
        }, Buffer.from = function (t, r, e) {
          return f(null, t, r, e);
        }, Buffer.TYPED_ARRAY_SUPPORT && (Buffer.prototype.__proto__ = Uint8Array.prototype, Buffer.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && Buffer[Symbol.species] === Buffer && Object.defineProperty(Buffer, Symbol.species, { value: null, configurable: !0 })), Buffer.alloc = function (t, r, e) {
          return a(null, t, r, e);
        }, Buffer.allocUnsafe = function (t) {
          return s(null, t);
        }, Buffer.allocUnsafeSlow = function (t) {
          return s(null, t);
        }, Buffer.isBuffer = function (t) {
          return !(null == t || !t._isBuffer);
        }, Buffer.compare = function (t, r) {
          if (!Buffer.isBuffer(t) || !Buffer.isBuffer(r)) throw new TypeError("Arguments must be Buffers");if (t === r) return 0;for (var e = t.length, n = r.length, i = 0, o = Math.min(e, n); o > i; ++i) {
            if (t[i] !== r[i]) {
              e = t[i], n = r[i];break;
            }
          }return n > e ? -1 : e > n ? 1 : 0;
        }, Buffer.isEncoding = function (t) {
          switch (String(t).toLowerCase()) {case "hex":case "utf8":case "utf-8":case "ascii":case "binary":case "base64":case "raw":case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
              return !0;default:
              return !1;}
        }, Buffer.concat = function (t, r) {
          if (!K(t)) throw new TypeError('"list" argument must be an Array of Buffers');if (0 === t.length) return Buffer.alloc(0);var e;if (void 0 === r) for (r = 0, e = 0; e < t.length; e++) {
            r += t[e].length;
          }var n = Buffer.allocUnsafe(r),
              i = 0;for (e = 0; e < t.length; e++) {
            var o = t[e];if (!Buffer.isBuffer(o)) throw new TypeError('"list" argument must be an Array of Buffers');o.copy(n, i), i += o.length;
          }return n;
        }, Buffer.byteLength = v, Buffer.prototype._isBuffer = !0, Buffer.prototype.swap16 = function () {
          var t = this.length;if (t % 2 !== 0) throw new RangeError("Buffer size must be a multiple of 16-bits");for (var r = 0; t > r; r += 2) {
            w(this, r, r + 1);
          }return this;
        }, Buffer.prototype.swap32 = function () {
          var t = this.length;if (t % 4 !== 0) throw new RangeError("Buffer size must be a multiple of 32-bits");for (var r = 0; t > r; r += 4) {
            w(this, r, r + 3), w(this, r + 1, r + 2);
          }return this;
        }, Buffer.prototype.toString = function () {
          var t = 0 | this.length;return 0 === t ? "" : 0 === arguments.length ? R(this, 0, t) : g.apply(this, arguments);
        }, Buffer.prototype.equals = function (t) {
          if (!Buffer.isBuffer(t)) throw new TypeError("Argument must be a Buffer");return this === t ? !0 : 0 === Buffer.compare(this, t);
        }, Buffer.prototype.inspect = function () {
          var t = "",
              r = e.INSPECT_MAX_BYTES;return this.length > 0 && (t = this.toString("hex", 0, r).match(/.{2}/g).join(" "), this.length > r && (t += " ... ")), "<Buffer " + t + ">";
        }, Buffer.prototype.compare = function (t, r, e, n, i) {
          if (!Buffer.isBuffer(t)) throw new TypeError("Argument must be a Buffer");if (void 0 === r && (r = 0), void 0 === e && (e = t ? t.length : 0), void 0 === n && (n = 0), void 0 === i && (i = this.length), 0 > r || e > t.length || 0 > n || i > this.length) throw new RangeError("out of range index");if (n >= i && r >= e) return 0;if (n >= i) return -1;if (r >= e) return 1;if (r >>>= 0, e >>>= 0, n >>>= 0, i >>>= 0, this === t) return 0;for (var o = i - n, f = e - r, u = Math.min(o, f), a = this.slice(n, i), s = t.slice(r, e), c = 0; u > c; ++c) {
            if (a[c] !== s[c]) {
              o = a[c], f = s[c];break;
            }
          }return f > o ? -1 : o > f ? 1 : 0;
        }, Buffer.prototype.indexOf = function (t, r, e) {
          if ("string" == typeof r ? (e = r, r = 0) : r > 2147483647 ? r = 2147483647 : -2147483648 > r && (r = -2147483648), r >>= 0, 0 === this.length) return -1;if (r >= this.length) return -1;if (0 > r && (r = Math.max(this.length + r, 0)), "string" == typeof t && (t = Buffer.from(t, e)), Buffer.isBuffer(t)) return 0 === t.length ? -1 : E(this, t, r, e);if ("number" == typeof t) return Buffer.TYPED_ARRAY_SUPPORT && "function" === Uint8Array.prototype.indexOf ? Uint8Array.prototype.indexOf.call(this, t, r) : E(this, [t], r, e);throw new TypeError("val must be string, number or Buffer");
        }, Buffer.prototype.includes = function (t, r, e) {
          return -1 !== this.indexOf(t, r, e);
        }, Buffer.prototype.write = function (t, r, e, n) {
          if (void 0 === r) n = "utf8", e = this.length, r = 0;else if (void 0 === e && "string" == typeof r) n = r, e = this.length, r = 0;else {
            if (!isFinite(r)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");r = 0 | r, isFinite(e) ? (e = 0 | e, void 0 === n && (n = "utf8")) : (n = e, e = void 0);
          }var i = this.length - r;if ((void 0 === e || e > i) && (e = i), t.length > 0 && (0 > e || 0 > r) || r > this.length) throw new RangeError("Attempt to write outside buffer bounds");n || (n = "utf8");for (var o = !1;;) {
            switch (n) {case "hex":
                return b(this, t, r, e);case "utf8":case "utf-8":
                return A(this, t, r, e);case "ascii":
                return m(this, t, r, e);case "binary":
                return x(this, t, r, e);case "base64":
                return B(this, t, r, e);case "ucs2":case "ucs-2":case "utf16le":case "utf-16le":
                return U(this, t, r, e);default:
                if (o) throw new TypeError("Unknown encoding: " + n);n = ("" + n).toLowerCase(), o = !0;}
          }
        }, Buffer.prototype.toJSON = function () {
          return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) };
        };var Q = 4096;Buffer.prototype.slice = function (t, r) {
          var e = this.length;t = ~~t, r = void 0 === r ? e : ~~r, 0 > t ? (t += e, 0 > t && (t = 0)) : t > e && (t = e), 0 > r ? (r += e, 0 > r && (r = 0)) : r > e && (r = e), t > r && (r = t);var n;if (Buffer.TYPED_ARRAY_SUPPORT) n = this.subarray(t, r), n.__proto__ = Buffer.prototype;else {
            var i = r - t;n = new Buffer(i, void 0);for (var o = 0; i > o; o++) {
              n[o] = this[o + t];
            }
          }return n;
        }, Buffer.prototype.readUIntLE = function (t, r, e) {
          t = 0 | t, r = 0 | r, e || Y(t, r, this.length);for (var n = this[t], i = 1, o = 0; ++o < r && (i *= 256);) {
            n += this[t + o] * i;
          }return n;
        }, Buffer.prototype.readUIntBE = function (t, r, e) {
          t = 0 | t, r = 0 | r, e || Y(t, r, this.length);for (var n = this[t + --r], i = 1; r > 0 && (i *= 256);) {
            n += this[t + --r] * i;
          }return n;
        }, Buffer.prototype.readUInt8 = function (t, r) {
          return r || Y(t, 1, this.length), this[t];
        }, Buffer.prototype.readUInt16LE = function (t, r) {
          return r || Y(t, 2, this.length), this[t] | this[t + 1] << 8;
        }, Buffer.prototype.readUInt16BE = function (t, r) {
          return r || Y(t, 2, this.length), this[t] << 8 | this[t + 1];
        }, Buffer.prototype.readUInt32LE = function (t, r) {
          return r || Y(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3];
        }, Buffer.prototype.readUInt32BE = function (t, r) {
          return r || Y(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
        }, Buffer.prototype.readIntLE = function (t, r, e) {
          t = 0 | t, r = 0 | r, e || Y(t, r, this.length);for (var n = this[t], i = 1, o = 0; ++o < r && (i *= 256);) {
            n += this[t + o] * i;
          }return i *= 128, n >= i && (n -= Math.pow(2, 8 * r)), n;
        }, Buffer.prototype.readIntBE = function (t, r, e) {
          t = 0 | t, r = 0 | r, e || Y(t, r, this.length);for (var n = r, i = 1, o = this[t + --n]; n > 0 && (i *= 256);) {
            o += this[t + --n] * i;
          }return i *= 128, o >= i && (o -= Math.pow(2, 8 * r)), o;
        }, Buffer.prototype.readInt8 = function (t, r) {
          return r || Y(t, 1, this.length), 128 & this[t] ? -1 * (255 - this[t] + 1) : this[t];
        }, Buffer.prototype.readInt16LE = function (t, r) {
          r || Y(t, 2, this.length);var e = this[t] | this[t + 1] << 8;return 32768 & e ? 4294901760 | e : e;
        }, Buffer.prototype.readInt16BE = function (t, r) {
          r || Y(t, 2, this.length);var e = this[t + 1] | this[t] << 8;return 32768 & e ? 4294901760 | e : e;
        }, Buffer.prototype.readInt32LE = function (t, r) {
          return r || Y(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
        }, Buffer.prototype.readInt32BE = function (t, r) {
          return r || Y(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
        }, Buffer.prototype.readFloatLE = function (t, r) {
          return r || Y(t, 4, this.length), Z.read(this, t, !0, 23, 4);
        }, Buffer.prototype.readFloatBE = function (t, r) {
          return r || Y(t, 4, this.length), Z.read(this, t, !1, 23, 4);
        }, Buffer.prototype.readDoubleLE = function (t, r) {
          return r || Y(t, 8, this.length), Z.read(this, t, !0, 52, 8);
        }, Buffer.prototype.readDoubleBE = function (t, r) {
          return r || Y(t, 8, this.length), Z.read(this, t, !1, 52, 8);
        }, Buffer.prototype.writeUIntLE = function (t, r, e, n) {
          if (t = +t, r = 0 | r, e = 0 | e, !n) {
            var i = Math.pow(2, 8 * e) - 1;D(this, t, r, e, i, 0);
          }var o = 1,
              f = 0;for (this[r] = 255 & t; ++f < e && (o *= 256);) {
            this[r + f] = t / o & 255;
          }return r + e;
        }, Buffer.prototype.writeUIntBE = function (t, r, e, n) {
          if (t = +t, r = 0 | r, e = 0 | e, !n) {
            var i = Math.pow(2, 8 * e) - 1;D(this, t, r, e, i, 0);
          }var o = e - 1,
              f = 1;for (this[r + o] = 255 & t; --o >= 0 && (f *= 256);) {
            this[r + o] = t / f & 255;
          }return r + e;
        }, Buffer.prototype.writeUInt8 = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 1, 255, 0), Buffer.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[r] = 255 & t, r + 1;
        }, Buffer.prototype.writeUInt16LE = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 2, 65535, 0), Buffer.TYPED_ARRAY_SUPPORT ? (this[r] = 255 & t, this[r + 1] = t >>> 8) : C(this, t, r, !0), r + 2;
        }, Buffer.prototype.writeUInt16BE = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 2, 65535, 0), Buffer.TYPED_ARRAY_SUPPORT ? (this[r] = t >>> 8, this[r + 1] = 255 & t) : C(this, t, r, !1), r + 2;
        }, Buffer.prototype.writeUInt32LE = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 4, 4294967295, 0), Buffer.TYPED_ARRAY_SUPPORT ? (this[r + 3] = t >>> 24, this[r + 2] = t >>> 16, this[r + 1] = t >>> 8, this[r] = 255 & t) : O(this, t, r, !0), r + 4;
        }, Buffer.prototype.writeUInt32BE = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 4, 4294967295, 0), Buffer.TYPED_ARRAY_SUPPORT ? (this[r] = t >>> 24, this[r + 1] = t >>> 16, this[r + 2] = t >>> 8, this[r + 3] = 255 & t) : O(this, t, r, !1), r + 4;
        }, Buffer.prototype.writeIntLE = function (t, r, e, n) {
          if (t = +t, r = 0 | r, !n) {
            var i = Math.pow(2, 8 * e - 1);D(this, t, r, e, i - 1, -i);
          }var o = 0,
              f = 1,
              u = 0;for (this[r] = 255 & t; ++o < e && (f *= 256);) {
            0 > t && 0 === u && 0 !== this[r + o - 1] && (u = 1), this[r + o] = (t / f >> 0) - u & 255;
          }return r + e;
        }, Buffer.prototype.writeIntBE = function (t, r, e, n) {
          if (t = +t, r = 0 | r, !n) {
            var i = Math.pow(2, 8 * e - 1);D(this, t, r, e, i - 1, -i);
          }var o = e - 1,
              f = 1,
              u = 0;for (this[r + o] = 255 & t; --o >= 0 && (f *= 256);) {
            0 > t && 0 === u && 0 !== this[r + o + 1] && (u = 1), this[r + o] = (t / f >> 0) - u & 255;
          }return r + e;
        }, Buffer.prototype.writeInt8 = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 1, 127, -128), Buffer.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), 0 > t && (t = 255 + t + 1), this[r] = 255 & t, r + 1;
        }, Buffer.prototype.writeInt16LE = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 2, 32767, -32768), Buffer.TYPED_ARRAY_SUPPORT ? (this[r] = 255 & t, this[r + 1] = t >>> 8) : C(this, t, r, !0), r + 2;
        }, Buffer.prototype.writeInt16BE = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 2, 32767, -32768), Buffer.TYPED_ARRAY_SUPPORT ? (this[r] = t >>> 8, this[r + 1] = 255 & t) : C(this, t, r, !1), r + 2;
        }, Buffer.prototype.writeInt32LE = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 4, 2147483647, -2147483648), Buffer.TYPED_ARRAY_SUPPORT ? (this[r] = 255 & t, this[r + 1] = t >>> 8, this[r + 2] = t >>> 16, this[r + 3] = t >>> 24) : O(this, t, r, !0), r + 4;
        }, Buffer.prototype.writeInt32BE = function (t, r, e) {
          return t = +t, r = 0 | r, e || D(this, t, r, 4, 2147483647, -2147483648), 0 > t && (t = 4294967295 + t + 1), Buffer.TYPED_ARRAY_SUPPORT ? (this[r] = t >>> 24, this[r + 1] = t >>> 16, this[r + 2] = t >>> 8, this[r + 3] = 255 & t) : O(this, t, r, !1), r + 4;
        }, Buffer.prototype.writeFloatLE = function (t, r, e) {
          return L(this, t, r, !0, e);
        }, Buffer.prototype.writeFloatBE = function (t, r, e) {
          return L(this, t, r, !1, e);
        }, Buffer.prototype.writeDoubleLE = function (t, r, e) {
          return N(this, t, r, !0, e);
        }, Buffer.prototype.writeDoubleBE = function (t, r, e) {
          return N(this, t, r, !1, e);
        }, Buffer.prototype.copy = function (t, r, e, n) {
          if (e || (e = 0), n || 0 === n || (n = this.length), r >= t.length && (r = t.length), r || (r = 0), n > 0 && e > n && (n = e), n === e) return 0;if (0 === t.length || 0 === this.length) return 0;if (0 > r) throw new RangeError("targetStart out of bounds");if (0 > e || e >= this.length) throw new RangeError("sourceStart out of bounds");if (0 > n) throw new RangeError("sourceEnd out of bounds");n > this.length && (n = this.length), t.length - r < n - e && (n = t.length - r + e);var i,
              o = n - e;if (this === t && r > e && n > r) for (i = o - 1; i >= 0; i--) {
            t[i + r] = this[i + e];
          } else if (1e3 > o || !Buffer.TYPED_ARRAY_SUPPORT) for (i = 0; o > i; i++) {
            t[i + r] = this[i + e];
          } else Uint8Array.prototype.set.call(t, this.subarray(e, e + o), r);return o;
        }, Buffer.prototype.fill = function (t, r, e, n) {
          if ("string" == typeof t) {
            if ("string" == typeof r ? (n = r, r = 0, e = this.length) : "string" == typeof e && (n = e, e = this.length), 1 === t.length) {
              var i = t.charCodeAt(0);256 > i && (t = i);
            }if (void 0 !== n && "string" != typeof n) throw new TypeError("encoding must be a string");if ("string" == typeof n && !Buffer.isEncoding(n)) throw new TypeError("Unknown encoding: " + n);
          } else "number" == typeof t && (t = 255 & t);if (0 > r || this.length < r || this.length < e) throw new RangeError("Out of range index");if (r >= e) return this;r >>>= 0, e = void 0 === e ? this.length : e >>> 0, t || (t = 0);var o;if ("number" == typeof t) for (o = r; e > o; o++) {
            this[o] = t;
          } else {
            var f = Buffer.isBuffer(t) ? t : q(new Buffer(t, n).toString()),
                u = f.length;for (o = 0; e - r > o; o++) {
              this[o + r] = f[o % u];
            }
          }return this;
        };var $ = /[^+\/0-9A-Za-z-_]/g;
      }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
    }, { "base64-js": 24, ieee754: 26, isarray: 28 }], 24: [function (t, r, e) {
      "use strict";
      function n() {
        for (var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", r = 0, e = t.length; e > r; ++r) {
          a[r] = t[r], s[t.charCodeAt(r)] = r;
        }s["-".charCodeAt(0)] = 62, s["_".charCodeAt(0)] = 63;
      }function i(t) {
        var r,
            e,
            n,
            i,
            o,
            f,
            u = t.length;if (u % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");o = "=" === t[u - 2] ? 2 : "=" === t[u - 1] ? 1 : 0, f = new c(3 * u / 4 - o), n = o > 0 ? u - 4 : u;var a = 0;for (r = 0, e = 0; n > r; r += 4, e += 3) {
          i = s[t.charCodeAt(r)] << 18 | s[t.charCodeAt(r + 1)] << 12 | s[t.charCodeAt(r + 2)] << 6 | s[t.charCodeAt(r + 3)], f[a++] = i >> 16 & 255, f[a++] = i >> 8 & 255, f[a++] = 255 & i;
        }return 2 === o ? (i = s[t.charCodeAt(r)] << 2 | s[t.charCodeAt(r + 1)] >> 4, f[a++] = 255 & i) : 1 === o && (i = s[t.charCodeAt(r)] << 10 | s[t.charCodeAt(r + 1)] << 4 | s[t.charCodeAt(r + 2)] >> 2, f[a++] = i >> 8 & 255, f[a++] = 255 & i), f;
      }function o(t) {
        return a[t >> 18 & 63] + a[t >> 12 & 63] + a[t >> 6 & 63] + a[63 & t];
      }function f(t, r, e) {
        for (var n, i = [], f = r; e > f; f += 3) {
          n = (t[f] << 16) + (t[f + 1] << 8) + t[f + 2], i.push(o(n));
        }return i.join("");
      }function u(t) {
        for (var r, e = t.length, n = e % 3, i = "", o = [], u = 16383, s = 0, c = e - n; c > s; s += u) {
          o.push(f(t, s, s + u > c ? c : s + u));
        }return 1 === n ? (r = t[e - 1], i += a[r >> 2], i += a[r << 4 & 63], i += "==") : 2 === n && (r = (t[e - 2] << 8) + t[e - 1], i += a[r >> 10], i += a[r >> 4 & 63], i += a[r << 2 & 63], i += "="), o.push(i), o.join("");
      }e.toByteArray = i, e.fromByteArray = u;var a = [],
          s = [],
          c = "undefined" != typeof Uint8Array ? Uint8Array : Array;n();
    }, {}], 25: [function (t, r, e) {
      function n() {
        return this instanceof n ? void 0 : new n();
      }!function (t) {
        function e(t) {
          for (var r in s) {
            t[r] = s[r];
          }return t;
        }function n(t, r) {
          return u(this, t).push(r), this;
        }function i(t, r) {
          function e() {
            o.call(n, t, e), r.apply(this, arguments);
          }var n = this;return e.originalListener = r, u(n, t).push(e), n;
        }function o(t, r) {
          function e(t) {
            return t !== r && t.originalListener !== r;
          }var n,
              i = this;if (arguments.length) {
            if (r) {
              if (n = u(i, t, !0)) {
                if (n = n.filter(e), !n.length) return o.call(i, t);i[a][t] = n;
              }
            } else if (n = i[a], n && (delete n[t], !Object.keys(n).length)) return o.call(i);
          } else delete i[a];return i;
        }function f(t, r) {
          function e(t) {
            t.call(o);
          }function n(t) {
            t.call(o, r);
          }function i(t) {
            t.apply(o, s);
          }var o = this,
              f = u(o, t, !0);if (!f) return !1;var a = arguments.length;if (1 === a) f.forEach(e);else if (2 === a) f.forEach(n);else {
            var s = Array.prototype.slice.call(arguments, 1);f.forEach(i);
          }return !!f.length;
        }function u(t, r, e) {
          if (!e || t[a]) {
            var n = t[a] || (t[a] = {});return n[r] || (n[r] = []);
          }
        }"undefined" != typeof r && (r.exports = t);var a = "listeners",
            s = { on: n, once: i, off: o, emit: f };e(t.prototype), t.mixin = e;
      }(n);
    }, {}], 26: [function (t, r, e) {
      e.read = function (t, r, e, n, i) {
        var o,
            f,
            u = 8 * i - n - 1,
            a = (1 << u) - 1,
            s = a >> 1,
            c = -7,
            h = e ? i - 1 : 0,
            p = e ? -1 : 1,
            l = t[r + h];for (h += p, o = l & (1 << -c) - 1, l >>= -c, c += u; c > 0; o = 256 * o + t[r + h], h += p, c -= 8) {}for (f = o & (1 << -c) - 1, o >>= -c, c += n; c > 0; f = 256 * f + t[r + h], h += p, c -= 8) {}if (0 === o) o = 1 - s;else {
          if (o === a) return f ? NaN : (l ? -1 : 1) * (1 / 0);f += Math.pow(2, n), o -= s;
        }return (l ? -1 : 1) * f * Math.pow(2, o - n);
      }, e.write = function (t, r, e, n, i, o) {
        var f,
            u,
            a,
            s = 8 * o - i - 1,
            c = (1 << s) - 1,
            h = c >> 1,
            p = 23 === i ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
            l = n ? 0 : o - 1,
            d = n ? 1 : -1,
            y = 0 > r || 0 === r && 0 > 1 / r ? 1 : 0;for (r = Math.abs(r), isNaN(r) || r === 1 / 0 ? (u = isNaN(r) ? 1 : 0, f = c) : (f = Math.floor(Math.log(r) / Math.LN2), r * (a = Math.pow(2, -f)) < 1 && (f--, a *= 2), r += f + h >= 1 ? p / a : p * Math.pow(2, 1 - h), r * a >= 2 && (f++, a /= 2), f + h >= c ? (u = 0, f = c) : f + h >= 1 ? (u = (r * a - 1) * Math.pow(2, i), f += h) : (u = r * Math.pow(2, h - 1) * Math.pow(2, i), f = 0)); i >= 8; t[e + l] = 255 & u, l += d, u /= 256, i -= 8) {}for (f = f << i | u, s += i; s > 0; t[e + l] = 255 & f, l += d, f /= 256, s -= 8) {}t[e + l - d] |= 128 * y;
      };
    }, {}], 27: [function (t, r, e) {
      (function (Buffer) {
        var _t, _r;!function (e) {
          function n(t, r, e, n, u) {
            if (A && m && (r instanceof m && (r = new A(r)), n instanceof m && (n = new A(n))), !(r || e || n || d)) return void (t.buffer = a(x, 0));if (!i(r, e)) {
              var s = d || Array;u = e, n = r, e = 0, r = new s(8);
            }t.buffer = r, t.offset = e |= 0, "undefined" != typeof n && ("string" == typeof n ? f(r, e, n, u || 10) : i(n, u) ? o(r, e, n, u) : "number" == typeof u ? (c(r, e, n), c(r, e + 4, u)) : n > 0 ? h(r, e, n) : 0 > n ? p(r, e, n) : o(r, e, x, 0));
          }function i(t, r) {
            var e = t && t.length;return r |= 0, e && e >= r + 8 && "string" != typeof t[r];
          }function o(t, r, e, n) {
            r |= 0, n |= 0;for (var i = 0; 8 > i; i++) {
              t[r++] = 255 & e[n++];
            }
          }function f(t, r, e, n) {
            var i = 0,
                o = e.length,
                f = 0,
                u = 0;"-" === e[0] && i++;for (var a = i; o > i;) {
              var s = parseInt(e[i++], n);if (!(s >= 0)) break;u = u * n + s, f = f * n + Math.floor(u / U), u %= U;
            }a && (f = ~f, u ? u = U - u : f++), c(t, r, f), c(t, r + 4, u);
          }function u(t, r, e, n) {
            var i = "",
                o = s(t, r),
                f = s(t, r + 4),
                u = n && 2147483648 & o;for (u && (o = ~o, f = U - f), e = e || 10;;) {
              var a = o % e * U + f;if (o = Math.floor(o / e), f = Math.floor(a / e), i = (a % e).toString(e) + i, !o && !f) break;
            }return u && (i = "-" + i), i;
          }function a(t, r) {
            return Array.prototype.slice.call(t, r, r + 8);
          }function s(t, r) {
            return t[r++] * P + (t[r++] << 16) + (t[r++] << 8) + t[r];
          }function c(t, r, e) {
            t[r + 3] = 255 & e, e >>= 8, t[r + 2] = 255 & e, e >>= 8, t[r + 1] = 255 & e, e >>= 8, t[r] = 255 & e;
          }function h(t, r, e) {
            for (var n = r + 7; n >= r; n--) {
              t[n] = 255 & e, e /= 256;
            }
          }function p(t, r, e) {
            e++;for (var n = r + 7; n >= r; n--) {
              t[n] = 255 & -e ^ 255, e /= 256;
            }
          }function l(t) {
            return !!t && "[object Array]" == Object.prototype.toString.call(t);
          }var d,
              y = e.Uint64BE = _t = function t(r, e, i, o) {
            return this instanceof _t ? n(this, r, e, i, o) : new _t(r, e, i, o);
          },
              v = e.Int64BE = _r = function r(t, e, i, o) {
            return this instanceof _r ? n(this, t, e, i, o) : new _r(t, e, i, o);
          },
              g = y.prototype,
              w = v.prototype,
              E = "undefined",
              b = E !== (typeof Buffer === "undefined" ? "undefined" : _typeof(Buffer)) && Buffer,
              A = E !== (typeof Uint8Array === "undefined" ? "undefined" : _typeof(Uint8Array)) && Uint8Array,
              m = E !== (typeof ArrayBuffer === "undefined" ? "undefined" : _typeof(ArrayBuffer)) && ArrayBuffer,
              x = [0, 0, 0, 0, 0, 0, 0, 0],
              B = Array.isArray || l,
              U = 4294967296,
              P = 16777216;g.buffer = w.buffer = void 0, g.offset = w.offset = 0, g._isUint64BE = w._isInt64BE = !0, y.isUint64BE = function (t) {
            return !(!t || !t._isUint64BE);
          }, v.isInt64BE = function (t) {
            return !(!t || !t._isInt64BE);
          }, g.toNumber = function () {
            var t = this.buffer,
                r = this.offset,
                e = s(t, r),
                n = s(t, r + 4);return e ? e * U + n : n;
          }, w.toNumber = function () {
            var t = this.buffer,
                r = this.offset,
                e = 0 | s(t, r),
                n = s(t, r + 4);return e ? e * U + n : n;
          }, g.toArray = w.toArray = function (t) {
            var r = this.buffer,
                e = this.offset;return d = null, t !== !1 && 0 === e && 8 === r.length && B(r) ? r : a(r, e);
          }, b && (g.toBuffer = w.toBuffer = function (t) {
            var r = this.buffer,
                e = this.offset;if (d = b, t !== !1 && 0 === e && 8 === r.length && Buffer.isBuffer(r)) return r;var n = new b(8);return o(n, 0, r, e), n;
          }), A && (g.toArrayBuffer = w.toArrayBuffer = function (t) {
            var r = this.buffer,
                e = this.offset,
                n = r.buffer;if (d = A, t !== !1 && 0 === e && n instanceof m && 8 === n.byteLength) return n;var i = new A(8);return o(i, 0, r, e), i.buffer;
          }), w.toString = function (t) {
            return u(this.buffer, this.offset, t, !0);
          }, g.toString = function (t) {
            return u(this.buffer, this.offset, t, !1);
          }, g.toJSON = g.toNumber, w.toJSON = w.toNumber;
        }("object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && "string" != typeof e.nodeName ? e : this || {});
      }).call(this, t("buffer").Buffer);
    }, { buffer: 23 }], 28: [function (t, r, e) {
      var n = {}.toString;r.exports = Array.isArray || function (t) {
        return "[object Array]" == n.call(t);
      };
    }, {}] }, {}, [1])(1);
});

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
    function KeyStore(publicKey, secretKey) {
        classCallCheck(this, KeyStore);

        if (publicKey === undefined || secretKey === undefined) {
            this._keyPair = nacl.box.keyPair();
            console.debug('KeyStore: New public key:', u8aToHex(this._keyPair.publicKey));
        } else {
            this._keyPair = {
                publicKey: publicKey,
                secretKey: secretKey
            };
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

var CookiePair = function CookiePair(ours, theirs) {
    classCallCheck(this, CookiePair);

    this.ours = null;
    this.theirs = null;
    if (typeof ours !== 'undefined' && typeof theirs !== 'undefined') {
        this.ours = ours;
        this.theirs = theirs;
    } else if (typeof ours === 'undefined' && typeof theirs === 'undefined') {
        this.ours = new Cookie();
    } else {
        throw new Error('Either both or no cookies must be specified');
    }
};

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
        return possibleConstructorReturn(this, (ProtocolError.__proto__ || Object.getPrototypeOf(ProtocolError)).call(this, CloseCode.ProtocolError, message));
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

function decryptKeystore(box, keyStore, otherKey, msgType) {
    try {
        return keyStore.decrypt(box, otherKey);
    } catch (e) {
        if (e === 'decryption-failed') {
            throw new SignalingError(CloseCode.ProtocolError, 'Could not decrypt ' + msgType + ' message.');
        } else {
            throw e;
        }
    }
}

function isResponderId(receiver) {
    return receiver >= 0x02 && receiver <= 0xff;
}

var Signaling = function () {
    function Signaling(client, host, port, tasks, permanentKey, peerTrustedKey) {
        var _this = this;

        classCallCheck(this, Signaling);

        this.protocol = 'wss';
        this.ws = null;
        this.msgpackOptions = {
            codec: msgpack.createCodec({ binarraybuffer: true })
        };
        this.state = 'new';
        this.serverHandshakeState = 'new';
        this.handoverState = {
            local: false,
            peer: false
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
        this.onOpen = function (ev) {
            console.info(_this.logTag, 'Opened connection');
            _this.setState('server-handshake');
        };
        this.onError = function (ev) {
            console.error(_this.logTag, 'General WebSocket error', ev);
            _this.client.emit({ type: 'connection-error', data: ev });
        };
        this.onClose = function (ev) {
            if (ev.code === CloseCode.Handover) {
                console.info(_this.logTag, 'Closed WebSocket connection due to handover');
            } else {
                console.info(_this.logTag, 'Closed WebSocket connection');
                _this.setState('closed');
                var log = function log(reason) {
                    return console.error(_this.logTag, 'Server closed connection:', reason);
                };
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
                _this.client.emit({ type: 'connection-closed', data: ev });
            }
        };
        this.onMessage = function (ev) {
            console.debug(_this.logTag, 'New ws message (' + ev.data.byteLength + ' bytes)');
            try {
                var box = Box.fromUint8Array(new Uint8Array(ev.data), Nonce.TOTAL_LENGTH);
                var nonce = Nonce.fromArrayBuffer(box.nonce.buffer);
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
                if (e instanceof SignalingError) {
                    console.error(_this.logTag, 'Signaling error: ' + explainCloseCode(e.closeCode));
                    if (_this.state === 'task') {
                        _this.sendClose(e.closeCode);
                    }
                    _this.resetConnection(e.closeCode);
                } else if (e instanceof ConnectionError) {
                    console.warn(_this.logTag, 'Connection error. Resetting connection.');
                    _this.resetConnection(CloseCode.InternalError);
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
            if (this.ws !== null) {
                console.debug(this.logTag, 'Disconnecting WebSocket');
                this.ws.close();
            }
            this.ws = null;
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
            if (this.serverHandshakeState === 'new') {
                payload = box.data;
            } else {
                payload = this.permanentKey.decrypt(box, this.serverKey);
            }
            var msg = this.decodeMessage(payload, 'server handshake');
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
    }, {
        key: "onSignalingMessage",
        value: function onSignalingMessage(box, nonce) {
            console.debug('Message received');
            if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
                this.onSignalingServerMessage(box);
            } else {
                var decrypted = void 0;
                try {
                    decrypted = this.decryptFromPeer(box);
                } catch (e) {
                    if (e === 'decryption-failed') {
                        console.warn(this.logTag, 'Could not decrypt peer message from', byteToHex(nonce.source));
                        return;
                    } else {
                        throw e;
                    }
                }
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
            } else if (msg.type === 'data') {
                console.debug(this.logTag, 'Received data');
                this.handleData(msg);
            } else if (msg.type === 'restart') {
                console.debug(this.logTag, 'Received restart');
                this.handleRestart(msg);
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
            this.serverKey = new Uint8Array(msg.key);
            var cookie = void 0;
            do {
                cookie = new Cookie();
            } while (cookie.equals(nonce.cookie));
            this.cookiePair = new CookiePair(cookie, nonce.cookie);
        }
    }, {
        key: "sendClientAuth",
        value: function sendClientAuth() {
            var message = {
                type: 'client-auth',
                your_cookie: this.cookiePair.theirs.asArrayBuffer(),
                subprotocols: [Signaling.SALTYRTC_SUBPROTOCOL]
            };
            var packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
            console.debug(this.logTag, 'Sending client-auth');
            this.ws.send(packet);
            this.serverHandshakeState = 'auth-sent';
        }
    }, {
        key: "handleData",
        value: function handleData(msg) {
            this.client.emit({ type: 'data', data: msg.data });
            if (typeof msg.data_type === 'string') {
                this.client.emit({ type: 'data:' + msg.data_type, data: msg.data });
            }
        }
    }, {
        key: "handleRestart",
        value: function handleRestart(msg) {
            throw new ProtocolError('Restart messages not yet implemented');
        }
    }, {
        key: "handleSendError",
        value: function handleSendError(msg) {
            throw new ProtocolError('Send error messages not yet implemented');
        }
    }, {
        key: "validateNonce",
        value: function validateNonce(nonce, destination, source) {
            if (destination !== undefined && nonce.destination !== destination) {
                console.error(this.logTag, 'Nonce destination is', nonce.destination, 'but we\'re', this.address);
                throw 'bad-nonce-destination';
            }
            if (source !== undefined && nonce.source !== source) {
                console.error(this.logTag, 'Nonce source is', nonce.source, 'but should be', source);
                throw 'bad-nonce-source';
            }
        }
    }, {
        key: "validateRepeatedCookie",
        value: function validateRepeatedCookie(msg) {
            var repeatedCookie = Cookie.fromArrayBuffer(msg.your_cookie);
            if (!repeatedCookie.equals(this.cookiePair.ours)) {
                console.debug(this.logTag, 'Their cookie:', repeatedCookie.bytes);
                console.debug(this.logTag, 'Our cookie:', this.cookiePair.ours.bytes);
                throw new ProtocolError('Peer repeated cookie does not match our cookie');
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

            var csn = this.getNextCsn(receiver);
            var nonce = new Nonce(this.cookiePair.ours, csn.overflow, csn.sequenceNumber, this.address, receiver);
            var nonceBytes = new Uint8Array(nonce.toArrayBuffer());
            var data = this.msgpackEncode(message);
            if (encrypt === false) {
                return concat(nonceBytes, data);
            }
            var box = void 0;
            if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
                box = this.encryptHandshakeDataForServer(data, nonceBytes);
            } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR || isResponderId(receiver)) {
                box = this.encryptHandshakeDataForPeer(receiver, message.type, data, nonceBytes);
            } else {
                throw new ProtocolError('Bad receiver byte: ' + receiver);
            }
            return box.toUint8Array();
        }
    }, {
        key: "encryptHandshakeDataForServer",
        value: function encryptHandshakeDataForServer(payload, nonceBytes) {
            return this.permanentKey.encrypt(payload, nonceBytes, this.serverKey);
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
        value: function resetConnection() {
            var closeCode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : CloseCode.ClosingNormal;

            this.setState('new');
            this.serverCsn = new CombinedSequence();
            if (this.ws !== null) {
                console.debug(this.logTag, 'Disconnecting WebSocket (close code ' + closeCode + ')');
                this.ws.close(closeCode);
            }
            this.ws = null;
        }
    }, {
        key: "initTask",
        value: function initTask(task, data) {
            try {
                task.init(this, data);
            } catch (e) {
                if (e instanceof ValidationError) {
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
                var decrypted = this.permanentKey.decrypt(box, this.serverKey);
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
        key: "send",
        value: function send(payload) {
            if (['server-handshake', 'peer-handshake', 'task'].indexOf(this.state) === -1) {
                console.error('Trying to send message, but connection state is', this.state);
                throw new ConnectionError("Bad signaling state, cannot send message");
            }
            if (this.handoverState.local === false) {
                this.ws.send(payload);
            } else {}
        }
    }, {
        key: "sendTaskMessage",
        value: function sendTaskMessage(msg) {
            var receiver = this.getPeerAddress();
            if (receiver === null) {
                throw new SignalingError(CloseCode.InternalError, 'No peer address could be found');
            }
            var packet = this.buildPacket(msg, receiver);
            this.send(packet);
        }
    }, {
        key: "encryptForPeer",
        value: function encryptForPeer(data, nonce) {
            return this.sessionKey.encrypt(data, nonce, this.getPeerSessionKey());
        }
    }, {
        key: "decryptFromPeer",
        value: function decryptFromPeer(box) {
            return this.sessionKey.decrypt(box, this.getPeerSessionKey());
        }
    }, {
        key: "sendClose",
        value: function sendClose(reason) {}
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

Signaling.SALTYRTC_SUBPROTOCOL = 'v0.saltyrtc.org';
Signaling.SALTYRTC_ADDR_UNKNOWN = 0x00;
Signaling.SALTYRTC_ADDR_SERVER = 0x00;
Signaling.SALTYRTC_ADDR_INITIATOR = 0x01;

var Peer = function () {
    function Peer(permanentKey) {
        classCallCheck(this, Peer);

        this._csn = new CombinedSequence();
        this.permanentKey = permanentKey;
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
        key: "csn",
        get: function get() {
            return this._csn;
        }
    }]);
    return Peer;
}();

var Initiator = function (_Peer) {
    inherits(Initiator, _Peer);

    function Initiator(permanentKey) {
        classCallCheck(this, Initiator);

        var _this = possibleConstructorReturn(this, (Initiator.__proto__ || Object.getPrototypeOf(Initiator)).call(this, permanentKey));

        _this.connected = false;
        _this.handshakeState = 'new';
        _this._id = 0x01;
        return _this;
    }

    return Initiator;
}(Peer);

var Responder = function (_Peer2) {
    inherits(Responder, _Peer2);

    function Responder(id) {
        classCallCheck(this, Responder);

        var _this2 = possibleConstructorReturn(this, (Responder.__proto__ || Object.getPrototypeOf(Responder)).call(this));

        _this2.keyStore = new KeyStore();
        _this2.handshakeState = 'new';
        _this2._id = id;
        return _this2;
    }

    return Responder;
}(Peer);

var InitiatorSignaling = function (_Signaling) {
    inherits(InitiatorSignaling, _Signaling);

    function InitiatorSignaling(client, host, port, tasks, permanentKey, responderTrustedKey) {
        classCallCheck(this, InitiatorSignaling);

        var _this = possibleConstructorReturn(this, (InitiatorSignaling.__proto__ || Object.getPrototypeOf(InitiatorSignaling)).call(this, client, host, port, tasks, permanentKey, responderTrustedKey));

        _this.logTag = 'Initiator:';
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
        key: "getNextCsn",
        value: function getNextCsn(receiver) {
            if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
                return this.serverCsn.next();
            } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
                throw new ProtocolError('Initiator cannot send messages to initiator');
            } else if (isResponderId(receiver)) {
                if (this.getState() === 'task') {
                    return this.responder.csn.next();
                } else if (this.responders.has(receiver)) {
                    return this.responders.get(receiver).csn.next();
                } else {
                    throw new ProtocolError('Unknown responder: ' + receiver);
                }
            } else {
                throw new ProtocolError('Bad receiver byte: ' + receiver);
            }
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
        key: "getPeerAddress",
        value: function getPeerAddress() {
            if (this.responder !== null) {
                return this.responder.id;
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
        key: "processNewResponder",
        value: function processNewResponder(responderId) {
            if (!this.responders.has(responderId)) {
                if (!isResponderId(responderId)) {
                    throw new ProtocolError('Invalid responder id: ' + responderId);
                }
                var responder = new Responder(responderId);
                if (this.peerTrustedKey !== null) {
                    responder.handshakeState = 'token-received';
                    responder.permanentKey = this.peerTrustedKey;
                }
                this.responders.set(responderId, responder);
                this.client.emit({ type: 'new-responder', data: responderId });
            } else {
                console.warn(this.logTag, 'Got new-responder message for an already known responder.');
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
                payload = decryptKeystore(box, this.permanentKey, this.serverKey, 'server');
                var msg = this.decodeMessage(payload, 'server');
                switch (msg.type) {
                    case 'new-responder':
                        console.debug(this.logTag, 'Received new-responder');
                        this.handleNewResponder(msg);
                        break;
                    default:
                        throw new ProtocolError('Received unexpected server message: ' + msg.type);
                }
            } else if (isResponderId(nonce.source)) {
                var responder = this.responders.get(nonce.source);
                if (responder === null) {
                    throw new ProtocolError('Unknown message sender: ' + nonce.source);
                }
                var _msg = void 0;
                switch (responder.handshakeState) {
                    case 'new':
                        if (this.peerTrustedKey !== null) {
                            throw new SignalingError(CloseCode.InternalError, 'Handshake state is "new" even though a trusted key is available');
                        }
                        try {
                            payload = this.authToken.decrypt(box);
                        } catch (e) {
                            console.warn(this.logTag, 'Could not decrypt token message: ', e);
                            this.dropResponder(responder.id);
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
                                this.dropResponder(responder.id);
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
                        this.dropResponders();
                        this.setState('task');
                        console.info(this.logTag, 'Peer handshake done');
                        this.task.onPeerHandshakeDone();
                        break;
                    default:
                        throw new SignalingError(CloseCode.InternalError, 'Unknown responder handshake state');
                }
            } else {
                throw new SignalingError(CloseCode.InternalError, 'Message source is neither the server nor a responder');
            }
        }
    }, {
        key: "sendClientHello",
        value: function sendClientHello() {}
    }, {
        key: "handleServerAuth",
        value: function handleServerAuth(msg, nonce) {
            this.address = Signaling.SALTYRTC_ADDR_INITIATOR;
            this.validateNonce(nonce, this.address, Signaling.SALTYRTC_ADDR_SERVER);
            this.validateRepeatedCookie(msg);
            this.responders = new Map();
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = msg.responders[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var id = _step.value;

                    this.processNewResponder(id);
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

            console.debug(this.logTag, this.responders.size, 'responders connected');
            this.serverHandshakeState = 'done';
        }
    }, {
        key: "initPeerHandshake",
        value: function initPeerHandshake() {}
    }, {
        key: "handleNewResponder",
        value: function handleNewResponder(msg) {
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
            var packet = this.buildPacket(message, responder.id);
            console.debug(this.logTag, 'Sending key');
            this.ws.send(packet);
            responder.handshakeState = 'key-sent';
        }
    }, {
        key: "sendAuth",
        value: function sendAuth(responder, nonce) {
            if (nonce.cookie.equals(this.cookiePair.ours)) {
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
            var packet = this.buildPacket(message, responder.id);
            console.debug(this.logTag, 'Sending auth');
            this.ws.send(packet);
            responder.handshakeState = 'auth-sent';
        }
    }, {
        key: "handleAuth",
        value: function handleAuth(msg, responder, nonce) {
            this.validateRepeatedCookie(msg);
            try {
                InitiatorSignaling.validateTaskInfo(msg.tasks, msg.data);
            } catch (e) {
                if (e instanceof ValidationError) {
                    throw new ProtocolError("Peer sent invalid task info: " + e.message);
                }
                throw e;
            }
            var task = InitiatorSignaling.chooseCommonTask(this.tasks, msg.tasks);
            if (task === null) {
                throw new SignalingError(CloseCode.NoSharedTask, "No shared task could be found");
            } else {
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
    }, {
        key: "dropResponders",
        value: function dropResponders() {
            console.debug(this.logTag, 'Dropping', this.responders.size, 'other responders.');
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.responders.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var id = _step2.value;

                    this.dropResponder(id);
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
    }, {
        key: "dropResponder",
        value: function dropResponder(responderId) {
            var message = {
                type: 'drop-responder',
                id: responderId
            };
            var packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER);
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
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var task = _step3.value;

                    if (!data.hasOwnProperty(task)) {
                        throw new ValidationError("Task data must contain an entry for every task");
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
    }, {
        key: "chooseCommonTask",
        value: function chooseCommonTask(ourTasks, theirTasks) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = ourTasks[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var task = _step4.value;

                    if (theirTasks.indexOf(task.getName()) !== -1) {
                        return task;
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

            return null;
        }
    }]);
    return InitiatorSignaling;
}(Signaling);

var ResponderSignaling = function (_Signaling) {
    inherits(ResponderSignaling, _Signaling);

    function ResponderSignaling(client, host, port, tasks, permanentKey, initiatorPubKey, authToken) {
        classCallCheck(this, ResponderSignaling);

        var _this = possibleConstructorReturn(this, (ResponderSignaling.__proto__ || Object.getPrototypeOf(ResponderSignaling)).call(this, client, host, port, tasks, permanentKey, authToken === undefined ? initiatorPubKey : undefined));

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
        key: "getNextCsn",
        value: function getNextCsn(receiver) {
            if (receiver === Signaling.SALTYRTC_ADDR_SERVER) {
                return this.serverCsn.next();
            } else if (receiver === Signaling.SALTYRTC_ADDR_INITIATOR) {
                return this.initiator.csn.next();
            } else if (isResponderId(receiver)) {
                throw new ProtocolError('Responder may not send messages to other responders: ' + receiver);
            } else {
                throw new ProtocolError('Bad receiver byte: ' + receiver);
            }
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
        key: "getPeerAddress",
        value: function getPeerAddress() {
            if (this.initiator !== null) {
                return this.initiator.id;
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
        key: "onPeerHandshakeMessage",
        value: function onPeerHandshakeMessage(box, nonce) {
            if (nonce.destination != this.address) {
                throw new ProtocolError('Message destination does not match our address');
            }
            var payload = void 0;
            if (nonce.source === Signaling.SALTYRTC_ADDR_SERVER) {
                payload = decryptKeystore(box, this.permanentKey, this.serverKey, 'server');
                var msg = this.decodeMessage(payload, 'server');
                switch (msg.type) {
                    case 'new-initiator':
                        console.debug(this.logTag, 'Received new-initiator');
                        this.handleNewInitiator(msg);
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
                        throw new SignalingError(CloseCode.InternalError, 'Unknown initiator handshake state');
                }
            } else {
                throw new SignalingError(CloseCode.InternalError, 'Message source is neither the server nor the initiator');
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
            var packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_SERVER, false);
            console.debug(this.logTag, 'Sending client-hello');
            this.ws.send(packet);
            this.serverHandshakeState = 'hello-sent';
        }
    }, {
        key: "handleServerAuth",
        value: function handleServerAuth(msg, nonce) {
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
    }, {
        key: "handleNewInitiator",
        value: function handleNewInitiator(msg) {
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
            var packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
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
            var packet = this.buildPacket(replyMessage, Signaling.SALTYRTC_ADDR_INITIATOR);
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
            if (nonce.cookie.equals(this.cookiePair.ours)) {
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
            var packet = this.buildPacket(message, Signaling.SALTYRTC_ADDR_INITIATOR);
            console.debug(this.logTag, 'Sending auth');
            this.ws.send(packet);
            this.initiator.handshakeState = 'auth-sent';
        }
    }, {
        key: "handleAuth",
        value: function handleAuth(msg, nonce) {
            this.validateRepeatedCookie(msg);
            try {
                ResponderSignaling.validateTaskInfo(msg.task, msg.data);
            } catch (e) {
                if (e instanceof ValidationError) {
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
                throw new SignalingError(CloseCode.ProtocolError, "Initiator selected unknown task");
            } else {
                this.initTask(selectedTask, msg.data[selectedTask.getName()]);
            }
            console.debug(this.logTag, 'Initiator authenticated');
            this.initiator.cookie = nonce.cookie;
            this.initiator.handshakeState = 'auth-received';
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
        key: "withKeyStore",
        value: function withKeyStore(keyStore) {
            this.keyStore = keyStore;
            this.hasKeyStore = true;
            return this;
        }
    }, {
        key: "withTrustedPeerKey",
        value: function withTrustedPeerKey(peerTrustedKey) {
            this.peerTrustedKey = peerTrustedKey;
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
        key: "initiatorInfo",
        value: function initiatorInfo(initiatorPublicKey, authToken) {
            this.initiatorPublicKey = initiatorPublicKey;
            this.authToken = authToken;
            this.hasInitiatorInfo = true;
            return this;
        }
    }, {
        key: "asInitiator",
        value: function asInitiator() {
            this.requireConnectionInfo();
            this.requireKeyStore();
            this.requireTasks();
            if (this.hasTrustedPeerKey) {
                return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks, this.peerTrustedKey).asInitiator();
            } else {
                return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks).asInitiator();
            }
        }
    }, {
        key: "asResponder",
        value: function asResponder() {
            this.requireConnectionInfo();
            this.requireKeyStore();
            this.requireTasks();
            if (this.hasTrustedPeerKey) {
                return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks, this.peerTrustedKey).asResponder();
            } else {
                this.requireInitiatorInfo();
                return new SaltyRTC(this.keyStore, this.host, this.port, this.tasks).asResponder(this.initiatorPublicKey, this.authToken);
            }
        }
    }]);
    return SaltyRTCBuilder;
}();

var SaltyRTC = function () {
    function SaltyRTC(permanentKey, host, port, tasks, peerTrustedKey) {
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
        if (peerTrustedKey !== undefined) {
            this.peerTrustedKey = peerTrustedKey;
        }
        this.eventRegistry = new EventRegistry();
    }

    createClass(SaltyRTC, [{
        key: "asInitiator",
        value: function asInitiator() {
            if (this.peerTrustedKey !== null) {
                this._signaling = new InitiatorSignaling(this, this.host, this.port, this.tasks, this.permanentKey, this.peerTrustedKey);
            } else {
                this._signaling = new InitiatorSignaling(this, this.host, this.port, this.tasks, this.permanentKey);
            }
            return this;
        }
    }, {
        key: "asResponder",
        value: function asResponder(initiatorPubKey, authToken) {
            if (this.peerTrustedKey !== null) {
                this._signaling = new ResponderSignaling(this, this.host, this.port, this.tasks, this.permanentKey, this.peerTrustedKey);
            } else {
                var token = new AuthToken(authToken);
                this._signaling = new ResponderSignaling(this, this.host, this.port, this.tasks, this.permanentKey, initiatorPubKey, token);
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

}((this.saltyrtc.client = this.saltyrtc.client || {})));
