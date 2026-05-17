import axios from "axios";
import * as cheerio from "cheerio";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import type { AnyNode } from "domhandler";

const WIKI_API_URL = "https://sky-children-of-the-light.fandom.com/api.php";
const WIKI_PAGE = "Quests";
const ROOT_DIR = path.resolve(__dirname, "../..");
const SCRIPT_DIR = path.resolve(__dirname, "..");
const RAW_DATA_PATH = path.join(SCRIPT_DIR, "skyData.json");
const SCRIPT_LOCAL_DATA_PATH = path.join(SCRIPT_DIR, "skyDataLocal.json");
const APP_LOCAL_DATA_PATH = path.join(ROOT_DIR, "data/skyDataLocal.json");
const APP_QUEST_DATA_PATH = path.join(ROOT_DIR, "data/questData.ts");
const IMAGE_OUTPUT_DIR = path.join(ROOT_DIR, "public/skyImages");
const FALLBACK_HTML_PATH = path.join(SCRIPT_DIR, "mainQuestPage.html");

type QuestType = "Realm Quest" | "General Quest" | "Seasonal/Event Quest";

type QuestItem = {
    type: QuestType;
    realm: string;
    questName: string;
    iconUrl: string | null;
    visualGuideUrl: string | null;
    videoGuideUrl: string | null;
};

type AppQuestItem = QuestItem & {
    id: number;
};

type ParsedWikiResponse = {
    parse?: {
        text?: {
            "*": string;
        };
    };
};

type SyncOptions = {
    dryRun: boolean;
    useLocalHtml: boolean;
};

function normalizeQuestName(name: string): string {
    return name.replace(/\[\d+]/g, "").replace(/\s+/g, " ").trim();
}

function cleanHeading(heading: string): string {
    return heading.replace(/\[\]$/, "").trim();
}

function getQuestKey(item: Pick<QuestItem, "type" | "realm" | "questName">): string {
    return `${item.type}|${item.realm}|${normalizeQuestName(item.questName)}`;
}

function parseArgs(): SyncOptions {
    const args = new Set(process.argv.slice(2));

    return {
        dryRun: args.has("--dry-run"),
        useLocalHtml: args.has("--local-html"),
    };
}

function isQuestItem(value: unknown): value is QuestItem {
    if (!value || typeof value !== "object") {
        return false;
    }

    const item = value as Partial<Record<keyof QuestItem, unknown>>;

    return typeof item.type === "string"
        && typeof item.realm === "string"
        && typeof item.questName === "string"
        && (typeof item.iconUrl === "string" || item.iconUrl === null)
        && (typeof item.visualGuideUrl === "string" || item.visualGuideUrl === null)
        && (typeof item.videoGuideUrl === "string" || item.videoGuideUrl === null);
}

function isAppQuestItem(value: unknown): value is AppQuestItem {
    return isQuestItem(value) && typeof (value as { id?: unknown }).id === "number";
}

function isRemoteUrl(value: string | null): value is string {
    return typeof value === "string" && /^https?:\/\//.test(value);
}

function isLocalAsset(value: string | null): value is string {
    return typeof value === "string" && value.length > 0 && !isRemoteUrl(value);
}

async function readQuestArray<T extends QuestItem>(
    filePath: string,
    guard: (value: unknown) => value is T,
): Promise<T[]> {
    try {
        const rawJson = await fs.readFile(filePath, "utf-8");
        const parsed: unknown = JSON.parse(rawJson);

        if (!Array.isArray(parsed) || !parsed.every(guard)) {
            throw new Error("Unexpected quest data shape");
        }

        return parsed;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return [];
        }

        throw error;
    }
}

function parseQuestDataTs(source: string): AppQuestItem[] {
    const match = source.match(/export const questsData = ([\s\S]*) satisfies Quest\[]/);
    if (!match) {
        throw new Error("Could not find questsData export in data/questData.ts");
    }

    const parsed: unknown = Function(`return ${match[1]}`)();
    if (!Array.isArray(parsed) || !parsed.every(isAppQuestItem)) {
        throw new Error("Unexpected questsData shape in data/questData.ts");
    }

    return parsed;
}

async function readAppQuestData(): Promise<AppQuestItem[]> {
    try {
        const source = await fs.readFile(APP_QUEST_DATA_PATH, "utf-8");
        return parseQuestDataTs(source);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
            throw error;
        }

        return readQuestArray(APP_LOCAL_DATA_PATH, isAppQuestItem);
    }
}

async function fetchWikiHtml(options: SyncOptions): Promise<string> {
    if (options.useLocalHtml) {
        console.log(`Reading local HTML from ${FALLBACK_HTML_PATH}`);
        return fs.readFile(FALLBACK_HTML_PATH, "utf-8");
    }

    console.log(`Fetching ${WIKI_PAGE} from ${WIKI_API_URL}`);
    const response = await axios.get<ParsedWikiResponse>(WIKI_API_URL, {
        params: {
            action: "parse",
            page: WIKI_PAGE,
            prop: "text",
            format: "json",
            origin: "*",
        },
        headers: {
            "User-Agent": "sky-tools quest-sync",
        },
    });

    const html = response.data.parse?.text?.["*"];
    if (!html) {
        throw new Error("Wiki API response did not include parsed HTML");
    }

    return html;
}

function cloneCell($: cheerio.CheerioAPI, cell: cheerio.Cheerio<AnyNode>): cheerio.Cheerio<AnyNode> {
    const clone = cell.clone();
    clone.find(".reference").remove();
    return clone;
}

function getCellText($: cheerio.CheerioAPI, cell: cheerio.Cheerio<AnyNode>): string {
    return normalizeQuestName(cloneCell($, cell).text());
}

function getImageUrlFromCell(cell: cheerio.Cheerio<AnyNode>): string | null {
    const image = cell.find("img").first();
    const src = image.attr("data-src") ?? image.attr("src") ?? null;

    if (!src || src.startsWith("data:image/")) {
        return null;
    }

    return src;
}

function getVideoUrlFromCell(cell: cheerio.Cheerio<AnyNode>): string | null {
    return cell.find("a.external").first().attr("href") ?? null;
}

function parseQuestRow(
    $: cheerio.CheerioAPI,
    cells: cheerio.Cheerio<AnyNode>[],
    type: QuestType,
    realm: string,
    questCellIndex: number,
    visualCellIndex: number,
    videoCellIndex: number,
): QuestItem | null {
    const questCell = cells[questCellIndex];
    const questName = questCell ? getCellText($, questCell) : "";

    if (!questName || cells.length <= visualCellIndex) {
        return null;
    }

    return {
        type,
        realm,
        questName,
        iconUrl: getImageUrlFromCell(questCell),
        visualGuideUrl: getImageUrlFromCell(cells[visualCellIndex]),
        videoGuideUrl: cells[videoCellIndex] ? getVideoUrlFromCell(cells[videoCellIndex]) : null,
    };
}

function parseRealmTables($: cheerio.CheerioAPI): QuestItem[] {
    const quests: QuestItem[] = [];

    $("h3").each((_, heading) => {
        const realm = cleanHeading($(heading).text());
        const tables = $(heading).nextUntil("h3, h2", "table.article-table");

        tables.each((__, table) => {
            const headerText = $(table).find("tr").first().text().replace(/\s+/g, " ").trim();
            const hasSpiritColumn = /\bSpirit\b/.test(headerText);

            $(table).find("tr").each((___, row) => {
                const cells = $(row).find("td").toArray().map((cell) => $(cell));
                const quest = hasSpiritColumn
                    ? parseQuestRow($, cells, "Realm Quest", realm, 0, 2, 3)
                    : parseQuestRow($, cells, "Realm Quest", realm, 0, 1, 2);

                if (quest) {
                    quests.push(quest);
                }
            });
        });
    });

    return quests;
}

function findTableAfterHeading($: cheerio.CheerioAPI, headingText: string): cheerio.Cheerio<AnyNode> {
    const heading = $("h2").filter((_, element) => cleanHeading($(element).text()) === headingText).first();
    return heading.nextAll("table.article-table").first();
}

function parseGeneralTable($: cheerio.CheerioAPI): QuestItem[] {
    const quests: QuestItem[] = [];
    const table = findTableAfterHeading($, "General Quests");

    table.find("tr").each((_, row) => {
        const cells = $(row).find("td").toArray().map((cell) => $(cell));
        if (cells.length < 4) {
            return;
        }

        const quest = parseQuestRow($, cells, "General Quest", "General", 0, 2, 3);
        if (quest) {
            quests.push(quest);
        }
    });

    return quests;
}

function parseSeasonalTable($: cheerio.CheerioAPI): QuestItem[] {
    const quests: QuestItem[] = [];
    const table = findTableAfterHeading($, "Seasonal and Special Event Quests");

    table.find("tr").each((_, row) => {
        const cells = $(row).find("td").toArray().map((cell) => $(cell));
        let quest: QuestItem | null = null;

        if (cells.length >= 4) {
            quest = parseQuestRow($, cells, "Seasonal/Event Quest", "Seasonal/Event", 1, 2, 3);
        } else if (cells.length === 3) {
            quest = parseQuestRow($, cells, "Seasonal/Event Quest", "Seasonal/Event", 0, 1, 2);
        }

        if (quest) {
            quests.push(quest);
        }
    });

    return quests;
}

function parseWikiQuests(html: string): QuestItem[] {
    const $ = cheerio.load(html);
    const quests = [
        ...parseRealmTables($),
        ...parseGeneralTable($),
        ...parseSeasonalTable($),
    ];
    const seenKeys = new Set<string>();

    return quests.filter((quest) => {
        const key = getQuestKey(quest);
        if (seenKeys.has(key)) {
            return false;
        }

        seenKeys.add(key);
        return true;
    });
}

function buildRemoteAssetMap(rawQuests: QuestItem[], localQuests: QuestItem[]): Map<string, string> {
    const localByKey = new Map(localQuests.map((quest) => [getQuestKey(quest), quest]));
    const map = new Map<string, string>();

    for (const rawQuest of rawQuests) {
        const localQuest = localByKey.get(getQuestKey(rawQuest));
        if (!localQuest) {
            continue;
        }

        if (isRemoteUrl(rawQuest.iconUrl) && isLocalAsset(localQuest.iconUrl)) {
            map.set(rawQuest.iconUrl, localQuest.iconUrl);
        }

        if (isRemoteUrl(rawQuest.visualGuideUrl) && isLocalAsset(localQuest.visualGuideUrl)) {
            map.set(rawQuest.visualGuideUrl, localQuest.visualGuideUrl);
        }
    }

    return map;
}

function getImageExtension(url: string, contentType?: string): string {
    const pathname = new URL(url).pathname;
    const extension = path.extname(pathname);
    if (extension) {
        return extension;
    }

    if (contentType?.startsWith("image/")) {
        return `.${contentType.split("/")[1].split(";")[0]}`;
    }

    return ".png";
}

async function downloadImage(url: string, assetMap: Map<string, string>): Promise<string> {
    const existingFilename = assetMap.get(url);
    if (existingFilename) {
        return existingFilename;
    }

    const response = await axios.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
        timeout: 15000,
        headers: {
            "User-Agent": "sky-tools quest-sync",
        },
    });
    const contentType = response.headers["content-type"];
    const filename = `${crypto.createHash("sha1").update(url).digest("hex").slice(0, 16)}${getImageExtension(url, contentType)}`;
    const outputPath = path.join(IMAGE_OUTPUT_DIR, filename);

    await fs.mkdir(IMAGE_OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputPath, Buffer.from(response.data));
    assetMap.set(url, filename);

    return filename;
}

async function localizeNewQuestAssets(quest: QuestItem, assetMap: Map<string, string>): Promise<QuestItem> {
    const iconUrl = isRemoteUrl(quest.iconUrl)
        ? await downloadImage(quest.iconUrl, assetMap)
        : quest.iconUrl;
    const visualGuideUrl = isRemoteUrl(quest.visualGuideUrl)
        ? await downloadImage(quest.visualGuideUrl, assetMap)
        : quest.visualGuideUrl;

    return {
        ...quest,
        iconUrl,
        visualGuideUrl,
    };
}

function withoutIds(quests: AppQuestItem[]): QuestItem[] {
    return quests.map(({ id: _id, ...quest }) => quest);
}

function toAppQuestDataSource(quests: AppQuestItem[]): string {
    return `import {Quest} from "@/components/QuestTracker";\n\nexport const questsData = ${JSON.stringify(quests, null, 4)} satisfies Quest[]\n`;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
    await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

async function main(): Promise<void> {
    const options = parseArgs();
    const [existingAppQuests, rawScriptQuests, localScriptQuests] = await Promise.all([
        readAppQuestData(),
        readQuestArray(RAW_DATA_PATH, isQuestItem),
        readQuestArray(SCRIPT_LOCAL_DATA_PATH, isQuestItem),
    ]);
    const wikiHtml = await fetchWikiHtml(options);
    const wikiQuests = parseWikiQuests(wikiHtml);
    const existingKeys = new Set(existingAppQuests.map(getQuestKey));
    const rawScriptKeys = new Set(rawScriptQuests.map(getQuestKey));
    const newRawQuests = wikiQuests.filter((quest) => !existingKeys.has(getQuestKey(quest)));
    const rawScriptQuestsToAdd = wikiQuests.filter((quest) => !rawScriptKeys.has(getQuestKey(quest)));
    const remoteAssetMap = buildRemoteAssetMap(rawScriptQuests, [
        ...localScriptQuests,
        ...existingAppQuests,
    ]);

    console.log(`Existing app quests: ${existingAppQuests.length}`);
    console.log(`Wiki quests parsed: ${wikiQuests.length}`);
    console.log(`New quests found: ${newRawQuests.length}`);

    for (const quest of newRawQuests) {
        console.log(`- ${quest.type} / ${quest.realm}: ${quest.questName}`);
    }

    if (options.dryRun || newRawQuests.length === 0) {
        if (options.dryRun) {
            console.log("Dry run complete; no files were changed.");
        }
        return;
    }

    const localizedNewQuests = await Promise.all(
        newRawQuests.map((quest) => localizeNewQuestAssets(quest, remoteAssetMap)),
    );
    const nextAppQuests = [
        ...existingAppQuests,
        ...localizedNewQuests.map((quest, index) => ({
            ...quest,
            id: existingAppQuests.length + index,
        })),
    ];
    const nextRawScriptQuests = [
        ...rawScriptQuests,
        ...rawScriptQuestsToAdd,
    ];

    await Promise.all([
        writeJson(RAW_DATA_PATH, nextRawScriptQuests),
        writeJson(SCRIPT_LOCAL_DATA_PATH, withoutIds(nextAppQuests)),
        writeJson(APP_LOCAL_DATA_PATH, nextAppQuests),
        fs.writeFile(APP_QUEST_DATA_PATH, toAppQuestDataSource(nextAppQuests), "utf-8"),
    ]);

    console.log("Quest data sync complete.");
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
