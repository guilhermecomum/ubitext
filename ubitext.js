this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {


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
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
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
    if(!doc) {return;} // give up
    if(!this.userId){return;} // no user logged

    user = Meteor.user().profile;
    eusers = EditingUsers.findOne({docid:doc._id});
    if(!eusers){
      eusers = {
        docid: doc._id,
      };
    }
    EditingUsers.insert({eusers});
  }
});
