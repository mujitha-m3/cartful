const Handlebars = require('handlebars');

module.exports = {
  formatDate: function(date) {
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  },
  
  times: function(n, block) {
    let accum = '';
    for(let i = 0; i < n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  },
  
  sub: function(a, b) {
    return a - b;
  },
  
  round: function(num) {
    return Math.round(num);
  },
  
  firstLetter: function(str) {
    return str ? str.charAt(0).toUpperCase() : '';
  },
  
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  
  ifEquals: (arg1, arg2, options) => (arg1 == arg2 ? options.fn(this) : options.inverse(this)),
  formatPrice: (price) => (price ? `€${price.toFixed(2)}` : '€0.00'),
  hasChildren: (category) => category && category.children && category.children.length > 0,
  calculateTotal: (items) => {
    if (!items) return '0.00';
    let total = 0;
    for (let item of items) {
      total += item.total_price || 0;
    }
    return total.toFixed(2);
  },
  eq: (a, b) => a === b,
  json: (context) => JSON.stringify(context),
  inc: (v) => parseInt(v, 10) + 1,
  formatDateTime: function(date) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
};