'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const LazyPieChart = ({ data, colors }) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={150}
        fill="#8884d8"
        label={({ name, percentage }) => `${name}: ${percentage}%`}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value, name, props) => [`${props.payload.percentage}% (${value})`, name]}
      />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
);

export const LazyBarChart = ({ data, layout = 'horizontal' }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      layout={layout === 'vertical' ? 'vertical' : 'horizontal'}
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      {layout === 'vertical' ? (
        <>
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tickFormatter={value => (value.length > 15 ? value.substr(0, 13) + '...' : value)}
          />
        </>
      ) : (
        <>
          <XAxis
            dataKey="year"
            type="number"
            domain={[
              data.length > 0 ? Math.min(...data.map(d => d.year)) : 0,
              data.length > 0 ? Math.max(...data.map(d => d.year)) : 0,
            ]}
          />
          <YAxis />
        </>
      )}
      <Tooltip
        wrapperStyle={{
          backgroundColor: 'var(--c-bg)',
          border: `1px solid var(--c-base)`,
          color: 'var(--c-base)',
        }}
        contentStyle={{
          backgroundColor: 'var(--c-bg)',
          color: 'var(--c-base)',
        }}
        labelStyle={{
          color: 'var(--c-base)',
        }}
        itemStyle={{
          color: 'var(--c-base)',
        }}
      />
      <Legend />
      <Bar dataKey={layout === 'vertical' ? 'value' : 'count'} fill="#FF6C00" />
    </BarChart>
  </ResponsiveContainer>
);

export const LazyYearBarChart = ({ data, ticks, minYear, maxYear }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" type="number" domain={[minYear, maxYear]} ticks={ticks} />
      <YAxis />
      <Tooltip
        wrapperStyle={{
          backgroundColor: 'var(--c-bg)',
          border: `1px solid var(--c-base)`,
          color: 'var(--c-base)',
        }}
        contentStyle={{
          backgroundColor: 'var(--c-bg)',
          color: 'var(--c-base)',
        }}
        labelStyle={{
          color: 'var(--c-base)',
        }}
        itemStyle={{
          color: 'var(--c-base)',
        }}
      />
      <Legend />
      <Bar dataKey="count" fill="#FF6C00" />
    </BarChart>
  </ResponsiveContainer>
);
