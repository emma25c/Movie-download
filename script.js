const botToken = '8199112360:AAGJJIVGbctZGWy8EDTjN5kpiktuEY9wJFE';  // ✔ guillemet corrigé
const chatId = '7575968473';

const selectFolderBtn = document.getElementById('selectFolderBtn');
const fileInput = document.getElementById('fileInput');
const form = document.getElementById('uploadForm');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const folderStatus = document.getElementById('folderStatus');

let selectedFiles = [];

selectFolderBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  selectedFiles = Array.from(fileInput.files);
  folderStatus.textContent = selectedFiles.length > 0 ? '✅ Folder selected' : '';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (selectedFiles.length === 0) {
    alert('Please select a folder with movies!');
    return;
  }

  progressContainer.style.display = 'block';
  progressText.textContent = 'Uploading... 0%';
  progressFill.style.width = '0%';
  progressText.style.color = '#eee';

  const total = selectedFiles.length;
  let uploadedCount = 0;
  const CONCURRENCY = 3;

  // ------------ Upload fonction propre ------------
  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', file);

    const url = `https://api.telegram.org/bot${botToken}/sendDocument`;

    try {
      await fetch(url, { method: 'POST', body: formData });
    } catch (err) {
      console.error('Upload error:', err);
    }

    uploadedCount++;
    updateProgress(uploadedCount, total);
  }

  function updateProgress(done, total) {
    const percent = Math.round((done / total) * 100);
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `Uploading... ${percent}%`;
  }

  // ------------ File d’attente avec limite de workers ------------
  async function uploadQueue() {
    let index = 0;

    async function worker() {
      while (index < total) {
        const file = selectedFiles[index];
        index++;
        await uploadFile(file);
      }
    }

    // Lancer les workers en parallèle
    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
      workers.push(worker());
    }

    await Promise.all(workers);
  }

  await uploadQueue();

  // ----------- Message final de succès ----------
  progressFill.style.width = `100%`;
  progressText.textContent = '✔ Upload complete!';
  progressText.style.color = '#32cd32'; // vert
});
