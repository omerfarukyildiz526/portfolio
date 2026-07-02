'use client';

import { useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useLang } from '@/lib/i18n';

// ── Temaya uyumlu tekil düğüm ──
type HandleDef = { id: string; position: Position };
interface NodeData {
  icon: string;
  title: string;
  sub: string;
  accent: string;
  targets?: HandleDef[];
  sources?: HandleDef[];
}

const handleStyle = (accent: string): React.CSSProperties => ({
  width: 7,
  height: 7,
  background: accent,
  border: 'none',
  opacity: 0.85,
});

function FlowNode({ data }: NodeProps<NodeData>) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        width: 168,
        borderRadius: 12,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 18px rgba(0,0,0,0.18)',
      }}
    >
      {(data.targets ?? []).map((h) => (
        <Handle key={h.id} id={h.id} type="target" position={h.position} style={handleStyle(data.accent)} />
      ))}

      <span
        style={{
          fontSize: 18,
          lineHeight: 1,
          width: 30,
          height: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          background: `color-mix(in srgb, ${data.accent} 14%, transparent)`,
          flexShrink: 0,
        }}
      >
        {data.icon}
      </span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--fg)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}
        >
          {data.title}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-jetbrains, monospace)',
            fontSize: 10,
            color: 'var(--fg-3)',
            whiteSpace: 'nowrap',
          }}
        >
          {data.sub}
        </div>
      </div>

      {(data.sources ?? []).map((h) => (
        <Handle key={h.id} id={h.id} type="source" position={h.position} style={handleStyle(data.accent)} />
      ))}
    </div>
  );
}

const nodeTypes = { flow: FlowNode };

export default function ArchitectureDiagram() {
  const { lang } = useLang();
  const tr = lang === 'tr';

  const nodes = useMemo<Node<NodeData>[]>(
    () => [
      {
        id: 'op',
        type: 'flow',
        position: { x: 0, y: 150 },
        data: {
          icon: '🏢',
          title: tr ? 'Operasyon' : 'Operations',
          sub: 'users · UI',
          accent: '#8E8E93',
          sources: [{ id: 'out', position: Position.Right }],
        },
      },
      {
        id: 'api',
        type: 'flow',
        position: { x: 250, y: 150 },
        data: {
          icon: '⚡',
          title: 'REST API',
          sub: '.NET · Python',
          accent: '#0A84FF',
          targets: [
            { id: 'in', position: Position.Left },
            { id: 'inb', position: Position.Bottom },
          ],
          sources: [{ id: 'out', position: Position.Right }],
        },
      },
      {
        id: 'sap',
        type: 'flow',
        position: { x: 520, y: 30 },
        data: {
          icon: '🔗',
          title: 'SAP',
          sub: 'RFC · BAPI',
          accent: '#30D158',
          targets: [{ id: 'in', position: Position.Left }],
        },
      },
      {
        id: 'db',
        type: 'flow',
        position: { x: 520, y: 270 },
        data: {
          icon: '🗄️',
          title: tr ? 'Veritabanı' : 'Database',
          sub: 'MSSQL · PgSQL',
          accent: '#FF9F0A',
          targets: [{ id: 'in', position: Position.Left }],
        },
      },
      {
        id: 'rpa',
        type: 'flow',
        position: { x: 250, y: 330 },
        data: {
          icon: '🤖',
          title: 'RPA',
          sub: 'Playwright',
          accent: '#BF5AF2',
          sources: [
            { id: 'outt', position: Position.Top },
            { id: 'outr', position: Position.Right },
          ],
        },
      },
    ],
    [tr],
  );

  const edges = useMemo<Edge[]>(
    () => [
      { id: 'e-op-api', source: 'op', sourceHandle: 'out', target: 'api', targetHandle: 'in', label: 'HTTP', animated: true },
      { id: 'e-api-sap', source: 'api', sourceHandle: 'out', target: 'sap', targetHandle: 'in', label: 'RFC', animated: true },
      { id: 'e-api-db', source: 'api', sourceHandle: 'out', target: 'db', targetHandle: 'in', label: 'SQL' },
      { id: 'e-rpa-api', source: 'rpa', sourceHandle: 'outt', target: 'api', targetHandle: 'inb', label: tr ? 'tetik' : 'trigger' },
      { id: 'e-rpa-db', source: 'rpa', sourceHandle: 'outr', target: 'db', targetHandle: 'in', label: 'ETL' },
    ],
    [tr],
  ).map((e) => ({
    ...e,
    style: { stroke: 'var(--border-hover)', strokeWidth: 1.5 },
    labelStyle: { fill: 'var(--fg-3)', fontFamily: 'var(--font-jetbrains, monospace)', fontSize: 10 },
    labelBgStyle: { fill: 'var(--bg)' },
    labelBgPadding: [4, 2] as [number, number],
  }));

  return (
    <div
      style={{ height: 440, width: '100%', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
      className="rounded-xl overflow-hidden"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesConnectable={false}
        nodesDraggable
        edgesFocusable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
      </ReactFlow>
    </div>
  );
}
