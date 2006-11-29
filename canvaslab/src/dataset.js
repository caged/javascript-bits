
CanvasLab.Dataset = Base.extend({
  constructor: function(name, data) {
    this.name = name;
    this.data = data;
  },
  
  xvalues: function() {
    return this.data.pluck(0);
  },
  
  yvalues: function() {
    return this.data.collect(function(item) {
      item.shift();
      return item;
    });
  }
});

CanvasLab.Collection = Base.extend({
  constructor: function() {
    this.records = [];
    this.length = this._length();
    this.xLabels = null;
    this.yLabels = null;
  },
  
  compress: function() {
    return this.records.inject([], 
      function(array, value) { 
        if(array.constructor == Array)
          return array.concat(value.data);
      }
    );
  },
  
  allData: function() {
    return this.compress();
  },
  
  uniqueXValues: function() {
    return this.getXValues().uniq();
  },
  
  getXValues: function() {
    return this.compress().pluck(0);
  },
  
  getYValues: function() {
    return this.compress().pluck(1);
  },
  
  names: function() {
    return this.collect(function(dataset) {
      return dataset.name;
    });
  },
  
  addRecord: function(name, data) {
    this.records.push(new CanvasLab.Dataset(name, data));
  },
  
  first: function() {
    return this.records.first();
  },
  
  last: function() {
    return this.records.last();
  },
  
  _each: function(iterator) {
    this.records._each(iterator);
  },
  
  _length: function() {
    return this.records.length;
  }
  
});

Object.extend(CanvasLab.Collection.prototype, Enumerable);


