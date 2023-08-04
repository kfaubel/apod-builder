# apod-builder
Fetch the Astronomy Picture of the Day

Local version uses a simple Logger.ts and SimpleImageWrite.ts that are injected by the test.ts script

The "build" option (npm run build) creates a ApodBuilder module that can be used in a larger project.

In a larger project, the Logger and ImageWriter need to be injected

The environment variable "NASA_API_KEY" must be present and have an API key retreived from https://api.nasa.gov/

To run locally:
```
$ npm run test
```
