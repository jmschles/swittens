(function() {
  var app = angular.module('quote', [ ]);

  app.controller('QuoteController', [ '$http', function($http) {
    var quote = this;
    quote.contents = '';

    $http.get('http://ron-swanson-quotes.herokuapp.com/quotes').success(function(data) {
      quote.contents = data.quote;
    });
  }]);

  app.controller('KittenController', [ '$http', function($http) {
    var kitten = this;
    kitten.image_urls = [];

    $http.get('/api/kittens').success(function(data) {
      angular.forEach(data, function(image, key) {
        var image_url = "https://farm" + image.farm + ".staticflickr.com/" + image.server + "/" + image.id + "_" + image.secret + ".jpg";
        kitten.image_urls.push(image_url);
      });
    });

    this.randomKittenUrl = function() {
      var randomIndex = Math.floor(Math.random() * kitten.image_urls.length);
      return kitten.image_urls[randomIndex];
    };
  }]);

  app.directive('randomKitten', function() {
    return {
      restrict: 'E',
      templateUrl: 'random-kitten.html'
    };
  });
})();
