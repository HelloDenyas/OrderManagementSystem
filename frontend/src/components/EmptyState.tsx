type EmptyStateProps = {
  title: string
  description?: string
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="content-state content-state-empty">
      <span className="empty-state-icon" aria-hidden="true">
        —
      </span>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  )
}

export default EmptyState
