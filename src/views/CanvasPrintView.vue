<template>
  <div class="print-view-layout">
    <Header />

    <!-- Sidebar Split View -->
    <div class="split-view">
      <aside class="sidebar-panel">
        <div class="sidebar-content">
          <PDFUpload @update:pdf="pdf = $event" />
          <PDFInfo :pdf="pdf" v-if="pdf" @remove="pdf = undefined" />

          <hr class="divider" />

          <PrintSettingsCard v-model:config="config" />

          <hr class="divider" />

          <SaveButtonCard
            @generate="generate"
            :progress="progress"
            :saving="saving"
            :pdf="printedPDF"
          />
        </div>
      </aside>

      <main class="preview-panel">
        <PreviewCompare
          :pdfRenderer="pdfRenderer"
          :scanRenderer="printRenderer"
          :scale="config.scale"
        />
      </main>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type PrintConfig, defaultConfig, CanvasPrinter } from '@/utils/print-renderer'
import PrintSettingsCard from '@/components/print-settings/PrintSettingsCard.vue'
import PDFUpload from '@/components/pdf-upload/PDFUpload.vue'
import Header from '@/components/Header/Header.vue'
import { ref, computed, watch } from 'vue'
import PDFURL from '@/assets/examples/pdfs/test.pdf'
import { useHead } from '@unhead/vue'
import { useI18n } from 'vue-i18n'
import { PDF } from '@/utils/pdf-renderer/pdfjs'
import PreviewCompare from '@/components/page-preview/PreviewCompare.vue'
import SaveButtonCard from '@/components/save-button/SaveButtonCard.vue'
import { useSavePrintedPDF } from '@/composables/save-printed-pdf'
import PDFInfo from '@/components/pdf-upload/PDFInfo.vue'
import { PrintCacher } from '@/utils/print-renderer/print-cacher'
import { useMessage } from 'naive-ui'

const { t } = useI18n()
const message = useMessage()

useHead({
  title: () => `${t('base.printTitle')} · ${t('base.subtitle')} - ${t('base.title')}`,
  meta: [
    { name: 'description', content: () => t('base.description') },
    { name: 'keywords', content: () => t('base.keywords') },
    // Open Graph
    { property: 'og:title', content: () => `${t('base.printTitle')} - ${t('base.title')}` },
    { property: 'og:description', content: () => t('base.description') },
    { property: 'og:type', content: 'website' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: () => `${t('base.printTitle')} - ${t('base.title')}` },
    { name: 'twitter:description', content: () => t('base.description') }
  ]
})

const pdf = ref<File | undefined>(undefined)

const initExamplePDF = async () => {
  try {
    const response = await fetch(PDFURL)
    const blob = await response.blob()
    const file = new File([blob], 'example.pdf')
    if (!pdf.value) {
      pdf.value = file
    }
  } catch (e) {
    console.error('Failed to load example PDF:', e)
  }
}

initExamplePDF()

const config = ref<PrintConfig>(defaultConfig)
const pdfRenderer = computed(() => {
  if (!pdf.value) return

  return new PDF(pdf.value)
})

const printRenderer = ref(new PrintCacher(new CanvasPrinter(config.value)))
watch(
  config,
  (newConfig) => {
    printRenderer.value = new PrintCacher(new CanvasPrinter(newConfig))
  },
  { deep: true }
)

const scale = computed(() => config.value.scale)

const { save, progress, saving, printedPDF } = useSavePrintedPDF(
  pdf,
  pdfRenderer,
  printRenderer,
  scale
)

const generate = async () => {
  try {
    await save()
    message.success(t('actions.generateSuccess'))
  } catch (e) {
    message.error(t('actions.generateError') + (e as Error).message)
  }
}
</script>

<style scoped>
.print-view-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: var(--color-bg);
  color: var(--color-text);
  overflow: hidden;
  font-family: var(--font-sans);
}

.split-view {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100vh - var(--header-h));
}

.sidebar-panel {
  width: var(--sidebar-w);
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: var(--space-4);
  overflow-y: auto;
  height: 100%;
}

.preview-panel {
  flex: 1;
  background: var(--color-bg);
  padding: var(--space-4);
  overflow-y: auto;
  height: 100%;
}

/* Custom Scrollbars */
.sidebar-panel::-webkit-scrollbar,
.preview-panel::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.sidebar-panel::-webkit-scrollbar-track,
.preview-panel::-webkit-scrollbar-track {
  background: transparent;
}
.sidebar-panel::-webkit-scrollbar-thumb,
.preview-panel::-webkit-scrollbar-thumb {
  background: var(--color-border-2);
  border-radius: var(--radius-full);
}
.sidebar-panel::-webkit-scrollbar-thumb:hover,
.preview-panel::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

.divider {
  border: 0;
  height: 1px;
  background: var(--color-border);
  margin: var(--space-4) 0;
}

/* Responsive adjustment for Mobile */
@media (max-width: 768px) {
  .split-view {
    flex-direction: column;
    overflow-y: auto;
    height: auto;
  }

  .sidebar-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    height: auto;
    overflow-y: visible;
    padding: var(--space-4);
  }

  .preview-panel {
    width: 100%;
    height: 600px;
    overflow-y: auto;
    padding: var(--space-4);
  }
}
</style>
