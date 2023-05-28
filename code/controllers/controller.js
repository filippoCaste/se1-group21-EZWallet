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
export const createCategory = (req, res) => {
    try {
        const cookie = req.cookies
        if (!verifyAuth(req, res, { authType: "Admin" })) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }
        let { type, color } = req.body;
        if(!type || !color) {
            return res.status(400).json({ error: "Not enough parameters." });
        } else {
            type = type.trim();
            color = color.trim();
        }
        if( ! checkEmptyParam(type, color) ) {
            return res.status(400).json({ error: "Empty parameteres are not allowed." });
        }

        // check if color is valid
        let invalid = false;
        const regexp = /\#[0-9a-f]{6}/;
        if (!color.match(regexp)) {
            invalid = true;
        }

        if (invalid) {
            return res.status(400).json({ error: "New parameters have invalid values." });
        }

        const new_categories = new categories({ type, color });
        console.log("New category created: " + type);
        new_categories.save()
            .then(data => res.json(data))
            .catch(err => { return res.status(400).json({ error: "This category already exists." }) })
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
        const cookie = req.cookies
        if (!verifyAuth(req, res, { authType: "Admin" })) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }
        const type = req.params.type;
        let color = req.body.color.toLowerCase();
        let type_new = req.body.type;

        if(!type_new || !color) {
            return res.status(400).json({ error: "Uncomplete request body." });
        } else {
            color = color.trim();
            type_new = type_new.trim();
        }
        if(! checkEmptyParam(color, type_new)) {
            return res.status(400).json({error: "Empty parameters are not allowed."});
        }
        const category_new = await categories.findOne({ type: type_new })
        const category = await categories.findOne({ type: type });
        if (category === null || category_new ) {
            return res.status(400).json({ error: "The specified category does not exist or the new category is already existing." });
        }

        // check if color is valid
        let invalid = false;
        const regexp = /\#[0-9a-f]{6}/;
        if(! color.match(regexp)) {
            invalid = true ;
        }

        if (invalid) {
            return res.status(400).json({ error: "New parameters have invalid values" });
        }

        const updateCat = {
            $set: {
                type: type_new,
                color: color
            },
        };
        const data = await categories.updateOne({ type: type}, updateCat )

        // count of transactions
        const count = (await transactions.find({type:type})).length; 

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
        const cookie = req.cookies
        if (!verifyAuth(req, res, { authType: "Admin" })) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }

        let types = req.body.types;

        if(!types || types.length === 0) {
            return res.status(400).json({ error: "Invalid input array." });
        }

        const categ = (await categories.find({})).length;
        if(categ === 1) {
            return res.status(400).json({error: "You cannot delete the remaining category."})
        }

        // count of transactions
        let count = 0;
        for (let type of types) {
            type = type.trim();
            if(! checkEmptyParam(type)) {
                return res.status(400).json({ error: "Empty strings are not allowed." });
            }
            if (! await categoryTypeExists(type)) {
                return res.status(400).json({ error: "The specified category does not exist." });
            }
        }
        const sorted = (await categories.find({}).sort({ createdAt: -1 }));
        let oldest = sorted[0];
        let i = 0;
        console.log(oldest.type);

        if(categ === types.length) {
            types = types.filter((c) => c !== oldest.type);
        }
        for (let type of types) {
            type = type.trim();
            // category deletion
            if(oldest.type === type) {
                i++;
                oldest = sorted[i];
            }
            await categories.deleteMany({type: type});
            // transactions update
            let data = await transactions.updateMany({ type: type }, { type: oldest.type });
            count += data.modifiedCount;
        }

        res.json({ data: { message: "Categories deleted", count: count }, refreshedTokenMessage: res.locals.refreshedTokenMessage});

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
        const cookie = req.cookies
        const simpleAuth = verifyAuth(req, res, { authType: "Simple" })
        if (! simpleAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }
        let data = await categories.find({})

        let filter = data.map(v => Object.assign({}, { type: v.type, color: v.color })) 
        // TODO why is this undefined?  res.locals.refreshedTokenMessage 
        res.json({ data:filter, refreshedTokenMessage: res.locals.refreshedTokenMessage });
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
        const paramUsername = req.params.username;
        const cookie = req.cookies
        const user = await userExists(cookie.refreshToken);
        const simpleAuth = verifyAuth(req, res, { authType: "Simple" })

        let { username, amount, type } = req.body;
        if(!username || !amount || !type) {
            return res.status(400).json({error: "Some parameters were not provided." })
        } else {
            username = username.trim();
            type = type.trim();
        }
        if(!checkEmptyParam(username, amount, type)) {
            return res.status(400).json({ error: "Empty parameters are not allowed." });
        }
        if ( !user || ! await categoryTypeExists(type)) {
            return res.status(400).json({ error: "Uncorrect username or category not found"});
        }
        if (!simpleAuth.authorized || (user.username !== username || user.username !== paramUsername)) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }
        let fp_amount = 0.0;
        try {
            fp_amount = parseFloat(String(amount))
        } catch(error) {
            return res.status(400).json({error: "Cannot parse to Floating point number"})
        }
        const new_transactions = new transactions({ username, amount, type });
        new_transactions.save()
            .then(data => res.json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage }))
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
        const cookie = req.cookies
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (! adminAuth.authorized) {
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
            res.json(data);
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
        const cookie = req.cookies;
        const user = await userExists(cookie.refreshToken);
        const paramUsername = req.params.username;

        if (!user || ! await userExistsByUsername(paramUsername)) {
            return res.status(400).json({ error: "User does not exist" });
        }
        try {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (adminAuth.authorized) {
                // Admin auth successful
                console.log("THIS MUST BE AN ADMIN")
                let data = await transactions.find({ username: paramUsername });
                res.json(data)
            } else {
                const userAuth = verifyAuth(req, res, { authType: "User", username: user.username })
                if (userAuth.authorized) {
                // User auth successful
                    if (paramUsername !== user.username) {
                        return res.status(400).json({ error: "You cannot access to these data" });
                    }
                    let dateFiltering = {}
                    let amountFiltering = {};
                    try {
                        dateFiltering = handleDateFilterParams(req);
                        amountFiltering = handleAmountFilterParams(req);
                        console.log(dateFiltering);
                        console.log(amountFiltering)
                    } catch(error) {
                        return res.status(400).json({error: "Errors in the query"})
                    }
                    // console.log({ username: user.username, date: {$lte: dateFiltering.date.$lte, $gte: dateFiltering.$gte} })
                    let data = [];
                    if(dateFiltering.date && amountFiltering.amount) {
                        data = await transactions.find({ username: user.username, date: dateFiltering.date, amount: amountFiltering.amount });
                    } else if(dateFiltering.date) {
                        data = await transactions.find({ username: user.username, date: dateFiltering.date });
                    } else if(amountFiltering.amount) {
                        data = await transactions.find({ username: user.username, amount: amountFiltering.amount });
                    } else {
                        data = await transactions.find({ username: user.username });
                    }
                    res.json({ data: data, refreshedTokenMessage: res.locals.refreshedTokenMessage })
                } else{
                    res.status(401).json({message: userAuth.cause})
                }
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
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
        const cookie = req.cookies;
        const user = await userExists(cookie.refreshToken);
        const paramUsername = req.params.username;
        const paramCategory = req.params.category;

        if (!username || ! await userExistsByUsername(paramUsername)) {
            return res.status(400).json({ error: "User does not exist" });
        }

        if (! await categoryTypeExists(paramCategory)) {
            return res.status(400).json({ error: "Category does not exist" });
        }

        try {
            const adminAuth = verifyAuth(req, res, { authType: "Admin" })
            if (adminAuth.authorized) {
                //Admin auth successful
                // admin
                console.log("THIS MUST BE AN ADMIN")
                let data = await transactions.find({ username: user.username, type: paramCategory });
                res.json(data)
            } else {
                const userAuth = verifyAuth(req, res, { authType: "User", username: user.username })
                if (userAuth.authorized) {
                    //User auth successful
                    if (paramUsername !== username.username) {
                        return res.status(400).json({ error: "You cannot access to these data" });
                    }
                    let data = await transactions.find({ username: user.username, type: paramCategory });
                    res.json(data)
                } else {
                    res.status(401).json({ message: userAuth.cause })
                }
            }
        } catch (error) {
            res.status(500).json({ error: error.message })
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
        const cookie = req.cookies;
        const user = await userExists(cookie.refreshToken);

        const group = await Group.findOne({ name: req.params.name });
        if(!group) {
            return res.send(400).json({message: "Group does not exist"});
        }
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: group.members.map(member => member.email) })

        if (adminAuth.authorized || groupAuth.authorized) {
            let ids = group.members.map(member => member.email)
            let usernames = (await User.find().where('email').in(ids).exec()).map((u) => u.username);
            console.log(ids)
            console.log(usernames)
            const data = await transactions.find().where('username').in(usernames).exec();
            res.json(data)
        } else {
                res.status(401).json({ error: "Unauthorized" })
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
        const cookie = req.cookies;
        const user = await userExists(cookie.refreshToken);

        const paramCategory = await categoryTypeExists(req.params.category)
        if(! paramCategory) {
            return res.send(400).json({message: "Category does not exist"})
        }

        const group = await Group.findOne({ name: req.params.name });
        if (!group) {
            return res.send(400).json({ message: "Group does not exist" });
        }
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        const groupAuth = verifyAuth(req, res, { authType: "Group", memberEmails: group.members.map(member => member.email) })

        if (adminAuth.authorized || groupAuth.authorized) {
            let ids = group.members.map(member => member.email)
            let usernames = (await User.find().where('email').in(ids).exec()).map((u) => u.username);
            console.log(ids)
            console.log(usernames)
            const data = (await transactions.find().where('username').in(usernames).exec()).filter((t) => t.type === req.params.category);
            res.json(data)
        } else {
            res.status(401).json({ error: "Unauthorized" })
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
        const cookie = req.cookies
        const user = await userExists(cookie.refreshToken);
        const simpleAuth = verifyAuth(req, res, { authType: "Simple" })
        if (! simpleAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }
        if(! user) {
            return res.status(400).json({ error: "User does not exist" });
        }
        let id = req.body._id;
        if(! id) {
            res.status(400).json({error: "Missing id."})
        } else {
            id = id.trim();
        }
        if(! checkEmptyParam(id)) {
            res.status(400).json({error: "Invalid empty id."})
        }

        let data = await transactions.deleteOne({ _id: id });

        if(data.deletedCount === 0) {
            return res.status(400).json({error: "Transaction does not exist"});
        }

        return res.json("deleted");
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
        const cookie = req.cookies
        const adminAuth = verifyAuth(req, res, { authType: "Admin" })
        if (! adminAuth.authorized) {
            return res.status(401).json({ error: "Unauthorized" }) // unauthorized
        }

        const idList = req.body;
        if (!idList || idList.length===0) {
            return res.status(400).json({message: "No ids provided"})
        }
        for(let id of idList) {
            id = id.trim();
            if (! await transactions.findOne({_id: id})){
                return res.status(400).json({ error: "Transaction does not exist" });
            }
        }

        for(let id of idList) {
            id = id.trim();
            await transactions.deleteOne({_id: id});
        }

        return res.json({message: "Deleted"});

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// ----------------------------------------------------------------------------------------------
// ---------------------------------------added functions----------------------------------------
// ----------------------------------------------------------------------------------------------
/**
 * Check whether the user exists or not in the database
 * @param {*} refreshToken 
 * @returns an object containing the username and the role of the user if it exists, false otherwise.
 */
async function userExists(refreshToken) {

    const user = await User.findOne({ refreshToken: refreshToken })
    console.log(user);
    if(!user) return false;

    return {username: user.username, role: user.role};
}

/**
 * Query the database to find if a given category type exists.
 * @param {*} categoryType 
 * @returns true if it exists or false;
 */
async function categoryTypeExists(type) {

    const category = await categories.findOne({ type: type });
    console.log(category)
    if(! category) return false;

    return true;
}

/**
 * Check whether the user exists or not in the database
 * @param {*} username 
 * @returns an object containing the username and the role of the user if it exists, false otherwise.
 */
async function userExistsByUsername(username) {

    const user = await User.findOne({ username: username })
    console.log(user);
    if (!user) return false;

    return { username: user.username, role: user.role, email:user.email };
}

/**
 * Check wether there are empty parameters in the code
 * @param {*} list of inputs
 * @returns a boolean value
 */
function checkEmptyParam(inputs) {
    for(let inp of inputs) {
        if(inp === '') {
            return false;
        }
    }
    return true;
}