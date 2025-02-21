// ========================= lazyFonts.js =========================
document.addEventListener("DOMContentLoaded", () => {
  // References to UI elements
  const fontListContainer = document.getElementById("font-list");
  const searchInput = document.getElementById("font-search");

  // Globals for storing fonts
  let sansSerifFonts = [];
  let serifFonts = [];
  let displayFonts = [];
  let monospaceFonts = [];

  let currentCategory = "sans-serif"; // default
  let fontsLoaded = false;
  let searchDebounceTimer = null;

  // NEW: A map from "Inter" -> [100,200,300,400,700], etc.
  const fontWeightsMap = {};

  // A boolean flag so we don't double-attach modal listeners
  window.modalListenersAttached = false;

  /**
   * Called on-demand when the user opens the modal.
   */
  async function initFontModal() {
    // If we haven't fetched data yet, do so now
    if (!fontsLoaded) {
      await loadFontsFromGoogle();
      fontsLoaded = true;
      console.log("Fonts fetched from Google for the modal.");
    }

    // Attach the category filter and search event listeners ONLY once
    if (!window.modalListenersAttached) {
      // Category filter buttons
      document.querySelectorAll(".font-modal_button").forEach((button) => {
        button.addEventListener("click", () => {
          currentCategory = button.getAttribute("data-category");
          setActiveButton(currentCategory);

          setTimeout(() => {
            let fonts;
            if (currentCategory === "sans-serif") fonts = sansSerifFonts;
            else if (currentCategory === "serif") fonts = serifFonts;
            else if (currentCategory === "display") fonts = displayFonts;
            else if (currentCategory === "monospace") fonts = monospaceFonts;
            else fonts = sansSerifFonts;

            resetFontModal(fonts);
          }, 0);
        });
      });

      // Debounced search input
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          clearTimeout(searchDebounceTimer);
          searchDebounceTimer = setTimeout(() => {
            const searchTerm = searchInput.value.trim().toLowerCase();
            let fonts;
            if (currentCategory === "sans-serif") fonts = sansSerifFonts;
            else if (currentCategory === "serif") fonts = serifFonts;
            else if (currentCategory === "display") fonts = displayFonts;
            else if (currentCategory === "monospace") fonts = monospaceFonts;
            else fonts = sansSerifFonts;

            searchFonts(searchTerm, fonts);
          }, 200);
        });
      }

      window.modalListenersAttached = true;
      console.log("Modal listeners attached (category filter & search).");
    }

    // Default category => "sans-serif"
    renderFonts(sansSerifFonts);
    setActiveButton("sans-serif");
    console.log("initFontModal: rendered default category (sans-serif).");
  }

  /**
   * Fetch the Google Fonts list (all categories).
   */
  async function loadFontsFromGoogle() {
    // Replace with your actual API key
    const apiKey = "AIzaSyAIsq1PhLCl2_uL0qEI2ep379Zf3eH6IFs";
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`
    );
    const data = await response.json();

    // Limit each category to top 100 for performance
    sansSerifFonts = data.items
      .filter((f) => f.category === "sans-serif")
      .slice(0, 200);
    serifFonts = data.items.filter((f) => f.category === "serif").slice(0, 100);
    displayFonts = data.items
      .filter((f) => f.category === "display")
      .slice(0, 100);
    monospaceFonts = data.items
      .filter((f) => f.category === "monospace")
      .slice(0, 100);

    // Build fontWeightsMap for each font
    data.items.forEach((font) => {
      fontWeightsMap[font.family] = parseNumericWeights(font.variants);
    });
    console.log(
      "loadFontsFromGoogle(): Built fontWeightsMap with numeric weights"
    );
  }

  /**
   * parseNumericWeights(["100","300","regular","700italic"]) => [100,300,400,700]
   */
  function parseNumericWeights(variants) {
    const numericWeights = [];
    variants.forEach((variant) => {
      let base = variant.replace("italic", "");
      if (base === "") base = "400"; // "italic" alone => 400
      if (base === "regular") base = "400";

      const weightNum = parseInt(base, 10);
      if (!isNaN(weightNum) && !numericWeights.includes(weightNum)) {
        numericWeights.push(weightNum);
      }
    });
    numericWeights.sort((a, b) => a - b);
    return numericWeights;
  }

  /**
   * If you want to load ALL supported numeric weights for a chosen font,
   */
  function loadAllSupportedWeights(fontFamily) {
    const weights = fontWeightsMap[fontFamily];
    if (!weights || !weights.length) {
      // fallback: just load 400,700
      loadFont(fontFamily);
      return;
    }

    const linkId = `allwght-${fontFamily.replace(/\s+/g, "-")}`;
    if (!document.getElementById(linkId)) {
      const wghtList = weights.join(";");
      const encoded = encodeURIComponent(fontFamily);
      const link = document.createElement("link");
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@${wghtList}&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }

  /**
   * loadFont(fontFamily) => fallback "400,700"
   */
  function loadFont(fontFamily) {
    const linkId = `gfont-${fontFamily.replace(/\s+/g, "-")}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        fontFamily
      )}:wght@400;700&display=swap`;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }

  /**
   * Renders the given fonts in incremental chunks,
   * ensuring the "active" font (heading/body) is at the front if present.
   */
  function renderFonts(fonts) {
    fontListContainer.innerHTML = "";

    const currentFont =
      currentFontType === "heading" ? selectedHeadingFont : selectedBodyFont;
    const reordered = reorderActiveFont(fonts.slice(), currentFont);

    chunkRender(reordered, 25, () => {
      console.log(`All fonts for category loaded (in chunks).`);
    });
  }

  function reorderActiveFont(fontArray, activeFontName) {
    const idx = fontArray.findIndex((f) => f.family === activeFontName);
    if (idx > 0) {
      const [found] = fontArray.splice(idx, 1);
      fontArray.unshift(found);
    }
    return fontArray;
  }

  function chunkRender(fontArray, chunkSize, onComplete) {
    let index = 0;

    function renderNextChunk() {
      if (index >= fontArray.length) {
        if (onComplete) onComplete();
        return;
      }
      const slice = fontArray.slice(index, index + chunkSize);
      index += chunkSize;

      const fragment = document.createDocumentFragment();
      slice.forEach((font) => {
        const label = createFontLabel(font.family);
        fragment.appendChild(label);
        // Preload fallback "400,700" for label preview
        loadFont(font.family);
      });
      fontListContainer.appendChild(fragment);

      setTimeout(renderNextChunk, 0);
    }
    renderNextChunk();
  }

  function createFontLabel(fontFamily) {
    const label = document.createElement("label");
    label.className = "font-radio";
    label.innerHTML = `
    <input type="radio" name="font-selection" value="${fontFamily}" />
    <span style="font-family: '${fontFamily}';">${fontFamily}</span>
  `;
    label
      .querySelector('input[type="radio"]')
      .addEventListener("change", (e) => {
        applyFontSelection(e.target.value);
      });
    return label;
  }

  function searchFonts(searchTerm, fonts) {
    if (!searchTerm) {
      renderFonts(fonts);
      return;
    }
    let filtered = fonts.filter((font) =>
      font.family.toLowerCase().includes(searchTerm)
    );
    filtered = reorderActiveFont(
      filtered,
      currentFontType === "heading" ? selectedHeadingFont : selectedBodyFont
    );

    fontListContainer.innerHTML = "";
    chunkRender(filtered, 25, () => {
      console.log(
        `Done chunk-search rendering. Found ${filtered.length} fonts.`
      );
    });
  }

  function resetFontModal(fonts) {
    const searchInputEl = document.getElementById("font-search");
    if (searchInputEl) {
      searchInputEl.value = "";
    }

    renderFonts(fonts);

    const currentFont =
      currentFontType === "heading" ? selectedHeadingFont : selectedBodyFont;
    hoistSelectedFont(currentFont, fontListContainer);
    highlightSelectedFontInGrid(currentFont);

    console.log("Modal reset with current font:", currentFont);
  }

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

  function setActiveButton(category) {
    document.querySelectorAll(".font-modal_button").forEach((btn) => {
      btn.classList.remove("active");
      if (btn.getAttribute("data-category") === category) {
        btn.classList.add("active");
      }
    });
  }

  function getFontCategory(fontName) {
    if (sansSerifFonts.some((f) => f.family === fontName)) return "sans-serif";
    if (serifFonts.some((f) => f.family === fontName)) return "serif";
    if (displayFonts.some((f) => f.family === fontName)) return "display";
    if (monospaceFonts.some((f) => f.family === fontName)) return "monospace";
    return "sans-serif";
  }

  /**
   * Force all numeric weights for the fonts we need on page load
   */
  async function forceAllUsedWeights(fontsArray) {
    if (!fontsLoaded) {
      await loadFontsFromGoogle();
      fontsLoaded = true;
    }
    fontsArray.forEach((fontName) => {
      if (fontName) loadAllSupportedWeights(fontName);
    });
    console.log(
      "forceAllUsedWeights: loaded all numeric weights for",
      fontsArray
    );
  }
});
