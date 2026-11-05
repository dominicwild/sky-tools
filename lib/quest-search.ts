import {normalizeQuestTitle} from "./daily-quest-source";
import type {Quest} from "./quest-types";

const RESULT_LIMIT = 8;
const FILLER_WORDS = new Set(["a", "an", "and", "at", "by", "for", "from", "in", "of", "on", "the", "to", "with"]);
const MATCH_SCORES = {
    exact: 4,
    prefix: 3,
    partial: 2,
    typo: 1,
};
const SEARCHABLE_FIELDS: { field: "questName" | "realm" | "type", weight: number }[] = [
    {field: "questName", weight: 1},
    {field: "realm", weight: 0.6},
    {field: "type", weight: 0.3},
];
const WHOLE_PHRASE_BONUS = 5;

export type HighlightPart = {
    text: string
    isMatch: boolean
};

type RankedQuest = {
    quest: Quest
    matchedWordCount: number
    score: number
    index: number
};

export function searchQuests(quests: Quest[], query: string) {
    const queryWords = getQueryWords(query);
    if (queryWords.length === 0) {
        return [];
    }

    const requiredWordCount = queryWords.length - Math.floor(queryWords.length / 3);
    const normalizedQuery = normalizeQuestTitle(query);

    return quests
        .map((quest, index) => rankQuest(quest, index, queryWords, normalizedQuery))
        .filter((rankedQuest) => rankedQuest.matchedWordCount >= requiredWordCount)
        .sort((left, right) => (
            right.matchedWordCount - left.matchedWordCount
            || right.score - left.score
            || left.index - right.index
        ))
        .slice(0, RESULT_LIMIT)
        .map((rankedQuest) => rankedQuest.quest);
}

export function getHighlightParts(text: string, query: string): HighlightPart[] {
    const queryWords = getQueryWords(query);

    return text
        .split(/([\p{L}\p{N}]+)/u)
        .filter(Boolean)
        .map((part) => ({
            text: part,
            isMatch: queryWords.some((queryWord) => getWordMatchScore(queryWord, normalizeQuestTitle(part)) > 0),
        }));
}

function getQueryWords(query: string) {
    const words = getWords(query);
    const meaningfulWords = words.filter((word) => !FILLER_WORDS.has(word));

    return meaningfulWords.length > 0 ? meaningfulWords : words;
}

function getWords(text: string) {
    return normalizeQuestTitle(text).split(" ").filter(Boolean);
}

function rankQuest(quest: Quest, index: number, queryWords: string[], normalizedQuery: string): RankedQuest {
    const fieldWords = SEARCHABLE_FIELDS.map(({field, weight}) => ({
        weight,
        words: getWords(quest[field]),
    }));
    const wordScores = queryWords.map((queryWord) => Math.max(
        ...fieldWords.flatMap(({weight, words}) => words.map((word) => getWordMatchScore(queryWord, word) * weight)),
    ));
    const phraseBonus = normalizeQuestTitle(quest.questName).includes(normalizedQuery) ? WHOLE_PHRASE_BONUS : 0;

    return {
        quest,
        index,
        matchedWordCount: wordScores.filter((score) => score > 0).length,
        score: wordScores.reduce((total, score) => total + score, phraseBonus),
    };
}

function getWordMatchScore(queryWord: string, word: string) {
    if (word === queryWord) {
        return MATCH_SCORES.exact;
    }

    if (word.startsWith(queryWord)) {
        return MATCH_SCORES.prefix;
    }

    if (queryWord.length >= 3 && word.includes(queryWord)) {
        return MATCH_SCORES.partial;
    }

    if (isTypoOf(queryWord, word)) {
        return MATCH_SCORES.typo;
    }

    return 0;
}

function isTypoOf(queryWord: string, word: string) {
    if (queryWord.length < 4) {
        return false;
    }

    const allowedEdits = queryWord.length >= 8 ? 2 : 1;

    return getEditDistance(queryWord, word) <= allowedEdits
        || getEditDistance(queryWord, word.slice(0, queryWord.length)) <= allowedEdits;
}

function getEditDistance(left: string, right: string) {
    let previousRow = Array.from({length: right.length + 1}, (_, index) => index);

    for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
        const currentRow = [leftIndex];

        for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
            const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
            currentRow.push(Math.min(
                previousRow[rightIndex] + 1,
                currentRow[rightIndex - 1] + 1,
                previousRow[rightIndex - 1] + substitutionCost,
            ));
        }

        previousRow = currentRow;
    }

    return previousRow[right.length];
}
