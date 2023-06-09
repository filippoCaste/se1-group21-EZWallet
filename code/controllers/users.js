import { Group, User } from "../models/User.js";
import { transactions } from "../models/model.js";
import { verifyAuth } from "./utils.js";

/**
 * Return all the users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `email` and `role`
  - Optional behavior:
    - empty array is returned if there are no users
 */
export const getUsers = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    if (adminAuth.authorized) {
      const users = await User.find({}, { username: 1, email: 1, role: 1, _id: 0 });
      return res.status(200).json({ data: users, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    }
    return res.status(401).json({ error: adminAuth.cause });
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 400 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  try {
    const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username });
    const adminAuth = verifyAuth(req, res, { authType: "Admin" });
    

    if (userAuth.authorized || adminAuth.authorized) {
      // User or admin auth successful
      const reqUser = await User.findOne({ username: req.params.username }, { username: 1, email: 1, role: 1, _id: 0 });
      if (!reqUser) {
        return res.status(400).json({ error: "User not found" });
      }
      return res.status(200).json({ data: reqUser, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error: adminAuth.cause });
    }

  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

/**
 * Create a new group
  - Request Body Content: An object having a string attribute for the `name` of the group and an array that lists all the `memberEmails`
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name`
    of the created group and an array for the `members` of the group), an array that lists the `alreadyInGroup` members
    (members whose email is already present in a group) and an array that lists the `membersNotFound` (members whose email
    +does not appear in the system)
  - Optional behavior:
    - error 400 is returned if there is already an existing group with the same name
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
  try {

    const simpleAuth = verifyAuth(req, res, { authType: "Simple" });

    if (!simpleAuth.authorized) {
      return res.status(401).json({ error: simpleAuth.cause });
    }

    // Check for incomplete request body
    if (!('name' in req.body) || !('memberEmails' in req.body)) {
      return res.status(400).json({ error: "Incomplete request body" });
    }

    let { name, memberEmails } = req.body;
    name = name.trim();
    // Check for empty strings
    if (name.trim().length === 0) {
      return res.status(400).json({ error: "Empty fields are not allowed" });
    }
    memberEmails = memberEmails.map((e) => e.trim());
    const reqUser = (await User.findOne({ refreshToken: req.cookies.refreshToken }));
    const reqUserMail = reqUser.email;

    // If the user who calls the API does not have their email in the list of emails then their email is added to the list of members
    if (!memberEmails.includes(reqUserMail)) {
      memberEmails.push(reqUserMail);
    }
    

    // Check if a group with the same name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ error: 'A group with the same name already exists.' });
    }

    // Check if the user who calls the API is already in a group
    const apiCallerIsAlreadyInAGroup = await Group.exists({ 'member.email': reqUserMail })
    if (apiCallerIsAlreadyInAGroup) {
      return res.status(400).json({ "error": 'You are already in a Group' });
    }

    // Check if all memberEmails exist or are already in a group
    const membersNotFound = [];
    const alreadyInGroup = [];
    const validMembers = [];
    // Check if at least one of the member emails is not in a valid email format or empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validFormatCheck = memberEmails.every(email => emailRegex.test(email));
    if (!validFormatCheck) {
      return res.status(400).json({ error: "Invalid memberEmail format" });
    }

    for (const email of memberEmails) {

      const user = await User.findOne({ email });
      if (!user) {
        membersNotFound.push(email);
      } else {
        const isInGroup = await Group.exists({ 'members.email': email });
        if (isInGroup) {
          alreadyInGroup.push(email);
        } else {
          validMembers.push({ email, user });
        }
      }
    }

    if (membersNotFound.length + alreadyInGroup.length === memberEmails.length) {
      return res.status(400).json({ error: "All the provided emails represent users that are already in a group or do not exist in the database" });
    }

    // Create the new group
    const group = await Group.create( {name, members: validMembers} );
    const groupMembers = group.members.map(member => member.email);
    // Prepare and send the response
    const responseData = {
      group: {
        name: group.name,
        members: groupMembers
      },
      alreadyInGroup,
      membersNotFound
    };

    res.status(200).json({ data: responseData, refreshedTokenMessage: res.locals.refreshedTokenMessage });


  } catch (error) {
    res.status(500).json({error: error.message});
  }
};



/**
 * Return all the groups
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having a string attribute for the `name` of the group
    and an array for the `members` of the group
  - Optional behavior:
    - empty array is returned if there are no groups
 */
export const getGroups = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: "Admin" })

    if (adminAuth.authorized) {
      // Retrieve all groups
      const groups = await Group.find();

      // Prepare the response data
      const responseData = groups.map(group => ({
        name: group.name,
        members: group.members.map(member => member.email)
      }));

      // Send the response with the data
      res.status(200).json({ data: responseData, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error: adminAuth.cause })
    }

  } catch (error) {
    res.status(500).json({error: error.message});
  }
};


/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 400 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
  try {
    const { name } = req.params;

    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(400).json({ error: "The group does not exist" });
    }

    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: group.members.map(member => member.email) })

    // Check authorization
    if (adminAuth.authorized || groupAuth.authorized) {
      // Prepare and send the response
      const responseData = {
        name: group.name,
        members: group.members.map(member => member.email)
      };

      return res.status(200).json({ data: responseData, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error: groupAuth.cause })
    }
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

/**
 * Add new members to a group
  - Request Body Content: An array of strings containing the emails of the members to add to the group
  - Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include the new members as well as the old ones), 
    an array that lists the `alreadyInGroup` members (members whose email is already present in a group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - error 400 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
  try {
    const name = req.params.name;
    
    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(400).json({ error: 'There is no Group with this name' });
    }
    // Check for incomplete request body
    if (!('memberEmails' in req.body)) {
      return res.status(400).json({ error: "Incomplete request body" });
    }
    const { memberEmails } = req.body;
    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: group.members.map(member => member.email) })
    const route = req.path;

    // Check authorization
    if ((adminAuth.authorized && route === `/groups/${name}/insert`) || (groupAuth.authorized && route === `/groups/${name}/add`)) {

      const membersNotFound = [];
      const alreadyInGroup = [];
      const validMembers = [];
      // Check if at least one of the member emails is not in a valid email format or empty
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validFormatCheck = memberEmails.every(email => emailRegex.test(email));
      if (!validFormatCheck) {
        return res.status(400).json({ error: "Invalid memberEmail format" });
      }

      for (let email of memberEmails) {
        email = email.trim();
        // Check if all memberEmails exist and are not already in a group
        const user = await User.findOne({ email });
        if (!user) {
          membersNotFound.push(email);
        } else {
          const isInGroup = await Group.exists({ 'members.email': email });
          if (isInGroup) {
            alreadyInGroup.push(email);
          } else {
            validMembers.push({ email, user });
          }
        }
      }
      if (memberEmails.length === membersNotFound.length + alreadyInGroup.length) {
        return res.status(400).json({ error: 'Member emails either do not exist or are already in a group' });
      }

      const newGroupMembers = [...group.members, ...validMembers];
      const groupUpdate = {
        name: name,
        members : newGroupMembers
      }
      await Group.updateOne({name: name}, groupUpdate)
      // Save the updated group
      

      // Prepare the response data
      const responseData = {
        group: {
          name: groupUpdate.name,
          members: groupUpdate.members.map(member => member.email)
        },
        alreadyInGroup,
        membersNotFound
      };

      res.status(200).json({ data: responseData, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error: groupAuth.cause })
    }
  } catch (error) {
    res.status(500).json({error: error.message});
  }
};

/**
 * Remove members from a group
  -Request Body Content: A list of strings equal to the `emails` of the users to be removed
  -Response `data` Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - error 400 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {
    const name = req.params.name;
    // Find the group by name and populate the 'members' field with 'User' model data
    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(400).json({ error: 'There is no Group with this name' });
    }
    
    // Check for incomplete request body
    if (!('memberEmails' in req.body)) {
      return res.status(400).json({ error: "Incomplete request body" });
    }
    let { memberEmails } = req.body;
    memberEmails = memberEmails.map((e) => e.trim())

    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: group.members.map(member => member.email) })
    const route = req.path;

    // Check authorization
    if ((adminAuth.authorized && route === `/groups/${name}/pull`) || (groupAuth.authorized && route === `/groups/${name}/remove`)) {

      const groupMembers = group.members.map(member => member.email);
      // Check if at least one of the member emails is not in a valid email format or empty
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validFormatCheck = memberEmails.every(email => emailRegex.test(email));
      if (!validFormatCheck) {
        return res.status(400).json({ error: "Invalid memberEmail format" });
      }

      // Check if the group contains only one member
      if (groupMembers.length === 1) {
        return res.status(400).json({ error: "You cannot remove the last member of the group!" });
      }

      // Fetch all users email from the database
      const allUserEmails = (await User.find()).map(user => user.email);

      // Check if all the member emails exist and are in the group
      const notInGroup = memberEmails.filter(email => !groupMembers.includes(email) && allUserEmails.includes(email));
      const membersNotFound = memberEmails.filter(email => !allUserEmails.includes(email));

      // Check if all memberEmails exist and are in the group
      if (memberEmails.length === membersNotFound.length + notInGroup.length) {
        return res.status(400).json({ error: 'Member emails either do not exist or are not in the group' });
      }

      // Check if all the emails in the group are in the list to be removed
      const allGroupMembersRemoved = groupMembers.every(member => memberEmails.includes(member));

      // Remove members from the group
      let remainingMembers;
      if (allGroupMembersRemoved) {
        remainingMembers = group.members.slice(0, 1); // Keep the first member
      } else {
        remainingMembers = group.members.filter(member => !memberEmails.includes(member.email));
      }

      const groupUpdate = {
        name: name,
        members : remainingMembers
      }
      await Group.updateOne({name: name}, groupUpdate)
      

      const responseData = {
        group: {
          name: groupUpdate.name,
          members: groupUpdate.members.map(member => member.email)
        },
        notInGroup,
        membersNotFound
      };

      res.status(200).json({ data: responseData, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error: groupAuth.cause })
    }
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}

/**
 * Delete a user
  - Request Parameters: None
  - Request Body Content: A string equal to the `email` of the user to be deleted
  - Response `data` Content: An object having an attribute that lists the number of `deletedTransactions` and a boolean attribute that
    specifies whether the user was also `deletedFromGroup` or not.
  - Optional behavior:
    - error 400 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    if (adminAuth.authorized) {
      // Check for incomplete request body
      if (!('email' in req.body)) {
        return res.status(400).json({ error: "Incomplete request body" });
      }
      let { email } = req.body;
      email = email.trim();
      // Check if  the member email is not in a valid email format or empty
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validFormatCheck = emailRegex.test(email);
      if (!validFormatCheck) {
        return res.status(400).json({ error: "Invalid memberEmail format" });
      }
      let deletedFromGroup = false;
      // Find the user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: 'User does not exist' });
      }

      // Check if the user is an admin
      if (user.role === "Admin") {
        return res.status(400).json({ error: 'You cannot delete an Admin' });
      }

      // Delete the user
      await User.deleteOne({ username: user.username });

      // Remove the user from his group
      const group = await Group.findOne({ "members.email": email });
      if (group) {
        if (group.members.length === 1) {
          await Group.deleteOne({ name: group.name })
        } else {
          group.members = group.members.filter(member => member.email !== email);
          const groupUpdate = {
            name: group.name,
            members : group.members
          }
          await Group.updateOne({name: group.name}, groupUpdate)
        }
        deletedFromGroup = true;
      }

      //Delete associated transactions
      const deletedTransactions = await transactions.deleteMany({ username: user.username });

      // Prepare the response data
      const responseData = {
        deletedTransactions: deletedTransactions.deletedCount,
        deletedFromGroup: deletedFromGroup
      };

      return res.status(200).json({ data: responseData, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error: adminAuth.cause })
    }
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}
/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 400 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    if (adminAuth.authorized) {
      
    // Check for incomplete request body
    if (!('name' in req.body)) {
      return res.status(400).json({ error: "Incomplete request body" });
    }
    let { name } = req.body;
    name = name.trim();

    // Check for empty strings
    if (name.length === 0) {
      return res.status(400).json({ error: "Empty fields are not allowed" });
    }
      const group = await Group.findOne({ name });
      if (!group) {
        return res.status(400).json({ error: 'Group does not exist' });
      }

      await Group.deleteOne({ name: group.name });

      return res.status(200).json({ data: { message: "Group deleted successfully" }, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } else {
      return res.status(401).json({ error: adminAuth.cause })
    }
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}