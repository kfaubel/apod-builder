import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios";
import { LoggerInterface } from "./Logger";

export interface ApodJsonData {
    date?: string;
    media_type?: string;
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

        this.logger.verbose(`ApodData: Getting APOD data from: ${url}`);

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

        const options: AxiosRequestConfig = {
            headers: {
                "Content-Encoding": "gzip"
            },
            timeout: 20000
        };

        const startTime = new Date();
        await axios.get(url, options)
            .then((response: AxiosResponse) => {
                if (typeof process.env.TRACK_GET_TIMES !== "undefined" ) {
                    this.logger.info(`ApodData: GET TIME: ${new Date().getTime() - startTime.getTime()}ms`);
                }
                apodJson = response.data as ApodJsonData;
            })
            .catch((error: AxiosError) => {
                this.logger.warn(`ApodData: GET error: ${error}`);
            }); 

        return apodJson;
    }
}