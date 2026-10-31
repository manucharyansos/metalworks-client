import { handleEnterKey } from '~/utils/enter-navigation'

// Enter moves through form and dialog fields site-wide (see the helper).
export default () => {
  document.addEventListener('keydown', handleEnterKey)
}
