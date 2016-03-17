Meteor.subscribe("documents");
Meteor.subscribe("editingUsers");

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
});

Template.docMeta.helpers({
  documents: function() {
    return Documents.findOne({_id: Session.get("docid")});
  },
  canEdit: function() {
    var doc;
    doc = Documents.findOne({_id: Session.get("docid")});
    if (doc) {
      if(doc.owner == Meteor.userId()) {
        return true
      }
    }
    return false;
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
    return Documents.find();
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

Template.docMeta.events({
  "click .js-toggle-private": function(event) {
    console.log("Test: " + this);
    var doc = {_id: Session.get("docid"), isPrivate: event.target.checked  };
    Meteor.call("updateDocPrivacy", doc);
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
