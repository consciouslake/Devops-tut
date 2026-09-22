import { DCOLORS, DiagramFrame, Node, GroupBox, Arrow, ArrowMarkerDefs } from './DiagramShared'

export function NetworkingIdentityDiagram() {
  return (
    <DiagramFrame
      title="Azure Networking & Identity"
      description="The 3 VMs hosting the cluster, how they reach the internet, and how the backend authenticates to Key Vault with no stored credential anywhere."
      legend={[{ color: DCOLORS.azure, label: 'Azure resource' }, { color: DCOLORS.paid, label: 'Real ongoing cost' }]}
      minWidth={900}
    >
      <svg viewBox="0 0 900 420" width="100%" height="420">
        <ArrowMarkerDefs />

        <GroupBox x={30} y={30} w={480} h={280} label="centralindia — azureops-vnet" />
        <GroupBox x={60} y={60} w={420} h={140} label="app-subnet" />
        <Node x={80} y={90} w={190} h={60} label="app-vm1" sub="control-plane + etcd · MI granted" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={290} y={90} w={170} h={60} label="app-vm2" sub="control-plane + etcd · no MI role" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={80} y={230} w={190} h={50} label="NAT Gateway" sub="real ongoing cost" color={DCOLORS.paid} bg={DCOLORS.paidBg} />
        <Node x={290} y={230} w={170} h={50} label="Private Endpoint" sub="→ Storage Account" color={DCOLORS.azure} bg={DCOLORS.azureBg} />

        <GroupBox x={560} y={30} w={300} h={120} label="southindia — vm01vnet (peered)" />
        <Node x={590} y={65} w={240} h={60} label="azureops-vm01" sub="control-plane + etcd · public IP" color={DCOLORS.azure} bg={DCOLORS.azureBg} />

        <Node x={590} y={230} w={240} h={50} label="Key Vault" sub="RBAC-authorized · real cost" color={DCOLORS.paid} bg={DCOLORS.paidBg} />
        <Node x={590} y={300} w={240} h={50} label="Azure Policy" sub="require tag · $0" color={DCOLORS.azure} bg={DCOLORS.azureBg} />
        <Node x={60} y={300} w={400} h={50} label="Azure DNS: devopspk.online" sub="A + CNAME, real nameservers" color={DCOLORS.azure} bg={DCOLORS.azureBg} />

        <Arrow x1={175} y1={150} x2={175} y2={230} />
        <Arrow x1={470} y1={130} x2={590} y2={95} label="VNet peering" />
        <Arrow x1={175} y1={120} x2={590} y2={255} label="IMDS token" />
      </svg>
    </DiagramFrame>
  )
}
