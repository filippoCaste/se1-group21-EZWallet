import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { handleDateFilterParams, verifyAuth, handleAmountFilterParams } from '../controllers/utils';
import { error } from 'console';

describe("handleDateFilterParams", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})

jest.mock('jsonwebtoken');

describe('verifyAuth', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            cookies: {
                accessToken: 'validAccessToken',
                refreshToken: 'validRefreshToken'
            }
        };
        res = {
            locals: {},
            cookie: jest.fn()
        };
        jwt.verify.mockImplementation((token) => {
            if (token === 'validAccessToken') {
                return { username: 'user1', email: 'user1@example.com', role: 'Regular' };
            } else if (token === 'validRefreshToken') {
                return { username: 'user1', email: 'user1@example.com', role: 'Regular' };
            }
            if (token === 'validAccessTokenAdmin') {
                return { username: 'user1', email: 'user1@example.com', role: 'Admin' };
            } else if (token === 'validRefreshTokenAdmin') {
                return { username: 'user1', email: 'user1@example.com', role: 'Admin' };
            }
            if (token === 'badAccessToken') {
                return { username: '', email: 'user1@example.com', role: 'Regular' };
            } else if (token === 'badRefreshToken') {
                return { username: '', email: 'user1@example.com', role: 'Regular' };
            }
            throw new Error('Invalid token');
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return authorized false and cause Unauthorized if one of the token is missing', () => {
        req.cookies = {};
        const info = { authType: 'Simple' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Unauthorized' });
    });

    test('should return authorized false and cause Token is missing information if one of the access token information is missing', () => {
        req.cookies = { accessToken: "badAccessToken", refreshToken: "validRefreshToken" };
        const info = { authType: 'Simple' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Token is missing information' });
    });

    test('should return authorized false and cause Token is missing information if one of the refresh token information is missing', () => {
        req.cookies = { accessToken: "validAccessToken", refreshToken: "badRefreshToken" };
        const info = { authType: 'Simple' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Token is missing information' });
    });

    test('should return authorized false and cause Mismatched users if a field of the AToken is not equal to the same field of the RToken', () => {
        req.cookies = { accessToken: "validAccessToken", refreshToken: "validRefreshTokenAdmin" };
        const info = { authType: 'Simple' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Mismatched users' });
    });

    test('should return authorized true and cause Authorized for Simple authType', () => {
        const info = { authType: 'Simple' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: true, cause: 'Authorized' });
    });

    test('should return authorized true and cause Authorized for Admin authType with valid role', () => {
        req.cookies = { accessToken: "validAccessTokenAdmin", refreshToken: "validRefreshTokenAdmin" };
        const info = { authType: 'Admin' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: true, cause: 'Authorized' });
    });

    test('should return authorized false and cause Unauthorized for Admin authType with invalid role', () => {
        const info = { authType: 'Admin' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Unauthorized' });
    });

    test('should return authorized true and cause Authorized for User authType with valid username and role', () => {
        const info = { authType: 'User', username: 'user1' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: true, cause: 'Authorized' });
    });

    test('should return authorized false and cause Unauthorized for User authType with invalid username', () => {
        const info = { authType: 'User', username: 'user2' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Unauthorized' });
    });

    test('should return authorized true and cause Authorized for Group authType with valid email', () => {
        const info = { authType: 'Group', memberEmails: ['user1@example.com', 'user2@example.com'] };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: true, cause: 'Authorized' });
    });

    test('should return authorized false and cause Unauthorized for Group authType with invalid email', () => {
        const info = { authType: 'Group', memberEmails: ['user2@example.com', 'user3@example.com'] };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Unauthorized' });
    });

    test('should return authorized false and cause Unknown auth type for unknown authType', () => {
        const info = { authType: 'Unknown' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Unknown auth type' });
    });

    test('should return authorized true and cause Authorized after refreshing the accessToken', () => {
        jwt.verify.mockImplementationOnce(() => {
            const TokenExpiredError = jest.requireActual('jsonwebtoken').TokenExpiredError;
            throw new TokenExpiredError('Token expired');
        });
        const info = { authType: 'Simple' };
        const newAccessToken = 'newAccessToken';
        jwt.sign.mockReturnValue(newAccessToken);

        const result = verifyAuth(req, res, info);

        expect(result).toEqual({ authorized: true, cause: 'Authorized' });
        expect(res.cookie).toHaveBeenCalledWith('accessToken', newAccessToken, { httpOnly: true, path: '/api', maxAge: 3600000, sameSite: 'none', secure: true });
        expect(res.locals.refreshedTokenMessage).toBe('Access token has been refreshed. Remember to copy the new one in the headers of subsequent calls');
    });

    test('should return authorized false and cause Perform login again after failing to refresh the accessToken', () => {
        jwt.verify.mockImplementation(() => {
            const TokenExpiredError = jest.requireActual('jsonwebtoken').TokenExpiredError;
            throw new TokenExpiredError('Token expired');
        });
        const info = { authType: 'Simple' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Perform login again' });
    });

    test('should return authorized false and cause Error if the refreshToken throw an unexpected error', () => {
        jwt.verify.mockImplementationOnce(() => {
            const TokenExpiredError = jest.requireActual('jsonwebtoken').TokenExpiredError;
            throw new TokenExpiredError('Token expired');
        });
        jwt.verify.mockImplementationOnce(() => {
            throw new Error();
        });

        const info = { authType: 'Simple' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Error' });
    });

    test('should return authorized false and cause Error if the accessToken throw an unexpected error', () => {

        jwt.verify.mockImplementationOnce(() => {
            throw new Error();
        });

        const info = { authType: 'Simple' };
        const result = verifyAuth(req, res, info);
        expect(result).toEqual({ authorized: false, cause: 'Error' });
    });

});


describe("handleAmountFilterParams", () => {
    test('Dummy test, change it', () => {
        expect(true).toBe(true);
    });
})
