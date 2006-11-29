// Flash 
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
// Flash is used to manage error messages and notices from 
// Ajax calls passed by Prototype.  Works pretty well with 
// Ajax Global Responders.
//

var Flash = {
  // When given an error message, wrap it in a list 
  // and show it on the screen.  This message will auto-hide 
  // after a specified amount of miliseconds
  error: function(message) {
    $('flash-errors').innerHTML = '';
    $('flash-errors').innerHTML = "<ul>" + message + "</ul>";
    new Effect.Appear('flash-errors', {duration: 0.3});
    setTimeout(Flash.fadeError.bind(this), 5000);
  },

  // Notice-level messages.  See Flash.error for full details.
  notice: function(message) {
    $('flash-notice').innerHTML = '';
    $('flash-notice').innerHTML = "<li>" + message + "</li>";
    new Effect.Appear('flash-notice', {duration: 0.3});
    setTimeout(Flash.fadeNotice.bind(this), 5000);
  },
  
  // Responsible for fading notices level messages in the dom    
  fadeNotice: function() {
    new Effect.Fade('flash-notice', {duration: 0.3});
  },
  
  // Responsible for fading error messages in the DOM
  fadeError: function() {
    new Effect.Fade('flash-errors', {duration: 0.3});
  }
}