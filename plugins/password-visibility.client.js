const EYE_ICON = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
  <circle cx="12" cy="12" r="2.75" stroke-width="1.8" />
</svg>`

const EYE_OFF_ICON = `
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="m3 3 18 18M10.6 6.2A10.5 10.5 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-2.6 3.3M14.1 14.1a3 3 0 0 1-4.2-4.2M6.2 6.2C3.8 7.7 2.5 12 2.5 12s3.5 6 9.5 6c1.5 0 2.8-.4 4-1" />
</svg>`

export default () => {
  if (process.server) return

  const updateButton = (button, input) => {
    const visible = input.type === 'text'
    button.innerHTML = visible ? EYE_OFF_ICON : EYE_ICON
    button.setAttribute('aria-label', visible ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը')
    button.setAttribute('title', visible ? 'Թաքցնել գաղտնաբառը' : 'Ցույց տալ գաղտնաբառը')
  }

  const enhance = (input) => {
    if (!(input instanceof HTMLInputElement)) return
    if (input.type !== 'password') return
    if (input.dataset.passwordVisibilityManaged === 'true') return
    if (input.dataset.passwordVisibilityEnhanced === 'true') return

    const parent = input.parentNode
    if (!parent) return

    input.dataset.passwordVisibilityEnhanced = 'true'

    const computed = window.getComputedStyle(input)
    const wrapper = document.createElement('span')
    wrapper.className = 'password-visibility-wrapper'
    wrapper.style.position = 'relative'
    wrapper.style.display = computed.display === 'inline' ? 'inline-block' : 'block'
    wrapper.style.width = '100%'
    wrapper.style.maxWidth = '100%'
    wrapper.style.marginTop = computed.marginTop
    wrapper.style.marginRight = computed.marginRight
    wrapper.style.marginBottom = computed.marginBottom
    wrapper.style.marginLeft = computed.marginLeft

    parent.insertBefore(wrapper, input)
    wrapper.appendChild(input)

    input.style.margin = '0'
    input.style.paddingRight = '2.75rem'
    input.style.width = '100%'

    const button = document.createElement('button')
    button.type = 'button'
    button.style.position = 'absolute'
    button.style.top = '0'
    button.style.right = '0'
    button.style.bottom = '0'
    button.style.width = '2.75rem'
    button.style.display = 'flex'
    button.style.alignItems = 'center'
    button.style.justifyContent = 'center'
    button.style.border = '0'
    button.style.background = 'transparent'
    button.style.color = '#94a3b8'
    button.style.cursor = 'pointer'
    button.style.padding = '0'
    button.style.zIndex = '2'

    updateButton(button, input)

    button.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      input.type = input.type === 'password' ? 'text' : 'password'
      updateButton(button, input)
      input.focus({ preventScroll: true })
    })

    wrapper.appendChild(button)
  }

  const scan = (root = document) => {
    if (root instanceof HTMLInputElement) enhance(root)
    if (root.querySelectorAll) {
      root.querySelectorAll('input[type="password"]').forEach(enhance)
    }
  }

  const start = () => {
    scan(document)

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) scan(node)
        })
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true })
  } else {
    start()
  }
}
