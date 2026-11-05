import fs from "node:fs/promises";
import path from "node:path";

type AppQuest = {
    id: number;
    questName: string;
    gameQuestId?: string;
};

type GameQuest = {
    id: string;
    names: Record<string, string>;
};

const APP_LOCAL_DATA_PATH = path.resolve(__dirname, "../../data/skyDataLocal.json");

function getGameQuestsPath(): string {
    const flagIndex = process.argv.indexOf("--game-data");
    const gameDataDir = flagIndex === -1 ? undefined : process.argv[flagIndex + 1];
    if (!gameDataDir) {
        throw new Error("Pass the sky-game-data checkout with --game-data <path>");
    }

    return path.join(gameDataDir, "daily-quests.json");
}

async function readJson<T>(filePath: string): Promise<T> {
    return JSON.parse(await fs.readFile(filePath, "utf-8")) as T;
}

async function main(): Promise<void> {
    const [appQuests, gameQuests] = await Promise.all([
        readJson<AppQuest[]>(APP_LOCAL_DATA_PATH),
        readJson<GameQuest[]>(getGameQuestsPath()),
    ]);
    const englishNames = new Map(gameQuests.map((quest) => [quest.id, quest.names.en]));
    const problems: string[] = [];

    for (const quest of appQuests) {
        if (quest.gameQuestId === undefined) {
            continue;
        }

        const gameName = englishNames.get(quest.gameQuestId);
        if (gameName === undefined) {
            problems.push(`#${quest.id} links to ${quest.gameQuestId}, which the game no longer names`);
        } else if (gameName !== quest.questName) {
            problems.push(`#${quest.id} "${quest.questName}" should read "${gameName}" (${quest.gameQuestId})`);
        }
    }

    const linkedCount = appQuests.filter((quest) => quest.gameQuestId !== undefined).length;
    console.log(`${linkedCount} of ${appQuests.length} quests link to a game quest`);

    if (problems.length > 0) {
        console.log(problems.join("\n"));
        process.exit(1);
    }

    console.log("Every linked quest uses the game's wording.");
}

main().catch((error: unknown) => {
    console.error(error);
    process.exit(1);
});
