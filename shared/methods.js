Meteor.methods({
  addDoc: function() {
    var doc;
    if(!this.userId) {
      return
    } else {
      doc = {
        owner: this.userId,
        createdOn: new Date(),
        title: "Untitled"
      }
      var id = Documents.insert(doc);
      console.log("addDoc method: " + id)
      return id;
    };

  },

  addEditingUser: function(docid) {
    var doc, user, eusers;
    doc = Documents.findOne({_id: docid});
    if(!doc) {return;} // give up
    if(!this.userId){return;} // no user logged

    user = Meteor.user();
    eusers = EditingUsers.findOne({docid: doc._id});
    if(!eusers){
      eusers = {
        docid: doc._id,
        users: {}
      };
    }
    user.lastEdit = new Date();
    eusers.users[this.userId] = user;

    EditingUsers.upsert({_id:eusers._id}, eusers);
  },

  updateDocPrivacy: function(doc) {
    console.log("Method: ");
    console.log(doc);
    var realDoc = Documents.findOne({_id: doc._id, owner: this.userId});
    if (realDoc) {
      realDoc.isPrivate = doc.isPrivate;
      Documents.update({_id:doc._id}, realDoc);
    }

  }

});
