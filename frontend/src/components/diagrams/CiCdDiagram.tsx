import { DCOLORS, DiagramFrame, Node, GroupBox, Arrow, ArrowMarkerDefs } from './DiagramShared'

export function CiCdDiagram() {
  return (
    <DiagramFrame
      title="CI/CD Pipeline"
      description="What happens between a merged pull request and it being live at devopspk.online — including the auto-redeploy step added after a real stale-prod incident."
      legend={[{ color: DCOLORS.azure, label: 'Gate / job' }, { color: DCOLORS.workload, label: 'Self-hosted target' }]}
      minWidth={900}
    >
      <svg viewBox="0 0 900 260" width="100%" height="260">
        <ArrowMarkerDefs />

        <Node x={20} y={100} w={120} h={54} label="PR merged" sub="to main" color={DCOLORS.textDim} bg="rgba(255,255,255,0.03)" />

        <GroupBox x={175} y={20} w={280} h={210} label="GitHub Actions" />
        <Node x={200} y={55} w={230} h={40} label="gitleaks" sub="secret scan" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={200} y={105} w={230} h={40} label="pytest + Trivy" sub="tests + vuln scan" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={200} y={155} w={230} h={40} label="deploy (gated)" sub="OIDC, manual approval" color={DCOLORS.azure} bg={DCOLORS.azureBg} />

        <Node x={500} y={60} w={160} h={50} label="ghcr.io" sub="public images" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={500} y={150} w={160} h={50} label="k3s cluster" sub="rollout restart" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={700} y={105} w={170} h={50} label="devopspk.online" sub="real health check" color={DCOLORS.textDim} bg="rgba(255,255,255,0.03)" />

        <Arrow x1={140} y1={127} x2={200} y2={75} />
        <Arrow x1={430} y1={75} x2={500} y2={85} />
        <Arrow x1={430} y1={175} x2={500} y2={175} label="az vm run-command" />
        <Arrow x1={580} y1={110} x2={580} y2={150} label="image pull" />
        <Arrow x1={660} y1={175} x2={700} y2={130} label="curl -sf" />
      </svg>
    </DiagramFrame>
  )
}
