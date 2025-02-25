document.addEventListener("DOMContentLoaded", () => {
  // 1) Create a single hidden file input for all containers
  const hiddenFileInput = document.createElement("input");
  hiddenFileInput.type = "file";
  hiddenFileInput.accept = "image/*";
  hiddenFileInput.style.display = "none";
  document.body.appendChild(hiddenFileInput);

  // 2) Function to read a file and apply it as background to a user-image container
  function applyImageToContainer(file, container, deleteBtn) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataURL = e.target.result;
      container.style.backgroundImage = `url("${dataURL}")`;
      container.style.backgroundSize = "cover";
      container.style.backgroundPosition = "center";

      // Show the delete button
      if (deleteBtn) deleteBtn.style.display = "flex";
    };
    reader.readAsDataURL(file);
  }

  // 3) For each [user-image] container
  document.querySelectorAll("[user-image]").forEach((userImageEl) => {
    // Find the child [user-image-upload] overlay
    const uploadOverlay = userImageEl.querySelector("[user-image-upload]");
    if (!uploadOverlay) return;

    // Inside overlay, find .preview_image-button and .preview_image-delete
    const uploadBtn = uploadOverlay.querySelector(".preview_image-button");
    const deleteBtn = uploadOverlay.querySelector(".preview_image-delete");

    // Hide delete btn by default
    if (deleteBtn) {
      deleteBtn.style.display = "none";
      // Delete -> remove background + hide button
      deleteBtn.addEventListener("click", () => {
        userImageEl.style.backgroundImage = "none";
        deleteBtn.style.display = "none";
      });
    }

    // A) Existing "Upload Image" button logic
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        // On file input change
        hiddenFileInput.onchange = (e) => {
          const file = e.target.files[0];
          applyImageToContainer(file, userImageEl, deleteBtn);
          hiddenFileInput.value = ""; // reset so user can pick same file again if desired
        };
        hiddenFileInput.click(); // open the file picker
      });
    }

    // B) Drag & Drop logic for the userImageEl
    //  - highlight on dragover, read file on drop
    userImageEl.addEventListener("dragover", (e) => {
      e.preventDefault(); // allow drop
      userImageEl.classList.add("dragover");
    });

    userImageEl.addEventListener("dragleave", (e) => {
      userImageEl.classList.remove("dragover");
    });

    userImageEl.addEventListener("drop", (e) => {
      e.preventDefault();
      userImageEl.classList.remove("dragover");

      // Only handle the first file for simplicity
      const file = e.dataTransfer.files[0];
      applyImageToContainer(file, userImageEl, deleteBtn);
    });
  });
});
