javascript:(function () {
    function findElementsBySubstring(element, selector, searchString) {
        const sanitizedString = CSS.escape(searchString);
        const elements = document.querySelectorAll(`${element}[${selector}*="${sanitizedString}"]`);
        /* use output like: matches.forEach(el => console.log(el.id, el));*/
        return Array.from(elements);
    }

    const ad_sites = [
        'g.doubleclick.net',
        'bing.com/aclick',
        'goguardian',
        'googletag'
    ];
    const common_ad_elements = [
        'google_ads_iframe',
        'ad-container',
        'ad-header'
    ];

    let sites_removed = 0;
    for (const ad of common_ad_elements) {
        const adElements = findElementsBySubstring('div','id', ad);
        adElements.forEach(el => ()=>{el.remove(); el.parentElement.remove();});
        const adElements2 = findElementsBySubstring('div','class', ad);
        adElements2.forEach(el => ()=>{el.remove(); el.parentElement.remove();});

        sites_removed += adElements.length + adElements2.length;
    }
    for (const site of ad_sites) {
        const adElements = findElementsBySubstring('a','src', site);
        adElements.forEach(el => ()=>{el.remove(); el.parentElement.remove();});
        const adElements2 = findElementsBySubstring('a','href', site);
        adElements2.forEach(el => ()=>{el.remove(); el.parentElement.remove();});

        sites_removed += adElements.length + adElements2.length;
    }
    alert(`Removed ${sites_removed} ad element parents.`);
})();