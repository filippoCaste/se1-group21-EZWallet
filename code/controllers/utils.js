import jwt from 'jsonwebtoken'
/*
    SLACK MESSAGE 2023-05-17
    the handleDateFilterParams and handleAmountFilterParams methods must return objects that can be used inside an aggregate function as part of its match stage.
    They must return an object that must be as shown in the example below:

    const matchStage = {date: {$gte: 2023-04-30T00:00:00.000Z} } 
    return matchStage

    The code example shows the date as a string, but it must actually be a Date object created starting from the parameters (in format YYYY-MM-DD). 
    Parameters used for filtering dates must go from 00:00(for $gte) or up to 23:59 (for $lte). Amount filtering simply requires integer values. 
    All specifications on the parameters for filtering dates still apply (date cannot be present if at least one of from or upTo is also present). 
    The README.md file in the code folder specifies how to set the query parameters in Postman. Query parameters are stored in req.query. 
    In case there are no query parameters the methods must return an empty object.
*/

/**
 * Handle possible date filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `date` parameter.
 *  The returned object must handle all possible combination of date filtering parameters, including the case where none are present.
 *  Example: {date: {$gte: "2023-04-30T00:00:00.000Z"}} returns all transactions whose `date` parameter indicates a date from 30/04/2023 (included) onwards
 * @throws an error if the query parameters include `date` together with at least one of `from` or `upTo`
 */
export const handleDateFilterParams = (req) => {
    const query = req.query;
    if(req.query === undefined) {
        return {};
    } else {
        console.log(query)
        let matchStage = {};
        try {
            if(query.from) {
                if (! checkDateValidity(query.from)) {
                    throw Error("The string is not a date");
                }
                const d = new Date(query.from + "T00:00:00.000Z")
                matchStage = { date: { $gte: d } }
            } 
            if(query.upTo) {
                if (! checkDateValidity(query.upTo)) {
                    throw Error("The string is not a date");
                }
                const d = new Date(query.upTo + "T23:59:59.999Z")
                matchStage.date = {...matchStage.date, $lte: d}
            }

            if(query.date) {
                if (query.upTo || query.from) {
                    throw Error("Impossible combination");
                }
                if (! checkDateValidity(query.date)) {
                    throw Error("The string is not a date");
                }
                const d1 = new Date(query.date)
                const d2 = new Date(query.date + "T23:59:59.000Z")
                matchStage.date = {$gte: d1, $lte: d2};
            }
            
        } catch(error) {
            console.log(error.message)
            throw Error(error.message);
        }
        
        return matchStage
    }
}

/**
 * Check wether the date provided is a valid date.
 * @param {*} date 
 * @returns true if it is a valid date. Otherwise, false.
 */
function checkDateValidity(date) {
    if (! date.match(/[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/)) {
        return false;
    } else {
        let [yyyy, mm, dd] = date.split('-');
        yyyy = parseInt(yyyy);
        mm = parseInt(mm);
        dd = parseInt(dd);
        if(mm > 12 || mm < 0 || dd > 31 || dd < 0 || yyyy < 0) {
            return false;
        } else {
            if(mm === 2) {
                const ily = !(yyyy & 3 || !(yyyy % 25) && yyyy & 15); //is Leap Year?
                if((ily && dd > 29) || (!ily && dd>28)) return false;
            } else if(mm === 4 || mm === 6 || mm === 9 || mm === 11) {
                if(dd > 30) return false;
            }
        }
    }
    return true;
}

// HOW TO USE VERIFYAUTH
// const simpleAuth = verifyAuth(req, res, { authType: "Simple" })
// const userAuth = verifyAuth(req, res, { authType: "User", username: req.params.username })
// const adminAuth = verifyAuth(req, res, { authType: "Admin" })
// const groupAuth = verifyAuth(req, res, {
//     authType: "Group", emails: <array of emails>})

/**
 * Handle possible authentication modes depending on `authType`
 * @param req the request object that contains cookie information
 * @param res the result object of the request
 * @param info an object that specifies the `authType` and that contains additional information, depending on the value of `authType`
 *      Example: {authType: "Simple"}
 *      Additional criteria:
 *          - authType === "User":
 *              - either the accessToken or the refreshToken have a `username` different from the requested one => error 401
 *              - the accessToken is expired and the refreshToken has a `username` different from the requested one => error 401
 *              - both the accessToken and the refreshToken have a `username` equal to the requested one => success
 *              - the accessToken is expired and the refreshToken has a `username` equal to the requested one => success
 *          - authType === "Admin":
 *              - either the accessToken or the refreshToken have a `role` which is not Admin => error 401
 *              - the accessToken is expired and the refreshToken has a `role` which is not Admin => error 401
 *              - both the accessToken and the refreshToken have a `role` which is equal to Admin => success
 *              - the accessToken is expired and the refreshToken has a `role` which is equal to Admin => success
 *          - authType === "Group":
 *              - either the accessToken or the refreshToken have a `email` which is not in the requested group => error 401
 *              - the accessToken is expired and the refreshToken has a `email` which is not in the requested group => error 401
 *              - both the accessToken and the refreshToken have a `email` which is in the requested group => success
 *              - the accessToken is expired and the refreshToken has a `email` which is in the requested group => success
 * @returns true if the user satisfies all the conditions of the specified `authType` and false if at least one condition is not satisfied
 *  Refreshes the accessToken if it has expired and the refreshToken is still valid
 */
export const verifyAuth = (req, res, info) => {
    const cookie = req.cookies
    res.locals.refreshedTokenMessage = "Refresh Token still valid"
    if (!cookie.accessToken || !cookie.refreshToken) {
        return { authorized: false, cause: "Unauthorized" };
    }
    try {
        const decodedAccessToken = jwt.verify(cookie.accessToken, process.env.ACCESS_KEY);
        const decodedRefreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY);

        if (!decodedAccessToken.username || !decodedAccessToken.email || !decodedAccessToken.role) {
            return { authorized: false, cause: "Token is missing information" }
        }
        if (!decodedRefreshToken.username || !decodedRefreshToken.email || !decodedRefreshToken.role) {
            return { authorized: false, cause: "Token is missing information" }
        }
        if (decodedAccessToken.username !== decodedRefreshToken.username || decodedAccessToken.email !== decodedRefreshToken.email || decodedAccessToken.role !== decodedRefreshToken.role) {
            return { authorized: false, cause: "Mismatched users" };
        }

        //Check if the caller has an authorized role
        return switchRoles(decodedRefreshToken, info);


    } catch (err) {
        if (err.name === "TokenExpiredError") {
            try {
                const refreshToken = jwt.verify(cookie.refreshToken, process.env.ACCESS_KEY)
                const newAccessToken = jwt.sign({
                    username: refreshToken.username,
                    email: refreshToken.email,
                    id: refreshToken.id,
                    role: refreshToken.role
                }, process.env.ACCESS_KEY, { expiresIn: '1h' })
                res.cookie('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 60 * 60 * 1000, sameSite: 'none', secure: true })
                res.locals.refreshedTokenMessage = 'Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls'
                
                //Check if the caller has an authorized role
                return switchRoles(refreshToken, info);

            } catch (err) {
                if (err.name === "TokenExpiredError") {
                    return { authorized: false, cause: "Perform login again" }
                } else {
                    return { authorized: false, cause: err.name}
                }
            }
        } else {
            return { authorized: false, cause: err.name};
        }
    }
}
/**
 * Handle possible amount filtering options in the query parameters for getTransactionsByUser when called by a Regular user.
 * @param req the request object that can contain query parameters
 * @returns an object that can be used for filtering MongoDB queries according to the `amount` parameter.
 *  The returned object must handle all possible combination of amount filtering parameters, including the case where none are present.
 *  Example: {amount: {$gte: 100}} returns all transactions whose `amount` parameter is greater or equal than 100
 */
export const handleAmountFilterParams = (req) => {
    const query = req.query;
    if (req.query === undefined) {
        return {};
    } else {
        let matchStage = {};
        try {
            let min = 0;
            let max = 99999999;
            if (query.min) {
                if (!query.min.match(/[0-9]+/)) {
                    throw Error("The input is not a number");
                }
                min = Number(query.min);
                matchStage.amount = { ...matchStage.amount, $gte: min }
            }

            if (query.max) {
                if (!query.max.match(/[0-9]+/)) {
                    throw Error("The input is not a number");
                }
                max = Number(query.max)
                matchStage.amount = { ...matchStage.amount, $lte: max }
            }

            if(query.min && query.max && min > max) {
                throw Error("Impossible combination")
            }

        } catch (error) {
            throw Error(error.message);
        }

        return matchStage;
    }
}


/**   FILTERS
 *  from. Specifies the starting date from which transactions must be retrieved.
    upTo. Specifies the final date up to which transactions must be retrieved.
    date. Specifies the date in which transactions must be retrieved.
    min. Specifies the minimum amount that transactions must have to be retrieved.
    max. Specifies the maximum amount that transactions must have to be retrieved.
 */

/**
 * @param {*} decodedRefreshToken, info 
 * @returns different authorize-cause scenarios.
 */

const switchRoles = (decodedRefreshToken, info) => {
    switch (info.authType) {
        case "Simple":
            return { authorized: true, cause: "Authorized" }
        case "Admin":
            if (decodedRefreshToken.role === "Admin")
                return { authorized: true, cause: "Authorized" }
            return { authorized: false, cause: "Unauthorized" };
        case "User":
            if (decodedRefreshToken.role === "Regular" && decodedRefreshToken.username === info.username)
                return { authorized: true, cause: "Authorized" }
            return { authorized: false, cause: "Unauthorized" };
        case "Group":
            if (info.memberEmails.includes(decodedRefreshToken.email))
                return { authorized: true, cause: "Authorized" }
            return { authorized: false, cause: "Unauthorized" };
        default:
            return { authorized: false, cause: "Unknown auth type" };
    }
}