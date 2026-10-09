javascript: (function () {
    function formatError(error) {
        if (error instanceof Error) {
            return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ''}`;
        }
        return String(error);
    }

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
    const c = document.createElement('div');
    c.style.cssText = `position: fixed; z-index: 9999;
        left: 10px; top: 10px;
        background-color: #ffffffc0;
        border: 1px solid #ccc;
        padding: 5px;`;
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

    const controls = {
        editPage: {
            controlType: "labeled", label: "Edit Page", element: "input",
            type: 'checkbox', checked: false, id: 'editPage',
            onchange: function () {
                document.body.contentEditable = this.checked;
                document.designMode = this.checked ? 'on' : 'off';
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
            onclick: function () { c.remove(); },
        }
    };

    for (const [key, value] of Object.entries(controls)) {
        if (typeof value === "function") {
            const el = document.createElement("button");
            el.textContent = key; el.onclick = value;
            c.appendChild(el);
            continue;
        }
        if (typeof value === "object") {
            if (value.controlType && value.controlType == "simple") {
                const { controlType, element, ...properties } = value;
                const el = document.createElement(element);
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
    if (document.body) {document.body.appendChild(c);} else {
        document.addEventListener('DOMContentLoaded', function () {document.body.appendChild(c);}, { once: true });
    }
})();