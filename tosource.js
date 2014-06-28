// Objects where toSource is equal to toString
[Boolean, Function, Number, RegExp].forEach(function(constructor)
{
  var prototype = constructor.prototype;
  if(prototype.toSource == undefined)
     prototype.toSource = prototype.toString;
});


// Objects with a specific output for toSource
function initIndent(indent)
{
  return indent === undefined ? '  ' : (indent || '')
}

function join(elements) {
    var indent = initIndent(walk.indent)

    var offset = ''
    walk.seenStack.forEach(function()
    {
      offset += indent
    })

    return indent.slice(1)
         + elements.join(','+(indent&&'\n')+offset)
         + (indent&&' ');
}

var prototype;

prototype = Array.prototype;
if(prototype.toSource == undefined)
  prototype.toSource = function()
  {
    return '[' + join(this.map(walk)) + ']'
  };

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

prototype = Object.prototype;
if(prototype.toSource == undefined)
  prototype.toSource = function()
  {
    var self = this;

    var keys = Object.keys(this)
    var items = ''
    if(keys.length)
    {
      items = join(keys.map(function (key) {
        var s_key = legalKey(key) ? key : JSON.stringify(key)
        var value = walk(self[key])

        return s_key + ':' + value
      }))
    }

    return '{' + items + '}'
  };

if(Math.toSource == undefined)
  Math.toSource = function()
  {
    return 'Math'
  }


/* toSource by Marcello Bastea-Forte - zlib license */
function walk(object) {
    var filter = walk.filter
    object = filter ? filter(object) : object

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

    var seen = walk.seenStack[walk.seenStack.length-1] || []

    var index = seen.indexOf(object);
    if (index >= 0) return '{$circularReference:'+index+'}'

    // Arrays and Objects
    seen = seen.slice()
    seen.push(object)

    walk.seenStack.push(seen)
    var result = object.toSource();
    walk.seenStack.pop()

    return result
}


module.exports = function(object, filter, indent) {
    walk.filter = filter
    walk.indent = initIndent(indent)

    walk.seenStack = []

    var result = walk(object)

    delete walk.filter
    delete walk.indent

    return result
}

var KEYWORD_REGEXP = /^(abstract|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|undefined|var|void|volatile|while|with)$/

function legalKey(string) {
    return /^[a-z_$][0-9a-z_$]*$/gi.test(string) && !KEYWORD_REGEXP.test(string)
}
