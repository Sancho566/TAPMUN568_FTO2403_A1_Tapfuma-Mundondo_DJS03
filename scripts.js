import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

function createBookElement({ author, id, image, title }) {
    const element = document.createElement('button');
    element.classList = 'preview';
    element.setAttribute('data-preview', id);

    element.innerHTML = `
        <img class="preview__image" src="${image}" />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;

    return element;
}

function appendBooksToList(bookList) {
    const fragment = document.createDocumentFragment();
    bookList.forEach(book => fragment.appendChild(createBookElement(book)));
    document.querySelector('[data-list-items]').appendChild(fragment);
}

function populateSelect(element, options, firstOptionText) {
    const fragment = document.createDocumentFragment();
    const firstElement = document.createElement('option');
    firstElement.value = 'any';
    firstElement.innerText = firstOptionText;
    fragment.appendChild(firstElement);

    for (const [id, name] of Object.entries(options)) {
        const optionElement = document.createElement('option');
        optionElement.value = id;
        optionElement.innerText = name;
        fragment.appendChild(optionElement);
    }

    element.appendChild(fragment);
}

function applyTheme(theme) {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
}

function initializeEventListeners() {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false;
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;
    });

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false;
    });

    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        applyTheme(theme);
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        matches = filterBooks(filters);
        renderBooks();
    });

    document.querySelector('[data-list-button]').addEventListener('click', () => {
        appendBooksToList(matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE));
        page += 1;
    });

    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const pathArray = Array.from(event.path || event.composedPath());
        let active = null;

        for (const node of pathArray) {
            if (active) break;
            if (node?.dataset?.preview) {
                active = books.find(book => book.id === node.dataset.preview);
            }
        }

        if (active) {
            displayBookDetails(active);
        }
    });
}

function filterBooks(filters) {
    return books.filter(book => {
        let genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        let titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        let authorMatch = filters.author === 'any' || book.author === filters.author;
        return genreMatch && titleMatch && authorMatch;
    });
}

function renderBooks() {
    page = 1;
    document.querySelector('[data-list-items]').innerHTML = '';
    appendBooksToList(matches.slice(0, BOOKS_PER_PAGE));
    document.querySelector('[data-list-button]').disabled = matches.length <= BOOKS_PER_PAGE;
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', matches.length === 0);
}

function displayBookDetails(book) {
    document.querySelector('[data-list-active]').open = true;
    document.querySelector('[data-list-blur]').src = book.image;
    document.querySelector('[data-list-image]').src = book.image;
    document.querySelector('[data-list-title]').innerText = book.title;
    document.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
    document.querySelector('[data-list-description]').innerText = book.description;
}

// Initialization
populateSelect(document.querySelector('[data-search-genres]'), genres, 'All Genres');
populateSelect(document.querySelector('[data-search-authors]'), authors, 'All Authors');

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night';
    applyTheme('night');
} else {
    document.querySelector('[data-settings-theme]').value = 'day';
    applyTheme('day');
}

appendBooksToList(matches.slice(0, BOOKS_PER_PAGE));
initializeEventListeners();
document.querySelector('[data-list-button]').innerText = `Show more (${books.length - BOOKS_PER_PAGE})`;
