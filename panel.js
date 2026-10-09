javascript: (function () {
    function formatError(error) {if (error instanceof Error) {return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;} return String(error);}

    window.addEventListener('error', function (event) {
        const details = [
            event.message || 'Unknown error',
            event.filename && `File: ${event.filename}`,
            event.lineno && `Line: ${event.lineno}`,
            event.colno && `Column: ${event.colno}`,
            event.error && `Stack:\n${formatError(event.error)}`
        ].filter(Boolean).join('\n');
        alert(`JavaScript error:\n${details}`);
    });
    window.addEventListener('unhandledrejection', function (event) {
        alert(`Unhandled promise rejection:\n${formatError(event.reason)}`);
    });
    /* Controller Creator. */
    if (document.getElementById('bm-container')) {return;}
    const container = document.createElement('div'); container.id = 'bm-container';
    container.style.cssText = `position: fixed; z-index: 9999;
        left: 0; top: 0; width: 100%; height: 100%;
        pointer-events: none;`;
    const c = document.createElement('div'); c.id = 'bm-panel';
    c.style.cssText = `display: flex; flex-direction: column; gap: 5px;
        position: fixed; z-index: 9999;
        left: 10px; top: 10px;
        background-color: #ffffffc0;
        border: 1px solid #ccc;
        padding: 5px;
        pointer-events: auto;`;
    c.insertAdjacentHTML('beforeend', `<h2>Controls</h2>`);

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

    function findElementsBySubstring(selector, searchString) {
        const sanitizedString = CSS.escape(searchString);
        const elements = document.querySelectorAll(`[${selector}*="${sanitizedString}"]`);
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
        removeAds: {
            controlType: "simple", element: "button", textContent: 'Remove Ads',
            onclick: function () {
                const adElements = findElementsBySubstring('id', 'google_ads_iframe');
                adElements.forEach(el => el.parentElement.remove());
                const adSrcs = findElementsBySubstring('src', 'googleads.g.doubleclick.net');
                adSrcs.forEach(el => el.remove());
                alert(`Removed ${adElements.length+adSrcs.length} ad element parents.`);
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
                    el.style.color = `hsl(${(Date.now())/9+180 % 360},100%,50%)`;
                    el.style.backgroundColor = `hsl(${(Date.now()/9% 360)},100%,50%)`;
                }, 1000 / 30);
            });
        },
        exit: {
            controlType: "simple", element: "button", textContent: 'x',
            onclick: function () {container.remove();},
        }
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
    if (document.body) {document.body.appendChild(container);} else {
        document.addEventListener('DOMContentLoaded', function () {document.body.appendChild(container);}, { once: true });
    }
})();