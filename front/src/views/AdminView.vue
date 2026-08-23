<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import BookingsPanel from '@/components/admin/BookingsPanel.vue'
import RoomsPanel from '@/components/admin/RoomsPanel.vue'
import FeaturesPanel from '@/components/admin/FeaturesPanel.vue'

const { t } = useI18n()
</script>

<template>
  <section class="section">
    <h2 class="section-title">{{ t('admin.title') }}</h2>

    <Tabs value="bookings">
      <TabList>
        <Tab value="bookings"><i class="pi pi-calendar mr-2"></i>{{ t('admin.bookings') }}</Tab>
        <Tab value="rooms"><i class="pi pi-home mr-2"></i>{{ t('admin.rooms') }}</Tab>
        <Tab value="features"><i class="pi pi-tags mr-2"></i>{{ t('admin.features') }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="bookings"><BookingsPanel /></TabPanel>
        <TabPanel value="rooms"><RoomsPanel /></TabPanel>
        <TabPanel value="features"><FeaturesPanel /></TabPanel>
      </TabPanels>
    </Tabs>
  </section>
</template>
