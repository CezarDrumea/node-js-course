export const JWT_SECRET = 'supersecret';
export const JWT_EXPIRES_IN = '1h';
export const TOKEN_COOKIE_NAME = 'token';

export const tokenCookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // secure: true,
    // maxAge: 1000 * 60 * 60
};