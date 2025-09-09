// Dashboard script for the studies portal
import { supabaseService } from './supabase.js';

// Configuration
const DASHBOARD_PASSCODE = 'StudiesAdmin2025!'; // Change this passcode!

// DOM elements - Passcode Gate
const passcodeGate = document.getElementById('passcodeGate');
const passcodeForm = document.getElementById('passcodeForm');
const passcodeInput = document.getElementById('passcodeInput');
const passcodeError = document.getElementById('passcodeError');

// DOM elements - Dashboard
const dashboard = document.getElementById('dashboard');
const logoutBtn = document.getElementById('logoutBtn');

// DOM elements - Upload Form
const uploadForm = document.getElementById('uploadForm');
const studyTitle = document.getElementById('studyTitle');
const studyDescription = document.getElementById('studyDescription');
const studyTag = document.getElementById('studyTag');
const studyPdf = document.getElementById('studyPdf');
const studyMd = document.getElementById('studyMd');
const studyDocx = document.getElementById('studyDocx');
const studyDate = document.getElementById('studyDate');
const uploadBtn = document.getElementById('uploadBtn');

// DOM elements - Management
const refreshBtn = document.getElementById('refreshBtn');
const bulkDownloadBtn = document.getElementById('bulkDownloadBtn');
const studiesList = document.getElementById('studiesList');

// DOM elements - Edit Modal
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editStudyId = document.getElementById('editStudyId');
const editTitle = document.getElementById('editTitle');
const editDescription = document.getElementById('editDescription');
const editTag = document.getElementById('editTag');
const editDate = document.getElementById('editDate');
const editModalClose = document.getElementById('editModalClose');
const editCancelBtn = document.getElementById('editCancelBtn');

// DOM elements - Notification
const notification = document.getElementById('notification');

// State
let allStudies = [];
let isAuthenticated = false;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
});

function initializeDashboard() {
    setupEventListeners();
    checkAuthentication();
}

function setupEventListeners() {
    // Passcode events
    passcodeForm.addEventListener('submit', handlePasscodeSubmit);
    logoutBtn.addEventListener('click', logout);

    // Upload events
    uploadForm.addEventListener('submit', handleUploadSubmit);
    
    // Management events
    refreshBtn.addEventListener('click', loadStudies);
    bulkDownloadBtn.addEventListener('click', handleBulkDownload);

    // Edit modal events
    editForm.addEventListener('submit', handleEditSubmit);
    editModalClose.addEventListener('click', closeEditModal);
    editCancelBtn.addEventListener('click', closeEditModal);

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    studyDate.value = today;
}

function checkAuthentication() {
    // Check if already authenticated in this session
    isAuthenticated = sessionStorage.getItem('studies_authenticated') === 'true';
    
    if (isAuthenticated) {
        showDashboard();
    } else {
        showPasscodeGate();
    }
}

function handlePasscodeSubmit(event) {
    event.preventDefault();
    
    const enteredPasscode = passcodeInput.value;
    
    if (enteredPasscode === DASHBOARD_PASSCODE) {
        isAuthenticated = true;
        sessionStorage.setItem('studies_authenticated', 'true');
        showDashboard();
        passcodeError.classList.remove('active');
    } else {
        passcodeError.classList.add('active');
        passcodeInput.value = '';
        passcodeInput.focus();
    }
}

function logout() {
    isAuthenticated = false;
    sessionStorage.removeItem('studies_authenticated');
    showPasscodeGate();
    // Reset forms
    uploadForm.reset();
    allStudies = [];
    studiesList.innerHTML = '';
}

function showPasscodeGate() {
    passcodeGate.style.display = 'flex';
    dashboard.style.display = 'none';
    passcodeInput.focus();
}

async function showDashboard() {
    passcodeGate.style.display = 'none';
    dashboard.style.display = 'block';
    
    // Load studies when dashboard is shown
    await loadStudies();
}

async function handleUploadSubmit(event) {
    event.preventDefault();
    
    if (!validateUploadForm()) return;
    
    try {
        setUploadLoading(true);
        
        const pdfFile = studyPdf.files[0];
        const mdFile = studyMd.files[0];
        const docxFile = studyDocx.files[0];
        
        // Generate unique filenames
        const timestamp = Date.now();
        const pdfFileName = `${timestamp}_${pdfFile.name}`;
        const mdFileName = `${timestamp}_${mdFile.name}`;
        const docxFileName = `${timestamp}_${docxFile.name}`;
        
        // Upload all files to storage
        const [pdfURL, mdURL, docxURL] = await Promise.all([
            supabaseService.uploadFile(pdfFile, pdfFileName),
            supabaseService.uploadFile(mdFile, mdFileName),
            supabaseService.uploadFile(docxFile, docxFileName)
        ]);
        
        // Create study data
        const studyData = {
            title: studyTitle.value.trim(),
            description: studyDescription.value.trim(),
            tag: studyTag.value,
            pdfURL: pdfURL,
            mdURL: mdURL,
            docxURL: docxURL,
            date: studyDate.value ? new Date(studyDate.value) : new Date()
        };
        
        // Save to Firestore
        await supabaseService.addStudy(studyData);
        
        showNotification('Study uploaded successfully!', 'success');
        
        // Reset form and reload studies
        uploadForm.reset();
        const today = new Date().toISOString().split('T')[0];
        studyDate.value = today;
        await loadStudies();
        
    } catch (error) {
        console.error('Error uploading study:', error);
        showNotification('Failed to upload study. Please try again.', 'error');
    } finally {
        setUploadLoading(false);
    }
}

function validateUploadForm() {
    if (!studyTitle.value.trim()) {
        showNotification('Title is required', 'error');
        studyTitle.focus();
        return false;
    }
    
    if (!studyTag.value) {
        showNotification('Tag is required', 'error');
        studyTag.focus();
        return false;
    }
    
    if (!studyPdf.files[0]) {
        showNotification('PDF file is required', 'error');
        studyPdf.focus();
        return false;
    }
    
    if (!studyMd.files[0]) {
        showNotification('Markdown file is required', 'error');
        studyMd.focus();
        return false;
    }
    
    if (!studyDocx.files[0]) {
        showNotification('Word file is required', 'error');
        studyDocx.focus();
        return false;
    }
    
    // Validate file types
    const pdfFile = studyPdf.files[0];
    const mdFile = studyMd.files[0];
    const docxFile = studyDocx.files[0];
    
    if (!pdfFile.name.toLowerCase().endsWith('.pdf')) {
        showNotification('PDF file must have .pdf extension', 'error');
        studyPdf.focus();
        return false;
    }
    
    if (!mdFile.name.toLowerCase().endsWith('.md')) {
        showNotification('Markdown file must have .md extension', 'error');
        studyMd.focus();
        return false;
    }
    
    if (!docxFile.name.toLowerCase().endsWith('.docx')) {
        showNotification('Word file must have .docx extension', 'error');
        studyDocx.focus();
        return false;
    }
    
    // Check file sizes (max 10MB each)
    const maxSize = 10 * 1024 * 1024;
    if (pdfFile.size > maxSize) {
        showNotification('PDF file must be less than 10MB', 'error');
        studyPdf.focus();
        return false;
    }
    
    if (mdFile.size > maxSize) {
        showNotification('Markdown file must be less than 10MB', 'error');
        studyMd.focus();
        return false;
    }
    
    if (docxFile.size > maxSize) {
        showNotification('Word file must be less than 10MB', 'error');
        studyDocx.focus();
        return false;
    }
    
    return true;
}

function setUploadLoading(loading) {
    const btnText = uploadBtn.querySelector('.btn-text');
    const btnLoading = uploadBtn.querySelector('.btn-loading');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        uploadBtn.disabled = true;
    } else {
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        uploadBtn.disabled = false;
    }
}

async function loadStudies() {
    try {
        allStudies = await supabaseService.getStudies();
        renderStudiesList();
    } catch (error) {
        console.error('Error loading studies:', error);
        showNotification('Failed to load studies', 'error');
    }
}

function renderStudiesList() {
    if (allStudies.length === 0) {
        studiesList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No studies found</p>';
        return;
    }
    
    studiesList.innerHTML = allStudies.map(study => createStudyItem(study)).join('');
    setupStudyItemEvents();
}

function createStudyItem(study) {
    const date = formatDate(study.date);
    const tagClass = getTagClass(study.tag);
    const fileIcon = '📁'; // Generic folder icon for multi-file studies
    
    return `
        <div class="study-item" data-study-id="${study.id}">
            <div class="study-thumbnail">
                ${fileIcon}
            </div>
            <div class="study-info">
                <div class="study-info-title">${escapeHtml(study.title)}</div>
                <div class="study-info-meta">
                    <span class="study-tag-small ${tagClass}">${study.tag}</span>
                    <span>PDF + MD + DOCX</span>
                    <span>${date}</span>
                </div>
            </div>
            <div class="study-actions">
                <button class="btn btn-secondary" onclick="editStudy('${study.id}')">Edit</button>
                <button class="btn btn-accent" onclick="viewStudyFiles('${study.id}')">View Files</button>
                <button class="btn btn-danger" onclick="deleteStudy('${study.id}')">Delete</button>
            </div>
        </div>
    `;
}

function setupStudyItemEvents() {
    // Events are handled by inline onclick for simplicity in this vanilla JS implementation
    // This makes the functions available globally
    window.editStudy = editStudy;
    window.viewStudyFiles = viewStudyFiles;
    window.deleteStudy = deleteStudy;
}

async function editStudy(studyId) {
    const study = allStudies.find(s => s.id === studyId);
    if (!study) return;
    
    // Populate edit form
    editStudyId.value = studyId;
    editTitle.value = study.title;
    editDescription.value = study.description || '';
    editTag.value = study.tag;
    
    // Format date for input
    const date = study.date && study.date.toDate ? study.date.toDate() : new Date(study.date);
    editDate.value = date.toISOString().split('T')[0];
    
    openEditModal();
}

function viewStudyFiles(studyId) {
    const study = allStudies.find(s => s.id === studyId);
    if (!study) return;
    
    // Show options for viewing different files
    showNotification('Opening file options...', 'success');
    
    // Create temporary buttons for file viewing
    const fileButtons = `
        <div style="display: flex; gap: 1rem; margin: 1rem 0;">
            <a href="${study.pdfURL}" target="_blank" class="btn btn-primary">📄 View PDF</a>
            <a href="${study.mdURL}" target="_blank" class="btn btn-primary">📝 View MD</a>
            <a href="${study.docxURL}" target="_blank" class="btn btn-primary">📘 View Word</a>
        </div>
    `;
    
    // You could enhance this with a proper modal
    if (confirm('Open files in new tabs?\n\nPDF - View in browser\nMarkdown - Download/view\nWord - Download')) {
        window.open(study.pdfURL, '_blank');
        window.open(study.mdURL, '_blank');
        window.open(study.docxURL, '_blank');
    }
}

async function deleteStudy(studyId) {
    if (!confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
        return;
    }
    
    try {
        const study = allStudies.find(s => s.id === studyId);
        if (!study) return;
        
        // Delete all files from storage
        const fileURLs = [study.pdfURL, study.mdURL, study.docxURL];
        await supabaseService.deleteFiles(fileURLs);
        
        // Delete document from database
        await supabaseService.deleteStudy(studyId);
        
        showNotification('Study deleted successfully', 'success');
        await loadStudies();
        
    } catch (error) {
        console.error('Error deleting study:', error);
        showNotification('Failed to delete study', 'error');
    }
}

async function handleEditSubmit(event) {
    event.preventDefault();
    
    try {
        const studyId = editStudyId.value;
        const updateData = {
            title: editTitle.value.trim(),
            description: editDescription.value.trim(),
            tag: editTag.value,
            date: new Date(editDate.value)
        };
        
        await supabaseService.updateStudy(studyId, updateData);
        
        showNotification('Study updated successfully', 'success');
        closeEditModal();
        await loadStudies();
        
    } catch (error) {
        console.error('Error updating study:', error);
        showNotification('Failed to update study', 'error');
    }
}

function openEditModal() {
    editModal.classList.add('active');
}

function closeEditModal() {
    editModal.classList.remove('active');
    editForm.reset();
}

async function handleBulkDownload() {
    if (allStudies.length === 0) {
        showNotification('No studies to download', 'warning');
        return;
    }
    
    showNotification('Preparing bulk download...', 'success');
    
    // Create a comprehensive list with all file URLs
    const downloadData = allStudies.map(study => ({
        title: study.title,
        tag: study.tag,
        pdfUrl: study.pdfURL,
        mdUrl: study.mdURL,
        docxUrl: study.docxURL
    }));
    
    const csvContent = generateCSV(downloadData);
    downloadCSV(csvContent, 'studies-bulk-download.csv');
    
    showNotification('Download list generated! Use the URLs to download individual files.', 'success');
}

function generateCSV(data) {
    const headers = ['Title', 'Tag', 'PDF URL', 'Markdown URL', 'Word URL'];
    const rows = data.map(item => [
        `"${item.title.replace(/"/g, '""')}"`,
        item.tag,
        item.pdfUrl,
        item.mdUrl,
        item.docxUrl
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function showNotification(message, type = 'success') {
    const messageElement = notification.querySelector('.notification-message');
    const closeButton = notification.querySelector('.notification-close');
    
    messageElement.textContent = message;
    notification.className = `notification ${type} active`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('active');
    }, 5000);
    
    // Manual close
    closeButton.onclick = () => {
        notification.classList.remove('active');
    };
}

// Utility functions
function formatDate(dateInput) {
    let date;
    if (dateInput && dateInput.toDate) {
        date = dateInput.toDate();
    } else if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        date = new Date(dateInput);
    }
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
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

function getFileIcon(fileType) {
    const icons = {
        pdf: '📄',
        md: '📝',
        docx: '📘'
    };
    return icons[fileType] || '📄';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
