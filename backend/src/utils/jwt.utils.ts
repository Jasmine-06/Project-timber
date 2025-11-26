import jwt from 'jsonwebtoken';
import type { IUser } from '../models/user.models';

export const generateAccessToken = ( user : Partial<IUser> ) : string => {
    try {
        const secret = process.env.ACCESS_TOKEN_SECRET || "default_secret";
        const expiresIn = "10m"
        return jwt.sign(
            {user},
            secret,
            {expiresIn}
        )
    } catch (error) {
        console.error("JWT generation error: ", error);
        throw new Error("JWT generation failed !")
    }
}


export const generateRefreshToken = ( user : Partial<IUser> ) : string => {
    try {
        const secret = process.env.REFRESH_TOKEN_SECRET !;
        const expiresIn = "30d"
        return jwt.sign(
            {user},
            secret,
            {expiresIn}
        )
    } catch (error) {
        console.error("JWT generation error: ", error);
        throw new Error("JWT generation failed !")
    }
}


type JwtPayloadWithUser = {
    user: Partial<IUser>
    iat?: number
    exp?: number
}

export const verifyAccessToken = (token: string) : Partial<IUser> | null => {
    try {
        const secret = process.env.ACCESS_TOKEN_SECRET ! ;
        const decodeJwt = jwt.verify(token,secret) as JwtPayloadWithUser;
        console.log("decoded user: ", decodeJwt.user);
        return decodeJwt.user || null;

    } catch (error) {
        console.error("Invalid access token: ", error);
        return null;
    }
}
export const verifyRefreshToken = (token: string) : Partial<IUser> | null => {
    try {
        const secret = process.env.REFRESH_TOKEN_SECRET ! ;
        const decodeJwt = jwt.verify(token,secret) as JwtPayloadWithUser;
        return decodeJwt.user || null;

    } catch (error) {
        console.error("Invalid refresh token: ", error);
        return null;
    }
}