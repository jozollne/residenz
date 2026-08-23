<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { Room } from '@/types'

const props = defineProps<{ room: Room }>()
const emit = defineEmits<{ book: [room: Room] }>()

const { t, locale } = useI18n()

const image = computed(() => props.room.images?.[0] ?? null)
const bookable = computed(() => props.room.isActive && !props.room.isUnderConstruction)

const description = computed(() =>
  locale.value === 'en'
    ? (props.room.description_en ?? props.room.description ?? '')
    : (props.room.description ?? ''),
)

const price = computed(() => Number(props.room.price).toFixed(2).replace('.', ','))

const minStayLabel = computed(() =>
  props.room.minStay > 1 ? t('rooms.minStay', { count: props.room.minStay }) : t('rooms.minStayOne'),
)

function featureLabel(feature: Room['features'][number]) {
  return locale.value === 'en' ? feature.label_en : feature.label_de
}
</script>

<template>
  <article class="room-card" :class="{ 'room-card--disabled': room.isUnderConstruction }">
    <div class="room-card__image">
      <img v-if="image" :src="image" :alt="room.name" loading="lazy" />
      <div v-else class="flex align-items-center justify-content-center h-full">
        <i class="pi pi-image text-4xl" style="color: var(--residenz-moss)"></i>
      </div>
      <Tag
        v-if="room.isUnderConstruction"
        class="room-card__badge"
        severity="warn"
        icon="pi pi-wrench"
        :value="t('rooms.underConstruction')"
      />
    </div>

    <div class="room-card__body">
      <h3 class="m-0" style="color: var(--residenz-forest)">{{ room.name }}</h3>

      <p class="m-0 text-sm line-height-3" style="color: #5d554c">{{ description }}</p>

      <div v-if="!room.isUnderConstruction" class="shared-note">
        <i class="pi pi-info-circle"></i>
        <span>{{ t('rooms.sharedNote') }}</span>
      </div>

      <div class="flex flex-wrap gap-2">
        <Tag
          v-for="feature in room.features"
          :key="feature.id"
          severity="secondary"
          rounded
          :icon="feature.icon"
          :value="featureLabel(feature)"
        />
      </div>

      <div class="mt-auto pt-2 flex align-items-end justify-content-between gap-2">
        <div>
          <div class="room-card__price">{{ price }} &euro; <span>/ {{ t('rooms.perNight') }}</span></div>
          <small style="color: var(--residenz-moss)">{{ minStayLabel }}</small>
        </div>
        <Button
          :label="bookable ? t('rooms.book') : t('rooms.notBookable')"
          :icon="bookable ? 'pi pi-calendar-plus' : 'pi pi-lock'"
          :disabled="!bookable"
          @click="emit('book', room)"
        />
      </div>
    </div>
  </article>
</template>
