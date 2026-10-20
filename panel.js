javascript: (function () {
    function formatError(error) {
        if (error instanceof Error) {
            return error.name + ': ' + error.message + (error.stack ? '\n' + error.stack : '');
        }
        return String(error);
    }
    window.addEventListener('error', function (event) {
        const details = [
            event.message || 'Unknown error',
            event.filename && 'File: ' + event.filename,
            event.lineno && 'Line: ' + event.lineno,
            event.colno && 'Column: ' + event.colno,
            event.error && 'Stack:\n' + formatError(event.error)
        ].filter(Boolean).join('\n');
        alert('JavaScript error:\n' + details);
    });
    window.addEventListener('unhandledrejection', function (event) {alert('Unhandled promise rejection:\n' + formatError(event.reason));});
    const ad_sites = [
        'g.doubleclick.net',
        'bing.com/aclick',
        'goguardian',
        'googletag',
        'ads.pubmatic.com',
        'adsbygoogle',
        'adservice.google.com',
    ];

    /* Container Creator. */
    if (document.getElementById('bm-container')) {document.getElementById('bm-container').remove(); return;}
    const container = document.createElement('div'); container.id = 'bm-container';
    container.style.cssText = 'position: fixed; z-index: 9999;\n' +
        'left: 0; top: 0; width: 100%; height: 100%;\n' +
        'pointer-events: none;';
    /** Controller, the main tab. */
    const BMStyle = `
        background-color: #ffffffc0;
        border: 1px solid #ccc;
        padding: 5px;
        pointer-events: auto;

        color: #000;
        font-size: 12px;
        z-index: 9999;

        max-width: 200px;
    `;
    const c = document.createElement('div'); c.id = 'bm-panel';
    c.style.cssText = BMStyle + 'display: flex; flex-direction: column; gap: 5px;\n' +
        'position: relative; margin: 10px;';
    c.insertAdjacentHTML('beforeend', '<h2>Controls</h2>');
    const log_el = document.createElement('div'); log_el.id = 'bm-log';
    log_el.style.cssText = BMStyle+'display: none; position: relative; max-height: 200px; overflow-y: auto;';

    function log(message) {
        const entry = document.createElement('p');
        entry.textContent = message;
        log_el.appendChild(entry);
        log_el.scrollTop = log_el.scrollHeight;
    }

    function selectElement(func) {
        const style = document.createElement('style');
        style.innerHTML = '.bm-hover { outline: 2px dashed #3b82f6 !important; cursor: pointer !important; }';
        document.head.appendChild(style);
        function targetElement(e) {
            e.preventDefault(); e.stopPropagation();
            func(e); /* Do the function here */
            document.removeEventListener('click', targetElement, true);
            document.removeEventListener('mouseover', addHover);
            document.removeEventListener('mouseout', removeHover);
            e.target.classList.remove('bm-hover');
            style.remove();
        }
        function addHover(e) { e.target.classList.add('bm-hover'); }
        function removeHover(e) { e.target.classList.remove('bm-hover'); }
        document.addEventListener('click', targetElement, true);
        document.addEventListener('mouseover', addHover);
        document.addEventListener('mouseout', removeHover);
    }

    function findElementsBySubstring(element, selector, searchString) {
        const sanitizedString = CSS.escape(searchString);
        const selectorString = element + '[' + selector + '*="' + sanitizedString + '"]';
        const elements = document.querySelectorAll(selectorString);
        /* use output like: matches.forEach(el => console.log(el.id, el));*/
        return Array.from(elements);
    }

    const controls = {
        editPage: {
            controlType: "labeled", label: "Edit Page", element: "input",
            type: 'checkbox', checked: false, id: 'editPage',
            onchange: function () {
                document.body.contentEditable = this.checked;
                document.designMode = this.checked ? 'on' : 'off';
            }
        },
        showLog: {
            controlType: "labeled", label: "Show Log", element: "input",
            type: 'checkbox', checked: false, id: 'showLog',
            onchange: function () {
                log_el.style.display = this.checked ? 'block' : 'none';
            }
        },
        stopAllFetch: {
            controlType: "simple", element: "button", textContent: 'Stop All Fetch',
            onclick: function () {
                window.fetch = function () {return new Promise(() => {});};
                log('All fetch requests have been stopped.');
            }
        },
        removeAds: {
            controlType: "simple", element: "button", textContent: 'Remove Ads',
            onclick: function () {
                const common_ad_elements = [
                    'google_ads_iframe',
                    'ad-container','display-ad-container','ad-header'
                ];
                var sites_removed = 0;
                for (const ad of common_ad_elements) {
                    const adElements = findElementsBySubstring('div','id', ad);
                    const adElements2 = findElementsBySubstring('div','class', ad);
                    const allAdElements = adElements.concat(adElements2);
                    allAdElements.forEach(el => {
                        try {
                            if (el.parentElement.tagName == 'HTML' || el.parentElement.tagName == 'BODY') {
                                log('Removed ad element: ' + el.outerHTML);
                                el.remove();
                            } else {
                                log('Removed ad parent: ' + el.parentElement.outerHTML);
                                el.parentElement.remove();
                            }
                        } catch (e) {}});
                    sites_removed += allAdElements.length;
                }
                for (const site of ad_sites) {
                    const adElements = findElementsBySubstring('','src', site);
                    const adElements2 = findElementsBySubstring('','href', site);
                    const allAdElements = adElements.concat(adElements2);
                    allAdElements.forEach(el => {try {
                        const filteredTags = ['HTML', 'BODY', 'HEAD', 'TITLE', 'META', 'LINK', 'SCRIPT', 'STYLE'];
                        if (filteredTags.includes(el.parentElement.tagName)) {
                            log('Removed ad element: ' + el.outerHTML);
                            el.remove();
                        } else {
                            log('Removed ad parent: ' + el.parentElement.outerHTML);
                            el.parentElement.remove();
                        }
                    } catch (e) {}});
                    sites_removed += allAdElements.length;
                }
                log('Removed ' + sites_removed + ' ads.');
            }
        },
        removeElement: {
            controlType: "simple", element: "button", textContent: 'Remove Element',
            onclick: function () {
                selectElement(function (e) {e.target.remove();});
            }
        },
        resizeElement: {
            controlType: "simple", element: "button", textContent: 'Resize Element',
            onclick: function () {
                selectElement(function (e) {
                    const el = e.target;
                    /* Apply the required CSS properties to the clicked element */
                    el.style.resize = 'both'; el.style.overflow = 'auto';
                    if (!el.style.minWidth) el.style.minWidth = '50px';
                    if (!el.style.minHeight) el.style.minHeight = '50px';
                });
            }
        },
        rainbowfy: function () {
            selectElement(function (e) {
                const el = e.target;
                setInterval(function () {
                    el.style.color = 'hsl(' + ((Date.now() / 9 + 180) % 360) + ',100%,50%)';
                    el.style.backgroundColor = 'hsl(' + ((Date.now() / 9) % 360) + ',100%,50%)';
                }, 1000 / 30);
            });
        },
        exit: {
            controlType: "simple", element: "button", textContent: 'x',
            onclick: function () {container.remove();},
        },
    };

    for (const [key, value] of Object.entries(controls)) {
        if (typeof value === "function") {
            const el = document.createElement("button");
            el.style.cssText = "border: 1px solid #222;";
            el.textContent = key; el.onclick = value;
            c.appendChild(el);
            continue;
        }
        if (typeof value === "object") {
            if (value.controlType && value.controlType == "simple") {
                const { controlType, element, ...properties } = value;
                const el = document.createElement(element);
                el.style.cssText = "border: 1px solid #222;";
                for (const [eKey, eValue] of Object.entries(properties)) {el[eKey] = eValue;}
                c.appendChild(el);
            } else if (value.controlType && value.controlType == "labeled") {
                const { controlType, label, element, ...properties } = value;
                const el = document.createElement(element);
                for (const [eKey, eValue] of Object.entries(properties)) {el[eKey] = eValue;}
                const labelEl = document.createElement("label");
                labelEl.textContent = label; labelEl.appendChild(el);
                c.appendChild(labelEl);
            }
        }
    }
    container.appendChild(c);
    container.appendChild(log_el);
    if (document.body) {document.body.appendChild(container);} else {
        document.addEventListener('DOMContentLoaded', function () {document.body.appendChild(container);}, {once: true});
    }
})();