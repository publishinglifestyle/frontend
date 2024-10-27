import { BACKEND_URLS } from "@/constant/urls";
import { axiosInstance } from "@/utils/axios";

export async function generateSudoku(difficulty, num_puzzles) {
    const response = await axiosInstance.post(BACKEND_URLS.game.generateSudoku,
        { difficulty, num_puzzles },
    );

    if (response) {
        return response.data.response;
    }
}

export async function generateCrossword(words, clues, words_per_puzzle, num_puzzles) {
    const response = await axiosInstance.post(BACKEND_URLS.game.generateCrossword,
        { words, clues, words_per_puzzle, num_puzzles });

    if (response) {
        return response.data;
    }
}

export async function generateNurikabe(size) {
    const response = await axiosInstance.post(BACKEND_URLS.game.generateNurikabe,
        { size });

    if (response) {
        return response.data.response;
    }
}

export async function generateWordSearch(words, num_puzzles, backwards_probability) {

    const response = await axiosInstance.post(BACKEND_URLS.game.generateWordSearch,
        { words, num_puzzles, backwards_probability }, {
    });

    if (response) {
        return response.data.response;
    }
}

export async function generateHangman(words) {
    const response = await axiosInstance.post(BACKEND_URLS.game.generateHangman,
        { words });

    if (response) {
        return response.data.response;
    }
}

export async function scrambleWords(words) {
    const response = await axiosInstance.post(BACKEND_URLS.game.generateScrambleWord,
        { words });

    if (response) {
        return response.data.response;
    }
}

export async function generateCryptogram(phrases) {
    const response = await axiosInstance.post(BACKEND_URLS.game.generateCryptogram,
        { phrases });

    if (response) {
        return response.data.response;
    }
}

export async function generateMinesweeper(width, height, mines, num_puzzles) {
    const response = await axiosInstance.post(BACKEND_URLS.game.generateMinesweeper,
        { width, height, mines, num_puzzles });

    if (response) {
        return response.data;
    }
}

export async function generateKakuro(size) {
    const response = await axiosInstance.post(BACKEND_URLS.game.generateKakuro,
        { size });

    if (response) {
        return response.data;
    }
}