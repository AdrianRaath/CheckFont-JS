// ================= Setting of Current Font.js =================

// --------------------------------------------------------------
// 1) Global State
// --------------------------------------------------------------
let selectedHeadingFont = "Inter"; // Default heading
let selectedBodyFont = "Open Sans"; // Default body
let currentFontType = "heading"; // "heading" or "body"

// Existing line-height & letter-spacing
let headingLineHeight = 1.2;
let headingLetterSpacing = 0;
let bodyLineHeight = 1.5;
let bodyLetterSpacing = 0;

// track heading/body font weight
let headingFontWeight = 700; // default heading
let bodyFontWeight = 400; // default body

// NEW: track heading/body font size scale
// (1.0 => no change, 2.0 => double size, etc.)
let headingSizeScale = 1.0;
let bodySizeScale = 1.0;

// --------------------------------------------------------------
// 2) DOM References
// --------------------------------------------------------------

// Sliders for line-height & letter-spacing
const headingLineHeightInput = document.getElementById("heading-line-height");
const headingLetterSpacingInput = document.getElementById(
  "heading-letter-spacing"
);
const bodyLineHeightInput = document.getElementById("body-line-height");
const bodyLetterSpacingInput = document.getElementById("body-letter-spacing");

// Displays for line-height & letter-spacing
const headingLineHeightDisplay = document.getElementById(
  "heading-height-display"
);
const headingLetterSpacingDisplay = document.getElementById(
  "heading-spacing-display"
);
const bodyLineHeightDisplay = document.getElementById("body-height-display");
const bodyLetterSpacingDisplay = document.getElementById(
  "body-spacing-display"
);

// Sliders + displays for font weight
const headingWeightSlider = document.getElementById("heading-weight-slider");
const headingWeightDisplay = document.getElementById("heading-weight-display");
const bodyWeightSlider = document.getElementById("body-weight-slider");
const bodyWeightDisplay = document.getElementById("body-weight-display");

// NEW: references for the font size scale sliders + displays
const headingSizeSlider = document.getElementById("heading-size-slider");
const headingSizeDisplay = document.getElementById("heading-size-display");
const bodySizeSlider = document.getElementById("body-size-slider");
const bodySizeDisplay = document.getElementById("body-size-display");

// References to the two links that show the Google Fonts pages
const headingFontUrlEl = document.getElementById("heading-font-url");
const bodyFontUrlEl = document.getElementById("body-font-url");

// --------------------------------------------------------------
// 3) On page load, retrieve stored fonts & spacing
// --------------------------------------------------------------
loadStoredFonts();

function loadStoredFonts() {
  // A) Fonts
  selectedHeadingFont = localStorage.getItem("selectedHeadingFont") || "Inter";
  selectedBodyFont = localStorage.getItem("selectedBodyFont") || "Nunito";
  console.log("Loaded stored fonts:", {
    heading: selectedHeadingFont,
    body: selectedBodyFont,
  });

  // B) Spacing
  headingLineHeight = parseFloat(
    localStorage.getItem("headingLineHeight") || "1.2"
  );
  headingLetterSpacing = parseFloat(
    localStorage.getItem("headingLetterSpacing") || "0"
  );
  bodyLineHeight = parseFloat(localStorage.getItem("bodyLineHeight") || "1.5");
  bodyLetterSpacing = parseFloat(
    localStorage.getItem("bodyLetterSpacing") || "0"
  );
  console.log("Loaded spacing:", {
    headingLineHeight,
    headingLetterSpacing,
    bodyLineHeight,
    bodyLetterSpacing,
  });

  // C) Font Weights
  headingFontWeight = parseInt(
    localStorage.getItem("headingFontWeight") || "700",
    10
  );
  bodyFontWeight = parseInt(
    localStorage.getItem("bodyFontWeight") || "400",
    10
  );
  console.log("Loaded font weights:", { headingFontWeight, bodyFontWeight });

  // D) Font Size Scale
  headingSizeScale = parseFloat(
    localStorage.getItem("headingSizeScale") || "1"
  );
  bodySizeScale = parseFloat(localStorage.getItem("bodySizeScale") || "1");
  console.log("Loaded font size scales:", { headingSizeScale, bodySizeScale });

  // E) Load fallback "400,700" for label preview
  loadFont(selectedHeadingFont);
  loadFont(selectedBodyFont);

  // If we want all real numeric weights:
  loadAllSupportedWeights?.(selectedHeadingFont);
  loadAllSupportedWeights?.(selectedBodyFont);

  // F) Apply heading/body fonts
  applyFontToElements(selectedHeadingFont, '[preview="heading"]');
  applyFontToElements(selectedBodyFont, '[preview="body"]');

  // G) Apply line-height & letter-spacing
  applyTypographySettings(
    '[preview="heading"]',
    headingLineHeight,
    headingLetterSpacing
  );
  applyTypographySettings(
    '[preview="body"]',
    bodyLineHeight,
    bodyLetterSpacing
  );

  // H) Apply font weights
  applyFontWeightToElements('[preview="heading"]', headingFontWeight);
  applyFontWeightToElements('[preview="body"]', bodyFontWeight);

  // I) Capture + apply the font size scale
  // We'll recapture "original size" for each element, then apply the scale
  captureOriginalFontSizes('[preview="heading"]');
  applyFontSizeScale('[preview="heading"]', headingSizeScale);

  captureOriginalFontSizes('[preview="body"]');
  applyFontSizeScale('[preview="body"]', bodySizeScale);

  // J) Update text for [font-name="heading"/"body"]
  updateFontNameElements("heading", selectedHeadingFont);
  updateFontNameElements("body", selectedBodyFont);

  // K) Initialize slider inputs & display (line-height, letter-spacing)
  if (headingLineHeightInput) {
    headingLineHeightInput.value = headingLineHeight;
    if (headingLineHeightDisplay) {
      headingLineHeightDisplay.textContent = headingLineHeight.toFixed(2);
    }
  }
  if (headingLetterSpacingInput) {
    headingLetterSpacingInput.value = headingLetterSpacing;
    if (headingLetterSpacingDisplay) {
      headingLetterSpacingDisplay.textContent = headingLetterSpacing.toFixed(2);
    }
  }
  if (bodyLineHeightInput) {
    bodyLineHeightInput.value = bodyLineHeight;
    if (bodyLineHeightDisplay) {
      bodyLineHeightDisplay.textContent = bodyLineHeight.toFixed(2);
    }
  }
  if (bodyLetterSpacingInput) {
    bodyLetterSpacingInput.value = bodyLetterSpacing;
    if (bodyLetterSpacingDisplay) {
      bodyLetterSpacingDisplay.textContent = bodyLetterSpacing.toFixed(2);
    }
  }

  // L) Initialize font-weight sliders
  setupHeadingWeightSlider(selectedHeadingFont, headingFontWeight);
  setupBodyWeightSlider(selectedBodyFont, bodyFontWeight);

  // M) Initialize font-size scale sliders
  if (headingSizeSlider) {
    headingSizeSlider.value = headingSizeScale;
    if (headingSizeDisplay) {
      headingSizeDisplay.textContent = headingSizeScale.toFixed(2) + "x";
    }
  }
  if (bodySizeSlider) {
    bodySizeSlider.value = bodySizeScale;
    if (bodySizeDisplay) {
      bodySizeDisplay.textContent = bodySizeScale.toFixed(2) + "x";
    }
  }

  // N) Update the Google Fonts links
  updateFontUrls(selectedHeadingFont, selectedBodyFont);

  // O) Remove skeleton overlays
  document.querySelectorAll("[preview]").forEach((el) => {
    el.classList.remove("skeleton");
  });
  console.log("Skeletons removed");
}

// --------------------------------------------------------------
// 4) Font Weight Logic (already in your script)
// --------------------------------------------------------------
function applyFontWeightToElements(selector, weightValue) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.fontWeight = weightValue;
  });
}

// Setting up heading weight
function setupHeadingWeightSlider(fontFamily, chosenWeight) {
  if (!headingWeightSlider) return;
  const weights = fontWeightsMap?.[fontFamily];
  if (!weights || !weights.length) {
    headingWeightSlider.min = 0;
    headingWeightSlider.max = 0;
    headingWeightSlider.value = 0;
    headingWeightDisplay.textContent = chosenWeight;
    return;
  }
  headingWeightSlider.min = 0;
  headingWeightSlider.max = weights.length - 1;
  headingWeightSlider.step = 1;
  let idx = weights.indexOf(chosenWeight);
  if (idx === -1) idx = 0;
  headingWeightSlider.value = idx;
  headingWeightDisplay.textContent = weights[idx];
}

function setupBodyWeightSlider(fontFamily, chosenWeight) {
  if (!bodyWeightSlider) return;
  const weights = fontWeightsMap?.[fontFamily];
  if (!weights || !weights.length) {
    bodyWeightSlider.min = 0;
    bodyWeightSlider.max = 0;
    bodyWeightSlider.value = 0;
    bodyWeightDisplay.textContent = chosenWeight;
    return;
  }
  bodyWeightSlider.min = 0;
  bodyWeightSlider.max = weights.length - 1;
  bodyWeightSlider.step = 1;
  let idx = weights.indexOf(chosenWeight);
  if (idx === -1) idx = 0;
  bodyWeightSlider.value = idx;
  bodyWeightDisplay.textContent = weights[idx];
}

// Listen for heading weight changes
if (headingWeightSlider) {
  headingWeightSlider.addEventListener("input", (e) => {
    const idx = parseInt(e.target.value, 10);
    const weights = fontWeightsMap?.[selectedHeadingFont];
    if (!weights || idx < 0 || idx >= weights.length) return;
    headingFontWeight = weights[idx];
    applyFontWeightToElements('[preview="heading"]', headingFontWeight);
    localStorage.setItem("headingFontWeight", headingFontWeight);
    headingWeightDisplay.textContent = headingFontWeight;
    console.log(`Heading weight => ${headingFontWeight}`);
  });
}
// Listen for body weight changes
if (bodyWeightSlider) {
  bodyWeightSlider.addEventListener("input", (e) => {
    const idx = parseInt(e.target.value, 10);
    const weights = fontWeightsMap?.[selectedBodyFont];
    if (!weights || idx < 0 || idx >= weights.length) return;
    bodyFontWeight = weights[idx];
    applyFontWeightToElements('[preview="body"]', bodyFontWeight);
    localStorage.setItem("bodyFontWeight", bodyFontWeight);
    bodyWeightDisplay.textContent = bodyFontWeight;
    console.log(`Body weight => ${bodyFontWeight}`);
  });
}

// --------------------------------------------------------------
// 5) Font Size Scaling Logic (NEW)
// --------------------------------------------------------------

/**
 * Captures the current computed font-size for each matching element
 * and stores it in a data attribute, so we can scale it later.
 */
function captureOriginalFontSizes(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    // only if not already captured
    if (!el.dataset.originalFontSize) {
      const sizePx = parseFloat(getComputedStyle(el).fontSize);
      el.dataset.originalFontSize = sizePx;
    }
  });
}

/**
 * Apply a multiplicative scale to each element's original size
 */
function applyFontSizeScale(selector, scale) {
  document.querySelectorAll(selector).forEach((el) => {
    if (!el.dataset.originalFontSize) {
      // fallback if not captured
      const baseSize = parseFloat(getComputedStyle(el).fontSize);
      el.dataset.originalFontSize = baseSize;
    }
    const original = parseFloat(el.dataset.originalFontSize);
    const newSize = original * scale;
    el.style.fontSize = newSize + "px";
  });
}

// Listen for heading size scale changes
if (headingSizeSlider) {
  headingSizeSlider.addEventListener("input", (e) => {
    headingSizeScale = parseFloat(e.target.value);
    localStorage.setItem("headingSizeScale", headingSizeScale);
    applyFontSizeScale('[preview="heading"]', headingSizeScale);
    if (headingSizeDisplay) {
      headingSizeDisplay.textContent = headingSizeScale.toFixed(2) + "x";
    }
    console.log("Heading size scale =>", headingSizeScale);
  });
}
// Listen for body size scale changes
if (bodySizeSlider) {
  bodySizeSlider.addEventListener("input", (e) => {
    bodySizeScale = parseFloat(e.target.value);
    localStorage.setItem("bodySizeScale", bodySizeScale);
    applyFontSizeScale('[preview="body"]', bodySizeScale);
    if (bodySizeDisplay) {
      bodySizeDisplay.textContent = bodySizeScale.toFixed(2) + "x";
    }
    console.log("Body size scale =>", bodySizeScale);
  });
}

// --------------------------------------------------------------
// 6) Opening the Font Modal (heading/body) => existing logic
// --------------------------------------------------------------
document.querySelectorAll("[font]").forEach((el) => {
  el.addEventListener("click", async () => {
    currentFontType = el.getAttribute("font");
    await initFontModal?.();
    document.getElementById("modal-wrapper").style.transform = "translateX(0)";
    updateFontModalState(currentFontType);
  });
});

// --------------------------------------------------------------
// 7) updateFontModalState => existing logic
// --------------------------------------------------------------
function updateFontModalState(fontType) {
  const selectingText = document.getElementById("selecting-text");
  const fontSearch = document.getElementById("font-search");
  if (fontSearch) fontSearch.value = "";

  if (fontType === "heading") {
    selectingText.textContent = "Heading";
    selectingText.style.backgroundColor = "var(--base-color-brand--heading)";
  } else {
    selectingText.textContent = "Body";
    selectingText.style.backgroundColor = "var(--base-color-brand--body)";
  }

  const currentFont =
    fontType === "heading" ? selectedHeadingFont : selectedBodyFont;
  if (typeof getFontCategory === "function") {
    const derivedCategory = getFontCategory(currentFont);
    currentCategory = derivedCategory;
    let fonts;
    if (currentCategory === "sans-serif") fonts = sansSerifFonts;
    else if (currentCategory === "serif") fonts = serifFonts;
    else if (currentCategory === "display") fonts = displayFonts;
    else if (currentCategory === "monospace") fonts = monospaceFonts;
    else fonts = sansSerifFonts;

    resetFontModal(fonts);
    setActiveButton(currentCategory);
  }

  hoistSelectedFont(currentFont, fontListContainer);
  highlightSelectedFontInGrid(currentFont);

  // Show/hide relevant controls
  const headingControls = document.getElementById(
    "heading-typography-settings"
  );
  const bodyControls = document.getElementById("body-typography-settings");
  if (headingControls && bodyControls) {
    if (fontType === "heading") {
      headingControls.style.display = "block";
      bodyControls.style.display = "none";
    } else {
      headingControls.style.display = "none";
      bodyControls.style.display = "block";
    }
  }

  console.log(
    `Modal state updated for: ${fontType}, current font: ${currentFont}`
  );

  // re-initialize the weight slider if needed
  if (fontType === "heading") {
    loadAllSupportedWeights?.(selectedHeadingFont);
    setupHeadingWeightSlider(selectedHeadingFont, headingFontWeight);
  } else {
    loadAllSupportedWeights?.(selectedBodyFont);
    setupBodyWeightSlider(selectedBodyFont, bodyFontWeight);
  }
}

// --------------------------------------------------------------
// 8) When a Font is Selected from the Grid => existing logic
// --------------------------------------------------------------
function applyFontSelection(fontFamily) {
  if (currentFontType === "heading") {
    selectedHeadingFont = fontFamily;
    applyFontToElements(fontFamily, '[preview="heading"]');
    applyTypographySettings(
      '[preview="heading"]',
      headingLineHeight,
      headingLetterSpacing
    );
    updateFontNameElements("heading", fontFamily);

    // load real weights
    loadAllSupportedWeights?.(fontFamily);
    const weights = fontWeightsMap?.[fontFamily];
    if (weights && weights.length) {
      headingFontWeight = weights.includes(700) ? 700 : weights[0];
      localStorage.setItem("headingFontWeight", headingFontWeight);
      applyFontWeightToElements('[preview="heading"]', headingFontWeight);
      setupHeadingWeightSlider(fontFamily, headingFontWeight);
    }

    // Re-capture original sizes (the new font might have changed the base size)
    captureOriginalFontSizes('[preview="heading"]');
    // Re-apply the existing scale
    applyFontSizeScale('[preview="heading"]', headingSizeScale);

    console.log(`Heading font updated to: ${selectedHeadingFont}`);
  } else {
    selectedBodyFont = fontFamily;
    applyFontToElements(fontFamily, '[preview="body"]');
    applyTypographySettings(
      '[preview="body"]',
      bodyLineHeight,
      bodyLetterSpacing
    );
    updateFontNameElements("body", fontFamily);

    loadAllSupportedWeights?.(fontFamily);
    const weights = fontWeightsMap?.[fontFamily];
    if (weights && weights.length) {
      bodyFontWeight = weights.includes(400) ? 400 : weights[0];
      localStorage.setItem("bodyFontWeight", bodyFontWeight);
      applyFontWeightToElements('[preview="body"]', bodyFontWeight);
      setupBodyWeightSlider(fontFamily, bodyFontWeight);
    }

    // Re-capture original sizes for body
    captureOriginalFontSizes('[preview="body"]');
    applyFontSizeScale('[preview="body"]', bodySizeScale);

    console.log(`Body font updated to: ${selectedBodyFont}`);
  }

  // load fallback "400,700"
  loadFont(fontFamily);

  storeFontSelections();
  updateFontUrls(selectedHeadingFont, selectedBodyFont);
}

// --------------------------------------------------------------
// 9) storeFontSelections => same as before
// --------------------------------------------------------------
function storeFontSelections() {
  localStorage.setItem("selectedHeadingFont", selectedHeadingFont);
  localStorage.setItem("selectedBodyFont", selectedBodyFont);
  console.log("Fonts stored:", {
    heading: selectedHeadingFont,
    body: selectedBodyFont,
  });
}

// --------------------------------------------------------------
// 10) Apply a given font to [preview="heading"] or [preview="body"]
// --------------------------------------------------------------
function applyFontToElements(fontFamily, selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.style.fontFamily = fontFamily;
  });
}

// --------------------------------------------------------------
// 11) Apply line-height & letter-spacing
// --------------------------------------------------------------
function applyTypographySettings(selector, lineH, letterSp) {
  document.querySelectorAll(selector).forEach((el) => {
    if (el.getAttribute("spacing") === "fixed") return;
    el.style.lineHeight = lineH + "em";
    el.style.letterSpacing = letterSp + "em";
  });
}

// --------------------------------------------------------------
// 12) Update the text content of elements with font-name="..."
// --------------------------------------------------------------
function updateFontNameElements(fontType, fontFamily) {
  document.querySelectorAll(`[font-name="${fontType}"]`).forEach((el) => {
    el.textContent = fontFamily;
  });
}

// --------------------------------------------------------------
// 13) Modal Close => same as your script
// --------------------------------------------------------------
document.querySelectorAll("[closes-modal]").forEach((el) => {
  el.addEventListener("click", () => {
    document.getElementById("modal-wrapper").style.transform =
      "translateX(-100%)";

    if (typeof fontsLoaded !== "undefined" && fontsLoaded) {
      let fonts;
      if (currentCategory === "sans-serif") fonts = sansSerifFonts;
      else if (currentCategory === "serif") fonts = serifFonts;
      else if (currentCategory === "display") fonts = displayFonts;
      else if (currentCategory === "monospace") fonts = monospaceFonts;
      else fonts = sansSerifFonts;

      resetFontModal(fonts);
    }
  });
});

// --------------------------------------------------------------
// 14) Slider Event Listeners for Spacing => same as your script
// --------------------------------------------------------------
if (headingLineHeightInput) {
  headingLineHeightInput.addEventListener("input", (e) => {
    headingLineHeight = parseFloat(e.target.value);
    applyTypographySettings(
      '[preview="heading"]',
      headingLineHeight,
      headingLetterSpacing
    );
    localStorage.setItem("headingLineHeight", headingLineHeight);

    if (headingLineHeightDisplay) {
      headingLineHeightDisplay.textContent = headingLineHeight.toFixed(2);
    }
  });
}
if (headingLetterSpacingInput) {
  headingLetterSpacingInput.addEventListener("input", (e) => {
    headingLetterSpacing = parseFloat(e.target.value);
    applyTypographySettings(
      '[preview="heading"]',
      headingLineHeight,
      headingLetterSpacing
    );
    localStorage.setItem("headingLetterSpacing", headingLetterSpacing);

    if (headingLetterSpacingDisplay) {
      headingLetterSpacingDisplay.textContent = headingLetterSpacing.toFixed(2);
    }
  });
}
if (bodyLineHeightInput) {
  bodyLineHeightInput.addEventListener("input", (e) => {
    bodyLineHeight = parseFloat(e.target.value);
    applyTypographySettings(
      '[preview="body"]',
      bodyLineHeight,
      bodyLetterSpacing
    );
    localStorage.setItem("bodyLineHeight", bodyLineHeight);

    if (bodyLineHeightDisplay) {
      bodyLineHeightDisplay.textContent = bodyLineHeight.toFixed(2);
    }
  });
}
if (bodyLetterSpacingInput) {
  bodyLetterSpacingInput.addEventListener("input", (e) => {
    bodyLetterSpacing = parseFloat(e.target.value);
    applyTypographySettings(
      '[preview="body"]',
      bodyLineHeight,
      bodyLetterSpacing
    );
    localStorage.setItem("bodyLetterSpacing", bodyLetterSpacing);

    if (bodyLetterSpacingDisplay) {
      bodyLetterSpacingDisplay.textContent = bodyLetterSpacing.toFixed(2);
    }
  });
}

// --------------------------------------------------------------
// 15) Helpers: hoistSelectedFont, highlightSelectedFontInGrid
// --------------------------------------------------------------
function hoistSelectedFont(selectedFont, container) {
  const allRadios = Array.from(container.querySelectorAll(".font-radio"));
  const selectedFontElement = allRadios.find((radio) => {
    const input = radio.querySelector('input[type="radio"]');
    return input && input.value === selectedFont;
  });
  if (!selectedFontElement) return;

  const remaining = allRadios.filter((r) => r !== selectedFontElement);
  container.innerHTML = "";
  container.appendChild(selectedFontElement);
  remaining.forEach((r) => container.appendChild(r));
}

function highlightSelectedFontInGrid(fontFamily) {
  document
    .querySelectorAll('.font-radio input[type="radio"]')
    .forEach((input) => {
      input.checked = input.value === fontFamily;
    });
}

// --------------------------------------------------------------
// 16) Update Google Fonts URL Links
// --------------------------------------------------------------
function updateFontUrls(headingFont, bodyFont) {
  if (headingFontUrlEl) {
    headingFontUrlEl.href = generateGoogleFontsUrl(headingFont);
  }
  if (bodyFontUrlEl) {
    bodyFontUrlEl.href = generateGoogleFontsUrl(bodyFont);
  }
}

function generateGoogleFontsUrl(fontName) {
  const encoded = fontName.trim().replace(/\s+/g, "+");
  return `https://fonts.google.com/specimen/${encoded}`;
}

// --------------------------------------------------------------
// 17) Force all numeric weights for the selected fonts, then load them
// --------------------------------------------------------------
(async () => {
  // If lazyFonts.js is loaded, call forceAllUsedWeights
  if (typeof forceAllUsedWeights === "function") {
    // We do this before calling loadStoredFonts so real weights are available
    await forceAllUsedWeights([selectedHeadingFont, selectedBodyFont]);
  }
  loadStoredFonts();
})();
