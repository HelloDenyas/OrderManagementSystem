type SectionPlaceholderProps = {
  title: string
  description: string
}

function SectionPlaceholder({ title, description }: SectionPlaceholderProps) {
  return (
    <section className="page">
      <header className="page-header">
        <p className="page-eyebrow">Valdymas</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <div className="placeholder-card">
        <span className="placeholder-icon" aria-hidden="true">
          {title.charAt(0)}
        </span>
        <div>
          <h2>Skiltis ruošiama</h2>
          <p>Šios skilties funkcionalumas bus pridėtas kitame etape.</p>
        </div>
      </div>
    </section>
  )
}

export default SectionPlaceholder
