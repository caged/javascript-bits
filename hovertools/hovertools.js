/*  HoverTools
 *  Copyright (c) 2006 Justin Palmer <justin@encytemedia.com> http://encytemedia.com
 *  Copyright (c) 2006 jadedPixel (http://jadedpixel.com)
 *
 *  HoverTools allows you to implement Backpack (http://backpackit.com) style 
 *  editing (Tools show up when you hover over an element)
 *
 *  Usage:
 *  <h3 class="toolbox">
 *    <div class="tools" style="display:none;">Tools here</div>
 *    You can edit me
 *  </h3>
 *
 *  This does not implement in place editing, only a mechanism for showing/hiding 
 *  controls.
/*--------------------------------------------------------------------------*/

// Permission is hereby granted, free of charge, to any person obtaining a 
// copy of this software and associated documentation files (the "Software"), 
// to deal in the Software without restriction, including without limitation 
// the rights to use, copy, modify, merge, publish, distribute, sublicense, 
// and/or sell copies of the Software, and to permit persons to whom the Software 
// is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all 
// copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
// PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
// FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
// DEALINGS IN THE SOFTWARE.

HoverTools = Class.create();
HoverTools.prototype = {      
  initialize: function(element) {       
    this.toolbox = $(element);
    if(!this.toolbox) return;
    this.timeout = null;
    this.toolsFocused = false;
    this.tools = this.findTools();
    
    Event.observe(this.toolbox, 'mouseover', this.onHover.bindAsEventListener(this), true);
    Event.observe(this.toolbox, 'mouseout', this.onBlur.bindAsEventListener(this), true);
    Event.observe(this.tools, 'mouseover', this.onToolsHover.bindAsEventListener(this));
    Event.observe(this.tools, 'mouseout', this.onToolsBlur.bindAsEventListener(this));
  },

  onHover: function(event) {
    if(this.timeout) { clearTimeout(this.timeout); }
    if(this.tools) { Element.show(this.tools); }
  },

  onBlur: function(event) {
    if(!this.toolsFocused) { this.considerHidingTools(); }
  },

  onToolsHover: function(event) {
    if(this.timeout) { clearTimeout(this.timeout); }
    this.toolsFocused = true; 
  },

  onToolsBlur: function(event) { 
    this.toolsFocused = false;
    this.considerHidingTools(); 
  },

  considerHidingTools: function() {
    if(this.timeout) { clearTimeout(this.timeout); }
    this.timeout = setTimeout(this.hideTools.bind(this), 600);
  },

  hideTools: function() {
    if(!this.toolsFocused) {
      this.timeout = null;
      Element.hide(this.tools);          
    }
  },

  findTools: function() { 
    var tools = document.getElementsByClassName('tools', this.toolbox)[0];
    if(!tools) { throw "Found .toolbox but not .tools"; }
    return tools;
  }
}