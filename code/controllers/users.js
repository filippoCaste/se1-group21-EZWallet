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
    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    if (adminAuth.authorized) {
      const users = await User.find();
      return res.status(200).json(users);
    }
    return res.status(401).json(adminAuth.cause);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 400 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  try {
    const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })
    const reqUser = await User.findOne({ username: req.params.username });
    if (!reqUser) {
      return res.status(400).json({ error: "User not found" });
    }
    if (userAuth.authorized) {
      //User auth successful
      return res.status(200).json(await User.findOne({ refreshToken: req.cookies.refreshToken }));
    } else {
      const adminAuth = verifyAuth(req, res, { authType: "Admin" })
      if (adminAuth.authorized) {
        //Admin auth successful
        return res.status(200).json(reqUser);
      } else {
        return res.status(401).json({ error: adminAuth.cause })
      }

    }



  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

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

    const { name, memberEmails } = req.body;
    const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: memberEmails })
    // Check if a group with the same name already exists
    if (groupAuth.authorized) {
      const existingGroup = await Group.findOne({ name });
      if (existingGroup) {
        return res.status(400).json({ error: 'A group with the same name already exists.' });
      }

      // Check if all memberEmails exist and are not already in a group
      const membersNotFound = [];
      const alreadyInGroup = [];
      const validMembers = [];

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

      // Create the new group
      const group = new Group({ name });
      group.members = validMembers;


      if (membersNotFound.length + alreadyInGroup.length === memberEmails.length) {
        return res.status(400).json({ "error": { membersNotFound, alreadyInGroup } });
      }

      await group.save();

      // Prepare and send the response
      const responseData = {
        group: {
          name: group.name,
          members: group.members.map(member => member.email)
        },
        alreadyInGroup,
        membersNotFound
      };

      res.status(200).json({ data: responseData });
    } else {
      return res.status(401).json({ error: groupAuth.cause })
    }

  } catch (err) {
    res.status(500).json(err.message);
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
      res.status(200).json({ data: responseData });
    } else {
      return res.status(401).json({ error: adminAuth.cause })
    }

  } catch (err) {
    res.status(500).json(err.message);
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
    console.log(adminAuth.authorized)
    // Check authorization
    if (adminAuth.authorized || groupAuth.authorized) {
      // Prepare and send the response
      const responseData = {
        name: group.name,
        members: group.members.map(member => member.email)
      };

      res.status(200).json({ data: responseData });
    } else {
      return res.status(401).json({ error: groupAuth.cause })
    }
  } catch (err) {
    res.status(500).json(err.message);
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
    const { memberEmails } = req.body;
    // Find the group by name and populate the 'members' field with 'User' model data
    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(400).json({ error: 'There is no Group with this name' });
    }

    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: group.members.map(member => member.email) })

    // Check authorization
    if (adminAuth.authorized || groupAuth.authorized) {

      const membersNotFound = [];
      const alreadyInGroup = [];
      const validMembers = [];
      // Check if all memberEmails exist and are not already in a group
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
      if (memberEmails.length === membersNotFound.length + alreadyInGroup.length) {
        return res.status(400).json({ error: 'Member emails either do not exist or are already in the group or other groups' });
      }

      group.members = [...group.members, ...validMembers];

      // Save the updated group
      await group.save();

      // Prepare the response data
      const responseData = {
        group: {
          name: group.name,
          members: group.members.map(member => member.email)
        },
        alreadyInGroup,
        membersNotFound
      };

      res.status(200).json({ data: responseData });
    } else {
      return res.status(401).json({ error: groupAuth.cause })
    }
  } catch (err) {
    res.status(500).json(err.message);
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
    const { memberEmails } = req.body;

    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(400).json({ error: 'Group does not exist' });
    }
    const adminAuth = verifyAuth(req, res, { authType: "Admin" })
    const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: group.members.map(member => member.email) })

    // Check authorization
    if (adminAuth.authorized || groupAuth.authorized) {

      const groupMembers = group.members.map(member => member.email);

      // Fetch all users email from the database
      const allUserEmails = (await User.find()).map(user => user.email);

      // Check if all the member emails exist and are in the group
      const notInGroup = memberEmails.filter(email => !groupMembers.includes(email) && allUserEmails.includes(email));
      const membersNotFound = memberEmails.filter(email => !allUserEmails.includes(email));

      if (memberEmails.length === membersNotFound.length + notInGroup.length) {
        return res.status(400).json({ error: 'Member emails either do not exist or are not in the group' });
      }

      if (memberEmails.length === 1 && groupMembers.length === 1) {
        return res.status(400).json({ error: "You cannot remove the last member of the group!" });
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

      group.members = remainingMembers;

      // Save the updated group
      await group.save();

      // Prepare the response data
      const responseData = {
        group: {
          name: group.name,
          members: remainingMembers.map(member => member.email)
        },
        notInGroup,
        membersNotFound
      };

      res.status(200).json({ data: responseData });
    } else {
      return res.status(401).json({ error: groupAuth.cause })
    }
  } catch (err) {
    res.status(500).json(err.message)
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

    } else {
      return res.status(401).json({ error: adminAuth.cause })
    }
  } catch (err) {
    res.status(500).json(err.message)
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
    const { name } = req.body;
    
    if (adminAuth.authorized) {

    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(400).json({ error: 'Group does not exist' });
    }
    
    
    await Group.deleteOne({name: group.name});

    return res.status(200).json({message: "The group has been successfully deleted"})
    } else {
      return res.status(401).json({ error: adminAuth.cause })
    }
  } catch (err) {
    res.status(500).json(err.message)
  }
}