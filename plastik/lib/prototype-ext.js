Object.clone = function(obj) {
  var me = arguments.callee;
  if (arguments.length == 1) {
    me.prototype = obj;
    return new me();
  }
}

Object.extend(Array.prototype, {
  compress: function() {
    return this.inject([], 
      function(array, value) { 
        if(array.constructor == Array)
          return array.concat(value);
      }
    );
  },
  
  uniq: function() {
    var values = new Array();
    this.each(function(item) {
      if(!values.include(item))
       return values.push(item);
    });
    return values;
  },
  
  hasNilValue: function() {
    return this.any(function(item) { 
      return item == null || typeof(item) == 'undefined' ;
    });
  },
  
  toFloats: function() {
   return this.collect(function(item) { 
      return parseFloat(item); 
    });
  },
  
  sum: function() {
   return this.inject(0, function(sum, value) {
      return sum + value;
    });
  }
});


if(!window.Format)
  var Format = {}
  
Object.extend(Format, {
  truncToFixed: function(aNumber, precision) {
    aNumber = Math.floor(aNumber * Math.pow(10, precision));
    var res = (aNumber * Math.pow(10, -precision)).toFixed(precision);
    if (res.charAt(0) == ".") {
        res = "0" + res;
    }
    return res;
  },
  
  roundToFixed: function(aNumber, precision) {
    return this.truncToFixed(
        aNumber + 0.5 * Math.pow(10, -precision),
        precision);
  },
  
  degreesToRadians: function(degrees) {
    return degrees * (Math.PI/180);
  }
});


// TODO: Rewrite this
DomBuilder = {
	apply : function(o) { 
	  o = o || {};
		var els = ("p|div|span|strong|em|img|table|tr|td|th|thead|tbody|tfoot|pre|code" + 
					   "|h1|h2|h3|h4|h5|h6|ul|ol|li|form|input|textarea|legend|fieldset|" + 
					   "select|option|blockquote|cite|br|hr|dd|dl|dt|address|a|button|abbr|acronym|" +
					   "script|link|style|bdo|ins|del|object|param|col|colgroup|optgroup|caption|" + 
					   "label|dfn|kbd|samp|var").split("|");
    var el, i=0;
		while (el = els[i++]) o[el.toUpperCase()] = DomBuilder.tagFunc(el);
		return o;
	},
	tagFunc : function(tag) {
	  return function() {
	    var a = arguments, at, ch; a.slice = [].slice; 
	    if (a.length > 0) { 
	      if(typeof a[0] == 'number') a[0] = a[0].toString();
	      if (a[0].nodeName || typeof a[0] == "string") ch = a; else { at = a[0]; ch = a.slice(1); } }
	      return DomBuilder.elem(tag, at, ch);
	  }
  },
	elem : function(e, a, c) {
		a = a || {}; c = c || [];
		var el = document.createElement(e);
		for (var i in a) if (typeof a[i] != 'function') el.setAttribute(i, a[i]);
		for (var i=0; i<c.length; i++) {
			if (typeof c[i] == 'string') c[i] = document.createTextNode(c[i]);
			el.appendChild(c[i]);
		} 
		return el;
	}
}