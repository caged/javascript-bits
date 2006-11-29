
CanvasLab.Pie = CanvasLab.Base.extend({
  constructor: function(element, options) {
    var options = Object.extend({
      radius: 0.4
    }, options || {});
    
    this.base(element, options);
    this.slices = [];
  },
  
  draw: function() {
    this.stage = new CanvasLab.Stage(this.datasets, this.options);
    this._evaluate(); 
    this.drawBackground();
    
    var colorCount  = this.colors.length;
    var coords = this._getCoords();
        
    
    this.slices.each(function(slice, index) {          	
      this.context.save();
      this.context.fillStyle = this.colors[index % colorCount].toRGBString();
      if(Math.abs(slice.startAngle - slice.endAngle) > 0.001) {
        if(this.theme.fill) {
          this.drawSlice(slice, coords);
          this.context.fill();
        }
        
        if(this.theme.stroke) {
          this.drawSlice(slice, coords);
          this.context.lineWidth = this.theme.strokeWidth;
          this.context.strokeStyle = this.theme.borderColor;
          this.context.stroke();
        }
      }
      this.context.restore();
    }.bind(this));
  
    this._calculatePieTicks(); 
    this._drawPieAxis(); 
    
  },
  
  _evaluate: function() {
    var setNames = this.datasets.names();
    var setCount = setNames.length;
    var dataset = this.datasets.first().data;    
    var total = dataset.pluck(1).sum();
    var currentAngle = 0.0;
    
    dataset.each(function(points) {
      var fraction = points[1] / total;
      var slice = {
        fraction: fraction,
        xval: points[0],
        yval: points[1],
        startAngle: currentAngle * Math.PI * 2,
        endAngle: (currentAngle + fraction) * Math.PI * 2
      }
      this.slices.push(slice);
      currentAngle += fraction;
    }.bind(this));
  },
  
  _calculatePieTicks: function() {    
  	if (this.datasets.xLabels != null) {
  	  
  		var lookup = this._generateLookUpTable();
      this.datasets.xLabels.each(function(label) {        
        var slice = lookup[label.value], name = label.key;
  			if (slice) {
  				name += " (" + ToolKit.Format.roundToFixed(slice.fraction * 100.0, 0) + "%)";
  				this.stage.xTicks.push([label.value, name]);
  			}
      }.bind(this));
      
  	} else {
  	  
  		this.slices.each(function(slice) {
  		  var label = slice.xval + " (" + ToolKit.Format.roundToFixed(slice.fraction * 100.0, 0)  + "%)";
  			this.stage.xTicks.push([slice.xval, label]);
  		}.bind(this));
  			
  	}
  	
  },
  
  _getCoords: function() {
    return {
      centerX: this.area.x + this.area.width * 0.5, 
      centerY: this.area.y + this.area.height * 0.5, 
      radius: Math.min(this.area.width * this.options.radius, this.area.height * this.options.radius)
    }
  },
  
  _generateLookUpTable: function() {
    var lookup = [];
    this.slices.each(function(slice) {
		  lookup[slice.xval] = slice;
		});
		return lookup;
  },
  
  _drawPieAxis: function() {
    if(!this.theme.drawXAxis) return;
      
    var lookup = this._generateLookUpTable();
    var coords = this._getCoords();
    var labelWidth = this.theme.axisLabelWidth;
    var PI = Math.PI;
    
    
    this.stage.xTicks.each(function(xtick) {
      var slice = lookup[xtick[0]];
      
      if(slice == undefined || slice == null) throw $continue
        
      var angle = (slice.startAngle + slice.endAngle) / 2;
      var normalizedAngle = angle;
      if(angle > Math.PI * 2)
        normalizedAngle = angle - PI * 2
      else if(angle < 0)
        normalizedAngle = angle + PI * 2;
        
      var labelX = coords.centerX + Math.sin(normalizedAngle) * (coords.radius + 10);
      var labelY = coords.centerY - Math.cos(normalizedAngle) * (coords.radius + 10);
      var labelStyle = {
        position: 'absolute',
        zIndex: 11,
        width: labelWidth + 'px',
        fontFamily: this.theme.fontFamily,
        fontSize: this.theme.fontSize + 'px',
        overflow: 'hidden',
        color: this.theme.fontColor
      }
      
      if(normalizedAngle <= PI * 0.5) {
       labelStyle = Object.extend(labelStyle, {
          textAlign: 'left',
          verticalAlign: 'top',
          left: labelX + 'px',
          top: labelY + 'px'
        });
      
      } else if((normalizedAngle > PI * 0.5) && (normalizedAngle <= PI)) {
        labelStyle = Object.extend(labelStyle, {
          textAlign: 'left',
          verticalAlign: 'bottom',
          left: labelX + 'px',
          top: labelY + 'px'
        });
      
      } else if((normalizedAngle > PI) && (normalizedAngle <= PI * 1.5)) {
        labelStyle = Object.extend(labelStyle, {
          textAlign: 'right',
          verticalAlign: 'bottom',
          left: (labelX - labelWidth) + 'px',
          top: labelY + 'px'
        });
      
      } else {
        labelStyle = Object.extend(labelStyle, {
          textAlign: 'right',
          verticalAlign: 'bottom',
          left: (labelX - labelWidth) + 'px',
          top: (labelY - this.theme.fontSize) + 'px'
        });
      }
      
      var label = this.DOM.DIV(xtick[1]);
      Element.setStyle(label, labelStyle);
      this.xLabels.push(label);
      this.container.appendChild(label);
        
    }.bind(this));
  }
});