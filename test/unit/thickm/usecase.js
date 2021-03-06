'use strict';

var faker = window.faker;
Math.seedrandom('thikcm');

// Function to generate random user data
function randomUserData() {
  return {
    _id: faker.Helpers.replaceSymbolWithNumber('###############', '#'),
    username: faker.Internet.userName(),
  };
}

var usersModule = angular.module('users', ['thickm']);

(function() {
  var baseUrl = 'http://coolapp.com/api/v1/';
  var modelName = 'users';

  var collectionUrl = baseUrl + modelName;
  var userCollectionData = {
    _items: Array.apply(null, new Array(25)).map(randomUserData),
    _meta: { total: 73, page: 1, max_results: 25 }
  };
  var knownUserData = userCollectionData._items[0];
  var knownUserUrl = collectionUrl + '/' + knownUserData._id;
  var specifiedItemUrl = 'specifiedItemUrl';
  var specifiedCollectionUrl = 'specifiedCollectionUrl';

  usersModule.value('testData', {
    baseUrl: baseUrl,
    modelName: modelName,
    collectionUrl: collectionUrl,
    userCollectionData: userCollectionData,
    knownUserData: knownUserData,
    knownUserUrl: knownUserUrl,
    specifiedItemUrl: specifiedItemUrl,
    specifiedCollectionUrl: specifiedCollectionUrl
  });

  usersModule.value('configureHttpBackend', function($httpBackend) {
    var escCollectionUrl = collectionUrl.replace(/[\/]/g, '\\/');

    function postData() {
      return true;
    }

    function postHeaders() {
      // var json = headers['Content-Type'] === 'application/json';
      // if (!json) {
      //   console.warn('Wrong headers ' + headers['Content-Type'], headers);
      // }
      // return json;
      return true;
    }

    $httpBackend.whenGET(new RegExp(escCollectionUrl + '(\\?.*)?$')).
        respond(function() {
          return [200, JSON.stringify(userCollectionData), {}, 'OK'];
        });

    $httpBackend.whenGET(new RegExp(specifiedCollectionUrl + '(\\?.*)?$'))
        .respond(function() {
          return [200, JSON.stringify(userCollectionData), {}, 'OK'];
        });

    angular.forEach(userCollectionData._items, function(userData) {
      $httpBackend.whenGET(new RegExp(escCollectionUrl + '\/' + userData._id +
          '(\\?.*)?$'))
          .respond(function() {
            return [200, JSON.stringify(userData), {}, 'OK'];
          });
    });

    $httpBackend.whenGET(new RegExp(specifiedItemUrl + '(\\?.*)?$'))
        .respond(function() {
          return [200, JSON.stringify(knownUserData), {}, 'OK'];
        });

    $httpBackend.whenPATCH(collectionUrl + '/' + knownUserData._id, postData, postHeaders)
        .respond(function(method, url, data) {
          return [200, data, {}, 'OK'];
        });

    $httpBackend.whenPOST(collectionUrl, postData, postHeaders).respond(function() {
      return [201, JSON.stringify(knownUserData), {}, 'Created'];
    });

    $httpBackend.whenDELETE(collectionUrl + '/' + knownUserData._id)
        .respond(function() {
          return [200, '', {}, 'OK'];
        });
  });
})();

// Define ApiCollection factory
usersModule.factory('MyAPICollection', function(ThickModelCollection) {
  function MyAPICollection() {

  }
  ThickModelCollection.extend(MyAPICollection);

  MyAPICollection._itemsField = '_items';
  MyAPICollection._metaField = '_meta';

  MyAPICollection.prototype.hasNext = function() {
    return this._meta.page * this._meta.max_results < this._meta.total;
  };

  return MyAPICollection;
});

// Define users factory
usersModule.factory('User', function(ThickModel, MyAPICollection) {

  function User(data) {
    this._primaryField = '_id';
    angular.extend(this, data);
  }
  ThickModel.extend(User);

  User._collectionClass = MyAPICollection;
  User.prototype._modelName = 'users';
  User.prototype._baseUrl = 'http://coolapp.com/api/v1/';

  // Instance methods
  User.prototype.fullName = function() {
    return 'full name';
  };

  return User;
});
