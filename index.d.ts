declare module "apod-builder";

export interface LoggerInterface {
    error(text: string): void;
    warn(text: string): void;
    log(text: string): void;
    info(text: string): void;
    verbose(text: string): void;
    trace(text: string): void;
}

export interface ImageWriterInterface {
    saveFile(fileName: string, buf: Buffer): void;
}

export declare class ApodBuilder {
    constructor(logger: LoggerInterface, writer: ImageWriterInterface);
    CreateImages(apiKey: string): Promise<boolean>
}