import type {Quest} from "./quest-types";

export function isQuestSelected(quest: Quest, selectedQuests: Quest[]) {
    return selectedQuests.some((selectedQuest) => {
        if (quest.id !== undefined && selectedQuest.id !== undefined) {
            return quest.id === selectedQuest.id;
        }

        return selectedQuest.questName === quest.questName && selectedQuest.type === quest.type;
    });
}
