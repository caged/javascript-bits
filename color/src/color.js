var Color = {};
Color.RGB = Class.create();
Color.RGB.prototype = {
  initialize: function(r, g, b, a) {
    this.r = (r / 255) || 0;
    this.g = (g / 255) || 0;
    this.b = (b / 255) || 0;
    this.a = (a == undefined) ? 1.0 : parseFloat(a);
  },
  
/*  toHSL: function() {
    var min, max, delta, light, hue, sat;
    var r = this.r, g = this.g, b = this.b;
    min = [r, g, b].min();
    max = [r, g, b].max();
    delta = (max - min);
    light = (max + min) / 2.0;

    if(delta == 0) {
      hue = 0; sat = 0;
    } else {
      if(light < 0.5)
       sat = delta / (max + min);
      else
       sat = delta / (2.0 - max - min);

       if(r == max)
         hue = (g - b) / delta;
       else if(g == max)
         hue = (2.0 + (b - r)) / delta;
       else
         hue = (4.0 + (r - g)) / delta;

       hue /= 6.0;

       if(hue < 0) hue += 1;
       if(hue > 1) hue -= 1;

    }
    return Color.HSL.fromFraction(hue, sat, light);
  },*/
  
  toHSL: function() {
    var min, max, delta, light, hue, sat, dr, dg, db;
    var r = this.r, g = this.g, b = this.b;
    min = [r, g, b].min();
    max = [r, g, b].max();
    delta = (max - min);
    light = (max + min) / 2.0;
    
    if(delta == 0) {
      hue = 0; sat = 0;
    } else {
      if(light < 0.5)
       sat = delta / (max + min);
      else
       sat = delta / (2.0 - max - min);
       
      dr = (((max - r) / 6) + (max / 2)) / max;
      dg = (((max - g) / 6) + (max / 2)) / max;
      db = (((max - b) / 6) + (max / 2)) / max;
      
     if(r == max)       hue = (b - g);
     else if(g == max)  hue = (1 / 3) + r - b;
     else if(b == max)  hue = (2 / 3) + g - r;
     
     if(hue < 0) hue += 1;
     if(hue > 1) hue -= 1;
     
     console.log(hue, sat, light);
     return Color.HSL.fromFraction(hue, sat, light);
    }
  },
  
  toRGB: function() {
    return this;
  },
  
  toHex: function() {
   var rgb = [this.r, this.g, this.b].map(function(c) {
      c = Math.round(c * 255);
      return c > 255 ? 255 : c;
    });
   return rgb.invoke('toHex').join();
  },
  
  toString: function() {
    var stub = new Template("rgb(#{r}, #{g}, #{b})");
    return stub.evaluate({ r: Math.round(this.r * 255), g: Math.round(this.g * 255), b: Math.round(this.b * 255) });
  }
};


Object.extend(Color.RGB, {
  fromHex: function(hex) {
    var r, g, b;

    hex = hex.sub(/#/, '');
    if(hex.length == 3)
      hex = hex.toArray().collect(function(h) { return h + h; }).join('');

    hex.toArray().eachSlice(2, function(group, index) {
      var rgb = (parseInt(group, 16) / 255.0);
      if(index == 0) r = rgb;
      if(index == 1) g = rgb;
      if(index == 2) b = rgb;
    });
    return new Color.RGB(r, g, b);
  },
  
  fromFraction: function(r, g, b) {
    var c = new Color.RGB();
    c.r = r; c.g = g; c.b = b;
    return c;
  }
});


Color.HSL = Class.create();
Color.HSL.prototype = {
  initialize: function(h, s, l) {
    this.h = h  || 0;
    this.s = s  || 0;
    this.l = l  || 0;
  },
  
/*  toRGB: function() {
    var rgb, tmp1, tmp2, tmp3, t3, h = this.h, l = this.l, s = this.s, one = 1;
    
    if(l == 0) return new Color.RGB();
    if(l == 1) return new Color.RGB(1, 1, 1);
    if(s <= one.e(-5)) return new Color.RGB(l, l, l);
    
    if((l - 0.5) < one.e(-5))
      tmp2 = l * (1.0 + parseFloat(s));
    else
      tmp2 = l + s - (l * parseFloat(s));
    tmp1 = 2.0 * l - tmp2;
    
    t3 = [ h + 1.0 / 3.0, h, h - 1.0 / 3.0 ];
    t3 = t3.map(function(tmp3) {
      if(tmp3 < one.e(-5))          tmp3 += 1.0;
      if((tmp3 - 1.0) > one.e(-5))  tmp3 -= 1.0;
      return tmp3;
    });
    
    rgb = t3.map(function(tmp3) {
      if(((6.0 * tmp3) - 1.0) < one.e(-5))
        return tmp1 + ((tmp2 - tmp1) * tmp3 * 6.0);
      else if(((2.0 * tmp3) - 1.0) < one.e(-5))
        return tmp2;
      else if(((3.0 * tmp3) - 2.0) < one.e(-5))
        return tmp1 + (tmp2 - tmp1) * ((2 / 3.0) - tmp3) * 6.0;
      else
        return tmp1;
    });
    
    return Color.RGB.fromFraction(rgb[0], rgb[1], rgb[2]);
  }*/
  
  toRGB: function() {
    var h = this.h, s = this.s, l = this.l, r, g, b, rgb, tmp1, tmp2;
    if(s == 0) {
      r = l * 255;
      g = l * 255;
      b = l * 255;
    } else  {
      if(l < 0.5) 
        tmp2 = l * (1 + s);
      else  
        tmp2 = (l + s) - (s * l);
        
      tmp1 = 2 * l - tmp2;
      
      function hue2RGB(v1, v2, hue) {
        if(hue < 0) hue += 1;
        if(hue > 1) hue -= 1;
        if((6 * hue) < 1) return (v1 + (v2 - v1) * 6 * hue);
        if((2 * hue) < 1) return v2;
        if((3 * hue) < 2) return (v1 + (v2 - v1) * ((2 / 3) - hue) * 6);
        return v1;
      }
      
      r = 255 * hue2RGB(tmp1, tmp2, h + (1 / 3));
      g = 255 * hue2RGB(tmp1, tmp2, h);
      b = 255 * hue2RGB(tmp1, tmp2, h - (1 / 3));
      
    }
    
    return new Color.RGB(r, g, b);
  }
};
 
Object.extend(Color.HSL, {
  fromFraction: function(h, s, l) {
    var c = new Color.HSL();
    c.h = h; c.s = s; c.l = l;
    return c;
  }
});

Object.extend(Number.prototype, {
  e: function(raise) {
    return Math.pow(this * 10, raise);
  },
  
  toHex: function() {
    var hex = "0123456789ABCDEF";
    return hex.substr((this >> 4) & 0x0F, 1) + hex.substr(this & 0x0F,1);
  }
});


