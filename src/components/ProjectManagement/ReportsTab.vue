<template>
  <div class="space-y-6">
    <!-- En-tête avec actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-medium text-gray-900">Rapports et Statistiques</h3>
        <p class="mt-1 text-sm text-gray-500">
          Analysez les performances et le progrès de votre projet
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="generateReport"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Générer un rapport
        </button>
        <button
          @click="exportData"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Exporter
        </button>
      </div>
    </div>

    <!-- Filtres de période -->
    <div class="bg-white p-4 rounded-lg border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Période</label>
          <select
            v-model="selectedPeriod"
            @change="loadStatistics"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
            <option value="custom">Période personnalisée</option>
          </select>
        </div>
        <div v-if="selectedPeriod === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
          <input
            v-model="customStartDate"
            type="date"
            @change="loadStatistics"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
        <div v-if="selectedPeriod === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
          <input
            v-model="customEndDate"
            type="date"
            @change="loadStatistics"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
          <select
            v-model="selectedReportType"
            @change="loadStatistics"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="overview">Vue d'ensemble</option>
            <option value="tasks">Tâches</option>
            <option value="team">Équipe</option>
            <option value="time">Temps</option>
            <option value="budget">Budget</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Statistiques principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Progrès global</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ statistics.overall_progress }}%</div>
                  <div class="ml-2 flex items-baseline text-sm font-semibold" :class="getProgressChangeClass(statistics.progress_change)">
                    <svg v-if="statistics.progress_change > 0" class="self-center flex-shrink-0 h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <svg v-else-if="statistics.progress_change < 0" class="self-center flex-shrink-0 h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    {{ Math.abs(statistics.progress_change) }}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" :style="{ width: statistics.overall_progress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Tâches terminées</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ statistics.completed_tasks }}</div>
                  <div class="ml-2 text-sm text-gray-500">/ {{ statistics.total_tasks }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm text-gray-600">
            Taux de completion: {{ Math.round((statistics.completed_tasks / statistics.total_tasks) * 100) }}%
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Temps passé</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ statistics.time_spent }}h</div>
                  <div class="ml-2 text-sm text-gray-500">/ {{ statistics.estimated_time }}h</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm text-gray-600">
            Efficacité: {{ Math.round((statistics.estimated_time / statistics.time_spent) * 100) }}%
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Budget utilisé</dt>
                <dd class="flex items-baseline">
                  <div class="text-2xl font-semibold text-gray-900">{{ formatCurrency(statistics.budget_used) }}</div>
                  <div class="ml-2 text-sm text-gray-500">/ {{ formatCurrency(statistics.total_budget) }}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-5 py-3">
          <div class="text-sm text-gray-600">
            Restant: {{ formatCurrency(statistics.total_budget - statistics.budget_used) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Graphique de progression -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h4 class="text-lg font-medium text-gray-900 mb-4">Progression dans le temps</h4>
        <div class="h-64">
          <canvas ref="progressChart"></canvas>
        </div>
      </div>

      <!-- Répartition des tâches -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h4 class="text-lg font-medium text-gray-900 mb-4">Répartition des tâches</h4>
        <div class="h-64">
          <canvas ref="tasksChart"></canvas>
        </div>
      </div>

      <!-- Activité de l'équipe -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h4 class="text-lg font-medium text-gray-900 mb-4">Activité de l'équipe</h4>
        <div class="h-64">
          <canvas ref="teamChart"></canvas>
        </div>
      </div>

      <!-- Budget vs Temps -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h4 class="text-lg font-medium text-gray-900 mb-4">Budget vs Temps</h4>
        <div class="h-64">
          <canvas ref="budgetChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Tableaux détaillés -->
    <div class="space-y-6">
      <!-- Performance par membre -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Performance par membre</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">Statistiques détaillées de chaque membre de l'équipe</p>
        </div>
        <div class="border-t border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâches assignées</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tâches terminées</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temps passé</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="member in teamPerformance" :key="member.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img v-if="member.avatar" :src="member.avatar" :alt="member.name" class="h-8 w-8 rounded-full mr-3">
                    <div v-else class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                      <span class="text-xs font-medium text-gray-700">{{ getInitials(member.name) }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ member.name }}</div>
                      <div class="text-sm text-gray-500">{{ member.role }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.assigned_tasks }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.completed_tasks }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ member.time_spent }}h</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div class="bg-green-600 h-2 rounded-full" :style="{ width: member.performance + '%' }"></div>
                    </div>
                    <span class="text-sm text-gray-900">{{ member.performance }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tâches en retard -->
      <div v-if="overdueTasks.length > 0" class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Tâches en retard</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500">{{ overdueTasks.length }} tâche(s) dépassent leur échéance</p>
        </div>
        <div class="border-t border-gray-200">
          <ul class="divide-y divide-gray-200">
            <li v-for="task in overdueTasks" :key="task.id" class="px-6 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      En retard
                    </span>
                  </div>
                  <div class="ml-4">
                    <p class="text-sm font-medium text-gray-900">{{ task.title }}</p>
                    <p class="text-sm text-gray-500">Échéance: {{ formatDate(task.due_date) }}</p>
                  </div>
                </div>
                <div class="flex items-center">
                  <span class="text-sm text-gray-500">{{ getDaysOverdue(task.due_date) }} jour(s) de retard</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modal de génération de rapport -->
    <GenerateReportModal
      v-if="showGenerateReportModal"
      :project-id="projectId"
      @close="showGenerateReportModal = false"
      @generated="onReportGenerated"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick } from 'vue'
import { projectManagementService } from '@/services/projectManagementService'
import GenerateReportModal from './GenerateReportModal.vue'
import Chart from 'chart.js/auto'

export default {
  name: 'ReportsTab',
  components: {
    GenerateReportModal
  },
  props: {
    projectId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const loading = ref(false)
    const selectedPeriod = ref('month')
    const customStartDate = ref('')
    const customEndDate = ref('')
    const selectedReportType = ref('overview')
    const showGenerateReportModal = ref(false)
    
    const statistics = ref({
      overall_progress: 0,
      progress_change: 0,
      completed_tasks: 0,
      total_tasks: 0,
      time_spent: 0,
      estimated_time: 0,
      budget_used: 0,
      total_budget: 0
    })
    
    const teamPerformance = ref([])
    const overdueTasks = ref([])
    const chartData = ref({
      progress: [],
      tasks: [],
      team: [],
      budget: []
    })
    
    // Références pour les graphiques
    const progressChart = ref(null)
    const tasksChart = ref(null)
    const teamChart = ref(null)
    const budgetChart = ref(null)
    
    let charts = {}

    const loadStatistics = async () => {
      try {
        loading.value = true
        const params = {
          period: selectedPeriod.value,
          start_date: customStartDate.value,
          end_date: customEndDate.value,
          type: selectedReportType.value
        }
        
        const response = await projectManagementService.getProjectStatistics(props.projectId, params)
        statistics.value = response.data.statistics
        teamPerformance.value = response.data.team_performance
        overdueTasks.value = response.data.overdue_tasks
        chartData.value = response.data.charts
        
        await nextTick()
        initializeCharts()
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        loading.value = false
      }
    }

    const initializeCharts = () => {
      // Détruire les graphiques existants
      Object.values(charts).forEach(chart => {
        if (chart) chart.destroy()
      })
      
      // Graphique de progression
      if (progressChart.value) {
        charts.progress = new Chart(progressChart.value, {
          type: 'line',
          data: {
            labels: chartData.value.progress.labels,
            datasets: [{
              label: 'Progression (%)',
              data: chartData.value.progress.data,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        })
      }
      
      // Graphique des tâches
      if (tasksChart.value) {
        charts.tasks = new Chart(tasksChart.value, {
          type: 'doughnut',
          data: {
            labels: ['Terminées', 'En cours', 'À faire', 'En retard'],
            datasets: [{
              data: chartData.value.tasks.data,
              backgroundColor: [
                'rgb(34, 197, 94)',
                'rgb(59, 130, 246)',
                'rgb(156, 163, 175)',
                'rgb(239, 68, 68)'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        })
      }
      
      // Graphique de l'équipe
      if (teamChart.value) {
        charts.team = new Chart(teamChart.value, {
          type: 'bar',
          data: {
            labels: chartData.value.team.labels,
            datasets: [{
              label: 'Tâches terminées',
              data: chartData.value.team.completed,
              backgroundColor: 'rgba(34, 197, 94, 0.8)'
            }, {
              label: 'Tâches en cours',
              data: chartData.value.team.in_progress,
              backgroundColor: 'rgba(59, 130, 246, 0.8)'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true
              },
              y: {
                stacked: true,
                beginAtZero: true
              }
            }
          }
        })
      }
      
      // Graphique budget vs temps
      if (budgetChart.value) {
        charts.budget = new Chart(budgetChart.value, {
          type: 'line',
          data: {
            labels: chartData.value.budget.labels,
            datasets: [{
              label: 'Budget utilisé (%)',
              data: chartData.value.budget.budget_data,
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              yAxisID: 'y'
            }, {
              label: 'Progression (%)',
              data: chartData.value.budget.progress_data,
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              yAxisID: 'y1'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                beginAtZero: true,
                max: 100
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                max: 100,
                grid: {
                  drawOnChartArea: false
                }
              }
            }
          }
        })
      }
    }

    const generateReport = () => {
      showGenerateReportModal.value = true
    }

    const exportData = async () => {
      try {
        const response = await projectManagementService.exportProjectData(props.projectId, {
          period: selectedPeriod.value,
          start_date: customStartDate.value,
          end_date: customEndDate.value,
          type: selectedReportType.value
        })
        
        // Télécharger le fichier via data: URL pour éviter blob:
        const url = await (async () => {
          try {
            const { bytesToDataURL } = await import('@/utils/blob')
            return await bytesToDataURL('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', response.data)
          } catch (_) {
            try {
              const { blobToDataURL } = await import('@/utils/blob')
              const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
              return await blobToDataURL(blob)
            } catch (_) {
              return ''
            }
          }
        })()
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `projet-${props.projectId}-rapport-${Date.now()}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        // Pas de revoke nécessaire pour data:
      } catch (error) {
        console.error('Erreur lors de l\'export:', error)
      }
    }

    const onReportGenerated = () => {
      showGenerateReportModal.value = false
    }

    const getProgressChangeClass = (change) => {
      if (change > 0) return 'text-green-600'
      if (change < 0) return 'text-red-600'
      return 'text-gray-500'
    }

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CHF'
      }).format(amount)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getDaysOverdue = (dueDate) => {
      const today = new Date()
      const due = new Date(dueDate)
      const diffTime = today - due
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const getInitials = (name) => {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    onMounted(() => {
      loadStatistics()
    })

    return {
      loading,
      selectedPeriod,
      customStartDate,
      customEndDate,
      selectedReportType,
      showGenerateReportModal,
      statistics,
      teamPerformance,
      overdueTasks,
      progressChart,
      tasksChart,
      teamChart,
      budgetChart,
      loadStatistics,
      generateReport,
      exportData,
      onReportGenerated,
      getProgressChangeClass,
      formatCurrency,
      formatDate,
      getDaysOverdue,
      getInitials
    }
  },
  beforeUnmount() {
    // Nettoyer les graphiques
    Object.values(this.charts || {}).forEach(chart => {
      if (chart) chart.destroy()
    })
  }
}
</script>

<style scoped>
/* Styles pour les graphiques */
canvas {
  max-height: 100%;
}

/* Animation pour les statistiques */
.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}
</style>