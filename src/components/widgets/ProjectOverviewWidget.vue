<template>
  <div class="project-overview-widget">
    <div class="overview-header">
      <h4>{{ t('widgets.projectOverview.title') }}</h4>
    </div>
    <div class="overview-content">
      <div class="overview-stats">
        <div class="stat-item">
          <i class="fas fa-tasks"></i>
          <div class="stat-info">
            <span class="stat-value">{{ projectStats.totalTasks || 0 }}</span>
            <span class="stat-label">{{ t('widgets.projectOverview.totalTasks') }}</span>
          </div>
        </div>
        <div class="stat-item">
          <i class="fas fa-check-circle"></i>
          <div class="stat-info">
            <span class="stat-value">{{ projectStats.completedTasks || 0 }}</span>
            <span class="stat-label">{{ t('widgets.projectOverview.completedTasks') }}</span>
          </div>
        </div>
        <div class="stat-item">
          <i class="fas fa-users"></i>
          <div class="stat-info">
            <span class="stat-value">{{ projectStats.teamMembers || 0 }}</span>
            <span class="stat-label">{{ t('widgets.projectOverview.teamMembers') }}</span>
          </div>
        </div>
        <div class="stat-item">
          <i class="fas fa-calendar"></i>
          <div class="stat-info">
            <span class="stat-value">{{ daysRemaining }}</span>
            <span class="stat-label">{{ t('widgets.projectOverview.daysRemaining') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useTranslation } from '@/composables/useTranslation'

export default {
  name: 'ProjectOverviewWidget',
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
    const projectStats = ref({
      totalTasks: 0,
      completedTasks: 0,
      teamMembers: 0,
      deadline: null
    })

    const daysRemaining = computed(() => {
      if (!projectStats.value.deadline) return '-'
      const now = new Date()
      const deadline = new Date(projectStats.value.deadline)
      const diffTime = deadline - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 ? diffDays : 0
    })

    const loadProjectStats = async () => {
      // Simulation de données pour l'instant
      projectStats.value = {
        totalTasks: 12,
        completedTasks: 8,
        teamMembers: 5,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
      }
    }

    onMounted(() => {
      loadProjectStats()
    })

    return {
      t,
      projectStats,
      daysRemaining
    }
  }
}
</script>

<style scoped>
.project-overview-widget {
  padding: 1rem;
}

.overview-header h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-weight: 600;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.stat-item i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .project-overview-widget {
    padding: 1rem;
  }
  .overview-header h4 {
    font-size: 1.125rem;
  }
  .overview-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .stat-item {
    padding: 1rem;
  }
  .stat-item i {
    font-size: 1.6rem;
  }
  .stat-value {
    font-size: 1.35rem;
  }
  .stat-label {
    font-size: 1rem;
  }
}
</style>