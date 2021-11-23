import * as jwt from 'jsonwebtoken';

export interface Auth {
    username: string;
    password: string;
}

export function authorize(data: any) {
    const expiresIn = Date.now() + (7 * 24 * 60 * 60);
    const token = jwt.sign(data, process.env.SECRET, { expiresIn });

    return { token, expiresIn: new Date(expiresIn) };
}