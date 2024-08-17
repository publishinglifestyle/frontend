import Cookie from 'js-cookie';
import axios from 'axios'

const endpoint = process.env.NEXT_PUBLIC_BASE_URL

const headers = {
    'Content-Type': 'application/json',
    'Authorization': Cookie.get('authToken')
}

export async function generateSudoku(difficulty) {
    let response = await axios.post(endpoint + "generate_sudoku",
        { difficulty }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function generateCrossword(words) {
    let response = await axios.post(endpoint + "generate_crossword",
        { words }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
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

export async function generateWordSearch(words) {
    let response = await axios.post(endpoint + "generate_wordsearch",
        { words }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}

export async function generateHangman(word) {
    let response = await axios.post(endpoint + "generate_hangman",
        { word }, {
        headers: headers
    });

    if (response) {
        return response.data.response;
    }
}