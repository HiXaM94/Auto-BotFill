// ==UserScript==
// @name         Udemy Cinematic Scroll & Apply (Smart Fix)
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  Finds coupon code from URL OR page text, then smooth scrolls on Udemy
// @author       BS.Hicham Déléguer 
// @match        https://couponscorpion.com/*
// @match        https://www.udemy.com/course/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const host = window.location.hostname;

    // --- CUSTOM SMOOTH SCROLL ---
    function customSmoothScrollTo(element, duration) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition - 200;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = easeOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        function easeOutCubic(t, b, c, d) {
            t /= d; t--; return c * (t * t * t + 1) + b;
        }
        requestAnimationFrame(animation);
    }

    // =================================================================
    // PART 1: COUPON SCORPION
    // =================================================================
    if (host.includes('couponscorpion.com')) {
        window.addEventListener('load', () => {
            const originalBtn = document.querySelector('a.btn_offer_block');

            if (originalBtn) {

                // --- STRATEGY 1: Check URL ---
                let couponCode = "";
                if (originalBtn.href.includes('couponCode=')) {
                    couponCode = originalBtn.href.split('couponCode=')[1].split('&')[0];
                }

                // --- STRATEGY 2: Check Page Text (Backup) ---
                if (!couponCode) {
                    // Sometimes code is listed like "Coupon Code: FREE-DEC"
                    const pageText = document.body.innerText;
                    const codeMatch = pageText.match(/Coupon Code:\s*([A-Z0-9_-]+)/i);
                    if (codeMatch && codeMatch[1]) {
                        couponCode = codeMatch[1].trim();
                    }
                }

                // Inject Button
                const myBtn = document.createElement('a');
                myBtn.innerHTML = "🚀 Auto-Apply Udemy";
                myBtn.style = "display: inline-block; background: #8e44ad; color: #fff; padding: 10px 20px; margin-left: 10px; border-radius: 4px; font-weight: bold; cursor: pointer; text-decoration: none; border: 1px solid #72368a;";

                originalBtn.parentNode.insertBefore(myBtn, originalBtn.nextSibling);

                myBtn.onclick = function(e) {
                    e.preventDefault();

                    if(couponCode) {
                        GM_setValue('targetCoupon', couponCode);
                        this.innerHTML = "Found: " + couponCode + " -> Redirecting...";

                        setTimeout(() => { window.location.href = originalBtn.href; }, 800);
                    } else {
                        // FALLBACK: If we really can't find it, ask user to copy-paste
                        let manualCode = prompt("Script couldn't find the code automatically.\nPlease paste the coupon code here:", "");
                        if (manualCode) {
                             GM_setValue('targetCoupon', manualCode);
                             window.location.href = originalBtn.href;
                        }
                    }
                };
            }
        });
    }

    // =================================================================
    // PART 2: UDEMY
    // =================================================================
    if (host.includes('udemy.com')) {
        const savedCoupon = GM_getValue('targetCoupon', null);
        const urlParams = new URLSearchParams(window.location.search);
        const codeToApply = savedCoupon || urlParams.get('couponCode');

        if (codeToApply) {

            const checkInterval = setInterval(() => {
                const sidebar = document.querySelector('[data-purpose="sidebar-container"]') || document.querySelector('.sidebar-container--content--g-79W');

                if (sidebar) {
                    const buttons = Array.from(sidebar.querySelectorAll('button'));
                    const triggerBtn = buttons.find(b => b.textContent.includes('Apply Coupon'));
                    const inputField = sidebar.querySelector('input[data-purpose="coupon-input-field"]') || sidebar.querySelector('input[placeholder="Enter Coupon"]');
                    const target = triggerBtn || inputField;

                    if (target) {
                        clearInterval(checkInterval);
                        GM_setValue('targetCoupon', ''); // Clear saved code

                        const status = document.createElement('div');
                        status.innerHTML = "⏬ <b>Gliding to Coupon Area...</b>";
                        status.style = "position: fixed; top: 100px; right: 20px; background: #e67e22; color: white; padding: 15px; z-index: 99999; border-radius: 8px; font-weight: bold;";
                        document.body.appendChild(status);

                        setTimeout(() => {
                            customSmoothScrollTo(target, 2000);
                            target.style.transition = "border 0.5s ease";
                            target.style.border = "4px solid #e74c3c";

                            setTimeout(() => {
                                if (triggerBtn && !inputField) triggerBtn.click();

                                setTimeout(() => {
                                    const finalInput = document.querySelector('input[data-purpose="coupon-input-field"]') || document.querySelector('input[placeholder="Enter Coupon"]');

                                    if (finalInput) {
                                        status.innerHTML = "✍️ <b>Applying Code: " + codeToApply + "</b>";
                                        status.style.backgroundColor = "#9b59b6";

                                        const applyBtn = finalInput.parentNode.querySelector('button') || finalInput.nextElementSibling;
                                        let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                                        nativeInputValueSetter.call(finalInput, codeToApply);
                                        finalInput.dispatchEvent(new Event('input', { bubbles: true }));

                                        if (applyBtn) {
                                            setTimeout(() => {
                                                status.innerHTML = "🎉 <b>Done!</b>";
                                                status.style.backgroundColor = "#2ecc71";
                                                applyBtn.click();
                                            }, 800);
                                        }
                                    }
                                }, 800);
                            }, 2100);
                        }, 1000);
                    }
                }
            }, 1000);
        }
    }
})();
