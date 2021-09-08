/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios"; 
import jpeg from "jpeg-js";
import fs, { stat } from "fs";
import path from "path";
import { Stream } from "stream";
import * as pure from "pureimage";
import { ApodJsonData } from "./ApodData";
import { LoggerInterface } from "./Logger";

export interface ImageResult {
    imageType: string;
    imageData: jpeg.BufferRet | null;
}

interface AxiosResponse {
    data: Stream;
    status: number;
    statusText: string;
}

export class ApodImage {
    private logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;
    }

    // This optimized fillRect was derived from the pureimage source code: https://github.com/joshmarinacci/node-pureimage/tree/master/src
    // To fill a 1920x1080 image on a core i5, this saves about 1.5 seconds
    // x, y       - position of the rect
    // w, h       - size of the rect
    // iw         - width of the image being written into, needed to calculate index into the buffer
    // r, g, b, a - values to draw
    private myFillRect(image: Buffer, x: number, y: number, w: number, h: number, iw: number, r: number, g: number, b: number, a: number) {
        for(let i = y; i < y + h; i++) {                
            for(let j = x; j < x + w; j++) {   
                const index = (i * iw + j) * 4;     
                image[index + 0] = r; 
                image[index + 1] = g; 
                image[index + 2] = b; 
                image[index + 3] = a; 
            }
        }
    }

    public async getImage(apodJson: ApodJsonData) : Promise<ImageResult | null> {
        
        const imageHeight              = 1080; 
        const imageWidth               = 1920; 

        // Largest area for the image
        const fullPictureHeight        = imageHeight - 100;
        const fullPictureWidth         = imageWidth;
        const titleOffset              = 25;

        const backgroundColor          = "#000000";
        const titleColor               = "rgb(42,  32,  200)";  //"rgb(40,  200,  80)"; 

        const largeFont                = "72px 'OpenSans-Bold'";     // Title
        const mediumFont               = "48px 'OpenSans-Regular";   // Other text
        const smallFont                = "40px 'OpenSans-Regular'";  // Note at the bottom
        const extraSmallFont           = "30px 'OpenSans-Regular'";  // Note at the bottom

        // When used as an npm package, fonts need to be installed in the top level of the main project
        const fntBold     = pure.registerFont(path.join(".", "fonts", "OpenSans-Bold.ttf"),"OpenSans-Bold");
        const fntRegular  = pure.registerFont(path.join(".", "fonts", "OpenSans-Regular.ttf"),"OpenSans-Regular");
        const fntRegular2 = pure.registerFont(path.join(".", "fonts", "alata-regular.ttf"),"alata-regular");
        
        fntBold.loadSync();
        fntRegular.loadSync();
        fntRegular2.loadSync();

        const img = pure.make(imageWidth, imageHeight);
        const ctx = img.getContext("2d");

        // Fill the background
        ctx.fillStyle = backgroundColor;
        //ctx.fillRect(0, 0, imageWidth, imageHeight);
        this.myFillRect(img.data, 0, 0, imageWidth, imageHeight, imageWidth, 0x00, 0x00, 0x20, 0);

        try {
            let picture: jpeg.BufferRet | null = null;

            if (apodJson.hdurl !== undefined) {
                const pictureUrl = (apodJson.hdurl as string);
                this.logger.verbose(`ApodImage: hdurl: ${pictureUrl}`);
                
                // first try to download a jpg
                try {
                    const response: AxiosResponse = await axios.get(pictureUrl, {responseType: "stream"} );
                    picture = await pure.decodeJPEGFromStream(response.data);
                } catch (e) {
                    picture = null;
                }
            }

            if (picture !== null) {
                let scaledWidth = 0;
                let scaledHeight = 0;
                let pictureX = 0;
                let pictureY = 0;
                if (picture.width/picture.height > fullPictureWidth/fullPictureHeight) {
                    // Aspect ratio is wider than the full image aspect ratio, shorten the image
                    scaledWidth = fullPictureWidth;
                    scaledHeight = (fullPictureWidth * picture.height) / picture.width;
                    pictureX = 0;
                    pictureY = (fullPictureHeight - scaledHeight) / 2;

                } else {
                    // Aspect ratio is narrower than the full image aspect ration, squeeze the image width
                    scaledHeight = fullPictureHeight;
                    scaledWidth = (fullPictureHeight * picture.width) / picture.height;
                    pictureX = (fullPictureWidth - scaledWidth) / 2;    // Center the picture 
                    pictureY = 0; //Leave room for a title at the bottom
                }

                ctx.drawImage(picture,
                    0, 0, picture.width, picture.height,             // source dimensions
                    pictureX, pictureY, scaledWidth, scaledHeight  // destination dimensions
                );
            } else {
                return null;
            }
        } catch (e) {
            this.logger.warn(`NewsImage: Exception: ${e}, Picture: ${apodJson.hdurl as string}`);
            return null;
        }

        // Draw the title
        ctx.fillStyle = titleColor;
        ctx.font = mediumFont;
        const title = apodJson.title;
        const textWidth: number = ctx.measureText(title).width;
        ctx.fillText(title, (imageWidth - textWidth) / 2, imageHeight - titleOffset);

        const jpegImg = jpeg.encode(img, 80);
        
        return {
            imageData: jpegImg,
            imageType: "jpg"
        };
    }

}
