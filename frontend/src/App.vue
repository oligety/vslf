<script setup>
import { ref } from 'vue';
import axios from 'axios';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import Message from 'primevue/message';

const selectedMonth = ref(null);
const selectedYear = ref(null);
const file = ref(null);
const error = ref(null);
const success = ref(false);

const months = [
  { name: 'Januar', value: '01' }, { name: 'Februar', value: '02' }, { name: 'März', value: '03' },
  { name: 'April', value: '04' }, { name: 'Mai', value: '05' }, { name: 'Juni', value: '06' },
  { name: 'Juli', value: '07' }, { name: 'August', value: '08' }, { name: 'September', value: '09' },
  { name: 'Oktober', value: '10' }, { name: 'November', value: '11' }, { name: 'Dezember', value: '12' }
];

const years = Array.from({ length: 11 }, (_, i) => ({
  name: (2020 + i).toString(),
  value: (2020 + i).toString(),
}));

const onFileSelect = (event) => {
  file.value = event.files[0];
};

const resetForm = () => {
  selectedMonth.value = null;
  selectedYear.value = null;
  file.value = null;
  error.value = null;
  success.value = false;
};

const createCSV = async () => {
  if (!file.value) {
    error.value = 'Bitte wählen Sie eine Datei aus.';
    return;
  }

  if (!selectedMonth.value || !selectedYear.value) {
    error.value = 'Bitte wählen Sie Monat und Jahr aus.';
    return;
  }

  error.value = null;
  success.value = false;

  const formData = new FormData();
  formData.append('file', file.value);
  formData.append('form_month', selectedMonth.value.value);
  formData.append('form_year', selectedYear.value.value);

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const response = await axios.post(`${apiUrl}/convert`, formData, {
      responseType: 'blob',
    });

    const filename = `VSLF_${selectedYear.value.value}${selectedMonth.value.value}.txt`;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    success.value = true;
  } catch {
    error.value = 'Fehler beim Erstellen der Datei.';
  }
};
</script>

<template>
    <div class="p-4" style="max-width: 800px; margin: auto;">
        <h1 class="text-4xl font-normal mb-4">Datei für SBB erstellen</h1>
        <hr class="mb-6 border-t border-gray-300">

        <div class="grid formgrid p-fluid">
            <!-- Monat -->
            <div class="field col-12 md:col-12 grid align-items-center mb-3">
                <label for="month" class="col-fixed font-bold" style="width:150px; text-align: right; padding-right: 20px;">Monat</label>
                <div class="col">
                    <Select id="month" v-model="selectedMonth" :options="months" optionLabel="name" placeholder="" class="w-full" />
                </div>
            </div>

            <!-- Jahr -->
            <div class="field col-12 md:col-12 grid align-items-center mb-3">
                <label for="year" class="col-fixed font-bold" style="width:150px; text-align: right; padding-right: 20px;">Jahr</label>
                <div class="col">
                    <Select id="year" v-model="selectedYear" :options="years" optionLabel="name" placeholder="" class="w-full" />
                </div>
            </div>

            <!-- Datei -->
            <div class="field col-12 md:col-12 grid align-items-center mb-3">
                <label for="file" class="col-fixed font-bold" style="width:150px; text-align: right; padding-right: 20px;">Datei *.xlsx</label>
                <div class="col">
                    <div class="p-inputgroup">
                         <FileUpload mode="basic" name="file" accept=".xlsx" @select="onFileSelect" :auto="false" chooseLabel="Choose file" />
                         <span class="p-inputgroup-addon" v-if="file">{{ file.name }}</span>
                         <span class="p-inputgroup-addon" v-else>No file chosen</span>
                    </div>
                </div>
            </div>

            <div class="field col-12 md:col-12 grid align-items-center mt-4">
                <div style="width:150px;"></div>
                <div class="col flex gap-2">
                    <Button label="Datei erstellen" severity="success" icon="pi pi-check" @click="createCSV" style="background-color: #5cb85c; border-color: #4cae4c;" />
                    <Button label="Zurücksetzen" severity="danger" icon="pi pi-refresh" @click="resetForm" style="background-color: #d9534f; border-color: #d43f3a;" />
                </div>
            </div>
        </div>

        <div v-if="error" class="mt-4">
            <Message severity="error">{{ error }}</Message>
        </div>
        <div v-if="success" class="mt-4">
            <Message severity="success">Datei wurde erfolgreich erstellt.</Message>
        </div>
    </div>
</template>

<style>
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    background-color: #ffffff;
    color: #333;
}
</style>
