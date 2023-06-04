import { type } from "os";
import { categories, transactions } from "../models/model.js";
import { Group, User } from "../models/User.js";
import { handleDateFilterParams, handleAmountFilterParams, verifyAuth } from "./utils.js";

/*
    SLACK MESSAGE 2023-05-17
    All APIs must resolve with a specific structure, with an item that has data and message parameters: message is used only when the 
    accessToken has expired and has been refreshed successfully. This behavior is not something that happens in real applications, 
    but is just a workaround we put in place to ensure that you change your tokens after they expire on Postman. If a method's comments 
    specify that it must return a message, then this message must be placed as an attribute of the data object.
*/


/**
 * Create a new category
  - Request Body Content: An object having attributes `type` and `color`
  - Response `data` Content: An object having attributes `type` and `color`
 */
export const createCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }

        let { type, color } = req.body;
        // Check for incomplete request body
        if (!('type' in req.body) || !('color' in req.body)) {
            return res.status(400).json({ error: "Not enough parameters." });
        }
        type = type.trim();
        color = color.trim();
        if (!checkEmptyParam([type, color])) {
            return res.status(400).json({ error: "Empty parameteres are not allowed." });
        }
        // Check if a category with the same type already exists
        const existingCategory = await categories.findOne({ type: type });
        if (existingCategory) {
            return res.status(400).json({ error: "This category already exists." })
        }

        /* TO CHECK

        // check if color is valid
        let invalid = false;
        const regexp = /\#[0-9a-f]{6}/;
        if (!color.match(regexp)) {
            invalid = true;
        if (invalid) {
            return res.status(400).json({ error: "New parameters have invalid values." });
        }
        */
        const new_categories = new categories({ type, color });
        new_categories.save()
            .then(data => res.status(200).json({ data, refreshedTokenMessage: res.locals.refreshedTokenMessage }))
            .catch(err => { throw err })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Edit a category's type or color
  - Request Body Content: An object having attributes `type` and `color` equal to the new values to assign to the category
  - Response `data` Content: An object with parameter `message` that confirms successful editing and a parameter `count` that is equal to the count of transactions whose category was changed with the new type
  - Optional behavior:
    - error 400 returned if the specified category does not exist
    - error 400 is returned if new parameters have invalid values
 */
export const updateCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }
        const old_type = req.params.type
        if (!await categoryTypeExists(old_type)) {
            return res.status(400).json({ error: "The specified URL category does not exist" });
        }

        let { type, color } = req.body;
        // Check for incomplete request body
        if (!('type' in req.body) || !('color' in req.body)) {
            return res.status(400).json({ error: "Not enough parameters." });
        }
        type = type.trim();
        color = color.trim();
        if (!checkEmptyParam([type, color])) {
            return res.status(400).json({ error: "Empty parameteres are not allowed." });
        }

        if (await categoryTypeExists(type) && type !== old_type) {
            return res.status(400).json({ error: "The specified URL category already exist" });
        }


        /*
        TO CHECK
        // check if color is valid
        let invalid = false;
        const regexp = /\#[0-9a-f]{6}/;
        if (!color.match(regexp)) {
            invalid = true;
        }

        if (invalid) {
            return res.status(400).json({ error: "New parameters have invalid values" });
        }
        */
        const updateCat = {
            $set: {
                type: type,
                color: color
            },
        };

        await categories.updateOne({ type: old_type }, updateCat)

        // count of transactions
        const count = (await transactions.countDocuments({ type: type }));

        res.status(200).json({ data: { message: "Category updated", count: count }, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete a category
  - Request Body Content: An array of strings that lists the `types` of the categories to be deleted
  - Response `data` Content: An object with parameter `message` that confirms successful deletion and a parameter `count` that is equal to the count of affected transactions (deleting a category sets all transactions with that category to have `investment` as their new category)
  - Optional behavior:
    - error 400 is returned if the specified category does not exist
 */
export const deleteCategory = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause }) // unauthorized
        }
        let { types } = req.body;
        // Check for incomplete request body
        if (!('types' in req.body)) {
            return res.status(400).json({ error: "Not enough parameters." });
        }
        if (!checkEmptyParam(types)) {
            return res.status(400).json({ error: "Empty parameteres are not allowed." });
        }

        const catN = await categories.countDocuments();
        if (catN === 1) {
            return res.status(400).json({ error: "You cannot delete the remaining category." })
        }
        if (catN === 0) {
            return res.status(400).json({ error: "Missing categories to be deleted" })
        }

        const catT = types.length;
        types = types.map((t) => t.trim());
        for (let type of types) {
            if (!await categoryTypeExists(type)) {
                return res.status(400).json({ error: "The specified category does not exist." });
            }
        }

        const oldestCategoryType = await categories.findOne({}, {}, { sort: { createdAt: 1 } }).type;

        await transactions.updateMany(
            { type: { $in: types, $ne: oldestCategoryType } },
            { $set: { type: oldestCategoryType } }
        );

        if (catT === catN) {
            await categories.deleteMany({ type: { $ne: oldestCategoryType } });
        } else {
            await categories.deleteMany({ type: { $in: types } });
        }

        res.status(200).json({ data: { message: "Categories deleted", count: count }, refreshedTokenMessage: res.locals.refreshedTokenMessage });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all the categories
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `type` and `color`
  - Optional behavior:
    - empty array is returned if there are no categories
 */
export const getCategories = async (req, res) => {
    try {

        const simpleAuth = verifyAuth(req, res, { authType: "Simple" })
        if (!simpleAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }
        let data = await categories.find({})
        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color }))
        res.status(200).json({ data: filter, refreshedTokenMessage: res.locals.refreshedTokenMessage });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Create a new transaction made by a specific user
  - Request Body Content: An object having attributes `username`, `type` and `amount`
  - Response `data` Content: An object having attributes `username`, `type`, `amount` and `date`
  - Optional behavior:
    - error 400 is returned if the username or the type of category does not exist
 */
export const createTransaction = async (req, res) => {
    try {
        const usernameURL = req.params.username;
        const userAuth = verifyAuth(req, res, { authType: "User", username: usernameURL });
        if (!userAuth.authorized) {
            return res.status(401).json({ error: userAuth.cause });
        }

        // Check for incomplete request body
        if (!('username' in req.body) || !('amount' in req.body) || !('type' in req.body)) {
            return res.status(400).json({ error: "Not enough parameters." });
        }
        let { username, amount, type } = req.body;
        username = username.trim();
        amount = amount.trim();
        type = type.trim();
        if (!checkEmptyParam([username, amount, type])) {
            return res.status(400).json({ error: "Empty parameters are not allowed." });
        }
        if (!(await categoryTypeExists(type))) {
            return res.status(400).json({ error: "The provided category does not exists." });
        }
        if (username !== usernameURL) {
            return res.status(400).json({ error: "Missmatching users." });
        }
        if (!(await userExistsByUsername(username))) {
            return res.status(400).json({ error: "The provided username does not exists." });
        }
        if (!(await userExistsByUsername(usernameURL))) {
            return res.status(400).json({ error: "The provided URL username does not exists." });
        }
        const amountCheck = parseFloat(amount);
        if (isNaN(amountCheck)) {
            return res.status(400).json({ error: "Invalid amount." })
        }

        const new_transaction = new transactions({ username, amount, type });
        new_transaction.save()
            .then(data => res.status(200).json({ data: { username: data.username, amount: data.amount, type: data.type, date: data.date }, refreshedTokenMessage: res.locals.refreshedTokenMessage }))
            .catch(err => { throw err })


    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by all users
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - empty array must be returned if there are no transactions
 */
export const getAllTransactions = async (req, res) => {
    try {
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }
        /**
         * MongoDB equivalent to the query "SELECT * FROM transactions, categories WHERE transactions.type = categories.type"
         */
        transactions.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "type",
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            { $unwind: "$categories_info" }
        ]).then((result) => {
            let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
            res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
        }).catch(error => { throw (error) })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 400 is returned if the user does not exist
    - empty array is returned if there are no transactions made by the user
    - if there are query parameters and the function has been called by a Regular user then the returned transactions must be filtered according to the query parameters
 */
export const getTransactionsByUser = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        const username = req.params.username;
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        const userAuth = verifyAuth(req, res, { authType: "User", username })
        const route = req.path;

        // Check authorization
        if ((adminAuth.authorized && route === `/transactions/users/${username}`) || (userAuth.authorized && route === `/users/${username}/transactions`)) {

            if (!(await userExistsByUsername(username))) {
                return res.status(400).json({ error: "The provided URL username does not exists." });
            }
            let filterAmount = {};
            let filterDate = {};
            if (route === `/users/${username}/transactions`) {
                filterAmount = handleAmountFilterParams(req);
                filterDate = handleDateFilterParams(req);
            }
            transactions.aggregate([
                { $match: { ...filterDate, ...filterAmount } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" }
            ])
                .then((result) => {
                    let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
                    res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
                })
                .catch(error => {
                    throw error;
                });

        }
        else {
            return res.status(401).json({ error: "Unauthorized" })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by a specific user filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects
  - Optional behavior:
    - empty array is returned if there are no transactions made by the user with the specified category
    - error 400 is returned if the user or the category does not exist
 */
export const getTransactionsByUserByCategory = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        const username = req.params.username;
        const category = req.params.category;
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        const userAuth = verifyAuth(req, res, { authType: "User", username })
        const route = req.path;

        // Check authorization
        if ((adminAuth.authorized && route === `/transactions/users/${username}/category/${category}`) || (userAuth.authorized && route === `/users/${username}/transactions/category/${category}`)) {

            if (!(await userExistsByUsername(username))) {
                return res.status(400).json({ error: "The provided URL username does not exists." });
            }
            if (!(await categoryTypeExists(category))) {
                return res.status(400).json({ error: "The provided URL category does not exists." });
            }
            transactions.aggregate([
                { $match: { type: category } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" }
            ])
                .then((result) => {
                    let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
                    res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
                })
                .catch(error => {
                    throw error;
                });

        }
        else {
            return res.status(401).json({ error: adminAuth.cause })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by members of a specific group
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`
  - Optional behavior:
    - error 400 is returned if the group does not exist
    - empty array must be returned if there are no transactions made by the group
 */
export const getTransactionsByGroup = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        const name = req.params.name;
        const group = await Group.findOne({ name });
        if (!group) {
            return res.status(400).json({ error: 'There is no Group with this name' });
        }
        const memberEmails = group.members.map(member => member.email);
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: memberEmails })
        const route = req.path;

        // Check authorization
        if ((adminAuth.authorized && route === `/transactions/groups/${name}`) || (groupAuth.authorized && route === `/groups/${name}/transactions`)) {

            const membersUsernames = (await User.find({ email: { $in: memberEmails } })).map(user => user.username)
            transactions.aggregate([
                { $match: { username: { $in: membersUsernames } } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" }
            ])
                .then((result) => {
                    let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
                    res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
                })
                .catch(error => {
                    throw error;
                });
        }
        else {
            return res.status(401).json({ error: adminAuth.cause })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Return all transactions made by members of a specific group filtered by a specific category
  - Request Body Content: None
  - Response `data` Content: An array of objects, each one having attributes `username`, `type`, `amount`, `date` and `color`, filtered so that `type` is the same for all objects.
  - Optional behavior:
    - error 400 is returned if the group or the category does not exist
    - empty array must be returned if there are no transactions made by the group with the specified category
 */
export const getTransactionsByGroupByCategory = async (req, res) => {
    try {
        //Distinction between route accessed by Admins or Regular users for functions that can be called by both
        //and different behaviors and access rights
        const name = req.params.name;
        const category = req.params.category;
        const group = await Group.findOne({ name });
        if (!group) {
            return res.status(400).json({ error: 'There is no Group with this name' });
        }
        const memberEmails = group.members.map(member => member.email);
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: memberEmails })
        const route = req.path;

        // Check authorization
        if ((adminAuth.authorized && route === `/transactions/groups/${name}/category/${category}`) || (groupAuth.authorized && route === `/groups/${name}/transactions/category/${category}`)) {

            const membersUsernames = (await User.find({ email: { $in: memberEmails } })).map(user => user.username)
            transactions.aggregate([
                { $match: { username: { $in: membersUsernames }, type: category } },
                {
                    $lookup: {
                        from: "categories",
                        localField: "type",
                        foreignField: "type",
                        as: "categories_info"
                    }
                },
                { $unwind: "$categories_info" }
            ])
                .then((result) => {
                    let data = result.map(v => Object.assign({}, { username: v.username, amount: v.amount, type: v.type, date: v.date, color: v.categories_info.color }))
                    res.status(200).json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage });
                })
                .catch(error => {
                    throw error;
                });
        }
        else {
            return res.status(401).json({ error: adminAuth.cause })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete a transaction made by a specific user
  - Request Body Content: The `_id` of the transaction to be deleted
  - Response `data` Content: A string indicating successful deletion of the transaction
  - Optional behavior:
    - error 400 is returned if the user or the transaction does not exist
 */
export const deleteTransaction = async (req, res) => {
    try {
        const username = req.params.username;
        const userAuth = verifyAuth(req, res, { authType: "User", username });
        if (!userAuth.authorized) {
            return res.status(401).json({ error: userAuth.cause });
        }

        // Check for incomplete request body
        if (!('_id' in req.body)) {
            return res.status(400).json({ error: "Not enough parameters." });
        }
        let { _id } = req.body;
        _id = _id.trim();
        if (!checkEmptyParam(_id)) {
            return res.status(400).json({ error: "Empty parameteres are not allowed." });
        }
        if (!(await userExistsByUsername(username))) {
            return res.status(400).json({ error: "The provided URL username does not exists." });
        }
        const transaction = await transactions.findById(_id);
        if (!transaction) {
            return res.status(400).json({ error: "The provided id does not match with any transaction in the db." });
        }
        if (!transaction.username !== username) {
            return res.status(400).json({ error: "You cannot delete other user Transactions" });
        }
        await transactions.findByIdAndDelete(_id);
        res.status(200).json({ data: { message: "Transaction deleted" }, refreshedTokenMessage: res.locals.refreshedTokenMessage })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

/**
 * Delete multiple transactions identified by their ids
  - Request Body Content: An array of strings that lists the `_ids` of the transactions to be deleted
  - Response `data` Content: A message confirming successful deletion
  - Optional behavior:
    - error 400 is returned if at least one of the `_ids` does not have a corresponding transaction. Transactions that have an id are not deleted in this case
 */
export const deleteTransactions = async (req, res) => {
    try {

        const adminAuth = verifyAuth(req, res, { authType: "Admin" });
        if (!adminAuth.authorized) {
            return res.status(401).json({ error: adminAuth.cause });
        }

        // Check for incomplete request body
        if (!('_ids' in req.body)) {
            return res.status(400).json({ error: "Not enough parameters." });
        }
        let { _ids } = req.body;
        _ids = _ids.map((id) => id.trim());
        if (!checkEmptyParam(_ids)) {
            return res.status(400).json({ error: "Empty parameteres are not allowed." });
        }
        for(let _id of _ids){
        const transaction = await transactions.findById(_id);
        if(!transaction){
            return res.status(400).json({ error: "The provided id does not match with any transaction in the db." });
        }
        }
        for(let _id of _ids){
        const transaction = await transactions.findById(_id);
        await transactions.findByIdAndDelete(_id);
        }
        res.status(200).json({ data: { message: "Transactions deleted" }, refreshedTokenMessage: res.locals.refreshedTokenMessage })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// ----------------------------------------------------------------------------------------------
// ---------------------------------------added functions----------------------------------------
// ----------------------------------------------------------------------------------------------


/**
 * Query the database to find if a given category type exists.
 * @param {*} categoryType 
 * @returns true if it exists or false;
 */
async function categoryTypeExists(type) {

    const category = await categories.findOne({ type: type });
    if (!category) return false;
    return true;
}

/**
 * Check whether the user exists or not in the database
 * @param {*} username 
 * @returns an object containing the username and the role of the user if it exists, false otherwise.
 */
async function userExistsByUsername(username) {

    const user = await User.findOne({ username: username })
    if (!user) return false;

    return { username: user.username, role: user.role, email: user.email };
}

/**
 * Check wether there are empty parameters in the code
 * @param {*} list of inputs
 * @returns a boolean value
 */
function checkEmptyParam(inputs) {
    for (let inp of inputs) {
        if (inp.toString().trim().length === 0) {
            return false;
        }
    }
    return true;
}

