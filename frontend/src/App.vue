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
const isProcessing = ref(false);

const onFileSelect = (event) => {
  file.value = event.files[0];
  error.value = null;
  success.value = false;
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
  isProcessing.value = true;

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
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="layout-wrapper bg-slate-50">
    <header
      class="header flex align-items-center px-4 md:px-6 py-4 bg-white border-bottom-1 border-slate-200"
    >
      <div class="container flex align-items-center w-full max-w-30rem mx-auto">
        <img :src="logo" alt="VSLF Logo" class="header-logo" />
        <div class="header-title ml-4">
          <h1 class="m-0 text-xl font-semibold text-slate-800">SBB Datenexport</h1>
        </div>
      </div>
    </header>

    <main class="content-container p-4 md:p-6 flex flex-column align-items-center">
      <div class="card w-full max-w-30rem p-5 shadow-sm border-round-xl bg-white">
        <p class="mt-0 mb-5 text-slate-600 line-height-3">
          Wählen Sie den gewünschten Zeitraum und die Excel-Datei mit den SBB Personalnummern aus,
          um die VSLF-Textdatei zu generieren.
        </p>

        <div class="grid formgrid p-fluid">
          <!-- Monat -->
          <div class="field col-12 md:col-6 mb-4">
            <label for="month" class="block font-medium text-slate-700 mb-2">Monat</label>
            <Select
              id="month"
              v-model="selectedMonth"
              :options="MONTHS"
              option-label="name"
              placeholder="Auswählen"
              class="w-full"
            />
          </div>
          <!-- Jahr -->
          <div class="field col-12 md:col-6 mb-4">
            <label for="year" class="block font-medium text-slate-700 mb-2">Jahr</label>
            <Select
              id="year"
              v-model="selectedYear"
              :options="YEARS"
              option-label="name"
              placeholder="Auswählen"
              class="w-full"
            />
          </div>
          <!-- Datei -->
          <div class="field col-12 mb-5">
            <label for="file" class="block font-medium text-slate-700 mb-2">Datei (.xlsx)</label>
            <div class="flex flex-column gap-2">
              <FileUpload
                ref="fileUploadRef"
                mode="basic"
                name="file"
                accept=".xlsx"
                :auto="false"
                choose-label="Datei auswählen"
                class="p-button-outlined p-button-secondary w-full"
                @select="onFileSelect"
              />
            </div>
          </div>

          <div class="col-12 flex flex-column gap-3">
            <Button
              label="Datei erstellen"
              severity="primary"
              icon="pi pi-download"
              :disabled="!file || !selectedMonth || !selectedYear || isProcessing"
              :loading="isProcessing"
              class="py-3 font-semibold"
              @click="createFile"
            />
            <Button
              label="Zurücksetzen"
              severity="secondary"
              icon="pi pi-refresh"
              text
              class="py-2"
              @click="resetForm"
            />
          </div>
        </div>

        <div v-if="error" class="mt-4">
          <Message severity="error" variant="simple" class="text-sm">{{ error }}</Message>
        </div>
        <div v-if="success" class="mt-4">
          <Message severity="success" variant="simple" class="text-sm"
            >Die Datei wurde erfolgreich erstellt und heruntergeladen.</Message
          >
        </div>
      </div>
    </main>

    <footer class="footer mt-auto p-4 md:p-6 text-center">
      <div class="max-w-30rem mx-auto border-top-1 border-slate-200 pt-4">
        <p class="text-xs text-slate-400 uppercase tracking-wider mb-0">
          &copy; {{ new Date().getFullYear() }} VSLF &bull; Verband Schweizer Lokomotivführer
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
:root {
  --primary-color: #003366;
}

body {
  margin: 0;
  padding: 0;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header-logo {
  height: 32px;
}

.card {
  border: 1px solid #e2e8f0;
}

.p-button.p-button-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.p-button.p-button-primary:hover {
  background-color: #002244;
  border-color: #002244;
}

.p-select:focus,
.p-fileupload-choose:focus {
  box-shadow:
    0 0 0 2px #ffffff,
    0 0 0 4px #00336640;
}

/* Custom Slate colors as PrimeFlex might not have them all by default depending on version */
.bg-slate-50 {
  background-color: #f8fafc;
}
.bg-white {
  background-color: #ffffff;
}
.border-slate-200 {
  border-color: #e2e8f0;
}
.text-slate-400 {
  color: #94a3b8;
}
.text-slate-500 {
  color: #64748b;
}
.text-slate-600 {
  color: #475569;
}
.text-slate-700 {
  color: #334155;
}
.text-slate-800 {
  color: #1e293b;
}
</style>
