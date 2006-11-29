if(!window.Plastik) {
  var Plastik = {
    Version: '0.1.0'
  }
}

Plastik.Abstract = new Object();

Plastik.Base = {
  roundInterval: function(range, intervals, precision) {
    var sep = range/intervals;
    return parseFloat(Format.roundToFixed(sep, precision));
  },
  
  isNil: function(item) {
    return item == null || typeof(item) == 'undefined';
  },
  
  colorScheme: function() {
      var pc = Plastik.Color
      var scheme = ["red", "orange", "yellow", "green", "cyan", "blue", "purple", "magenta"];
      
      var makeColor = function(name) {
        return pc.Color[name + "Color"]()
      }.bind(this);
      
      return scheme.each(makeColor);
  },
  
  baseColors: function() {
    var hexColor = Plastik.Color.Color.fromHexString;
    return [hexColor("#476fb2"),
            hexColor("#be2c2b"),
            hexColor("#85b730"),
            hexColor("#734a99"),
            hexColor("#26a1c5"),
            hexColor("#fb8707"),
            hexColor("#000000")];
  },
  
  palette: function(baseColor, fromLevel, toLevel, increment) {
      var isNil = this.isNil;
      var fractions = new Array();
      if (isNil(increment))
          increment = 0.1;
      if (isNil(toLevel))
          toLevel = 0.4;
      if (isNil(fromLevel))
          fromLevel = -0.2;

      var level = fromLevel;
      while (level <= toLevel) {
          fractions.push(level);
          level += increment;
      }
          
      var makeColor = function(color, fraction) {
          return color.lighterColorWithLevel(fraction);
      }.bind(this);
      
      return fractions.collect(function(fraction) {
        return makeColor(baseColor, fraction)
      });
      
  }
}

// Extensions to Color 
Object.extend(Plastik.Color.Color.prototype, {
  asFillColor: function() {
      return this.lighterColorWithLevel(0.3);
  },
      
  asStrokeColor: function() {
      return this.darkerColorWithLevel(0.1);
  },

  asPointColor: function() {
      return this.lighterColorWithLevel(0.1);
  }
});


Plastik.Theme = {  
  officeBlue: function() {
    return this._extendBase({
      colorScheme: Plastik.Base.palette(Plastik.Base.baseColors()[0]),
      backgroundColor: Plastik.Base.baseColors()[0].lighterColorWithLevel(0.45)
    });
  },
  
  officeRed: function() {
    return this._extendBase({
      colorScheme: Plastik.Base.palette(Plastik.Base.baseColors()[1]),
      backgroundColor: Plastik.Base.baseColors()[1].lighterColorWithLevel(0.5)
    });
  },
  
  officeGreen: function() {
    return this._extendBase({
      colorScheme: Plastik.Base.palette(Plastik.Base.baseColors()[2]),
      backgroundColor: Plastik.Base.baseColors()[2].lighterColorWithLevel(0.5)
    });
  },
  
  officePurple: function() {
    return this._extendBase({
      colorScheme: Plastik.Base.palette(Plastik.Base.baseColors()[3]),
      backgroundColor: Plastik.Base.baseColors()[3].lighterColorWithLevel(0.5)
    });
  },
  
  officeCyan: function() {
    return this._extendBase({
      colorScheme: Plastik.Base.palette(Plastik.Base.baseColors()[4]),
      backgroundColor: Plastik.Base.baseColors()[4].lighterColorWithLevel(0.5)
    });
  },
  
  officeOrange: function() {
    return this._extendBase({
      colorScheme: Plastik.Base.palette(Plastik.Base.baseColors()[5]),
      backgroundColor: Plastik.Base.baseColors()[5].lighterColorWithLevel(0.4)
    });
  },
  
  officeBlack: function() {
    return this._extendBase({
      colorScheme: Plastik.Base.palette(Plastik.Base.baseColors()[6], 0.0, 0.6),
      backgroundColor: Plastik.Base.baseColors()[6].lighterColorWithLevel(0.9)
    });
  },
  
  baseOptions: {
      axisLineWidth: 9.0,
      axisLabelColor: Plastik.Color.Color.grayColor(),
      axisLineColor: Plastik.Color.Color.whiteColor(),
      padding: {top: 5, bottom: 10, left: 30, right: 30}
  },
  
  _extendBase: function(options) {
    return Object.extend(this.baseOptions, options);
  }
}