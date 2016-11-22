


db.item.find({
    "$text": {
      "$search": "shirt"
    }
  }).pretty()





  
db.item.find({
    "$or": [
        {"title" : {$regex : "shirt"}}
    ]
  }).pretty()


db.item.createIndex(
   {
     title: "text",
     slogan: "text",
     description: "text"
   }
 )