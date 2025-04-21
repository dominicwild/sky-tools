import fs from "fs/promises";
import {QuestItem} from "./processImages";

const main = async () => {
    console.log("Starting writing IDs")
    const jsonString = await fs.readFile("./skyDataLocal.json", "utf-8")
    const questItems = JSON.parse(jsonString) as QuestItem[]

    console.log("Read file writing IDs");
    const newQuestItems = questItems.map((questItem: QuestItem, i) => {
        return {
        ...questItem,
            id: i
        }
    })

    const newFile = "./skyDataLocalWithIds.json"
    await fs.writeFile(newFile, JSON.stringify(newQuestItems, null, 2));
    console.log(`File written to ${newFile}`)
 }

main().then(() => console.log("Finished"))