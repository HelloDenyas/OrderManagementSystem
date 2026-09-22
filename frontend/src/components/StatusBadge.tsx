import type { OrderStatus } from '../types/Order'

type StatusBadgeProps = {
  status: OrderStatus
}

const statusClassNames: Record<OrderStatus, string> = {
  Naujas: 'status-badge-new',
  Vykdomas: 'status-badge-progress',
  Įvykdytas: 'status-badge-complete',
  Atšauktas: 'status-badge-cancelled',
}

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${statusClassNames[status]}`}>
      {status}
    </span>
  )
}

export default StatusBadge
