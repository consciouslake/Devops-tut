import { DCOLORS, DiagramFrame, Node, GroupBox, Arrow, ArrowMarkerDefs } from './DiagramShared'

export function SystemOverviewDiagram() {
  return (
    <DiagramFrame
      title="System Overview"
      description="Every real piece built across Modules 1-13, in one picture. Azure and the k3s cluster are each one box here — later chapters zoom into both."
      legend={[
        { color: DCOLORS.azure, label: 'Azure-managed' },
        { color: DCOLORS.workload, label: 'Self-hosted, $0 marginal' },
        { color: DCOLORS.ext, label: 'External / usage-billed' },
      ]}
      minWidth={860}
    >
      <svg viewBox="0 0 860 360" width="100%" height="360">
        <ArrowMarkerDefs />

        <Node x={20} y={160} w={130} h={50} label="Visitor" sub="devopspk.online" color={DCOLORS.textDim} bg="rgba(255,255,255,0.03)" />

        <GroupBox x={190} y={30} w={480} h={300} label="Azure Subscription — azureops-copilot-rg" />

        <Node x={220} y={70} w={190} h={54} label="Traefik + WAF" sub="TLS · routing · ModSecurity" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={220} y={150} w={190} h={54} label="k3s Cluster" sub="3-node HA, 2 regions" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />
        <Node x={220} y={230} w={190} h={54} label="App + Monitoring" sub="frontend/backend/Qdrant · PLG stack" color={DCOLORS.workload} bg={DCOLORS.workloadBg} />

        <Node x={450} y={70} w={190} h={54} label="Key Vault" sub="secrets, Managed Identity" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={450} y={150} w={190} h={54} label="NAT Gateway" sub="outbound egress" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={450} y={230} w={190} h={54} label="DNS + Policy" sub="devopspk.online · tag governance" color={DCOLORS.azure} bg={DCOLORS.azureBg} />

        <Node x={710} y={70} w={130} h={54} label="GitHub" sub="CI/CD → ghcr.io" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={710} y={230} w={130} h={54} label="Gemini API" sub="LLM + embeddings" color={DCOLORS.ext} bg={DCOLORS.extBg} />

        <Arrow x1={150} y1={185} x2={220} y2={97} label="HTTPS" />
        <Arrow x1={410} y1={97} x2={450} y2={97} label="Managed Identity" />
        <Arrow x1={410} y1={177} x2={450} y2={177} label="egress" />
        <Arrow x1={315} y1={124} x2={315} y2={150} />
        <Arrow x1={315} y1={204} x2={315} y2={230} />
        <Arrow x1={640} y1={97} x2={710} y2={97} label="OIDC deploy" />
        <Arrow x1={410} y1={257} x2={710} y2={257} label="rate-limited calls" />
      </svg>
    </DiagramFrame>
  )
}
