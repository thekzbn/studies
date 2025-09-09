// Main script for the public studies portal
import { firebase } from './firebase.js';

// DOM elements
const loadingElement = document.getElementById('loading');
const studiesGrid = document.getElementById('studiesGrid');
const emptyState = document.getElementById('emptyState');
const studyModal = document.getElementById('studyModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

// Filter elements
const tagFilters = document.querySelectorAll('.tag-filter');

// State
let allStudies = [];
let filteredStudies = [];
let activeTagFilter = 'all';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    setupEventListeners();
    await loadStudies();
}

function setupEventListeners() {
    // Filter events
    tagFilters.forEach(filter => {
        filter.addEventListener('click', () => handleTagFilter(filter));
    });

    // Modal events
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

async function loadStudies() {
    try {
        showLoading(true);
        allStudies = await firebase.getStudies();
        filteredStudies = [...allStudies];
        renderStudies();
    } catch (error) {
        console.error('Error loading studies:', error);
        showError('Failed to load studies. Please try again later.');
    } finally {
        showLoading(false);
    }
}

function showLoading(show) {
    loadingElement.style.display = show ? 'flex' : 'none';
    studiesGrid.style.display = show ? 'none' : 'grid';
    emptyState.style.display = 'none';
}

function handleTagFilter(filterElement) {
    // Update active filter
    tagFilters.forEach(f => f.classList.remove('active'));
    filterElement.classList.add('active');
    
    activeTagFilter = filterElement.dataset.tag;
    applyFilters();
}

function applyFilters() {
    filteredStudies = allStudies.filter(study => {
        const tagMatch = activeTagFilter === 'all' || study.tag === activeTagFilter;
        return tagMatch;
    });
    
    renderStudies();
}

function renderStudies() {
    if (filteredStudies.length === 0) {
        studiesGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    studiesGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    studiesGrid.innerHTML = filteredStudies.map(study => createStudyCard(study)).join('');
    
    // Add event listeners to cards
    setupCardEventListeners();
}

function createStudyCard(study) {
    const date = formatDate(study.date);
    const description = truncateDescription(study.description, 250);
    const tagClass = getTagClass(study.tag);
    
    return `
        <article class="study-card" data-tag="${study.tag}">
            <div class="study-header">
                <h3 class="study-title">${escapeHtml(study.title)}</h3>
                <span class="study-tag ${tagClass}">${study.tag}</span>
            </div>
            <p class="study-description">${escapeHtml(description)}</p>
            <div class="study-meta">
                <span class="study-date">${date}</span>
            </div>
            <div class="study-files">
                <button class="btn btn-file btn-pdf" data-action="view" data-study-id="${study.id}" data-type="pdf">📄 View PDF</button>
                <button class="btn btn-file btn-md" data-action="view" data-study-id="${study.id}" data-type="md">📝 View MD</button>
                <button class="btn btn-file btn-docx" data-action="download" data-study-id="${study.id}" data-type="docx">📘 Word</button>
            </div>
        </article>
    `;
}

function setupCardEventListeners() {
    const actionButtons = document.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', handleCardAction);
    });
}

async function handleCardAction(event) {
    const action = event.target.dataset.action;
    const studyId = event.target.dataset.studyId;
    const fileType = event.target.dataset.type;
    const study = allStudies.find(s => s.id === studyId);
    
    if (!study) return;
    
    try {
        if (action === 'view') {
            await viewStudy(study, fileType);
        } else if (action === 'download') {
            downloadStudy(study, fileType);
        }
    } catch (error) {
        console.error(`Error ${action}ing study:`, error);
        showError(`Failed to ${action} study. Please try again.`);
    }
}

async function viewStudy(study, fileType) {
    modalTitle.textContent = study.title;
    
    const fileURL = study[`${fileType}URL`];
    if (!fileURL) {
        modalBody.innerHTML = '<p>File not available.</p>';
        openModal();
        return;
    }
    
    if (fileType === 'pdf') {
        modalBody.innerHTML = `
            <iframe class="pdf-viewer" src="${fileURL}" type="application/pdf">
                <p>Unable to display PDF. <a href="${fileURL}" target="_blank">Click here to view</a></p>
            </iframe>
        `;
    } else if (fileType === 'md') {
        try {
            const response = await fetch(fileURL);
            const markdownText = await response.text();
            const htmlContent = convertMarkdownToHtml(markdownText);
            modalBody.innerHTML = `<div class="markdown-content">${htmlContent}</div>`;
        } catch (error) {
            modalBody.innerHTML = `
                <p>Unable to load markdown content. <a href="${fileURL}" target="_blank">Click here to view</a></p>
            `;
        }
    }
    
    openModal();
}

function downloadStudy(study, fileType) {
    const fileURL = study[`${fileType}URL`];
    if (!fileURL) {
        showError('File not available for download.');
        return;
    }
    
    const link = document.createElement('a');
    link.href = fileURL;
    link.download = `${study.title}.${fileType}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function openModal() {
    studyModal.classList.add('active');
    studyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    studyModal.classList.remove('active');
    studyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalBody.innerHTML = '';
}

// Utility functions
function formatDate(dateInput) {
    let date;
    if (dateInput && dateInput.toDate) {
        // Firestore timestamp
        date = dateInput.toDate();
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'string') {
        date = new Date(dateInput);
    } else {
        date = new Date();
    }
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function truncateDescription(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function getTagClass(tag) {
    const tagMap = {
        'Completely AI': 'tag-completely-ai',
        'AI enhanced': 'tag-ai-enhanced',
        'AI grammared': 'tag-ai-grammared',
        'AI cited': 'tag-ai-cited',
        'Completely me': 'tag-completely-me'
    };
    return tagMap[tag] || 'tag-completely-me';
}

function getTypeClass(fileType) {
    return `type-${fileType}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    // Simple error display - could be enhanced with a proper notification system
    alert(message);
}

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><h/g, '<h');
    html = html.replace(/<\/h([1-6])><\/p>/g, '</h$1>');
    html = html.replace(/<p><pre>/g, '<pre>');
    html = html.replace(/<\/pre><\/p>/g, '</pre>');
    
    return html;
}
