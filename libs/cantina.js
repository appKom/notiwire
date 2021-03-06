"use strict";
var async = require('async');
const debug = require('debug')('cantina');
var xml2js = require('xml2js');
var Hours = require('./hours');
var requests = require('./requests');

var Cantina = function() {

  this.url = 'https://www.sit.no/middag';
  this.api = 'https://www.sit.no/rss.ap?thisId=';
  this.msgClosed = 'Ingen publisert meny i dag';
  this.msgConnectionError = 'Frakoblet fra sit.no/rss';
  this.msgUnsupportedCantina = 'Kantinen støttes ikke';
  this.msgMalformedMenu = 'Galt format på meny';
  this.dinnerWordLimit = 7; // 4-7 is good, depends on screen size
  this.debug = 0; // General debugging
  this.debugDay = 0; // Whether or not to debug a particular day
  this.debugThisDay = 'Onsdag'; // The day in question
  this.debugText = 0; // Whether or not to deep debug dinner strings (even in weekends)
  this.debugThisText = 'Vårruller. Servert med ris og salat: 1000,-'; // debugText must be true
  // Expected format of debugThisText: "Seirett med ris (G): 8 kroner" -> "food: price"
  // Note1: Set the price of debugThisText low to show it first cuz the list is sorted by price

  // Documentation of SiT's RSS feeds for foodz
  // https://www.sit.no/rss.ap?thisId=1457 dinner/DEPRECATED - Dragvoll
  // https://www.sit.no/rss.ap?thisId=1458 dinner/DEPRECATED - Hangaren
  // https://www.sit.no/rss.ap?thisId=1468 dinner/DEPRECATED - Elektro
  // https://www.sit.no/rss.ap?thisId=1471 kiosk/EMPTY - Café Sito Realfag
  // https://www.sit.no/rss.ap?thisId=1472 kiosk/EMPTY - Café Sito Stripa
  // https://www.sit.no/rss.ap?thisId=1476 kiosk/EMPTY - Matbaren Idrettssenteret
  // https://www.sit.no/rss.ap?thisId=31862 kiosk/EMPTY - Storkiosk Dragvoll
  // https://www.sit.no/rss.ap?thisId=36441 dinner - Dragvoll
  // https://www.sit.no/rss.ap?thisId=36444 dinner - Hangaren
  // https://www.sit.no/rss.ap?thisId=36447 dinner - Realfag
  // https://www.sit.no/rss.ap?thisId=36450 dinner - Tyholt
  // https://www.sit.no/rss.ap?thisId=36453 dinner - Kalvskinnet
  // https://www.sit.no/rss.ap?thisId=36456 dinner/EMPTY - Moholt
  // https://www.sit.no/rss.ap?thisId=37228 dinner/EMPTY - Øya
  // https://www.sit.no/rss.ap?thisId=38753 dinner/EMPTY - Tungasletta
  // https://www.sit.no/rss.ap?thisId=38798 dinner/EMPTY - DMMH
  // https://www.sit.no/rss.ap?thisId=38910 dinner - Rotvoll
  // https://www.sit.no/rss.ap?thisId=40227 dinner/EMPTY - Elektro
  // https://www.sit.no/rss.ap?thisId=41647 dinner/EMPTY - Kjelhuset
  // https://www.sit.no/rss.ap?thisId=41886 dinner/EMPTY - Elgeseter
  // https://www.sit.no/rss.ap?thisId=42015 dinner/EMPTY - MTFS
  // https://www.sit.no/rss.ap?thisId=42222 lunch/EMPTY - MTFS
  // https://www.sit.no/rss.ap?thisId=42276 lunch - Elgeseter
  // https://www.sit.no/rss.ap?thisId=42330 lunch - Dragvoll
  // https://www.sit.no/rss.ap?thisId=42384 lunch - Hangaren
  // https://www.sit.no/rss.ap?thisId=42438 lunch - Realfag
  // https://www.sit.no/rss.ap?thisId=42546 lunch - Elektro
  // https://www.sit.no/rss.ap?thisId=42600 lunch/EMPTY - Tyholt
  // https://www.sit.no/rss.ap?thisId=42654 lunch/EMPTY - Kalvskinnet
  // https://www.sit.no/rss.ap?thisId=42708 lunch - Moholt
  // https://www.sit.no/rss.ap?thisId=42762 lunch - DMMH
  // https://www.sit.no/rss.ap?thisId=42816 lunch - Øya
  // https://www.sit.no/rss.ap?thisId=42870 lunch/EMPTY - Rotvoll
  // https://www.sit.no/rss.ap?thisId=42924 lunch - Tungasletta

  // Feeds
  // To single out days use 'https://www.sit.no/rss.ap?thisId=36441&ma=on' - gives 'mandag' alone
  this.feeds = {
    'dmmh': {
      'lunch': 42762,
      'dinner': 38798
    },
    'dragvoll': {
      'lunch': 42330,
      'dinner': 36441
    },
    'elektro': {
      'lunch': 42546,
      'dinner': 40227
    },
    'elgeseter': {
      'lunch': 42276,
      'dinner': 41886
    },
    'hangaren': {
      'lunch': 42384,
      'dinner': 36444
    },
    'kalvskinnet': {
      'lunch': 42654,
      'dinner': 36453
    },
    'kjel': {
      'dinner': 31681,
      'lunch': null
    },
    'moholt': {
      'lunch': 42708,
      'dinner': 36456
    },
    'mtfs': {
      'lunch': 42222,
      'dinner': 42015
    },
    'oya': {
      'lunch': 42816,
      'dinner': 37228
    },
    'realfag': {
      'lunch': 42438,
      'dinner': 36447
    },
    'rotvoll': {
      'lunch': 42870,
      'dinner': 38910
    },
    'tungasletta': {
      'lunch': 42924,
      'dinner': 38753
    },
    'tyholt': {
      'lunch': 42600,
      'dinner': 36450
    }
  };

  this.names = {
    'dmmh': 'DMMH',
    'dragvoll': 'Dragvoll',
    'elektro': 'Elektro',
    'elgeseter': 'Elgeseter',
    'hangaren': 'Hangaren',
    'kalvskinnet': 'Kalvskinnet',
    'kjel': 'Kjelhuset',
    'moholt': 'Moholt',
    'mtfs': 'MTFS',
    'realfag': 'Realfag',
    'rotvoll': 'Rotvoll',
    'tungasletta': 'Tungasletta',
    'tyholt': 'Tyholt',
    'oya': 'Øya',
    'storkiosk dragvoll': 'Storkiosk Dragvoll',
    'storkiosk gloshaugen': 'Storkiosk Gløshaugen',
    'storkiosk oya': 'Storkiosk Øya',
    'idretts. dragvoll': 'Idretts. Dragvoll',
    'sito dragvoll': 'Sito Dragvoll',
    'sito realfag': 'Sito Realfag',
    'sito stripa': 'Sito Stripa'
  };

  // SiTs new format for ajaxing dinner:
  // NOT used, we use RSS instead, so far this is just saved here for the sake of interest
  // https://www.sit.no/ajaxdinner/get
  // POST: "diner=realfag&trigger=week"
  // diner = "dragvoll | hangaren | realfag | kjel | elektro | tyholt
  //    | kalvskinnet | moholt | dmmh | oya | rotvoll | ranheimsveien"

  this.responseData = {};
};

Cantina.prototype.all = function(callback) {
  var cantinas = [];
  for(var key in this.names) {
    var cantina = {'id': key};
    cantina.name = this.names[key];
    cantina.feed = this.feeds[key] ? this.feeds[key] : null;
    cantinas.push(cantina);
  }
  callback(cantinas);
};

Cantina.prototype.get = function (cantina, callback) {
  if (this.names[cantina] === undefined) {
    debug(this.msgUnsupportedCantina);
    this.responseData.error = this.msgUnsupportedCantina;
    callback(this.responseData);
    return;
  }

  cantina = cantina.toLowerCase();
  this.responseData.name = this.names[cantina];

  var self = this;
  var hours = new Hours();
  hours.get(cantina, function(hours) {
    self.responseData.hours = hours;
    self.open = hours.open;
    if(self.feeds[cantina] === undefined) {
      self.responseData.error = self.msgUnsupportedCantina;
      callback(self.responseData);
      return;
    }
    var keys = Object.keys(self.feeds[cantina]);
    async.map(keys, function(key, callback) {
      debug(key);
      var rssUrl = self.api + self.feeds[cantina][key];
      debug(rssUrl);
      requests.xml(rssUrl, {
        success: function(xml) {
          // Parse menu xml
          self.parseXml(xml, function(objects) {
              callback(null, {name: key, value: objects});
          });
        },
        error: function(err, data) {
          debug(self.msgConnectionError);
          callback(null, {name: key, value: {error: self.msgConnectionError}});
        }
      });
    }, function(err, results) {
      results.forEach(function(result) {
        self.responseData[result.name] = result.value;
      });
      callback(self.responseData);
    });
  });
};


Cantina.prototype.parseXml = function(xml, callback) {
  var self = this;
  try {
    // If menu is missing: stop
    if(!xml['rdf:RDF'].item) {
      callback({message: self.msgClosed});
      return;
    }
    var fullWeekDinnerInfo = xml['rdf:RDF'].item[0].description[0]; // You're welcome
    if (fullWeekDinnerInfo === undefined) {
      callback({message: self.msgClosed});
      return;
    }

    // Throw away SiT's very excessive whitespace
    fullWeekDinnerInfo = fullWeekDinnerInfo.replace(/[\s\n\r]+/g,' ');
    fullWeekDinnerInfo = fullWeekDinnerInfo.trim();
    var today = self.whichDayIsIt();
    if (self.debugDay)
      today = self.debugThisDay;
    var dinnerForEachDay = fullWeekDinnerInfo.split('<b>');
    var todaysMenu = self.msgClosed;
    var mondaysCantinaMenu = '';
    for (var dinnerDay in dinnerForEachDay) {
      // Find todays dinner menu
      if (dinnerForEachDay[dinnerDay].lastIndexOf(today, 0) === 0)
        todaysMenu = dinnerForEachDay[dinnerDay];
      // Mondays menu is kept in case it contains a lonely message
      if (dinnerForEachDay[dinnerDay].lastIndexOf('Mandag', 0) === 0)
        mondaysCantinaMenu = dinnerForEachDay[dinnerDay];
    }
    // If no dinners for today were found (saturday / sunday)
    if (todaysMenu === self.msgClosed && !self.debugText) {
      callback({message: self.msgClosed});
      return;
    }

    self.parseTodaysMenu(todaysMenu, mondaysCantinaMenu, callback);
  }
  catch (err) {
    debug('Problems during parsing of dinner xml');
    callback({error: self.msgMalformedMenu});
  }
};

Cantina.prototype.parseTodaysMenu = function(todaysMenu, mondaysCantinaMenu, callback) {
  var self = this;
  // try {
    var dinnerList = todaysMenu.split('<br>');

    // Remove empty or irrelevant information (items: first, last, second last)
    dinnerList = dinnerList.splice(1,dinnerList.length-3);

    // Separate dinner and price
    var dinnerObjects = [];
    var indexCount = 0;
    dinnerList.forEach( function(dinner) {

      if (self.debugText && indexCount === 0) {
        dinner = self.debugThisText;
      }

      if (dinner.indexOf(': ') !== -1) {
        var description = dinner.substring(0, dinner.lastIndexOf(': '));
        var price = dinner.substring(dinner.lastIndexOf(': ') + 2);

        // If both dinner and price contains a '/' there might be two dinners
        // Lodged into one cell, try to separate the siamese dinners!
        if ((description.indexOf('/') !== -1) && (price.indexOf('/') !== -1)) {
          var descriptions = description.split('/');
          var prices = price.split('/');
          debug('WARNING: multiple dinners in one cell: ' + descriptions + ', ' + prices + ', index: ' + index);
          dinnerObjects.push(new self.dinnerObject(descriptions[0], prices[0], indexCount));
          dinnerObjects.push(new self.dinnerObject(descriptions[1], prices[1], indexCount));
        }

        else {
          var singleDinner = new self.dinnerObject(description, price, indexCount);
          debug(singleDinner.price + ', ' + singleDinner.text  + ', ' + singleDinner.index);
          dinnerObjects.push(singleDinner);
        }
      }
      else {
        debug('Problems during initial parsing of todays dinner');
        callback({error: self.msgMalformedMenu});
        return;
      }
      // The dinner.index represents the current dinners index in SiT's RSS feeds
      indexCount++;
    });

    // Shorten dinner prices
    dinnerObjects.forEach( function(dinner) {
      if (dinner.price !== null) {
        var price = dinner.price;

        price = price.replace(/((,|[.])00)/g, ''); // Remove 'øre' if shown
        price = price.trim();

        // Two price classes? Choose the cheapest
        if (price.match(/ |\//) !== null) { // Split by space or slash
          // Find delimiter
          var delimiter = '/'; // Assume split by slash
          if (price.indexOf(' ') !== -1)
            delimiter = ' '; // Use split by space instead
          // Split and compare prices
          var price1 = price.split(delimiter)[0].match(/\d+/g);
          var price2 = price.split(delimiter)[1].match(/\d+/g);
          if (price1 === null)
            price = price2;
          else if (price2 === null)
            price = price1;
          else
            price = ( Number(price1) < Number(price2) ? price1 : price2 );
          debug('Price from "'+dinner.price+'" to "'+price+'" (DUAL price)');
        }
        else {
          price = price.match(/\d+/g);
          debug('Price from "'+dinner.price+'" to "'+price+'"');
        }
        dinner.price = price;
      }
    });

    // If no dinner info is found at all, check for unique message at monday if open
    if (dinnerObjects.length === 0) {
      debug('WARNING: no dinner menu found today, checking monday');
      if (self.open && mondaysCantinaMenu !== null) {
        // WARNING: recursion is divine!
        self.parseTodaysMenu(mondaysCantinaMenu, null, callback);
      }
      else {
        debug('WARNING: no info found on monday either');
        callback({message: self.msgClosed});
      }
      return;
    }

    // Prettify dinner descriptions, this is where the real magic happens
    dinnerObjects.forEach( function(dinner) {
      var text = dinner.text;

      // Extract any food flags first
      text = self.addMissingFoodFlags(text);
      text = self.removeTextualFoodFlags(text);
      dinner.flags = self.getFoodFlags(text);
      // If it's a message (dinner without a price) we'll just trim it
      if (dinner.price === null) {
        // Even messages (like " God sommer ") needs trimming
        text = text.trim();
      }
      else {
        text = self.removeFoodFlags(text);
        text = self.addMissingSpaces(text);
        text = self.shortenFoodServedWith(text);
        text = self.shortenFoodWithATasteOf(text);
        text = self.shortenTodaysSoup(text);
        text = self.lessUPPERCASEplease(text);
        text = self.expandAbbreviations(text);
        text = self.removeFoodHomeMade(text);
        text = text.trim();
        // If current item is NOT about the buffet, a special or the takeaway, continue with:
        if (text.match(/buffet|dag|takeaway/gi) === null) {
          text = self.removePartsAfter(['.','('], text); // don't use: '/', ','
          text = self.limitNumberOfWords(self.dinnerWordLimit, text);
          text = self.removeLastWords([
            'i','&','og','med','m','eller',
            'frisk','friske',
            'fylt','fyllt',
            'gresk',
            'inkl','inkludert',
            'krydret',
            'strimla','strimlet'
          ], text);
        }
        text = text.trim();
        text = self.capitalize(text);
        text = self.removePunctuationAtEndOfLine(text);
      }
      text = self.capitalize(text);
      debug('\nFrom\t"'+dinner.text+'"\nTo\t\t"'+text+'"\n');
      // Add flags
      if (dinner.flags !== null)
        text += ' ' + dinner.flags;
      // Save
      dinner.text = text;
    });

    // Turn prices into Number vars and sort dinnerobjects by price
    if (typeof dinnerObjects[0].price != 'undefined') {
      dinnerObjects.sort(function(a,b){
        a.price = Number(a.price);
        b.price = Number(b.price);
        return(a.price>b.price)?1:((b.price>a.price)?-1:0);
      });
      // Missing prices are turned into 0's by the sort function,
      // - Set prices back to null to make sure it doesn't count as a number
      dinnerObjects.forEach(function(dinner){
        if (dinner.price === 0) dinner.price = null;
      });
    }

    // If any objects have empty text fields, remove them
    dinnerObjects = this.removeEmptyDinnerObjects(dinnerObjects);
    callback(dinnerObjects);
  // }
  // catch (err) {
  //   console.log('ERROR: problems during deep parsing of todays dinners');
  //   callback(self.msgMalformedMenu);
  // }
};

// The actual Dinner object

Cantina.prototype.dinnerObject = function(text, price, index) {
  this.text = text;
  this.price = price;
  this.index = index;
  this.flags = null;
};

// Welcome to the department of simple functions, HELLO!

Cantina.prototype.endsWith = function(suffix, str) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1; // Faster than regex matching
};

Cantina.prototype.whichDayIsIt = function() {
  var dayNames = ["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"];
  var today = dayNames[new Date().getDay()];
  return today;
};

Cantina.prototype.removeEmptyDinnerObjects = function(dinnerObjects) {
  var nonEmptyDinnerObjects = [];
  dinnerObjects.forEach(function(dinner) {
    if (dinner.text.trim() !== '') {
      nonEmptyDinnerObjects.push(dinner);
    }
  });
  return nonEmptyDinnerObjects;
};

// Welcome to the department of key removal, how may we help you?

Cantina.prototype.removePartsAfter = function(keys, text) {
  var self = this;
  for (var i in keys) {
    debug(keys[i] + (keys[i].length<4?'\t\t':'\t') + ':: ' + text);
    if (text.indexOf(keys[i]) !== -1)
      text = text.split(keys[i])[0];
  }
  return text;
};

Cantina.prototype.removeLastWords = function(keys, text) {
  var self = this;
  // We'll do this twice in case some keywords are laid out after eachother.
  // Example: "Raspeballer med frisk salat", where "med" and "frisk" are keywords.
  for (var i=0; i<2; i++) {
    for (var j in keys) {
      debug(keys[j] + (keys[j].length<4?'\t\t':'\t') + ':: ' + text);
      var spacedKey = ' '+keys[j];
      if (self.endsWith(spacedKey, text)) {
        var pieces = text.split(' ');
        text = pieces.splice(0,pieces.length-1).join(' ');
      }
    }
  }
  return text;
};

// Welcome to the department of regular expressions, how may we (help|do) you\?

Cantina.prototype.addMissingFoodFlags = function(text) {
  // Sometimes, SiT will write "vegetar" in the text, but forget to add the food flag (V)
  if (text.match(/(ingen|ikke) vegetar/gi) === null) {
    if(text.match(/vegetar/gi) !== null) {
      text += '(V)';
    }
  }
  if (text.match(/((uten |ikke )gluten)|gluten ?fri/gi) !== null)
    text += '(G)';
  if (text.match(/((uten |ikke )laktose)|laktose ?fri/gi) !== null)
    text += '(L)';
  return text;
};

Cantina.prototype.removeTextualFoodFlags = function(text) {
  // After the flag has been added properly with addMissingFoodFlags, common cases
  // of "vegetar" in the text may be removed (shown with flag instead like "(V)")
  // Cases:
  // "Vegetar - lapskaus med rømme"
  // "Vegetar: Lapskaus med rømme"
  // "Vegetar; lapskaus med rømme"
  text = text.replace(/vegetar[;:\s\-]*/gi, '');
  // TODO: Watch out for Laktosefri or Glutenfri variants.
  return text;
};

Cantina.prototype.getFoodFlags = function(text) {
  var matches = text.match(/\b[VGL]+(?![æøåÆØÅ])\b/g);
  if (matches === null)
    return null;
  matches = matches.filter(function(elem, pos) {
    return matches.indexOf(elem) == pos;
  });
  return '(' + matches.sort().join('') + ')';
  // TODO: Both getFoodFlags and removeFoodFlags suffer from a lacking implementation
  // of the regex flag 'word boundary'. Add the flag /i to both and make sure they
  // can handle æøåÆØÅ on both sides of food flags, especially in words like
  // Vårruller, Blomkål, etc. For now these functions rely on the fact that flags
  // are always shown in uppercase.
};

Cantina.prototype.removeFoodFlags = function(text) {
  debug('Flags\t:: ' + text);
  // Removes food flags like V,G,L in all known forms. Seriously. All known forms. Don't.
  return text.replace(/([,;&(.\/]*\b[VGL]+(?![æøåÆØÅ])\b[,;&).\s]*)+/g, '');
  // return text.replace(/([,;&\(\/\.]*\b[VGL]+(?![æøåÆØÅ])\b[,;&\s\)\.]*)+/g, '');
  // NOTE: æøåÆØÅ is wrongly matched as word boundary, bug report has been submitted to
  // the Chromium team. A case sensitive fix is implemented via negative lookahead.
  // UPDATE from yangguo@chromium.org: "Unfortunately, this is specified by ECMA-262,
  // 15.10.2.6 (Assertion). \b essentially depends on the definition of IsWordChar,
  // which basically covers [a-zA-Z0-9_]. Unicode is not considered here." ..dammit.
  // REPORT: https://code.google.com/p/chromium/issues/detail?id=223360
};

Cantina.prototype.addMissingSpaces = function(text) {
  debug('Spaces\t:: ' + text);
  // Add spaces where missing, like "smør,brød,sopp" to "smør, brød, sopp"
  return text.replace(/([a-zA-Z0-9æøåÆØÅ])(,)([a-zA-Z0-9æøåÆØÅ])/gi, '$1, $3');
};

Cantina.prototype.shortenFoodServedWith = function(text) {
  debug('Served\t:: ' + text);
  // Replace wordings like 'servert med' to just 'med'
  return text.replace(/[,|\.]?\s?(ser(e)?ver\w*(t|es)?)?\s?med\s/gi, ' med ');
};

Cantina.prototype.shortenFoodWithATasteOf = function(text) {
  debug('TasteOf\t:: ' + text);
  // Replace wordings like 'med en liten smak av' to just 'med'
  return text.replace(/[,|\.]?\s?(med)?\s?(en|et)?\s?(liten?)?\s?(smak|hint|dæsj|tøtsj)\s?(av)?\s/gi, ' med ');
};

Cantina.prototype.shortenTodaysSoup = function(text) {
  debug('Soup\t:: ' + text);
  // Shortening "Dagens suppe - Løksuppe med løk (G)" to "Løksuppe med løk (G)"
  return text.replace(/dagens suppe(\: | - )/gi, '');
};

Cantina.prototype.lessUPPERCASEplease = function(text) {
  debug('UPPER\t:: ' + text);
  // Changing "FREDAGS RETTEN" to "fredags retten" (capitalized first letter added later)
  return text.replace(/([A-ZÆØÅ]{4,})/g, function(v) {
    return v.toLowerCase();
  });
};

Cantina.prototype.expandAbbreviations = function(text) {
  debug('Abbrev.\t:: ' + text);
  // Replace wordings like 'm', 'm/' with the actual word, make sure there is one space on either side of the word
  return text.replace(/([a-zæøåÆØÅ]*)[ ,\.]\/?m(\/|\s) ?/gi, '$1 med ');
};

Cantina.prototype.removeFoodHomeMade = function(text) {
  debug('Home\t:: ' + text);
  // Replace wordings like 'Hjemmelagde kjøttkaker' to just 'Kjøttkaker'
  text = text.replace(/^\s?hjemmelag(et|de)\s/gi, '');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

Cantina.prototype.removePunctuationAtEndOfLine = function(text) {
  debug(',;.-\t:: ' + text);
  // Removing use of punctuation at EOL in lists, like: "39,- Pasta bolognaise."
  return text.replace(/[,;.-]$/gm, '');
};

Cantina.prototype.limitNumberOfWords = function(limit, originalText) {
  debug(limit + '\t\t:: ' + originalText);
  var text = originalText;
  if (text.split(' ').length > limit) {
    text = text.split(' ').splice(0,limit).join(' ');
    // Surprisingly accurate check to see if we're ending the sentence with a verb
    // E.g. "Gryte med wokede", "Lasagna med friterte", "Risrett med kokt", "Pølse med hjemmelaget", "Taco med godt"
    if (text.match(/(te|de|dt|kt|dampet|laget)$/))
      // In that case, return the expected noun as well (heighten limit by 1)
      return originalText.split(' ').splice(0,limit+1).join(' ');
  }
  return text;
};

Cantina.prototype.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = Cantina;
