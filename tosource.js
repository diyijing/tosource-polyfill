function applyToSource(prototype, func)
{
  if(prototype.toSource === undefined)
    Object.defineProperty(prototype, 'toSource', {value: func})
}


// Objects where toSource is equal to toString
[Boolean, Function, Number, RegExp].forEach(function(constructor)
{
  var prototype = constructor.prototype

  applyToSource(prototype, prototype.toString)
});


applyToSource(Date.prototype, function()
{
  return 'new Date('+this.getTime()+')'
})

applyToSource(String.prototype, function()
{
  return JSON.stringify(this)
})

applyToSource(Math, function()
{
  return 'Math'
})


// Recursive objects
const DEFAULT_INDENT = '  '

var _filter
var _indent
var seen = []


function join(elements) {
  var offset = Array(seen.length+1).join(_indent)

  return _indent.slice(1)
       + elements.join(','+(_indent&&'\n')+offset)
       + (_indent&&' ');
}

function fill(keys, func, thisArg)
{
  thisArg = thisArg || keys

  seen.push(thisArg)

  var items = ''
  if(keys.length)
    items = join(keys.map(func, thisArg))

  seen.pop()

  return items
}


applyToSource(Array.prototype, function()
{
  return '[' + fill(this, walk) + ']'
})

applyToSource(Object.prototype, function()
{
  var keys = Object.keys(this)

  function keyValue(key) {
    var s_key = legalKey(key) ? key : JSON.stringify(key)
    var value = walk(this[key])

    return s_key + ':' + value
  }

  return '{' + fill(keys, keyValue, this) + '}'
})


/* toSource by Marcello Bastea-Forte - zlib license */
function walk(object)
{
  object = _filter ? _filter(object) : object

  if (object === null) return 'null'
  if (typeof object === 'undefined') return 'undefined'

  var index = seen.indexOf(object);
  if (index >= 0) return '{$circularReference:'+index+'}'

  return object.toSource();
}


function getIndent(indent)
{
  switch(typeof indent)
  {
    case 'boolean':   return indent ? DEFAULT_INDENT : ''
    case 'number':    return Array(indent+1).join(' ')
    case 'string':    return indent
    case 'undefined': return DEFAULT_INDENT
  }

  if(indent === null) return ''

  throw SyntaxError('Invalid indent: '+indent)
}

module.exports = function(object, filter, indent)
{
  _filter = filter
  _indent = getIndent(indent)

  return walk(object)
}

var KEYWORD_REGEXP = /^(abstract|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|undefined|var|void|volatile|while|with)$/

function legalKey(string)
{
  return /^[a-z_$][0-9a-z_$]*$/gi.test(string) && !KEYWORD_REGEXP.test(string)
}
