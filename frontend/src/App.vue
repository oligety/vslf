<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Message from 'primevue/message';
import logo from './assets/VSLF_Logo_dunkel_26.svg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DOWNLOAD_FILENAME_PREFIX = 'VSLF_';

const MONTHS = [
  { name: 'Januar', value: '01' },
  { name: 'Februar', value: '02' },
  { name: 'März', value: '03' },
  { name: 'April', value: '04' },
  { name: 'Mai', value: '05' },
  { name: 'Juni', value: '06' },
  { name: 'Juli', value: '07' },
  { name: 'August', value: '08' },
  { name: 'September', value: '09' },
  { name: 'Oktober', value: '10' },
  { name: 'November', value: '11' },
  { name: 'Dezember', value: '12' },
];

const YEARS = Array.from({ length: 11 }, (_, i) => {
  const year = String(2025 + i);
  return { name: year, value: year };
});

const selectedMonth = ref(null);
const selectedYear = ref(null);
const file = ref(null);
const fileUploadRef = ref(null);
const error = ref(null);
const success = ref(false);

const onFileSelect = (event) => {
  file.value = event.files[0];
};

const setError = (message) => {
  error.value = message;
  success.value = false;
};

const resetForm = () => {
  selectedMonth.value = null;
  selectedYear.value = null;
  file.value = null;
  error.value = null;
  success.value = false;

  fileUploadRef.value?.clear();
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

const createFile = async () => {
  if (!file.value) {
    setError('Bitte wählen Sie eine Datei aus.');
    return;
  }

  if (!selectedMonth.value || !selectedYear.value) {
    setError('Bitte wählen Sie Monat und Jahr aus.');
    return;
  }

  error.value = null;
  success.value = false;

  const formData = new FormData();
  formData.append('file', file.value);
  formData.append('form_month', selectedMonth.value.value);
  formData.append('form_year', selectedYear.value.value);

  try {
    const response = await axios.post(`${API_URL}/convert`, formData, {
      responseType: 'blob',
    });

    const filename = `${DOWNLOAD_FILENAME_PREFIX}${selectedYear.value.value}${selectedMonth.value.value}.txt`;
    downloadBlob(new Blob([response.data]), filename);
    success.value = true;
  } catch {
    error.value = 'Fehler beim Erstellen der Datei.';
  }
};
</script>

<template>
  <div class="layout-wrapper">
    <header class="header flex align-items-center px-4 py-3 border-bottom-1 border-gray-200">
      <img :src="logo" alt="VSLF Logo" class="header-logo" />
      <div class="header-title ml-4">
        <h2 class="m-0 font-medium">
          Datei für SBB erstellen
        </h2>
      </div>
    </header>

    <main class="content-container p-4 md:p-6" style="max-width: 1000px; margin: auto">
      <div class="card p-4 shadow-1 border-round bg-white">
        <div class="grid formgrid p-fluid">
          <!-- Monat -->
          <div class="field col-12 md:col-6 mb-4">
            <label for="month" class="block font-bold mb-2">Monat</label>
            <Select
                id="month"
                v-model="selectedMonth"
                :options="MONTHS"
                option-label="name"
                placeholder="-"
                class="w-full"
            />
          </div>
          <!-- Jahr -->
          <div class="field col-12 md:col-6 mb-4">
            <label for="year" class="block font-bold mb-2">Jahr</label>
            <Select
                id="year"
                v-model="selectedYear"
                :options="YEARS"
                option-label="name"
                placeholder="-"
                class="w-full"
            />
          </div>
          <!-- Datei -->
          <div class="field col-12 mb-4">
            <label for="file" class="block font-bold mb-2">Datei *.xlsx (SBB Personal Nr.)</label>
            <div class="p-inputgroup">
              <FileUpload
                  ref="fileUploadRef"
                  mode="basic"
                  name="file"
                  accept=".xlsx"
                  :auto="false"
                  choose-label="Datei auswählen"
                  class="p-button-secondary"
                  @select="onFileSelect"
              />
            </div>
          </div>

          <div class="col-12 flex flex-column md:flex-row gap-3 mt-4">
            <Button
                label="Datei erstellen"
                severity="primary"
                icon="pi pi-check"
                @click="createFile"
                :disabled="!file || !selectedMonth || !selectedYear"
            />
            <Button
                label="Zurücksetzen"
                severity="secondary"
                icon="pi pi-refresh"
                text
                @click="resetForm"
            />
          </div>
        </div>

        <div v-if="error" class="mt-4">
          <Message severity="error" variant="simple">{{ error }}</Message>
        </div>
        <div v-if="success" class="mt-4">
          <Message severity="success" variant="simple">Datei wurde erfolgreich erstellt.</Message>
        </div>
      </div>
    </main>

    <footer class="footer mt-auto p-4 text-center border-top-1 border-gray-200">
      <p class="text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} VSLF - Verband Schweizer Lokomotivführer und Anwärter
      </p>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family:
      'Helvetica Neue',
      Helvetica,
      Arial,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #ffffff;
}

.header-logo {
  height: 40px;
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
}

.header-title h2 {
  font-size: 1.25rem;
}

@media screen and (max-width: 768px) {
  .header-title h2 {
    font-size: 1rem;
  }
}
</style>