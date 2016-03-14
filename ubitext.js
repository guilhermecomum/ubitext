this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");



if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL'
  });

  Template.editor.helpers({
    docid: function() {
      var doc = Documents.findOne();
      if (doc) {
        return doc._id;
      } else {
        return undefined;
      }

    },
    config: function() {
      return function(editor) {
        editor.setOption("lineNumbers", true);
        editor.setOption("theme", "cobalt");
        editor.on("change", function(cm_editor, info) {
          $("#viewer_iframe").contents().find("html").html(parseMarkdown(cm_editor.getValue()));
          Meteor.call("addEditingUser");
        });
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {

    if (!Documents.findOne()) { // no documents yet!
      Documents.insert({title: "Sample document"});
    }

  });
}

Meteor.methods({
  addEditingUser: function() {
    var doc, user, eusers;
    doc = Documents.findOne();
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
  }
});
