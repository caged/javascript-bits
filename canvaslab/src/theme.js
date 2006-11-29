
/**
 * Themes for Charts
 * Each theme is an object that accepts visual and behavioural style options.  With the 
 * exception of hex colors, all integers should not be quoted.
 *
 *
 * @param backgroundColor String The base fill color of glyphs.  Additional colors are derived from 
 *        this color.
 * @param borderColor String Color of the border (glyph outline)
 * @param borderWidth String Width of the border (glyph outline).
 * @param color String Font and tick color
 * @param shadowColor String Color of the shadow (Not supported by Safari)
 * @param shadowBlur String Strenght of the shadow blur
 * @param shadowOffset Object x and y labled shadow offsets in pixels
 */
CanvasLab.Theme = Base.extend({
  constructor: function() {
    this.baseOptions = {
      colorScheme: new ToolKit.ColorPalette.Monochromatic('3E5214'),
      backgroundColor: '#d8fdf3',
      borderColor: '#fff',
      axisColor: '#335',
      fontFamily: "'Times New Roman', Helvetica, Arial",
      fontColor: '#335',
      fontSize: 10,
      axisLabelWidth: 60,
      axisLineWidth: 0.5,
      axisTickSize: 5,
      strokeWidth: 0.0,
      shadowColor: '#ccc',
      shadowBlur: 5,
      padding: {left: 50, right: 20, top: 15, bottom: 30},
      fill: true,
      stroke: true,
      drawXTicks: false,
      drawYTicks: true,
      drawXAxis: true,
      drawYAxis: true,
      drawShadow: false,
      shadowBlur: 0.2
    }
  }
});

