import jwt from "jsonwebtoken";
import {AppError} from "../../error/AppError";


export class AuthApple {
    private readonly clientId: string;
    private readonly teamId: string;
    private readonly keyId: string;
    private readonly privateKey: string;

    constructor(){
        this.clientId = process.env.APPLE_CLIENT_ID!;
        this.teamId = process.env.APPLE_TEAM_ID!;
        this.keyId = process.env.APPLE_KEY_ID!;
        this.privateKey = process.env.APPLE_PRIVATE_KEY!;
    }

    public async getAppleAuthentication(code: string) {
        const body = {
            client_id: this.clientId,
            client_secret: this.generateClientSecret(),
            code,
            grant_type: "authorization_code",
            redirect_uri: "https://www.tail-spot.com"
        }
        const response = await fetch("https://appleid.apple.com/auth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(body)
        })

        const data = await response.json();

        if(!response.ok) throw new AppError("Failed authentication with apple", 400);

        const decodedToken = jwt.decode(data.id_token);

        console.log(decodedToken);
    }

    private generateClientSecret(): string {
        const header = {
            alg: "ES256",
            kid: this.keyId
        }

        const payload = {
            iss: this.teamId,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 86400 * 180,
            aud: "https://appleid.apple.com",
            sub: this.clientId
        }

        return jwt.sign(payload, this.privateKey, {header, algorithm: "ES256"});
    }
}