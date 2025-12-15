import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { QuestItem } from './processImages';

const INPUT_HTML_PATH = path.resolve(__dirname, '../mainQuestPage.html');
const INPUT_JSON_PATH = path.resolve(__dirname, '../skyData.json');
const OUTPUT_JSON_PATH = path.resolve(__dirname, '../skyData.json');

function getDateString(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Normalize quest name: trim and collapse all whitespace to single spaces
function normalizeQuestName(name: string): string {
    return name.replace(/\s+/g, ' ').trim();
}

// Create a unique key for matching quests
function getQuestKey(type: string, realm: string, questName: string): string {
    return `${type}|${realm}|${normalizeQuestName(questName)}`;
}

async function extractQuestData() {
    console.log('Starting extraction...');

    // 1. Load existing data
    let existingData: QuestItem[] = [];
    try {
        const rawData = await fs.readFile(INPUT_JSON_PATH, 'utf-8');
        existingData = JSON.parse(rawData);
        console.log(`Loaded ${existingData.length} existing quests.`);
    } catch (error) {
        console.warn('Could not load existing skyData.json, starting fresh.', error);
    }

    // 2. Load HTML
    let htmlContent: string;
    try {
        htmlContent = await fs.readFile(INPUT_HTML_PATH, 'utf-8');
        console.log(`Loaded HTML file: ${INPUT_HTML_PATH}`);
    } catch (error: any) {
        console.error(`Failed to read HTML file: ${error.message}`);
        return;
    }

    const $ = cheerio.load(htmlContent);
    const extractedQuests: QuestItem[] = [];

    // 3. Parse HTML
    $('h3').each((_, h3Element) => {
        const realmName = $(h3Element).find('.mw-headline').text().trim();
        if (!realmName) return;

        console.log(`Found Realm Section: ${realmName}`);

        const table = $(h3Element).nextAll('table.article-table').first();
        if (table.length === 0) {
            console.log(`No table found for realm: ${realmName}`);
            return;
        }

        table.find('tr').each((_, trElement) => {
            const tds = $(trElement).find('td');
            if (tds.length < 2) return;

            const nameTd = $(tds[0]);
            const rawQuestName = nameTd.text();
            const questName = normalizeQuestName(rawQuestName);

            const iconImg = nameTd.find('img');
            const iconUrl = iconImg.attr('data-src') || iconImg.attr('src') || null;

            const visualTd = $(tds[1]);
            const visualLink = visualTd.find('a');
            let visualGuideUrl = visualLink.attr('href') || visualTd.find('img').attr('data-src') || visualTd.find('img').attr('src') || null;

            const videoTd = $(tds[2]);
            const videoLink = videoTd.find('a');
            const videoGuideUrl = videoLink.attr('href') || null;

            if (questName) {
                extractedQuests.push({
                    type: 'Realm Quest',
                    realm: realmName,
                    questName: questName,
                    iconUrl: iconUrl,
                    visualGuideUrl: visualGuideUrl,
                    videoGuideUrl: videoGuideUrl
                });
            }
        });
    });

    console.log(`Extracted ${extractedQuests.length} quests from HTML.`);

    // 4. Compare and find NEW quests only
    // Create a set of existing quest keys for fast lookup
    const existingKeys = new Set<string>();
    for (const item of existingData) {
        existingKeys.add(getQuestKey(item.type, item.realm, item.questName));
    }

    // Find quests that are in HTML but NOT in existing data
    const newQuests: QuestItem[] = [];
    for (const quest of extractedQuests) {
        const key = getQuestKey(quest.type, quest.realm, quest.questName);
        if (!existingKeys.has(key)) {
            console.log(`NEW quest found: "${quest.questName}" in ${quest.realm}`);
            newQuests.push(quest);
        }
    }

    console.log(`Found ${newQuests.length} new quests to add.`);

    if (newQuests.length === 0) {
        console.log('No new quests to add. Exiting without changes.');
        return;
    }

    // 5. Append new quests to existing data (do NOT modify existing entries)
    const mergedData = [...existingData, ...newQuests];

    console.log(`Merged data contains ${mergedData.length} items (${existingData.length} existing + ${newQuests.length} new).`);

    // 6. Save Data
    const jsonString = JSON.stringify(mergedData, null, 2);

    await fs.writeFile(OUTPUT_JSON_PATH, jsonString, 'utf-8');
    console.log(`Updated ${OUTPUT_JSON_PATH}`);

    const dateString = getDateString();
    const datedPath = path.resolve(__dirname, `../skyData_${dateString}.json`);
    await fs.writeFile(datedPath, jsonString, 'utf-8');
    console.log(`Created ${datedPath}`);
}

extractQuestData().catch(console.error);
