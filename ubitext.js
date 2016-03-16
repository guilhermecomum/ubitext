this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL'
  });

  Template.docMeta.helpers({
    documents: function() {
      return Documents.findOne({_id: Session.get("docid")});
    }
  });


  Template.editor.helpers({
    docid: function() {
      setupCurrentDocument();
      return Session.get("docid");
    },

    config: function() {
      return function(editor) {
        editor.setOption("lineNumbers", true);
        editor.setOption("theme", "material");
        editor.on("change", function(cm_editor, info) {
          $("#viewer_iframe").contents().find("html").html(parseMarkdown(cm_editor.getValue()));
          Meteor.call("addEditingUser");
        });
      };
    }
  });

  Template.editingUsers.helpers({
    users: function() {
      var doc, eusers, users;

      doc = Documents.findOne();
      if (!doc){return}

      eusers = EditingUsers.findOne({docid: doc._id});
      if (!eusers){return}

      users = new Array();
      var i = 0;
      for (var user_id in eusers.users) {
        users[i] = eusers.users[user_id];
        i++;
      }
      return users;
    }
  });

  Template.navbar.helpers({
    documents: function() {
      return Documents.find({});
    }
  });

  Template.editableText.helpers({
    userCanEdit: function(doc, Collection) {
      doc = Documents.findOne({_id: Session.get("docid"), owner: Meteor.userId()});
      if (doc) {
        return true;
      } else {
        return false;
      }
    }
  });

  ///////
  // Events
  ///////

  Template.navbar.events({
    "click .js-add-doc": function(event) {
      event.preventDefault();
      if (!Meteor.user()) {
        alert("You need to login first!");
      } else {
        var id = Meteor.call("addDoc", function(err, res) {
          if (!err) {
            Session.set("docid", res);
          }
        });
      }
    },

    "change .js-load-doc": function(event, template) {
      var id = template.$(".js-load-doc").val();
      Session.set("docid", id);
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

function setupCurrentDocument() {
  var doc;
  if (!Session.get("docid")) {
    doc = Documents.findOne();
    if (doc) {
      Session.set("docid", doc._id);
    }
  }
}
