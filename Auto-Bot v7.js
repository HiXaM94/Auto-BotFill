// ==UserScript==
// @name         Auto-Bot v7 (Popup Killer Edition)
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Automates Generator -> JsonBin -> Feliluke (Closes Language Popups on BOTH sites)
// @author       You
// @match        https://www.fakenamegenerator.com/*
// @match        https://feliluke.com/partner-with-us/*
// @grant        GM_xmlhttpRequest
// @connect      api.jsonbin.io
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURATION ---
    const API_KEY = 'YOUR_JSONBIN_MASTER_KEY_HERE';
    const BIN_ID  = 'YOUR_BIN_ID_HERE';
    // ---------------------

    const host = window.location.hostname;

    // --- UI HELPER: STATUS BOX ---
    function updateStatus(message, color) {
        let box = document.getElementById('tm-status-popup');
        if (!box) {
            box = document.createElement('div');
            box.id = 'tm-status-popup';
            box.style = "position: fixed; top: 20px; right: 20px; z-index: 999999; padding: 15px; border-radius: 8px; font-family: sans-serif; font-size: 14px; font-weight: bold; color: white; box-shadow: 0 5px 15px rgba(0,0,0,0.3); max-width: 300px;";
            document.body.appendChild(box);
        }
        box.style.backgroundColor = color;
        box.innerHTML = message;
    }

    // =================================================================
    // PART 1: FAKENAMEGENERATOR
    // =================================================================
    if (host.includes('fakenamegenerator.com')) {

        // --- FNG POPUP KILLER ---
        setInterval(() => {
            const closeBtns = document.querySelectorAll('.close, .cookie-dismiss, #dismiss-button');
            closeBtns.forEach(btn => btn.click());
            const overlay = document.getElementById('cboxOverlay');
            if(overlay) overlay.style.display = 'none';
        }, 1000);

        // --- START BUTTON ---
        const btn = document.createElement('button');
        btn.innerText = "🚀 START BOT";
        btn.style = "position: fixed; top: 120px; right: 20px; z-index: 99999; padding: 15px 25px; background: #d9534f; color: white; border: none; font-size: 16px; font-weight: bold; cursor: pointer; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
        document.body.appendChild(btn);

        btn.onclick = function() {
            btn.innerText = "Processing...";
            btn.disabled = true;
            scrapeAndSend();
        };

        function scrapeAndSend() {
            updateStatus("Step 1: Scraping Data...", "#f39c12");

            const name = document.querySelector('.address h3') ? document.querySelector('.address h3').innerText : "John Doe";
            const address = document.querySelector('.adr') ? document.querySelector('.adr').innerText.trim() : "123 Fake St";
            
            let email = "test@example.com";
            const dls = document.querySelectorAll('.extra dl');
            dls.forEach(dl => {
                if (dl.innerText.includes('Email Address')) {
                    email = dl.querySelector('dd').innerText.split('\n')[0].trim();
                }
            });

            let phone = "555-0199";
            dls.forEach(dl => {
                if (dl.innerText.includes('Phone')) {
                    phone = dl.querySelector('dd').innerText.trim();
                }
            });

            const payload = { fullName: name, email: email, phone: phone, address: address };

            updateStatus("Step 2: Uploading to Cloud...", "#3498db");

            GM_xmlhttpRequest({
                method: "PUT",
                url: `https://api.jsonbin.io/v3/b/${BIN_ID}`,
                headers: { "Content-Type": "application/json", "X-Master-Key": API_KEY },
                data: JSON.stringify(payload),
                onload: function(response) {
                    if (response.status === 200) {
                        updateStatus("Step 3: Redirecting...", "#2ecc71");
                        window.location.href = 'https://feliluke.com/partner-with-us/?auto_fill=true';
                    } else {
                        updateStatus("❌ API Error. Check Console.", "#e74c3c");
                    }
                }
            });
        }
    }

    // =================================================================
    // PART 2: FELILUKE
    // =================================================================
    if (host.includes('feliluke.com')) {
        
        // --- FELILUKE POPUP KILLER (NEW!) ---
        setInterval(() => {
            // Target the specific IDs from your HTML
            const langPopup = document.getElementById('trp_ald_modal_popup');
            const closeBtn = document.getElementById('trp_ald_x_button_and_textarea');
            
            if (langPopup && langPopup.style.display !== 'none') {
                console.log("Detected Language Popup. Closing...");
                if (closeBtn) {
                    closeBtn.click(); // Click the X button
                } else {
                    langPopup.style.display = 'none'; // Force hide if button missing
                }
            }
        }, 800); // Check every 0.8 seconds

        // --- MAIN LOGIC ---
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('auto_fill') === 'true') {
            
            // Check for "Already Applied" message
            if (document.body.innerText.includes("You already have a pending affiliate application")) {
                updateStatus("⚠️ Stopped: You already applied.", "#e74c3c");
                window.history.replaceState({}, document.title, "/partner-with-us/");
                return; 
            }

            updateStatus("Step 4: Downloading Data...", "#3498db");

            GM_xmlhttpRequest({
                method: "GET",
                url: `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`,
                headers: { "X-Master-Key": API_KEY },
                onload: function(response) {
                    if (response.status === 200) {
                        const json = JSON.parse(response.responseText);
                        updateStatus("Step 5: Filling Form...", "#f39c12");
                        
                        setTimeout(() => {
                            fillForm(json.record);
                        }, 1000);
                    }
                }
            });
        }

        function fillForm(data) {
            function setVal(id, value) {
                const el = document.getElementById(id);
                if (el) {
                    el.value = value;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }

            let nameParts = data.fullName.split(' ');
            let firstName = nameParts[0];
            let lastName = nameParts.slice(1).join(' ');

            setVal('wcu-input-first-name', firstName);
            setVal('wcu-input-last-name', lastName);
            setVal('wcu-input-email', data.email);
            setVal('wcu-input-password', 'Pass' + Math.floor(Math.random() * 10000) + '!');
            setVal('wcu-input-promote', 'Marketing via Social Media channels.');
            setVal('wcu-input-referrer', 'Google');
            setVal('wcu-input-custom-1', data.phone);
            setVal('wcu-input-custom-2', '@' + firstName.toLowerCase() + Math.floor(Math.random() * 99));

            const checkbox = document.getElementById('agree');
            if (checkbox) checkbox.checked = true;

            const submitBtn = document.getElementById('wcu-register-button');
            if (submitBtn) {
                updateStatus("Step 6: Submitting...", "#2ecc71");
                
                // Prevent loop by cleaning URL
                window.history.replaceState({}, document.title, "/partner-with-us/");

                setTimeout(() => {
                    submitBtn.click();
                }, 1500);
            }
        }
    }
})();