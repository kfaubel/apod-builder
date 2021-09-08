/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from "dotenv";
import { Logger } from "./Logger";
import { SimpleImageWriter } from "./SimpleImageWriter";
import { Kache } from "./Kache";
import { ApodBuilder } from "./ApodBuilder";

async function run() {
    dotenv.config();  // Load var from .env into the environment

    const logger: Logger = new Logger("apod-builder", "verbose");
    //const cache: Kache = new Kache(logger, "apod-cache.json"); 
    const simpleImageWriter: SimpleImageWriter = new SimpleImageWriter(logger, "images");
    const apodBuilder: ApodBuilder = new ApodBuilder(logger, null, simpleImageWriter);

    const NASA_API_KEY: string | undefined = process.env.NASA_API_KEY;

    if (NASA_API_KEY === undefined) {
        logger.error("No url specified in env NASA_API_KEY");
        process.exit(1);
    }
   
    const success: boolean = await apodBuilder.CreateImages(NASA_API_KEY);

    logger.info(`test.ts: Done: ${success ? "successfully" : "failed"}`); 

    return success ? 0 : 1;
}

run();