Plastik.SweetCanvasRenderer = Class.create();
Plastik.SweetCanvasRenderer.__super__ = Plastik.Abstract.CanvasRenderer.prototype;
Plastik.SweetCanvasRenderer.prototype = Object.extend(new Plastik.Abstract.CanvasRenderer(), {
  initialize: function(element, layout, options) {
    var moreOpts = Plastik.Theme.officeGreen();
    Object.extend(moreOpts, options || {});
    Plastik.SweetCanvasRenderer.__super__.initialize.call(this, element, layout, moreOpts);
  },
  
  _renderBarChart: function() {
    var Color = Plastik.Color.Color;
    var shadowColor = this.options.backgroundColor.darkerColorWithLevel(0.6).colorWithAlpha(0.3).toRGBString();
    var prepareFakeShadow = function(context, x, y, w, h) {        
        context.fillStyle = shadowColor;
        context.fillRect(x-2, y-2, w+4, h+2); 
        context.fillStyle = shadowColor;
        context.fillRect(x-1, y-1, w+2, h+1); 
    }.bind(this);

    var colorCount = this.options.colorScheme.length;
    var colorScheme =  this.options.colorScheme;
    var setNames = this.layout.datasets.keys();
    var setCount = setNames.length;

    var chooseColor = function(name) {
        for (var i = 0; i < setCount; i++) {
            if (name == setNames[i])
                return colorScheme[i%colorCount];
        }
        return colorScheme[0];
    }.bind(this);

    var drawRect = function(context, bar) {
        var x = this.area.w * bar.x + this.area.x;
        var y = this.area.h * bar.y + this.area.y;
        var w = this.area.w * bar.w;
        var h = this.area.h * bar.h;
        
        if ((w < 1) || (h < 1))
            return;        

        context.save();

        context.shadowBlur = 2.0;

        if (this.isIE) {
            context.save();
            context.fillStyle = "#cccccc";
            context.fillRect(x-2, y-2, w+4, h+2); 
            context.restore();
        }
        else {
            prepareFakeShadow(context, x, y, w, h);
        }

        context.fillStyle = chooseColor(bar.name).toRGBString();
        context.fillRect(x, y, w, h);

        context.shadowBlur = 0;
        context.strokeStyle = Color.whiteColor().toRGBString();
        context.lineWidth = 2.0;

        context.strokeRect(x, y, w, h);                

        context.restore();

    }.bind(this);
    
    this._renderBarChartWrap(this.layout.bars, drawRect);
  },
  
  _renderPieChart: function() {
      var context = this.element.getContext("2d");
      var darkenBackgroundBy = this.options.backgroundColor.darkerColorWithLevel;

      var colorCount = this.options.colorScheme.length;
      var slices = this.layout.slices;

      var centerx = this.area.x + this.area.w * 0.5;
      var centery = this.area.y + this.area.h * 0.5;
      var radius = Math.min(this.area.w * this.options.pieRadius, 
                            this.area.h * this.options.pieRadius);

      if (this.isIE) {
          centerx = parseInt(centerx);
          centery = parseInt(centery);
          radius = parseInt(radius);
      }

  	// NOTE NOTE!! Canvas Tag draws the circle clockwise from the y = 0, x = 1
  	// so we have to subtract 90 degrees to make it start at y = 1, x = 0
    
      if (!this.isIE) {
          context.save();
          var shadowColor = this.options.backgroundColor.darkerColorWithLevel(0.5).colorWithAlpha(0.4);
          context.fillStyle = shadowColor.toRGBString();
          context.shadowBlur = 6.0;
          context.shadowColor = this.options.backgroundColor.darkerColorWithLevel(1).toRGBString();
          context.translate(1, 1);
          context.beginPath();
          context.moveTo(centerx, centery);
          context.arc(centerx, centery, radius + 2, 0, Math.PI*2, false);
          context.closePath();
          context.fill();
          context.restore();
      }

      context.save();
      context.strokeStyle = Plastik.Color.Color.whiteColor().toRGBString();
      context.lineWidth = 2.0;    
      for (var i = 0; i < slices.length; i++) {
          var color = this.options.colorScheme[i%colorCount];
          context.fillStyle = color.toRGBString();

          var makePath = function() {
              context.beginPath();
              context.moveTo(centerx, centery);
              context.arc(centerx, centery, radius, 
                          slices[i].startAngle - Math.PI/2,
                          slices[i].endAngle - Math.PI/2,
                          false);
              context.lineTo(centerx, centery);
              context.closePath();
          };

          if (Math.abs(slices[i].startAngle - slices[i].endAngle) > 0.0001) {
              makePath();
              context.fill();
              makePath();
              context.stroke();
          }
      }
      context.restore();
  },
  
  _renderBackground: function() {
    var context = this.element.getContext("2d");
    var Color = Plastik.Color.Color;
    if (this.layout.type == "bar" || this.layout.type == "line") {
        context.save();
        context.fillStyle = this.options.backgroundColor.toRGBString();
        context.fillRect(this.area.x, this.area.y, this.area.w, this.area.h);
        context.strokeStyle = Color.whiteColor().toRGBString();
        context.lineWidth = 1.0;
        for (var i = 0; i < this.layout.yticks.length; i++) {
            var y = this.layout.yticks[i][0] * this.area.h + this.area.y;
            var x = this.area.x;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + this.area.w, y);
            context.closePath();
            context.stroke();
        }
        
        context.restore();
    } else {
      Plastik.SweetCanvasRenderer.__super__._renderBackground.call(this);
    }
  },
  
  _renderLineChart: function() {
    var context = this.element.getContext("2d");
    var colorCount = this.options.colorScheme.length;
    var colorScheme = this.options.colorScheme;
    var setNames = this.layout.datasets.keys();
    var setCount = setNames.length;


    for (var i = 0; i < setCount; i++) {
        var setName = setNames[i];
        var color = colorScheme[i%colorCount];
        var strokeX = this.options.strokeColorTransform;

        // setup graphics context
        context.save();
        
        // create paths
        var makePath = function() {
            context.beginPath();
            context.moveTo(this.area.x, this.area.y + this.area.h);
            var addPoint = function(context, point) {
            if (point.name == setName)
                context.lineTo(this.area.w * point.x + this.area.x,
                               this.area.h * point.y + this.area.y);
            }.bind(this);
            
            this.layout.points.each(function(point) {
              addPoint(context, point);
            });
            
            context.lineTo(this.area.w + this.area.x,
                           this.area.h + this.area.y);
            context.lineTo(this.area.x, this.area.y + this.area.h);
            context.closePath();
        }.bind(this);

        // faux shadow for firefox
        context.save();
        if (this.isIE) {
            context.fillStyle = "#cccccc";
        }
        else {
            context.fillStyle = Plastik.Color.Color.blackColor().colorWithAlpha(0.2).toRGBString();
        }

        context.translate(-1, -2);
        makePath();        
        context.fill();
        context.restore();

        context.shadowBlur = 2.0;
        context.shadowColor = Plastik.Color.Color.fromHexString("#888888").toRGBString();
        context.fillStyle = color.toRGBString();
        context.lineWidth = 2.0;
        context.strokeStyle = Plastik.Color.Color.whiteColor().toRGBString();

        makePath();
        context.fill();
        makePath();
        context.stroke();

        context.restore();
    }
  }
});

Plastik.Canvas3dRenderer = Class.create();
Plastik.Canvas3dRenderer.__super__ = Plastik.SweetCanvasRenderer.prototype;
Plastik.Canvas3dRenderer.prototype = Object.extend(Plastik.SweetCanvasRenderer.prototype, {
  
 _renderBackground: function() {
   var context = this.element.getContext("2d");
   var Color = Plastik.Color.Color;
   if (this.layout.type == "bar" || this.layout.type == "line") {
       context.save();
       context.fillStyle = this.options.backgroundColor.toRGBString();
       context.fillRect(this.area.x, this.area.y, this.area.w, this.area.h);
       context.strokeStyle = Color.whiteColor().toRGBString();       
       context.lineWidth = 1.0;
       for (var i = 0; i < this.layout.yticks.length; i++) {
           var y = this.layout.yticks[i][0] * this.area.h + this.area.y;
           var x = this.area.x;
           context.beginPath();
           context.moveTo(x, y);
           context.lineTo(x + this.area.w, y);
           context.closePath();
           context.stroke();
       }
       
       context.restore();
   } else {
     Plastik.Canvas3dRenderer.__super__._renderBackground.call(this);
   }
 } 
});