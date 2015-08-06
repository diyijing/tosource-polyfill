tosource-polyfill
=================
toSource polyfill that converts JavaScript objects back to source code

It got inspiration on [node-tosource][1]

Introduction
------------
This module set on objects prototype the Mozilla [toSource()][2] function that
allow to get a source code representation of an object. It also has a helper
function that allow to serialize some extra objects like ```null``` or
```undefined```.

Installation
------------

`npm install tosource-polyfill`

Examples
--------
The following code:

```js
var toSource = require('tosource-polyfill')
console.log(toSource(
    [ 4, 5, 6, "hello", {
        a:2,
        'b':3,
        '1':4,
        'if':5,
        yes:true,
        no:false,
        nan:NaN,
        infinity:Infinity,
        'undefined':undefined,
        'null':null,
        foo: function(bar) {
            console.log("woo! a is "+a)
            console.log("and bar is "+bar)
        }
    },
    /we$/gi,
    new Date("Wed, 09 Aug 1995 00:00:00 GMT")]
))
```

Output:

```js
[ 4,
  5,
  6,
  "hello",
  { "1":4,
    a:2,
    b:3,
    "if":5,
    yes:true,
    no:false,
    nan:NaN,
    infinity:Infinity,
    "undefined":undefined,
    "null":null,
    foo:function (bar) {
            console.log("woo! a is "+a)
            console.log("and bar is "+bar)
        } },
  /we$/gi,
  new Date(807926400000) ]
```


See [test.js][3] for more examples.

Supported Types
---------------
* Numbers
* Strings
* Array literals
* object literals
* function
* RegExp literals
* Dates
* true
* false
* undefined
* null
* NaN
* Infinity

Notes
-----
* Functions are serialized with `func.toString()`, no closure properties are
  serialized
* Multiple references to the same object become copies
* Circular references are encoded as `{$circularReference:1}`

License
-------
toSource is open source software under the [zlib license][4].

[1]: https://github.com/marcello3d/node-tosource
[2]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toSource
[3]: https://github.com/piranna/tosource-polyfill/blob/master/test.js
[4]: https://github.com/piranna/tosource-polyfill/blob/master/LICENSE
