/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { LoggerInterface } from "./Logger";
import { ImageWriterInterface } from "./SimpleImageWriter";
import { ApodImage } from "./ApodImage";
import { ApodData, ApodJsonData } from "./ApodData";

export class ApodBuilder {
    private logger: LoggerInterface;
    private writer: ImageWriterInterface;

    constructor(logger: LoggerInterface, writer: ImageWriterInterface) {
        this.logger = logger;
        this.writer = writer;
    }

    public async CreateImages(apiKey: string): Promise<boolean>{
        try {
            const apodData: ApodData = new ApodData(this.logger);
            const apodJson: ApodJsonData | null = await apodData.getApodData(apiKey);

            if (apodJson === null) {
                return false;
            }
            const apodImage: ApodImage = new ApodImage(this.logger);

            const result = await apodImage.getImage(apodJson);
            const fileName = "apod.jpg";
        
            if (result !== null && result.imageData !== null ) {                
                this.logger.info(`ApodBuilder: Writing: ${fileName}`);
                this.writer.saveFile(fileName, result.imageData.data);
            } else {
                this.logger.warn(`ApodBuilder: No image for: ${fileName}`);
                return false;
            }
            
        } catch (e) {
            this.logger.error(`ApodBuilder: Exception: ${e}`);
            return false;
        }

        return true;
    }
}
