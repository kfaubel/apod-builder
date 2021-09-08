import axios from "axios";
import { LoggerInterface } from "./Logger";

export interface ApodJsonData {
    date?: string;
    explanation?: string;            // localtime station last reported
    hdurl?: string;
    title?: string;
    url?: string;    
}

export class ApodData {
    private logger: LoggerInterface;

    constructor(logger: LoggerInterface) {
        this.logger = logger;
    }    

    public async getApodData(apiKey: string): Promise<ApodJsonData | null> { 
        const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

        // {
        //     "date": "2021-09-08",
        //     "explanation": "What surrounds the Andromeda galaxy?  ...",
        //     "hdurl": "https://apod.nasa.gov/apod/image/2109/M31WideField_Ziegenbalg_1400.jpg",
        //     "media_type": "image",
        //     "service_version": "v1",
        //     "title": "The Deep Sky Toward Andromeda",
        //     "url": "https://apod.nasa.gov/apod/image/2109/M31WideField_Ziegenbalg_960.jpg"
        // }
        
        let apodJson: ApodJsonData | null = null;

        try {
            const response = await axios.get(url, {headers: {"Content-Encoding": "gzip"}});
            apodJson = response.data as ApodJsonData;
        } catch(e) {
            this.logger.error(`ApodData: Error getting data: ${e}`);
        }

        return apodJson;
    }
}