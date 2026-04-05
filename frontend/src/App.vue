<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import FileUpload, { type FileUploadSelectEvent } from 'primevue/fileupload';
import Button from 'primevue/button';
import Message from 'primevue/message';
import logo from './assets/VSLF_Logo_dunkel_26.svg';

interface Option {
  name: string;
  value: string;
}

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';
const DOWNLOAD_FILENAME_PREFIX = 'VSLF_';

const MONTHS: Option[] = [
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

const YEARS: Option[] = Array.from({ length: 11 }, (_, i) => {
  const year = String(2025 + i);
  return { name: year, value: year };
});

const selectedMonth = ref<Option | null>(null);
const selectedYear = ref<Option | null>(null);
const file = ref<File | null>(null);
const fileUploadRef = ref<InstanceType<typeof FileUpload> | null>(null);
const error = ref<string | null>(null);
const success = ref<boolean>(false);
const isProcessing = ref<boolean>(false);

const onFileSelect = (event: FileUploadSelectEvent) => {
  file.value = event.files[0];
  error.value = null;
  success.value = false;
};

const setError = (message: string) => {
  error.value = message;
  success.value = false;
};

const resetFile = () => {
  file.value = null;
  fileUploadRef.value?.clear();
};

const resetForm = () => {
  selectedMonth.value = null;
  selectedYear.value = null;
  resetFile();
  error.value = null;
  success.value = false;
};

const downloadBlob = (blob: Blob, filename: string) => {
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
  <div class="layout-wrapper">
    <header
      class="header sticky top-0 z-50 flex align-items-center px-4 md:px-6 py-2 bg-white-alpha-90 backdrop-blur-sm border-bottom-1 border-slate-200 shadow-sm"
    >
      <div class="container flex align-items-center w-full max-w-30rem mx-auto">
        <img :src="logo" alt="VSLF Logo" class="header-logo" />
        <div class="header-title ml-4">
          <h1 class="m-0 text-xl font-semibold text-slate-800">SBB Datenexport</h1>
        </div>
      </div>
    </header>

    <main
      class="content-container p-4 flex flex-column align-items-center flex-grow-1 overflow-y-auto overflow-x-hidden"
    >
      <div class="card w-full max-w-30rem p-4 md:p-4 shadow-sm border-round-xl bg-white">
        <h2 class="mt-0 mb-2 text-xl font-bold text-slate-800">Export erstellen</h2>
        <p class="mt-0 mb-4 text-slate-600 line-height-3 text-sm">
          Wählen Sie den gewünschten Zeitraum und die Excel-Datei mit den SBB Personalnummern aus,
          um die VSLF-Textdatei zu generieren.
        </p>

        <div class="grid formgrid p-fluid">
          <!-- Monat -->
          <div class="field col-12 md:col-6 mb-3">
            <label for="month" class="block font-medium text-slate-700 mb-1 text-sm">Monat</label>
            <Select
              id="month"
              v-model="selectedMonth"
              :options="MONTHS"
              option-label="name"
              placeholder="Auswählen"
              class="w-full p-inputtext-sm"
            />
          </div>
          <!-- Jahr -->
          <div class="field col-12 md:col-6 mb-3">
            <label for="year" class="block font-medium text-slate-700 mb-1 text-sm">Jahr</label>
            <Select
              id="year"
              v-model="selectedYear"
              :options="YEARS"
              option-label="name"
              placeholder="Auswählen"
              class="w-full p-inputtext-sm"
            />
          </div>
          <!-- Datei -->
          <div class="field col-12 mb-4">
            <label for="file" class="block font-medium text-slate-700 mb-1 text-sm"
              >Excel-Datei (.xlsx)</label
            >
            <div class="flex flex-column">
              <FileUpload
                ref="fileUploadRef"
                mode="basic"
                name="file"
                accept=".xlsx"
                :auto="true"
                custom-upload
                choose-label="Excel-Datei auswählen"
                :class="[
                  'w-full p-button-sm transition-all transition-duration-200 justify-content-center',
                  file ? 'p-button-success' : 'p-button-secondary p-button-outlined border-dashed',
                ]"
                @select="onFileSelect"
              />
              <div
                v-if="file"
                class="flex align-items-center gap-2 mt-2 px-3 py-2 bg-green-50 border-round-lg border-1 border-green-100 text-xs text-green-800"
              >
                <i class="pi pi-file text-sm" />
                <span class="font-medium truncate flex-grow-1">{{ file.name }}</span>
                <i
                  class="pi pi-times cursor-pointer hover:text-green-900 p-1 border-round hover:bg-green-100 transition-colors"
                  title="Datei entfernen"
                  @click="resetFile"
                />
              </div>
            </div>
          </div>

          <div class="col-12 flex flex-column gap-2">
            <Button
              label="Datei erstellen"
              severity="primary"
              icon="pi pi-download"
              :disabled="!file || !selectedMonth || !selectedYear || isProcessing"
              :loading="isProcessing"
              class="py-2 font-semibold p-button-sm"
              @click="createFile"
            />
            <Button
              label="Zurücksetzen"
              severity="secondary"
              icon="pi pi-refresh"
              text
              class="py-1 text-sm"
              @click="resetForm"
            />
          </div>
        </div>

        <div v-if="error" class="mt-3">
          <Message severity="error" variant="simple" class="text-xs">{{ error }}</Message>
        </div>
        <div v-if="success" class="mt-3">
          <Message severity="success" variant="simple" class="text-xs"
            >Die Datei wurde erfolgreich erstellt.</Message
          >
        </div>
      </div>
    </main>

    <footer class="footer mt-auto p-3 text-center">
      <div class="max-w-30rem mx-auto border-top-1 border-slate-200 pt-3">
        <p class="text-[10px] text-slate-400 uppercase tracking-wider mb-0">
          &copy; {{ new Date().getFullYear() }} VSLF &bull; Verband Schweizer Lokomotivführer
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header-logo {
  height: 28px;
}

@media (min-width: 768px) {
  .header-logo {
    height: 32px;
  }
}

.card {
  border: 1px solid #e2e8f0;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

/* Custom Slate colors as PrimeFlex might not have them all by default depending on version */
.p-fileupload :deep(.p-fileupload-basic) {
  display: flex;
  width: 100%;
}

/* Hide the native filename span in basic mode */
.p-fileupload :deep(.p-fileupload-choose > span:not(.p-button-icon):not(.p-button-label)) {
  display: none !important;
}

.border-dashed {
  border-style: dashed !important;
}

.bg-white-alpha-90 {
  background-color: rgba(255, 255, 255, 0.9);
}
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
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
  background-color: #f8fafc;
}
</style>
