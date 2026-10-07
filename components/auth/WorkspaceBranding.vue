<template>
  <aside
    class="workspace-branding"
    :class="{ 'workspace-branding--multiple': brands.length > 1 }"
  >
    <div class="workspace-branding__content">
      <div class="workspace-branding__logos">
        <figure
          v-for="brand in brands"
          :key="brand.id"
          class="workspace-branding__brand"
        >
          <img
            :src="logoUrl(brand.logo)"
            :alt="brand.name"
            width="224"
            height="224"
            class="workspace-branding__logo"
          />
          <figcaption class="workspace-branding__name">
            {{ brand.name }}
          </figcaption>
        </figure>
      </div>
      <h2 class="workspace-branding__title">
        {{ $t('auth.workspace_title') }}
      </h2>
    </div>
  </aside>
</template>

<script>
import workspaceBrands from '~/config/workspace-brands'

export default {
  name: 'WorkspaceBranding',
  props: {
    brands: { type: Array, default: () => workspaceBrands },
  },
  methods: {
    logoUrl(logo) {
      const base = this.$router.options.base || '/'
      return `${base.replace(/\/?$/, '/')}${logo.replace(/^\/+/, '')}`
    },
  },
}
</script>

<style scoped>
.workspace-branding {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.75rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: radial-gradient(ellipse at top right, #dbeafe80, transparent 65%),
    linear-gradient(145deg, #f8fafc, #e2e8f0);
}

.workspace-branding__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  width: 100%;
  max-width: 28rem;
}

.workspace-branding__logos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 1.25rem;
  width: 5rem;
  flex-shrink: 0;
}

.workspace-branding__brand {
  min-width: 0;
  margin: 0;
  text-align: center;
}

.workspace-branding__logo {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 1rem;
  box-shadow: 0 12px 28px -12px rgb(15 23 42 / 30%);
}

.workspace-branding__name {
  margin-top: 0.75rem;
  color: #475569;
  font-size: 0.625rem;
  font-weight: 600;
}

.workspace-branding__title {
  min-width: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.workspace-branding--multiple .workspace-branding__content {
  flex-direction: column;
}

.workspace-branding--multiple .workspace-branding__logos {
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
}

.workspace-branding--multiple .workspace-branding__title {
  text-align: center;
}

.dark .workspace-branding {
  border-color: #334155;
  background: radial-gradient(ellipse at top right, #1e3a8a40, transparent 65%),
    linear-gradient(145deg, #1e293b, #0f172a);
}

.dark .workspace-branding__title {
  color: #f8fafc;
}

.dark .workspace-branding__name {
  color: #cbd5e1;
}

@media (min-width: 1024px) {
  .workspace-branding {
    padding: 3rem;
    border-bottom: 0;
    border-left: 1px solid #e2e8f0;
  }

  .workspace-branding__content {
    flex-direction: column;
    gap: 2.25rem;
  }

  .workspace-branding__logos {
    width: 100%;
    max-width: 14rem;
  }

  .workspace-branding--multiple .workspace-branding__logos {
    max-width: 28rem;
    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  }

  .workspace-branding__logo {
    border-radius: 1.75rem;
  }

  .workspace-branding__name {
    margin-top: 1rem;
    font-size: 0.875rem;
  }

  .workspace-branding__title {
    font-size: 1.875rem;
    text-align: center;
  }
}
</style>
