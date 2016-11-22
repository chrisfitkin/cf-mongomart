/*
  Copyright (c) 2008 - 2016 MongoDB, Inc. <http://mongodb.com>

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/


var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');


function ItemDAO(database) {
    "use strict";

    this.db = database;

    this.getCategories = function(callback) {
        "use strict";

        var aggregate = [
                            { $group: {
                                "_id": "$category",
                                "num": {$sum: 1}
                            }},
                            { $sort: {
                                "_id": 1
                            }}
                        ];

        var cursor = this.db.collection('item').aggregate(aggregate).toArray(function(err, results) {
            assert.equal(null, err);
            var total_items = results.reduce(function(a,b) {
                return a + b.num;
            }, 0);
            results.unshift({
                _id: "All",
                num: total_items
            });
            // console.log(results);
            callback(results);
        });

    }


    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        var query = {};
        if (category && category != "All") {
            // query = { "cateogry": category };
            query.category = category;
        }
        var options = {
            "limit": itemsPerPage,
            "skip": (itemsPerPage * page) || 0,
            "sort": {"_id": 1}
        };

        var cursor = this.db.collection('item').find(query, options).toArray(function(err, results) {
            assert.equal(null, err);
            // console.log(results);
            callback(results);
        });

    }


    this.getNumItems = function(category, callback) {
        "use strict";

        var numItems = 0;
        var query = {};
        if (category != "All") {
            query.category = category;
        }
        
        var cursor = this.db.collection('item').count(query, function(err, results) {
            assert.equal(null, err);
            // console.log("getNumItems :: callback");
            // console.log(results);
            callback(results);
        });

    }


    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        /*
         * TODO-lab2A
         *
         * LAB #2A: Implement searchItems()
         *
         * Using the value of the query parameter passed to searchItems(),
         * perform a text search against the "item" collection.
         *
         * Sort the results in ascending order based on the _id field.
         *
         * Select only the items that should be displayed for a particular
         * page. For example, on the first page, only the first itemsPerPage
         * matching the query should be displayed.
         *
         * Use limit() and skip() and the method parameters: page and
         * itemsPerPage to select the appropriate matching products. Pass these
         * items to the callback function.
         *
         * searchItems() depends on a text index. Before implementing
         * this method, create a SINGLE text index on title, slogan, and
         * description. You should simply do this in the mongo shell.
         *
         */

        var findQuery = {};
        if (query != "") {
            // query = { "cateogry": category };
            findQuery = { "$text": { "$search": query } };
        }
        var options = {
            "limit": itemsPerPage,
            "skip": (itemsPerPage * page) || 0,
            "sort": {"_id": 1}
        };

        var cursor = this.db.collection('item').find(findQuery, options).toArray(function(err, results) {
            assert.equal(null, err);
            // console.log(results);
            callback(results);
        });
    }


    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var findQuery = {};
        if (query != "") {
            // query = { "cateogry": category };
            findQuery = { "$text": { "$search": query } };
        }

        var cursor = this.db.collection('item').count(findQuery, function(err, results) {
            assert.equal(null, err);
            // console.log(results);
            callback(results);
        });
    }


    this.getItem = function(itemId, callback) {
        "use strict";

        /*
         * TODO-lab3
         *
         * LAB #3: Implement the getItem() method.
         *
         * Using the itemId parameter, query the "item" collection by
         * _id and pass the matching item to the callback function.
         *
         */


        var cursor = this.db.collection('item').find({"_id": itemId}).toArray(function(err, results) {
            assert.equal(null, err);
            console.log(results);
            callback(results[0]);
        });

        // var item = this.createDummyItem();

        // TODO-lab3 Replace all code above (in this method).

        // TODO Include the following line in the appropriate
        // place within your code to pass the matching item
        // to the callback.
        // callback(item);
    }


    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };


    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        /*
         * TODO-lab4
         *
         * LAB #4: Implement addReview().
         *
         * Using the itemId parameter, update the appropriate document in the
         * "item" collection with a new review. Reviews are stored as an
         * array value for the key "reviews". Each review has the fields:
         * "name", "comment", "stars", and "date".
         *
         */

        var reviewDoc = {
            name: name,
            comment: comment,
            stars: stars,
            date: Date.now()
        }


        // TODO replace the following two lines with your code that will
        // update the document with a new review.
        this.db.collection("item").find({"_id": itemId})
            .limit(1)
            .toArray(function(err, doc) {
                assert.equal(null, err);
                // console.log(doc);
                // if(doc.reviews) {
                //     doc.reviews.push(reviewDoc);
                // } else {
                    doc.reviews = [reviewDoc];
                // }
                console.log(doc);
                this.db.collection("item").save(doc,{"w":1}, function(err, result) {
                    callback(doc);
                })
            });

            /*

        // TODO replace the following two lines with your code that will
        // update the document with a new review.
        var doc = this.createDummyItem();
        doc.reviews = [reviewDoc];

        // TODO Include the following line in the appropriate
        // place within your code to pass the updated doc to the
        // callback.
        callback(doc);
        */
    }


    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}


module.exports.ItemDAO = ItemDAO;
