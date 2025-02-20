// ********************************************
// 1) BASIC MODAL OPEN/CLOSE
// ********************************************
const colorModal = document.getElementById("modal-wrapper-color");

// Show color modal on elements with trigger="color"
document.querySelectorAll('[trigger="color"]').forEach((el) => {
  el.addEventListener("click", () => {
    colorModal.style.transform = "translateX(0)";
    updateColorModalState(); // sets correct mode, category, etc.
  });
});

// Hide color modal on elements with closes-modal
colorModal.querySelectorAll("[closes-modal]").forEach((el) => {
  el.addEventListener("click", () => {
    colorModal.style.transform = "translateX(-100%)";
  });
});

// ********************************************
// 2) "POPULAR" MODE (RADIO-BASED) COLOR COMBOS
// ********************************************
document
  .querySelectorAll('#color-combo-list .color-radio input[type="radio"]')
  .forEach((radio) => {
    radio.addEventListener("change", (e) => {
      const parentLabel = e.target.parentElement;
      const bgColor = window.getComputedStyle(parentLabel).backgroundColor;
      const txtColor = window.getComputedStyle(parentLabel).color;

      // Save these colors for "popular" mode
      saveColorSelection(bgColor, txtColor);

      // If the user is currently in "popular" mode, apply them immediately
      const currentMode =
        localStorage.getItem("selectedColorMode") || "popular";
      if (currentMode === "popular") {
        applyColors(bgColor, txtColor);
      }

      updateSelectedState(radio);
    });
  });

// Visually mark one .color-radio as selected
function updateSelectedState(radio) {
  document
    .querySelectorAll("#color-combo-list .color-radio")
    .forEach((label) => label.classList.remove("selected"));
  radio.parentElement.classList.add("selected");
}

// Save "popular" combo to localStorage
function saveColorSelection(backgroundColor, textColor) {
  localStorage.setItem("selectedBackgroundColor", backgroundColor);
  localStorage.setItem("selectedTextColor", textColor);
  console.log("Popular color saved:", { backgroundColor, textColor });
}

// Load any previously saved "popular" color combo
function loadColorSelection() {
  const savedBg = localStorage.getItem("selectedBackgroundColor");
  const savedTxt = localStorage.getItem("selectedTextColor");

  if (savedBg && savedTxt) {
    // Try to find a matching radio
    const matchingRadio = Array.from(
      document.querySelectorAll("#color-combo-list .color-radio")
    ).find((label) => {
      const labelBg = window.getComputedStyle(label).backgroundColor;
      const labelTxt = window.getComputedStyle(label).color;
      return labelBg === savedBg && labelTxt === savedTxt;
    });
    if (matchingRadio) {
      const inputEl = matchingRadio.querySelector('input[type="radio"]');
      inputEl.checked = true;
      updateSelectedState(inputEl);
    }
  } else {
    // Optionally set a default
    const defaultRadio = document.querySelector(
      '#color-combo-list .color-radio[name="default"]'
    );
    if (defaultRadio) {
      const defaultBg = window.getComputedStyle(defaultRadio).backgroundColor;
      const defaultTxt = window.getComputedStyle(defaultRadio).color;
      // Mark it checked
      const inputEl = defaultRadio.querySelector('input[type="radio"]');
      if (inputEl) {
        inputEl.checked = true;
        updateSelectedState(inputEl);
      }
      // Save so next time we know
      saveColorSelection(defaultBg, defaultTxt);
    }
  }
}

// ********************************************
// 3) CUSTOM MODE (TEXT INPUTS)
// ********************************************
const customTextInput = document.getElementById("custom-text-color");
const customBgInput = document.getElementById("custom-background-color");

// Apply custom colors if "custom" mode is active
function handleCustomInputChange() {
  const currentMode = localStorage.getItem("selectedColorMode") || "popular";
  if (currentMode === "custom") {
    const bgColor = customBgInput.value;
    const txtColor = customTextInput.value;
    applyColors(bgColor, txtColor);
    saveCustomColorSelection(bgColor, txtColor);
  }
}

// Save custom colors to localStorage
function saveCustomColorSelection(backgroundColor, textColor) {
  localStorage.setItem("customBackgroundColor", backgroundColor);
  localStorage.setItem("customTextColor", textColor);
  console.log("Custom color saved:", { backgroundColor, textColor });
}

// Load previously saved custom colors into the text inputs
function loadCustomColorSelection() {
  const savedBg = localStorage.getItem("customBackgroundColor");
  const savedTxt = localStorage.getItem("customTextColor");
  if (savedBg) customBgInput.value = savedBg;
  if (savedTxt) customTextInput.value = savedTxt;
}

// ********************************************
// 4) PICKR: REPLACING NATIVE <input type="color">
//    + EYEDROPPER BUTTON
// ********************************************
const pickrText = Pickr.create({
  el: "#picker-text", // The clickable square for TEXT color
  useAsButton: true, // Clicking it opens popover
  theme: "nano", // or 'classic', 'monolith', etc.
  default: customTextInput.value,
  position: "bottom-start",
  swatches: ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF"],
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      hex: true,
      rgba: true,
      input: true,
      save: true,
    },
  },
});

// *** Insert an "Eyedropper" button into pickrText UI after it initializes
pickrText.on("init", (instance) => {
  addEyedropperButton(pickrText);
});

// When pickr changes, update input + the preview square's background
pickrText.on("change", (color) => {
  const hex = color.toHEXA().toString();
  customTextInput.value = hex;
  document.getElementById("picker-text").style.backgroundColor = hex;
  handleCustomInputChange();
});

pickrText.on("save", (color) => {
  const hex = color.toHEXA().toString();
  customTextInput.value = hex;
  document.getElementById("picker-text").style.backgroundColor = hex;
  handleCustomInputChange();
  //pickrText.hide(); // close popover
});

// If user types in the text input, update pickr
customTextInput.addEventListener("change", () => {
  pickrText.setColor(customTextInput.value);
  handleCustomInputChange();
});

// Now the background pickr
const pickrBg = Pickr.create({
  el: "#picker-background",
  useAsButton: true,
  theme: "nano",
  default: customBgInput.value,
  position: "bottom-start",
  swatches: ["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF"],
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      hex: true,
      rgba: true,
      input: true,
      save: true,
    },
  },
});

// *** Eyedropper button for the background pickr as well
pickrBg.on("init", (instance) => {
  addEyedropperButton(pickrBg);
});

pickrBg.on("change", (color) => {
  const hex = color.toHEXA().toString();
  customBgInput.value = hex;
  document.getElementById("picker-background").style.backgroundColor = hex;
  handleCustomInputChange();
});

pickrBg.on("save", (color) => {
  const hex = color.toHEXA().toString();
  customBgInput.value = hex;
  document.getElementById("picker-background").style.backgroundColor = hex;
  handleCustomInputChange();
  //pickrBg.hide();
});

// If user types in the background input
customBgInput.addEventListener("change", () => {
  pickrBg.setColor(customBgInput.value);
  handleCustomInputChange();
});

// Helper function to insert an Eyedropper button in the pickr UI
function addEyedropperButton(pickrInstance) {
  // 1) Get pickr's root elements
  const pickrRoot = pickrInstance.getRoot();
  // pickrRoot.interaction.options is the container for the input/save buttons

  // 2) Create a new button
  const eyeDropperBtn = document.createElement("button");
  eyeDropperBtn.className = "pcr-eyedropper-btn"; // CSS class for styling
  eyeDropperBtn.type = "button";
  eyeDropperBtn.innerHTML = `
  <svg aria-hidden="true" focusable="false"
       viewBox="0 0 512 512" width="14" height="14">
    <!-- Example "eye-dropper" icon path from Font Awesome -->
    <path fill="currentColor"
          d="M461.6 50.4c-28.2-28.2-73.8-28.2-102 0l-18.3 18.3-17.8-17.8c-7.8-7.8-20.5-7.8-28.3 0l-29 29c-7.8 7.8-7.8 20.5 0 28.3l17.8 17.8-257.2 257.2c-2.1 2.1-3.5 4.8-4.1 7.7l-9.5 47.6c-1.3 6.4 0.7 13 5.3 17.6 3.8 3.8 8.9 5.8 14.2 5.8 1.5 0 3.1-0.2 4.6-0.5l47.6-9.5c2.9-0.6 5.5-2 7.7-4.1l257.2-257.2 17.8 17.8c7.8 7.8 20.5 7.8 28.3 0l29-29c7.8-7.8 7.8-20.5 0-28.3l-17.8-17.8 18.3-18.3c28.1-28.3 28.1-73.9-0.1-102.1z"></path>
  </svg>
`;

  // 3) Insert after the "Save" button, or fallback to .options container
  if (pickrRoot.interaction.save) {
    pickrRoot.interaction.save.parentNode.insertBefore(
      eyeDropperBtn,
      pickrRoot.interaction.save.nextSibling
    );
  } else {
    pickrRoot.interaction.options.appendChild(eyeDropperBtn);
  }

  // 4) Hook up the EyeDropper API if available
  if ("EyeDropper" in window) {
    eyeDropperBtn.addEventListener("click", async () => {
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        // e.g. result.sRGBHex -> "#1a1a1a"
        pickrInstance.setColor(result.sRGBHex); // update pickr UI
      } catch (err) {
        console.warn("EyeDropper cancelled or unavailable:", err);
      }
    });
  } else {
    // Hide the button if not supported
    eyeDropperBtn.style.display = "none";
  }
}

// ********************************************
// 5) APPLY COLORS TO [color="variable"], ETC.
// ********************************************
function applyColors(backgroundColor, textColor) {
  // color="variable"
  document.querySelectorAll('[color="variable"]').forEach((el) => {
    el.style.backgroundColor = backgroundColor;
    el.style.color = textColor;
  });
  // color="inverse"
  document.querySelectorAll('[color="inverse"]').forEach((el) => {
    el.style.backgroundColor = textColor;
    el.style.color = backgroundColor;
  });
  // background="font"
  document.querySelectorAll('[background="font"]').forEach((el) => {
    el.style.backgroundColor = textColor;
  });
  // background="background"
  document.querySelectorAll('[background="background"]').forEach((el) => {
    el.style.backgroundColor = backgroundColor;
  });

  console.log("Colors applied:", { backgroundColor, textColor });
}

// ********************************************
// 6) MODE SWITCHING: "POPULAR" VS. "CUSTOM"
// ********************************************
document.querySelectorAll(".color-modal_button[color-mode]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const chosenMode = btn.getAttribute("color-mode");
    setColorMode(chosenMode);
  });
});

function setColorMode(mode) {
  // Remove 'active' from all mode buttons
  document.querySelectorAll(".color-modal_button[color-mode]").forEach((b) => {
    b.classList.remove("active");
  });
  // Add 'active' to chosen
  const matchingBtn = document.querySelector(
    `.color-modal_button[color-mode="${mode}"]`
  );
  if (matchingBtn) matchingBtn.classList.add("active");

  const popularSection = document.getElementById("color-options-popular");
  const customSection = document.getElementById("color-options-custom");

  if (mode === "custom") {
    popularSection.style.display = "none";
    customSection.style.display = "block";

    const savedBg =
      localStorage.getItem("customBackgroundColor") || customBgInput.value;
    const savedTxt =
      localStorage.getItem("customTextColor") || customTextInput.value;

    // 1) Update the text inputs in case they differ
    customBgInput.value = savedBg;
    customTextInput.value = savedTxt;

    // 2) Make the pickers show the same color as the inputs
    pickrBg.setColor(savedBg);
    pickrText.setColor(savedTxt);

    // 3) Apply them to the page
    applyColors(savedBg, savedTxt);
  } else {
    mode = "popular";
    popularSection.style.display = "block";
    customSection.style.display = "none";
    // Apply the "popular" color
    const savedBg = localStorage.getItem("selectedBackgroundColor");
    const savedTxt = localStorage.getItem("selectedTextColor");
    if (savedBg && savedTxt) {
      applyColors(savedBg, savedTxt);
    }
  }
  localStorage.setItem("selectedColorMode", mode);
}

// ********************************************
// 7) CATEGORY FILTERING (OPTIONAL)
// ********************************************
function filterColorsByCategory(category) {
  document
    .querySelectorAll("#color-combo-list .color-modal_item")
    .forEach((item) => {
      if (
        category === "all" ||
        item.getAttribute("color-category") === category
      ) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });
}

document
  .querySelectorAll("#color-category-list [color-category]")
  .forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.getAttribute("color-category");
      document
        .querySelectorAll("#color-category-list [color-category]")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterColorsByCategory(cat);
    });
  });

// If you want to hoist the selected color item
function hoistSelectedColor(selectedItem) {
  const colorList = document.getElementById("color-combo-list");
  const remainingItems = Array.from(colorList.children).filter(
    (i) => i !== selectedItem
  );

  colorList.innerHTML = "";
  colorList.appendChild(selectedItem);
  remainingItems.forEach((i) => colorList.appendChild(i));
}

// ********************************************
// 8) UPDATE MODAL STATE WHEN OPENED
// ********************************************
function updateColorModalState() {
  // Show the correct category for the currently checked radio
  const selectedRadio = document.querySelector(
    '#color-combo-list .color-radio input[type="radio"]:checked'
  );
  if (selectedRadio) {
    const selectedItem = selectedRadio.closest(".color-modal_item");
    const selectedCategory = selectedItem.getAttribute("color-category");

    // Category button
    document
      .querySelectorAll("#color-category-list [color-category]")
      .forEach((b) => b.classList.remove("active"));
    const activeBtn = document.querySelector(
      `#color-category-list [color-category="${selectedCategory}"]`
    );
    if (activeBtn) activeBtn.classList.add("active");

    hoistSelectedColor(selectedItem);
    filterColorsByCategory(selectedCategory);
  }

  // Also set the correct mode (popular or custom)
  const savedMode = localStorage.getItem("selectedColorMode") || "popular";
  setColorMode(savedMode);
}

// ********************************************
// 9) RESET LOGIC (OPTIONAL)
// ********************************************
document.querySelector('[reset="color"]')?.addEventListener("click", () => {
  // Switch to popular
  localStorage.setItem("selectedColorMode", "popular");
  setColorMode("popular");

  // Find default radio
  const defaultColorRadio = document.querySelector(
    '#color-combo-list .color-radio[name="default"] input'
  );
  if (defaultColorRadio) {
    defaultColorRadio.checked = true;
    updateSelectedState(defaultColorRadio);

    // Grab default color from DOM
    const defaultBg = window.getComputedStyle(
      defaultColorRadio.parentElement
    ).backgroundColor;
    const defaultTxt = window.getComputedStyle(
      defaultColorRadio.parentElement
    ).color;

    // Apply to your [color="variable"], etc.
    applyColors(defaultBg, defaultTxt);

    // Save them as popular
    localStorage.setItem("selectedBackgroundColor", defaultBg);
    localStorage.setItem("selectedTextColor", defaultTxt);

    // Clear custom color keys so user starts fresh
    localStorage.removeItem("customBackgroundColor");
    localStorage.removeItem("customTextColor");

    // Reset the actual custom inputs to their defaultValue
    customBgInput.value = customBgInput.defaultValue;
    customTextInput.value = customTextInput.defaultValue;

    // Update the squares to show default colors
    document.getElementById("picker-background").style.backgroundColor =
      customBgInput.value;
    document.getElementById("picker-text").style.backgroundColor =
      customTextInput.value;

    console.log("Color reset to default popular color.");
  }
});

// ********************************************
// 10) INITIAL PAGE LOAD
// ********************************************

// A) Load saved "popular" combo & mark its radio
loadColorSelection();

// B) Load saved custom color into the custom inputs
loadCustomColorSelection();

// If you want to apply whichever mode was active last, do so immediately:
const initialMode = localStorage.getItem("selectedColorMode") || "popular";
if (initialMode === "custom") {
  const savedBg =
    localStorage.getItem("customBackgroundColor") || customBgInput.value;
  const savedTxt =
    localStorage.getItem("customTextColor") || customTextInput.value;
  applyColors(savedBg, savedTxt);
} else {
  const savedBg = localStorage.getItem("selectedBackgroundColor");
  const savedTxt = localStorage.getItem("selectedTextColor");
  if (savedBg && savedTxt) {
    applyColors(savedBg, savedTxt);
  }
}
