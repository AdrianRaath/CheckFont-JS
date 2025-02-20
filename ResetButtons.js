// ================== Reset Buttons.js ==================

// Reset Font to Default
document.querySelector('[reset="font"]').addEventListener("click", () => {
  // 1) Reset heading and body fonts to default values
  selectedHeadingFont = "Inter"; // or your chosen default
  selectedBodyFont = "Open Sans"; // or your chosen default

  // 2) Also reset line-height & letter-spacing
  headingLineHeight = 1.2; // your default
  headingLetterSpacing = 0;
  bodyLineHeight = 1.5;
  bodyLetterSpacing = 0;

  // 3) **NEW**: reset heading/body font weight
  headingFontWeight = 700; // default heading weight
  bodyFontWeight = 400; // default body weight

  // 4) **NEW**: reset heading/body font size scale
  headingSizeScale = 1.0;
  bodySizeScale = 1.0;

  // 5) Update the font radios to reflect the defaults
  const headingFontRadio = document.querySelector(
    `#font-combo-list .font-radio input[value="${selectedHeadingFont}"]`
  );
  const bodyFontRadio = document.querySelector(
    `#font-combo-list .font-radio input[value="${selectedBodyFont}"]`
  );
  if (headingFontRadio) headingFontRadio.checked = true;
  if (bodyFontRadio) bodyFontRadio.checked = true;

  // 6) Apply the default fonts to the preview elements
  applyFontToElements(selectedHeadingFont, '[preview="heading"]');
  applyFontToElements(selectedBodyFont, '[preview="body"]');

  // 7) Apply the default spacing
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

  // 8) **NEW**: Apply the default weights
  applyFontWeightToElements('[preview="heading"]', headingFontWeight);
  applyFontWeightToElements('[preview="body"]', bodyFontWeight);

  // 9) **NEW**: Re-capture original font sizes, then apply scale=1
  captureOriginalFontSizes('[preview="heading"]');
  applyFontSizeScale('[preview="heading"]', headingSizeScale);

  captureOriginalFontSizes('[preview="body"]');
  applyFontSizeScale('[preview="body"]', bodySizeScale);

  // 10) Update the font names in the UI
  updateFontNameElements("heading", selectedHeadingFont);
  updateFontNameElements("body", selectedBodyFont);

  // 11) Update the slider UI and displays so the user sees they're back to defaults

  // line-height / letter-spacing (heading)
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
  // line-height / letter-spacing (body)
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

  // **NEW**: Update font weight sliders & displays
  if (headingWeightSlider) {
    // If we have an array of weights for 'Inter', pick correct index
    const weights = fontWeightsMap?.[selectedHeadingFont];
    if (weights && weights.length) {
      let idx = weights.indexOf(headingFontWeight);
      if (idx === -1) idx = 0;
      headingWeightSlider.min = 0;
      headingWeightSlider.max = weights.length - 1;
      headingWeightSlider.step = 1;
      headingWeightSlider.value = idx;
      headingWeightDisplay.textContent = weights[idx];
    } else {
      headingWeightSlider.min = 0;
      headingWeightSlider.max = 0;
      headingWeightSlider.value = 0;
      headingWeightDisplay.textContent = headingFontWeight;
    }
  }

  if (bodyWeightSlider) {
    const weights = fontWeightsMap?.[selectedBodyFont];
    if (weights && weights.length) {
      let idx = weights.indexOf(bodyFontWeight);
      if (idx === -1) idx = 0;
      bodyWeightSlider.min = 0;
      bodyWeightSlider.max = weights.length - 1;
      bodyWeightSlider.step = 1;
      bodyWeightSlider.value = idx;
      bodyWeightDisplay.textContent = weights[idx];
    } else {
      bodyWeightSlider.min = 0;
      bodyWeightSlider.max = 0;
      bodyWeightSlider.value = 0;
      bodyWeightDisplay.textContent = bodyFontWeight;
    }
  }

  // **NEW**: Update font size scale sliders & displays
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

  // 12) Save the reset fonts & spacing to localStorage
  storeFontSelections(); // saves selectedHeadingFont, selectedBodyFont
  localStorage.setItem("headingLineHeight", headingLineHeight);
  localStorage.setItem("headingLetterSpacing", headingLetterSpacing);
  localStorage.setItem("bodyLineHeight", bodyLineHeight);
  localStorage.setItem("bodyLetterSpacing", bodyLetterSpacing);

  // **NEW**: Save the reset font weight & size scale
  localStorage.setItem("headingFontWeight", headingFontWeight);
  localStorage.setItem("bodyFontWeight", bodyFontWeight);
  localStorage.setItem("headingSizeScale", headingSizeScale);
  localStorage.setItem("bodySizeScale", bodySizeScale);

  // 13) Update the Google Fonts links to reflect the new defaults
  updateFontUrls(selectedHeadingFont, selectedBodyFont);

  console.log("Font fully reset to defaults:", {
    headingFont: selectedHeadingFont,
    bodyFont: selectedBodyFont,
    headingLineHeight,
    headingLetterSpacing,
    bodyLineHeight,
    bodyLetterSpacing,
    headingFontWeight,
    bodyFontWeight,
    headingSizeScale,
    bodySizeScale,
  });
});

// --------------------------------------------------------------
// Reset Color to Default => unchanged
// --------------------------------------------------------------
document.querySelector('[reset="color"]').addEventListener("click", () => {
  localStorage.setItem("selectedColorMode", "popular");
  setColorMode("popular"); // Switch visually right away (if the modal is open)

  const defaultColorRadio = document.querySelector(
    '#color-combo-list .color-radio[name="default"] input'
  );
  if (defaultColorRadio) {
    defaultColorRadio.checked = true;
    updateSelectedState(defaultColorRadio);

    const defaultBackgroundColor = window.getComputedStyle(
      defaultColorRadio.parentElement
    ).backgroundColor;
    const defaultTextColor = window.getComputedStyle(
      defaultColorRadio.parentElement
    ).color;

    document.querySelectorAll('[color="variable"]').forEach((el) => {
      el.style.backgroundColor = defaultBackgroundColor;
      el.style.color = defaultTextColor;
    });
    document.querySelectorAll('[color="inverse"]').forEach((el) => {
      el.style.backgroundColor = defaultTextColor;
      el.style.color = defaultBackgroundColor;
    });

    localStorage.setItem("selectedBackgroundColor", defaultBackgroundColor);
    localStorage.setItem("selectedTextColor", defaultTextColor);

    localStorage.removeItem("customBackgroundColor");
    localStorage.removeItem("customTextColor");

    const customTextEl = document.getElementById("custom-text-color");
    const customBgEl = document.getElementById("custom-background-color");
    if (customTextEl && customBgEl) {
      customTextEl.value = customTextEl.defaultValue; // e.g. "#000000"
      customBgEl.value = customBgEl.defaultValue; // e.g. "#FFFFFF"
    }
    console.log("Color reset to default popular color, custom inputs cleared.");
  }
});
