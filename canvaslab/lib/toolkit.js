
if(!window.ToolKit)
  var ToolKit = {};

ToolKit.Format = {
  roundInterval: function(range, intervals, precision) {
    var sep = range/intervals;
    return parseFloat(this.roundToFixed(sep, precision));
  },
  
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
};

ToolKit.Color = Base.extend({
  constructor: function(red, green, blue, alpha) {
    if (alpha == undefined  || alpha == null) {
        alpha = 1.0;
    }
    this.rgb = { r: red, g: green, b: blue, a: alpha };
  },
  
  colorWithAlpha: function (alpha) {
    return ToolKit.Color.fromRGB(this.rgb.r, this.rgb.g, this.rgb.b, alpha);
  },

  colorWithHue: function (hue) {
    // get an HSL model, and set the new hue...
    var hsl = this.asHSL();
    hsl.h = hue;
    // convert back to RGB...
    return ToolKit.Color.fromHSL(hsl);
  },

  colorWithSaturation: function (saturation) {
    // get an HSL model, and set the new hue...
    var hsl = this.asHSL();
    hsl.s = saturation;
    // convert back to RGB...
    return ToolKit.Color.fromHSL(hsl);
  },

  colorWithLightness: function (lightness) {
    // get an HSL model, and set the new hue...
    var hsl = this.asHSL();
    hsl.l = lightness;
    // convert back to RGB...
    return ToolKit.Color.fromHSL(hsl);
  },
  
  shiftHueAngle: function(angle) {
    var ccc = ToolKit.Color.clampColorComponent;
    var hsl = this.asHSL();
    var hue = ccc(hsl.h, 360);
    var diff = (hue + angle) % 360;
    hsl.h = diff/360;
    return ToolKit.Color.fromHSL(hsl);
  },

  darkerColorWithLevel: function (level) {
    var hsl  = this.asHSL();
    hsl.l = Math.max(hsl.l - level, 0);
    return ToolKit.Color.fromHSL(hsl);
  },

  lighterColorWithLevel: function (level) {
    var hsl  = this.asHSL();
    hsl.l = Math.min(hsl.l + level, 1);
    return ToolKit.Color.fromHSL(hsl);
  },

  blendedColor: function (other, fraction) {
    if (fraction == undefined || fraction == null) {
      fraction = 0.5;
    }
    var sf = 1.0 - fraction;
    var s = this.rgb;
    var d = other.rgb;
    var df = fraction;
    return ToolKit.Color.fromRGB(
      (s.r * sf) + (d.r * df),
      (s.g * sf) + (d.g * df),
      (s.b * sf) + (d.b * df),
      (s.a * sf) + (d.a * df)
    );
  },
  
  withCompliment: function() {
    return [this, this.shiftHueAngle(180)];
  },
  
  withTriads: function() {
    return [
      this,
      this.shiftHueAngle(120),
      this.shiftHueAngle(240)
    ];
  },
  
  withTetrads: function() {
    return [
      this,
      this.shiftHueAngle(90),
      this.shiftHueAngle(180),
      this.shiftHueAngle(270)
    ];
  },
  
  withAnalogous: function() {
    return [
      this,
      this.shiftHueAngle(30),
      this.shiftHueAngle(330)
    ];
  },
  
  withMonochromatic: function(steps, direction) {
    var steps = steps != undefined ? steps : 5;
    var direction = direction != undefined ? direction : 'lighter';
    var colors = [];
    for(var i = 0; i < steps; i++)
      colors.push(this[direction + "ColorWithLevel"](0.1 * i));
      
    return colors;
  },
      
  isLight: function () {
    return this.asHSL().b > 0.5;
  },

  isDark: function () {
    return (!this.isLight());
  },

  toHSLString: function () {
    var c = this.asHSL();
    var ccc = ToolKit.Color.clampColorComponent;
    var rval = this._hslString;
    if (!rval) {
      var mid = (
        ccc(c.h, 360).toFixed(0)
        + "," + ccc(c.s, 100).toPrecision(4) + "%" 
        + "," + ccc(c.l, 100).toPrecision(4) + "%"
      );
      var a = c.a;
      if (a >= 1) {
        a = 1;
        rval = "hsl(" + mid + ")";
      } else {
        if (a <= 0)
          a = 0;
        rval = "hsla(" + mid + "," + a + ")";
      }
      this._hslString = rval;
    }
    return rval;
  },

  toRGBString: function () {
    var c = this.rgb;
    var ccc = ToolKit.Color.clampColorComponent;
    var rval = this._rgbString;
    if (!rval) {
      var mid = (
        ccc(c.r, 255).toFixed(0)
        + "," + ccc(c.g, 255).toFixed(0)
        + "," + ccc(c.b, 255).toFixed(0)
      );
      if (c.a != 1) {
        rval = "rgba(" + mid + "," + c.a + ")";
      } else {
        rval = "rgb(" + mid + ")";
      }
      this._rgbString = rval;
    }
    return rval;
  },

  asRGB: function () {
    return Object.clone(this.rgb);
  },

  toHexString: function () {
    var color = ToolKit.Color;
    var c = this.rgb;
    var ccc = ToolKit.Color.clampColorComponent;
    var rval = this._hexString;
    if (!rval) {
      rval = ("#" + 
        color.toColorPart(ccc(c.r, 255)) +
        color.toColorPart(ccc(c.g, 255)) +
        color.toColorPart(ccc(c.b, 255))
      );
      this._hexString = rval;
    }
    return rval;
  },

  asHSV: function () {
    var hsv = this.hsv;
    var c = this.rgb;
    if (typeof(hsv) == 'undefined' || hsv == null) {
      hsv = ToolKit.Color.rgbToHSV(this.rgb);
      this.hsv = hsv;
    }
    return Object.clone(hsv);
  },

  asHSL: function () {
    var hsl = this.hsl;
    var c = this.rgb;
    if (typeof(hsl) == 'undefined' || hsl == null) {
      hsl = ToolKit.Color.rgbToHSL(this.rgb);
      this.hsl = hsl;
    }
    return Object.clone(hsl);
  },

  toString: function () {
    return this.toRGBString();
  }
}, {
  
  fromRGB: function(red, green, blue, alpha) {
    if (arguments.length == 1) {
      var rgb = red;
      red = rgb.r;
      green = rgb.g;
      blue = rgb.b;
      alpha = rgb.a == undefined ? undefined : rgb.a;
    }
    return new this(red, green, blue, alpha);
  },
  
  fromHSL: function (hue, saturation, lightness, alpha) {
    var Color = ToolKit.Color;
    return Color.fromRGB(Color.hslToRGB.apply(Color, arguments));
  },

  fromHSV: function (hue, saturation, value, alpha) {
    var Color = ToolKit.Color;
    return Color.fromRGB(Color.hsvToRGB.apply(Color, arguments));
  },

  fromName: function (name) {
    var Color = ToolKit.Color;
    var htmlColor = Color._namedColors[name.toLowerCase()];
    if (typeof(htmlColor) == 'string') {
      return Color.fromHexString(htmlColor);
    } else if (name == "transparent") {
      return Color.transparentColor();
    }
    return null;
  },

  fromHexString: function (hexCode) {
    if (hexCode.charAt(0) == '#') {
      hexCode = hexCode.substring(1);
    }
  
    var components = [], i, hex;
    if (hexCode.length == 3) {
      for (i = 0; i < 3; i++) {
        hex = hexCode.substr(i, 1);
        components.push(parseInt(hex + hex, 16) / 255.0);
      }
    } else {
      for (i = 0; i < 6; i += 2) {
        hex = hexCode.substr(i, 2);
        components.push(parseInt(hex, 16) / 255.0);
      }
    }
  
    return ToolKit.Color.fromRGB.apply(ToolKit.Color, components);
  },
  
  namedColors: function () {
    return Object.clone(ToolKit.Color._namedColors);
  },
  
  _fromColorString: function (pre, method, scales, colorCode) {
      // parses either HSL or RGB
      if (colorCode.indexOf(pre) == 0) {
          colorCode = colorCode.substring(colorCode.indexOf("(", 3) + 1, colorCode.length - 1);
      } 
      var colorChunks = colorCode.split(/\s*,\s*/);
      var colorFloats = [];
      for (var i = 0; i < colorChunks.length; i++) {
          var c = colorChunks[i];
          var val;
          var three = c.substring(c.length - 3);
          if (c.charAt(c.length - 1) == '%') {
              val = 0.01 * parseFloat(c.substring(0, c.length - 1));
          } else if (three == "deg") {
              val = parseFloat(c) / 360.0;
          } else if (three == "rad") {
              val = parseFloat(c) / (Math.PI * 2);
          } else {
              val = scales[i] * parseFloat(c);
          }
          colorFloats.push(val);
      }
      return ToolKit.Color[method].apply(ToolKit.Color, colorFloats);
  },
  
  clampColorComponent: function (v, scale) {
       v *= scale;
       
       if (v < 0) {
           return 0;
       } else if (v > scale) {
           return scale;
       } else {
           return v;
       }
   },

   _hslValue: function (n1, n2, hue) {
       if (hue > 6.0) {
           hue -= 6.0;
       } else if (hue < 0.0) {
           hue += 6.0;
       }
       var val;
       if (hue < 1.0) {
           val = n1 + (n2 - n1) * hue;
       } else if (hue < 3.0) {
           val = n2;
       } else if (hue < 4.0) {
           val = n1 + (n2 - n1) * (4.0 - hue);
       } else {
           val = n1;
       }
       return val;
   },
       
   hsvToRGB: function (hue, saturation, value, alpha) {
       if (arguments.length == 1) {
           var hsv = hue;
           hue = hsv.h;
           saturation = hsv.s;
           value = hsv.v;
           alpha = hsv.a;
       }
       var red;
       var green;
       var blue;
       if (saturation == 0.0) {
           red = 0;
           green = 0;
           blue = 0;
       } else {
           var i = Math.floor(hue * 6);
           var f = (hue * 6) - i;
           var p = value * (1 - saturation);
           var q = value * (1 - (saturation * f));
           var t = value * (1 - (saturation * (1 - f)));
           switch (i) {
               case 1: red = q; green = value; blue = p; break;
               case 2: red = p; green = value; blue = t; break;
               case 3: red = p; green = q; blue = value; break;
               case 4: red = t; green = p; blue = value; break;
               case 5: red = value; green = p; blue = q; break;
               case 6: // fall through
               case 0: red = value; green = t; blue = p; break;
           }
       }
       return {
           r: red,
           g: green,
           b: blue,
           a: alpha
       };
   },

   hslToRGB: function (hue, saturation, lightness, alpha) {
       if (arguments.length == 1) {
           var hsl = hue;
           hue = hsl.h;
           saturation = hsl.s;
           lightness = hsl.l;
           alpha = hsl.a;
       }
       var red;
       var green;
       var blue;
       if (saturation == 0) {
           red = lightness;
           green = lightness;
           blue = lightness;
       } else {
           var m2;
           if (lightness <= 0.5) {
               m2 = lightness * (1.0 + saturation);
           } else {
               m2 = lightness + saturation - (lightness * saturation);
           }
           var m1 = (2.0 * lightness) - m2;
           var f = ToolKit.Color._hslValue;
           var h6 = hue * 6.0;
           red = f(m1, m2, h6 + 2);
           green = f(m1, m2, h6);
           blue = f(m1, m2, h6 - 2);
       }
       return {
           r: red,
           g: green,
           b: blue,
           a: alpha
       };
   },

   rgbToHSV: function (red, green, blue, alpha) {
       if (arguments.length == 1) {
           var rgb = red;
           red = rgb.r;
           green = rgb.g;
           blue = rgb.b;
           alpha = rgb.a;
       }
       var max = Math.max(Math.max(red, green), blue);
       var min = Math.min(Math.min(red, green), blue);
       var hue;
       var saturation;
       var value = max;
       if (min == max) {
           hue = 0;
           saturation = 0;
       } else {
           var delta = (max - min);
           saturation = delta / max;

           if (red == max) {
               hue = (green - blue) / delta;
           } else if (green == max) {
               hue = 2 + ((blue - red) / delta);
           } else {
               hue = 4 + ((red - green) / delta);
           }
           hue /= 6;
           if (hue < 0) {
               hue += 1;
           }
           if (hue > 1) {
               hue -= 1;
           }
       }
       return {
           h: hue,
           s: saturation,
           v: value,
           a: alpha
       };
   },
           
   rgbToHSL: function (red, green, blue, alpha) {
       if (arguments.length == 1) {
           var rgb = red;
           red = rgb.r;
           green = rgb.g;
           blue = rgb.b;
           alpha = rgb.a;
       }
       var max = Math.max(red, Math.max(green, blue));
       var min = Math.min(red, Math.min(green, blue));
       var hue;
       var saturation;
       var lightness = (max + min) / 2.0;
       var delta = max - min;
       if (delta == 0) {
           hue = 0;
           saturation = 0;
       } else {
           if (lightness <= 0.5) {
               saturation = delta / (max + min);
           } else {
               saturation = delta / (2 - max - min);
           }
           if (red == max) {
               hue = (green - blue) / delta;
           } else if (green == max) {
               hue = 2 + ((blue - red) / delta);
           } else {
               hue = 4 + ((red - green) / delta);
           }
           hue /= 6;
           if (hue < 0) {
               hue += 1;
           }
           if (hue > 1) {
               hue -= 1;
           }
           
       }
       return {
           h: hue,
           s: saturation,
           l: lightness,
           a: alpha
       };
   },

   toColorPart: function (num) {
       num = Math.round(num);
       var digits = num.toString(16);
       if (num < 16) {
           return '0' + digits;
       }
       return digits;
   },

   init: function () {
    this.fromRGBString = this._fromColorString.bind(ToolKit.Color, 'rgb', 'fromRGB', [1.0/255.0, 1.0/255.0, 1.0/255.0, 1]);
    this.fromHSLString = this._fromColorString.bind(ToolKit.Color, 'hsl', 'fromHSL', [1.0/360.0, 0.01, 0.01, 1]);
       
       var third = 1.0 / 3.0;
       var colors = $H({
           // NSColor colors plus transparent
           black: [0, 0, 0],
           blue: [0, 0, 1],
           brown: [0.6, 0.4, 0.2],
           cyan: [0, 1, 1],
           darkGray: [third, third, third],
           gray: [0.5, 0.5, 0.5],
           green: [0, 1, 0],
           lightGray: [2 * third, 2 * third, 2 * third],
           magenta: [1, 0, 1],
           orange: [1, 0.5, 0],
           purple: [0.5, 0, 0.5],
           red: [1, 0, 0],
           transparent: [0, 0, 0, 0],
           white: [1, 1, 1],
           yellow: [1, 1, 0]
       });

       var makeColor = function (name, r, g, b, a) {
           var rval = this.fromRGB(r, g, b, a);
           this[name] = function () { return rval; };
           return rval;
       }.bind(this);
       
       colors.each(function(color) {
         var name = color.key + "Color";
         var bindArgs = [name].concat(color.value);
         this[name] = function(bindArgs) {
            makeColor.apply(null, bindArgs);
         }.bind(this, bindArgs);
         this[name]();
       }.bind(this));
   
       this._namedColors = {
           aliceblue: "#f0f8ff",
           antiquewhite: "#faebd7",
           aqua: "#00ffff",
           aquamarine: "#7fffd4",
           azure: "#f0ffff",
           beige: "#f5f5dc",
           bisque: "#ffe4c4",
           black: "#000000",
           blanchedalmond: "#ffebcd",
           blue: "#0000ff",
           blueviolet: "#8a2be2",
           brown: "#a52a2a",
           burlywood: "#deb887",
           cadetblue: "#5f9ea0",
           chartreuse: "#7fff00",
           chocolate: "#d2691e",
           coral: "#ff7f50",
           cornflowerblue: "#6495ed",
           cornsilk: "#fff8dc",
           crimson: "#dc143c",
           cyan: "#00ffff",
           darkblue: "#00008b",
           darkcyan: "#008b8b",
           darkgoldenrod: "#b8860b",
           darkgray: "#a9a9a9",
           darkgreen: "#006400",
           darkgrey: "#a9a9a9",
           darkkhaki: "#bdb76b",
           darkmagenta: "#8b008b",
           darkolivegreen: "#556b2f",
           darkorange: "#ff8c00",
           darkorchid: "#9932cc",
           darkred: "#8b0000",
           darksalmon: "#e9967a",
           darkseagreen: "#8fbc8f",
           darkslateblue: "#483d8b",
           darkslategray: "#2f4f4f",
           darkslategrey: "#2f4f4f",
           darkturquoise: "#00ced1",
           darkviolet: "#9400d3",
           deeppink: "#ff1493",
           deepskyblue: "#00bfff",
           dimgray: "#696969",
           dimgrey: "#696969",
           dodgerblue: "#1e90ff",
           firebrick: "#b22222",
           floralwhite: "#fffaf0",
           forestgreen: "#228b22",
           fuchsia: "#ff00ff",
           gainsboro: "#dcdcdc",
           ghostwhite: "#f8f8ff",
           gold: "#ffd700",
           goldenrod: "#daa520",
           gray: "#808080",
           green: "#008000",
           greenyellow: "#adff2f",
           grey: "#808080",
           honeydew: "#f0fff0",
           hotpink: "#ff69b4",
           indianred: "#cd5c5c",
           indigo: "#4b0082",
           ivory: "#fffff0",
           khaki: "#f0e68c",
           lavender: "#e6e6fa",
           lavenderblush: "#fff0f5",
           lawngreen: "#7cfc00",
           lemonchiffon: "#fffacd",
           lightblue: "#add8e6",
           lightcoral: "#f08080",
           lightcyan: "#e0ffff",
           lightgoldenrodyellow: "#fafad2",
           lightgray: "#d3d3d3",
           lightgreen: "#90ee90",
           lightgrey: "#d3d3d3",
           lightpink: "#ffb6c1",
           lightsalmon: "#ffa07a",
           lightseagreen: "#20b2aa",
           lightskyblue: "#87cefa",
           lightslategray: "#778899",
           lightslategrey: "#778899",
           lightsteelblue: "#b0c4de",
           lightyellow: "#ffffe0",
           lime: "#00ff00",
           limegreen: "#32cd32",
           linen: "#faf0e6",
           magenta: "#ff00ff",
           maroon: "#800000",
           mediumaquamarine: "#66cdaa",
           mediumblue: "#0000cd",
           mediumorchid: "#ba55d3",
           mediumpurple: "#9370db",
           mediumseagreen: "#3cb371",
           mediumslateblue: "#7b68ee",
           mediumspringgreen: "#00fa9a",
           mediumturquoise: "#48d1cc",
           mediumvioletred: "#c71585",
           midnightblue: "#191970",
           mintcream: "#f5fffa",
           mistyrose: "#ffe4e1",
           moccasin: "#ffe4b5",
           navajowhite: "#ffdead",
           navy: "#000080",
           oldlace: "#fdf5e6",
           olive: "#808000",
           olivedrab: "#6b8e23",
           orange: "#ffa500",
           orangered: "#ff4500",
           orchid: "#da70d6",
           palegoldenrod: "#eee8aa",
           palegreen: "#98fb98",
           paleturquoise: "#afeeee",
           palevioletred: "#db7093",
           papayawhip: "#ffefd5",
           peachpuff: "#ffdab9",
           peru: "#cd853f",
           pink: "#ffc0cb",
           plum: "#dda0dd",
           powderblue: "#b0e0e6",
           purple: "#800080",
           red: "#ff0000",
           rosybrown: "#bc8f8f",
           royalblue: "#4169e1",
           saddlebrown: "#8b4513",
           salmon: "#fa8072",
           sandybrown: "#f4a460",
           seagreen: "#2e8b57",
           seashell: "#fff5ee",
           sienna: "#a0522d",
           silver: "#c0c0c0",
           skyblue: "#87ceeb",
           slateblue: "#6a5acd",
           slategray: "#708090",
           slategrey: "#708090",
           snow: "#fffafa",
           springgreen: "#00ff7f",
           steelblue: "#4682b4",
           tan: "#d2b48c",
           teal: "#008080",
           thistle: "#d8bfd8",
           tomato: "#ff6347",
           turquoise: "#40e0d0",
           violet: "#ee82ee",
           wheat: "#f5deb3",
           white: "#ffffff",
           whitesmoke: "#f5f5f5",
           yellow: "#ffff00",
           yellowgreen: "#9acd32"
       };
   }
});

ToolKit.ColorPalette = Base.extend({
  constructor: function(colors) {
    this.colors = colors;
  },
  
  lightenColors: function() {
    return this.colors.collect(function(color) {
      return color.lighterColorWithLevel(0.1);
    });
  },
  
  darkenColors: function() {
    return this.colors.collect(function(color) {
      return color.darkerColorWithLevel(0.2);
    });
  },
  
  saturateColors: function(amount) {
    var sat = amount != undefined ? amount : 1;
    return this.colors.collect(function(color) {
      return color.colorWithSaturation(sat);
    });
  },
  
  desaturateColors: function(amount) {
    var sat = amount != undefined ? amount : 0.4;
    return this.colors.collect(function(color) {
      return color.colorWithSaturation(sat);
    });
  },
  
  eachColor: function(iterator) {
    this.colors.each(iterator);
  },
  
  _size: function() {
    return this.colors.length;
  }
  
}, {
  init: function() {
    ['Monochromatic', 'Tetrads', 'Triads', 'Compliment', 'Analogous'].each(function(combo) {
      this[combo] = function () { 
        var args = arguments;
        return function(color) {
          return new ToolKit.ColorPalette(ToolKit.Color.fromHexString(color)['with' + combo]());
        }.apply(null, args);
      }.bind(this);
    }.bind(this));    
  }
});


ToolKit.DomBuilder = {
	apply : function(o) { 
	  o = o || {};
		var els = ("p|div|span|strong|em|img|table|tr|td|th|thead|tbody|tfoot|pre|code" + 
					   "|h1|h2|h3|h4|h5|h6|ul|ol|li|form|input|textarea|legend|fieldset|" + 
					   "select|option|blockquote|cite|br|hr|dd|dl|dt|address|a|button|abbr|acronym|" +
					   "script|link|style|bdo|ins|del|object|param|col|colgroup|optgroup|caption|" + 
					   "label|dfn|kbd|samp|var").split("|");
    var el, i=0;
		while (el = els[i++]) o[el.toUpperCase()] = ToolKit.DomBuilder.tagFunc(el);
		return o;
	},
	tagFunc : function(tag) {
	  return function() {
	    var a = arguments, at, ch; a.slice = [].slice; 
	    if (a.length > 0) { 
	      if(typeof a[0] == 'number') a[0] = a[0].toString();
	      if (a[0].nodeName || typeof a[0] == "string") ch = a; else { at = a[0]; ch = a.slice(1); } }
	      return ToolKit.DomBuilder.elem(tag, at, ch);
	  };
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
};

Object.clone = function(obj) {
  var me = arguments.callee;
  if (arguments.length == 1) {
    me.prototype = obj;
    return new me();
  }
};

Object.extend(Array.prototype, {
  uniq: function() {
    var values = new Array();
    this.each(function(item) {
      if(!values.include(item))
       return values.push(item);
    });
    return values;
  },
  
  sum: function() {
   return this.inject(0, function(sum, value) {
      return sum + value;
    });
  }
});


