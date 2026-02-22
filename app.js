/**
 * Shareable Notepad Application
 * 
 * A stateless notepad that stores content in the URL hash.
 * Each share creates a snapshot - new modifications require a new share link.
 * 
 * Features:
 * - 20,000 character limit
 * - Dark mode toggle
 * - Full Unicode support
 * - Comprehensive test suite
 * 
 * @author m9rcy.dev
 * @version 1.0.0
 */

'use strict';

/**
 * Configuration Constants
 */
const CONFIG = {
    MAX_CHARS: 20000,
    WARNING_THRESHOLD: 18000,
    DANGER_THRESHOLD: 19500,
    THEME_STORAGE_KEY: 'notepad-theme'
};

/**
 * Utility module for encoding/decoding text to/from URL-safe base64
 */
const Codec = (function() {
    /**
     * Encodes text to URL-safe base64 string
     * @param {string} text - The text to encode
     * @returns {string} URL-safe base64 encoded string
     */
    function encode(text) {
        if (!text) return '';
        try {
            const bytes = new TextEncoder().encode(text);
            const base64 = btoa(String.fromCharCode(...bytes));
            return base64
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        } catch (error) {
            console.error('Encoding error:', error);
            return '';
        }
    }

    /**
     * Decodes URL-safe base64 string to text
     * @param {string} encoded - The URL-safe base64 string
     * @returns {string} Decoded text
     */
    function decode(encoded) {
        if (!encoded) return '';
        try {
            let base64 = encoded
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            
            const padding = 4 - (base64.length % 4);
            if (padding !== 4) {
                base64 += '='.repeat(padding);
            }
            
            const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
            return new TextDecoder().decode(bytes);
        } catch (error) {
            console.error('Decoding error:', error);
            return '';
        }
    }

    return { encode, decode };
})();

/**
 * Theme Manager module for dark/light mode
 */
const ThemeManager = (function() {
    let isDarkMode = false;

    /**
     * Initializes theme from localStorage or system preference
     */
    function init() {
        const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
        
        if (savedTheme) {
            isDarkMode = savedTheme === 'dark';
        } else {
            isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        applyTheme();
    }

    /**
     * Toggles between dark and light mode
     */
    function toggle() {
        isDarkMode = !isDarkMode;
        applyTheme();
        localStorage.setItem(CONFIG.THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
    }

    /**
     * Applies the current theme to the document
     */
    function applyTheme() {
        const body = document.body;
        const themeIcon = document.getElementById('themeIcon');
        
        if (isDarkMode) {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else {
            body.classList.remove('dark-mode');
            body.classList.add('light-mode');
            if (themeIcon) themeIcon.textContent = '🌙';
        }
    }

    /**
     * Gets current theme state
     * @returns {boolean} True if dark mode
     */
    function isDark() {
        return isDarkMode;
    }

    return { init, toggle, isDark };
})();

/**
 * Character Limit Manager
 */
const LimitManager = (function() {
    const elements = {
        charCount: document.getElementById('charCount'),
        limitStatus: document.getElementById('limitStatus'),
        notepad: document.getElementById('notepad'),
        editorContainer: document.querySelector('.editor-container')
    };

    /**
     * Updates the character limit UI
     * @param {number} count - Current character count
     */
    function update(count) {
        if (!elements.charCount) return;

        elements.charCount.textContent = `${count.toLocaleString()} / ${CONFIG.MAX_CHARS.toLocaleString()}`;

        // Update limit status text
        const remaining = CONFIG.MAX_CHARS - count;
        
        if (elements.limitStatus) {
            if (count >= CONFIG.MAX_CHARS) {
                elements.limitStatus.textContent = 'Limit reached!';
                elements.limitStatus.className = 'limit-danger';
            } else if (count >= CONFIG.DANGER_THRESHOLD) {
                elements.limitStatus.textContent = `${remaining} left`;
                elements.limitStatus.className = 'limit-danger';
            } else if (count >= CONFIG.WARNING_THRESHOLD) {
                elements.limitStatus.textContent = `${remaining} left`;
                elements.limitStatus.className = 'limit-warning';
            } else {
                elements.limitStatus.textContent = '';
                elements.limitStatus.className = 'limit-safe';
            }
        }

        // Update editor container border
        if (elements.editorContainer) {
            elements.editorContainer.classList.remove('limit-warning', 'limit-danger');
            if (count >= CONFIG.MAX_CHARS) {
                elements.editorContainer.classList.add('limit-danger');
            } else if (count >= CONFIG.WARNING_THRESHOLD) {
                elements.editorContainer.classList.add('limit-warning');
            }
        }
    }

    /**
     * Checks if text exceeds limit
     * @param {string} text - Text to check
     * @returns {boolean} True if within limit
     */
    function isWithinLimit(text) {
        return text.length <= CONFIG.MAX_CHARS;
    }

    /**
     * Truncates text to limit
     * @param {string} text - Text to truncate
     * @returns {string} Truncated text
     */
    function truncate(text) {
        return text.slice(0, CONFIG.MAX_CHARS);
    }

    return { update, isWithinLimit, truncate };
})();

/**
 * UI Controller module for managing DOM interactions
 */
const UIController = (function() {
    const elements = {
        notepad: document.getElementById('notepad'),
        shareBtn: document.getElementById('shareBtn'),
        newBtn: document.getElementById('newBtn'),
        themeBtn: document.getElementById('themeBtn'),
        charCount: document.getElementById('charCount'),
        wordCount: document.getElementById('wordCount'),
        toast: document.getElementById('toast')
    };

    let toastTimeout = null;

    function getText() {
        return elements.notepad.value;
    }

    function setText(text) {
        // Enforce limit
        if (text.length > CONFIG.MAX_CHARS) {
            text = text.slice(0, CONFIG.MAX_CHARS);
        }
        elements.notepad.value = text;
        updateStats();
        LimitManager.update(text.length);
    }

    function updateStats() {
        const text = elements.notepad.value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        if (elements.wordCount) {
            elements.wordCount.textContent = `${wordCount.toLocaleString()} word${wordCount !== 1 ? 's' : ''}`;
        }
    }

    function showToast(message, type = 'default', duration = 2000) {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        const toast = elements.toast;
        toast.textContent = message;
        toast.className = 'toast';
        
        if (type === 'success') toast.classList.add('success');
        if (type === 'error') toast.classList.add('error');
        if (type === 'warning') toast.classList.add('warning');

        void toast.offsetWidth;
        toast.classList.add('show');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    function onTextInput(callback) {
        elements.notepad.addEventListener('input', () => {
            const text = elements.notepad.value;
            
            // Enforce limit on input
            if (text.length > CONFIG.MAX_CHARS) {
                elements.notepad.value = text.slice(0, CONFIG.MAX_CHARS);
                showToast(`Maximum ${CONFIG.MAX_CHARS.toLocaleString()} characters reached`, 'warning', 1500);
            }
            
            updateStats();
            LimitManager.update(elements.notepad.value.length);
            callback(elements.notepad.value);
        });
    }

    function onShare(callback) {
        elements.shareBtn.addEventListener('click', callback);
    }

    function onNew(callback) {
        elements.newBtn.addEventListener('click', callback);
    }

    function onThemeToggle(callback) {
        elements.themeBtn.addEventListener('click', callback);
    }

    function focusNotepad() {
        elements.notepad.focus();
    }

    return {
        getText,
        setText,
        updateStats,
        showToast,
        onTextInput,
        onShare,
        onNew,
        onThemeToggle,
        focusNotepad
    };
})();

/**
 * URL Manager module
 */
const URLManager = (function() {
    function getHashContent() {
        return window.location.hash.slice(1);
    }

    function setHashContent(encodedContent) {
        if (encodedContent) {
            window.location.hash = encodedContent;
        } else {
            history.replaceState(null, null, ' ');
        }
    }

    function getShareableURL() {
        return window.location.href;
    }

    function onHashChange(callback) {
        window.addEventListener('hashchange', () => {
            callback(getHashContent());
        });
    }

    return {
        getHashContent,
        setHashContent,
        getShareableURL,
        onHashChange
    };
})();

/**
 * Clipboard Manager module
 */
const ClipboardManager = (function() {
    async function copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Clipboard copy failed:', error);
            return false;
        }
    }

    return { copy };
})();

/**
 * Test Suite Module
 */
const TestSuite = (function() {
    const tests = [];
    let passed = 0;
    let failed = 0;

    /**
     * Adds a test to the suite
     * @param {string} name - Test name
     * @param {Function} fn - Test function
     */
    function test(name, fn) {
        tests.push({ name, fn });
    }

    /**
     * Asserts equality
     * @param {*} actual - Actual value
     * @param {*} expected - Expected value
     * @param {string} message - Error message
     */
    function assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }

    /**
     * Asserts truthiness
     * @param {*} value - Value to check
     * @param {string} message - Error message
     */
    function assertTrue(value, message) {
        if (!value) {
            throw new Error(message || `Expected truthy value, got ${value}`);
        }
    }

    /**
     * Defines all tests
     */
    function defineTests() {
        // Codec Tests
        test('Codec: Encode and decode ASCII text', () => {
            const original = 'Hello World!';
            const encoded = Codec.encode(original);
            const decoded = Codec.decode(encoded);
            assertEqual(decoded, original);
        });

        test('Codec: Encode and decode empty string', () => {
            const original = '';
            const encoded = Codec.encode(original);
            const decoded = Codec.decode(encoded);
            assertEqual(decoded, original);
        });

        test('Codec: Encode and decode Unicode (Chinese)', () => {
            const original = '你好世界！';
            const encoded = Codec.encode(original);
            const decoded = Codec.decode(encoded);
            assertEqual(decoded, original);
        });

        test('Codec: Encode and decode emojis', () => {
            const original = '🎉📝✨🚀💻';
            const encoded = Codec.encode(original);
            const decoded = Codec.decode(encoded);
            assertEqual(decoded, original);
        });

        test('Codec: Encode and decode mixed content', () => {
            const original = 'Hello 你好 🎉 123 € ∑';
            const encoded = Codec.encode(original);
            const decoded = Codec.decode(encoded);
            assertEqual(decoded, original);
        });

        test('Codec: Encode and decode newlines and tabs', () => {
            const original = 'Line 1\nLine 2\tTabbed';
            const encoded = Codec.encode(original);
            const decoded = Codec.decode(encoded);
            assertEqual(decoded, original);
        });

        test('Codec: Encode and decode Arabic (RTL)', () => {
            const original = 'مرحبا بالعالم!';
            const encoded = Codec.encode(original);
            const decoded = Codec.decode(encoded);
            assertEqual(decoded, original);
        });

        test('Codec: Encode and decode long text (10k chars)', () => {
            const original = 'A'.repeat(10000);
            const encoded = Codec.encode(original);
            const decoded = Codec.decode(encoded);
            assertEqual(decoded, original);
        });

        // Limit Manager Tests
        test('LimitManager: Check within limit', () => {
            assertTrue(LimitManager.isWithinLimit('A'.repeat(1000)));
        });

        test('LimitManager: Check at limit boundary', () => {
            assertTrue(LimitManager.isWithinLimit('A'.repeat(CONFIG.MAX_CHARS)));
        });

        test('LimitManager: Check exceeds limit', () => {
            const exceeds = !LimitManager.isWithinLimit('A'.repeat(CONFIG.MAX_CHARS + 1));
            assertTrue(exceeds);
        });

        test('LimitManager: Truncate function', () => {
            const truncated = LimitManager.truncate('A'.repeat(CONFIG.MAX_CHARS + 1000));
            assertEqual(truncated.length, CONFIG.MAX_CHARS);
        });

        // Configuration Tests
        test('Config: MAX_CHARS is 20000', () => {
            assertEqual(CONFIG.MAX_CHARS, 20000);
        });

        test('Config: WARNING_THRESHOLD is 18000', () => {
            assertEqual(CONFIG.WARNING_THRESHOLD, 18000);
        });

        test('Config: DANGER_THRESHOLD is 19500', () => {
            assertEqual(CONFIG.DANGER_THRESHOLD, 19500);
        });
    }

    /**
     * Runs all tests
     * @returns {Object} Test results
     */
    function run() {
        passed = 0;
        failed = 0;
        
        console.log('🧪 Running Test Suite...\n');
        
        for (const { name, fn } of tests) {
            try {
                fn();
                passed++;
                console.log(`✅ PASS: ${name}`);
            } catch (error) {
                failed++;
                console.error(`❌ FAIL: ${name}`);
                console.error(`   ${error.message}`);
            }
        }
        
        console.log('\n' + '='.repeat(40));
        console.log(`Results: ${passed} passed, ${failed} failed`);
        console.log('='.repeat(40));
        
        return { passed, failed, total: tests.length };
    }

    /**
     * Gets test results as HTML
     * @returns {string} HTML string
     */
    function getResultsHTML() {
        let html = '<h3>Test Results</h3>';
        
        for (const { name, fn } of tests) {
            try {
                fn();
                html += `<div class="test-result pass">✅ ${name}</div>`;
            } catch (error) {
                html += `<div class="test-result fail">❌ ${name}<br><small>${error.message}</small></div>`;
            }
        }
        
        return html;
    }

    // Initialize tests
    defineTests();

    return { run, getResultsHTML };
})();

/**
 * Main Application module
 */
const NotepadApp = (function() {
    let isUpdating = false;

    function init() {
        ThemeManager.init();
        loadFromURL();
        setupEventListeners();
        UIController.focusNotepad();
        
        // Expose test suite globally for console access
        window.NotepadTests = TestSuite;
        window.runTests = TestSuite.run;
        
        console.log('📝 Shareable Notepad loaded!');
        console.log('💡 Run tests with: runTests()');
    }

    function setupEventListeners() {
        // Handle text input
        UIController.onTextInput((text) => {
            if (isUpdating) return;
            
            isUpdating = true;
            const encoded = Codec.encode(text);
            URLManager.setHashContent(encoded);
            isUpdating = false;
        });

        // Handle share button
        UIController.onShare(async () => {
            const url = URLManager.getShareableURL();
            const success = await ClipboardManager.copy(url);
            
            if (success) {
                UIController.showToast('Link copied to clipboard!', 'success');
            } else {
                UIController.showToast('Failed to copy link', 'error');
            }
        });

        // Handle new button
        UIController.onNew(() => {
            if (UIController.getText().trim() && !confirm('Clear current notepad?')) {
                return;
            }
            
            isUpdating = true;
            UIController.setText('');
            URLManager.setHashContent('');
            UIController.focusNotepad();
            isUpdating = false;
        });

        // Handle theme toggle
        UIController.onThemeToggle(() => {
            ThemeManager.toggle();
        });

        // Handle hash changes
        URLManager.onHashChange(() => {
            if (!isUpdating) {
                loadFromURL();
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    function loadFromURL() {
        isUpdating = true;
        
        const hash = URLManager.getHashContent();
        if (hash) {
            const decoded = Codec.decode(hash);
            // Enforce limit on loaded content
            if (decoded.length > CONFIG.MAX_CHARS) {
                UIController.showToast(`Content truncated to ${CONFIG.MAX_CHARS.toLocaleString()} characters`, 'warning');
            }
            UIController.setText(decoded);
        } else {
            UIController.setText('');
        }
        
        isUpdating = false;
    }

    function handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + S to share
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            document.getElementById('shareBtn').click();
        }
        
        // Ctrl/Cmd + N for new
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            document.getElementById('newBtn').click();
        }
        
        // Ctrl/Cmd + T for theme toggle
        if ((event.ctrlKey || event.metaKey) && event.key === 't') {
            event.preventDefault();
            ThemeManager.toggle();
        }
    }

    return { init };
})();

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', NotepadApp.init);
