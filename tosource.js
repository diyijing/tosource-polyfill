// Objects where toSource is equal to toString
[Boolean, Function, Number, RegExp].forEach(function(constructor)
{
  var prototype = constructor.prototype;
  if(prototype.toSource == undefined)
     prototype.toSource = prototype.toString;
});


// Objects with a specific output for toSource
var prototype;

prototype = Date.prototype;
if(prototype.toSource == undefined)
  prototype.toSource = function()
  {
    return 'new Date('+this.getTime()+')'
  };

prototype = String.prototype;
if(prototype.toSource == undefined)
  prototype.toSource = function()
  {
    return JSON.stringify(this)
  };

if(Math.toSource == undefined)
  Math.toSource = function()
  {
    return 'Math'
  }


// Recursive objects
const DEFAULT_INDENT = '  '

var _filter
var _indent = DEFAULT_INDENT
var seen = []


function join(elements) {
  var offset = Array(seen.length+1).join(_indent)

  return _indent.slice(1)
       + elements.join(','+(_indent&&'\n')+offset)
       + (_indent&&' ');
}


prototype = Array.prototype;
if(prototype.toSource == undefined)
  prototype.toSource = function()
  {
    var items = ''
    if(this.length)
      items = join(this.map(walk))

    return '[' + items + ']'
  };

prototype = Object.prototype;
if(prototype.toSource == undefined)
  prototype.toSource = function()
  {
    var keys = Object.keys(this)

    var items = ''
    if(keys.length)
      items = join(keys.map(function (key) {
        var s_key = legalKey(key) ? key : JSON.stringify(key)
        var value = walk(this[key])

        return s_key + ':' + value
      },
      this))

    return '{' + items + '}'
  };


/* toSource by Marcello Bastea-Forte - zlib license */
function walk(object) {
    object = _filter ? _filter(object) : object

    switch (typeof object) {
        case 'boolean':
        case 'function':
        case 'number':
        case 'string':    return object.toSource()
        case 'undefined': return 'undefined'
    }

    if (object === Math) return object.toSource()
    if (object === null) return 'null'

    if (object instanceof RegExp) return object.toSource()
    if (object instanceof Date)   return object.toSource()

    var index = seen.indexOf(object);
    if (index >= 0) return '{$circularReference:'+index+'}'

    // Arrays and Objects
    seen.push(object)
    var result = object.toSource();
    seen.pop()

    return result
}


function getIndent(indent)
{
  switch (typeof indent) {
    case 'boolean':   return indent ? DEFAULT_INDENT : ''
    case 'number':    return Array(indent+1).join(' ')
    case 'string':    return indent
    case 'undefined': return DEFAULT_INDENT
  }

  if(indent === null) return ''

  throw SyntaxError('Invalid indent: '+indent)
}

module.exports = function(object, filter, indent) {
    _filter = filter
    _indent = getIndent(indent)

    var result = walk(object)

    _filter = undefined
    _indent = DEFAULT_INDENT

    return result
}

var KEYWORD_REGEXP = /^(abstract|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|undefined|var|void|volatile|while|with)$/

function legalKey(string) {
    return /^[a-z_$][0-9a-z_$]*$/gi.test(string) && !KEYWORD_REGEXP.test(string)
}
