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
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import ToggleSwitch from 'primevue/toggleswitch'
import MultiSelect from 'primevue/multiselect'
import Tag from 'primevue/tag'
import { useRoomStore } from '@/stores/RoomStore'
import { useFeatureStore } from '@/stores/FeatureStore'
import type { Room } from '@/types'

const { t } = useI18n()
const toast = useToast()
const confirm = useConfirm()
const roomStore = useRoomStore()
const featureStore = useFeatureStore()

const dialogVisible = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const emptyForm = () => ({
  name: '',
  description: '',
  description_en: '',
  price: 0,
  isActive: true,
  isUnderConstruction: false,
  minStay: 1,
  imagesText: '',
  featureIds: [] as number[],
})

const form = ref(emptyForm())

onMounted(() => {
  roomStore.fetchRooms(false)
  featureStore.fetchFeatures()
})

function openNew() {
  editingId.value = null
  form.value = emptyForm()
  dialogVisible.value = true
}

function openEdit(room: Room) {
  editingId.value = room.id
  form.value = {
    name: room.name,
    description: room.description ?? '',
    description_en: room.description_en ?? '',
    price: Number(room.price),
    isActive: room.isActive,
    isUnderConstruction: room.isUnderConstruction,
    minStay: room.minStay,
    imagesText: (room.images ?? []).join('\n'),
    featureIds: (room.features ?? []).map((feature) => feature.id),
  }
  dialogVisible.value = true
}

async function save() {
  saving.value = true
  const payload = {
    name: form.value.name.trim(),
    description: form.value.description.trim() || undefined,
    description_en: form.value.description_en.trim() || undefined,
    price: form.value.price,
    isActive: form.value.isActive,
    isUnderConstruction: form.value.isUnderConstruction,
    minStay: form.value.minStay,
    images: form.value.imagesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    featureIds: form.value.featureIds,
  }

  try {
    if (editingId.value) {
      await roomStore.updateRoom(editingId.value, payload)
    } else {
      await roomStore.createRoom(payload)
    }
    await roomStore.fetchRooms(false)
    dialogVisible.value = false
    toast.add({ severity: 'success', summary: t('admin.saved'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('admin.saveError'), life: 4000 })
  } finally {
    saving.value = false
  }
}

function remove(room: Room) {
  confirm.require({
    message: t('admin.confirmDelete'),
    header: t('admin.delete'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      await roomStore.deleteRoom(room.id)
      await roomStore.fetchRooms(false)
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
    :value="roomStore.rooms"
    :loading="roomStore.loading"
    data-key="id"
    striped-rows
    responsive-layout="scroll"
  >
    <Column field="id" header="#" style="width: 4rem" />
    <Column field="name" :header="t('admin.name')" />

    <Column :header="t('admin.price')" style="width: 8rem">
      <template #body="{ data }">{{ Number(data.price).toFixed(2) }} &euro;</template>
    </Column>

    <Column field="minStay" :header="t('admin.minStay')" style="width: 8rem" />

    <Column :header="t('rooms.features')">
      <template #body="{ data }">
        <div class="flex flex-wrap gap-1">
          <Tag
            v-for="feature in data.features"
            :key="feature.id"
            severity="secondary"
            :icon="feature.icon"
            :value="feature.label_de"
          />
        </div>
      </template>
    </Column>

    <Column :header="t('admin.active')" style="width: 7rem">
      <template #body="{ data }">
        <i :class="data.isActive ? 'pi pi-check-circle text-green-600' : 'pi pi-times-circle text-red-500'"></i>
      </template>
    </Column>

    <Column :header="t('admin.construction')" style="width: 9rem">
      <template #body="{ data }">
        <Tag v-if="data.isUnderConstruction" severity="warn" icon="pi pi-wrench" :value="t('rooms.underConstruction')" />
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
    :style="{ width: '44rem', maxWidth: '95vw' }"
  >
    <div class="grid">
      <div class="col-12 md:col-8">
        <label class="block mb-2 font-medium">{{ t('admin.name') }}</label>
        <InputText v-model="form.name" fluid maxlength="120" />
      </div>
      <div class="col-12 md:col-4">
        <label class="block mb-2 font-medium">{{ t('admin.price') }}</label>
        <InputNumber v-model="form.price" mode="currency" currency="EUR" locale="de-DE" fluid />
      </div>
      <div class="col-12">
        <label class="block mb-2 font-medium">{{ t('admin.description') }}</label>
        <Textarea v-model="form.description" rows="3" fluid auto-resize />
      </div>
      <div class="col-12">
        <label class="block mb-2 font-medium">{{ t('admin.descriptionEn') }}</label>
        <Textarea v-model="form.description_en" rows="3" fluid auto-resize />
      </div>
      <div class="col-12">
        <label class="block mb-2 font-medium">{{ t('rooms.features') }}</label>
        <MultiSelect
          v-model="form.featureIds"
          :options="featureStore.features"
          option-label="label_de"
          option-value="id"
          display="chip"
          filter
          fluid
        />
      </div>
      <div class="col-12">
        <label class="block mb-2 font-medium">{{ t('admin.images') }}</label>
        <Textarea v-model="form.imagesText" rows="3" fluid auto-resize />
      </div>
      <div class="col-12 md:col-4">
        <label class="block mb-2 font-medium">{{ t('admin.minStay') }}</label>
        <InputNumber v-model="form.minStay" :min="1" :max="365" show-buttons fluid />
      </div>
      <div class="col-6 md:col-4 flex align-items-end gap-2 pb-2">
        <ToggleSwitch v-model="form.isActive" input-id="isActive" />
        <label for="isActive">{{ t('admin.active') }}</label>
      </div>
      <div class="col-6 md:col-4 flex align-items-end gap-2 pb-2">
        <ToggleSwitch v-model="form.isUnderConstruction" input-id="isConstruction" />
        <label for="isConstruction">{{ t('admin.construction') }}</label>
      </div>
    </div>

    <template #footer>
      <Button :label="t('admin.cancel')" text severity="secondary" @click="dialogVisible = false" />
      <Button :label="t('admin.save')" icon="pi pi-check" :loading="saving" @click="save" />
    </template>
  </Dialog>
  </div>
</template>
