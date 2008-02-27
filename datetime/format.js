Object.extend(Date.prototype, {
  /**
   * @param format {String} The string used to format the date.
   * Example:  new Date().strftime("%A %I:%M %p")
   */
  strftime: function(format) {
    var day = this.getUTCDay(), month = this.getUTCMonth();
    var hours = this.getUTCHours(), minutes = this.getUTCMinutes();
    function pad(num) { return num.toPaddedString(2); };

    return format.gsub(/\%([aAbBcdDHiImMpSwyY])/, function(part) {
      switch(part[1]) {
        case 'a': return $w("Sun Mon Tue Wed Thu Fri Sat")[day]; break;
        case 'A': return $w("Sunday Monday Tuesday Wednesday Thursday Friday Saturday")[day]; break;
        case 'b': return $w("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec")[month]; break;
        case 'B': return $w("January February March April May June July August September October November December")[month]; break;
        case 'c': return this.toString(); break;
        case 'd': return this.getUTCDate(); break;
        case 'D': return pad(this.getUTCDate()); break;
        case 'H': return pad(hours); break;
        case 'i': return (hours === 12 || hours === 0) ? 12 : (hours + 12) % 12; break;
        case 'I': return pad((hours === 12 || hours === 0) ? 12 : (hours + 12) % 12); break;
        case 'm': return pad(month + 1); break;
        case 'M': return pad(minutes); break;
        case 'p': return hours > 11 ? 'PM' : 'AM'; break;
        case 'S': return pad(this.getUTCSeconds()); break;
        case 'w': return day; break;
        case 'y': return pad(this.getUTCFullYear() % 100); break;
        case 'Y': return this.getUTCFullYear().toString(); break;
      }
    }.bind(this));
  }
});