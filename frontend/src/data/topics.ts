// Topic taxonomy mirrors PLAN.md's weekly structure. Content fields (desc,
// concepts, code) are intentionally empty — filled in per-topic once that
// week's learning is done, via a request to generate + ingest content.
// See TopicDetail.tsx for how an empty topic renders.

export interface Topic {
  id: string
  mono: string
  title: string
  desc: string
  concepts: string[]
  codeLabel: string
  code: string
}

export const topics: Topic[] = [
  { id: 'linux-net', mono: 'SH', title: 'Linux & Networking', desc: '', concepts: [], codeLabel: 'try it', code: '' },
  { id: 'git', mono: 'GT', title: 'Git & Version Control', desc: '', concepts: [], codeLabel: 'try it', code: '' },
  { id: 'docker', mono: 'DK', title: 'Docker & Containers', desc: '', concepts: [], codeLabel: 'try it', code: '' },
  { id: 'lb-edge', mono: 'LB', title: 'Load Balancing & Front Door', desc: '', concepts: [], codeLabel: 'try it', code: '' },
  { id: 'security', mono: 'SC', title: 'Secrets & Security', desc: '', concepts: [], codeLabel: 'try it', code: '' },
  { id: 'cluster', mono: 'CL', title: 'Clustering & HA', desc: '', concepts: [], codeLabel: 'try it', code: '' },
  { id: 'iac', mono: 'TF', title: 'Infrastructure as Code', desc: '', concepts: [], codeLabel: 'try it', code: '' },
  { id: 'cicd-monitor', mono: 'CI', title: 'CI/CD & Monitoring', desc: '', concepts: [], codeLabel: 'try it', code: '' },
]
