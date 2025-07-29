import { onMounted } from 'vue'
import { useResultsStore } from '../stores/ResultsStore'

/**
 * Composable to initialize results store
 * Results are now saved manually from RaceTrack component
 */
export function useResultsSubscription() {
  const resultsStore = useResultsStore()

  const initialize = () => {
    // Just load existing results from localStorage
    resultsStore.load()
    console.log('Results store initialized')
  }
  
  onMounted(() => {
    initialize()
  })

  return {
    initialize,
    resultsStore,
  }
}
