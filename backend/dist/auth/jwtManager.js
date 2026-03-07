import jwt from 'jsonwebtoken';
export class JWTManager {
    static ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
    static REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
    // Short-lived: 15 minutes
    static ACCESS_TOKEN_EXPIRY = '15m';
    // Long-lived: 7 days
    static REFRESH_TOKEN_EXPIRY = '7d';
    static generateAccessToken(payload) {
        return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRY });
    }
    static generateRefreshToken(payload) {
        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRY });
    }
    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, this.ACCESS_TOKEN_SECRET);
        }
        catch (error) {
            throw new Error('Invalid or expired access token.');
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jwt.verify(token, this.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            throw new Error('Invalid or expired refresh token.');
        }
    }
}
