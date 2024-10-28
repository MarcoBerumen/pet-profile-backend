import {PutObjectCommand, PutObjectCommandInput, S3Client} from "@aws-sdk/client-s3";
import {EEncodedTypes, Image} from "../models/image/Image.model";

type file = {
    src: string;
    contentType: string;
    encoded: string;
}

class S3client extends S3Client {
    constructor(){
        super({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        })
    }

}


export class S3  {
    private static client: S3Client = new S3client();
    public static url = process.env.AWS_S3_URL!;

    public static uploadFiles = async (files: Array<Express.Multer.File>, userId: string): Promise<Array<file>> => {
        let queue = [...files]
        let response: file[] = [];
        while(queue.length > 0){
            const file = queue.pop();
            if(file){
                response.push(await this.uploadFile(file, userId))
            }
        }
        return response;
    }

    public static uploadFile = async (file: Express.Multer.File, userId: string): Promise<file> => {
        const fileName = file.originalname;
        const body = file.buffer;
        const mimetype = file.mimetype;
        const key = this.getKey(fileName, userId);

        await this.putObject(body, mimetype, key);

        return {
            src: `${this.url}/${key}`,
            contentType: mimetype,
            encoded: EEncodedTypes.HTTPURL
        }

    }

    private static getKey = (name: string, userId: string) => {
        return `files/${userId}/${name}`;
    }

    private static putObject = async (body: Buffer, mimetype: string, key: string) => {
        const input: PutObjectCommandInput = {
            ACL: "public-read",
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: key,
            Body: body,
            ContentType: mimetype,
        }
        const command = new PutObjectCommand(input);
        const response = await this.client.send(command);
        console.log(response);
    }

}