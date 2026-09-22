import { ReactNode } from 'react'

// Shared visual language for every architecture diagram in Module 14.
// Plain SVG, no charting/3D library — see Module 14 Chapter 1 for why.
export const DCOLORS = {
  azure: '#5fb7f0',
  azureBg: 'rgba(95,183,240,0.10)',
  workload: '#34d399',
  workloadBg: 'rgba(52,211,153,0.10)',
  db: '#22d3ee',
  dbBg: 'rgba(34,211,238,0.10)',
  paid: '#f0b25f',
  paidBg: 'rgba(240,178,95,0.10)',
  ext: '#f0788a',
  extBg: 'rgba(240,120,138,0.10)',
  line: '#3a4252',
  text: '#e8ecf1',
  textDim: '#8b96a8',
}

export function DiagramFrame({
  title,
  description,
  legend,
  minWidth,
  children,
}: {
  title: string
  description: string
  legend?: { color: string; label: string }[]
  minWidth: number
  children: ReactNode
}) {
  return (
    <div className="diagram-frame">
      <div className="diagram-frame-title mono">{title}</div>
      <p className="diagram-frame-desc">{description}</p>
      {legend && (
        <div className="diagram-legend">
          {legend.map((l) => (
            <span className="diagram-legend-item" key={l.label}>
              <span className="diagram-legend-swatch" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
      <div className="diagram-scroll">
        <div style={{ minWidth }}>{children}</div>
      </div>
    </div>
  )
}

export function Node({
  x,
  y,
  w,
  h,
  label,
  sub,
  color,
  bg,
  rx = 8,
  dashed = false,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  color: string
  bg: string
  rx?: number
  dashed?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={bg}
        stroke={color}
        strokeWidth={1.4}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + (sub ? -4 : 4)}
        textAnchor="middle"
        fill={DCOLORS.text}
        fontSize={12.5}
        fontFamily="'IBM Plex Mono', monospace"
        fontWeight={600}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 13}
          textAnchor="middle"
          fill={DCOLORS.textDim}
          fontSize={10.5}
          fontFamily="'IBM Plex Mono', monospace"
        >
          {sub}
        </text>
      )}
    </g>
  )
}

export function DbNode({
  x,
  y,
  w,
  h,
  label,
  sub,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub: string
}) {
  const ellipseRy = 9
  return (
    <g>
      <path
        d={`M ${x} ${y + ellipseRy}
            A ${w / 2} ${ellipseRy} 0 0 1 ${x + w} ${y + ellipseRy}
            L ${x + w} ${y + h - ellipseRy}
            A ${w / 2} ${ellipseRy} 0 0 1 ${x} ${y + h - ellipseRy}
            Z`}
        fill={DCOLORS.dbBg}
        stroke={DCOLORS.db}
        strokeWidth={1.4}
      />
      <ellipse cx={x + w / 2} cy={y + ellipseRy} rx={w / 2} ry={ellipseRy} fill={DCOLORS.dbBg} stroke={DCOLORS.db} strokeWidth={1.4} />
      <text x={x + w / 2} y={y + h / 2 + 6} textAnchor="middle" fill={DCOLORS.text} fontSize={12.5} fontFamily="'IBM Plex Mono', monospace" fontWeight={600}>
        {label}
      </text>
      <text x={x + w / 2} y={y + h - 6} textAnchor="middle" fill={DCOLORS.textDim} fontSize={9.5} fontFamily="'IBM Plex Mono', monospace">
        {sub}
      </text>
    </g>
  )
}

export function GroupBox({
  x,
  y,
  w,
  h,
  label,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={10} fill="rgba(255,255,255,0.015)" stroke={DCOLORS.line} strokeWidth={1} strokeDasharray="3 3" />
      <text x={x + 12} y={y + 18} fill={DCOLORS.textDim} fontSize={10} fontFamily="'IBM Plex Mono', monospace" letterSpacing={0.5}>
        {label.toUpperCase()}
      </text>
    </g>
  )
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  label,
  dashed = false,
  color = DCOLORS.line,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  label?: string
  dashed?: boolean
  color?: string
}) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={1.3}
        strokeDasharray={dashed ? '4 3' : undefined}
        markerEnd="url(#arrowhead)"
      />
      {label && (
        <text x={mx} y={my - 5} textAnchor="middle" fill={DCOLORS.textDim} fontSize={9.5} fontFamily="'IBM Plex Mono', monospace">
          {label}
        </text>
      )}
    </g>
  )
}

export function ArrowMarkerDefs() {
  return (
    <defs>
      <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill={DCOLORS.textDim} />
      </marker>
      <marker id="arrowhead-accent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill={DCOLORS.db} />
      </marker>
    </defs>
  )
}
