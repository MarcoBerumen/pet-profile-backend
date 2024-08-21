import { OAuth2Client } from "google-auth-library";


export class AuthGoogle {

    private static instance: OAuth2Client | undefined;

    private constructor(){}

    public static getInstance(): OAuth2Client {
        if(!AuthGoogle.instance) this.instance = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
        return this.instance!;
    }
}