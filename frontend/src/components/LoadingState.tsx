type LoadingStateProps = {
  message?: string
}

function LoadingState({ message = 'Kraunama...' }: LoadingStateProps) {
  return (
    <div className="content-state content-state-loading" role="status">
      <span className="loading-indicator" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export default LoadingState
