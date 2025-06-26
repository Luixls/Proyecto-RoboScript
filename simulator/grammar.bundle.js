(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.grammar = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// lexer/lexer.js
const moo = require("moo");

const lexer = moo.compile({
  WS:           /[ \t]+/,
  COMENTARIO:   { match: /#[^\n]*/, lineBreaks: false },
  NUEVA_LINEA:  { match: /\r\n|\r|\n/, lineBreaks: true },

  // Palabras clave
  AVANZAR:   "AVANZAR",
  GIRAR:     "GIRAR",
  IZQUIERDA: "IZQUIERDA",
  DERECHA:   "DERECHA",
  ESPERAR:   "ESPERAR",
  ENCENDER:  "ENCENDER",
  APAGAR:    "APAGAR",
  SI:        "SI",
  ENTONCES:  "ENTONCES",
  MIENTRAS:  "MIENTRAS",
  HACER:     "HACER",
  FIN:       "FIN",
  REPETIR:   "REPETIR",
  RESET:     "RESET",
  ESTADO:    "ESTADO",

  // Operadores
  IGUAL:      "=",
  DIFERENTE:  "!=",
  MAYOR:      ">",
  MENOR:      "<",

  // Literales (enteros o decimales) y identificadores
  NUMERO:        /[0-9]+(?:\.[0-9]+)?/,
  IDENTIFICADOR: /[A-Z_]+/,

  // Captura cualquier otro carácter no reconocido
  ERROR: moo.error
});

module.exports = lexer;

},{"moo":2}],2:[function(require,module,exports){
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory) /* global define */
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.moo = factory()
  }
}(this, function() {
  'use strict';

  var hasOwnProperty = Object.prototype.hasOwnProperty
  var toString = Object.prototype.toString
  var hasSticky = typeof new RegExp().sticky === 'boolean'

  /***************************************************************************/

  function isRegExp(o) { return o && toString.call(o) === '[object RegExp]' }
  function isObject(o) { return o && typeof o === 'object' && !isRegExp(o) && !Array.isArray(o) }

  function reEscape(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  }
  function reGroups(s) {
    var re = new RegExp('|' + s)
    return re.exec('').length - 1
  }
  function reCapture(s) {
    return '(' + s + ')'
  }
  function reUnion(regexps) {
    if (!regexps.length) return '(?!)'
    var source =  regexps.map(function(s) {
      return "(?:" + s + ")"
    }).join('|')
    return "(?:" + source + ")"
  }

  function regexpOrLiteral(obj) {
    if (typeof obj === 'string') {
      return '(?:' + reEscape(obj) + ')'

    } else if (isRegExp(obj)) {
      // TODO: consider /u support
      if (obj.ignoreCase) throw new Error('RegExp /i flag not allowed')
      if (obj.global) throw new Error('RegExp /g flag is implied')
      if (obj.sticky) throw new Error('RegExp /y flag is implied')
      if (obj.multiline) throw new Error('RegExp /m flag is implied')
      return obj.source

    } else {
      throw new Error('Not a pattern: ' + obj)
    }
  }

  function pad(s, length) {
    if (s.length > length) {
      return s
    }
    return Array(length - s.length + 1).join(" ") + s
  }

  function lastNLines(string, numLines) {
    var position = string.length
    var lineBreaks = 0;
    while (true) {
      var idx = string.lastIndexOf("\n", position - 1)
      if (idx === -1) {
        break;
      } else {
        lineBreaks++
      }
      position = idx
      if (lineBreaks === numLines) {
        break;
      }
      if (position === 0) {
        break;
      }
    }
    var startPosition = 
      lineBreaks < numLines ?
      0 : 
      position + 1
    return string.substring(startPosition).split("\n")
  }

  function objectToRules(object) {
    var keys = Object.getOwnPropertyNames(object)
    var result = []
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var thing = object[key]
      var rules = [].concat(thing)
      if (key === 'include') {
        for (var j = 0; j < rules.length; j++) {
          result.push({include: rules[j]})
        }
        continue
      }
      var match = []
      rules.forEach(function(rule) {
        if (isObject(rule)) {
          if (match.length) result.push(ruleOptions(key, match))
          result.push(ruleOptions(key, rule))
          match = []
        } else {
          match.push(rule)
        }
      })
      if (match.length) result.push(ruleOptions(key, match))
    }
    return result
  }

  function arrayToRules(array) {
    var result = []
    for (var i = 0; i < array.length; i++) {
      var obj = array[i]
      if (obj.include) {
        var include = [].concat(obj.include)
        for (var j = 0; j < include.length; j++) {
          result.push({include: include[j]})
        }
        continue
      }
      if (!obj.type) {
        throw new Error('Rule has no type: ' + JSON.stringify(obj))
      }
      result.push(ruleOptions(obj.type, obj))
    }
    return result
  }

  function ruleOptions(type, obj) {
    if (!isObject(obj)) {
      obj = { match: obj }
    }
    if (obj.include) {
      throw new Error('Matching rules cannot also include states')
    }

    // nb. error and fallback imply lineBreaks
    var options = {
      defaultType: type,
      lineBreaks: !!obj.error || !!obj.fallback,
      pop: false,
      next: null,
      push: null,
      error: false,
      fallback: false,
      value: null,
      type: null,
      shouldThrow: false,
    }

    // Avoid Object.assign(), so we support IE9+
    for (var key in obj) {
      if (hasOwnProperty.call(obj, key)) {
        options[key] = obj[key]
      }
    }

    // type transform cannot be a string
    if (typeof options.type === 'string' && type !== options.type) {
      throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')")
    }

    // convert to array
    var match = options.match
    options.match = Array.isArray(match) ? match : match ? [match] : []
    options.match.sort(function(a, b) {
      return isRegExp(a) && isRegExp(b) ? 0
           : isRegExp(b) ? -1 : isRegExp(a) ? +1 : b.length - a.length
    })
    return options
  }

  function toRules(spec) {
    return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec)
  }

  var defaultErrorRule = ruleOptions('error', {lineBreaks: true, shouldThrow: true})
  function compileRules(rules, hasStates) {
    var errorRule = null
    var fast = Object.create(null)
    var fastAllowed = true
    var unicodeFlag = null
    var groups = []
    var parts = []

    // If there is a fallback rule, then disable fast matching
    for (var i = 0; i < rules.length; i++) {
      if (rules[i].fallback) {
        fastAllowed = false
      }
    }

    for (var i = 0; i < rules.length; i++) {
      var options = rules[i]

      if (options.include) {
        // all valid inclusions are removed by states() preprocessor
        throw new Error('Inheritance is not allowed in stateless lexers')
      }

      if (options.error || options.fallback) {
        // errorRule can only be set once
        if (errorRule) {
          if (!options.fallback === !errorRule.fallback) {
            throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')")
          } else {
            throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')")
          }
        }
        errorRule = options
      }

      var match = options.match.slice()
      if (fastAllowed) {
        while (match.length && typeof match[0] === 'string' && match[0].length === 1) {
          var word = match.shift()
          fast[word.charCodeAt(0)] = options
        }
      }

      // Warn about inappropriate state-switching options
      if (options.pop || options.push || options.next) {
        if (!hasStates) {
          throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')")
        }
        if (options.fallback) {
          throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')")
        }
      }

      // Only rules with a .match are included in the RegExp
      if (match.length === 0) {
        continue
      }
      fastAllowed = false

      groups.push(options)

      // Check unicode flag is used everywhere or nowhere
      for (var j = 0; j < match.length; j++) {
        var obj = match[j]
        if (!isRegExp(obj)) {
          continue
        }

        if (unicodeFlag === null) {
          unicodeFlag = obj.unicode
        } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
          throw new Error('If one rule is /u then all must be')
        }
      }

      // convert to RegExp
      var pat = reUnion(match.map(regexpOrLiteral))

      // validate
      var regexp = new RegExp(pat)
      if (regexp.test("")) {
        throw new Error("RegExp matches empty string: " + regexp)
      }
      var groupCount = reGroups(pat)
      if (groupCount > 0) {
        throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: … ) instead")
      }

      // try and detect rules matching newlines
      if (!options.lineBreaks && regexp.test('\n')) {
        throw new Error('Rule should declare lineBreaks: ' + regexp)
      }

      // store regex
      parts.push(reCapture(pat))
    }


    // If there's no fallback rule, use the sticky flag so we only look for
    // matches at the current index.
    //
    // If we don't support the sticky flag, then fake it using an irrefutable
    // match (i.e. an empty pattern).
    var fallbackRule = errorRule && errorRule.fallback
    var flags = hasSticky && !fallbackRule ? 'ym' : 'gm'
    var suffix = hasSticky || fallbackRule ? '' : '|'

    if (unicodeFlag === true) flags += "u"
    var combined = new RegExp(reUnion(parts) + suffix, flags)
    return {regexp: combined, groups: groups, fast: fast, error: errorRule || defaultErrorRule}
  }

  function compile(rules) {
    var result = compileRules(toRules(rules))
    return new Lexer({start: result}, 'start')
  }

  function checkStateGroup(g, name, map) {
    var state = g && (g.push || g.next)
    if (state && !map[state]) {
      throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')")
    }
    if (g && g.pop && +g.pop !== 1) {
      throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')")
    }
  }
  function compileStates(states, start) {
    var all = states.$all ? toRules(states.$all) : []
    delete states.$all

    var keys = Object.getOwnPropertyNames(states)
    if (!start) start = keys[0]

    var ruleMap = Object.create(null)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      ruleMap[key] = toRules(states[key]).concat(all)
    }
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      var rules = ruleMap[key]
      var included = Object.create(null)
      for (var j = 0; j < rules.length; j++) {
        var rule = rules[j]
        if (!rule.include) continue
        var splice = [j, 1]
        if (rule.include !== key && !included[rule.include]) {
          included[rule.include] = true
          var newRules = ruleMap[rule.include]
          if (!newRules) {
            throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')")
          }
          for (var k = 0; k < newRules.length; k++) {
            var newRule = newRules[k]
            if (rules.indexOf(newRule) !== -1) continue
            splice.push(newRule)
          }
        }
        rules.splice.apply(rules, splice)
        j--
      }
    }

    var map = Object.create(null)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      map[key] = compileRules(ruleMap[key], true)
    }

    for (var i = 0; i < keys.length; i++) {
      var name = keys[i]
      var state = map[name]
      var groups = state.groups
      for (var j = 0; j < groups.length; j++) {
        checkStateGroup(groups[j], name, map)
      }
      var fastKeys = Object.getOwnPropertyNames(state.fast)
      for (var j = 0; j < fastKeys.length; j++) {
        checkStateGroup(state.fast[fastKeys[j]], name, map)
      }
    }

    return new Lexer(map, start)
  }

  function keywordTransform(map) {

    // Use a JavaScript Map to map keywords to their corresponding token type
    // unless Map is unsupported, then fall back to using an Object:
    var isMap = typeof Map !== 'undefined'
    var reverseMap = isMap ? new Map : Object.create(null)

    var types = Object.getOwnPropertyNames(map)
    for (var i = 0; i < types.length; i++) {
      var tokenType = types[i]
      var item = map[tokenType]
      var keywordList = Array.isArray(item) ? item : [item]
      keywordList.forEach(function(keyword) {
        if (typeof keyword !== 'string') {
          throw new Error("keyword must be string (in keyword '" + tokenType + "')")
        }
        if (isMap) {
          reverseMap.set(keyword, tokenType)
        } else {
          reverseMap[keyword] = tokenType
        }
      })
    }
    return function(k) {
      return isMap ? reverseMap.get(k) : reverseMap[k]
    }
  }

  /***************************************************************************/

  var Lexer = function(states, state) {
    this.startState = state
    this.states = states
    this.buffer = ''
    this.stack = []
    this.reset()
  }

  Lexer.prototype.reset = function(data, info) {
    this.buffer = data || ''
    this.index = 0
    this.line = info ? info.line : 1
    this.col = info ? info.col : 1
    this.queuedToken = info ? info.queuedToken : null
    this.queuedText = info ? info.queuedText: "";
    this.queuedThrow = info ? info.queuedThrow : null
    this.setState(info ? info.state : this.startState)
    this.stack = info && info.stack ? info.stack.slice() : []
    return this
  }

  Lexer.prototype.save = function() {
    return {
      line: this.line,
      col: this.col,
      state: this.state,
      stack: this.stack.slice(),
      queuedToken: this.queuedToken,
      queuedText: this.queuedText,
      queuedThrow: this.queuedThrow,
    }
  }

  Lexer.prototype.setState = function(state) {
    if (!state || this.state === state) return
    this.state = state
    var info = this.states[state]
    this.groups = info.groups
    this.error = info.error
    this.re = info.regexp
    this.fast = info.fast
  }

  Lexer.prototype.popState = function() {
    this.setState(this.stack.pop())
  }

  Lexer.prototype.pushState = function(state) {
    this.stack.push(this.state)
    this.setState(state)
  }

  var eat = hasSticky ? function(re, buffer) { // assume re is /y
    return re.exec(buffer)
  } : function(re, buffer) { // assume re is /g
    var match = re.exec(buffer)
    // will always match, since we used the |(?:) trick
    if (match[0].length === 0) {
      return null
    }
    return match
  }

  Lexer.prototype._getGroup = function(match) {
    var groupCount = this.groups.length
    for (var i = 0; i < groupCount; i++) {
      if (match[i + 1] !== undefined) {
        return this.groups[i]
      }
    }
    throw new Error('Cannot find token type for matched text')
  }

  function tokenToString() {
    return this.value
  }

  Lexer.prototype.next = function() {
    var index = this.index

    // If a fallback token matched, we don't need to re-run the RegExp
    if (this.queuedGroup) {
      var token = this._token(this.queuedGroup, this.queuedText, index)
      this.queuedGroup = null
      this.queuedText = ""
      return token
    }

    var buffer = this.buffer
    if (index === buffer.length) {
      return // EOF
    }

    // Fast matching for single characters
    var group = this.fast[buffer.charCodeAt(index)]
    if (group) {
      return this._token(group, buffer.charAt(index), index)
    }

    // Execute RegExp
    var re = this.re
    re.lastIndex = index
    var match = eat(re, buffer)

    // Error tokens match the remaining buffer
    var error = this.error
    if (match == null) {
      return this._token(error, buffer.slice(index, buffer.length), index)
    }

    var group = this._getGroup(match)
    var text = match[0]

    if (error.fallback && match.index !== index) {
      this.queuedGroup = group
      this.queuedText = text

      // Fallback tokens contain the unmatched portion of the buffer
      return this._token(error, buffer.slice(index, match.index), index)
    }

    return this._token(group, text, index)
  }

  Lexer.prototype._token = function(group, text, offset) {
    // count line breaks
    var lineBreaks = 0
    if (group.lineBreaks) {
      var matchNL = /\n/g
      var nl = 1
      if (text === '\n') {
        lineBreaks = 1
      } else {
        while (matchNL.exec(text)) { lineBreaks++; nl = matchNL.lastIndex }
      }
    }

    var token = {
      type: (typeof group.type === 'function' && group.type(text)) || group.defaultType,
      value: typeof group.value === 'function' ? group.value(text) : text,
      text: text,
      toString: tokenToString,
      offset: offset,
      lineBreaks: lineBreaks,
      line: this.line,
      col: this.col,
    }
    // nb. adding more props to token object will make V8 sad!

    var size = text.length
    this.index += size
    this.line += lineBreaks
    if (lineBreaks !== 0) {
      this.col = size - nl + 1
    } else {
      this.col += size
    }

    // throw, if no rule with {error: true}
    if (group.shouldThrow) {
      var err = new Error(this.formatError(token, "invalid syntax"))
      throw err;
    }

    if (group.pop) this.popState()
    else if (group.push) this.pushState(group.push)
    else if (group.next) this.setState(group.next)

    return token
  }

  if (typeof Symbol !== 'undefined' && Symbol.iterator) {
    var LexerIterator = function(lexer) {
      this.lexer = lexer
    }

    LexerIterator.prototype.next = function() {
      var token = this.lexer.next()
      return {value: token, done: !token}
    }

    LexerIterator.prototype[Symbol.iterator] = function() {
      return this
    }

    Lexer.prototype[Symbol.iterator] = function() {
      return new LexerIterator(this)
    }
  }

  Lexer.prototype.formatError = function(token, message) {
    if (token == null) {
      // An undefined token indicates EOF
      var text = this.buffer.slice(this.index)
      var token = {
        text: text,
        offset: this.index,
        lineBreaks: text.indexOf('\n') === -1 ? 0 : 1,
        line: this.line,
        col: this.col,
      }
    }
    
    var numLinesAround = 2
    var firstDisplayedLine = Math.max(token.line - numLinesAround, 1)
    var lastDisplayedLine = token.line + numLinesAround
    var lastLineDigits = String(lastDisplayedLine).length
    var displayedLines = lastNLines(
        this.buffer, 
        (this.line - token.line) + numLinesAround + 1
      )
      .slice(0, 5)
    var errorLines = []
    errorLines.push(message + " at line " + token.line + " col " + token.col + ":")
    errorLines.push("")
    for (var i = 0; i < displayedLines.length; i++) {
      var line = displayedLines[i]
      var lineNo = firstDisplayedLine + i
      errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line);
      if (lineNo === token.line) {
        errorLines.push(pad("", lastLineDigits + token.col + 1) + "^")
      }
    }
    return errorLines.join("\n")
  }

  Lexer.prototype.clone = function() {
    return new Lexer(this.states, this.state)
  }

  Lexer.prototype.has = function(tokenType) {
    return true
  }


  return {
    compile: compile,
    states: compileStates,
    error: Object.freeze({error: true}),
    fallback: Object.freeze({fallback: true}),
    keywords: keywordTransform,
  }

}));

},{}],3:[function(require,module,exports){
// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const lexer = require("../lexer/lexer");
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "programa", "symbols": ["_", "instrucciones", "_"], "postprocess": d => ({ type: "Program", body: d[1] })},
    {"name": "instrucciones", "symbols": ["instruccion", "_", "instrucciones"], "postprocess": d => [d[0], ...d[2]]},
    {"name": "instrucciones", "symbols": ["instruccion"], "postprocess": d => [d[0]]},
    {"name": "instruccion", "symbols": ["avanzarStmt"]},
    {"name": "instruccion", "symbols": ["girarStmt"]},
    {"name": "instruccion", "symbols": ["esperarStmt"]},
    {"name": "instruccion", "symbols": ["encenderStmt"]},
    {"name": "instruccion", "symbols": ["apagarStmt"]},
    {"name": "instruccion", "symbols": ["siStmt"]},
    {"name": "instruccion", "symbols": ["mientrasStmt"]},
    {"name": "instruccion", "symbols": ["resetStmt"]},
    {"name": "instruccion", "symbols": ["estadoStmt"]},
    {"name": "instruccion", "symbols": ["repetirStmt"]},
    {"name": "avanzarStmt", "symbols": [(lexer.has("AVANZAR") ? {type: "AVANZAR"} : AVANZAR), "_", (lexer.has("NUMERO") ? {type: "NUMERO"} : NUMERO)], "postprocess": d => ({ type: "Avanzar",  value: Number(d[2].value) })},
    {"name": "girarStmt", "symbols": [(lexer.has("GIRAR") ? {type: "GIRAR"} : GIRAR), "_", (lexer.has("IZQUIERDA") ? {type: "IZQUIERDA"} : IZQUIERDA)], "postprocess": d => ({ type: "Girar",    direction: d[2].value })},
    {"name": "girarStmt", "symbols": [(lexer.has("GIRAR") ? {type: "GIRAR"} : GIRAR), "_", (lexer.has("DERECHA") ? {type: "DERECHA"} : DERECHA)], "postprocess": d => ({ type: "Girar",    direction: d[2].value })},
    {"name": "esperarStmt", "symbols": [(lexer.has("ESPERAR") ? {type: "ESPERAR"} : ESPERAR), "_", (lexer.has("NUMERO") ? {type: "NUMERO"} : NUMERO)], "postprocess": d => ({ type: "Esperar",  value: Number(d[2].value) })},
    {"name": "encenderStmt", "symbols": [(lexer.has("ENCENDER") ? {type: "ENCENDER"} : ENCENDER), "_", (lexer.has("IDENTIFICADOR") ? {type: "IDENTIFICADOR"} : IDENTIFICADOR)], "postprocess": d => ({ type: "Encender", target: d[2].value })},
    {"name": "apagarStmt", "symbols": [(lexer.has("APAGAR") ? {type: "APAGAR"} : APAGAR), "_", (lexer.has("IDENTIFICADOR") ? {type: "IDENTIFICADOR"} : IDENTIFICADOR)], "postprocess": d => ({ type: "Apagar",   target: d[2].value })},
    {"name": "siStmt", "symbols": [(lexer.has("SI") ? {type: "SI"} : SI), "_", "condicion", "_", (lexer.has("ENTONCES") ? {type: "ENTONCES"} : ENTONCES), "_", "bloque", "_", (lexer.has("FIN") ? {type: "FIN"} : FIN)], "postprocess": d => ({ type: "Si",       test: d[2],    consequent: d[6] })},
    {"name": "mientrasStmt", "symbols": [(lexer.has("MIENTRAS") ? {type: "MIENTRAS"} : MIENTRAS), "_", "condicion", "_", (lexer.has("HACER") ? {type: "HACER"} : HACER), "_", "bloque", "_", (lexer.has("FIN") ? {type: "FIN"} : FIN)], "postprocess": d => ({ type: "Mientras", test: d[2],    body:       d[6] })},
    {"name": "resetStmt", "symbols": [(lexer.has("RESET") ? {type: "RESET"} : RESET)], "postprocess": d => ({ type: "Reset" })},
    {"name": "estadoStmt", "symbols": [(lexer.has("ESTADO") ? {type: "ESTADO"} : ESTADO)], "postprocess": d => ({ type: "Estado" })},
    {"name": "repetirStmt", "symbols": [(lexer.has("REPETIR") ? {type: "REPETIR"} : REPETIR), "_", (lexer.has("NUMERO") ? {type: "NUMERO"} : NUMERO), "_", (lexer.has("HACER") ? {type: "HACER"} : HACER), "_", "bloque", "_", (lexer.has("FIN") ? {type: "FIN"} : FIN)], "postprocess": d => ({ type: "Repetir", count: Number(d[2].value), body: d[6] })},
    {"name": "numeroOId", "symbols": [(lexer.has("NUMERO") ? {type: "NUMERO"} : NUMERO)], "postprocess": d => ({ kind: "Literal",    value: Number(d[0].value) })},
    {"name": "numeroOId", "symbols": [(lexer.has("IDENTIFICADOR") ? {type: "IDENTIFICADOR"} : IDENTIFICADOR)], "postprocess": d => ({ kind: "Identifier", value: d[0].value })},
    {"name": "condicion", "symbols": [(lexer.has("IDENTIFICADOR") ? {type: "IDENTIFICADOR"} : IDENTIFICADOR), "_", "operador", "_", "numeroOId"], "postprocess": d => ({ type: "Condicion", left: d[0].value, operator: d[2], right: d[4] })},
    {"name": "operador", "symbols": [(lexer.has("IGUAL") ? {type: "IGUAL"} : IGUAL)], "postprocess": () => "="},
    {"name": "operador", "symbols": [(lexer.has("DIFERENTE") ? {type: "DIFERENTE"} : DIFERENTE)], "postprocess": () => "!="},
    {"name": "operador", "symbols": [(lexer.has("MAYOR") ? {type: "MAYOR"} : MAYOR)], "postprocess": () => ">"},
    {"name": "operador", "symbols": [(lexer.has("MENOR") ? {type: "MENOR"} : MENOR)], "postprocess": () => "<"},
    {"name": "bloque", "symbols": ["instrucciones"], "postprocess": d => d[0]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("NUEVA_LINEA") ? {type: "NUEVA_LINEA"} : NUEVA_LINEA)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("COMENTARIO") ? {type: "COMENTARIO"} : COMENTARIO)]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]}
]
  , ParserStart: "programa"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();

},{"../lexer/lexer":1}]},{},[3])(3)
});
