// Image Cropper (v.0.4)
// Copyright (c) 2005-2006 Justin Palmer (http://encytemedia.com)
// Contributions by Doug Fales (http://guod.net/blog/bloglist)
// Demo: http://encytemedia.com/demo/cropper/
//
// Provides a way to draw out and get the coordinates of a crop area
// on an image.  It will return the top offset, left offset top, width 
// and height of the crop area.
//
// NOTE: You must style the cropbox or you will not see anything being drawn.
//
// Supported options are:
// - handle   -   The className for the crop box to use (auto created)
// - complete -   The callback to be used when the crop is complete whether
//                by drawing the crop area or once dragging is complete.
//                Should accept 4 params ie. complete(width, height, top, left)
// Required
// - element -    The id of or the element to perform cropping on (must be an image)
//
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
//
var Cropper = {}
Cropper.Picture = Class.create();
Cropper.Picture.prototype = {
  Version: 0.4,
  
  initialize: function(element, options) {
    this.options = options || {};
    Object.extend({
      handle: 'handle',
      filmId:   'film',
      canvasId: 'canvas'
      } || this.options);
    this.picture = $(element);
    this.picContainer = this.picture.parentNode;
    this.picContainer.style.cursor = "crosshair";
    this.picContainer.style.overflow = "hidden";
    this.initialHandleCoords = {x: 0, y: 0}
    this.dragging = false;
    
    var picContainerOffsets = Position.positionedOffset(this.picContainer);
    this.picContainerOffsets = {top: picContainerOffsets[1], left: picContainerOffsets[0]}
    
    Event.observe(this.picture, "load", this.onLoad.bindAsEventListener(this));
  },
  
  onLoad: function(event) {
    Element.makePositioned(this.picture);
    this.picWidth  = this.picture.width;
    this.picHeight = this.picture.height;
    
    // Set the picContainer width so it fits snug with the image
    // If we don't do this the div will stretch the width of the screen
    // and getting clip values would be a nightmare
    this.picContainer.style.width = this.picture.width + "px";
    
    // Create our invisible canvas to draw on because when dragging 
    // on images the native behaviour is to let you drag the image 
    // onto your desktop or into other applications.
    this.initCanvas();
    
    // Create our handle or crop box
    this.initHandle();
    
    // Event.observe(this.canvas, 'click', this.onClick.bindAsEventListener(this));
    Event.observe(this.canvas, 'mousedown', this.onDrag.bindAsEventListener(this));
    Event.observe(this.handle, 'mouseup', this.onBlur.bindAsEventListener(this));
    Event.observe(this.canvas, 'mouseup', this.onBlur.bindAsEventListener(this));
    
    // Because the mouse will also travel over the handle when dragging we need to 
    // track the mousemove for both the canvas and handle for smooth scaling.
    Event.observe(this.handle, 'mousemove', this.startDrag.bindAsEventListener(this));
    Event.observe(this.canvas, 'mousemove', this.startDrag.bindAsEventListener(this));
  },
  
  onDrag: function(event) {
    this.handle.style.width  = "1px";
    this.handle.style.height = "1px";
    this.initialHandleCoords = {
      x: Event.pointerX(event) - this.picContainerOffsets.left, 
      y: Event.pointerY(event) - this.picContainerOffsets.top
    }
    
    
    this.handle.style.top  = this.initialHandleCoords.y + "px";
    this.handle.style.left = this.initialHandleCoords.x + "px";
    this.dragging = true;
    Element.show(this.handle);
  },
  
  onBlur: function(event) {
    this.dragging = false;
    this.clearModifierKeys();
    this.handle.style.cursor = "move";
    this.cropComplete();
  },
  
  startDrag: function(event) {
    if(this.dragging) {
      this.handle.style.cursor = "crosshair";
      this.setModifierKeys(event);
      var currentX = Event.pointerX(event) - this.picContainer.offsetLeft;
      var currentY = Event.pointerY(event) - this.picContainer.offsetTop;
      var newTop, newLeft, newWidth, newHeight;
      
      if (currentX < this.initialHandleCoords.x) {
         newLeft = currentX;   
         newWidth = Math.abs(this.initialHandleCoords.x - currentX);
      } else {
         newLeft = this.initialHandleCoords.x;
         newWidth = currentX - this.initialHandleCoords.x;
      }

      if (currentY < this.initialHandleCoords.y) {
         newTop = currentY;
         newHeight = Math.abs(this.initialHandleCoords.y - currentY);
      } else {
         newTop = this.initialHandleCoords.y;
         newHeight = currentY - this.initialHandleCoords.y;
      }
      
      // Safari judges the 0 point of the crosshair cursor from the corners, 
      // whereas Gecko judges it from dead center. We adjust Safari to behave 
      // like Gecko.
      if(this.isWebKit()) {
        newLeft -= 7;      
        newTop  -= 7;
      }

      this.handle.style.left   = newLeft + "px";
      this.handle.style.top    = newTop + "px";
      this.handle.style.width  = newWidth + "px";
      this.handle.style.height = newHeight + "px";
      
      // If alt key is pressed allow user to drag while selecting
      // Buggy right now
      if(this.altKey) {
        this.handle.style.top = currentY - this.initialHandleCoords.y + "px";
        this.handle.style.left = currentX - this.initialHandleCoords.x + "px";
        return;
      }
      
      // If the shift key is pressed, constrain proportions
      if(this.shiftKey) {
        if(this.handleWidth() > this.handleHeight()) {
          this.handle.style.height = this.handleWidth() + "px";
        }
        
        if(this.handleHeight() > this.handleWidth()) {
          this.handle.style.width = this.handleHeight() + "px";
        }
      }
    }
  },
  
  initHandle: function() {
    this.handle = Builder.node('div',{className:'handle'});
    Element.hide(this.handle);
    this.picContainer.appendChild(this.handle);
    this.handle.style.position = "absolute";
    new Draggable(this.handle, {endeffect: Element.setOpacity(this.handle, 0.6)});
  },
  
  initCanvas: function() {
    this.canvas = Builder.node('div');
    this.canvas.style.cursor = "crosshair";
    this.canvas.style.overflow = "hidden";
    this.picContainer.appendChild(this.canvas);
    Position.absolutize(this.canvas);
    Position.clone(this.picture, this.canvas);
  },
  
  setModifierKeys: function(event) {
    if(event.shiftKey) this.shiftKey = event.shiftKey;
    if(event.altKey)   this.altKey   = event.altKey;
		if(event.ctrlKey)  this.ctrlKey  = event.ctrlKey;
  },
  
  clearModifierKeys: function() {
    this.shiftKey = this.altKey = this.ctrlKey = false;
  },
  
  handleHeight: function() {
    return parseInt(this.handle.style.height);
  },
  
  handleWidth: function() {
    return parseInt(this.handle.style.width);
  },
  
  entireOffset: function() {
    var offsets = Position.positionedOffset(this.handle);
    return [offsets[0] + this.handleWidth() + this.picContainerOffsets.left, offsets[1] + this.handleHeight() + this.picContainerOffsets.top];
  },
  
  cropComplete: function() {
    var width  = this.handleWidth();
    var height = this.handleHeight();
    var top    = this.handle.offsetTop;
    var left   = this.handle.offsetLeft;
    this.options.complete ? this.options.complete(width, height, top, left) : Prototype.emptyFunction;
    $('info').innerHTML = "Width: " + width + "<br /> Height: " + height + "<br /> Top: " + top + "<br /> Left: " + left;
  },
  
  isWebKit: function() {
   return /Konqueror|Safari|KHTML/.test(navigator.userAgent);
  },
  
  _createFilm: function() {
    this.film = document.createElement('div');
    this.film.id = this.options.filmId;
    
  }
}