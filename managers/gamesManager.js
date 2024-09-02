import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = process.env.NEXT_PUBLIC_BASE_URL

const headers = {
    'Content-Type': 'application/json',
    'Authorization': Cookie.get('authToken')
}

export async function generateSudoku(difficulty, num_puzzles) {
    let response = await axios.post(endpoint + "generate_sudoku",
        { difficulty, num_puzzles }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function generateCrossword(words, clues, words_per_puzzle, num_puzzles) {
    let response = await axios.post(endpoint + "generate_crossword",
        { words, clues, words_per_puzzle, num_puzzles }, {
        headers: headers
    });

    if (response) {
        return response.data;
    }
}

export async function generateNurikabe(size) {
    let response = await axios.post(endpoint + "generate_nurikabe",
        { size }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function generateWordSearch(words, num_puzzles, backwards_probability) {
    console.log(words, num_puzzles, backwards_probability)
    let response = await axios.post(endpoint + "generate_wordsearch",
        { words, num_puzzles, backwards_probability }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function generateHangman(words) {
    let response = await axios.post(endpoint + "generate_hangman",
        { words }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function scrambleWords(words) {
    let response = await axios.post(endpoint + "scramble_word",
        { words }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function generateCryptogram(phrases) {
    let response = await axios.post(endpoint + "generate_cryptogram",
        { phrases }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function generateMaze() {
    let response = await axios.get(endpoint + "generate_maze",
        {
            headers: headers
        });

    if (response) {
        return response.data;
    }
}

export async function generateMinesweeper(width, height, mines, num_puzzles) {
    let response = await axios.post(endpoint + "generate_minesweeper",
        { width, height, mines, num_puzzles }, {
        headers: headers
    });

    if (response) {
        return response.data;
    }
}

export async function generateKakuro(size) {
    let response = await axios.post(endpoint + "generate_kakuro",
        { size }, {
        headers: headers
    });

    if (response) {
        return response.data;
    }
}