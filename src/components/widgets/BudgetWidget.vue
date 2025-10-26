<template>
  <div class="budget-widget">
    <div class="budget-header">
      <h4>{{ t('widgets.budget.title') }}</h4>
    </div>
    <div class="budget-content">
      <div class="budget-summary">
        <div class="budget-item">
          <span class="budget-label">{{ t('widgets.budget.allocated') }}</span>
          <span class="budget-value allocated">{{ formatCurrency(budget.allocated) }}</span>
        </div>
        <div class="budget-item">
          <span class="budget-label">{{ t('widgets.budget.spent') }}</span>
          <span class="budget-value spent">{{ formatCurrency(budget.spent) }}</span>
        </div>
        <div class="budget-item">
          <span class="budget-label">{{ t('widgets.budget.remaining') }}</span>
          <span class="budget-value remaining" :class="{ 'negative': budget.remaining < 0 }">
            {{ formatCurrency(budget.remaining) }}
          </span>
        </div>
      </div>
      <div class="budget-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        <span class="progress-text">{{ Math.round(progressPercentage) }}% {{ t('widgets.budget.used') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'BudgetWidget',
  props: {
    projectId: {
      type: [String, Number],
      required: true
    },
    widget: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { t } = useTranslation()
    const budget = ref({
      allocated: 0,
      spent: 0,
      remaining: 0
    })

    const progressPercentage = computed(() => {
      if (budget.value.allocated === 0) return 0
      return Math.min((budget.value.spent / budget.value.allocated) * 100, 100)
    })

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(amount)
    }

    const loadBudgetData = async () => {
      // Simulation de données pour l'instant
      budget.value = {
        allocated: 50000,
        spent: 32500,
        remaining: 17500
      }
    }

    onMounted(() => {
      loadBudgetData()
    })

    return {
      t,
      budget,
      progressPercentage,
      formatCurrency
    }
  }
}
</script>

<style scoped>
.budget-widget {
  padding: 1rem;
}

.budget-header h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-weight: 600;
}

.budget-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.budget-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.budget-value {
  font-weight: 600;
  font-size: 1rem;
}

.budget-value.allocated {
  color: var(--info-color);
}

.budget-value.spent {
  color: var(--warning-color);
}

.budget-value.remaining {
  color: var(--success-color);
}

.budget-value.remaining.negative {
  color: var(--error-color);
}

.budget-progress {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), var(--warning-color));
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}
</style>