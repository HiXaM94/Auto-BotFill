// ==UserScript==
// @name         Smooth Udemy Coupon Automator
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Injects button, scrolls smoothly to targets, and auto-enrolls
// @author       You
// @match        https://couponscorpion.com/*
// @match        https://www.udemy.com/course/*
// @match        https://www.udemy.com/cart/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const host = window.location.hostname;

    // --- HELPER: SMOOTH SCROLL ---
    function smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // =================================================================
    // PART 1: COUPON SCORPION
    // =================================================================
    if (host.includes('couponscorpion.com')) {

        window.addEventListener('load', () => {
            // Target the main "Get Coupon Code" button
            const originalBtn = document.querySelector('a.btn_offer_block');

            if (originalBtn) {
                // Create Custom Button
                const myBtn = document.createElement('a');
                myBtn.innerHTML = "🚀 Auto-Fetch Udemy";
                myBtn.style = "display: inline-block; background: #8e44ad; color: #fff; padding: 10px 20px; margin-left: 10px; border-radius: 4px; font-weight: bold; cursor: pointer; text-decoration: none; border: 1px solid #72368a;";

                // Inject it
                originalBtn.parentNode.insertBefore(myBtn, originalBtn.nextSibling);

                // Click Event
                myBtn.onclick = function(e) {
                    e.preventDefault();

                    // 1. Visual Feedback
                    this.innerHTML = "⏬ Scrolling...";
                    this.style.backgroundColor = "#2c3e50";

                    // 2. Smooth Scroll to the original button
                    smoothScrollTo(originalBtn);

                    // 3. Wait for scroll to finish, then redirect
                    setTimeout(() => {
                        this.innerHTML = "🔗 Redirecting...";
                        originalBtn.style.border = "3px solid #e74c3c"; // Highlight target
                        originalBtn.style.transform = "scale(1.1)"; // Pop effect

                        setTimeout(() => {
                            window.location.href = originalBtn.href;
                        }, 800);
                    }, 1000);
                };
            }
        });
    }

    // =================================================================
    // PART 2: UDEMY
    // =================================================================
    if (host.includes('udemy.com')) {

        if (window.location.search.includes('couponCode=')) {

            // Wait for Udemy dynamic elements
            const checkInterval = setInterval(() => {

                // Look for the "Buy this course" or "Enroll now" button
                const enrollBtn = document.querySelector('button[data-purpose="buy-this-course-button"]');
                const priceText = document.querySelector('[data-purpose="course-price-text"]');

                if (enrollBtn && priceText) {
                    clearInterval(checkInterval); // Stop looking

                    // Check if Free
                    const isFree = priceText.innerText.includes('Free') || priceText.innerText.includes('100%');

                    if (isFree) {
                        // 1. Create Status Box
                        const status = document.createElement('div');
                        status.innerText = "🎉 Free Coupon Found! Scrolling to enroll...";
                        status.style = "position: fixed; top: 20px; right: 20px; background: #2ecc71; color: white; padding: 15px; z-index: 99999; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.2);";
                        document.body.appendChild(status);

                        // 2. Smooth Scroll to Button
                        setTimeout(() => {
                            smoothScrollTo(enrollBtn);

                            // 3. Click after scrolling
                            setTimeout(() => {
                                status.innerText = "🖱️ Clicking Enroll...";
                                enrollBtn.click();
                            }, 1000);
                        }, 1000);

                    } else {
                        // Not Free
                        console.log("Coupon applied but course is not free.");
                    }
                }
            }, 1000); // Check every second
        }
    }
})();