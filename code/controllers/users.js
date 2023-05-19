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
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

/**
 * Return information of a specific user
  - Request Body Content: None
  - Response `data` Content: An object having attributes `username`, `email` and `role`.
  - Optional behavior:
    - error 401 is returned if the user is not found in the system
 */
export const getUser = async (req, res) => {
  try {
    const cookie = req.cookies
    if (!cookie.accessToken || !cookie.refreshToken) {
      return res.status(401).json({ message: "Unauthorized" }) // unauthorized
    }
    const username = req.params.username
    const user = await User.findOne({ refreshToken: cookie.refreshToken })
    if (!user) return res.status(401).json({ message: "User not found" })
    if (user.username !== username) return res.status(401).json({ message: "Unauthorized" })
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json(error.message)
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
    - error 401 is returned if there is already an existing group with the same name
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const createGroup = async (req, res) => {
  try {
    const { name, memberEmails } = req.body;

    // Check if a group with the same name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(401).json({ error: 'A group with the same name already exists.' });
    }

    // Check if all memberEmails exist and are not already in a group
    const membersNotFound = [];
    const alreadyInGroup = [];
    for (const email of memberEmails) {
      const user = await User.findOne({ email });
      if (!user) {
        membersNotFound.push(email);
      } else {
        const isInGroup = await Group.exists({ 'members.user': user._id });
        if (isInGroup) {
          alreadyInGroup.push(email);
        }
      }
    }

    if (membersNotFound.length === memberEmails.length || alreadyInGroup.length === memberEmails.lenght) {
      return res.status(401).json(membersNotFound, alreadyInGroup);
    }

    // Create the new group
    const group = new Group({ name });

    for (const email of memberEmails) {
      const user = await User.findOne({ email });
      group.members.push({ email, user });
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
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Return information of a specific group
  - Request Body Content: None
  - Response `data` Content: An object having a string attribute for the `name` of the group and an array for the 
    `members` of the group
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const getGroup = async (req, res) => {
  try {
    const { name } = req.params;

    // Find the currently logged-in user using the refresh token from cookies
    const refreshToken = req.cookies.refreshToken;

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(400).json("please login...");
    }

    // Find the group by name
    const group = await Group.findOne({ name });
    if (!group) {
      return res.status(401).json("The group does not exist");
    }

    let isMember = false;
    if (user.role === "Admin") {
      // Admin user can access group information without being a member
      isMember = true;
    } else {
      // Check if the user is a member of the group
      for (const member of group.members) {
        if (member.user && member.user.equals(user._id)) {
          isMember = true;
          break;
        }
      }
    }

    if (!isMember) {
      return res.status(401).json("You are not authorized to access this group");
    }

    // Prepare and send the response
    const responseData = {
      name: group.name,
      members: group.members.map(member => member.email)
    };

    res.status(200).json({ data: responseData });
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
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are already in a group
 */
export const addToGroup = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Remove members from a group
  - Request Body Content: An object having an attribute `group` (this object must have a string attribute for the `name` of the
    created group and an array for the `members` of the group, this array must include only the remaining members),
    an array that lists the `notInGroup` members (members whose email is not in the group) and an array that lists 
    the `membersNotFound` (members whose email does not appear in the system)
  - Optional behavior:
    - error 401 is returned if the group does not exist
    - error 401 is returned if all the `memberEmails` either do not exist or are not in the group
 */
export const removeFromGroup = async (req, res) => {
  try {
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
    - error 401 is returned if the user does not exist 
 */
export const deleteUser = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json(err.message)
  }
}

/**
 * Delete a group
  - Request Body Content: A string equal to the `name` of the group to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 401 is returned if the group does not exist
 */
export const deleteGroup = async (req, res) => {
  try {
  } catch (err) {
    res.status(500).json(err.message)
  }
}