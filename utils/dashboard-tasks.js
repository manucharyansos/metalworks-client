export function metricTaskFilters(metric) {
  return (
    {
      created: {},
      overdue: { time_range: 'overdue', sort: 'deadline_asc' },
      confirmation: { confirmation: 'waiting' },
      completed: { order_status: 'completed' },
      canceled: { order_status: 'canceled' },
    }[metric] || {}
  )
}

export function operatorTaskFilters(operator) {
  return { operator_id: String(operator.id), work_state: 'open' }
}
