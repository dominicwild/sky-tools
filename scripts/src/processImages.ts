import fs from 'fs/promises';
import path from 'path';
import axios  from 'axios';
import { v4 as uuidv4 } from 'uuid';

const INPUT_JSON_PATH = './skyData.json';
const OUTPUT_JSON_PATH = './skyDataLocal.json';
const IMAGE_OUTPUT_DIR = './downloaded_images';

export interface QuestItem {
    type: string;
    realm: string;
    questName: string;
    iconUrl: string | null;
    visualGuideUrl: string | null;
    videoGuideUrl: string | null;
}

const urlToImageMap = new Map<string, string>();

async function downloadAndSaveImage(url: string | null, outputDir: string): Promise<string | null> {
    if (!url) {
        return null;
    }

    if(urlToImageMap.has(url)) {
        console.log(`Image already downloaded for ${url}`);
        return urlToImageMap.get(url)!
    }

    try {
        console.log(`Attempting to download: ${url}`);
        const response = await axios.get<DataView<ArrayBufferLike>>(url, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const parsedUrl = new URL(url);
        let extension = path.extname(parsedUrl.pathname);

        if (!extension || extension.length < 2) {
            const contentType = response.headers['content-type'];
            if (contentType ?? contentType.startsWith('image/')) {
                extension = `.${contentType.split('/')[1].split(';')[0]}`; // e.g. .png, .jpeg
                console.warn(`URL path had no extension. Using extension from Content-Type: ${extension} for ${url}`);
            } else {
                console.warn(`Could not determine image extension for ${url}. Defaulting to .png`);
                extension = '.png'; // Fallback extension
            }
        }

        const uniqueFilename = `${uuidv4()}${extension}`;
        const outputPath = path.join(outputDir, uniqueFilename);

        await fs.writeFile(outputPath, response.data);
        console.log(`Successfully downloaded and saved to: ${outputPath}`);

        urlToImageMap.set(url, outputPath);

        return uniqueFilename;
    } catch (error: any) {
        console.error(`Error downloading image from ${url}:`, error.message);
        if (error.response) {
            console.error('Axios Error Details:', error.response?.status, error.response?.statusText);
        }
        return null;
    }
}

async function processQuestData() {
    console.log('Starting script...');

    let inputData: QuestItem[];
    try {
        const rawData = await fs.readFile(INPUT_JSON_PATH, 'utf-8');
        inputData = JSON.parse(rawData);
        console.log(`Read ${inputData.length} items from ${INPUT_JSON_PATH}`);
    } catch (error: any) {
        console.error(`Failed to read or parse input JSON file at ${INPUT_JSON_PATH}:`, error.message);
        return;
    }


    try {
        await fs.mkdir(IMAGE_OUTPUT_DIR, { recursive: true }); // Creates dir if not exists
        console.log(`Ensured image output directory exists: ${IMAGE_OUTPUT_DIR}`);
    } catch (error: any) {
        console.error(`Failed to create output directory ${IMAGE_OUTPUT_DIR}:`, error.message);
        return;
    }

    const outputData: QuestItem[] = [];
    let processedCount = 0;

    for (const item of inputData) {
        processedCount++;
        console.log(`\nProcessing item ${processedCount}/${inputData.length}: ${item.questName}`);

        const newItem: QuestItem = { ...item };

        const newIconFilename = await downloadAndSaveImage(item.iconUrl, IMAGE_OUTPUT_DIR);
        if (newIconFilename !== null) {
            newItem.iconUrl = newIconFilename;
        } else if(item.iconUrl) {
            console.warn(`Failed to download icon for "${item.questName}", keeping original URL or null.`);
        }

        const newVisualGuideFilename = await downloadAndSaveImage(item.visualGuideUrl, IMAGE_OUTPUT_DIR);
        if (newVisualGuideFilename !== null) {
            newItem.visualGuideUrl = newVisualGuideFilename;
        } else if (item.visualGuideUrl) {
            console.warn(`Failed to download visual guide for "${item.questName}", keeping original URL or null.`);
        }

        outputData.push(newItem);
    }

    try {
        const outputJsonString = JSON.stringify(outputData, null, 2);
        await fs.writeFile(OUTPUT_JSON_PATH, outputJsonString, 'utf-8');
        console.log(`\nSuccessfully wrote updated data to ${OUTPUT_JSON_PATH}`);
    } catch (error: any) {
        console.error(`Failed to write output JSON file to ${OUTPUT_JSON_PATH}:`, error.message);
    }

    console.log('Script finished.');
}

processQuestData().then(() => console.log("Finished."));