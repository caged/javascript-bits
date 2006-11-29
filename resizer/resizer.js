// Resizer 
// Copyright (c) 2005-2006 Justin Palmer (http://encytemedia.com)
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
// NOTE:
// This script isn't that abstract.  It resizes the width of two divs proportional to each other.
// The first element must be floated left on the other margined right (e.g. your standard two 
// column layout).  I used it to resize a live preview area that was in a sidebar, maybe you have other 
// uses...or not.

if (!window.Control) {
  var Control = new Object();
}

Control.Resizer = Class.create();
Control.Resizer.prototype = {
  initialize: function(element1, element2, options) {
    // logger.info("Intitialized Resizer");
    
    this.leftElement  = $(element1);
    this.rightElement = $(element2);
    this.dragging     = false;
    this.handle       = $(options.handle);
    if (!this.handle) return;
    Element.makePositioned(this.leftElement);
    Element.makePositioned(this.rightElement);

    Event.observe(this.handle, 'mousedown', this.onPress.bindAsEventListener(this));
    Event.observe(this.handle, 'mouseover', this.onHover.bindAsEventListener(this));
    Event.observe(document, 'mousemove', this.onDrag.bindAsEventListener(this));
    Event.observe(document, 'mouseup', this.onBlur.bindAsEventListener(this));
  },
  
  onPress: function(event) {
    this.dragging = true;
    var handle = Event.element(event);
    this.initialLeftWidth = Element.getStyle(this.leftElement, 'width');
  },
  
  // Fix dragging to left
  onDrag: function(event) {
    if(this.dragging) {
      document.body.style.cursor = 'move';
      var currentX = Event.pointerX(event);
      var currentY = Event.pointerY(event);
      var offset = currentX - 20;
      Element.setStyle(this.rightElement, {marginLeft: currentX + "px"});
      Element.setStyle(this.leftElement, {width:  offset + "px"});
    }
  },
  
  onBlur: function(event) {
    this.dragging = false;
    document.body.style.cursor = 'auto';
  },
  
  onHover: function(event) {
    Element.setStyle(this.handle, {cursor: 'move'});
  }
}
