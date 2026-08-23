<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import { useFeatureStore } from '@/stores/FeatureStore'
import type { Feature } from '@/types'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const featureStore = useFeatureStore()

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const form = ref({ label_de: '', label_en: '', icon: 'pi pi-check' })

onMounted(() => featureStore.fetchFeatures())

function openNew() {
  editingId.value = null
  form.value = { label_de: '', label_en: '', icon: 'pi pi-check' }
  dialogVisible.value = true
}

function openEdit(feature: Feature) {
  editingId.value = feature.id
  form.value = { label_de: feature.label_de, label_en: feature.label_en, icon: feature.icon }
  dialogVisible.value = true
}

async function save() {
  saving.value = true
  try {
    if (editingId.value) {
      await featureStore.updateFeature(editingId.value, form.value)
    } else {
      await featureStore.createFeature(form.value)
    }
    await featureStore.fetchFeatures()
    dialogVisible.value = false
    toast.add({ severity: 'success', summary: t('admin.saved'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('admin.saveError'), life: 4000 })
  } finally {
    saving.value = false
  }
}

function remove(feature: Feature) {
  confirm.require({
    message: t('admin.confirmDelete'),
    header: t('admin.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await featureStore.deleteFeature(feature.id)
      await featureStore.fetchFeatures()
      toast.add({ severity: 'success', summary: t('admin.deleted'), life: 3000 })
    },
  })
}
</script>

<template>
  <div>
    <div class="flex justify-content-end mb-3">
      <Button :label="t('admin.new')" icon="pi pi-plus" @click="openNew" />
    </div>

    <DataTable
      :value="featureStore.features"
      :loading="featureStore.loading"
      data-key="id"
      striped-rows
      responsive-layout="scroll"
    >
      <Column field="id" header="#" style="width: 4rem" />
      <Column field="label_de" :header="t('admin.labelDe')" />
      <Column field="label_en" :header="t('admin.labelEn')" />

      <Column :header="t('admin.icon')" style="width: 14rem">
        <template #body="{ data }">
          <Tag severity="secondary" :icon="data.icon" :value="data.icon" />
        </template>
      </Column>

      <Column :header="t('admin.actions')" style="width: 9rem">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text rounded @click="openEdit(data)" />
          <Button icon="pi pi-trash" severity="danger" text rounded @click="remove(data)" />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editingId ? t('admin.edit') : t('admin.new')"
      :style="{ width: '30rem' }"
      :breakpoints="{ '640px': '96vw' }"
    >
      <div class="flex flex-column gap-3">
        <div>
          <label class="block mb-2 font-medium">{{ t('admin.labelDe') }}</label>
          <InputText v-model="form.label_de" fluid maxlength="100" />
        </div>
        <div>
          <label class="block mb-2 font-medium">{{ t('admin.labelEn') }}</label>
          <InputText v-model="form.label_en" fluid maxlength="100" />
        </div>
        <div>
          <label class="block mb-2 font-medium">{{ t('admin.icon') }}</label>
          <InputText v-model="form.icon" fluid maxlength="60" placeholder="pi pi-wifi" />
          <small class="block mt-2">
            <i :class="form.icon"></i>
            <a class="ml-2" href="https://primevue.org/icons/" target="_blank" rel="noopener">
              PrimeIcons
            </a>
          </small>
        </div>
      </div>

      <template #footer>
        <Button :label="t('admin.cancel')" text severity="secondary" @click="dialogVisible = false" />
        <Button :label="t('admin.save')" icon="pi pi-check" :loading="saving" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
