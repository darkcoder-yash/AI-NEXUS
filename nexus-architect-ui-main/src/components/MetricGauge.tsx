interface MetricGaugeProps {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: 'blue' | 'purple' | 'cyan' | 'green' | 'orange' | 'red';
}

const colorMap = {
  blue: 'text-neon-blue',
  purple: 'text-neon-purple',
  cyan: 'text-neon-cyan',
  green: 'text-neon-green',
  orange: 'text-neon-orange',
  red: 'text-neon-red',
};

const bgMap = {
  blue: 'bg-neon-blue',
  purple: 'bg-neon-purple',
  cyan: 'bg-neon-cyan',
  green: 'bg-neon-green',
  orange: 'bg-neon-orange',
  red: 'bg-neon-red',
};

export function MetricGauge({ label, value, max = 100, unit = '%', color = 'blue' }: MetricGaugeProps) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-mono font-semibold ${colorMap[color]}`}>
          {typeof value === 'number' ? Math.round(value) : value}{unit}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bgMap[color]} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%`, boxShadow: `0 0 8px hsl(var(--neon-${color}) / 0.5)` }}
        />
      </div>
    </div>
  );
}
