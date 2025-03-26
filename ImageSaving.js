document.addEventListener("DOMContentLoaded", () => {
  // Helper: show a short-lived tooltip below a button
  function showTooltip(button, text) {
    // ensure the button is position relative
    button.style.position = "relative";

    const tooltip = document.createElement("div");
    tooltip.className = "copy-tooltip";
    tooltip.textContent = text;
    button.appendChild(tooltip);

    // Force reflow
    tooltip.getBoundingClientRect();
    // fade in
    tooltip.classList.add("show");

    // fade out after 1.8s, remove after 2s
    setTimeout(() => {
      tooltip.classList.remove("show");
    }, 1800);

    setTimeout(() => {
      if (button.contains(tooltip)) {
        button.removeChild(tooltip);
      }
    }, 2000);
  }

  // 1) Opening the modal
  document.querySelectorAll("[save-component]").forEach((saveBtn) => {
    saveBtn.addEventListener("click", () => {
      const componentName = saveBtn.getAttribute("save-component");
      const targetEl = document.querySelector(`[component="${componentName}"]`);
      if (!targetEl) {
        console.warn(`No element found with [component="${componentName}"]`);
        return;
      }

      const saveCanvas = document.getElementById("save-canvas");
      if (!saveCanvas) {
        console.warn("#save-canvas not found!");
        return;
      }

      // Remove old .preview_component clones
      saveCanvas
        .querySelectorAll(".preview_component")
        .forEach((el) => el.remove());

      // Clone & append
      const clone = targetEl.cloneNode(true);
      saveCanvas.appendChild(clone);

      // Show the modal
      const saveWindow = document.getElementById("save-window");
      if (!saveWindow) return;

      saveWindow.style.display = "flex";
      // Hide body scroll
      document.body.style.overflow = "hidden";

      // Wait 50ms -> slide up
      setTimeout(() => {
        saveWindow.style.transform = "translateY(0%)";
      }, 50);

      // *** Turn the toggle on by default, ensure #save-styles is displayed
      const toggleEl = document.getElementById("toggle-styles");
      if (toggleEl) {
        toggleEl.checked = true; // re-enable
      }
      const saveStyles = document.getElementById("save-styles");
      if (saveStyles) {
        saveStyles.style.display = "grid";
      }
    });
  });

  // 2) The "Download" button
  const finalSaveBtn = document.getElementById("save-button");
  if (finalSaveBtn) {
    finalSaveBtn.addEventListener("click", () => {
      const saveCanvas = document.getElementById("save-canvas");
      if (!saveCanvas) return;

      html2canvas(saveCanvas)
        .then((canvas) => {
          const dataURL = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = "component.png";
          link.href = dataURL;
          link.click();
        })
        .catch((err) => {
          console.error("Failed to capture #save-canvas for download:", err);
        });
    });
  }

  // 3) The "Copy" button
  const copyBtn = document.getElementById("copy-button");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const saveCanvas = document.getElementById("save-canvas");
      if (!saveCanvas) return;

      try {
        const canvas = await html2canvas(saveCanvas);
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );
        if (!blob) throw new Error("Canvas blob is null");

        if (!navigator.clipboard || !window.ClipboardItem) {
          showTooltip(copyBtn, "Copy not supported");
          return;
        }

        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        showTooltip(copyBtn, "Copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy image to clipboard:", err);
        showTooltip(copyBtn, "Copy failed");
      }
    });
  }

  // 4) The toggle (#toggle-styles) to show/hide #save-styles
  const toggleEl = document.getElementById("toggle-styles");
  if (toggleEl) {
    toggleEl.addEventListener("change", () => {
      const saveStyles = document.getElementById("save-styles");
      if (!saveStyles) return;

      if (toggleEl.checked) {
        saveStyles.style.display = "grid";
      } else {
        saveStyles.style.display = "none";
      }
    });
  }

  // 5) The "Close" button (#close-save)
  const closeBtn = document.getElementById("close-save");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      const saveWindow = document.getElementById("save-window");
      if (!saveWindow) return;

      saveWindow.style.transform = "translateY(100%)";
      setTimeout(() => {
        saveWindow.style.display = "none";
        // re-enable body scrolling
        document.body.style.overflow = "visible";
      }, 300);
    });
  }
});
